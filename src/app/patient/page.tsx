
'use client';

import { useContext, useEffect, useState } from 'react';
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Pill, FileText, Heart, PlusCircle, Upload, Search, ChevronRight, BellRing, Video, Building, Stethoscope, MapPin, Phone, Trash2, BrainCircuit } from "lucide-react";
import TextFlipper from "@/components/ui/text-effect-flipper";
import { LanguageContext } from '@/context/language-context';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import type { Doctor, Pharmacy, Prescription, Reminder } from '@/lib/types';
import Link from 'next/link';

export default function PatientDashboard() {
  const { translations } = useContext(LanguageContext);
  const { toast } = useToast();
  const [userName, setUserName] = useState('');
  
  const [allDoctors, setAllDoctors] = useState<Doctor[]>([]);
  const [allPharmacies, setAllPharmacies] = useState<Pharmacy[]>([]);
  
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [filteredPharmacies, setFilteredPharmacies] = useState<Pharmacy[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [newReminder, setNewReminder] = useState('');

  const [specializationFilter, setSpecializationFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('');

  useEffect(() => {
    // Fetch user, doctors, and pharmacies data from localStorage
    const userString = localStorage.getItem('temp_user');
    if (userString) {
      try {
        const user = JSON.parse(userString);
        setUserName(user.fullName || 'Patient');
      } catch (e) {
        setUserName('Patient');
      }
    } else {
      setUserName('Patient');
    }

    const doctorsString = localStorage.getItem('doctors_list');
    const doctors = doctorsString ? JSON.parse(doctorsString) : [];
    setAllDoctors(doctors);
    setFilteredDoctors(doctors);

    const pharmaciesString = localStorage.getItem('pharmacies_list');
    const pharmacies = pharmaciesString ? JSON.parse(pharmaciesString) : [];
    setAllPharmacies(pharmacies);
    setFilteredPharmacies(pharmacies);

    loadPrescriptionsAndReminders();
  }, [userName]);

  const loadPrescriptionsAndReminders = () => {
    if (!userName) return;
    const prescriptionsString = localStorage.getItem('prescriptions_list');
    const allPrescriptions = prescriptionsString ? JSON.parse(prescriptionsString) : [];
    const userPrescriptions = allPrescriptions.filter((p: Prescription) => p.patientName === userName);
    setPrescriptions(userPrescriptions);

    const remindersString = localStorage.getItem('reminders_list');
    const allReminders = remindersString ? JSON.parse(remindersString) : [];
    const userReminders = allReminders.filter((r: Reminder) => r.patientName === userName);
    setReminders(userReminders);
  };

  const handleAddReminder = () => {
    if (!newReminder.trim()) return;
    const newReminderObj: Reminder = {
      id: `REM-${Date.now()}`,
      patientName: userName,
      text: newReminder,
      type: 'custom',
    };
    const updatedReminders = [...reminders, newReminderObj];
    setReminders(updatedReminders);
    localStorage.setItem('reminders_list', JSON.stringify([...(JSON.parse(localStorage.getItem('reminders_list') || '[]').filter((r: Reminder) => r.patientName !== userName)), ...updatedReminders]));
    setNewReminder('');
    toast({
      title: translations.patientDashboard.reminders.successTitle,
      description: translations.patientDashboard.reminders.successDesc,
    });
  };

  const handleDeleteReminder = (id: string) => {
    const updatedReminders = reminders.filter(r => r.id !== id);
    setReminders(updatedReminders);
    localStorage.setItem('reminders_list', JSON.stringify([...(JSON.parse(localStorage.getItem('reminders_list') || '[]').filter((r: Reminder) => r.patientName !== userName)), ...updatedReminders]));
     toast({
      title: translations.patientDashboard.reminders.deletedTitle,
      variant: "destructive"
    });
  }

  useEffect(() => {
    let doctors = allDoctors;
    if (specializationFilter !== 'all') {
      doctors = doctors.filter(d => d.specialization.toLowerCase() === specializationFilter.toLowerCase());
    }
    if (locationFilter) {
      doctors = doctors.filter(d => 
        d.city.toLowerCase().includes(locationFilter.toLowerCase()) || 
        d.pinCode.includes(locationFilter)
      );
    }
    setFilteredDoctors(doctors);
  }, [specializationFilter, locationFilter, allDoctors]);

  const uniqueSpecializations = ['all', ...Array.from(new Set(allDoctors.map(d => d.specialization.toLowerCase())))];
  
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 pt-20 pb-24">
        <div className="max-w-5xl mx-auto">
          
          <div className="text-center py-16 md:py-24 animate-fade-in-down">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              <TextFlipper>{translations.patientDashboard.welcome}</TextFlipper> <TextFlipper delay={0.2} className="text-primary font-cursive">{userName}!</TextFlipper>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground animate-text-fade-in-scale" style={{ animationDelay: '0.4s' }}>
              {translations.patientDashboard.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 animate-content-fade-in" style={{ animationDelay: '0.6s' }}>
            <Card className="hover:shadow-xl hover:-translate-y-2 transition-transform duration-300">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{translations.patientDashboard.upcomingAppointments}</CardTitle>
                <Calendar className="w-5 h-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3</div>
                <p className="text-xs text-muted-foreground">{translations.patientDashboard.viewSchedule}</p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-xl hover:-translate-y-2 transition-transform duration-300">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{translations.patientDashboard.activeMedications}</CardTitle>
                <Pill className="w-5 h-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2</div>
                <p className="text-xs text-muted-foreground">{translations.patientDashboard.managePrescriptions}</p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-xl hover:-translate-y-2 transition-transform duration-300">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{translations.patientDashboard.medicalReports}</CardTitle>
                <FileText className="w-5 h-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">5</div>
                <p className="text-xs text-muted-foreground">{translations.patientDashboard.accessFiles}</p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-xl hover:-translate-y-2 transition-transform duration-300">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{translations.patientDashboard.healthStatus}</CardTitle>
                <Heart className="w-5 h-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Good</div>
                <p className="text-xs text-muted-foreground">{translations.patientDashboard.lastUpdated}</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 animate-content-fade-in" style={{ animationDelay: '0.8s' }}>
            <Card className="md:col-span-1 hover:shadow-xl hover:-translate-y-2 transition-transform duration-300 flex flex-col">
               <CardHeader>
                <CardTitle className="flex items-center gap-2"><BrainCircuit /> {translations.patientDashboard.symptomChecker}</CardTitle>
                <CardDescription>{translations.patientDashboard.symptomCheckerDesc}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow flex items-end">
                <Button className="w-full" asChild>
                  <Link href="/patient/symptom-checker">{translations.patientDashboard.symptomCheckerButton}</Link>
                </Button>
              </CardContent>
            </Card>
            <Card className="md:col-span-1 hover:shadow-xl hover:-translate-y-2 transition-transform duration-300 flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Video /> {translations.patientDashboard.videoConsultation}</CardTitle>
                <CardDescription>{translations.patientDashboard.videoConsultationDesc}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow flex items-end">
                <Button className="w-full">{translations.patientDashboard.videoConsultationButton}</Button>
              </CardContent>
            </Card>
            <Card className="md:col-span-1 hover:shadow-xl hover:-translate-y-2 transition-transform duration-300 flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><BellRing /> {translations.patientDashboard.smartReminders}</CardTitle>
                <CardDescription>{translations.patientDashboard.smartRemindersDesc}</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground flex-grow">
                <ul className="space-y-2">
                  <li>{translations.patientDashboard.reminder1}</li>
                  <li>{translations.patientDashboard.reminder2}</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="animate-content-fade-in" style={{ animationDelay: '1s' }}>
            <Tabs defaultValue="appointments" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="appointments">{translations.patientDashboard.appointments}</TabsTrigger>
                <TabsTrigger value="reminders">{translations.patientDashboard.reminders.tabTitle}</TabsTrigger>
                <TabsTrigger value="doctors">{translations.patientDashboard.doctors}</TabsTrigger>
                <TabsTrigger value="pharmacies">{translations.patientDashboard.pharmacies}</TabsTrigger>
                <TabsTrigger value="reports">{translations.patientDashboard.reports}</TabsTrigger>
              </TabsList>
              
              <TabsContent value="appointments" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{translations.patientDashboard.manageAppointments}</CardTitle>
                    <CardDescription>{translations.patientDashboard.manageAppointmentsDesc}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex justify-between items-center bg-muted/50 p-4 rounded-lg">
                      <div>
                        <p className="font-semibold">Dr. Anjali Sharma</p>
                        <p className="text-sm text-muted-foreground">Cardiology | Tomorrow at 10:30 AM</p>
                      </div>
                      <Button variant="ghost" size="icon">
                        <ChevronRight className="w-5 h-5" />
                      </Button>
                    </div>
                     <div className="flex justify-between items-center bg-muted/50 p-4 rounded-lg">
                      <div>
                        <p className="font-semibold">Dr. Vikram Singh</p>
                        <p className="text-sm text-muted-foreground">General Checkup | 25 Dec 2024, 02:00 PM</p>
                      </div>
                      <Button variant="ghost" size="icon">
                        <ChevronRight className="w-5 h-5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

               <TabsContent value="reminders" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{translations.patientDashboard.reminders.title}</CardTitle>
                    <CardDescription>{translations.patientDashboard.reminders.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                     <div className="flex gap-2">
                        <Input value={newReminder} onChange={(e) => setNewReminder(e.target.value)} placeholder={translations.patientDashboard.reminders.placeholder} />
                        <Button onClick={handleAddReminder}>
                           <PlusCircle className="mr-2 h-5 w-5" /> {translations.patientDashboard.reminders.add}
                        </Button>
                     </div>
                     <div className="space-y-2">
                       {prescriptions.map(presc => presc.medications.map((med, index) => (
                           <div key={`${presc.id}-${index}`} className="flex justify-between items-center bg-blue-100/50 dark:bg-blue-900/20 p-3 rounded-lg">
                              <p className="font-medium text-sm">
                                {translations.patientDashboard.reminders.take} <span className="text-primary">{med.name}</span> ({med.dosage}) - {med.duration}
                              </p>
                              <p className="text-xs text-muted-foreground">{translations.patientDashboard.reminders.from} Dr. {presc.doctorName}</p>
                           </div>
                       )))}
                       {reminders.map(rem => (
                         <div key={rem.id} className="flex justify-between items-center bg-muted/50 p-3 rounded-lg">
                            <p className="font-medium text-sm">{rem.text}</p>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteReminder(rem.id)}>
                                <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                         </div>
                       ))}
                     </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="doctors" className="mt-6">
                 <Card>
                  <CardHeader>
                    <CardTitle>{translations.patientDashboard.findDoctors}</CardTitle>
                    <CardDescription>{translations.patientDashboard.findDoctorsDesc}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative w-full sm:w-1/2">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input placeholder={translations.patientDashboard.searchByLocation} className="pl-10" value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)} />
                        </div>
                        <Select onValueChange={setSpecializationFilter} defaultValue="all">
                            <SelectTrigger className="w-full sm:w-1/2">
                                <SelectValue placeholder={translations.patientDashboard.filterBySpecialization} />
                            </SelectTrigger>
                            <SelectContent>
                                {uniqueSpecializations.map((spec) => (
                                    <SelectItem key={spec} value={spec} className="capitalize">{spec}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredDoctors.length > 0 ? filteredDoctors.map((doctor, index) => (
                            <Card key={index} className="hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2"><Stethoscope className="text-primary"/> Dr. {doctor.fullName}</CardTitle>
                                    <CardDescription>{doctor.specialization}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-2 text-sm text-muted-foreground">
                                    <p className="flex items-center gap-2"><MapPin className="w-4 h-4"/> {doctor.address}, {doctor.city} - {doctor.pinCode}</p>
                                    <p className="flex items-center gap-2"><Phone className="w-4 h-4"/> {doctor.phone}</p>
                                </CardContent>
                            </Card>
                        )) : (
                            <p className="text-muted-foreground col-span-2 text-center py-8">{translations.patientDashboard.noDoctorsFound}</p>
                        )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="pharmacies" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{translations.patientDashboard.nearbyPharmacies}</CardTitle>
                    <CardDescription>{translations.patientDashboard.nearbyPharmaciesDesc}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredPharmacies.length > 0 ? filteredPharmacies.map((pharmacy, index) => (
                            <Card key={index} className="hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2"><Building className="text-primary"/> {pharmacy.pharmacyName}</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2 text-sm text-muted-foreground">
                                    <p className="flex items-center gap-2"><MapPin className="w-4 h-4"/> {pharmacy.address}, {pharmacy.city} - {pharmacy.pinCode}</p>
                                    <p className="flex items-center gap-2"><Phone className="w-4 h-4"/> {pharmacy.phone}</p>
                                </CardContent>
                            </Card>
                        )) : (
                             <p className="text-muted-foreground col-span-2 text-center py-8">{translations.patientDashboard.noPharmaciesFound}</p>
                        )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

               <TabsContent value="reports" className="mt-6">
                 <Card>
                  <CardHeader>
                    <CardTitle>{translations.patientDashboard.yourReports}</CardTitle>
                    <CardDescription>{translations.patientDashboard.yourReportsDesc}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                     <div className="flex justify-between items-center bg-muted/50 p-4 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="w-6 h-6" />
                        <div>
                          <p className="font-semibold">Blood Test Report.pdf</p>
                          <p className="text-sm text-muted-foreground">Uploaded on 15 Dec 2024</p>
                        </div>
                      </div>
                      <Button variant="outline">{translations.patientDashboard.view}</Button>
                    </div>
                    <div className="pt-4">
                      <Button>
                        <Upload className="mr-2 h-5 w-5" />
                        {translations.patientDashboard.uploadReport}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

            </Tabs>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
