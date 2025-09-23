// SQLite Service for offline support and data synchronization
import Dexie, { Table } from 'dexie';

// Database schema definitions
export interface PatientRecord {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  age: number;
  role: 'patient';
  createdAt: string;
  updatedAt: string;
  synced: boolean;
  lastSyncAt?: string;
}

export interface DoctorRecord {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  specialization: string;
  experience: number;
  rating: number;
  location: string;
  role: 'doctor';
  createdAt: string;
  updatedAt: string;
  synced: boolean;
  lastSyncAt?: string;
}

export interface AppointmentRecord {
  id: string;
  patientId: string;
  doctorId: string;
  patientName: string;
  doctorName: string;
  appointmentDate: string;
  appointmentTime: string;
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed' | 'rescheduled';
  type: 'video' | 'in-person' | 'phone';
  notes?: string;
  createdAt: string;
  updatedAt: string;
  synced: boolean;
  lastSyncAt?: string;
}

export interface ChatMessageRecord {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  content: string;
  messageType: 'text' | 'image' | 'file' | 'system';
  timestamp: string;
  read: boolean;
  synced: boolean;
  lastSyncAt?: string;
}

export interface MedicalHistoryRecord {
  id: string;
  patientId: string;
  recordType: 'prescription' | 'lab_report' | 'scan' | 'vaccination' | 'surgery' | 'allergy' | 'chronic_condition';
  title: string;
  description: string;
  date: string;
  doctorName?: string;
  hospitalName?: string;
  fileUrl?: string;
  fileSize?: number;
  mimeType?: string;
  createdAt: string;
  updatedAt: string;
  synced: boolean;
  lastSyncAt?: string;
}

export interface PrescriptionRecord {
  id: string;
  patientId: string;
  doctorId: string;
  patientName: string;
  doctorName: string;
  medications: Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
  }>;
  diagnosis: string;
  notes: string;
  prescribedDate: string;
  status: 'active' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  synced: boolean;
  lastSyncAt?: string;
}

export interface SyncQueueRecord {
  id: string;
  tableName: string;
  recordId: string;
  operation: 'create' | 'update' | 'delete';
  data: any;
  timestamp: string;
  retryCount: number;
  maxRetries: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
}

// Database class
class MediLinkDatabase extends Dexie {
  patients!: Table<PatientRecord>;
  doctors!: Table<DoctorRecord>;
  appointments!: Table<AppointmentRecord>;
  chatMessages!: Table<ChatMessageRecord>;
  medicalHistory!: Table<MedicalHistoryRecord>;
  prescriptions!: Table<PrescriptionRecord>;
  syncQueue!: Table<SyncQueueRecord>;

  constructor() {
    super('MediLinkDatabase');
    
    this.version(1).stores({
      patients: 'id, fullName, email, phone, synced, lastSyncAt',
      doctors: 'id, fullName, email, specialization, synced, lastSyncAt',
      appointments: 'id, patientId, doctorId, appointmentDate, status, synced, lastSyncAt',
      chatMessages: 'id, chatId, senderId, timestamp, synced, lastSyncAt',
      medicalHistory: 'id, patientId, recordType, date, synced, lastSyncAt',
      prescriptions: 'id, patientId, doctorId, prescribedDate, status, synced, lastSyncAt',
      syncQueue: 'id, tableName, recordId, operation, status, timestamp'
    });
  }
}

// Database instance
const db = new MediLinkDatabase();

// Sync service
class SQLiteSyncService {
  private isOnline: boolean = navigator.onLine;
  private syncInterval: NodeJS.Timeout | null = null;
  private syncInProgress: boolean = false;
  private syncCallbacks: ((status: SyncStatus) => void)[] = [];

  constructor() {
    this.setupEventListeners();
    this.startPeriodicSync();
  }

