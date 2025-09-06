
'use client';

import { useContext, useEffect, useState } from 'react';
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Pill, FileText, Heart, PlusCircle, Upload, Search, ChevronRight, BrainCircuit, BellRing, Video, Building, Stethoscope, MapPin, Phone } from "lucide-react";
import TextFlipper from "@/components/ui/text-effect-flipper";
import { LanguageContext } from '@/context/language-context';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Mock data structures - in a real app, these would be defined in a types file
interface Doctor {
  fullName: string;
  specialization: string;
  address: string;
  city: string;
  pinCode: string;
  phone: string;
}

interface Pharmacy {
  pharmacyName: string;
  address: string;
  city: string;
  pinCode: string;
  phone: string;
}

export default function PatientDashboard() {
  const { translations } = useContext(LanguageContext);
  const [userName, setUserName] = useState('');
  const [userLocation, setUserLocation] = useState({ city: '', pinCode: '' });
  
  const [allDoctors, setAllDoctors] = useState<Doctor[]>([]);
  const [allPharmacies, setAllPharmacies] = useState<Pharmacy[]>([]);
  
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [filteredPharmacies, setFilteredPharmacies] = useState<Pharmacy[]>([]);

  const [specializationFilter, setSpecializationFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('');

  useEffect(() => {
    // Fetch user, doctors, and pharmacies data from localStorage
    const userString = localStorage.getItem('temp_user');
    if (userString) {
      try {
        const user = JSON.parse(userString);
        setUserName(user.fullName || 'Patient');
        setUserLocation({ city: user.city || '', pinCode: user.pinCode || '' });
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
    
    // Initially filter pharmacies by user's location if available
    if (userString) {
       const user = JSON.parse(userString);
       if(user.pinCode) {
         setFilteredPharmacies(pharmacies.filter((p: Pharmacy) => p.pinCode === user.pinCode));
       } else {
         setFilteredPharmacies(pharmacies);
       }
    } else {
       setFilteredPharmacies(pharmacies);
    }

  }, []);

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
      <main className="flex-grow container mx-auto px-4 pt-20">
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
            <Card className="md:col-span-1 hover:shadow-xl hover:-translate-y-2 transition-transform duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><BrainCircuit /> {translations.patientDashboard.symptomChecker}</CardTitle>
                <CardDescription>{translations.patientDashboard.symptomCheckerDesc}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">{translations.patientDashboard.symptomCheckerButton}</Button>
              </CardContent>
            </Card>
            <Card className="md:col-span-1 hover:shadow-xl hover:-translate-y-2 transition-transform duration-300">
               <CardHeader>
                <CardTitle className="flex items-center gap-2"><Video /> {translations.patientDashboard.videoConsultation}</CardTitle>
                <CardDescription>{translations.patientDashboard.videoConsultationDesc}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">{translations.patientDashboard.videoConsultationButton}</Button>
              </CardContent>
            </Card>
             <Card className="md:col-span-1 hover:shadow-xl hover:-translate-y-2 transition-transform duration-300">
               <CardHeader>
                <CardTitle className="flex items-center gap-2"><BellRing /> {translations.patientDashboard.smartReminders}</CardTitle>
                <CardDescription>{translations.patientDashboard.smartRemindersDesc}</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p>{translations.patientDashboard.reminder1}</p>
                <p>{translations.patientDashboard.reminder2}</p>
              </CardContent>
            </Card>
          </div>

          <div className="animate-content-fade-in" style={{ animationDelay: '1s' }}>
            <Tabs defaultValue="appointments" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="appointments">{translations.patientDashboard.appointments}</TabsTrigger>
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

    