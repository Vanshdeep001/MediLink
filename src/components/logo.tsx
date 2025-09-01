import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("w-full h-full", className)}
    >
      <defs>
        <clipPath id="clip-top-left-quarter">
          <path d="M 50,0 A 50,50 0 0 0 0,50 H 50 V 0 Z" />
        </clipPath>
        <clipPath id="clip-bottom-right-quarter">
          <path d="M 50,100 A 50,50 0 0 0 100,50 H 50 V 100 Z" />
        </clipPath>
      </defs>

      <g transform="translate(10, 10)" style={{ transformBox: "fill-box" }}>
        {/* Top-left */}
        <g transform="translate(0, 0)">
          <rect
            width="40"
            height="40"
            style={{ fill: "hsl(var(--logo-color-2))" }}
          />
          <rect
            width="40"
            height="40"
            style={{ fill: "white" }}
            clipPath="url(#clip-top-left-quarter)"
            transform="scale(-1, 1) translate(-40, 0)"
          />
        </g>

        {/* Bottom-left */}
        <rect
          x="0"
          y="40"
          width="40"
          height="40"
          style={{ fill: "hsl(var(--logo-color-2))" }}
        />

        {/* Bottom-right */}
        <g transform="translate(40, 40)">
          <rect
            width="40"
            height="40"
            style={{ fill: "hsl(var(--logo-color-3))" }}
          />
          <rect
            width="40"
            height="40"
            style={{ fill: "white" }}
            clipPath="url(#clip-bottom-right-quarter)"
            transform="scale(-1, -1) translate(-40, -40)"
          />
        </g>

        {/* Head */}
        <circle
          cx="60"
          cy="20"
          r="20"
          style={{ fill: "hsl(var(--logo-color-1))" }}
        />
      </g>
    </svg>
  );
}
