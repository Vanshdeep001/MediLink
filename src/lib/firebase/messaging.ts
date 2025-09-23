// Firebase Cloud Messaging Service for push notifications
import { getMessaging, getToken, onMessage, MessagePayload } from 'firebase/messaging';
import { app } from './config';

export interface NotificationData {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  data?: Record<string, string>;
  clickAction?: string;
  tag?: string;
  requireInteraction?: boolean;
  silent?: boolean;
  timestamp?: number;
}

export interface PushNotificationPayload {
  notification: {
    title: string;
    body: string;
    icon?: string;
    badge?: string;
    image?: string;
    click_action?: string;
  };
  data?: Record<string, string>;
  token: string;
  android?: {
    notification: {
      icon?: string;
      color?: string;
      sound?: string;
      tag?: string;
      click_action?: string;
    };
  };
  apns?: {
    payload: {
      aps: {
        alert: {
          title: string;
          body: string;
        };
        badge?: number;
        sound?: string;
        category?: string;
      };
    };
  };
  webpush?: {
    notification: {
      title: string;
      body: string;
      icon?: string;
      badge?: string;
      image?: string;
      actions?: Array<{
        action: string;
        title: string;
        icon?: string;
      }>;
    };
    fcm_options?: {
      link: string;
    };
  };
}

class FirebaseMessagingService {
  private messaging: any = null;
  private vapidKey: string;
  private isSupported: boolean = false;
  private token: string | null = null;
  private tokenRefreshCallbacks: ((token: string) => void)[] = [];
  private messageCallbacks: ((payload: MessagePayload) => void)[] = [];

  constructor() {
    this.vapidKey = process.env.NEXT_PUBLIC_FCM_VAPID_KEY || '';
    this.initializeMessaging();
  }

