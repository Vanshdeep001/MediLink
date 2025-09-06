
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
    duration: string;
}

export interface Prescription {
    id: string;
    patientName: string;
    doctorName: string;
    date: string;
    medications: Medication[];
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

    