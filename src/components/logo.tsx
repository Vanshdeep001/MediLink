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
            x1="0"
            y1="0"
            x2="48"
            y2="48"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="hsl(var(--logo-color-1))" />
            <stop offset="1" stopColor="hsl(var(--logo-color-2))" />
          </linearGradient>
        </defs>
        <rect width="48" height="48" rx="8" fill="hsl(var(--logo-color-3))" />
        <g
          transform="translate(8 8) scale(1.25)"
          stroke="url(#logo-gradient)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 8V14C6 17.3137 8.68629 20 12 20H13" />
          <path d="M20 8V14C20 17.3137 17.3137 20 14 20H13" />
          <path d="M13 20V22C13 23.1046 13.8954 24 15 24H16C17.1046 24 18 23.1046 18 22V21.5C18 19.0147 16.9853 17 14.5 17C12.0147 17 11 19.0147 11 21.5V22C11 23.1046 10.1046 24 9 24H8C6.89543 24 6 23.1046 6 22V19" />
          <circle cx="6" cy="6" r="2" />
          <circle cx="20" cy="6" r="2" />
        </g>
      </svg>
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tighter">MediLink</h1>
        <p className="text-xs text-primary tracking-widest font-sans font-semibold">HEALTHCARE</p>
      </div>
    </div>
  );
}
