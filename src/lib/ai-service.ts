// AI Service for symptom analysis using various AI providers
// Supports Llama 3, OpenAI, and other AI models

export interface SymptomAnalysisRequest {
  mainSymptom: string;
  bodyPart: string;
  duration: string;
  severity: 'Mild' | 'Moderate' | 'Severe';
  additionalSymptoms: string[];
  additionalInfo?: string;
}

export interface SymptomAnalysisResponse {
  conditions: string[];
  recommendation: string;
  seekHelp: string;
  advice: string;
  confidence: number;
  aiModel: string;
}

// Configuration for different AI providers
const AI_CONFIG = {
  llama3: {
    apiUrl: process.env.NEXT_PUBLIC_LLAMA_API_URL || 'https://api.together.xyz/v1/chat/completions',
    model: 'meta-llama/Llama-3.1-8B-Instruct-Turbo',
    apiKey: process.env.NEXT_PUBLIC_LLAMA_API_KEY,
  },
  openai: {
    apiUrl: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-3.5-turbo',
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  },
  gemini: {
    apiUrl: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
    apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY,
  }
};

// Fallback symptom data for when AI is not available
const FALLBACK_SYMPTOM_DATA = {
  "fever": {
    "conditions": ["Common Cold", "Viral Infection", "Malaria", "Typhoid"],
    "recommendation": "Take paracetamol, rest, and drink plenty of fluids.",
    "seekHelp": "Seek medical help if fever > 102°F, lasts more than 5 days, or is accompanied by chills.",
    "advice": "Stay hydrated, wear light clothes, and avoid exertion."
  },
  "cough": {
    "conditions": ["Common Cold", "Bronchitis", "Asthma", "COVID-19"],
    "recommendation": "Use warm fluids, honey-ginger tea, and steam inhalation.",
    "seekHelp": "Seek medical help if cough persists > 2 weeks, is blood-stained, or accompanied by chest pain.",
    "advice": "Avoid cold drinks, stay in clean air, and wear a mask if coughing."
  },
  "headache": {
    "conditions": ["Migraine", "Tension Headache", "Dehydration", "Eye Strain"],
    "recommendation": "Take rest, stay hydrated, and use OTC pain relievers.",
    "seekHelp": "Seek medical help if sudden, severe headache occurs or accompanied by vision changes.",
    "advice": "Avoid stress, take breaks from screens, and maintain regular sleep."
  },
  "stomach pain": {
    "conditions": ["Gastritis", "Indigestion", "Food Poisoning", "Appendicitis"],
    "recommendation": "Eat light meals, avoid spicy food, and drink ORS for hydration.",
    "seekHelp": "Seek medical help if severe pain, vomiting blood, or pain localizes to the right side.",
    "advice": "Eat smaller meals, stay hydrated, and wash hands before eating."
  },
  "chest pain": {
    "conditions": ["Heart Attack", "Angina", "Acid Reflux", "Anxiety"],
    "recommendation": "Rest immediately and avoid physical strain.",
    "seekHelp": "Seek emergency medical help immediately if pain is severe, crushing, or radiates to the arm/jaw.",
    "advice": "Maintain a healthy diet, avoid smoking, and manage stress."
  }
};

function createPrompt(request: SymptomAnalysisRequest): string {
  return `You are a medical AI assistant. Analyze the following symptoms and provide a helpful response. Remember, this is NOT a medical diagnosis and the patient should consult a healthcare professional.

Patient Symptoms:
- Main Symptom: ${request.mainSymptom}
- Affected Body Part: ${request.bodyPart}
- Duration: ${request.duration}
- Severity: ${request.severity}
- Additional Symptoms: ${request.additionalSymptoms.join(', ') || 'None'}
- Additional Info: ${request.additionalInfo || 'None'}

Please provide a response in the following JSON format:
{
  "conditions": ["Possible condition 1", "Possible condition 2"],
  "recommendation": "General recommendation for symptom management",
  "seekHelp": "When to seek medical help",
  "advice": "General health advice",
  "confidence": 0.85
}

Important: 
- Be conservative in your analysis
- Always emphasize that this is not a medical diagnosis
- Suggest seeking professional medical help when appropriate
- Keep recommendations general and safe
- Confidence should be between 0.0 and 1.0`;
}

