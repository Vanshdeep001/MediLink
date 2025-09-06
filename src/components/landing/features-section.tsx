
'use client';

import { useContext } from 'react';
import { Stethoscope, Pill, Building, Siren, ArrowRight } from 'lucide-react';
import TextFlipper from '../ui/text-effect-flipper';
import { LanguageContext } from '@/context/language-context';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { FadeIn } from '../fade-in';

export function FeaturesSection() {
  const { translations } = useContext(LanguageContext);

  const features = [
    {
      icon: <Stethoscope className="w-12 h-12 text-primary" />,
      title: translations.services.aiDoctor.title,
      description: translations.services.aiDoctor.description,
    },
    {
      icon: <Pill className="w-12 h-12 text-primary" />,
      title: translations.services.medicineOrdering.title,
      description: translations.services.medicineOrdering.description,
    },
    {
      icon: <Building className="w-12 h-12 text-primary" />,
      title: translations.services.pharmacyIntegration.title,
      description: translations.services.pharmacyIntegration.description,
    },
    {
      icon: <Siren className="w-12 h-12 text-primary" />,
      title: translations.services.emergencySOS.title,
      description: translations.services.emergencySOS.description,
    },
  ];

  return (
    <section className="py-20 md:py-32 bg-background">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            <TextFlipper>Why Choose</TextFlipper>{' '}
            <TextFlipper
              delay={0.2}
              className="font-cursive text-primary"
            >
              MediLink?
            </TextFlipper>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            A complete healthcare ecosystem at your fingertips.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <FadeIn key={index} delay={200 * (index + 1)} direction="up">
              <Card className="group h-full flex flex-col p-6 text-center items-center justify-start transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/20">
                <CardHeader className="p-0 mb-4">{feature.icon}</CardHeader>
                <CardContent className="p-0 flex flex-col grow">
                  <CardTitle className="text-xl font-bold mb-2">
                    {feature.title}
                  </CardTitle>
                  <p className="text-muted-foreground grow">
                    {feature.description}
                  </p>
                  <div className="mt-4 flex justify-center items-center">
                    <ArrowRight className="w-5 h-5 text-primary opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1" />
                  </div>
                </CardContent>
              </Card>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
