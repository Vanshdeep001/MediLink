// Local Doctor Database for Symptom Checker
export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  availability: 'Available' | 'Busy' | 'Offline';
  phone: string;
  experience: string;
  rating: number;
  consultationFee: number;
  languages: string[];
  location: string;
}

export interface OTCMedicine {
  name: string;
  purpose: string;
  dosage: string;
  precautions: string;
}

export interface SeverityMapping {
  symptoms: string[];
  severity: 'Mild' | 'Moderate' | 'Severe';
  specialization: string;
  otcMedicines?: OTCMedicine[];
}

// Mock Doctor Database
export const doctorsDatabase: Doctor[] = [
  {
    id: 'doc_001',
    name: 'Dr. Neha Kaur',
    specialization: 'Internal Medicine',
    availability: 'Available',
    phone: '+91-9876543210',
    experience: '8 years',
    rating: 4.8,
    consultationFee: 500,
    languages: ['English', 'Hindi', 'Punjabi'],
    location: 'Delhi'
  },
  {
    id: 'doc_002',
    name: 'Dr. Rajesh Kumar',
    specialization: 'Cardiology',
    availability: 'Available',
    phone: '+91-9876543211',
    experience: '12 years',
    rating: 4.9,
    consultationFee: 800,
    languages: ['English', 'Hindi'],
    location: 'Mumbai'
  },
  {
    id: 'doc_003',
    name: 'Dr. Priya Sharma',
    specialization: 'Pediatrics',
    availability: 'Busy',
    phone: '+91-9876543212',
    experience: '6 years',
    rating: 4.7,
    consultationFee: 400,
    languages: ['English', 'Hindi', 'Tamil'],
    location: 'Chennai'
  },
  {
    id: 'doc_004',
    name: 'Dr. Amit Singh',
    specialization: 'Dermatology',
    availability: 'Available',
    phone: '+91-9876543213',
    experience: '10 years',
    rating: 4.6,
    consultationFee: 600,
    languages: ['English', 'Hindi', 'Punjabi'],
    location: 'Pune'
  },
  {
    id: 'doc_005',
    name: 'Dr. Sunita Patel',
    specialization: 'Gynecology',
    availability: 'Available',
    phone: '+91-9876543214',
    experience: '15 years',
    rating: 4.9,
    consultationFee: 700,
    languages: ['English', 'Hindi', 'Gujarati'],
    location: 'Ahmedabad'
  },
  {
    id: 'doc_006',
    name: 'Dr. Vikram Reddy',
    specialization: 'Orthopedics',
    availability: 'Offline',
    phone: '+91-9876543215',
    experience: '14 years',
    rating: 4.8,
    consultationFee: 900,
    languages: ['English', 'Hindi', 'Telugu'],
    location: 'Hyderabad'
  },
  {
    id: 'doc_007',
    name: 'Dr. Anjali Mehta',
    specialization: 'Neurology',
    availability: 'Available',
    phone: '+91-9876543216',
    experience: '11 years',
    rating: 4.7,
    consultationFee: 1000,
    languages: ['English', 'Hindi'],
    location: 'Bangalore'
  },
  {
    id: 'doc_008',
    name: 'Dr. Ravi Gupta',
    specialization: 'Psychiatry',
    availability: 'Available',
    phone: '+91-9876543217',
    experience: '9 years',
    rating: 4.5,
    consultationFee: 600,
    languages: ['English', 'Hindi', 'Punjabi'],
    location: 'Chandigarh'
  }
];

// OTC Medicines Database
export const otcMedicines: OTCMedicine[] = [
  {
    name: 'Paracetamol',
    purpose: 'Fever and pain relief',
    dosage: '500mg tablet, 1-2 tablets every 6-8 hours',
    precautions: 'Do not exceed 4g per day. Avoid with liver problems.'
  },
  {
    name: 'ORS (Oral Rehydration Solution)',
    purpose: 'Dehydration and electrolyte balance',
    dosage: '1 sachet in 200ml water, drink as needed',
    precautions: 'Use clean water. Store prepared solution for max 24 hours.'
  },
  {
    name: 'Antacids',
    purpose: 'Acidity and heartburn relief',
    dosage: '1-2 tablets after meals or as needed',
    precautions: 'Do not use for more than 2 weeks without consulting doctor.'
  },
  {
    name: 'Cough Syrup (Dextromethorphan)',
    purpose: 'Dry cough relief',
    dosage: '10-15ml every 4-6 hours',
    precautions: 'Not for children under 4 years. Avoid with other cough medicines.'
  },
  {
    name: 'Antihistamines',
    purpose: 'Allergy and cold symptoms',
    dosage: 'As per package instructions',
    precautions: 'May cause drowsiness. Avoid driving after taking.'
  },
  {
    name: 'Topical Antiseptic',
    purpose: 'Minor cuts and wounds',
    dosage: 'Apply 2-3 times daily',
    precautions: 'For external use only. Clean wound before application.'
  }
];

