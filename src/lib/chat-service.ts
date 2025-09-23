// ChatDoc Service for Real-time Patient-Doctor Communication
export interface ChatMessage {
  id: string;
  sender: 'patient' | 'doctor';
  text: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'seen';
  attachments?: ChatAttachment[];
}

export interface ChatAttachment {
  id: string;
  type: 'image' | 'document' | 'audio';
  name: string;
  url: string;
  size: number;
}

export interface ChatSession {
  chatId: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  messages: ChatMessage[];
  lastMessage?: ChatMessage;
  lastActivity: string;
  isActive: boolean;
  unreadCount: number;
}

export interface ChatNotification {
  id: string;
  chatId: string;
  message: string;
  sender: string;
  timestamp: string;
  read: boolean;
}

// Mock WebSocket-like functionality using localStorage and events
class ChatService {
  private static instance: ChatService;
  private sessions: Map<string, ChatSession> = new Map();
  private listeners: Map<string, Function[]> = new Map();
  private isOnline: boolean = true;

  static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService();
    }
    return ChatService.instance;
  }

  constructor() {
    if (typeof window !== 'undefined') {
      this.loadSessionsFromStorage();
      this.setupNetworkListeners();
      this.startHeartbeat();
    }
  }

  // Session Management
  createChatSession(patientId: string, patientName: string, doctorId: string, doctorName: string): ChatSession {
    const chatId = `${patientId}_${doctorId}`;
    
    const session: ChatSession = {
      chatId,
      patientId,
      patientName,
      doctorId,
      doctorName,
      messages: [],
      lastActivity: new Date().toISOString(),
      isActive: true,
      unreadCount: 0
    };

    this.sessions.set(chatId, session);
    this.saveSessionsToStorage();
    this.emit('sessionCreated', session);
    
    return session;
  }

  getChatSession(chatId: string): ChatSession | null {
    return this.sessions.get(chatId) || null;
  }

  getChatSessionsForUser(userId: string, userType: 'patient' | 'doctor'): ChatSession[] {
    const sessions: ChatSession[] = [];
    
    for (const session of this.sessions.values()) {
      if (userType === 'patient' && session.patientId === userId) {
        sessions.push(session);
      } else if (userType === 'doctor' && session.doctorId === userId) {
        sessions.push(session);
      }
    }
    
    return sessions.sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime());
  }

  // Message Management
  sendMessage(chatId: string, sender: 'patient' | 'doctor', text: string, attachments?: ChatAttachment[]): ChatMessage {
    const session = this.sessions.get(chatId);
    if (!session) {
      throw new Error('Chat session not found');
    }

    const message: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sender,
      text,
      timestamp: new Date().toISOString(),
      status: 'sent',
      attachments
    };

    session.messages.push(message);
    session.lastMessage = message;
    session.lastActivity = message.timestamp;
    
    // Update unread count for the other user
    if (sender === 'patient') {
      session.unreadCount++;
    } else {
      session.unreadCount = 0; // Doctor read their own message
    }

    this.sessions.set(chatId, session);
    this.saveSessionsToStorage();
    
    // Simulate message delivery and seen status
    setTimeout(() => {
      message.status = 'delivered';
      this.emit('messageStatusUpdate', { chatId, messageId: message.id, status: 'delivered' });
    }, 1000);

    setTimeout(() => {
      message.status = 'seen';
      this.emit('messageStatusUpdate', { chatId, messageId: message.id, status: 'seen' });
    }, 3000);

    this.emit('newMessage', { chatId, message, session });
    this.createNotification(chatId, message, session);
    
    return message;
  }

  markMessagesAsSeen(chatId: string, userId: string): void {
    const session = this.sessions.get(chatId);
    if (!session) return;

    const userType = session.patientId === userId ? 'patient' : 'doctor';
    
    // Mark unread messages as seen
    session.messages.forEach(message => {
      if (message.sender !== userType && message.status !== 'seen') {
        message.status = 'seen';
      }
    });

    // Reset unread count
    if (userType === 'doctor') {
      session.unreadCount = 0;
    }

    this.sessions.set(chatId, session);
    this.saveSessionsToStorage();
    this.emit('messagesSeen', { chatId, userId });
  }

  // Real-time Communication (Mock WebSocket)
  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function): void {
    const listeners = this.listeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: any): void {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Chat service listener error:', error);
        }
      });
    }
  }

  // Notification System
  private createNotification(chatId: string, message: ChatMessage, session: ChatSession): void {
    if (typeof window === 'undefined') return;
    
    const notification: ChatNotification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      chatId,
      message: message.text,
      sender: message.sender === 'patient' ? session.patientName : session.doctorName,
      timestamp: message.timestamp,
      read: false
    };

    // Store notification
    const notifications = JSON.parse(localStorage.getItem('chat_notifications') || '[]');
    notifications.push(notification);
    localStorage.setItem('chat_notifications', JSON.stringify(notifications));

    this.emit('notification', notification);
  }

  getNotifications(userId: string): ChatNotification[] {
    if (typeof window === 'undefined') return [];
    
    const notifications = JSON.parse(localStorage.getItem('chat_notifications') || '[]');
    return notifications.filter((notif: ChatNotification) => !notif.read);
  }

  markNotificationAsRead(notificationId: string): void {
    if (typeof window === 'undefined') return;
    
    const notifications = JSON.parse(localStorage.getItem('chat_notifications') || '[]');
    const notification = notifications.find((n: ChatNotification) => n.id === notificationId);
    if (notification) {
      notification.read = true;
      localStorage.setItem('chat_notifications', JSON.stringify(notifications));
    }
  }

  // Offline Support
  private setupNetworkListeners(): void {
    if (typeof window === 'undefined') return;
    
    const updateOnlineStatus = () => {
      this.isOnline = navigator.onLine;
      this.emit('networkStatusChange', { isOnline: this.isOnline });
      
      if (this.isOnline) {
        this.syncOfflineMessages();
      }
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
  }

  private syncOfflineMessages(): void {
    // Simulate syncing offline messages
    console.log('Syncing offline messages...');
    this.emit('messagesSynced', { timestamp: new Date().toISOString() });
  }

  // Storage Management
  private saveSessionsToStorage(): void {
    if (typeof window === 'undefined') return;
    
    try {
      const sessionsData = Array.from(this.sessions.entries());
      localStorage.setItem('chat_sessions', JSON.stringify(sessionsData));
    } catch (error) {
      console.error('Failed to save chat sessions:', error);
    }
  }

  private loadSessionsFromStorage(): void {
    if (typeof window === 'undefined') return;
    
    try {
      const sessionsData = localStorage.getItem('chat_sessions');
      if (sessionsData) {
        const sessions = JSON.parse(sessionsData);
        this.sessions = new Map(sessions);
      }
    } catch (error) {
      console.error('Failed to load chat sessions:', error);
    }
  }

  // Heartbeat for real-time simulation
  private startHeartbeat(): void {
    setInterval(() => {
      this.emit('heartbeat', { timestamp: new Date().toISOString() });
    }, 30000); // Every 30 seconds
  }

  // Utility Methods
  formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  }

  getUnreadCount(userId: string, userType: 'patient' | 'doctor'): number {
    const sessions = this.getChatSessionsForUser(userId, userType);
    return sessions.reduce((total, session) => total + session.unreadCount, 0);
  }

  // Get registered doctors from localStorage
  getRegisteredDoctors(): any[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const doctorsString = localStorage.getItem('doctors_list');
      if (!doctorsString) return [];
      
      const registeredDoctors = JSON.parse(doctorsString);
      return registeredDoctors.map((doctor: any, index: number) => ({
        id: `doc_${doctor.licenseNumber || index + 1}`,
        name: doctor.fullName || `Dr. ${doctor.fullName}`,
        specialization: doctor.specialization || 'General Medicine',
        availability: 'Available' as 'Available' | 'Busy' | 'Offline',
        phone: doctor.phone || '',
        experience: doctor.experience || '0 years',
        rating: 4.5,
        consultationFee: 500,
        languages: ['English', 'Hindi'],
        location: doctor.city || 'Unknown'
      }));
    } catch (error) {
      console.error('Error loading registered doctors:', error);
      return [];
    }
  }

  // Demo Data
  initializeDemoData(): void {
    // Create demo chat sessions with registered doctors
    const registeredDoctors = this.getRegisteredDoctors();
    
    if (registeredDoctors.length > 0) {
      const doctor = registeredDoctors[0];
      const demoSession1 = this.createChatSession('patient_1', 'John Doe', doctor.id, doctor.name);
      const demoSession2 = this.createChatSession('patient_2', 'Jane Smith', doctor.id, doctor.name);

      // Add some demo messages
      this.sendMessage(demoSession1.chatId, 'patient', 'Hello Doctor, I have been experiencing headaches for the past few days.');
      this.sendMessage(demoSession1.chatId, 'doctor', 'Hello John, I understand your concern. Can you tell me more about the intensity and frequency of these headaches?');
      this.sendMessage(demoSession1.chatId, 'patient', 'The headaches are moderate and occur mostly in the evening. They last for about 2-3 hours.');
      this.sendMessage(demoSession1.chatId, 'doctor', 'Thank you for the details. I recommend taking some rest and staying hydrated. If the symptoms persist, we should schedule a video consultation.');

      this.sendMessage(demoSession2.chatId, 'patient', 'Hi Doctor, I need to discuss my medication dosage.');
      this.sendMessage(demoSession2.chatId, 'doctor', 'Hello Jane, of course. What medication are you referring to?');
    }
  }
}

export default ChatService;
