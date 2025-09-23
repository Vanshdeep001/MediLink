// Integration Service - Orchestrates all backend services
import { webrtcService, WebRTCConfig } from './webrtc-service';
import { websocketService } from './websocket-service';
import { messagingService } from './firebase/messaging';
import { paymentService } from './payment-service';
import { mlOptimizationService, SymptomData, DiseasePrediction, DrugRecommendation } from './ml-optimization-service';
import { sqliteDb, syncService, patientOperations, appointmentOperations, chatMessageOperations } from './sqlite-service';
import { CallSession, initiateCall, updateCallStatus } from './call-management-service';

export interface IntegrationConfig {
  enableWebRTC: boolean;
  enableWebSocket: boolean;
  enablePushNotifications: boolean;
  enableOfflineSync: boolean;
  enablePayments: boolean;
  enableMLOptimization: boolean;
  apiBaseUrl: string;
  websocketUrl: string;
}

export interface ServiceStatus {
  webrtc: boolean;
  websocket: boolean;
  pushNotifications: boolean;
  offlineSync: boolean;
  payments: boolean;
  mlOptimization: boolean;
  overall: boolean;
}

export interface UserSession {
  userId: string;
  userName: string;
  userType: 'patient' | 'doctor' | 'pharmacy';
  isOnline: boolean;
  lastSeen: string;
  preferences: {
    notifications: boolean;
    videoQuality: 'low' | 'medium' | 'high';
    language: string;
    theme: 'light' | 'dark';
  };
}

class IntegrationService {
  private config: IntegrationConfig;
  private userSession: UserSession | null = null;
  private isInitialized: boolean = false;
  private serviceStatus: ServiceStatus = {
    webrtc: false,
    websocket: false,
    pushNotifications: false,
    offlineSync: false,
    payments: false,
    mlOptimization: false,
    overall: false
  };
  private statusCallbacks: ((status: ServiceStatus) => void)[] = [];

  constructor() {
    this.config = {
      enableWebRTC: true,
      enableWebSocket: true,
      enablePushNotifications: true,
      enableOfflineSync: true,
      enablePayments: true,
      enableMLOptimization: true,
      apiBaseUrl: process.env.NEXT_PUBLIC_API_URL || '/api',
      websocketUrl: process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:8080/ws'
    };
  }

  async initialize(userSession: UserSession): Promise<void> {
    if (this.isInitialized) return;

    this.userSession = userSession;
    
    try {
      console.log('Initializing MediLink Integration Service...');
      
      // Initialize services in parallel for better performance
      const initPromises = [];

      if (this.config.enableWebSocket) {
        initPromises.push(this.initializeWebSocket());
      }

      if (this.config.enablePushNotifications) {
        initPromises.push(this.initializePushNotifications());
      }

      if (this.config.enableOfflineSync) {
        initPromises.push(this.initializeOfflineSync());
      }

      if (this.config.enablePayments) {
        initPromises.push(this.initializePayments());
      }

      if (this.config.enableMLOptimization) {
        initPromises.push(this.initializeMLOptimization());
      }

      // Wait for all services to initialize
      await Promise.allSettled(initPromises);

      // Initialize WebRTC last as it depends on WebSocket
      if (this.config.enableWebRTC && this.serviceStatus.websocket) {
        await this.initializeWebRTC();
      }

      this.isInitialized = true;
      this.updateOverallStatus();
      
      console.log('MediLink Integration Service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Integration Service:', error);
      throw error;
    }
  }

  private async initializeWebSocket(): Promise<void> {
    try {
      await websocketService.connect();
      
      // Set up message handlers
      websocketService.onMessage('*', this.handleWebSocketMessage.bind(this));
      
      // Send user online status
      websocketService.sendUserStatus(this.userSession!.userId, true);
      
      this.serviceStatus.websocket = true;
      console.log('WebSocket service initialized');
    } catch (error) {
      console.error('Failed to initialize WebSocket:', error);
      this.serviceStatus.websocket = false;
    }
  }

  private async initializePushNotifications(): Promise<void> {
    try {
      // Request notification permission
      const permission = await messagingService.requestPermission();
      
      if (permission === 'granted') {
        // Set up message handlers
        messagingService.onMessage(this.handlePushNotification.bind(this));
        
        this.serviceStatus.pushNotifications = true;
        console.log('Push notifications service initialized');
      } else {
        console.warn('Push notification permission denied');
        this.serviceStatus.pushNotifications = false;
      }
    } catch (error) {
      console.error('Failed to initialize push notifications:', error);
      this.serviceStatus.pushNotifications = false;
    }
  }

