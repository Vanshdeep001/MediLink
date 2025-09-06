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
            d="M6 8V14C6 17.3137 8.68629 20 12 20H13"
            stroke="url(#logo-gradient)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M18 8V14C18 17.3137 15.3137 20 12 20H11"
            stroke="url(#logo-gradient)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="6" cy="6" r="2" stroke="url(#logo-gradient)" strokeWidth="2" />
          <circle cx="18" cy="6" r="2" stroke="url(#logo-gradient)" strokeWidth="2" />
          <path
            d="M12 20V24"
            stroke="url(#logo-gradient)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </svg>
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tighter">MediLink</h1>
        <p className="text-xs text-primary tracking-widest font-sans font-semibold">HEALTHCARE</p>
      </div>
    </div>
  );
}
