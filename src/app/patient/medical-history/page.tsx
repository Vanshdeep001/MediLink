
'use client';

import { useContext } from 'react';
import { MedicalHistoryForm } from "@/components/patient/medical-history-form";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { LanguageContext } from '@/context/language-context';
import TextFlipper from '@/components/ui/text-effect-flipper';

export default function MedicalHistoryPage() {
  const { translations } = useContext(LanguageContext);

  const titleParts = translations.medicalHistory.title.split(' ');
  const mainTitle = titleParts.slice(0, -1).join(' ');
  const cursiveTitle = titleParts.slice(-1)[0];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10 animate-fade-in-down">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              <TextFlipper>{mainTitle}</TextFlipper> <TextFlipper delay={0.2} className="text-primary font-cursive">{cursiveTitle}</TextFlipper>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              {translations.medicalHistory.subtitle}
            </p>
          </div>
          <MedicalHistoryForm />
        </div>
      </main>
      <Footer />
    </div>
  );
}
