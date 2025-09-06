
'use client';

import { UserPlus, Calendar, FileText, Truck } from 'lucide-react';
import TextFlipper from '../ui/text-effect-flipper';
import { FadeIn } from '../fade-in';

export function HowItWorksSection() {
  const steps = [
    {
      icon: <UserPlus className="w-12 h-12 text-primary" />,
      title: 'Register',
      description: 'Create your secure health profile in minutes.',
    },
    {
      icon: <Calendar className="w-12 h-12 text-primary" />,
      title: 'Book a Doctor',
      description: 'Find a specialist and schedule a video consultation.',
    },
    {
      icon: <FileText className="w-12 h-12 text-primary" />,
      title: 'Get Prescription',
      description: 'Receive a digital prescription directly in your app.',
    },
    {
      icon: <Truck className="w-12 h-12 text-primary" />,
      title: 'Get Medicines',
      description: 'Order from a local pharmacy for pickup or delivery.',
    },
  ];

  return (
    <section className="py-20 md:py-32 bg-background">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            <TextFlipper>How MediLink</TextFlipper>{' '}
            <TextFlipper
              delay={0.2}
              className="font-cursive text-primary"
            >
              Works
            </TextFlipper>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Your journey to better health in four simple steps.
          </p>
        </div>

        <div className="relative">
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-border -translate-y-1/2"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
            {steps.map((step, index) => (
              <FadeIn
                key={index}
                delay={200 * (index + 1)}
                direction={index % 2 === 0 ? 'up' : 'down'}
              >
                <div className="text-center relative bg-background px-4">
                  <div className="flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 border-2 border-primary/20 mb-6 mx-auto">
                    {step.icon}
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
