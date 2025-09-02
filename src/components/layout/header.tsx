'use client';

import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function Header() {
  const [showLogo, setShowLogo] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLogo(true);
    }, 2200); // Same delay as the hero animation
    return () => clearTimeout(timer);
  }, []);

  return (
    <header className="fixed top-0 z-50 w-full bg-background/80 backdrop-blur-sm">
      <div className="container flex h-24 max-w-screen-2xl items-center justify-between">
        <div className={cn(
            "flex items-center transition-opacity duration-500",
            showLogo ? "opacity-100" : "opacity-0"
          )}>
          <div className="w-48 h-auto">
            <Logo />
          </div>
        </div>
        <nav className="hidden md:flex items-center space-x-6 text-lg">
          <Button variant="ghost">Services</Button>
          <Button variant="ghost">About</Button>
          <Button variant="ghost">Contact</Button>
        </nav>
      </div>
    </header>
  );
}
