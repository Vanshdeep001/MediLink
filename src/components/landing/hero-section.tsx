"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { AnimatedStethoscope } from "./animated-stethoscope";
import { Logo } from "@/components/logo";

const Starfield = () => (
  <div className="starfield" aria-hidden="true">
    {Array.from({ length: 150 }).map((_, i) => (
      <div
        key={i}
        className="stars stars-sm"
        style={{
          top: `${Math.random() * 4000 - 2000}px`,
          left: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 150}s`,
        }}
      />
    ))}
    {Array.from({ length: 100 }).map((_, i) => (
      <div
        key={i}
        className="stars stars-md"
        style={{
          top: `${Math.random() * 4000 - 2000}px`,
          left: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 100}s`,
        }}
      />
    ))}
    {Array.from({ length: 50 }).map((_, i) => (
      <div
        key={i}
        className="stars stars-lg"
        style={{
          top: `${Math.random() * 4000 - 2000}px`,
          left: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 50}s`,
        }}
      />
    ))}
  </div>
);

export function HeroSection() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 100), // Reveal Logo
      setTimeout(() => setStep(2), 2100), // Move Logo
      setTimeout(() => setStep(3), 3100), // Reveal Taglines
    ];

    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <section className="relative container min-h-screen text-center py-24 md:py-32 overflow-hidden">
      <Starfield />
      <div className="absolute inset-0 flex items-center justify-center opacity-10">
        <AnimatedStethoscope />
      </div>

      <div
        className={cn(
          "absolute inset-0 flex items-center justify-center transition-all duration-1000 ease-in-out",
          step >= 2
            ? "top-8 left-8 items-start justify-start md:top-14 md:left-14"
            : ""
        )}
      >
        <div className="flex items-center space-x-4">
          <div
            className={cn(
              "transform scale-75 opacity-0 transition-all duration-1000 ease-in-out",
              step >= 1 && "scale-100 opacity-100",
              step >= 2 ? "w-10 h-10" : "w-24 h-24 md:w-32 md:h-32"
            )}
          >
            <Logo />
          </div>
          <h1
            className={cn(
              "text-7xl md:text-8xl lg:text-9xl font-bold tracking-tighter text-primary glow-effect transition-all duration-1000 ease-in-out",
              "transform scale-75 opacity-0",
              step >= 1 && "scale-100 opacity-100",
              step >= 2 && "text-4xl md:text-5xl"
            )}
            style={{ fontFamily: "'Orbitron', sans-serif" }}
          >
            MediLink
          </h1>
        </div>
      </div>

      <div
        className={cn(
          "relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-200px)] space-y-4 text-2xl md:text-3xl lg:text-4xl text-foreground/90 transition-opacity duration-700 ease-out",
          step >= 3 ? "opacity-100" : "opacity-0"
        )}
      >
        <p style={{fontFamily: "'Lora', serif"}} className="italic">
          Care. <span style={{fontFamily: "'Roboto Mono', monospace"}} className="not-italic font-semibold text-foreground">Simplified.</span>
        </p>
        <p style={{fontFamily: "'Lora', serif"}} className="italic">
          Health. <span style={{fontFamily: "'Roboto Mono', monospace"}} className="not-italic font-semibold text-foreground">Connected.</span>
        </p>
      </div>
    </section>
  );
}
