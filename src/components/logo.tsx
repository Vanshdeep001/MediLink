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
        <path d="M14 20L24 28L34 20V25L24 33L14 25V20Z" fill="url(#logo-gradient-1)" />
        <path d="M14 15L24 23L34 15V20L24 28L14 20V15Z" fill="url(#logo-gradient-2)" />
      </svg>
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tighter">MediLink</h1>
        <p className="text-xs text-primary tracking-widest font-sans font-semibold">HEALTHCARE</p>
      </div>
    </div>
  );
}
