// WebSocket Service for real-time chat and notifications
import { ChatMessage, ChatSession } from './chat-service';
import { CallSession } from './call-management-service';

export interface WebSocketMessage {
  type: 'chat_message' | 'call_notification' | 'appointment_reminder' | 'emergency_alert' | 'user_online' | 'user_offline' | 'typing_start' | 'typing_stop' | 'message_read' | 'call_status_update' | 'heartbeat';
  from: string;
  to?: string;
  roomId?: string;
  data: any;
  timestamp: number;
  id: string;
}

export interface WebSocketConfig {
  url: string;
  reconnectInterval: number;
  maxReconnectAttempts: number;
  heartbeatInterval: number;
}

export interface ConnectionState {
  isConnected: boolean;
  isConnecting: boolean;
  reconnectAttempts: number;
  lastError?: string;
}

class WebSocketService {
  private socket: WebSocket | null = null;
  private config: WebSocketConfig;
  private connectionState: ConnectionState = {
    isConnected: false,
    isConnecting: false,
    reconnectAttempts: 0
  };
  private messageHandlers: Map<string, (message: WebSocketMessage) => void> = new Map();
  private stateChangeCallbacks: ((state: ConnectionState) => void)[] = [];
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private messageQueue: WebSocketMessage[] = [];

  constructor(config?: Partial<WebSocketConfig>) {
    this.config = {
      url: process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:8080/ws',
      reconnectInterval: 5000,
      maxReconnectAttempts: 5,
      heartbeatInterval: 30000,
      ...config
    };
  }

  async connect(): Promise<void> {
    if (this.socket?.readyState === WebSocket.OPEN || this.socket?.readyState === WebSocket.CONNECTING) {
      return;
    }

    return new Promise((resolve, reject) => {
      try {
        this.updateConnectionState({ isConnecting: true });
        
        this.socket = new WebSocket(this.config.url);
        
        this.socket.onopen = () => {
          console.log('WebSocket connected');
          this.updateConnectionState({ 
            isConnected: true, 
            isConnecting: false, 
            reconnectAttempts: 0,
            lastError: undefined 
          });
          this.startHeartbeat();
          this.processMessageQueue();
          resolve();
        };

        this.socket.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        this.socket.onclose = (event) => {
          console.log('WebSocket disconnected:', event.code, event.reason);
          this.updateConnectionState({ 
            isConnected: false, 
            isConnecting: false 
          });
          this.stopHeartbeat();
          
          if (event.code !== 1000) { // Not a normal closure
            this.scheduleReconnect();
          }
        };

        this.socket.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.updateConnectionState({ 
            lastError: 'WebSocket connection error' 
          });
          reject(error);
        };

      } catch (error) {
        this.updateConnectionState({ 
          isConnecting: false, 
          lastError: 'Failed to create WebSocket connection' 
        });
        reject(error);
      }
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.close(1000, 'Client disconnect');
      this.socket = null;
    }
    
    this.stopHeartbeat();
    this.clearReconnectTimeout();
    this.updateConnectionState({ 
      isConnected: false, 
      isConnecting: false 
    });
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.socket?.readyState === WebSocket.OPEN) {
        this.send({
          type: 'heartbeat',
          from: 'client',
          data: { timestamp: Date.now() },
          timestamp: Date.now(),
          id: this.generateMessageId()
        });
      }
    }, this.config.heartbeatInterval);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private scheduleReconnect(): void {
    if (this.connectionState.reconnectAttempts >= this.config.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      this.updateConnectionState({ 
        lastError: 'Max reconnection attempts reached' 
      });
      return;
    }

    this.clearReconnectTimeout();
    this.reconnectTimeout = setTimeout(() => {
      this.updateConnectionState({ 
        reconnectAttempts: this.connectionState.reconnectAttempts + 1 
      });
      this.connect().catch(console.error);
    }, this.config.reconnectInterval);
  }

  private clearReconnectTimeout(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }

  private processMessageQueue(): void {
    while (this.messageQueue.length > 0 && this.socket?.readyState === WebSocket.OPEN) {
      const message = this.messageQueue.shift();
      if (message) {
        this.socket.send(JSON.stringify(message));
      }
    }
  }

  send(message: WebSocketMessage): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    } else {
      // Queue message for later sending
      this.messageQueue.push(message);
    }
  }

  private handleMessage(message: WebSocketMessage): void {
    // Handle system messages
    if (message.type === 'heartbeat') {
      return; // Ignore heartbeat responses
    }

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
  sendChatMessage(chatId: string, message: ChatMessage, to: string): void {
    this.send({
      type: 'chat_message',
      from: message.sender,
      to,
      roomId: chatId,
      data: message,
      timestamp: Date.now(),
      id: this.generateMessageId()
    });
  }

  sendCallNotification(callSession: CallSession, to: string): void {
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
export const websocketService = new WebSocketService();
export default websocketService;

