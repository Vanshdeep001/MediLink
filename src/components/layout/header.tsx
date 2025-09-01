import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center justify-between">
        <div className="flex items-center">
          <div className="w-32 h-auto">
            <Logo />
          </div>
        </div>
        <nav className="hidden md:flex items-center space-x-2">
          <Button variant="ghost">Features</Button>
          <Button variant="ghost">About</Button>
          <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
            Get Started
          </Button>
        </nav>
      </div>
    </header>
  );
}
