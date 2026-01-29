'use client';

import React, { useState, useContext } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Mic, MicOff, X, Bot, FileText } from 'lucide-react';
import { useVoiceAssistant } from '@/hooks/use-voice-assistant';
import { Badge } from '@/components/ui/badge';
import { LanguageContext } from '@/context/language-context';
import { useVoiceForm } from '@/context/voice-form-context';
import { usePathname } from 'next/navigation';

interface FloatingVoiceButtonProps {
  className?: string;
}

export function FloatingVoiceButton({ className = '' }: FloatingVoiceButtonProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { language: currentLanguage } = useContext(LanguageContext);
  const { fillField, submitForm } = useVoiceForm();
  const pathname = usePathname();
  const {
    isListening,
    isSpeaking,
    isProcessing,
    isSupported,
    toggleListening,
    stopSpeaking,
  } = useVoiceAssistant();

  // Hide on landing page
  if (pathname === '/') {
    return null;
  }

  // Check if we're on auth page for form-specific commands
  const isAuthPage = pathname === '/auth';

  // Language-specific command examples
  const commandExamples = {
    en: isAuthPage ? [
      "My name is John Doe",
      "My email is john@example.com", 
      "My phone number is 1234567890",
      "My date of birth is January 15, 1990",
      "Submit form"
    ] : [
      "Go to patient dashboard",
      "Check symptoms", 
      "Book consultation",
      "Medical history"
    ],
    hi: isAuthPage ? [
      "मेरा नाम है जॉन डो",
      "मेरा ईमेल है john@example.com",
      "मेरा फोन नंबर है 1234567890",
      "मेरी जन्मतिथि है 15 जनवरी 1990",
      "फॉर्म सबमिट करें"
    ] : [
      "रोगी डैशबोर्ड जाओ",
      "लक्षण जांचकर्ता",
      "परामर्श बुक करो", 
      "चिकित्सा इतिहास"
    ],
    pa: isAuthPage ? [
      "ਮੇਰਾ ਨਾਮ ਹੈ ਜੌਨ ਡੋ",
      "ਮੇਰਾ ਈਮੇਲ ਹੈ john@example.com",
      "ਮੇਰਾ ਫੋਨ ਨੰਬਰ ਹੈ 1234567890",
      "ਮੇਰੀ ਜਨਮ ਤਾਰੀਖ ਹੈ 15 ਜਨਵਰੀ 1990",
      "ਫਾਰਮ ਸਬਮਿਟ ਕਰੋ"
    ] : [
      "ਮਰੀਜ਼ ਡੈਸ਼ਬੋਰਡ ਜਾਓ",
      "ਲੱਛਣ ਜਾਂਚਕ",
      "ਸਲਾਹ ਬੁੱਕ ਕਰੋ",
      "ਡਾਕਟਰੀ ਇਤਿਹਾਸ"
    ]
  };

  const currentExamples = commandExamples[currentLanguage as keyof typeof commandExamples] || commandExamples.en;

  if (!isSupported) {
    return (
      <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
        <Button
          size="icon"
          className="h-14 w-14 rounded-full shadow-lg bg-gray-400 hover:bg-gray-500"
          title="Voice Assistant not supported in this browser"
        >
          <Mic className="w-6 h-6" />
        </Button>
      </div>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
      {isExpanded && (
        <Card className="mb-4 w-80 shadow-lg border-2">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {isAuthPage ? <FileText className="w-5 h-5 text-primary" /> : <Bot className="w-5 h-5 text-primary" />}
                <span className="font-medium">{isAuthPage ? 'Form Voice Assistant' : 'Voice Assistant'}</span>
                {isListening && <Badge variant="destructive" className="animate-pulse">Listening</Badge>}
                {isSpeaking && <Badge variant="secondary" className="animate-pulse">Speaking</Badge>}
                {isProcessing && <Badge variant="outline" className="animate-pulse">Processing</Badge>}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsExpanded(false)}
                className="h-6 w-6"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="space-y-3">
              <div className="text-sm text-muted-foreground">
                Say commands like:
                <ul className="mt-1 space-y-1 text-xs">
                  {currentExamples.map((example, index) => (
                    <li key={index}>• "{example}"</li>
                  ))}
                </ul>
              </div>
              
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
                      Stop
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4 mr-2" />
                      Listen
                    </>
                  )}
                </Button>
                
                {isSpeaking && (
                  <Button
                    onClick={stopSpeaking}
                    variant="outline"
                    size="icon"
                  >
                    <MicOff className="w-4 h-4" />
                  </Button>
                )}
              </div>

                   {/* Form-specific quick commands for auth page */}
                   {isAuthPage && (
                     <div className="space-y-2">
                       <p className="text-xs text-muted-foreground font-medium">
                         {currentLanguage === 'hi' ? 'त्वरित भरें:' :
                          currentLanguage === 'pa' ? 'ਤੁਰੰਤ ਭਰੋ:' : 'Quick Fill:'}
                       </p>
                       <div className="grid grid-cols-2 gap-1 text-xs">
                         <Button
                           variant="outline"
                           size="sm"
                           onClick={() => {
                             console.log('Quick Fill: Testing fillField with fullName');
                             console.log('Quick Fill: fillField function:', fillField);
                             console.log('Quick Fill: typeof fillField:', typeof fillField);
                             if (fillField) {
                               fillField('fullName', 'John Doe');
                               console.log('Quick Fill: fillField called successfully');
                             } else {
                               console.error('Quick Fill: fillField is not available');
                             }
                           }}
                           disabled={isProcessing || isListening}
                         >
                           {currentLanguage === 'hi' ? 'नाम भरें' :
                            currentLanguage === 'pa' ? 'ਨਾਮ ਭਰੋ' : 'Fill Name'}
                         </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        fillField('email', 'john@example.com');
                      }}
                      disabled={isProcessing || isListening}
                    >
                      {currentLanguage === 'hi' ? 'ईमेल भरें' : 
                       currentLanguage === 'pa' ? 'ਈਮੇਲ ਭਰੋ' : 'Fill Email'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        fillField('phone', '1234567890');
                      }}
                      disabled={isProcessing || isListening}
                    >
                      {currentLanguage === 'hi' ? 'फोन भरें' : 
                       currentLanguage === 'pa' ? 'ਫੋਨ ਭਰੋ' : 'Fill Phone'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        fillField('dob', '1990-01-15');
                      }}
                      disabled={isProcessing || isListening}
                    >
                      {currentLanguage === 'hi' ? 'जन्मतिथि भरें' : 
                       currentLanguage === 'pa' ? 'ਜਨਮ ਤਾਰੀਖ ਭਰੋ' : 'Fill DOB'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      
      <Button
        onClick={() => setIsExpanded(!isExpanded)}
        size="icon"
        className={`h-16 w-16 rounded-full shadow-2xl border-4 border-white transition-all duration-200 ${
          isListening 
            ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
            : isSpeaking 
            ? 'bg-blue-500 hover:bg-blue-600 animate-pulse'
            : 'bg-primary hover:bg-primary/90'
        }`}
        title="Click to open Voice Assistant"
      >
        <Mic className="w-8 h-8" />
      </Button>
    </div>
  );
}
