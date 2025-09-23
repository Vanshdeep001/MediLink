// ML Optimization Service for disease prediction and drug recommendations
import { analyzeSymptoms } from './ai-service';

export interface SymptomData {
  symptoms: string[];
  severity: 'mild' | 'moderate' | 'severe';
  duration: number; // in days
  age: number;
  gender: 'male' | 'female' | 'other';
  medicalHistory: string[];
  allergies: string[];
  currentMedications: string[];
  vitalSigns?: {
    temperature?: number;
    bloodPressure?: { systolic: number; diastolic: number };
    heartRate?: number;
    respiratoryRate?: number;
    oxygenSaturation?: number;
  };
}

export interface DiseasePrediction {
  disease: string;
  probability: number;
  confidence: 'low' | 'medium' | 'high';
  symptoms: string[];
  description: string;
  severity: 'mild' | 'moderate' | 'severe';
  urgency: 'low' | 'medium' | 'high' | 'critical';
  recommendedActions: string[];
  warningSigns: string[];
}

export interface DrugRecommendation {
  drugName: string;
  genericName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  sideEffects: string[];
  contraindications: string[];
  interactions: string[];
  alternatives: string[];
  cost: {
    generic: number;
    brand: number;
    insurance: number;
  };
  availability: {
    inStock: boolean;
    nearbyPharmacies: string[];
  };
}

export interface MLModelConfig {
  modelVersion: string;
  lastUpdated: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  trainingDataSize: number;
  features: string[];
}

export interface PredictionCache {
  [key: string]: {
    prediction: DiseasePrediction[];
    timestamp: number;
    ttl: number; // time to live in milliseconds
  };
}

class MLOptimizationService {
  private predictionCache: PredictionCache = {};
  private modelConfig: MLModelConfig;
  private isInitialized: boolean = false;
  private cacheHitRate: number = 0;
  private totalRequests: number = 0;
  private cacheHits: number = 0;

  // Disease prediction models (simplified for demo)
  private diseaseModels = {
    'respiratory': {
      diseases: ['common_cold', 'flu', 'bronchitis', 'pneumonia', 'asthma', 'covid19'],
      symptoms: ['cough', 'fever', 'shortness_of_breath', 'chest_pain', 'sore_throat', 'runny_nose'],
      weights: {
        'common_cold': 0.8,
        'flu': 0.7,
        'bronchitis': 0.6,
        'pneumonia': 0.5,
        'asthma': 0.4,
        'covid19': 0.3
      }
    },
    'cardiovascular': {
      diseases: ['hypertension', 'heart_disease', 'stroke', 'arrhythmia', 'angina'],
      symptoms: ['chest_pain', 'shortness_of_breath', 'dizziness', 'fatigue', 'swelling'],
      weights: {
        'hypertension': 0.7,
        'heart_disease': 0.6,
        'stroke': 0.4,
        'arrhythmia': 0.5,
        'angina': 0.6
      }
    },
    'gastrointestinal': {
      diseases: ['gastritis', 'ulcer', 'ibs', 'crohns', 'colitis', 'food_poisoning'],
      symptoms: ['abdominal_pain', 'nausea', 'vomiting', 'diarrhea', 'constipation', 'bloating'],
      weights: {
        'gastritis': 0.7,
        'ulcer': 0.6,
        'ibs': 0.5,
        'crohns': 0.4,
        'colitis': 0.4,
        'food_poisoning': 0.8
      }
    },
    'neurological': {
      diseases: ['migraine', 'tension_headache', 'epilepsy', 'parkinsons', 'alzheimers'],
      symptoms: ['headache', 'dizziness', 'confusion', 'memory_loss', 'seizures', 'tremors'],
      weights: {
        'migraine': 0.8,
        'tension_headache': 0.7,
        'epilepsy': 0.5,
        'parkinsons': 0.3,
        'alzheimers': 0.2
      }
    }
  };

