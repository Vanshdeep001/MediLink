
'use client';

import { useContext } from 'react';
import { SymptomChecker } from "@/components/patient/symptom-checker";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { LanguageContext } from '@/context/language-context';
import TextFlipper from '@/components/ui/text-effect-flipper';
import { Card } from '@/components/ui/card';

export default function SymptomCheckerPage() {
  const { translations } = useContext(LanguageContext);

  const titleParts = translations.patientDashboard.symptomChecker.split(' ');
  const mainTitle = titleParts.slice(0, -1).join(' ');
  const cursiveTitle = titleParts.slice(-1)[0];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-24 md:py-28">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10 animate-fade-in-down">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              <TextFlipper>{mainTitle}</TextFlipper> <TextFlipper delay={0.2} className="text-primary font-cursive">{cursiveTitle}</TextFlipper>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              {translations.patientDashboard.symptomCheckerDesc}
            </p>
          </div>
          <Card className="shadow-lg animate-content-fade-in w-full" style={{ animationDelay: '0.5s' }}>
            <SymptomChecker />
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
