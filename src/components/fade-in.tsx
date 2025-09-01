"use client";

import { useRef, useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FadeInProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
  yOffset?: number;
  xOffset?: number;
}

export function FadeIn({
  children,
  className,
  delay = 0,
  direction = "up",
  yOffset = 24,
  xOffset = 24,
}: FadeInProps) {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    const { current } = domRef;
    if (current) {
      observer.observe(current);
    }

    return () => {
      if (current) {
        observer.unobserve(current);
      }
    };
  }, []);
  
  const getTransform = () => {
      if (isVisible) return 'translate3d(0, 0, 0)';
      switch(direction) {
          case 'up': return `translate3d(0, ${yOffset}px, 0)`;
          case 'down': return `translate3d(0, -${yOffset}px, 0)`;
          case 'left': return `translate3d(${xOffset}px, 0, 0)`;
          case 'right': return `translate3d(-${xOffset}px, 0, 0)`;
          default: return '';
      }
  }

  return (
    <div
      ref={domRef}
      style={{ transitionDelay: `${delay}ms`, transform: getTransform() }}
      className={cn(
        "transition-all duration-700 ease-out",
        isVisible ? "opacity-100" : "opacity-0",
        className
      )}
    >
      {children}
    </div>
  );
}