async function callLlama3API(request: SymptomAnalysisRequest): Promise<SymptomAnalysisResponse> {
  const config = AI_CONFIG.llama3;
  if (!config.apiKey) {
    throw new Error('Llama 3 API key not configured');
  }

  const response = await fetch(config.apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: config.model,
      messages: [
        {
          role: 'system',
          content: 'You are a helpful medical AI assistant. Always remind users that your advice is not a substitute for professional medical consultation.'
        },
        {
          role: 'user',
          content: createPrompt(request)
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    }),
  });

  if (!response.ok) {
    throw new Error(`Llama 3 API error: ${response.statusText}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content;
  
  if (!content) {
    throw new Error('No response from Llama 3 API');
  }

  try {
    const parsed = JSON.parse(content);
    return {
      ...parsed,
      aiModel: 'Llama 3.1',
      confidence: parsed.confidence || 0.7
    };
  } catch (error) {
    // If JSON parsing fails, try to extract information from text
    return {
      conditions: ['Unable to parse AI response'],
      recommendation: 'Please consult a healthcare professional for proper diagnosis.',
      seekHelp: 'Seek medical help for proper evaluation.',
      advice: 'This AI response could not be properly parsed. Please consult a doctor.',
      confidence: 0.1,
      aiModel: 'Llama 3.1'
    };
  }
}

async function callOpenAIAPI(request: SymptomAnalysisRequest): Promise<SymptomAnalysisResponse> {
  const config = AI_CONFIG.openai;
  if (!config.apiKey) {
    throw new Error('OpenAI API key not configured');
  }

  const response = await fetch(config.apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: config.model,
      messages: [
        {
          role: 'system',
          content: 'You are a helpful medical AI assistant. Always remind users that your advice is not a substitute for professional medical consultation.'
        },
        {
          role: 'user',
          content: createPrompt(request)
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content;
  
  if (!content) {
    throw new Error('No response from OpenAI API');
  }

  try {
    const parsed = JSON.parse(content);
    return {
      ...parsed,
      aiModel: 'OpenAI GPT-3.5',
      confidence: parsed.confidence || 0.8
    };
  } catch (error) {
    return {
      conditions: ['Unable to parse AI response'],
      recommendation: 'Please consult a healthcare professional for proper diagnosis.',
      seekHelp: 'Seek medical help for proper evaluation.',
      advice: 'This AI response could not be properly parsed. Please consult a doctor.',
      confidence: 0.1,
      aiModel: 'OpenAI GPT-3.5'
    };
  }
}

function getFallbackAnalysis(request: SymptomAnalysisRequest): SymptomAnalysisResponse {
  const allSymptoms = [request.mainSymptom.toLowerCase(), ...request.additionalSymptoms.map(s => s.toLowerCase())];
  
  for (const symptom of allSymptoms) {
    for (const key in FALLBACK_SYMPTOM_DATA) {
      if (symptom.includes(key)) {
        const data = FALLBACK_SYMPTOM_DATA[key as keyof typeof FALLBACK_SYMPTOM_DATA];
        return {
          ...data,
          confidence: 0.6,
          aiModel: 'Fallback Database'
        };
      }
    }
  }
  
  return {
    conditions: ['General symptoms'],
    recommendation: 'Please consult a healthcare professional for proper diagnosis.',
    seekHelp: 'Seek medical help if symptoms persist or worsen.',
    advice: 'Maintain good hygiene, stay hydrated, and get adequate rest.',
    confidence: 0.3,
    aiModel: 'Fallback Database'
  };
}

export async function analyzeSymptoms(request: SymptomAnalysisRequest): Promise<SymptomAnalysisResponse> {
  // Try Llama 3 first, then OpenAI, then fallback
  try {
    if (AI_CONFIG.llama3.apiKey) {
      return await callLlama3API(request);
    }
  } catch (error) {
    console.warn('Llama 3 API failed:', error);
  }

  try {
    if (AI_CONFIG.openai.apiKey) {
      return await callOpenAIAPI(request);
    }
  } catch (error) {
    console.warn('OpenAI API failed:', error);
  }

  // Fallback to local data
  return getFallbackAnalysis(request);
}

// Utility function to check if AI services are configured
export function getAvailableAIServices(): string[] {
  const services = [];
  if (AI_CONFIG.llama3.apiKey) services.push('Llama 3');
  if (AI_CONFIG.openai.apiKey) services.push('OpenAI');
  if (AI_CONFIG.gemini.apiKey) services.push('Gemini');
  services.push('Fallback Database');
  return services;
}
