'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';
import { Logo } from '../logo';
import { FloatingIcons } from './floating-icons';
import { cn } from '@/lib/utils';
import TextFlipper from '../ui/text-effect-flipper';

export function HeroSection() {
  const [animationStep, setAnimationStep] = useState('logo-start');

  useEffect(() => {
    const sequence = [
      setTimeout(() => setAnimationStep('logo-move'), 1200),
      setTimeout(() => setAnimationStep('content-visible'), 2200),
    ];

    return () => sequence.forEach(clearTimeout);
  }, []);

  return (
    <section className="relative container flex flex-col justify-center items-center min-h-screen text-center py-24 md:py-32 overflow-hidden">
      <FloatingIcons />

      <div
        className={cn(
          "absolute transition-all duration-1000 ease-[cubic-bezier(0.45,0,0.55,1)]",
          animationStep === 'logo-start' && 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 scale-150',
          animationStep === 'logo-move' && 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 scale-150 animate-logo-flip-in',
          animationStep === 'content-visible' && 'top-12 left-8 -translate-x-0 -translate-y-0 scale-[0.8]'
        )}
      >
        <div className={cn(
          "transition-opacity duration-500",
          animationStep === 'logo-start' ? 'opacity-0' : 'opacity-100'
        )}>
           <Logo />
        </div>
      </div>
      
      <div 
        className={cn(
          "relative z-10 flex flex-col items-center transition-opacity duration-1000",
          animationStep === 'content-visible' ? 'opacity-100' : 'opacity-0'
        )}
      >
        <div className="h-24" /> {/* Placeholder to push content down */}
        
        <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-tighter text-foreground">
          <TextFlipper delay={0.8}>SMART</TextFlipper>{' '}
          <TextFlipper delay={1.0} className="font-cursive text-primary">Rural</TextFlipper>{' '}
          <TextFlipper delay={1.2}>CARE</TextFlipper>
        </h1>
        
        <p 
          className="mt-8 max-w-xl text-lg text-muted-foreground animate-text-fade-in-scale"
          style={{ animationDelay: '1.8s' }}
        >
          Get instant access to doctors, medicines, and emergency services.
          <br/>
          <span className="font-bold text-foreground">Healthcare, simplified and connected.</span>
        </p>

        <div 
          className="mt-10 flex items-center gap-4 animate-button-press-in"
          style={{ animationDelay: '2.1s' }}
        >
          <Button 
            size="lg" 
            className="rounded-full shadow-lg text-lg px-8 py-6 bg-primary hover:bg-primary/90 text-primary-foreground transform transition-transform hover:scale-105"
          >
            <Play className="mr-2 h-5 w-5 fill-current" />
            Get Started Now
          </Button>
        </div>
      </div>
    </section>
  );
}
