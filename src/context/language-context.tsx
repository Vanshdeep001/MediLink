
'use client';

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import en from '@/locales/en.json';
import hi from '@/locales/hi.json';
import pa from '@/locales/pa.json';

export type Language = 'en' | 'hi' | 'pa';

type Translations = typeof en;

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  translations: Translations;
}

const translationsMap: Record<Language, Translations> = { en, hi, pa };

export const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  translations: en,
});

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('en');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const savedLanguage = localStorage.getItem('language') as Language | null;
    if (savedLanguage && ['en', 'hi', 'pa'].includes(savedLanguage)) {
      setLanguage(savedLanguage);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };
  
  const currentTranslations = translationsMap[language];

  if (!isMounted) {
    // Render with default language on the server and initial client render
    return (
       <LanguageContext.Provider value={{ language: 'en', setLanguage: handleSetLanguage, translations: en }}>
        {children}
      </LanguageContext.Provider>
    );
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, translations: currentTranslations }}>
      {children}
    </LanguageContext.Provider>
  );
};
