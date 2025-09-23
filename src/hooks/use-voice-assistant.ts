'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { analyzeSymptoms } from '@/lib/ai-service';
import { useContext } from 'react';
import { LanguageContext } from '@/context/language-context';
import { useVoiceForm } from '@/context/voice-form-context';

interface VoiceCommand {
  command: string;
  action: () => void;
  description: string;
}

interface VoiceAssistantState {
  isListening: boolean;
  isSpeaking: boolean;
  isProcessing: boolean;
  isSupported: boolean;
  recognition: any | null;
  synthesis: any | null;
}

export function useVoiceAssistant() {
  const [state, setState] = useState<VoiceAssistantState>({
    isListening: false,
    isSpeaking: false,
    isProcessing: false,
    isSupported: false,
    recognition: null,
    synthesis: null,
  });
  
  const router = useRouter();
  const { toast } = useToast();
  const { language: currentLanguage } = useContext(LanguageContext);
  const { fillField, submitForm } = useVoiceForm();
  const commandsRef = useRef<VoiceCommand[]>([]);

  // Language configuration
  const languageConfig = {
    en: {
      lang: 'en-US',
      voiceCommands: {
        'go to home': 'Navigate to home page',
        'go to patient dashboard': 'Navigate to patient dashboard',
        'go to doctor dashboard': 'Navigate to doctor dashboard',
        'go to pharmacy': 'Navigate to pharmacy dashboard',
        'book consultation': 'Book a video consultation',
        'medical history': 'Access medical history',
        'symptom checker': 'Open symptom checker',
        'emergency': 'Emergency assistance'
      }
    },
    hi: {
      lang: 'hi-IN',
      voiceCommands: {
        'घर जाओ': 'Navigate to home page',
        'रोगी डैशबोर्ड जाओ': 'Navigate to patient dashboard',
        'डॉक्टर डैशबोर्ड जाओ': 'Navigate to doctor dashboard',
        'फार्मेसी जाओ': 'Navigate to pharmacy dashboard',
        'परामर्श बुक करो': 'Book a video consultation',
        'चिकित्सा इतिहास': 'Access medical history',
        'लक्षण जांचकर्ता': 'Open symptom checker',
        'आपातकाल': 'Emergency assistance'
      }
    },
    pa: {
      lang: 'pa-IN',
      voiceCommands: {
        'ਘਰ ਜਾਓ': 'Navigate to home page',
        'ਮਰੀਜ਼ ਡੈਸ਼ਬੋਰਡ ਜਾਓ': 'Navigate to patient dashboard',
        'ਡਾਕਟਰ ਡੈਸ਼ਬੋਰਡ ਜਾਓ': 'Navigate to doctor dashboard',
        'ਫਾਰਮੇਸੀ ਜਾਓ': 'Navigate to pharmacy dashboard',
        'ਸਲਾਹ ਬੁੱਕ ਕਰੋ': 'Book a video consultation',
        'ਡਾਕਟਰੀ ਇਤਿਹਾਸ': 'Access medical history',
        'ਲੱਛਣ ਜਾਂਚਕ': 'Open symptom checker',
        'ਐਮਰਜੈਂਸੀ': 'Emergency assistance'
      }
    }
  };

  // Initialize speech recognition and synthesis
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const SpeechSynthesis = window.speechSynthesis;
      
      if (SpeechRecognition && SpeechSynthesis) {
        const recognitionInstance = new SpeechRecognition();
        recognitionInstance.continuous = false;
        recognitionInstance.interimResults = false;
        
        // Set language based on current language
        const currentConfig = languageConfig[currentLanguage as keyof typeof languageConfig] || languageConfig.en;
        recognitionInstance.lang = currentConfig.lang;
        
        console.log('VoiceAssistant: Setting language to', currentLanguage, 'with config', currentConfig.lang);
        
        setState(prev => ({
          ...prev,
          recognition: recognitionInstance,
          synthesis: SpeechSynthesis,
          isSupported: true,
        }));
      }
    }
  }, [currentLanguage]);

  // Get current language commands
  const getCurrentLanguageCommands = useCallback((): VoiceCommand[] => {
    const currentConfig = languageConfig[currentLanguage as keyof typeof languageConfig] || languageConfig.en;
    
    return [
      {
        command: 'go to home',
        action: () => router.push('/'),
        description: 'Navigate to home page'
      },
      {
        command: 'go to patient dashboard',
        action: () => router.push('/patient'),
        description: 'Navigate to patient dashboard'
      },
      {
        command: 'go to doctor dashboard',
        action: () => router.push('/doctor'),
        description: 'Navigate to doctor dashboard'
      },
      {
        command: 'go to pharmacy',
        action: () => router.push('/pharmacy'),
        description: 'Navigate to pharmacy dashboard'
      },
      {
        command: 'book consultation',
        action: () => router.push('/patient/video-consultation'),
        description: 'Book a video consultation'
      },
      {
        command: 'medical history',
        action: () => router.push('/patient/medical-history'),
        description: 'Access medical history'
      },
      {
        command: 'symptom checker',
        action: () => router.push('/patient/symptom-checker'),
        description: 'Open symptom checker'
      },
      {
        command: 'emergency',
        action: () => {
          toast({
            title: "Emergency Alert",
            description: "For medical emergencies, please call emergency services immediately.",
            variant: "destructive",
          });
        },
        description: 'Emergency assistance'
      },
      // Add language-specific commands
      ...Object.entries(currentConfig.voiceCommands).map(([command, description]) => ({
        command,
        action: () => {
          // Map commands to actions
          if (command.includes('home') || command.includes('घर') || command.includes('ਘਰ')) {
            router.push('/');
          } else if (command.includes('patient') || command.includes('रोगी') || command.includes('ਮਰੀਜ਼')) {
            router.push('/patient');
          } else if (command.includes('doctor') || command.includes('डॉक्टर') || command.includes('ਡਾਕਟਰ')) {
            router.push('/doctor');
          } else if (command.includes('pharmacy') || command.includes('फार्मेसी') || command.includes('ਫਾਰਮੇਸੀ')) {
            router.push('/pharmacy');
          } else if (command.includes('consultation') || command.includes('परामर्श') || command.includes('ਸਲਾਹ')) {
            router.push('/patient/video-consultation');
          } else if (command.includes('history') || command.includes('इतिहास') || command.includes('ਇਤਿਹਾਸ')) {
            router.push('/patient/medical-history');
          } else if (command.includes('symptom') || command.includes('लक्षण') || command.includes('ਲੱਛਣ')) {
            router.push('/patient/symptom-checker');
          } else if (command.includes('emergency') || command.includes('आपातकाल') || command.includes('ਐਮਰਜੈਂਸੀ')) {
            toast({
              title: "Emergency Alert",
              description: "For medical emergencies, please call emergency services immediately.",
              variant: "destructive",
            });
          }
        },
        description
      }))
    ];
  }, [currentLanguage, router, toast]);

  // Update commands when language changes
  useEffect(() => {
    commandsRef.current = getCurrentLanguageCommands();
  }, [getCurrentLanguageCommands]);

  const speak = useCallback((text: string) => {
    if (!state.synthesis) return;
    
    setState(prev => ({ ...prev, isSpeaking: true }));
    state.synthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 0.8;
    
    // Set language for speech synthesis
    const currentConfig = languageConfig[currentLanguage as keyof typeof languageConfig] || languageConfig.en;
    utterance.lang = currentConfig.lang;
    
    // Try to find a voice for the current language
    const voices = state.synthesis.getVoices();
    const languageVoice = voices.find((voice: any) => 
      voice.lang.startsWith(currentConfig.lang.split('-')[0])
    );
    
    if (languageVoice) {
      utterance.voice = languageVoice;
    }
    
    utterance.onend = () => setState(prev => ({ ...prev, isSpeaking: false }));
    utterance.onerror = () => setState(prev => ({ ...prev, isSpeaking: false }));
    
    state.synthesis.speak(utterance);
  }, [state.synthesis, currentLanguage]);

  const processVoiceCommand = useCallback(async (command: string) => {
    console.log('VoiceAssistant: Processing command:', command);
    console.log('VoiceAssistant: Current language:', currentLanguage);
    setState(prev => ({ ...prev, isProcessing: true }));
    
    try {
      const lowerCommand = command.toLowerCase();
      console.log('VoiceAssistant: Lower command:', lowerCommand);
      
      // Handle form filling commands FIRST (before general command matching)
      console.log('VoiceAssistant: Checking for name commands...');
      console.log('VoiceAssistant: lowerCommand includes "my name is"?', lowerCommand.includes('my name is'));
      console.log('VoiceAssistant: lowerCommand includes "मेरा नाम है"?', lowerCommand.includes('मेरा नाम है'));
      console.log('VoiceAssistant: lowerCommand includes "ਮੇਰਾ ਨਾਮ ਹੈ"?', lowerCommand.includes('ਮੇਰਾ ਨਾਮ ਹੈ'));
      
      // More flexible pattern matching for Hindi and Punjabi
      const hasEnglishName = lowerCommand.includes('my name is');
      const hasHindiName = lowerCommand.includes('मेरा नाम') && (lowerCommand.includes('है') || lowerCommand.includes('में'));
      const hasPunjabiName = lowerCommand.includes('ਮੇਰਾ ਨਾਮ') && (lowerCommand.includes('ਹੈ') || lowerCommand.includes('ਵਿੱਚ'));
      
      console.log('VoiceAssistant: hasEnglishName?', hasEnglishName);
      console.log('VoiceAssistant: hasHindiName?', hasHindiName);
      console.log('VoiceAssistant: hasPunjabiName?', hasPunjabiName);
      console.log('VoiceAssistant: lowerCommand contains "मेरा नाम"?', lowerCommand.includes('मेरा नाम'));
      console.log('VoiceAssistant: lowerCommand contains "है"?', lowerCommand.includes('है'));
      console.log('VoiceAssistant: lowerCommand contains "में"?', lowerCommand.includes('में'));
      
      if (hasEnglishName || hasHindiName || hasPunjabiName) {
        console.log('VoiceAssistant: Name command detected');
        console.log('VoiceAssistant: fillField function available?', !!fillField);
        
        // Extract name based on language
        let name = '';
        if (hasEnglishName) {
          name = command.replace(/my name is/gi, '').trim();
        } else if (hasHindiName) {
          // Handle patterns like "मेरा नाम वंशदीप है" or "मेरा नाम है वंशदीप"
          name = command.replace(/मेरा नाम\s*(है|में)?\s*/gi, '').replace(/\s*(है|में)\s*$/gi, '').trim();
        } else if (hasPunjabiName) {
          // Handle patterns like "ਮੇਰਾ ਨਾਮ ਵੰਸ਼ਦੀਪ ਹੈ" or "ਮੇਰਾ ਨਾਮ ਹੈ ਵੰਸ਼ਦੀਪ"
          name = command.replace(/ਮੇਰਾ ਨਾਮ\s*(ਹੈ|ਵਿੱਚ)?\s*/gi, '').replace(/\s*(ਹੈ|ਵਿੱਚ)\s*$/gi, '').trim();
        }
        
        console.log('VoiceAssistant: Extracted name:', name);
        if (name) {
          console.log('VoiceAssistant: About to call fillField with fullName and', name);
          fillField('fullName', name);
          console.log('VoiceAssistant: fillField called successfully');
          // Speak response in appropriate language
          const responses = {
            en: `Filling name field with: ${name}`,
            hi: `नाम फील्ड भर रहा हूं: ${name}`,
            pa: `ਨਾਮ ਫੀਲਡ ਭਰ ਰਿਹਾ ਹਾਂ: ${name}`
          };
          speak(responses[currentLanguage as keyof typeof responses] || responses.en);
        } else {
          const responses = {
            en: 'Please tell me your name',
            hi: 'कृपया अपना नाम बताएं',
            pa: 'ਕਿਰਪਾ ਕਰਕੇ ਆਪਣਾ ਨਾਮ ਦੱਸੋ'
          };
          speak(responses[currentLanguage as keyof typeof responses] || responses.en);
        }
        return;
      }
      
      // Email pattern matching
      const hasEnglishEmail = lowerCommand.includes('my email is');
      const hasHindiEmail = lowerCommand.includes('मेरा ईमेल') && (lowerCommand.includes('है') || lowerCommand.includes('में'));
      const hasPunjabiEmail = lowerCommand.includes('ਮੇਰਾ ਈਮੇਲ') && (lowerCommand.includes('ਹੈ') || lowerCommand.includes('ਵਿੱਚ'));
      
      if (hasEnglishEmail || hasHindiEmail || hasPunjabiEmail) {
        // Extract email based on language
        let email = '';
        if (hasEnglishEmail) {
          email = command.replace(/my email is/gi, '').trim();
        } else if (hasHindiEmail) {
          email = command.replace(/मेरा ईमेल\s*(है|में)?\s*/gi, '').replace(/\s*(है|में)\s*$/gi, '').trim();
        } else if (hasPunjabiEmail) {
          email = command.replace(/ਮੇਰਾ ਈਮੇਲ\s*(ਹੈ|ਵਿੱਚ)?\s*/gi, '').replace(/\s*(ਹੈ|ਵਿੱਚ)\s*$/gi, '').trim();
        }
        if (email) {
          fillField('email', email);
          const responses = {
            en: `Filling email field with: ${email}`,
            hi: `ईमेल फील्ड भर रहा हूं: ${email}`,
            pa: `ਈਮੇਲ ਫੀਲਡ ਭਰ ਰਿਹਾ ਹਾਂ: ${email}`
          };
          speak(responses[currentLanguage as keyof typeof responses] || responses.en);
        } else {
          const responses = {
            en: 'Please tell me your email address',
            hi: 'कृपया अपना ईमेल पता बताएं',
            pa: 'ਕਿਰਪਾ ਕਰਕੇ ਆਪਣਾ ਈਮੇਲ ਪਤਾ ਦੱਸੋ'
          };
          speak(responses[currentLanguage as keyof typeof responses] || responses.en);
        }
        return;
      }
      
      // Phone pattern matching
      const hasEnglishPhone = lowerCommand.includes('my phone number is');
      const hasHindiPhone = lowerCommand.includes('मेरा फोन नंबर') && (lowerCommand.includes('है') || lowerCommand.includes('में'));
      const hasPunjabiPhone = lowerCommand.includes('ਮੇਰਾ ਫੋਨ ਨੰਬਰ') && (lowerCommand.includes('ਹੈ') || lowerCommand.includes('ਵਿੱਚ'));
      
      if (hasEnglishPhone || hasHindiPhone || hasPunjabiPhone) {
        // Extract phone based on language
        let phone = '';
        if (hasEnglishPhone) {
          phone = command.replace(/my phone number is/gi, '').trim();
        } else if (hasHindiPhone) {
          phone = command.replace(/मेरा फोन नंबर\s*(है|में)?\s*/gi, '').replace(/\s*(है|में)\s*$/gi, '').trim();
        } else if (hasPunjabiPhone) {
          phone = command.replace(/ਮੇਰਾ ਫੋਨ ਨੰਬਰ\s*(ਹੈ|ਵਿੱਚ)?\s*/gi, '').replace(/\s*(ਹੈ|ਵਿੱਚ)\s*$/gi, '').trim();
        }
        if (phone) {
          fillField('phone', phone);
          const responses = {
            en: `Filling phone field with: ${phone}`,
            hi: `फोन फील्ड भर रहा हूं: ${phone}`,
            pa: `ਫੋਨ ਫੀਲਡ ਭਰ ਰਿਹਾ ਹਾਂ: ${phone}`
          };
          speak(responses[currentLanguage as keyof typeof responses] || responses.en);
        } else {
          const responses = {
            en: 'Please tell me your phone number',
            hi: 'कृपया अपना फोन नंबर बताएं',
            pa: 'ਕਿਰਪਾ ਕਰਕੇ ਆਪਣਾ ਫੋਨ ਨੰਬਰ ਦੱਸੋ'
          };
          speak(responses[currentLanguage as keyof typeof responses] || responses.en);
        }
        return;
      }
      
      // Date of birth pattern matching
      const hasEnglishDOB = lowerCommand.includes('my date of birth is');
      const hasHindiDOB = lowerCommand.includes('मेरी जन्मतिथि') && (lowerCommand.includes('है') || lowerCommand.includes('में'));
      const hasPunjabiDOB = lowerCommand.includes('ਮੇਰੀ ਜਨਮ ਤਾਰੀਖ') && (lowerCommand.includes('ਹੈ') || lowerCommand.includes('ਵਿੱਚ'));
      
      if (hasEnglishDOB || hasHindiDOB || hasPunjabiDOB) {
        // Extract date of birth based on language
        let dob = '';
        if (hasEnglishDOB) {
          dob = command.replace(/my date of birth is/gi, '').trim();
        } else if (hasHindiDOB) {
          dob = command.replace(/मेरी जन्मतिथि\s*(है|में)?\s*/gi, '').replace(/\s*(है|में)\s*$/gi, '').trim();
        } else if (hasPunjabiDOB) {
          dob = command.replace(/ਮੇਰੀ ਜਨਮ ਤਾਰੀਖ\s*(ਹੈ|ਵਿੱਚ)?\s*/gi, '').replace(/\s*(ਹੈ|ਵਿੱਚ)\s*$/gi, '').trim();
        }
        if (dob) {
          fillField('dob', dob);
          const responses = {
            en: `Filling date of birth field with: ${dob}`,
            hi: `जन्मतिथि फील्ड भर रहा हूं: ${dob}`,
            pa: `ਜਨਮ ਤਾਰੀਖ ਫੀਲਡ ਭਰ ਰਿਹਾ ਹਾਂ: ${dob}`
          };
          speak(responses[currentLanguage as keyof typeof responses] || responses.en);
        } else {
          const responses = {
            en: 'Please tell me your date of birth',
            hi: 'कृपया अपनी जन्मतिथि बताएं',
            pa: 'ਕਿਰਪਾ ਕਰਕੇ ਆਪਣੀ ਜਨਮ ਤਾਰੀਖ ਦੱਸੋ'
          };
          speak(responses[currentLanguage as keyof typeof responses] || responses.en);
        }
        return;
      }
      
      // Submit form pattern matching
      const hasEnglishSubmit = lowerCommand.includes('submit form');
      const hasHindiSubmit = lowerCommand.includes('फॉर्म सबमिट') || lowerCommand.includes('फॉर्म भरें');
      const hasPunjabiSubmit = lowerCommand.includes('ਫਾਰਮ ਸਬਮਿਟ') || lowerCommand.includes('ਫਾਰਮ ਭਰੋ');
      
      if (hasEnglishSubmit || hasHindiSubmit || hasPunjabiSubmit) {
        submitForm();
        const responses = {
          en: 'Submitting the form',
          hi: 'फॉर्म सबमिट कर रहा हूं',
          pa: 'ਫਾਰਮ ਸਬਮਿਟ ਕਰ ਰਿਹਾ ਹਾਂ'
        };
        speak(responses[currentLanguage as keyof typeof responses] || responses.en);
        return;
      }
      
      // Check for exact command matches (after form commands)
      const exactMatch = commandsRef.current.find(cmd => 
        cmd.command.toLowerCase() === lowerCommand
      );
      
      if (exactMatch) {
        exactMatch.action();
        speak(`Executing: ${exactMatch.description}`);
        return;
      }
      
      // Check for partial matches
      const partialMatch = commandsRef.current.find(cmd => 
        lowerCommand.includes(cmd.command.toLowerCase()) ||
        cmd.command.toLowerCase().includes(lowerCommand)
      );
      
      if (partialMatch) {
        partialMatch.action();
        speak(`Executing: ${partialMatch.description}`);
        return;
      }

      // Handle symptom checking
      if (lowerCommand.includes('symptom') || lowerCommand.includes('check') || lowerCommand.includes('i have')) {
        const symptomText = command.replace(/check symptom|analyze symptom|i have|symptoms?/gi, '').trim();
        if (symptomText) {
          speak('Analyzing your symptoms...');
          
          const analysis = await analyzeSymptoms({
            mainSymptom: symptomText,
            bodyPart: 'general',
            duration: 'unknown',
            severity: 'Moderate',
            additionalSymptoms: [],
            additionalInfo: 'Voice input'
          });
          
          const response = `Based on your symptoms, possible conditions include: ${analysis.conditions.join(', ')}. Recommendation: ${analysis.recommendation}`;
          speak(response);
          
          toast({
            title: "Symptom Analysis Complete",
            description: "Check the results above for your symptom analysis.",
          });
        } else {
          speak('Please describe your symptoms so I can help analyze them');
        }
        return;
      }
      
      // Default response
      speak('I understand you said: ' + command + '. I can help you navigate, check symptoms, book consultations, or access your medical information. What would you like to do?');
      
    } catch (error) {
      console.error('Error processing voice command:', error);
      speak('Sorry, I encountered an error processing your request. Please try again');
      toast({
        title: "Voice Command Error",
        description: "Could not process voice command. Please try again.",
        variant: "destructive",
      });
    } finally {
      setState(prev => ({ ...prev, isProcessing: false }));
    }
  }, [speak, toast]);

  const startListening = useCallback(() => {
    if (!state.recognition) return;
    
    setState(prev => ({ ...prev, isListening: true }));
    state.recognition.start();
    
    state.recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setState(prev => ({ ...prev, isListening: false }));
      processVoiceCommand(transcript);
    };
    
    state.recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setState(prev => ({ ...prev, isListening: false }));
      toast({
        title: "Speech Recognition Error",
        description: "Could not recognize speech. Please try again.",
        variant: "destructive",
      });
    };
    
    state.recognition.onend = () => {
      setState(prev => ({ ...prev, isListening: false }));
    };
  }, [state.recognition, processVoiceCommand, toast]);

  const stopListening = useCallback(() => {
    if (state.recognition) {
      state.recognition.stop();
    }
    setState(prev => ({ ...prev, isListening: false }));
  }, [state.recognition]);

  const toggleListening = useCallback(() => {
    if (state.isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [state.isListening, startListening, stopListening]);

  const addCommand = useCallback((command: VoiceCommand) => {
    commandsRef.current.push(command);
  }, []);

  const removeCommand = useCallback((commandText: string) => {
    commandsRef.current = commandsRef.current.filter(cmd => cmd.command !== commandText);
  }, []);

  const clearCommands = useCallback(() => {
    commandsRef.current = getCurrentLanguageCommands();
  }, [getCurrentLanguageCommands]);

  const stopSpeaking = useCallback(() => {
    if (state.synthesis) {
      state.synthesis.cancel();
      setState(prev => ({ ...prev, isSpeaking: false }));
    }
  }, [state.synthesis]);

  return {
    ...state,
    speak,
    processVoiceCommand,
    startListening,
    stopListening,
    toggleListening,
    addCommand,
    removeCommand,
    clearCommands,
    stopSpeaking,
  };
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}
