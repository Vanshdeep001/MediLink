import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";

export function Header() {
  return (
    <header className="fixed top-0 z-50 w-full bg-background/80 backdrop-blur-sm">
      <div className="container flex h-20 max-w-screen-2xl items-center justify-between">
        <div className="flex items-center">
          <div className="w-32 h-auto">
            <Logo />
          </div>
        </div>
        <nav className="hidden md:flex items-center space-x-2">
          <Button variant="ghost">Features</Button>
          <Button variant="ghost">About</Button>
          <Button className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground">
            Get Started
          </Button>
        </nav>
      </div>
    </header>
  );
}
