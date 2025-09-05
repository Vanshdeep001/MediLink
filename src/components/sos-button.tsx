
"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Siren } from "lucide-react";
import { usePathname } from "next/navigation";

// This component is the dialog part, which can be triggered by any button
export function SOSButtonDialog({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();

  const handleConfirm = () => {
    toast({
      title: "SOS Alert Sent!",
      description: "The nearest ambulance has been notified and is on their way.",
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
            <AlertDialogTitle>Are you experiencing a medical emergency?</AlertDialogTitle>
            <AlertDialogDescription>
                This action will immediately alert the nearest available ambulance or local transport service to your location. Only confirm if you are in a genuine emergency.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm} className="bg-destructive hover:bg-destructive/90">
                Confirm Emergency
            </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
  );
}


// This is the main FAB component, visible on mobile
export function SOSButton() {
  const pathname = usePathname();
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
          <span className="sr-only">Emergency SOS</span>
        </Button>
      </SOSButtonDialog>
    </div>
  );
}