// Symptom to Specialization Mapping
export const symptomSpecializationMap: Record<string, string> = {
  // Internal Medicine
  'fever': 'Internal Medicine',
  'fatigue': 'Internal Medicine',
  'nausea': 'Internal Medicine',
  'vomiting': 'Internal Medicine',
  'diarrhea': 'Internal Medicine',
  'constipation': 'Internal Medicine',
  'abdominal pain': 'Internal Medicine',
  'chest pain': 'Internal Medicine',
  'shortness of breath': 'Internal Medicine',
  
  // Cardiology
  'heart palpitations': 'Cardiology',
  'chest tightness': 'Cardiology',
  'irregular heartbeat': 'Cardiology',
  
  // Pediatrics
  'child fever': 'Pediatrics',
  'child cough': 'Pediatrics',
  'child rash': 'Pediatrics',
  
  // Dermatology
  'skin rash': 'Dermatology',
  'skin irritation': 'Dermatology',
  'acne': 'Dermatology',
  'eczema': 'Dermatology',
  
  // Gynecology
  'menstrual pain': 'Gynecology',
  'irregular periods': 'Gynecology',
  'pregnancy symptoms': 'Gynecology',
  
  // Orthopedics
  'joint pain': 'Orthopedics',
  'back pain': 'Orthopedics',
  'muscle pain': 'Orthopedics',
  'bone pain': 'Orthopedics',
  
  // Neurology
  'headache': 'Neurology',
  'dizziness': 'Neurology',
  'seizures': 'Neurology',
  'memory problems': 'Neurology',
  
  // Psychiatry
  'anxiety': 'Psychiatry',
  'depression': 'Psychiatry',
  'sleep problems': 'Psychiatry',
  'mood changes': 'Psychiatry'
};

// Severity Analysis Function
export function analyzeSeverity(symptoms: string[], severity: string): 'Mild' | 'Moderate' | 'Severe' {
  const severeKeywords = ['severe', 'intense', 'unbearable', 'emergency', 'critical'];
  const moderateKeywords = ['moderate', 'noticeable', 'concerning', 'persistent'];
  
  const symptomText = symptoms.join(' ').toLowerCase();
  
  if (severity === 'Severe' || severeKeywords.some(keyword => symptomText.includes(keyword))) {
    return 'Severe';
  } else if (severity === 'Moderate' || moderateKeywords.some(keyword => symptomText.includes(keyword))) {
    return 'Moderate';
  } else {
    return 'Mild';
  }
}

// Get Recommended Doctor
export function getRecommendedDoctor(symptoms: string[], severity: 'Mild' | 'Moderate' | 'Severe'): Doctor | null {
  // Find specialization based on symptoms
  let specialization = 'Internal Medicine'; // Default
  
  for (const symptom of symptoms) {
    const mappedSpecialization = symptomSpecializationMap[symptom.toLowerCase()];
    if (mappedSpecialization) {
      specialization = mappedSpecialization;
      break;
    }
  }
  
  // For severe cases, prioritize available doctors
  const availableDoctors = doctorsDatabase.filter(doc => 
    doc.specialization === specialization && 
    (severity === 'Severe' ? doc.availability === 'Available' : doc.availability !== 'Offline')
  );
  
  if (availableDoctors.length === 0) {
    // Fallback to any available doctor
    const fallbackDoctors = doctorsDatabase.filter(doc => doc.availability === 'Available');
    return fallbackDoctors[0] || null;
  }
  
  // Return the first available doctor (could be enhanced with rating/experience priority)
  return availableDoctors[0];
}

// Get OTC Medicines for symptoms
export function getOTCMedicines(symptoms: string[], severity: 'Mild' | 'Moderate' | 'Severe'): OTCMedicine[] {
  if (severity === 'Severe') {
    return []; // No OTC for severe cases
  }
  
  const recommendedMedicines: OTCMedicine[] = [];
  const symptomText = symptoms.join(' ').toLowerCase();
  
  // Map symptoms to OTC medicines
  if (symptomText.includes('fever') || symptomText.includes('pain')) {
    recommendedMedicines.push(otcMedicines[0]); // Paracetamol
  }
  
  if (symptomText.includes('dehydration') || symptomText.includes('diarrhea') || symptomText.includes('vomiting')) {
    recommendedMedicines.push(otcMedicines[1]); // ORS
  }
  
  if (symptomText.includes('acidity') || symptomText.includes('heartburn') || symptomText.includes('stomach')) {
    recommendedMedicines.push(otcMedicines[2]); // Antacids
  }
  
  if (symptomText.includes('cough')) {
    recommendedMedicines.push(otcMedicines[3]); // Cough Syrup
  }
  
  if (symptomText.includes('allergy') || symptomText.includes('cold') || symptomText.includes('sneezing')) {
    recommendedMedicines.push(otcMedicines[4]); // Antihistamines
  }
  
  if (symptomText.includes('cut') || symptomText.includes('wound') || symptomText.includes('injury')) {
    recommendedMedicines.push(otcMedicines[5]); // Antiseptic
  }
  
  return recommendedMedicines;
}











