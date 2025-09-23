'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

interface VoiceFormContextType {
  fillField: (fieldName: string, value: string) => void;
  submitForm: () => void;
  registerForm: (formRef: any, onSubmit?: () => void) => void;
}

const VoiceFormContext = createContext<VoiceFormContextType | null>(null);

export function VoiceFormProvider({ children }: { children: React.ReactNode }) {
  const [formRef, setFormRef] = useState<any>(null);
  const [submitHandler, setSubmitHandler] = useState<(() => void) | null>(null);

  const registerForm = useCallback((formRef: any, onSubmit?: () => void) => {
    console.log('VoiceForm: registerForm called with', formRef);
    console.log('VoiceForm: formRef has setValue?', !!(formRef && formRef.setValue));
    setFormRef(formRef);
    if (onSubmit) {
      setSubmitHandler(() => onSubmit);
    }
  }, []);

  const fillField = useCallback((fieldName: string, value: string) => {
    console.log('VoiceForm: fillField called with', fieldName, value);
    console.log('VoiceForm: formRef available?', !!formRef);
    console.log('VoiceForm: formRef.setValue available?', !!(formRef && formRef.setValue));
    
    if (formRef && formRef.setValue) {
      if (fieldName === 'dob') {
        // Parse date string
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          formRef.setValue(fieldName, date);
          console.log('VoiceForm: Set DOB to', date);
        }
      } else {
        formRef.setValue(fieldName, value);
        console.log('VoiceForm: Set', fieldName, 'to', value);
      }
    } else {
      console.log('VoiceForm: No form ref available or setValue not found');
    }
  }, [formRef]);

  const submitForm = useCallback(() => {
    if (submitHandler) {
      submitHandler();
    } else if (formRef && formRef.handleSubmit) {
      // Fallback: trigger form submission via DOM
      const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
      const formElement = document.querySelector('form');
      if (formElement) {
        formElement.dispatchEvent(submitEvent);
      }
    }
  }, [formRef, submitHandler]);

  return (
    <VoiceFormContext.Provider value={{ fillField, submitForm, registerForm }}>
      {children}
    </VoiceFormContext.Provider>
  );
}

export function useVoiceForm() {
  const context = useContext(VoiceFormContext);
  if (!context) {
    throw new Error('useVoiceForm must be used within a VoiceFormProvider');
  }
  return context;
}
