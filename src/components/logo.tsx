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
      >
        <rect width="48" height="48" rx="8" fill="hsl(var(--logo-color-3))" />
        <g transform="translate(12 12) scale(0.8)">
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
          <g transform="translate(3 3)">
            <rect x="0" y="0" width="8" height="18" rx="4" fill="url(#logo-gradient)" />
            <rect x="10" y="0" width="8" height="18" rx="4" fill="url(#logo-gradient)" />
            <rect x="0" y="20" width="8" height="10" rx="4" fill="url(#logo-gradient)" />
            <rect x="10" y="20" width="8" height="10" rx="4" fill="url(#logo-gradient)" />
          </g>
        </g>
      </svg>
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tighter">MediLink</h1>
        <p className="text-xs text-primary tracking-widest font-sans font-semibold">HEALTHCARE</p>
      </div>
    </div>
  );
}
