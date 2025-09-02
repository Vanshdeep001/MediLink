'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';
import { Logo } from '../logo';
import { FloatingIcons } from './floating-icons';

export function HeroSection() {
  const [startAnimation, setStartAnimation] = useState(false);

  useEffect(() => {
    // Ensure this only runs on the client
    setStartAnimation(true);
  }, []);

  if (!startAnimation) {
    return null; // or a loading spinner
  }

  return (
    <section className="relative container flex flex-col justify-center items-center min-h-screen text-center py-24 md:py-32 overflow-hidden">
      <FloatingIcons />
      
      <div className="relative z-10 flex flex-col items-center">
        <div className="mb-8 animate-logo-flip-in" style={{ animationDelay: '0s' }}>
          <Logo />
        </div>
        
        <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-tighter text-foreground" style={{ perspective: '1000px' }}>
          <span className="animate-word-rotate-in" style={{ animationDelay: '0.5s', transformOrigin: 'left center' }}>SMART</span>
          <span className="text-primary animate-word-rotate-in" style={{ animationDelay: '0.7s', transformOrigin: 'center center' }}>RURAL</span>
          <span className="animate-word-rotate-in" style={{ animationDelay: '0.9s', transformOrigin: 'right center' }}>CARE</span>
        </h1>
        
        <p 
          className="mt-8 max-w-xl text-lg text-muted-foreground animate-text-fade-in-scale"
          style={{ animationDelay: '1.2s' }}
        >
          Get instant access to doctors, medicines, and emergency services.
          <br/>
          <span className="font-bold text-foreground">Healthcare, simplified and connected.</span>
        </p>

        <div 
          className="mt-10 flex items-center gap-4 animate-button-press-in"
          style={{ animationDelay: '1.5s' }}
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
