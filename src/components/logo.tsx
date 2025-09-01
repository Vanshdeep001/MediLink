import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 50"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("w-full h-full", className)}
    >
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: "hsl(var(--logo-color-1))" }} />
          <stop offset="100%" style={{ stopColor: "hsl(var(--logo-color-2))" }} />
        </linearGradient>
      </defs>
      <path d="M10 25 C 15 10, 25 10, 30 25 S 45 40, 50 25" stroke="url(#logoGradient)" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="10" cy="25" r="4" fill="hsl(var(--logo-color-1))" />
      <circle cx="50" cy="25" r="4" fill="hsl(var(--logo-color-2))" />
      <text
        x="65"
        y="35"
        fontFamily="'Poppins', sans-serif"
        fontSize="30"
        fontWeight="600"
        fill="hsl(var(--logo-color-3))"
      >
        MediLink
      </text>
    </svg>
  );
}