  // Drug database (simplified)
  private drugDatabase = {
    'common_cold': [
      {
        drugName: 'Acetaminophen',
        genericName: 'Paracetamol',
        dosage: '500mg',
        frequency: 'Every 6 hours',
        duration: '3-5 days',
        instructions: 'Take with food to avoid stomach upset',
        sideEffects: ['Nausea', 'Liver damage (overdose)'],
        contraindications: ['Liver disease', 'Alcoholism'],
        interactions: ['Warfarin', 'Alcohol'],
        alternatives: ['Ibuprofen', 'Aspirin'],
        cost: { generic: 5, brand: 15, insurance: 2 },
        availability: { inStock: true, nearbyPharmacies: ['CVS', 'Walgreens'] }
      }
    ],
    'flu': [
      {
        drugName: 'Oseltamivir',
        genericName: 'Tamiflu',
        dosage: '75mg',
        frequency: 'Twice daily',
        duration: '5 days',
        instructions: 'Start within 48 hours of symptoms',
        sideEffects: ['Nausea', 'Vomiting', 'Headache'],
        contraindications: ['Kidney disease'],
        interactions: ['Probenecid'],
        alternatives: ['Zanamivir', 'Baloxavir'],
        cost: { generic: 50, brand: 100, insurance: 20 },
        availability: { inStock: true, nearbyPharmacies: ['CVS', 'Walgreens'] }
      }
    ]
  };

