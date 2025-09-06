import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <svg
        width="48"
        height="48"
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="rounded-xl"
      >
        <rect width="48" height="48" rx="8" fill="hsl(var(--logo-color-3))" />
        <g transform="translate(12 12)">
          <defs>
            <linearGradient
              id="logo-gradient"
              x1="0"
              y1="0"
              x2="24"
              y2="24"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="hsl(var(--logo-color-1))" />
              <stop offset="1" stopColor="hsl(var(--logo-color-2))" />
            </linearGradient>
          </defs>
          <path
            d="M18 10V5C18 3.89543 17.1046 3 16 3H8C6.89543 3 6 3.89543 6 5V10"
            stroke="url(#logo-gradient)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
           <path 
            d="M6 10C6 12.2091 7.79086 14 10 14H14C16.2091 14 18 12.2091 18 10"
            stroke="url(#logo-gradient)" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            />
            <path 
            d="M14 14V19C14 20.1046 14.8954 21 16 21H17C18.1046 21 19 20.1046 19 19V17C19 15.8954 18.1046 15 17 15C15.8954 15 15.4549 15.2227 15 15.5" 
            stroke="url(#logo-gradient)" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            />
             <circle cx="19" cy="12.5" r="2.5" stroke="url(#logo-gradient)" strokeWidth="2" />
        </g>
      </svg>
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tighter">MediLink</h1>
        <p className="text-xs text-primary tracking-widest font-sans font-semibold">HEALTHCARE</p>
      </div>
    </div>
  );
}
