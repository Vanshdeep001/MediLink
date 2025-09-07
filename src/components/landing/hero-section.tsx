'use client';

import { useContext } from 'react';
import Image from 'next/image';
import WrapButton from '../ui/wrap-button';
import TextFlipper from '../ui/text-effect-flipper';
import { LanguageContext } from '@/context/language-context';

export function HeroSection() {
  const { translations } = useContext(LanguageContext);

  return (
    <section className="relative container flex flex-col justify-center items-center min-h-screen text-center py-24 md:py-32 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-100 -z-10"></div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full max-w-6xl">
        {/* Left side - Text content */}
        <div className="relative z-10 flex flex-col items-center lg:items-start text-center lg:text-left">
        <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-tighter text-foreground">
          <TextFlipper delay={0.8}>{translations.hero.smart}</TextFlipper>{' '}
          <TextFlipper delay={1.0} className="font-cursive text-primary mr-2 md:mr-3">
            {translations.hero.rural}
          </TextFlipper>{' '}
          <TextFlipper delay={1.2}>{translations.hero.care}</TextFlipper>
        </h1>

        <p
          className="mt-8 max-w-xl text-lg text-muted-foreground animate-text-fade-in-scale"
          style={{ animationDelay: '1.8s' }}
        >
          {translations.hero.tagline}
          <br />
          <span className="font-bold text-foreground">
            {translations.hero.subTagline}
          </span>
        </p>

        <div
          className="mt-10 flex items-center gap-4 animate-button-press-in"
          style={{ animationDelay: '2.1s' }}
        >
          <WrapButton href="/auth" className="hover:scale-105 transition-transform duration-300">{translations.hero.getStarted}</WrapButton>
        </div>
        </div>
        
        {/* Right side - Healthcare illustration */}
        <div className="relative z-10 flex justify-center lg:justify-end">
          <div className="relative w-full max-w-lg h-96">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-blue-200/30 rounded-3xl transform rotate-3"></div>
            <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl p-4 shadow-2xl overflow-hidden">
              <Image
                src="/healthcare-illustration.jpg"
                alt="Doctor and Patient connected through technology"
                width={400}
                height={350}
                className="w-full h-full object-cover rounded-2xl"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