  private async initializeMessaging() {
    try {
      // Check if service worker is supported
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        this.isSupported = true;
        this.messaging = getMessaging(app);
        
        // Register service worker
        await this.registerServiceWorker();
        
        // Get FCM token
        await this.getFCMToken();
        
        // Set up message listener
        this.setupMessageListener();
      } else {
        console.warn('Push messaging is not supported in this browser');
      }
    } catch (error) {
      console.error('Failed to initialize Firebase Messaging:', error);
    }
  }

  private async registerServiceWorker(): Promise<void> {
    try {
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      console.log('Service Worker registered:', registration);
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      throw error;
    }
  }

  private async getFCMToken(): Promise<string | null> {
    try {
      if (!this.messaging) {
        throw new Error('Messaging not initialized');
      }

      const token = await getToken(this.messaging, {
        vapidKey: this.vapidKey
      });

      if (token) {
        this.token = token;
        console.log('FCM Token:', token);
        
        // Notify token refresh callbacks
        this.tokenRefreshCallbacks.forEach(callback => callback(token));
        
        // Store token in localStorage for persistence
        localStorage.setItem('fcm_token', token);
        
        return token;
      } else {
        console.log('No registration token available.');
        return null;
      }
    } catch (error) {
      console.error('An error occurred while retrieving token:', error);
      return null;
    }
  }

  private setupMessageListener(): void {
    if (!this.messaging) return;

    onMessage(this.messaging, (payload) => {
      console.log('Message received:', payload);
      
      // Notify message callbacks
      this.messageCallbacks.forEach(callback => callback(payload));
      
      // Show notification if not already shown
      this.showNotification(payload);
    });
  }

  private showNotification(payload: MessagePayload): void {
    const notification = payload.notification;
    if (!notification) return;

    const notificationOptions: NotificationOptions = {
      body: notification.body,
      icon: notification.icon || '/favicon.ico',
      tag: payload.data?.tag || 'medilink-notification',
      requireInteraction: payload.data?.requireInteraction === 'true',
      silent: payload.data?.silent === 'true',
      data: payload.data
    };

    if (Notification.permission === 'granted') {
      const notificationInstance = new Notification(notification.title || 'MediLink', notificationOptions);
      
      // Handle notification click
      notificationInstance.onclick = (event) => {
        event.preventDefault();
        window.focus();
        
        // Handle click action
        if (payload.data?.clickAction) {
          window.location.href = payload.data.clickAction;
        } else if (payload.data?.url) {
          window.location.href = payload.data.url;
        }
        
        notificationInstance.close();
      };

      // Auto-close after 10 seconds if not requiring interaction
      if (!notificationOptions.requireInteraction) {
        setTimeout(() => {
          notificationInstance.close();
        }, 10000);
      }
    }
  }

  async requestPermission(): Promise<NotificationPermission> {
    try {
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        console.log('Notification permission granted');
        // Get token after permission is granted
        await this.getFCMToken();
      } else {
        console.log('Notification permission denied');
      }
      
      return permission;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return 'denied';
    }
  }

  async getToken(): Promise<string | null> {
    if (this.token) {
      return this.token;
    }
    
    return await this.getFCMToken();
  }

  async refreshToken(): Promise<string | null> {
    this.token = null;
    return await this.getFCMToken();
  }

  onTokenRefresh(callback: (token: string) => void): void {
    this.tokenRefreshCallbacks.push(callback);
  }

  offTokenRefresh(callback: (token: string) => void): void {
    const index = this.tokenRefreshCallbacks.indexOf(callback);
    if (index > -1) {
      this.tokenRefreshCallbacks.splice(index, 1);
    }
  }

  onMessage(callback: (payload: MessagePayload) => void): void {
    this.messageCallbacks.push(callback);
  }

  offMessage(callback: (payload: MessagePayload) => void): void {
    const index = this.messageCallbacks.indexOf(callback);
    if (index > -1) {
      this.messageCallbacks.splice(index, 1);
    }
  }

  // Send notification to specific user
  async sendNotificationToUser(userId: string, notification: NotificationData): Promise<boolean> {
    try {
      // In a real implementation, this would call your backend API
      // which would then send the notification using Firebase Admin SDK
      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          notification
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Error sending notification:', error);
      return false;
    }
  }

  // Send notification to multiple users
  async sendNotificationToUsers(userIds: string[], notification: NotificationData): Promise<boolean> {
    try {
      const response = await fetch('/api/notifications/send-bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userIds,
          notification
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Error sending bulk notification:', error);
      return false;
    }
  }

  // Send appointment reminder
  async sendAppointmentReminder(
    patientId: string, 
    doctorId: string, 
    appointmentData: {
      appointmentId: string;
      doctorName: string;
      appointmentTime: string;
      appointmentDate: string;
      type: 'upcoming' | 'reminder' | 'cancelled' | 'rescheduled';
    }
  ): Promise<boolean> {
    const notification: NotificationData = {
      title: `Appointment ${appointmentData.type === 'upcoming' ? 'Scheduled' : 
              appointmentData.type === 'reminder' ? 'Reminder' :
              appointmentData.type === 'cancelled' ? 'Cancelled' : 'Rescheduled'}`,
      body: `Your appointment with Dr. ${appointmentData.doctorName} is ${appointmentData.appointmentTime} on ${appointmentData.appointmentDate}`,
      icon: '/favicon.ico',
      data: {
        type: 'appointment',
        appointmentId: appointmentData.appointmentId,
        doctorId,
        clickAction: '/patient/appointments'
      },
      requireInteraction: true
    };

    return await this.sendNotificationToUser(patientId, notification);
  }

  // Send call notification
  async sendCallNotification(
    recipientId: string,
    callerName: string,
    callType: 'incoming' | 'missed' | 'ended',
    callData: {
      callId: string;
      roomName: string;
      isVideoCall: boolean;
    }
  ): Promise<boolean> {
    const notification: NotificationData = {
      title: callType === 'incoming' ? 'Incoming Call' : 
             callType === 'missed' ? 'Missed Call' : 'Call Ended',
      body: callType === 'incoming' ? `${callerName} is calling you` :
            callType === 'missed' ? `Missed call from ${callerName}` :
            `Call with ${callerName} ended`,
      icon: '/favicon.ico',
      data: {
        type: 'call',
        callId: callData.callId,
        roomName: callData.roomName,
        isVideoCall: callData.isVideoCall.toString(),
        clickAction: callType === 'incoming' ? '/patient/video-consultation' : '/patient'
      },
      requireInteraction: callType === 'incoming'
    };

    return await this.sendNotificationToUser(recipientId, notification);
  }

  // Send emergency alert
  async sendEmergencyAlert(
    doctorIds: string[],
    patientName: string,
    emergencyData: {
      emergencyId: string;
      location: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      description: string;
    }
  ): Promise<boolean> {
    const notification: NotificationData = {
      title: '🚨 Emergency Alert',
      body: `Emergency from ${patientName}: ${emergencyData.description}`,
      icon: '/favicon.ico',
      data: {
        type: 'emergency',
        emergencyId: emergencyData.emergencyId,
        patientName,
        severity: emergencyData.severity,
        clickAction: '/doctor/emergency'
      },
      requireInteraction: true,
      tag: 'emergency'
    };

    return await this.sendNotificationToUsers(doctorIds, notification);
  }

  // Send chat message notification
  async sendChatNotification(
    recipientId: string,
    senderName: string,
    messagePreview: string,
    chatId: string
  ): Promise<boolean> {
    const notification: NotificationData = {
      title: `New message from ${senderName}`,
      body: messagePreview,
      icon: '/favicon.ico',
      data: {
        type: 'chat',
        chatId,
        senderName,
        clickAction: `/patient/chatdoc?chatId=${chatId}`
      }
    };

    return await this.sendNotificationToUser(recipientId, notification);
  }

  // Check if notifications are supported
  isNotificationSupported(): boolean {
    return this.isSupported && 'Notification' in window;
  }

  // Check current permission status
  getPermissionStatus(): NotificationPermission {
    return Notification.permission;
  }

  // Cleanup
  destroy(): void {
    this.tokenRefreshCallbacks = [];
    this.messageCallbacks = [];
    this.token = null;
  }
}

// Export singleton instance
export const messagingService = new FirebaseMessagingService();
export default messagingService;

