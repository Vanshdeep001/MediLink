# AI Integration Guide

This MediLink application now includes AI-powered symptom analysis using multiple AI providers including Llama 3.

## Features

- **Multi-AI Support**: Supports Llama 3, OpenAI GPT, and Google Gemini
- **Fallback System**: Works even without API keys using local symptom database
- **Confidence Scoring**: Shows AI confidence levels for each analysis
- **Model Transparency**: Displays which AI model was used for analysis

## Setup

### 1. Environment Variables

Copy `env.example` to `.env.local` and add your API keys:

```bash
cp env.example .env.local
```

### 2. API Keys

#### Option A: Llama 3 (Recommended)
- Sign up at [Together.ai](https://together.ai) or similar Llama 3 provider
- Get your API key
- Add to `.env.local`:
```
NEXT_PUBLIC_LLAMA_API_URL=https://api.together.xyz/v1/chat/completions
NEXT_PUBLIC_LLAMA_API_KEY=your_api_key_here
```

#### Option B: OpenAI
- Get API key from [OpenAI](https://platform.openai.com)
- Add to `.env.local`:
```
NEXT_PUBLIC_OPENAI_API_KEY=your_api_key_here
```

#### Option C: Google Gemini
- Get API key from [Google AI Studio](https://makersuite.google.com)
- Add to `.env.local`:
```
NEXT_PUBLIC_GEMINI_API_KEY=your_api_key_here
```

### 3. Fallback Mode

If no API keys are provided, the app will use a local symptom database for basic analysis. This ensures the app works out of the box.

## How It Works

1. **User Input**: Patient describes symptoms through the form
2. **AI Analysis**: System tries AI providers in order:
   - Llama 3 (if configured)
   - OpenAI (if configured)
   - Fallback database
3. **Response**: Shows analysis with confidence score and AI model used

## AI Service Priority

The system tries AI services in this order:
1. Llama 3 (via Together.ai)
2. OpenAI GPT-3.5
3. Local fallback database

## Testing

1. Start the development server: `npm run dev`
2. Go to `/patient/symptom-checker`
3. Fill out the symptom form
4. Submit to see AI analysis with model information

## API Response Format

The AI service returns:
```typescript
{
  conditions: string[];           // Possible conditions
  recommendation: string;         // General recommendations
  seekHelp: string;              // When to seek medical help
  advice: string;                // Health advice
  confidence: number;            // 0.0 to 1.0
  aiModel: string;               // AI model used
}
```

## Security Notes

- API keys are stored in environment variables
- All AI responses include disclaimers about not being medical diagnoses
- Users are always advised to consult healthcare professionals
- No personal health data is stored or transmitted to AI services beyond the symptom description

## Troubleshooting

- **No AI services available**: Check your API keys in `.env.local`
- **Analysis fails**: The system will fall back to local database
- **Low confidence scores**: This is normal for complex symptoms; users are advised to consult doctors
