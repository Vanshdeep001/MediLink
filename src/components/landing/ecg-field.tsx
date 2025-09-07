import React from 'react';

export function EcgField() {
  return (
    <div className="absolute inset-0 -z-10 pointer-events-none select-none">
      <svg
        className="absolute inset-x-0 top-1/4 w-full h-24 opacity-30 text-primary"
        viewBox="0 0 1200 120"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="ecgLineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0" />
            <stop offset="10%" stopColor="currentColor" stopOpacity="0.8" />
            <stop offset="90%" stopColor="currentColor" stopOpacity="0.8" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M0 60 L80 60 L110 30 L130 90 L170 60 L260 60 L290 20 L305 90 L320 60 L420 60 L450 35 L470 85 L500 60 L600 60 L630 30 L650 90 L690 60 L780 60 L810 20 L825 90 L840 60 L940 60 L970 35 L990 85 L1020 60 L1120 60 L1200 60"
          fill="none"
          stroke="url(#ecgLineGrad)"
          strokeWidth="3"
        />
        <path
          className="ecg-dash"
          d="M0 60 L80 60 L110 30 L130 90 L170 60 L260 60 L290 20 L305 90 L320 60 L420 60 L450 35 L470 85 L500 60 L600 60 L630 30 L650 90 L690 60 L780 60 L810 20 L825 90 L840 60 L940 60 L970 35 L990 85 L1020 60 L1120 60 L1200 60"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>

      <svg
        className="absolute inset-x-0 bottom-1/4 w-full h-24 opacity-25 text-emerald-400 dark:text-emerald-300"
        viewBox="0 0 1200 120"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <path
          className="ecg-dash"
          d="M0 60 L80 60 L110 30 L130 90 L170 60 L260 60 L290 20 L305 90 L320 60 L420 60 L450 35 L470 85 L500 60 L600 60 L630 30 L650 90 L690 60 L780 60 L810 20 L825 90 L840 60 L940 60 L970 35 L990 85 L1020 60 L1120 60 L1200 60"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>

      <style jsx>{`
        @keyframes ecgDash {
          to { stroke-dashoffset: -2000; }
        }
        .ecg-dash {
          stroke-dasharray: 14 10;
          stroke-dashoffset: 0;
          animation: ecgDash 6s linear infinite;
        }
      `}</style>
    </div>
  );
}

export default EcgField;


