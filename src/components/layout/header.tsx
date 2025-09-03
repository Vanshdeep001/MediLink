'use client';

import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import ThemeToggleButton from '../ui/theme-toggle-button';

export function Header() {
  return (
    <header className="fixed top-0 z-50 w-full bg-background/80 backdrop-blur-sm">
      <div className="container flex h-24 max-w-screen-2xl items-center justify-between">
        <div className="flex items-center">
          <div className="w-48 h-auto">
            <Logo />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <nav className="hidden md:flex items-center space-x-6 text-lg">
            <Button variant="ghost">Services</Button>
            <Button variant="ghost">About</Button>
            <Button variant="ghost">Contact</Button>
          </nav>
          <ThemeToggleButton />
        </div>
      </div>
    </header>
  );
}
