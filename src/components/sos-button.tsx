
"use client";

import { useContext, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Siren } from "lucide-react";
import { usePathname } from "next/navigation";
import { LanguageContext } from "@/context/language-context";
import { EmergencyManager } from "@/components/emergency/emergency-manager";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

// Enhanced Emergency Dialog Component
export function SOSButtonDialog({ children }: { children: React.ReactNode }) {
  const { translations } = useContext(LanguageContext);
  const [isOpen, setIsOpen] = useState(false);
  const [patientData, setPatientData] = useState({
    id: '',
    name: '',
    digitalHealthId: ''
  });

  useEffect(() => {
    // Get patient data from localStorage
    try {
      const userString = localStorage.getItem('temp_user');
      if (userString) {
        const user = JSON.parse(userString);
        setPatientData({
          id: user.id || `patient_${Date.now()}`,
          name: user.fullName || 'Patient',
          digitalHealthId: user.digitalHealthId || `DHID_${Date.now()}`
        });
      }
    } catch (error) {
      console.error('Failed to load patient data:', error);
      setPatientData({
        id: `patient_${Date.now()}`,
        name: 'Patient',
        digitalHealthId: `DHID_${Date.now()}`
      });
    }
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <Siren className="w-5 h-5" />
            Emergency SOS System
          </DialogTitle>
        </DialogHeader>
        
        <EmergencyManager
          patientId={patientData.id}
          patientName={patientData.name}
          digitalHealthId={patientData.digitalHealthId}
        />
      </DialogContent>
    </Dialog>
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
