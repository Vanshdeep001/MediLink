
export interface Patient {
    id?: string;
    fullName: string;
    email: string;
    phone: string;
    age: number;
    role: 'patient';
}

export interface Doctor {
    id?: string;
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
    createdAt: string;
}

export interface Consultation {
    id: string;
    patientName: string;
    doctorName: string;
    specialization: string;
    date: string; // ISO string
    time: string;
    jitsiLink: string;
    roomName?: string;
}

export interface Medicine {
    name: string;
    strength: string;
    manufacturer: string;
    category: string;
    description: string;
    sideEffects: string[];
    contraindications: string[];
    storageInstructions: string;
}

export interface AlternativeMedicine {
    name: string;
    strength: string;
    manufacturer: string;
}

export interface OrderItem {
    medicineId: string;
    medicine: Medicine;
    quantity: number;
    price: number;
    isAvailable: boolean;
    alternativeMedicines?: AlternativeMedicine[];
}

export interface Order {
    id: string;
    patientName: string;
    patientPhone: string;
    patientAddress: string;
    pharmacyId: string;
    pharmacyName: string;
    prescriptionId?: string;
    items: OrderItem[];
    totalAmount: number;
    status: 'pending' | 'accepted' | 'rejected' | 'ready_for_pickup' | 'out_for_delivery' | 'delivered';
    deliveryType: 'pickup' | 'home_delivery';
    deliveryAddress?: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface PrescriptionOrder {
    prescriptionId: string;
    doctorName: string;
    medications: Medication[];
    status: 'pending' | 'ordered' | 'completed';
    createdAt: string;
    updatedAt: string;
}
