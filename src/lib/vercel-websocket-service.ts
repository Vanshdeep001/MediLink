// Vercel-compatible WebSocket service using Server-Sent Events (SSE)
export interface WebSocketMessage {
  type: 'chat_message' | 'call_notification' | 'appointment_reminder' | 'emergency_alert' | 'user_online' | 'user_offline' | 'typing_start' | 'typing_stop' | 'message_read' | 'call_status_update';
  from: string;
  to?: string;
  roomId?: string;
  data: any;
  timestamp: number;
  id: string;
}

export interface ConnectionState {
  isConnected: boolean;
  isConnecting: boolean;
  reconnectAttempts: number;
  lastError?: string;
}

class VercelWebSocketService {
  private eventSource: EventSource | null = null;
  private connectionState: ConnectionState = {
    isConnected: false,
    isConnecting: false,
    reconnectAttempts: 0
  };
  private messageHandlers: Map<string, (message: WebSocketMessage) => void> = new Map();
  private stateChangeCallbacks: ((state: ConnectionState) => void)[] = [];
  private messageQueue: WebSocketMessage[] = [];
  private userId: string | null = null;

  constructor() {
    // Set up automatic reconnection
    this.setupReconnection();
  }

  async connect(userId: string): Promise<void> {
    if (this.eventSource && this.eventSource.readyState === EventSource.OPEN) {
      return;
    }

    this.userId = userId;
    return new Promise((resolve, reject) => {
      try {
        this.updateConnectionState({ isConnecting: true });
        
        // Use Server-Sent Events instead of WebSocket
        this.eventSource = new EventSource(`/api/sse?userId=${userId}`);
        
        this.eventSource.onopen = () => {
          console.log('SSE connected');
          this.updateConnectionState({ 
            isConnected: true, 
            isConnecting: false, 
            reconnectAttempts: 0,
            lastError: undefined 
          });
          this.processMessageQueue();
          resolve();
        };

        this.eventSource.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('Error parsing SSE message:', error);
          }
        };

        this.eventSource.onerror = (error) => {
          console.error('SSE error:', error);
          this.updateConnectionState({ 
            lastError: 'SSE connection error' 
          });
          reject(error);
        };

      } catch (error) {
        this.updateConnectionState({ 
          isConnecting: false, 
          lastError: 'Failed to create SSE connection' 
        });
        reject(error);
      }
    });
  }

  disconnect(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    
    this.updateConnectionState({ 
      isConnected: false, 
      isConnecting: false 
    });
  }

  private setupReconnection(): void {
    // Auto-reconnect every 30 seconds if disconnected
    setInterval(() => {
      if (!this.isConnected() && this.userId) {
        this.connect(this.userId).catch(console.error);
      }
    }, 30000);
  }

  private processMessageQueue(): void {
    while (this.messageQueue.length > 0 && this.isConnected()) {
      const message = this.messageQueue.shift();
      if (message) {
        this.send(message);
      }
    }
  }

  send(message: WebSocketMessage): void {
    if (this.isConnected()) {
      // Send via API route
      fetch('/api/sse/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message)
      }).catch(console.error);
    } else {
      // Queue message for later sending
      this.messageQueue.push(message);
    }
  }

  private handleMessage(message: WebSocketMessage): void {
    // Call registered handlers
    const handler = this.messageHandlers.get(message.type);
    if (handler) {
      handler(message);
    }

    // Call general message handler
    const generalHandler = this.messageHandlers.get('*');
    if (generalHandler) {
      generalHandler(message);
    }
  }

  // Message type handlers
  onMessage(type: string, handler: (message: WebSocketMessage) => void): void {
    this.messageHandlers.set(type, handler);
  }

  offMessage(type: string): void {
    this.messageHandlers.delete(type);
  }

  onStateChange(callback: (state: ConnectionState) => void): void {
    this.stateChangeCallbacks.push(callback);
  }

  offStateChange(callback: (state: ConnectionState) => void): void {
    const index = this.stateChangeCallbacks.indexOf(callback);
    if (index > -1) {
      this.stateChangeCallbacks.splice(index, 1);
    }
  }

  private updateConnectionState(updates: Partial<ConnectionState>): void {
    this.connectionState = { ...this.connectionState, ...updates };
    this.stateChangeCallbacks.forEach(callback => callback(this.connectionState));
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Specific message sending methods
  sendChatMessage(chatId: string, message: any, to: string): void {
    this.send({
      type: 'chat_message',
      from: message.senderId,
      to,
      roomId: chatId,
      data: message,
      timestamp: Date.now(),
      id: this.generateMessageId()
    });
  }

  sendCallNotification(callSession: any, to: string): void {
    this.send({
      type: 'call_notification',
      from: callSession.initiatedBy === 'doctor' ? callSession.doctorName : callSession.patientName,
      to,
      roomId: callSession.roomName,
      data: callSession,
      timestamp: Date.now(),
      id: this.generateMessageId()
    });
  }

  sendAppointmentReminder(appointmentId: string, patientId: string, doctorId: string, reminderData: any): void {
    this.send({
      type: 'appointment_reminder',
      from: doctorId,
      to: patientId,
      data: { appointmentId, ...reminderData },
      timestamp: Date.now(),
      id: this.generateMessageId()
    });
  }

  sendEmergencyAlert(patientId: string, doctorId: string, emergencyData: any): void {
    this.send({
      type: 'emergency_alert',
      from: patientId,
      to: doctorId,
      data: emergencyData,
      timestamp: Date.now(),
      id: this.generateMessageId()
    });
  }

  sendUserStatus(userId: string, isOnline: boolean): void {
    this.send({
      type: isOnline ? 'user_online' : 'user_offline',
      from: userId,
      data: { userId, isOnline, timestamp: Date.now() },
      timestamp: Date.now(),
      id: this.generateMessageId()
    });
  }

  sendTypingStatus(chatId: string, userId: string, isTyping: boolean): void {
    this.send({
      type: isTyping ? 'typing_start' : 'typing_stop',
      from: userId,
      roomId: chatId,
      data: { userId, isTyping },
      timestamp: Date.now(),
      id: this.generateMessageId()
    });
  }

  sendMessageRead(chatId: string, messageId: string, userId: string): void {
    this.send({
      type: 'message_read',
      from: userId,
      roomId: chatId,
      data: { messageId, userId },
      timestamp: Date.now(),
      id: this.generateMessageId()
    });
  }

  sendCallStatusUpdate(callId: string, status: string, to: string): void {
    this.send({
      type: 'call_status_update',
      from: 'system',
      to,
      data: { callId, status },
      timestamp: Date.now(),
      id: this.generateMessageId()
    });
  }

  // Utility methods
  getConnectionState(): ConnectionState {
    return { ...this.connectionState };
  }

  isConnected(): boolean {
    return this.connectionState.isConnected;
  }

  // Cleanup
  destroy(): void {
    this.disconnect();
    this.messageHandlers.clear();
    this.stateChangeCallbacks = [];
    this.messageQueue = [];
  }
}

// Export singleton instance
export const vercelWebsocketService = new VercelWebSocketService();
export default vercelWebsocketService;



