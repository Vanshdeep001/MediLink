export function PharmacyIcon() {
    return (
        <svg
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: "hsl(var(--primary))", stopOpacity: 0.2 }} />
            <stop offset="100%" style={{ stopColor: "hsl(var(--primary))", stopOpacity: 0 }} />
          </linearGradient>
        </defs>
        <g transform="translate(100 100)">
        <path
            d="M56.2,-43.3C70.9,-27.8,79.5,-2.9,76.5,21.1C73.4,45.1,58.6,68.2,38.6,78.2C18.6,88.2,-6.6,85.1,-29.1,72.7C-51.6,60.3,-71.4,38.6,-77.8,13.7C-84.3,-11.2,-77.4,-39.3,-60.7,-54C-43.9,-68.8,-17.3,-70.2,-0.2,-69.9C16.9,-69.7,33.8,-67.7,45.9,-59.2L56.2,-43.3Z"
            fill="url(#grad1)"
            transform="translate(-100 -100) translate(100 100)"
          />
          <g className="transition-transform duration-300 group-hover:scale-110">
            <path
              d="M-5.4-25.5c-4.4,0-8-3.6-8-8V-50h26.8v16.5c0,4.4-3.6,8-8,8H-5.4z"
              fill="#90caf9"
            />
            <path
              d="M-13.4-25.5v-10.3c0-3.3,2.7-6,6-6h2.8c3.3,0,6,2.7,6,6v10.3H-13.4z"
              fill="#42a5f5"
            />
            <path
              d="M34.5,50H-34.5c-4.4,0-8-3.6-8-8v-59c0-4.4,3.6-8,8-8h69.1c4.4,0,8,3.6,8,8v59 C42.5,46.4,38.9,50,34.5,50z"
              fill="#e3f2fd"
            />
            <path
              d="M-28.7,40.2h63.5c1.1,0,2-0.9,2-2V-15.1c0-1.1-0.9-2-2-2H-28.7c-1.1,0-2,0.9-2,2V38.2 C-30.7,39.3,-29.8,40.2,-28.7,40.2z"
              fill="#bbdefb"
            />
            <g>
              <path
                d="M13.6,13.6H9.7V9.7c0-0.7-0.6-1.3-1.3-1.3s-1.3,0.6-1.3,1.3v3.9H3.2c-0.7,0-1.3,0.6-1.3,1.3 s0.6,1.3,1.3,1.3H7V20c0,0.7,0.6,1.3,1.3,1.3s1.3-0.6,1.3-1.3v-3.9h3.9c0.7,0,1.3-0.6,1.3-1.3S14.3,13.6,13.6,13.6z"
                fill="#ffffff"
              />
            </g>
          </g>
        </g>
      </svg>
    );
}