  private async initializeOfflineSync(): Promise<void> {
    try {
      // Set up sync status monitoring
      syncService.onSyncStatusChange(this.handleSyncStatus.bind(this));
      
      this.serviceStatus.offlineSync = true;
      console.log('Offline sync service initialized');
    } catch (error) {
      console.error('Failed to initialize offline sync:', error);
      this.serviceStatus.offlineSync = false;
    }
  }

  private async initializePayments(): Promise<void> {
    try {
      await paymentService.initialize();
      
      this.serviceStatus.payments = true;
      console.log('Payment service initialized');
    } catch (error) {
      console.error('Failed to initialize payments:', error);
      this.serviceStatus.payments = false;
    }
  }

  private async initializeMLOptimization(): Promise<void> {
    try {
      await mlOptimizationService.initialize();
      
      this.serviceStatus.mlOptimization = true;
      console.log('ML optimization service initialized');
    } catch (error) {
      console.error('Failed to initialize ML optimization:', error);
      this.serviceStatus.mlOptimization = false;
    }
  }

  private async initializeWebRTC(): Promise<void> {
    try {
      // WebRTC is initialized per call, not globally
      this.serviceStatus.webrtc = true;
      console.log('WebRTC service ready');
    } catch (error) {
      console.error('Failed to initialize WebRTC:', error);
      this.serviceStatus.webrtc = false;
    }
  }

  private handleWebSocketMessage(message: any): void {
    console.log('WebSocket message received:', message.type);
    
    // Route messages to appropriate handlers
    switch (message.type) {
      case 'call_notification':
        this.handleCallNotification(message);
        break;
      case 'appointment_reminder':
        this.handleAppointmentReminder(message);
        break;
      case 'emergency_alert':
        this.handleEmergencyAlert(message);
        break;
      case 'chat_message':
        this.handleChatMessage(message);
        break;
    }
  }

  private handlePushNotification(payload: any): void {
    console.log('Push notification received:', payload);
    
    // Handle different notification types
    const notificationType = payload.data?.type;
    
    switch (notificationType) {
      case 'call':
        this.handleCallNotification(payload);
        break;
      case 'appointment':
        this.handleAppointmentReminder(payload);
        break;
      case 'emergency':
        this.handleEmergencyAlert(payload);
        break;
      case 'chat':
        this.handleChatMessage(payload);
        break;
    }
  }

  private handleSyncStatus(status: any): void {
    console.log('Sync status:', status);
    
    // Notify UI about sync status
    this.notifyStatusChange();
  }

  private handleCallNotification(message: any): void {
    // Show call notification UI
    console.log('Call notification:', message.data);
  }

  private handleAppointmentReminder(message: any): void {
    // Show appointment reminder UI
    console.log('Appointment reminder:', message.data);
  }

  private handleEmergencyAlert(message: any): void {
    // Show emergency alert UI
    console.log('Emergency alert:', message.data);
  }

  private handleChatMessage(message: any): void {
    // Show chat message notification
    console.log('Chat message:', message.data);
  }

