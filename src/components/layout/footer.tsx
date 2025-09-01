import { Stethoscope } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/40">
      <div className="container py-8 text-center text-muted-foreground">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <Stethoscope className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg text-foreground">MediLink</span>
        </div>
        <p>&copy; {new Date().getFullYear()} MediLink. All rights reserved.</p>
        <p className="text-sm mt-2">Connecting Healthcare Seamlessly.</p>
      </div>
    </footer>
  );
}
