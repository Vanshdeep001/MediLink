import React from 'react';

export function MedicalGrid() {
  return (
    <div className="absolute inset-0 -z-10 pointer-events-none select-none overflow-hidden">
      <div className="absolute inset-0 opacity-[0.08] dark:opacity-[0.06]">
        <svg
          className="w-[200%] h-[200%] animate-grid-pan"
          viewBox="0 0 100 100"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.2" />
            </pattern>
            <radialGradient id="pulse" cx="50%" cy="50%" r="60%">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.25" />
              <stop offset="60%" stopColor="currentColor" stopOpacity="0.08" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          <circle className="animate-pulse-soft" cx="70" cy="30" r="20" fill="url(#pulse)" />
          <circle className="animate-pulse-soft delay-700" cx="20" cy="70" r="18" fill="url(#pulse)" />
        </svg>
      </div>

      <style jsx>{`
        @keyframes gridPan {
          0% { transform: translate3d(0, 0, 0); }
          50% { transform: translate3d(-6%, -6%, 0); }
          100% { transform: translate3d(0, 0, 0); }
        }
        .animate-grid-pan { animation: gridPan 24s ease-in-out infinite; }
        @keyframes pulseSoft {
          0%, 100% { opacity: 0.0; transform: scale(0.95); }
          40% { opacity: 1; transform: scale(1); }
        }
        .animate-pulse-soft { animation: pulseSoft 8s ease-in-out infinite; }
      `}</style>
    </div>
  );
}

export default MedicalGrid;


