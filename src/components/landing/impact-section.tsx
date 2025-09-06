
'use client';

import { Users, HeartPulse, Building } from 'lucide-react';
import { FadeIn } from '../fade-in';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { cn } from '@/lib/utils';

export function ImpactSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });

  const stats = [
    {
      icon: <Users className="w-12 h-12 text-primary" />,
      value: 1000,
      label: 'Patients Helped',
    },
    {
      icon: <HeartPulse className="w-12 h-12 text-primary" />,
      value: 500,
      label: 'Consultations',
    },
    {
      icon: <Building className="w-12 h-12 text-primary" />,
      value: 50,
      label: 'Pharmacies Connected',
    },
  ];

  return (
    <section className="py-20 md:py-32 bg-[hsl(224,71%,10%)] text-white" ref={ref}>
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {stats.map((stat, index) => (
            <FadeIn key={index} delay={200 * index} direction="up">
              <div className="text-center">
                {stat.icon}
                <div
                  className={cn(
                    'text-5xl md:text-6xl font-bold text-primary mt-4',
                    isInView && 'animate-count-up'
                  )}
                  style={{ '--num': stat.value } as React.CSSProperties}
                ></div>
                <p className="text-lg text-muted-foreground mt-2">
                  {stat.label}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
