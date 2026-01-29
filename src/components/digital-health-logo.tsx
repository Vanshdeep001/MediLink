import { cn } from "@/lib/utils";

export function DigitalHealthLogo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <svg
        width="48"
        height="48"
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="digitalHealthGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{stopColor:'#3b82f6', stopOpacity:1}} />
            <stop offset="100%" style={{stopColor:'#1e40af', stopOpacity:1}} />
          </linearGradient>
        </defs>
        <rect width="48" height="48" rx="12" fill="url(#digitalHealthGradient)" />
        <text
          x="24"
          y="30"
          textAnchor="middle"
          fill="black"
          fontSize="10"
          fontWeight="bold"
          fontFamily="system-ui, -apple-system, sans-serif"
        >
          MediLink
        </text>
      </svg>
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tighter">
          MediLink
        </h1>
      </div>
    </div>
  );
}











