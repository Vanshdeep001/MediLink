# Voice Assistant Integration

This directory contains the voice assistant components and functionality for MediLink Healthcare Platform.

## Components

### 1. VoiceAssistant (`voice-assistant.tsx`)
A comprehensive voice assistant component that provides:
- Speech recognition for voice commands
- Text-to-speech responses
- Interactive conversation interface
- Integration with AI symptom analysis
- Navigation assistance

### 2. FloatingVoiceButton (`floating-voice-button.tsx`)
A floating action button that provides:
- Quick access to voice commands
- Expandable interface
- Visual feedback for listening/speaking states
- Always available across the application

## Hook

### useVoiceAssistant (`use-voice-assistant.ts`)
A custom React hook that provides:
- Speech recognition and synthesis management
- Voice command processing
- Navigation integration
- Custom command registration
- State management for voice interactions

## Features

### Voice Commands Supported
- **Navigation**: "Go to patient dashboard", "Go to doctor dashboard", "Go to pharmacy", "Go to home"
- **Medical Features**: "Check symptoms", "Book consultation", "Medical history", "Symptom checker"
- **Emergency**: "Emergency", "Help", "Urgent"
- **General**: "Help", "What can you do"

### Browser Support
- Chrome (recommended)
- Edge
- Safari
- Firefox (limited support)

## Integration Points

### 1. Main Layout (`src/app/layout.tsx`)
- FloatingVoiceButton added globally
- Available on all pages

### 2. Patient Dashboard (`src/app/patient/page.tsx`)
- Full VoiceAssistant component
- Integrated with symptom checking
- Navigation support

### 3. Symptom Checker (`src/app/patient/symptom-checker/page.tsx`)
- VoiceAssistant for symptom analysis
- Voice input for symptoms

## Usage Examples

### Basic Voice Commands
```
"Go to patient dashboard" - Navigate to patient dashboard
"Check symptoms" - Open symptom checker
"Book consultation" - Open consultation booking
"Medical history" - Access medical history
"I have fever and headache" - Analyze symptoms via voice
```

### Custom Commands
```typescript
const { addCommand } = useVoiceAssistant();

addCommand({
  command: 'custom action',
  action: () => console.log('Custom action executed'),
  description: 'Execute custom action'
});
```

## Technical Details

### Speech Recognition
- Uses Web Speech API
- Continuous listening mode
- Error handling and fallbacks
- Language: English (en-US)

### Text-to-Speech
- Uses Web Speech Synthesis API
- Configurable rate, pitch, and volume
- Queue management
- Cross-browser compatibility

### AI Integration
- Connects to existing AI service (`src/lib/ai-service.ts`)
- Symptom analysis via voice input
- Fallback to local symptom database

## Security & Privacy
- Voice data processed locally in browser
- No voice recordings stored
- Commands processed in real-time
- Privacy-first approach

## Future Enhancements
- Multi-language support
- Voice biometrics
- Offline voice processing
- Advanced medical voice commands
- Integration with wearable devices

