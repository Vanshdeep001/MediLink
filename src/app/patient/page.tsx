
'use client';

import { useContext } from 'react';
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Pill, FileText, Heart, PlusCircle, Upload, Search, ChevronRight, BrainCircuit, BellRing, Video } from "lucide-react";
import TextFlipper from "@/components/ui/text-effect-flipper";
import { LanguageContext } from '@/context/language-context';

export default function PatientDashboard() {
  const { translations } = useContext(LanguageContext);
  
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 pt-20">
        <div className="max-w-5xl mx-auto">
          
          <div className="text-center py-16 md:py-24 animate-fade-in-down">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              <TextFlipper>{translations.patientDashboard.welcome}</TextFlipper> <TextFlipper delay={0.2} className="text-primary font-cursive">{translations.patientDashboard.welcomeUser}</TextFlipper>
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
                <TabsTrigger value="medications">{translations.patientDashboard.medications}</TabsTrigger>
                <TabsTrigger value="health_data">{translations.patientDashboard.healthData}</TabsTrigger>
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
                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <Button className="w-full sm:w-auto">
                            <PlusCircle className="mr-2 h-5 w-5" />
                            {translations.patientDashboard.bookAppointment}
                        </Button>
                        <Button variant="outline" className="w-full sm:w-auto">
                            <Search className="mr-2 h-5 w-5" />
                            {translations.patientDashboard.findDoctors}
                        </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="medications" className="mt-6">
                 <Card>
                  <CardHeader>
                    <CardTitle>{translations.patientDashboard.yourMedications}</CardTitle>
                    <CardDescription>{translations.patientDashboard.yourMedicationsDesc}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                     <div className="flex justify-between items-center bg-muted/50 p-4 rounded-lg">
                      <div>
                        <p className="font-semibold">Metformin</p>
                        <p className="text-sm text-muted-foreground">500mg, Twice a day</p>
                      </div>
                      <Button variant="outline">{translations.patientDashboard.setReminder}</Button>
                    </div>
                    <div className="flex justify-between items-center bg-muted/50 p-4 rounded-lg">
                      <div>
                        <p className="font-semibold">Aspirin</p>
                        <p className="text-sm text-muted-foreground">81mg, Once a day</p>
                      </div>
                       <Button variant="outline">{translations.patientDashboard.setReminder}</Button>
                    </div>
                    <div className="pt-4">
                      <Button>{translations.patientDashboard.orderMedicines}</Button>
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

               <TabsContent value="health_data" className="mt-6">
                 <Card>
                  <CardHeader>
                    <CardTitle>{translations.patientDashboard.yourHealthData}</CardTitle>
                    <CardDescription>{translations.patientDashboard.yourHealthDataDesc}</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center text-muted-foreground py-12">
                    <p>{translations.patientDashboard.healthDataPlaceholder}</p>
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

    