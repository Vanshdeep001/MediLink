"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 500),  // Logo
      setTimeout(() => setStep(2), 1500), // Taglines
      setTimeout(() => setStep(3), 3500), // Taglines move up
      setTimeout(() => setStep(4), 4300), // Button
    ];

    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <section className="relative container flex flex-col items-center justify-center min-h-screen text-center py-24 md:py-32 overflow-hidden">
      
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="relative w-full h-full">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-50"></div>
            <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-accent/20 rounded-full blur-3xl opacity-50"></div>
            <div className="absolute top-1/3 left-2/3 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-secondary/50 rounded-full blur-3xl opacity-50"></div>
        </div>
      </div>
      
      <div
        className={cn(
          "absolute top-24 left-1/2 -translate-x-1/2 transition-all duration-700 ease-in-out",
          step >= 1 ? "opacity-100" : "opacity-0"
        )}
      >
        <div className={cn("w-48 h-auto pop-in")}>
          <Logo />
        </div>
      </div>
      
      <div className="relative flex flex-col items-center justify-center min-h-[calc(100vh-200px)] space-y-4">
        <div 
          className={cn(
            "text-3xl md:text-4xl lg:text-5xl text-foreground/90 transition-all duration-700 ease-in-out",
            step >= 2 ? "opacity-100" : "opacity-0",
            step >= 3 && "move-up-shrink"
          )}
        >
          <h1 style={{ fontFamily: "'Lato', sans-serif" }} className="font-light slide-up-3d">
            Care. <span style={{ fontFamily: "'Poppins', sans-serif" }} className="font-semibold">Simplified.</span>
          </h1>
          <h1 style={{ fontFamily: "'Lato', sans-serif", animationDelay: '0.2s' }} className="font-light slide-up-3d">
            Health. <span style={{ fontFamily: "'Poppins', sans-serif" }} className="font-semibold">Connected.</span>
          </h1>
        </div>

        <div className={cn(
          "transition-opacity duration-500 ease-out",
          step >= 4 ? "opacity-100" : "opacity-0"
        )}>
          <Button 
            size="lg" 
            className="pop-in rounded-full shadow-lg text-lg px-8 py-6 bg-primary hover:bg-primary/90"
            style={{ animationDelay: '0.1s' }}
          >
            Get Started
          </Button>
        </div>
      </div>
    </section>
  );
}
