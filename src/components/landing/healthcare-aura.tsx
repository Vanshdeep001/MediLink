import React from 'react';

export function HealthcareAura() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none select-none">
      {/* Soft gradient blobs */}
      <div className="absolute -top-24 -left-24 w-[32rem] h-[32rem] rounded-full bg-primary/20 blur-3xl animate-aura-float" style={{ animationDelay: '0s' }} />
      <div className="absolute top-1/3 -right-24 w-[28rem] h-[28rem] rounded-full bg-emerald-400/20 dark:bg-emerald-300/10 blur-3xl animate-aura-float" style={{ animationDelay: '3s' }} />
      <div className="absolute bottom-0 left-1/4 w-[24rem] h-[24rem] rounded-full bg-sky-400/20 dark:bg-sky-300/10 blur-3xl animate-aura-float" style={{ animationDelay: '1.5s' }} />

      {/* Drifting medical plus signs */}
      <div className="absolute inset-0">
        {Array.from({ length: 10 }).map((_, i) => {
          const left = Math.random() * 100;
          const top = Math.random() * 100;
          const delay = Math.random() * 6;
          const size = 16 + Math.random() * 20;
          const opacity = 0.06 + Math.random() * 0.12;
          return (
            <div
              key={i}
              className="absolute text-primary animate-plus-drift"
              style={{ left: `${left}%`, top: `${top}%`, animationDelay: `${delay}s`, opacity }}
            >
              <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10.5 3h3v7.5H21v3h-7.5V21h-3v-7.5H3v-3h7.5V3z" fill="currentColor" />
              </svg>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        @keyframes auraFloat {
          0% { transform: translateY(0px) translateX(0px) scale(1); }
          50% { transform: translateY(-20px) translateX(10px) scale(1.03); }
          100% { transform: translateY(0px) translateX(0px) scale(1); }
        }
        .animate-aura-float { animation: auraFloat 12s ease-in-out infinite; }

        @keyframes plusDrift {
          0% { transform: translateY(0) translateX(0) rotate(0deg); }
          50% { transform: translateY(-12px) translateX(8px) rotate(6deg); }
          100% { transform: translateY(0) translateX(0) rotate(0deg); }
        }
        .animate-plus-drift { animation: plusDrift 10s ease-in-out infinite; }
      `}</style>
    </div>
  );
}

export default HealthcareAura;



