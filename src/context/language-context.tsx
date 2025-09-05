
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
  const [currentTranslations, setCurrentTranslations] = useState<Translations>(en);

  useEffect(() => {
    // Check for saved language in localStorage
    const savedLanguage = localStorage.getItem('language') as Language | null;
    if (savedLanguage && ['en', 'hi', 'pa'].includes(savedLanguage)) {
      setLanguage(savedLanguage);
      setCurrentTranslations(translationsMap[savedLanguage]);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    setCurrentTranslations(translationsMap[lang]);
    localStorage.setItem('language', lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, translations: currentTranslations }}>
      {children}
    </LanguageContext.Provider>
  );
};
