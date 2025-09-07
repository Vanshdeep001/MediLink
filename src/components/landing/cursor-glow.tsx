"use client";

import React, { useEffect, useRef, useState } from "react";

export function CursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleMove = (e: MouseEvent) => {
      const el = glowRef.current;
      if (!el) return;
      const x = e.clientX;
      const y = e.clientY;
      el.style.transform = `translate3d(${x - 150}px, ${y - 150}px, 0)`;
    };
    window.addEventListener("mousemove", handleMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  if (!mounted) return null;

  return (
    <div
      ref={glowRef}
      className="pointer-events-none fixed top-0 left-0 z-[1] h-[300px] w-[300px] rounded-full opacity-30 blur-3xl will-change-transform"
      style={{
        background:
          "radial-gradient(circle at center, rgba(56,189,248,0.35), rgba(99,102,241,0.25) 40%, rgba(236,72,153,0.15) 70%, transparent 80%)",
      }}
    />
  );
}

export default CursorGlow;


