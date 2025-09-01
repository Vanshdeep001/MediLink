export function AnimatedStethoscope() {
  return (
    <div className="relative w-full max-w-md h-96 mx-auto flex items-center justify-center">
      <svg
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute w-full h-full"
      >
        <defs>
          <linearGradient id="dnaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: "hsl(var(--primary))", stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: "hsl(var(--accent))", stopOpacity: 1 }} />
          </linearGradient>
          <style>
            {`
              @keyframes dna-rotate {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }
              @keyframes dna-pulse {
                0%, 100% { transform: scale(1); opacity: 0.8; }
                50% { transform: scale(1.05); opacity: 1; }
              }
              .dna-strand {
                animation: dna-rotate 20s linear infinite;
                transform-origin: center;
              }
              .dna-helix {
                animation: dna-pulse 4s ease-in-out infinite;
                transform-origin: center;
              }
              
              @keyframes stethoscope-float {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-10px); }
              }
              .stethoscope {
                animation: stethoscope-float 6s ease-in-out infinite;
                transform-origin: center;
              }
            `}
          </style>
        </defs>
        
        <g className="dna-strand">
          <g className="dna-helix">
            <path
              d="M 100,20 C 50,60 150,100 100,140 S 50,180 100,180"
              stroke="url(#dnaGradient)"
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M 100,20 C 150,60 50,100 100,140 S 150,180 100,180"
              stroke="url(#dnaGradient)"
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
            />
            {Array.from({ length: 7 }).map((_, i) => (
              <line
                key={i}
                x1={100 - 20 * Math.sin(i * 0.9)}
                y1={35 + i * 20}
                x2={100 + 20 * Math.sin(i * 0.9)}
                y2={35 + i * 20}
                stroke="hsl(var(--primary) / 0.5)"
                strokeWidth="2"
                strokeLinecap="round"
              />
            ))}
          </g>
        </g>
        
        <g className="stethoscope">
          <path 
            d="M 70 50 C 70 30, 130 30, 130 50 L 130 80 Q 130 90, 120 90 L 80 90 Q 70 90, 70 80 Z"
            fill="hsl(var(--muted))"
            stroke="hsl(var(--foreground))"
            strokeWidth="2"
          />
          <line x1="70" y1="50" x2="60" y2="40" stroke="hsl(var(--foreground))" strokeWidth="2" />
          <line x1="130" y1="50" x2="140" y2="40" stroke="hsl(var(--foreground))" strokeWidth="2" />
          <circle cx="60" cy="40" r="5" fill="hsl(var(--secondary))" />
          <circle cx="140" cy="40" r="5" fill="hsl(var(--secondary))" />
          <path 
            d="M 100 90 C 100 110, 80 120, 70 140 C 60 160, 100 180, 100 180 C 100 180, 140 160, 130 140 C 120 120, 100 110, 100 90 Z"
            fill="none"
            stroke="hsl(var(--foreground))"
            strokeWidth="2"
          />
          <circle cx="100" cy="180" r="15" fill="hsl(var(--accent))" stroke="hsl(var(--background))" strokeWidth="3" />
          <circle cx="100" cy="180" r="8" fill="hsl(var(--background))" />
        </g>
      </svg>
    </div>
  );
}
