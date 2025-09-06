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
            x1="50%"
            y1="0%"
            x2="50%"
            y2="100%"
          >
            <stop
              offset="0%"
              stopColor="hsl(var(--logo-color-2))"
            />
            <stop
              offset="100%"
              stopColor="hsl(var(--logo-color-1))"
            />
          </linearGradient>
           <linearGradient
            id="logo-gradient-2"
            x1="50%"
            y1="0%"
            x2="50%"
            y2="100%"
          >
            <stop
              offset="0%"
              stopColor="hsl(var(--logo-color-1))"
            />
            <stop
              offset="100%"
              stopColor="hsl(var(--logo-color-2))"
            />
          </linearGradient>
        </defs>
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M0 8C0 3.58172 3.58172 0 8 0H40C44.4183 0 48 3.58172 48 8V40C48 44.4183 44.4183 48 40 48H8C3.58172 48 0 44.4183 0 40V8Z"
          fill="hsl(var(--logo-color-3))"
        />
        {/* New Logo SVG */}
        <g transform="translate(4, 4)">
          <path d="M18 6C18 2.68629 15.3137 0 12 0H8C4.68629 0 2 2.68629 2 6V14H18V6Z" fill="url(#logo-gradient-1)"/>
          <path d="M22 18C25.3137 18 28 20.6863 28 24V28C28 31.3137 25.3137 34 22 34H14V18H22Z" fill="url(#logo-gradient-1)"/>
          <path d="M6 22C2.68629 22 0 24.6863 0 28V32C0 35.3137 2.68629 38 6 38H14V22H6Z" fill="url(#logo-gradient-2)"/>
          <path d="M34 14C37.3137 14 40 11.3137 40 8V4C40 0.686292 37.3137 -2 34 -2H26V14H34Z" fill="url(#logo-gradient-2)"/>
        </g>
      </svg>
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tighter">MediLink</h1>
        <p className="text-xs text-primary tracking-widest font-sans font-semibold">HEALTHCARE</p>
      </div>
    </div>
  );
}
