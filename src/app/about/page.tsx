
'use client';

import { useContext } from 'react';
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import TextFlipper from "@/components/ui/text-effect-flipper";
import { LanguageContext } from '@/context/language-context';
import { FadeIn } from '@/components/fade-in';
import { Users, HeartPulse, Pill } from 'lucide-react';
import Image from 'next/image';

export default function AboutPage() {
  const { translations } = useContext(LanguageContext);

  const impacts = [
    {
      icon: <Users className="w-10 h-10 mx-auto text-primary" />,
      title: translations.about.impact.patients.title,
      description: translations.about.impact.patients.description,
    },
    {
      icon: <HeartPulse className="w-10 h-10 mx-auto text-primary" />,
      title: translations.about.impact.doctors.title,
      description: translations.about.impact.doctors.description,
    },
    {
      icon: <Pill className="w-10 h-10 mx-auto text-primary" />,
      title: translations.about.impact.pharmacies.title,
      description: translations.about.impact.pharmacies.description,
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow pb-16">
        {/* Hero Section */}
        <section className="relative py-24 md:py-40 text-center bg-card">
          <div className="container mx-auto px-4 animate-fade-in-down">
             <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-foreground/70">
              {translations.about.hero.title}
            </h1>
            <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              {translations.about.hero.subtitle}
            </p>
          </div>
        </section>

        {/* Mission & Vision Section */}
        <section className="py-20 md:py-28">
          <div className="container mx-auto px-4 max-w-4xl">
            <FadeIn>
              <div className="text-center">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                  <TextFlipper>{translations.about.mission.title}</TextFlipper>
                </h2>
                <p className="mt-6 text-xl md:text-2xl font-semibold text-muted-foreground">
                  {translations.about.mission.statement}
                </p>
              </div>
            </FadeIn>
            <FadeIn delay={200}>
              <div className="mt-16 text-center">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                   <TextFlipper>{translations.about.vision.title}</TextFlipper>
                </h2>
                <p className="mt-6 text-lg text-muted-foreground">
                  {translations.about.vision.statement}
                </p>
              </div>
            </FadeIn>
          </div>
        </section>
        
        {/* Impact Section */}
        <section className="py-20 md:py-28 bg-card">
           <div className="container mx-auto px-4 max-w-5xl">
              <div className="text-center mb-16">
                 <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                  <TextFlipper>{translations.about.impact.title}</TextFlipper>
                </h2>
                <p className="mt-4 text-lg text-muted-foreground">{translations.about.impact.subtitle}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                {impacts.map((item, index) => (
                  <FadeIn key={index} delay={200 * (index + 1)}>
                    <div className="text-center">
                      {item.icon}
                      <h3 className="mt-4 text-2xl font-bold">{item.title}</h3>
                      <p className="mt-2 text-muted-foreground">{item.description}</p>
                    </div>
                  </FadeIn>
                ))}
              </div>
           </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