  // Public API methods
  async startVideoCall(roomId: string, otherUserId: string, otherUserName: string): Promise<void> {
    if (!this.serviceStatus.webrtc) {
      throw new Error('WebRTC service not available');
    }

    const config: WebRTCConfig = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ],
      signalingServerUrl: this.config.websocketUrl,
      roomId,
      userId: this.userSession!.userId,
      userName: this.userSession!.userName
    };

    await webrtcService.initialize(config);
    await webrtcService.startCall();

    // Send call notification
    websocketService.sendCallNotification({
      id: `call_${Date.now()}`,
      doctorName: this.userSession!.userType === 'doctor' ? this.userSession!.userName : 'Doctor',
      patientName: this.userSession!.userType === 'patient' ? this.userSession!.userName : 'Patient',
      roomName: roomId,
      status: 'initiated',
      initiatedBy: this.userSession!.userType === 'pharmacy' ? 'doctor' : this.userSession!.userType as 'patient' | 'doctor',
      initiatedAt: new Date().toISOString(),
      jitsiLink: ''
    }, otherUserId);
  }

  async sendChatMessage(chatId: string, content: string, recipientId: string): Promise<void> {
    if (!this.serviceStatus.websocket) {
      throw new Error('WebSocket service not available');
    }

    const message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sender: (this.userSession!.userType === 'patient' ? 'patient' : 'doctor') as 'patient' | 'doctor',
      text: content,
      timestamp: new Date().toISOString(),
      status: 'sent' as const
    };

    // Send via WebSocket
    websocketService.sendChatMessage(chatId, message, recipientId);
    
    // Store locally for offline sync
    const messageRecord = {
      chatId,
      senderId: this.userSession!.userId,
      senderName: this.userSession!.userName,
      content,
      messageType: 'text' as const,
      timestamp: message.timestamp,
      read: false
    };
    await chatMessageOperations.create(messageRecord);
  }

  async predictDiseases(symptomData: SymptomData): Promise<DiseasePrediction[]> {
    if (!this.serviceStatus.mlOptimization) {
      throw new Error('ML optimization service not available');
    }

    return await mlOptimizationService.predictDiseases(symptomData);
  }

  async getDrugRecommendations(disease: string, patientProfile: any): Promise<DrugRecommendation[]> {
    if (!this.serviceStatus.mlOptimization) {
      throw new Error('ML optimization service not available');
    }

    return await mlOptimizationService.getDrugRecommendations(disease, patientProfile);
  }

  async processPayment(amount: number, description: string, metadata: any): Promise<any> {
    if (!this.serviceStatus.payments) {
      throw new Error('Payment service not available');
    }

    return await paymentService.createPaymentIntent(amount, 'usd', metadata);
  }

  async sendAppointmentReminder(appointmentId: string, patientId: string, doctorId: string, reminderData: any): Promise<void> {
    if (!this.serviceStatus.pushNotifications) {
      throw new Error('Push notification service not available');
    }

    // Send via WebSocket
    websocketService.sendAppointmentReminder(appointmentId, patientId, doctorId, reminderData);
    
    // Send push notification
    await messagingService.sendAppointmentReminder(patientId, doctorId, {
      appointmentId,
      doctorName: reminderData.doctorName,
      appointmentTime: reminderData.appointmentTime,
      appointmentDate: reminderData.appointmentDate,
      type: reminderData.type
    });
  }

  async sendEmergencyAlert(patientId: string, doctorIds: string[], emergencyData: any): Promise<void> {
    if (!this.serviceStatus.pushNotifications) {
      throw new Error('Push notification service not available');
    }

    // Send via WebSocket
    websocketService.sendEmergencyAlert(patientId, doctorIds[0], emergencyData);
    
    // Send push notifications
    await messagingService.sendEmergencyAlert(doctorIds, patientId, emergencyData);
  }

  // Status monitoring
  onStatusChange(callback: (status: ServiceStatus) => void): void {
    this.statusCallbacks.push(callback);
  }

  offStatusChange(callback: (status: ServiceStatus) => void): void {
    const index = this.statusCallbacks.indexOf(callback);
    if (index > -1) {
      this.statusCallbacks.splice(index, 1);
    }
  }

  private notifyStatusChange(): void {
    this.statusCallbacks.forEach(callback => callback(this.serviceStatus));
  }

  private updateOverallStatus(): void {
    const services = [
      this.serviceStatus.webrtc,
      this.serviceStatus.websocket,
      this.serviceStatus.pushNotifications,
      this.serviceStatus.offlineSync,
      this.serviceStatus.payments,
      this.serviceStatus.mlOptimization
    ];
    
    this.serviceStatus.overall = services.every(status => status);
    this.notifyStatusChange();
  }

  // Utility methods
  getServiceStatus(): ServiceStatus {
    return { ...this.serviceStatus };
  }

  isServiceAvailable(service: keyof ServiceStatus): boolean {
    return this.serviceStatus[service];
  }

  getUserSession(): UserSession | null {
    return this.userSession;
  }

  // Cleanup
  async destroy(): Promise<void> {
    try {
      // Disconnect WebSocket
      if (this.serviceStatus.websocket) {
        websocketService.destroy();
      }

      // Clean up other services
      if (this.serviceStatus.webrtc) {
        webrtcService.destroy();
      }

      if (this.serviceStatus.mlOptimization) {
        mlOptimizationService.destroy();
      }

      if (this.serviceStatus.offlineSync) {
        syncService.destroy();
      }

      if (this.serviceStatus.payments) {
        paymentService.destroy();
      }

      // Clear status
      this.serviceStatus = {
        webrtc: false,
        websocket: false,
        pushNotifications: false,
        offlineSync: false,
        payments: false,
        mlOptimization: false,
        overall: false
      };

      this.isInitialized = false;
      this.userSession = null;
      this.statusCallbacks = [];

      console.log('Integration service destroyed');
    } catch (error) {
      console.error('Error destroying integration service:', error);
    }
  }
}

// Export singleton instance
export const integrationService = new IntegrationService();
export default integrationService;