  constructor() {
    this.modelConfig = {
      modelVersion: '1.2.0',
      lastUpdated: new Date().toISOString(),
      accuracy: 0.87,
      precision: 0.85,
      recall: 0.89,
      f1Score: 0.87,
      trainingDataSize: 100000,
      features: ['symptoms', 'severity', 'duration', 'age', 'gender', 'medical_history', 'vital_signs']
    };
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Load model configuration
      await this.loadModelConfig();
      
      // Warm up the cache
      await this.warmUpCache();
      
      this.isInitialized = true;
      console.log('ML Optimization Service initialized');
    } catch (error) {
      console.error('Failed to initialize ML service:', error);
      throw error;
    }
  }

  private async loadModelConfig(): Promise<void> {
    // In a real implementation, this would load from a model registry
    // For now, we'll use the default configuration
    console.log('Model configuration loaded:', this.modelConfig);
  }

  private async warmUpCache(): Promise<void> {
    // Pre-load common predictions into cache
    const commonSymptoms = [
      ['fever', 'cough', 'headache'],
      ['chest_pain', 'shortness_of_breath'],
      ['abdominal_pain', 'nausea', 'vomiting'],
      ['headache', 'dizziness']
    ];

    for (const symptoms of commonSymptoms) {
      const cacheKey = this.generateCacheKey({ symptoms } as SymptomData);
      if (!this.predictionCache[cacheKey]) {
        // Pre-compute predictions for common cases
        const predictions = await this.predictDiseases({ symptoms } as SymptomData);
        this.predictionCache[cacheKey] = {
          prediction: predictions,
          timestamp: Date.now(),
          ttl: 30 * 60 * 1000 // 30 minutes
        };
      }
    }
  }

  async predictDiseases(symptomData: SymptomData): Promise<DiseasePrediction[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const cacheKey = this.generateCacheKey(symptomData);
    
    // Check cache first
    if (this.predictionCache[cacheKey]) {
      const cached = this.predictionCache[cacheKey];
      if (Date.now() - cached.timestamp < cached.ttl) {
        this.cacheHits++;
        this.totalRequests++;
        this.cacheHitRate = this.cacheHits / this.totalRequests;
        return cached.prediction;
      } else {
        // Cache expired
        delete this.predictionCache[cacheKey];
      }
    }

    this.totalRequests++;

    try {
      // Use AI service for initial analysis
      const aiAnalysis = await analyzeSymptoms({
        mainSymptom: symptomData.symptoms[0] || 'General symptoms',
        bodyPart: 'general',
        duration: symptomData.duration.toString(),
        severity: 'Moderate',
        additionalSymptoms: symptomData.symptoms.slice(1),
        additionalInfo: `Age: ${symptomData.age}, Gender: ${symptomData.gender}, Medical History: ${symptomData.medicalHistory.join(', ')}`
      });

      // Enhance with ML models
      const predictions = await this.enhanceWithMLModels(symptomData, aiAnalysis);

      // Cache the results
      this.predictionCache[cacheKey] = {
        prediction: predictions,
        timestamp: Date.now(),
        ttl: 30 * 60 * 1000 // 30 minutes
      };

      return predictions;
    } catch (error) {
      console.error('Error predicting diseases:', error);
      // Fallback to basic prediction
      return this.getBasicPredictions(symptomData);
    }
  }

  private async enhanceWithMLModels(symptomData: SymptomData, aiAnalysis: any): Promise<DiseasePrediction[]> {
    const predictions: DiseasePrediction[] = [];

    // Analyze each category
    for (const [category, model] of Object.entries(this.diseaseModels)) {
      const categoryPredictions = this.analyzeCategory(symptomData, model);
      predictions.push(...categoryPredictions);
    }

    // Sort by probability and confidence
    predictions.sort((a, b) => {
      if (a.confidence === b.confidence) {
        return b.probability - a.probability;
      }
      return this.getConfidenceScore(b.confidence) - this.getConfidenceScore(a.confidence);
    });

    // Return top 5 predictions
    return predictions.slice(0, 5);
  }

  private analyzeCategory(symptomData: SymptomData, model: any): DiseasePrediction[] {
    const predictions: DiseasePrediction[] = [];
    const symptomMatches = this.calculateSymptomMatches(symptomData.symptoms, model.symptoms);

    for (const disease of model.diseases) {
      const baseWeight = model.weights[disease] || 0.5;
      const probability = this.calculateProbability(symptomData, disease, baseWeight, symptomMatches);
      
      if (probability > 0.3) { // Only include predictions above threshold
        predictions.push({
          disease: this.formatDiseaseName(disease),
          probability,
          confidence: this.calculateConfidence(probability, symptomMatches),
          symptoms: this.getDiseaseSymptoms(disease),
          description: this.getDiseaseDescription(disease),
          severity: this.calculateSeverity(symptomData, disease),
          urgency: this.calculateUrgency(symptomData, disease),
          recommendedActions: this.getRecommendedActions(disease),
          warningSigns: this.getWarningSigns(disease)
        });
      }
    }

    return predictions;
  }

  private calculateSymptomMatches(userSymptoms: string[], modelSymptoms: string[]): number {
    const matches = userSymptoms.filter(symptom => 
      modelSymptoms.some(modelSymptom => 
        this.symptomsMatch(symptom, modelSymptom)
      )
    ).length;
    
    return matches / modelSymptoms.length;
  }

  private symptomsMatch(userSymptom: string, modelSymptom: string): boolean {
    // Simple string matching - in production, use NLP techniques
    const user = userSymptom.toLowerCase().replace(/[^a-z]/g, '');
    const model = modelSymptom.toLowerCase().replace(/[^a-z]/g, '');
    
    return user.includes(model) || model.includes(user) || 
           this.getSymptomSynonyms(user).some(synonym => 
             this.getSymptomSynonyms(model).includes(synonym)
           );
  }

  private getSymptomSynonyms(symptom: string): string[] {
    const synonyms: { [key: string]: string[] } = {
      'fever': ['temperature', 'hot', 'burning'],
      'cough': ['coughing', 'hack'],
      'headache': ['head_pain', 'migraine'],
      'chest_pain': ['chest_ache', 'heart_pain'],
      'shortness_of_breath': ['breathing_difficulty', 'dyspnea'],
      'abdominal_pain': ['stomach_pain', 'belly_ache'],
      'nausea': ['sick', 'queasy'],
      'vomiting': ['throwing_up', 'puking'],
      'dizziness': ['lightheaded', 'vertigo']
    };
    
    return synonyms[symptom] || [symptom];
  }

  private calculateProbability(symptomData: SymptomData, disease: string, baseWeight: number, symptomMatches: number): number {
    let probability = baseWeight * symptomMatches;
    
    // Adjust based on age
    probability *= this.getAgeFactor(symptomData.age, disease);
    
    // Adjust based on gender
    probability *= this.getGenderFactor(symptomData.gender, disease);
    
    // Adjust based on duration
    probability *= this.getDurationFactor(symptomData.duration, disease);
    
    // Adjust based on medical history
    probability *= this.getMedicalHistoryFactor(symptomData.medicalHistory, disease);
    
    // Adjust based on vital signs
    if (symptomData.vitalSigns) {
      probability *= this.getVitalSignsFactor(symptomData.vitalSigns, disease);
    }
    
    return Math.min(probability, 1.0);
  }

  private getAgeFactor(age: number, disease: string): number {
    const ageFactors: { [key: string]: { min: number; max: number; factor: number } } = {
      'covid19': { min: 0, max: 100, factor: 1.0 },
      'flu': { min: 0, max: 100, factor: 1.0 },
      'heart_disease': { min: 50, max: 100, factor: 1.5 },
      'stroke': { min: 60, max: 100, factor: 1.8 },
      'alzheimers': { min: 65, max: 100, factor: 2.0 }
    };
    
    const factor = ageFactors[disease];
    if (!factor) return 1.0;
    
    if (age >= factor.min && age <= factor.max) {
      return factor.factor;
    }
    
    return 0.5; // Lower probability for age groups not typically affected
  }

  private getGenderFactor(gender: string, disease: string): number {
    const genderFactors: { [key: string]: { male: number; female: number; other: number } } = {
      'heart_disease': { male: 1.5, female: 1.0, other: 1.2 },
      'migraine': { male: 0.7, female: 1.3, other: 1.0 },
      'autoimmune': { male: 0.8, female: 1.2, other: 1.0 }
    };
    
    const factor = genderFactors[disease];
    if (!factor) return 1.0;
    
    return factor[gender as keyof typeof factor] || 1.0;
  }

  private getDurationFactor(duration: number, disease: string): number {
    const durationFactors: { [key: string]: { acute: number; chronic: number } } = {
      'common_cold': { acute: 1.5, chronic: 0.3 },
      'flu': { acute: 1.8, chronic: 0.2 },
      'bronchitis': { acute: 1.2, chronic: 0.8 },
      'ibs': { acute: 0.3, chronic: 1.5 }
    };
    
    const factor = durationFactors[disease];
    if (!factor) return 1.0;
    
    const isAcute = duration <= 7;
    return isAcute ? factor.acute : factor.chronic;
  }

  private getMedicalHistoryFactor(medicalHistory: string[], disease: string): number {
    const historyFactors: { [key: string]: string[] } = {
      'heart_disease': ['hypertension', 'diabetes', 'high_cholesterol'],
      'stroke': ['hypertension', 'diabetes', 'heart_disease'],
      'diabetes': ['obesity', 'family_history_diabetes'],
      'asthma': ['allergies', 'eczema', 'family_history_asthma']
    };
    
    const relevantHistory = historyFactors[disease] || [];
    const matches = medicalHistory.filter(condition => 
      relevantHistory.some(rel => this.symptomsMatch(condition, rel))
    ).length;
    
    return 1.0 + (matches * 0.3);
  }

  private getVitalSignsFactor(vitalSigns: any, disease: string): number {
    let factor = 1.0;
    
    // Temperature factors
    if (vitalSigns.temperature) {
      if (disease.includes('fever') || disease.includes('infection')) {
        factor *= vitalSigns.temperature > 100.4 ? 1.5 : 0.8;
      }
    }
    
    // Blood pressure factors
    if (vitalSigns.bloodPressure) {
      const { systolic, diastolic } = vitalSigns.bloodPressure;
      if (disease.includes('heart') || disease.includes('stroke')) {
        factor *= (systolic > 140 || diastolic > 90) ? 1.3 : 0.9;
      }
    }
    
    // Heart rate factors
    if (vitalSigns.heartRate) {
      if (disease.includes('heart') || disease.includes('anxiety')) {
        factor *= (vitalSigns.heartRate > 100) ? 1.2 : 0.9;
      }
    }
    
    return factor;
  }

  private calculateConfidence(probability: number, symptomMatches: number): 'low' | 'medium' | 'high' {
    if (probability > 0.8 && symptomMatches > 0.7) return 'high';
    if (probability > 0.6 && symptomMatches > 0.5) return 'medium';
    return 'low';
  }

  private calculateSeverity(symptomData: SymptomData, disease: string): 'mild' | 'moderate' | 'severe' {
    const severityFactors = {
      'mild': ['common_cold', 'tension_headache', 'gastritis'],
      'moderate': ['flu', 'bronchitis', 'migraine', 'ibs'],
      'severe': ['pneumonia', 'heart_disease', 'stroke', 'covid19']
    };
    
    for (const [severity, diseases] of Object.entries(severityFactors)) {
      if (diseases.includes(disease)) {
        return severity as 'mild' | 'moderate' | 'severe';
      }
    }
    
    return 'moderate';
  }

  private calculateUrgency(symptomData: SymptomData, disease: string): 'low' | 'medium' | 'high' | 'critical' {
    const urgencyFactors = {
      'low': ['common_cold', 'tension_headache'],
      'medium': ['flu', 'bronchitis', 'migraine'],
      'high': ['pneumonia', 'heart_disease', 'asthma'],
      'critical': ['stroke', 'covid19', 'severe_allergic_reaction']
    };
    
    for (const [urgency, diseases] of Object.entries(urgencyFactors)) {
      if (diseases.includes(disease)) {
        return urgency as 'low' | 'medium' | 'high' | 'critical';
      }
    }
    
    return 'medium';
  }

  private getDiseaseSymptoms(disease: string): string[] {
    const diseaseSymptoms: { [key: string]: string[] } = {
      'common_cold': ['runny_nose', 'sneezing', 'sore_throat', 'cough'],
      'flu': ['fever', 'body_aches', 'fatigue', 'cough', 'headache'],
      'covid19': ['fever', 'cough', 'shortness_of_breath', 'loss_of_taste', 'loss_of_smell'],
      'heart_disease': ['chest_pain', 'shortness_of_breath', 'fatigue', 'swelling'],
      'stroke': ['sudden_weakness', 'speech_difficulty', 'vision_problems', 'severe_headache']
    };
    
    return diseaseSymptoms[disease] || [];
  }

  private getDiseaseDescription(disease: string): string {
    const descriptions: { [key: string]: string } = {
      'common_cold': 'A viral infection of the upper respiratory tract',
      'flu': 'A contagious respiratory illness caused by influenza viruses',
      'covid19': 'A respiratory illness caused by the SARS-CoV-2 virus',
      'heart_disease': 'A range of conditions that affect the heart',
      'stroke': 'A medical emergency that occurs when blood flow to the brain is interrupted'
    };
    
    return descriptions[disease] || 'A medical condition that may require attention';
  }

  private getRecommendedActions(disease: string): string[] {
    const actions: { [key: string]: string[] } = {
      'common_cold': ['Rest', 'Stay hydrated', 'Use humidifier', 'Over-the-counter medications'],
      'flu': ['Rest', 'Stay hydrated', 'Antiviral medication if early', 'Monitor symptoms'],
      'covid19': ['Isolate', 'Monitor symptoms', 'Seek medical attention if severe', 'Follow public health guidelines'],
      'heart_disease': ['Seek immediate medical attention', 'Avoid physical exertion', 'Take prescribed medications'],
      'stroke': ['Call emergency services immediately', 'Note time of onset', 'Do not drive to hospital']
    };
    
    return actions[disease] || ['Consult with a healthcare provider'];
  }

  private getWarningSigns(disease: string): string[] {
    const warningSigns: { [key: string]: string[] } = {
      'common_cold': ['High fever', 'Difficulty breathing', 'Symptoms lasting more than 10 days'],
      'flu': ['High fever', 'Difficulty breathing', 'Chest pain', 'Severe weakness'],
      'covid19': ['Difficulty breathing', 'Persistent chest pain', 'Confusion', 'Bluish lips'],
      'heart_disease': ['Chest pain', 'Shortness of breath', 'Nausea', 'Cold sweat'],
      'stroke': ['Sudden numbness', 'Confusion', 'Trouble speaking', 'Severe headache']
    };
    
    return warningSigns[disease] || ['Worsening symptoms', 'New symptoms'];
  }

  private formatDiseaseName(disease: string): string {
    return disease.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  private getBasicPredictions(symptomData: SymptomData): DiseasePrediction[] {
    // Fallback predictions when ML models fail
    return [
      {
        disease: 'General Illness',
        probability: 0.5,
        confidence: 'low',
        symptoms: symptomData.symptoms,
        description: 'A general medical condition requiring evaluation',
        severity: symptomData.severity,
        urgency: 'medium',
        recommendedActions: ['Consult with a healthcare provider', 'Monitor symptoms'],
        warningSigns: ['Worsening symptoms', 'New symptoms']
      }
    ];
  }

  async getDrugRecommendations(disease: string, patientProfile: any): Promise<DrugRecommendation[]> {
    const drugs = (this.drugDatabase as any)[disease] || [];
    
    // Filter based on patient profile
    return drugs.filter((drug: any) => {
      // Check contraindications
      if (patientProfile.allergies) {
        const hasAllergy = drug.contraindications.some((contraindication: string) =>
          patientProfile.allergies.some((allergy: string) =>
            this.symptomsMatch(allergy, contraindication)
          )
        );
        if (hasAllergy) return false;
      }
      
      // Check interactions with current medications
      if (patientProfile.currentMedications) {
        const hasInteraction = drug.interactions.some((interaction: string) =>
          patientProfile.currentMedications.some((med: string) =>
            this.symptomsMatch(med, interaction)
          )
        );
        if (hasInteraction) return false;
      }
      
      return true;
    });
  }

  private generateCacheKey(symptomData: SymptomData): string {
    const key = {
      symptoms: symptomData.symptoms.sort(),
      age: symptomData.age,
      gender: symptomData.gender,
      severity: symptomData.severity,
      duration: symptomData.duration
    };
    
    return btoa(JSON.stringify(key));
  }

  private getConfidenceScore(confidence: string): number {
    const scores = { 'low': 1, 'medium': 2, 'high': 3 };
    return scores[confidence as keyof typeof scores] || 1;
  }

  // Performance metrics
  getPerformanceMetrics() {
    return {
      cacheHitRate: this.cacheHitRate,
      totalRequests: this.totalRequests,
      cacheHits: this.cacheHits,
      modelConfig: this.modelConfig
    };
  }

  // Cache management
  clearCache(): void {
    this.predictionCache = {};
    this.cacheHits = 0;
    this.totalRequests = 0;
    this.cacheHitRate = 0;
  }

  getCacheSize(): number {
    return Object.keys(this.predictionCache).length;
  }

  // Cleanup
  destroy(): void {
    this.clearCache();
    this.isInitialized = false;
  }
}

// Export singleton instance
export const mlOptimizationService = new MLOptimizationService();
export default mlOptimizationService;

