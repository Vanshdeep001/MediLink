
'use client';

import { useContext } from 'react';
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TextFlipper from "@/components/ui/text-effect-flipper";
import { BrainCircuit, Stethoscope, Pill, Truck, BellRing, Siren, ArrowRight } from "lucide-react";
import { LanguageContext } from '@/context/language-context';
import { FadeIn } from '@/components/fade-in';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function ServicesPage() {
  const { translations } = useContext(LanguageContext);

  const services = [
    {
      icon: <BrainCircuit className="w-12 h-12 text-primary" />,
      title: translations.services.aiDoctor.title,
      description: translations.services.aiDoctor.description,
      link: "/patient"
    },
    {
      icon: <Stethoscope className="w-12 h-12 text-primary" />,
      title: translations.services.digitalPrescriptions.title,
      description: translations.services.digitalPrescriptions.description,
      link: "/patient/medical-history"
    },
    {
      icon: <Pill className="w-12 h-12 text-primary" />,
      title: translations.services.medicineOrdering.title,
      description: translations.services.medicineOrdering.description,
      link: "/pharmacy"
    },
    {
      icon: <Truck className="w-12 h-12 text-primary" />,
      title: translations.services.pharmacyIntegration.title,
      description: translations.services.pharmacyIntegration.description,
      link: "/pharmacy"
    },
    {
      icon: <BellRing className="w-12 h-12 text-primary" />,
      title: translations.services.smartAlerts.title,
      description: translations.services.smartAlerts.description,
      link: "/patient"
    },
    {
      icon: <Siren className="w-12 h-12 text-primary" />,
      title: translations.services.emergencySOS.title,
      description: translations.services.emergencySOS.description,
      link: "/patient"
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-24 md:py-32">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16 animate-fade-in-down">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              <TextFlipper>{translations.services.title}</TextFlipper> <TextFlipper delay={0.2} className="text-primary font-cursive">{translations.services.titleCursive}</TextFlipper>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              {translations.services.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <FadeIn key={index} delay={200 * (index + 1)} direction="up">
                <Link href={service.link} className="h-full">
                  <Card className="group h-full flex flex-col p-6 text-center items-center justify-start transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/20">
                    <CardHeader className="p-0 mb-4">
                      {service.icon}
                    </CardHeader>
                    <CardContent className="p-0 flex flex-col grow">
                      <CardTitle className="text-xl font-bold mb-2">{service.title}</CardTitle>
                      <p className="text-muted-foreground grow">{service.description}</p>
                      <div className="mt-4 flex justify-center items-center">
                        <span className="text-sm font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300 mr-2">{translations.services.learnMore}</span>
                        <ArrowRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </FadeIn>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
