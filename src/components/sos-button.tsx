
"use client";

import { useContext } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Siren } from "lucide-react";
import { usePathname } from "next/navigation";
import { LanguageContext } from "@/context/language-context";

// This component is the dialog part, which can be triggered by any button
export function SOSButtonDialog({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();
  const { translations } = useContext(LanguageContext);

  const handleConfirm = () => {
    toast({
      title: translations.sos.toastTitle,
      description: translations.sos.toastDescription,
      variant: "destructive",
    });
  };

  return (
    <AlertDialog>
        <div className="contents" onClick={(e) => e.preventDefault()}>
            <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
        </div>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>{translations.sos.title}</AlertDialogTitle>
            <AlertDialogDescription>
                {translations.sos.description}
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel>{translations.sos.cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm} className="bg-destructive hover:bg-destructive/90">
                {translations.sos.confirm}
            </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
  );
}


// This is the main FAB component, visible on mobile
export function SOSButton() {
  const pathname = usePathname();
  const { translations } = useContext(LanguageContext);
  
  if (pathname !== '/patient') {
    return null;
  }
  
  return (
    <div className="fixed bottom-6 right-6 z-50 md:hidden">
      <SOSButtonDialog>
        <Button
          variant="destructive"
          size="icon"
          className="w-16 h-16 rounded-full shadow-lg animate-pulse-slow"
        >
          <Siren className="w-8 h-8" />
          <span className="sr-only">{translations.sos.buttonLabel}</span>
        </Button>
      </SOSButtonDialog>
    </div>
  );
}
