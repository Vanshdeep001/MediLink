// Lightweight DHID service: generation, persistence, retrieval
// Frontend-only; stores data in localStorage

export type PatientRecord = {
    id: string;
    name: string;
    dob: string;
    medicalHistory: string[];
    digitalHealthId: string;
    dhidCreatedAt: string;
};

const STORAGE_KEY = 'medilink_patient_records';

function getAllRecords(): PatientRecord[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function saveAllRecords(records: PatientRecord[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

function randomAlphanumeric(length: number): string {
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const array = new Uint32Array(length);
    crypto.getRandomValues(array);
    let out = '';
    for (let i = 0; i < length; i++) {
        out += alphabet[array[i] % alphabet.length];
    }
    return out;
}

function computeChecksum(input: string): string {
    // Simple Luhn-like checksum over char codes to add a check digit
    let sum = 0;
    for (let i = 0; i < input.length; i++) {
        const n = input.charCodeAt(i);
        if (i % 2 === 0) {
            let d = n * 2;
            d = Math.floor(d / 10) + (d % 10);
            sum += d;
        } else {
            sum += n;
        }
    }
    const check = (10 - (sum % 10)) % 10;
    return String(check);
}

function generateDHIDCandidate(): string {
    const base = randomAlphanumeric(16);
    const check = computeChecksum(base);
    // Grouping for readability: XXXX-XXXX-XXXX-XXXX-C
    const grouped = `${base.slice(0,4)}-${base.slice(4,8)}-${base.slice(8,12)}-${base.slice(12,16)}-${check}`;
    return grouped;
}

function isUniqueDhid(dhid: string, records: PatientRecord[]): boolean {
    return !records.some(r => r.digitalHealthId === dhid);
}

export function ensurePatientRecord(
    params: { id: string; name: string; dob: string; medicalHistory?: string[] }
): PatientRecord {
    const records = getAllRecords();
    const existing = records.find(r => r.id === params.id || (r.name === params.name && r.dob === params.dob));
    if (existing) {
        return existing;
    }
    // Create new with DHID
    const createdAt = new Date().toISOString();
    let dhid = generateDHIDCandidate();
    let attempts = 0;
    while (!isUniqueDhid(dhid, records) && attempts < 5) {
        dhid = generateDHIDCandidate();
        attempts++;
    }
    const record: PatientRecord = {
        id: params.id,
        name: params.name,
        dob: params.dob,
        medicalHistory: params.medicalHistory || [],
        digitalHealthId: dhid,
        dhidCreatedAt: createdAt,
    };
    records.push(record);
    saveAllRecords(records);
    return record;
}

export function getPatientRecordByNameDob(name: string, dob: string): PatientRecord | null {
    const records = getAllRecords();
    return records.find(r => r.name === name && r.dob === dob) || null;
}

export function getPatientRecordById(id: string): PatientRecord | null {
    const records = getAllRecords();
    return records.find(r => r.id === id) || null;
}

export function upsertPatientRecord(record: PatientRecord): void {
    const records = getAllRecords();
    const idx = records.findIndex(r => r.id === record.id);
    if (idx >= 0) {
        records[idx] = record;
    } else {
        records.push(record);
    }
    saveAllRecords(records);
}

export function copyTextToClipboard(text: string): Promise<void> {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(text);
    }
    return new Promise((resolve, reject) => {
        try {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.focus();
            textarea.select();
            const ok = document.execCommand('copy');
            document.body.removeChild(textarea);
            if (ok) resolve(); else reject(new Error('Copy failed'));
        } catch (e) {
            reject(e as Error);
        }
    });
}

