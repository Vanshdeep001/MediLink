
export interface Patient {
    fullName: string;
    email: string;
    phone: string;
    age: number;
    role: 'patient';
}

export interface Doctor {
    fullName: string;
    specialization: string;
    address: string;
    city: string;
    pinCode: string;
    phone: string;
}

export interface Pharmacy {
    pharmacyName: string;
    address: string;
    city: string;
    pinCode: string;
    phone: string;
}

export interface Medication {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
}

export interface Prescription {
    id: string;
    patient?: string; // new schema key
    patientName?: string; // backward compat
    doctor?: string; // new schema key
    doctorName?: string; // backward compat
    date: string;
    diagnosis?: string;
    medications: Medication[];
    notes?: string;
}

export interface Reminder {
    id: string;
    patientName: string;
    text: string;
    type: 'custom' | 'prescription';
}

export interface Notification {
    id: string;
    for: 'patient' | 'doctor' | 'pharmacy';
    patientName?: string; // For patient-specific notifications
    message: string;
    read: boolean;
}

export interface Consultation {
    id: string;
    patientName: string;
    doctorName: string;
    specialization: string;
    date: string; // ISO string
    time: string;
    jitsiLink: string;
}
