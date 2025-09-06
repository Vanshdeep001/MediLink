"use client";

import { useState, useContext } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PatientAuthForm } from "./patient-auth-form";
import { DoctorAuthForm } from "./doctor-auth-form";
import { PharmacyAuthForm } from "./pharmacy-auth-form";
import TextFlipper from "../ui/text-effect-flipper";
import { LanguageContext } from "@/context/language-context";

type Role = "patient" | "doctor" | "pharmacy";

export function AuthPortal() {
  const [activeRole, setActiveRole] = useState<Role>("patient");
  const { translations } = useContext(LanguageContext);
  
  const titles = {
    patient: { main: translations.authPortal.patient.titleMain, cursive: translations.authPortal.patient.titleCursive },
    doctor: { main: translations.authPortal.doctor.titleMain, cursive: translations.authPortal.doctor.titleCursive },
    pharmacy: { main: translations.authPortal.pharmacy.titleMain, cursive: translations.authPortal.pharmacy.titleCursive },
  };

  return (
     <div className="w-full max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight whitespace-nowrap">
          <TextFlipper>{titles[activeRole].main}</TextFlipper>{' '}
          <TextFlipper delay={0.2} className="text-primary font-cursive">{titles[activeRole].cursive}</TextFlipper>
        </h1>
      </div>
       <Tabs defaultValue="patient" className="w-full" onValueChange={(value) => setActiveRole(value as Role)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="patient">{translations.roleSelection.patient}</TabsTrigger>
          <TabsTrigger value="doctor">{translations.roleSelection.doctor}</TabsTrigger>
          <TabsTrigger value="pharmacy">{translations.roleSelection.pharmacy}</TabsTrigger>
        </TabsList>
        <TabsContent value="patient">
            <PatientAuthForm />
        </TabsContent>
        <TabsContent value="doctor">
            <DoctorAuthForm />
        </TabsContent>
        <TabsContent value="pharmacy">
             <PharmacyAuthForm />
        </TabsContent>
      </Tabs>
     </div>
  );
}
