'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Volume2, VolumeX, Bot, User, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { analyzeSymptoms } from '@/lib/ai-service';

interface VoiceMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface VoiceAssistantProps {
  onNavigate?: (path: string) => void;
  onSymptomCheck?: (symptoms: string) => void;
  className?: string;
}

export function VoiceAssistant({ onNavigate, onSymptomCheck, className = '' }: VoiceAssistantProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState<VoiceMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recognition, setRecognition] = useState<any | null>(null);
  const [synthesis, setSynthesis] = useState<any | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Initialize speech recognition and synthesis
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const SpeechSynthesis = window.speechSynthesis;
      
      if (SpeechRecognition && SpeechSynthesis) {
        const recognitionInstance = new SpeechRecognition();
        recognitionInstance.continuous = false;
        recognitionInstance.interimResults = false;
        recognitionInstance.lang = 'en-US';
        
        setRecognition(recognitionInstance);
        setSynthesis(SpeechSynthesis);
        setIsSupported(true);
      }
    }
  }, []);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Add welcome message
  useEffect(() => {
    if (isSupported && messages.length === 0) {
      addMessage('assistant', 'Hello! I\'m your MediLink voice assistant. I can help you navigate the platform, check symptoms, book consultations, and more. How can I assist you today?');
    }
  }, [isSupported, messages.length]);

  const addMessage = useCallback((type: 'user' | 'assistant', content: string) => {
    const message: VoiceMessage = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, message]);
  }, []);

  const speak = useCallback((text: string) => {
    if (!synthesis) return;
    
    setIsSpeaking(true);
    synthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 0.8;
    
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    synthesis.speak(utterance);
  }, [synthesis]);

  const processVoiceCommand = useCallback(async (command: string) => {
    setIsProcessing(true);
    addMessage('user', command);
    
    try {
      const lowerCommand = command.toLowerCase();
      
      // Navigation commands
      if (lowerCommand.includes('go to') || lowerCommand.includes('navigate to')) {
        if (lowerCommand.includes('patient') || lowerCommand.includes('dashboard')) {
          onNavigate?.('/patient');
          addMessage('assistant', 'Navigating to patient dashboard...');
          speak('Navigating to patient dashboard');
        } else if (lowerCommand.includes('doctor')) {
          onNavigate?.('/doctor');
          addMessage('assistant', 'Navigating to doctor dashboard...');
          speak('Navigating to doctor dashboard');
        } else if (lowerCommand.includes('pharmacy')) {
          onNavigate?.('/pharmacy');
          addMessage('assistant', 'Navigating to pharmacy dashboard...');
          speak('Navigating to pharmacy dashboard');
        } else if (lowerCommand.includes('home') || lowerCommand.includes('main')) {
          onNavigate?.('/');
          addMessage('assistant', 'Navigating to home page...');
          speak('Navigating to home page');
        } else {
          addMessage('assistant', 'I can help you navigate to patient dashboard, doctor dashboard, pharmacy dashboard, or home page. What would you like to do?');
          speak('I can help you navigate to patient dashboard, doctor dashboard, pharmacy dashboard, or home page. What would you like to do?');
        }
      }
      // Symptom checking commands
      else if (lowerCommand.includes('check symptom') || lowerCommand.includes('analyze symptom') || lowerCommand.includes('i have')) {
        const symptomText = command.replace(/check symptom|analyze symptom|i have|symptoms?/gi, '').trim();
        if (symptomText) {
          addMessage('assistant', 'Analyzing your symptoms...');
          speak('Analyzing your symptoms');
          
          const analysis = await analyzeSymptoms({
            mainSymptom: symptomText,
            bodyPart: 'general',
            duration: 'unknown',
            severity: 'Moderate',
            additionalSymptoms: [],
            additionalInfo: 'Voice input'
          });
          
          const response = `Based on your symptoms, possible conditions include: ${analysis.conditions.join(', ')}. Recommendation: ${analysis.recommendation}. ${analysis.seekHelp}`;
          addMessage('assistant', response);
          speak(response);
          
          onSymptomCheck?.(symptomText);
        } else {
          addMessage('assistant', 'Please describe your symptoms so I can help analyze them.');
          speak('Please describe your symptoms so I can help analyze them');
        }
      }
      // Consultation booking
      else if (lowerCommand.includes('book') && (lowerCommand.includes('consultation') || lowerCommand.includes('appointment'))) {
        onNavigate?.('/patient/video-consultation');
        addMessage('assistant', 'Opening consultation booking...');
        speak('Opening consultation booking');
      }
      // Medical history
      else if (lowerCommand.includes('medical history') || lowerCommand.includes('reports')) {
        onNavigate?.('/patient/medical-history');
        addMessage('assistant', 'Opening medical history...');
        speak('Opening medical history');
      }
      // Emergency
      else if (lowerCommand.includes('emergency') || lowerCommand.includes('urgent') || lowerCommand.includes('help')) {
        addMessage('assistant', 'For medical emergencies, please call emergency services immediately. I can help you find nearby hospitals or urgent care centers.');
        speak('For medical emergencies, please call emergency services immediately. I can help you find nearby hospitals or urgent care centers');
      }
      // General help
      else if (lowerCommand.includes('help') || lowerCommand.includes('what can you do')) {
        const helpText = 'I can help you with: navigating the platform, checking symptoms, booking consultations, accessing medical history, finding pharmacies, and general health information. What would you like to do?';
        addMessage('assistant', helpText);
        speak(helpText);
      }
      // Default response
      else {
        addMessage('assistant', 'I understand you said: "' + command + '". I can help you navigate, check symptoms, book consultations, or access your medical information. What would you like to do?');
        speak('I understand you said: ' + command + '. I can help you navigate, check symptoms, book consultations, or access your medical information. What would you like to do?');
      }
    } catch (error) {
      console.error('Error processing voice command:', error);
      addMessage('assistant', 'Sorry, I encountered an error processing your request. Please try again.');
      speak('Sorry, I encountered an error processing your request. Please try again');
    } finally {
      setIsProcessing(false);
    }
  }, [addMessage, speak, onNavigate, onSymptomCheck]);

  const startListening = useCallback(() => {
    if (!recognition) return;
    
    setIsListening(true);
    recognition.start();
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setIsListening(false);
      processVoiceCommand(transcript);
    };
    
    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      toast({
        title: "Speech Recognition Error",
        description: "Could not recognize speech. Please try again.",
        variant: "destructive",
      });
    };
    
    recognition.onend = () => {
      setIsListening(false);
    };
  }, [recognition, processVoiceCommand, toast]);

  const stopListening = useCallback(() => {
    if (recognition) {
      recognition.stop();
    }
    setIsListening(false);
  }, [recognition]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    if (synthesis) {
      synthesis.cancel();
      setIsSpeaking(false);
    }
  }, [synthesis]);

  if (!isSupported) {
    return (
      <Card className={`w-full max-w-md ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5" />
            Voice Assistant
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Voice assistant is not supported in your browser. Please use Chrome, Edge, or Safari for voice features.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`w-full max-w-md ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="w-5 h-5" />
          Voice Assistant
          {isListening && <Badge variant="destructive" className="animate-pulse">Listening</Badge>}
          {isSpeaking && <Badge variant="secondary" className="animate-pulse">Speaking</Badge>}
          {isProcessing && <Badge variant="outline" className="animate-pulse">Processing</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Voice Controls */}
        <div className="flex gap-2">
          <Button
            onClick={toggleListening}
            disabled={isProcessing}
            variant={isListening ? "destructive" : "default"}
            className="flex-1"
          >
            {isListening ? (
              <>
                <MicOff className="w-4 h-4 mr-2" />
                Stop Listening
              </>
            ) : (
              <>
                <Mic className="w-4 h-4 mr-2" />
                Start Listening
              </>
            )}
          </Button>
          
          <Button
            onClick={clearMessages}
            variant="outline"
            size="icon"
            disabled={isListening || isSpeaking}
          >
            <VolumeX className="w-4 h-4" />
          </Button>
        </div>

        {/* Messages */}
        <div className="max-h-64 overflow-y-auto space-y-2 border rounded-lg p-3 bg-muted/20">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-2 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.type === 'assistant' && (
                <Bot className="w-4 h-4 mt-1 text-primary" />
              )}
              <div
                className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                  message.type === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-background border'
                }`}
              >
                {message.content}
              </div>
              {message.type === 'user' && (
                <User className="w-4 h-4 mt-1 text-primary" />
              )}
            </div>
          ))}
          {isProcessing && (
            <div className="flex gap-2 justify-start">
              <Bot className="w-4 h-4 mt-1 text-primary" />
              <div className="bg-background border rounded-lg px-3 py-2 text-sm">
                <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                Processing your request...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Commands */}
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground font-medium">Quick Commands:</p>
          <div className="grid grid-cols-2 gap-1 text-xs">
            <Button
              variant="outline"
              size="sm"
              onClick={() => processVoiceCommand('Go to patient dashboard')}
              disabled={isProcessing || isListening}
            >
              Patient Dashboard
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => processVoiceCommand('Check symptoms')}
              disabled={isProcessing || isListening}
            >
              Check Symptoms
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => processVoiceCommand('Book consultation')}
              disabled={isProcessing || isListening}
            >
              Book Consultation
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => processVoiceCommand('Medical history')}
              disabled={isProcessing || isListening}
            >
              Medical History
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

