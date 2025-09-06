'use client';

import { useContext } from 'react';
import WrapButton from '../ui/wrap-button';
import { FloatingIcons } from './floating-icons';
import TextFlipper from '../ui/text-effect-flipper';
import { LanguageContext } from '@/context/language-context';

export function HeroSection() {
  const { translations } = useContext(LanguageContext);

  return (
    <section className="relative container flex flex-col justify-center items-center min-h-screen text-center py-24 md:py-32 overflow-hidden">
      <FloatingIcons />

      <div className="relative z-10 flex flex-col items-center">
        <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-tighter text-foreground">
          <TextFlipper delay={0.8}>{translations.hero.smart}</TextFlipper>{' '}
          <TextFlipper delay={1.0} className="font-cursive text-primary">
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
          <WrapButton href="/auth">{translations.hero.getStarted}</WrapButton>
        </div>
      </div>
    </section>
  );
}
