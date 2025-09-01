import { Logo } from "@/components/logo";

export function Footer() {
  return (
    <footer className="border-t border-border/40">
      <div className="container py-8 text-center text-muted-foreground">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <div className="w-6 h-6">
            <Logo />
          </div>
          <span className="font-bold text-lg text-foreground">MediLink</span>
        </div>
        <p>&copy; {new Date().getFullYear()} MediLink. All rights reserved.</p>
        <p className="text-sm mt-2">Connecting Healthcare Seamlessly.</p>
      </div>
    </footer>
  );
}
