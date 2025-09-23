// Vercel-compatible database service using Vercel KV (Redis)
import { kv } from '@vercel/kv';

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

class VercelDatabaseService {
  private isInitialized: boolean = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Test connection
      await kv.ping();
      this.isInitialized = true;
      console.log('Vercel KV database initialized');
    } catch (error) {
      console.error('Failed to initialize Vercel KV:', error);
      throw error;
    }
  }

  // Patient operations
  async createPatient(patient: Omit<PatientRecord, 'id' | 'createdAt' | 'updatedAt' | 'synced'>): Promise<string> {
    await this.initialize();
    
    const id = `patient_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();
    
    const record: PatientRecord = {
      ...patient,
      id,
      createdAt: now,
      updatedAt: now,
      synced: true
    };

    await kv.set(`patient:${id}`, record);
    await kv.sadd('patients:list', id);
    
    return id;
  }

  async getPatient(id: string): Promise<PatientRecord | null> {
    await this.initialize();
    
    const patient = await kv.get(`patient:${id}`);
    return patient as PatientRecord | null;
  }

  async updatePatient(id: string, updates: Partial<PatientRecord>): Promise<void> {
    await this.initialize();
    
    const existing = await this.getPatient(id);
    if (!existing) {
      throw new Error('Patient not found');
    }

    const updated = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
      synced: true
    };

    await kv.set(`patient:${id}`, updated);
  }

  async deletePatient(id: string): Promise<void> {
    await this.initialize();
    
    await kv.del(`patient:${id}`);
    await kv.srem('patients:list', id);
  }

  async getAllPatients(): Promise<PatientRecord[]> {
    await this.initialize();
    
    const patientIds = await kv.smembers('patients:list');
    const patients = await Promise.all(
      patientIds.map(id => this.getPatient(id as string))
    );
    
    return patients.filter(patient => patient !== null) as PatientRecord[];
  }

  // Doctor operations
  async createDoctor(doctor: Omit<DoctorRecord, 'id' | 'createdAt' | 'updatedAt' | 'synced'>): Promise<string> {
    await this.initialize();
    
    const id = `doctor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();
    
    const record: DoctorRecord = {
      ...doctor,
      id,
      createdAt: now,
      updatedAt: now,
      synced: true
    };

    await kv.set(`doctor:${id}`, record);
    await kv.sadd('doctors:list', id);
    
    return id;
  }

  async getDoctor(id: string): Promise<DoctorRecord | null> {
    await this.initialize();
    
    const doctor = await kv.get(`doctor:${id}`);
    return doctor as DoctorRecord | null;
  }

  async getAllDoctors(): Promise<DoctorRecord[]> {
    await this.initialize();
    
    const doctorIds = await kv.smembers('doctors:list');
    const doctors = await Promise.all(
      doctorIds.map(id => this.getDoctor(id as string))
    );
    
    return doctors.filter(doctor => doctor !== null) as DoctorRecord[];
  }

  // Appointment operations
  async createAppointment(appointment: Omit<AppointmentRecord, 'id' | 'createdAt' | 'updatedAt' | 'synced'>): Promise<string> {
    await this.initialize();
    
    const id = `appointment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();
    
    const record: AppointmentRecord = {
      ...appointment,
      id,
      createdAt: now,
      updatedAt: now,
      synced: true
    };

    await kv.set(`appointment:${id}`, record);
    await kv.sadd('appointments:list', id);
    await kv.sadd(`appointments:patient:${appointment.patientId}`, id);
    await kv.sadd(`appointments:doctor:${appointment.doctorId}`, id);
    
    return id;
  }

  async getAppointment(id: string): Promise<AppointmentRecord | null> {
    await this.initialize();
    
    const appointment = await kv.get(`appointment:${id}`);
    return appointment as AppointmentRecord | null;
  }

  async getAppointmentsByPatient(patientId: string): Promise<AppointmentRecord[]> {
    await this.initialize();
    
    const appointmentIds = await kv.smembers(`appointments:patient:${patientId}`);
    const appointments = await Promise.all(
      appointmentIds.map(id => this.getAppointment(id as string))
    );
    
    return appointments.filter(appointment => appointment !== null) as AppointmentRecord[];
  }

  async getAppointmentsByDoctor(doctorId: string): Promise<AppointmentRecord[]> {
    await this.initialize();
    
    const appointmentIds = await kv.smembers(`appointments:doctor:${doctorId}`);
    const appointments = await Promise.all(
      appointmentIds.map(id => this.getAppointment(id as string))
    );
    
    return appointments.filter(appointment => appointment !== null) as AppointmentRecord[];
  }

  // Chat message operations
  async createChatMessage(message: Omit<ChatMessageRecord, 'id' | 'synced' | 'lastSyncAt'>): Promise<string> {
    await this.initialize();
    
    const id = `message_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const record: ChatMessageRecord = {
      ...message,
      id,
      synced: true
    };

    await kv.set(`chat_message:${id}`, record);
    await kv.lpush(`chat_messages:${message.chatId}`, id);
    
    return id;
  }

  async getChatMessages(chatId: string): Promise<ChatMessageRecord[]> {
    await this.initialize();
    
    const messageIds = await kv.lrange(`chat_messages:${chatId}`, 0, -1);
    const messages = await Promise.all(
      messageIds.map(id => kv.get(`chat_message:${id}`))
    );
    
    return messages.filter(message => message !== null) as ChatMessageRecord[];
  }

  async markMessageAsRead(messageId: string): Promise<void> {
    await this.initialize();
    
    const message = await kv.get(`chat_message:${messageId}`) as ChatMessageRecord;
    if (message) {
      message.read = true;
      await kv.set(`chat_message:${messageId}`, message);
    }
  }

  // Medical history operations
  async createMedicalHistory(record: Omit<MedicalHistoryRecord, 'id' | 'createdAt' | 'updatedAt' | 'synced'>): Promise<string> {
    await this.initialize();
    
    const id = `medical_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();
    
    const medicalRecord: MedicalHistoryRecord = {
      ...record,
      id,
      createdAt: now,
      updatedAt: now,
      synced: true
    };

    await kv.set(`medical_history:${id}`, medicalRecord);
    await kv.sadd(`medical_history:patient:${record.patientId}`, id);
    
    return id;
  }

  async getMedicalHistoryByPatient(patientId: string): Promise<MedicalHistoryRecord[]> {
    await this.initialize();
    
    const recordIds = await kv.smembers(`medical_history:patient:${patientId}`);
    const records = await Promise.all(
      recordIds.map(id => kv.get(`medical_history:${id}`))
    );
    
    return records.filter(record => record !== null) as MedicalHistoryRecord[];
  }

  // Prescription operations
  async createPrescription(prescription: Omit<PrescriptionRecord, 'id' | 'createdAt' | 'updatedAt' | 'synced'>): Promise<string> {
    await this.initialize();
    
    const id = `prescription_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();
    
    const record: PrescriptionRecord = {
      ...prescription,
      id,
      createdAt: now,
      updatedAt: now,
      synced: true
    };

    await kv.set(`prescription:${id}`, record);
    await kv.sadd(`prescriptions:patient:${prescription.patientId}`, id);
    await kv.sadd(`prescriptions:doctor:${prescription.doctorId}`, id);
    
    return id;
  }

  async getPrescriptionsByPatient(patientId: string): Promise<PrescriptionRecord[]> {
    await this.initialize();
    
    const prescriptionIds = await kv.smembers(`prescriptions:patient:${patientId}`);
    const prescriptions = await Promise.all(
      prescriptionIds.map(id => kv.get(`prescription:${id}`))
    );
    
    return prescriptions.filter(prescription => prescription !== null) as PrescriptionRecord[];
  }

  // Utility methods
  async clearAllData(): Promise<void> {
    await this.initialize();
    
    // Clear all keys (use with caution!)
    const keys = await kv.keys('*');
    if (keys.length > 0) {
      await kv.del(...keys);
    }
  }

  async getStats(): Promise<{
    patients: number;
    doctors: number;
    appointments: number;
    messages: number;
  }> {
    await this.initialize();
    
    const [patients, doctors, appointments, messages] = await Promise.all([
      kv.scard('patients:list'),
      kv.scard('doctors:list'),
      kv.scard('appointments:list'),
      kv.keys('chat_message:*').then(keys => keys.length)
    ]);

    return {
      patients: patients || 0,
      doctors: doctors || 0,
      appointments: appointments || 0,
      messages: messages || 0
    };
  }
}

// Export singleton instance
export const vercelDatabaseService = new VercelDatabaseService();
export default vercelDatabaseService;


