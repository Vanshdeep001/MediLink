"use client";

import React, { useEffect } from "react";

interface DoctorIntroProps {
  onFinish?: () => void;
  durationMs?: number;
}

export function DoctorIntro({ onFinish, durationMs = 1800 }: DoctorIntroProps) {
  useEffect(() => {
    const timer = setTimeout(() => onFinish?.(), durationMs);
    return () => clearTimeout(timer);
  }, [onFinish, durationMs]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-background">
      <div className="relative w-[220px] h-[220px] animate-intro-pop">
        <div className="absolute inset-0 rounded-full bg-primary/10 blur-2xl animate-intro-pulse" />
        <svg
          viewBox="0 0 256 256"
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-10 w-full h-full drop-shadow-sm"
          aria-label="Doctor illustration"
        >
          <circle cx="128" cy="128" r="120" fill="var(--card)" />
          <circle cx="128" cy="88" r="28" fill="currentColor" opacity="0.85" />
          <rect x="84" y="118" width="88" height="64" rx="12" fill="currentColor" opacity="0.9" />
          <rect x="104" y="140" width="16" height="36" rx="2" fill="var(--background)" />
          <rect x="136" y="140" width="16" height="36" rx="2" fill="var(--background)" />
          <path d="M92 182 L164 182 L180 214 L76 214 Z" fill="currentColor" opacity="0.9" />
          <path d="M126 152 h4 v20 h-4 z" fill="currentColor" />
          <circle cx="155" cy="150" r="8" fill="var(--background)" />
          <path d="M155 146 v8" stroke="currentColor" strokeWidth="2" />
          <path d="M151 150 h8" stroke="currentColor" strokeWidth="2" />
        </svg>
      </div>

      <style jsx>{`
        @keyframes introPop {
          0% { transform: scale(0.8); opacity: 0; }
          40% { transform: scale(1.02); opacity: 1; }
          70% { transform: scale(1); }
          100% { transform: scale(1); }
        }
        .animate-intro-pop { animation: introPop ${durationMs}ms ease-out both; }
        @keyframes introPulse { 0%, 100% { opacity: .25; } 50% { opacity: .45; } }
        .animate-intro-pulse { animation: introPulse 2.2s ease-in-out infinite; }
      `}</style>
    </div>
  );
}

export default DoctorIntro;


