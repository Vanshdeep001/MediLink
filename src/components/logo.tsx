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
        <defs>
          <linearGradient
            id="logo-gradient-1"
            x1="5.66895"
            y1="8"
            x2="20.4385"
            y2="20.0327"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="hsl(var(--logo-color-2))" />
            <stop offset="1" stopColor="hsl(var(--logo-color-1))" />
          </linearGradient>
          <linearGradient
            id="logo-gradient-2"
            x1="5.66895"
            y1="28"
            x2="20.4385"
            y2="40.0327"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="hsl(var(--logo-color-2))" />
            <stop offset="1" stopColor="hsl(var(--logo-color-1))" />
          </linearGradient>
           <linearGradient
            id="logo-gradient-3"
            x1="25.669"
            y1="8"
            x2="40.4385"
            y2="20.0327"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="hsl(var(--logo-color-2))" />
            <stop offset="1" stopColor="hsl(var(--logo-color-1))" />
          </linearGradient>
           <linearGradient
            id="logo-gradient-4"
            x1="25.669"
            y1="28"
            x2="40.4385"
            y2="40.0327"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="hsl(var(--logo-color-2))" />
            <stop offset="1" stopColor="hsl(var(--logo-color-1))" />
          </linearGradient>
        </defs>
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M0 8C0 3.58172 3.58172 0 8 0H40C44.4183 0 48 3.58172 48 8V40C48 44.4183 44.4183 48 40 48H8C3.58172 48 0 44.4183 0 40V8Z"
          fill="hsl(var(--logo-color-3))"
        />
        <g transform="translate(4, 4)">
            <path d="M12 4C7.58172 4 4 7.58172 4 12V14C4 18.4183 7.58172 22 12 22H14V4H12Z" fill="url(#logo-gradient-1)"/>
            <path d="M14 24H12C7.58172 24 4 27.5817 4 32V34C4 38.4183 7.58172 42 12 42H14V24Z" fill="url(#logo-gradient-2)"/>
            <path d="M28 4C23.5817 4 20 7.58172 20 12V14C20 18.4183 23.5817 22 28 22H30V4H28Z" fill="url(#logo-gradient-3)"/>
            <path d="M30 24H28C23.5817 24 20 27.5817 20 32V34C20 38.4183 23.5817 42 28 42H30V24Z" fill="url(#logo-gradient-4)"/>
        </g>
      </svg>
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tighter">MediLink</h1>
        <p className="text-xs text-primary tracking-widest font-sans font-semibold">HEALTHCARE</p>
      </div>
    </div>
  );
}
