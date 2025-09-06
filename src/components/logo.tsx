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
            id="logo-gradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="hsl(var(--logo-color-1))" />
            <stop offset="100%" stopColor="hsl(var(--logo-color-2))" />
          </linearGradient>
        </defs>
        <path
          d="M0 8C0 3.58172 3.58172 0 8 0H40C44.4183 0 48 3.58172 48 8V40C48 44.4183 44.4183 48 40 48H8C3.58172 48 0 44.4183 0 40V8Z"
          fill="hsl(var(--logo-color-3))"
        />
        <path 
          d="M10 34V22.2L16.6 27.4L20.8 16L24.8 29.8L29.4 24L38 34H34.4L28.6 27L24.8 38L20.4 21.8L13.6 29.2L10 34Z" 
          fill="url(#logo-gradient)"
        />
      </svg>
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tighter">MediLink</h1>
        <p className="text-xs text-primary tracking-widest font-sans font-semibold">HEALTHCARE</p>
      </div>
    </div>
  );
}