  private setupEventListeners() {
    // Network status listeners
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.triggerSync();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    // Visibility change listener (sync when tab becomes visible)
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && this.isOnline) {
        this.triggerSync();
      }
    });
  }

  private startPeriodicSync() {
    // Sync every 5 minutes when online
    this.syncInterval = setInterval(() => {
      if (this.isOnline && !this.syncInProgress) {
        this.triggerSync();
      }
    }, 5 * 60 * 1000);
  }

  async triggerSync(): Promise<void> {
    if (!this.isOnline || this.syncInProgress) {
      return;
    }

    this.syncInProgress = true;
    this.notifySyncStatus({ status: 'syncing', progress: 0 });

    try {
      // Get pending sync items
      const pendingItems = await db.syncQueue
        .where('status')
        .anyOf(['pending', 'failed'])
        .toArray();

      if (pendingItems.length === 0) {
        this.notifySyncStatus({ status: 'completed', progress: 100 });
        return;
      }

      let processed = 0;
      const total = pendingItems.length;

      for (const item of pendingItems) {
        try {
          await this.syncItem(item);
          processed++;
          
          const progress = Math.round((processed / total) * 100);
          this.notifySyncStatus({ status: 'syncing', progress });
        } catch (error) {
          console.error(`Failed to sync item ${item.id}:`, error);
          await this.handleSyncError(item, error);
        }
      }

      this.notifySyncStatus({ status: 'completed', progress: 100 });
    } catch (error) {
      console.error('Sync failed:', error);
      this.notifySyncStatus({ status: 'failed', error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      this.syncInProgress = false;
    }
  }

  private async syncItem(item: SyncQueueRecord): Promise<void> {
    // Update status to processing
    await db.syncQueue.update(item.id, { status: 'processing' });

    try {
      // Make API call based on operation
      const response = await this.makeApiCall(item);
      
      if (response.ok) {
        // Mark as synced in the original table
        await this.markRecordAsSynced(item.tableName, item.recordId);
        
        // Remove from sync queue
        await db.syncQueue.delete(item.id);
      } else {
        throw new Error(`API call failed: ${response.status}`);
      }
    } catch (error) {
      throw error;
    }
  }

  private async makeApiCall(item: SyncQueueRecord): Promise<Response> {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
    const endpoint = `${baseUrl}/${item.tableName}`;
    
    const options: RequestInit = {
      method: item.operation === 'create' ? 'POST' : 
              item.operation === 'update' ? 'PUT' : 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (item.operation !== 'delete') {
      options.body = JSON.stringify(item.data);
    }

    return fetch(endpoint, options);
  }

  private async markRecordAsSynced(tableName: string, recordId: string): Promise<void> {
    const now = new Date().toISOString();
    
    switch (tableName) {
      case 'patients':
        await db.patients.update(recordId, { synced: true, lastSyncAt: now });
        break;
      case 'doctors':
        await db.doctors.update(recordId, { synced: true, lastSyncAt: now });
        break;
      case 'appointments':
        await db.appointments.update(recordId, { synced: true, lastSyncAt: now });
        break;
      case 'chatMessages':
        await db.chatMessages.update(recordId, { synced: true, lastSyncAt: now });
        break;
      case 'medicalHistory':
        await db.medicalHistory.update(recordId, { synced: true, lastSyncAt: now });
        break;
      case 'prescriptions':
        await db.prescriptions.update(recordId, { synced: true, lastSyncAt: now });
        break;
    }
  }

  private async handleSyncError(item: SyncQueueRecord, error: any): Promise<void> {
    const retryCount = item.retryCount + 1;
    const maxRetries = item.maxRetries || 3;
    
    if (retryCount >= maxRetries) {
      await db.syncQueue.update(item.id, {
        status: 'failed',
        retryCount,
        error: error.message
      });
    } else {
      await db.syncQueue.update(item.id, {
        status: 'pending',
        retryCount,
        error: error.message
      });
    }
  }

  private notifySyncStatus(status: SyncStatus): void {
    this.syncCallbacks.forEach(callback => callback(status));
  }

  // Public methods
  async addToSyncQueue(
    tableName: string,
    recordId: string,
    operation: 'create' | 'update' | 'delete',
    data: any
  ): Promise<void> {
    const syncItem: SyncQueueRecord = {
      id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      tableName,
      recordId,
      operation,
      data,
      timestamp: new Date().toISOString(),
      retryCount: 0,
      maxRetries: 3,
      status: 'pending'
    };

    await db.syncQueue.add(syncItem);

    // Trigger immediate sync if online
    if (this.isOnline) {
      this.triggerSync();
    }
  }

  onSyncStatusChange(callback: (status: SyncStatus) => void): void {
    this.syncCallbacks.push(callback);
  }

  offSyncStatusChange(callback: (status: SyncStatus) => void): void {
    const index = this.syncCallbacks.indexOf(callback);
    if (index > -1) {
      this.syncCallbacks.splice(index, 1);
    }
  }

  getOnlineStatus(): boolean {
    return this.isOnline;
  }

  getPendingSyncCount(): Promise<number> {
    return db.syncQueue.where('status').anyOf(['pending', 'failed']).count();
  }

  // Cleanup
  destroy(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    this.syncCallbacks = [];
  }
}

// Sync status interface
export interface SyncStatus {
  status: 'idle' | 'syncing' | 'completed' | 'failed';
  progress?: number;
  error?: string;
}

// Export database and sync service
export const sqliteDb = db;
export const syncService = new SQLiteSyncService();

// Export individual table operations
export const patientOperations = {
  async create(patient: Omit<PatientRecord, 'id' | 'createdAt' | 'updatedAt' | 'synced'>): Promise<string> {
    const id = `patient_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();
    
    const record: PatientRecord = {
      ...patient,
      id,
      createdAt: now,
      updatedAt: now,
      synced: false
    };

    await db.patients.add(record);
    await syncService.addToSyncQueue('patients', id, 'create', record);
    
    return id;
  },

  async update(id: string, updates: Partial<PatientRecord>): Promise<void> {
    const now = new Date().toISOString();
    const updatedRecord = { ...updates, updatedAt: now, synced: false };
    
    await db.patients.update(id, updatedRecord);
    await syncService.addToSyncQueue('patients', id, 'update', updatedRecord);
  },

  async delete(id: string): Promise<void> {
    await db.patients.delete(id);
    await syncService.addToSyncQueue('patients', id, 'delete', {});
  },

  async getAll(): Promise<PatientRecord[]> {
    return await db.patients.toArray();
  },

  async getById(id: string): Promise<PatientRecord | undefined> {
    return await db.patients.get(id);
  }
};

export const appointmentOperations = {
  async create(appointment: Omit<AppointmentRecord, 'id' | 'createdAt' | 'updatedAt' | 'synced'>): Promise<string> {
    const id = `appointment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();
    
    const record: AppointmentRecord = {
      ...appointment,
      id,
      createdAt: now,
      updatedAt: now,
      synced: false
    };

    await db.appointments.add(record);
    await syncService.addToSyncQueue('appointments', id, 'create', record);
    
    return id;
  },

  async update(id: string, updates: Partial<AppointmentRecord>): Promise<void> {
    const now = new Date().toISOString();
    const updatedRecord = { ...updates, updatedAt: now, synced: false };
    
    await db.appointments.update(id, updatedRecord);
    await syncService.addToSyncQueue('appointments', id, 'update', updatedRecord);
  },

  async getByPatientId(patientId: string): Promise<AppointmentRecord[]> {
    return await db.appointments.where('patientId').equals(patientId).toArray();
  },

  async getByDoctorId(doctorId: string): Promise<AppointmentRecord[]> {
    return await db.appointments.where('doctorId').equals(doctorId).toArray();
  }
};

export const chatMessageOperations = {
  async create(message: Omit<ChatMessageRecord, 'id' | 'synced' | 'lastSyncAt'>): Promise<string> {
    const id = `message_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const record: ChatMessageRecord = {
      ...message,
      id,
      synced: false
    };

    await db.chatMessages.add(record);
    await syncService.addToSyncQueue('chatMessages', id, 'create', record);
    
    return id;
  },

  async getByChatId(chatId: string): Promise<ChatMessageRecord[]> {
    return await db.chatMessages.where('chatId').equals(chatId).toArray();
  },

  async markAsRead(messageId: string): Promise<void> {
    await db.chatMessages.update(messageId, { read: true });
  }
};

export default sqliteDb;

