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
        <rect width="48" height="48" rx="8" fill="hsl(224,71%,10%)" />
        <svg
          x="12"
          y="12"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M5.15039 12.0001V8.2501C5.15039 6.2001 6.80039 4.5501 8.85039 4.5501H11.5004C13.5504 4.5501 15.2004 6.2001 15.2004 8.2501V12.0001M5.15039 12.0001C5.15039 14.5001 7.15039 16.5001 9.65039 16.5001C11.0504 16.5001 12.2504 15.8001 13.0504 14.8001L15.3004 11.9501C16.2004 10.9501 17.7504 10.9501 18.6504 11.9501C19.5504 12.9501 19.5504 14.5001 18.6504 15.4001L17.5004 16.5501C17.5004 18.2001 16.1504 19.5501 14.5004 19.5501C12.8504 19.5501 11.5004 18.2001 11.5004 16.5501"
            stroke="hsl(var(--primary) / 0.7)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </svg>
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tighter">
          MediLink
        </h1>
      </div>
    </div>
  );
}
