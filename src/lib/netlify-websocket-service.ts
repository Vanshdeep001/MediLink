// Netlify-compatible WebSocket service using Pusher
import Pusher from 'pusher-js';

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

class NetlifyWebSocketService {
  private pusher: Pusher | null = null;
  private connectionState: ConnectionState = {
    isConnected: false,
    isConnecting: false,
    reconnectAttempts: 0
  };
  private messageHandlers: Map<string, (message: WebSocketMessage) => void> = new Map();
  private stateChangeCallbacks: ((state: ConnectionState) => void)[] = [];
  private messageQueue: WebSocketMessage[] = [];

  constructor() {
    // Initialize Pusher with your credentials
    this.pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
      authEndpoint: '/api/pusher/auth'
    });
  }

  async connect(): Promise<void> {
    if (this.pusher && this.pusher.connection.state === 'connected') {
      return;
    }

    return new Promise((resolve, reject) => {
      try {
        this.updateConnectionState({ isConnecting: true });
        
        this.pusher!.connection.bind('connected', () => {
          console.log('Pusher connected');
          this.updateConnectionState({ 
            isConnected: true, 
            isConnecting: false, 
            reconnectAttempts: 0,
            lastError: undefined 
          });
          this.processMessageQueue();
          resolve();
        });

        this.pusher!.connection.bind('disconnected', () => {
          console.log('Pusher disconnected');
          this.updateConnectionState({ 
            isConnected: false, 
            isConnecting: false 
          });
        });

        this.pusher!.connection.bind('error', (error: any) => {
          console.error('Pusher error:', error);
          this.updateConnectionState({ 
            lastError: 'Pusher connection error' 
          });
          reject(error);
        });

      } catch (error) {
        this.updateConnectionState({ 
          isConnecting: false, 
          lastError: 'Failed to create Pusher connection' 
        });
        reject(error);
      }
    });
  }

  disconnect(): void {
    if (this.pusher) {
      this.pusher.disconnect();
      this.pusher = null;
    }
    
    this.updateConnectionState({ 
      isConnected: false, 
      isConnecting: false 
    });
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
      // For client-side Pusher, we need to send via HTTP API
      // This is a simplified implementation - in production, you'd send to your backend
      console.log('Sending message via Pusher:', message);
    } else {
      // Queue message for later sending
      this.messageQueue.push(message);
    }
  }

  private getChannelName(message: WebSocketMessage): string {
    if (message.roomId) {
      return `room-${message.roomId}`;
    }
    if (message.to) {
      return `user-${message.to}`;
    }
    return 'global';
  }

  // Subscribe to channels
  subscribeToChannel(channelName: string, callback: (message: WebSocketMessage) => void): void {
    if (!this.pusher) return;

    const channel = this.pusher.subscribe(channelName);
    
    // Listen for all message types
    Object.values([
      'chat_message', 'call_notification', 'appointment_reminder', 
      'emergency_alert', 'user_online', 'user_offline', 
      'typing_start', 'typing_stop', 'message_read', 'call_status_update'
    ]).forEach(eventType => {
      channel.bind(eventType, callback);
    });
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
export const netlifyWebsocketService = new NetlifyWebSocketService();
export default netlifyWebsocketService;

