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
        <g clipPath="url(#clip0_101_2)">
          <path
            d="M24 10C24 9.44772 23.5523 9 23 9H15C11.6863 9 9 11.6863 9 15V23C9 23.5523 9.44772 24 10 24C10.5523 24 11 23.5523 11 23V15C11 12.7909 12.7909 11 15 11H23C23.5523 11 24 10.5523 24 10Z"
            fill="url(#logo-gradient)"
          />
          <path
            d="M38 24C38.5523 24 39 24.4477 39 25V33C39 36.3137 36.3137 39 33 39H25C24.4477 39 24 38.5523 24 38C24 37.4477 24.4477 37 25 37H33C35.2091 37 37 35.2091 37 33V25C37 24.4477 37.4477 24 38 24Z"
            fill="url(#logo-gradient)"
          />
          <path
            d="M10 24C9.44772 24 9 24.4477 9 25V33C9 36.3137 11.6863 39 15 39H23C23.5523 39 24 38.5523 24 38C24 37.4477 23.5523 37 23 37H15C12.7909 37 11 35.2091 11 33V25C11 24.4477 10.5523 24 10 24Z"
            fill="url(#logo-gradient)"
          />
          <path
            d="M38 24C37.4477 24 37 24.4477 37 25V33C37 35.2091 35.2091 37 33 37H25C24.4477 37 24 37.4477 24 38C24 38.5523 24.4477 39 25 39H33C36.3137 39 39 36.3137 39 33V25C39 24.4477 38.5523 24 38 24Z"
            fill="url(#logo-gradient)"
          />
           <path
            d="M24 10C24 10.5523 24.4477 11 25 11H33C35.2091 11 37 12.7909 37 15V23C37 23.5523 37.4477 24 38 24C38.5523 24 39 23.5523 39 23V15C39 11.6863 36.3137 9 33 9H25C24.4477 9 24 9.44772 24 10Z"
            fill="url(#logo-gradient)"
          />
        </g>
        <defs>
          <clipPath id="clip0_101_2">
            <rect width="48" height="48" fill="white" />
          </clipPath>
        </defs>
      </svg>
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tighter">MediLink</h1>
        <p className="text-xs text-primary tracking-widest font-sans font-semibold">HEALTHCARE</p>
      </div>
    </div>
  );
}
