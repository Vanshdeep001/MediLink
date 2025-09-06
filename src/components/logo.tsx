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
        <svg
          x="12"
          y="12"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="hsl(var(--logo-color-1))"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 12a9 9 0 0 1 9-9v0a9 9 0 0 1 9 9v3a6 6 0 0 1-6 6v0a6 6 0 0 1-6-6v-3" />
          <path d="M12 3v-2" />
          <circle cx="12" cy="21" r="2" />
          <circle cx="6" cy="15" r="2" fill="hsl(var(--logo-color-2))" stroke="hsl(var(--logo-color-2))"/>
        </svg>
      </svg>
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tighter">MediLink</h1>
        <p className="text-xs text-primary tracking-widest font-sans font-semibold">HEALTHCARE</p>
      </div>
    </div>
  );
}
