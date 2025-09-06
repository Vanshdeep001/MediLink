
'use client';
import { useContext, useEffect, useState } from 'react';
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Users, FileText, HeartPulse, PlusCircle, MessageSquare, LineChart, ChevronRight } from "lucide-react";
import TextFlipper from "@/components/ui/text-effect-flipper";
import { LanguageContext } from '@/context/language-context';

export default function DoctorDashboard() {
  const { translations } = useContext(LanguageContext);
  const [doctorName, setDoctorName] = useState('');

  useEffect(() => {
    const userString = localStorage.getItem('temp_user');
    if (userString) {
      try {
        const user = JSON.parse(userString);
        setDoctorName(user.fullName || 'Doctor');
      } catch (e) {
        setDoctorName('Doctor');
      }
    } else {
      setDoctorName('Doctor');
    }
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 pt-20">
        <div className="max-w-5xl mx-auto">
          
          <div className="text-center py-16 md:py-24 animate-fade-in-down">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              <TextFlipper>{translations.doctorDashboard.welcome}</TextFlipper> <TextFlipper delay={0.2} className="text-primary font-cursive">Dr. {doctorName}!</TextFlipper>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground animate-text-fade-in-scale" style={{ animationDelay: '0.4s' }}>
              {translations.doctorDashboard.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 animate-content-fade-in" style={{ animationDelay: '0.6s' }}>
            <Card className="hover:shadow-xl hover:-translate-y-2 transition-transform duration-300">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{translations.doctorDashboard.todaysAppointments}</CardTitle>
                <Calendar className="w-5 h-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">5</div>
                <p className="text-xs text-muted-foreground">{translations.doctorDashboard.viewSchedule}</p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-xl hover:-translate-y-2 transition-transform duration-300">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{translations.doctorDashboard.totalPatients}</CardTitle>
                <Users className="w-5 h-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">120</div>
                <p className="text-xs text-muted-foreground">{translations.doctorDashboard.managePatientRecords}</p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-xl hover:-translate-y-2 transition-transform duration-300">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{translations.doctorDashboard.pendingReports}</CardTitle>
                <FileText className="w-5 h-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8</div>
                <p className="text-xs text-muted-foreground">{translations.doctorDashboard.reviewAndSign}</p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-xl hover:-translate-y-2 transition-transform duration-300">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{translations.doctorDashboard.consultations}</CardTitle>
                <HeartPulse className="w-5 h-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">25</div>
                <p className="text-xs text-muted-foreground">{translations.doctorDashboard.thisMonth}</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 animate-content-fade-in" style={{ animationDelay: '0.8s' }}>
            <Card className="md:col-span-1 hover:shadow-xl hover:-translate-y-2 transition-transform duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><MessageSquare /> {translations.doctorDashboard.patientMessages}</CardTitle>
                <CardDescription>{translations.doctorDashboard.patientMessagesDesc}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">{translations.doctorDashboard.openInbox}</Button>
              </CardContent>
            </Card>
            <Card className="md:col-span-1 hover:shadow-xl hover:-translate-y-2 transition-transform duration-300">
               <CardHeader>
                <CardTitle className="flex items-center gap-2"><FileText /> {translations.doctorDashboard.viewReports}</CardTitle>
                <CardDescription>{translations.doctorDashboard.viewReportsDesc}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">{translations.doctorDashboard.accessReports}</Button>
              </CardContent>
            </Card>
             <Card className="md:col-span-1 hover:shadow-xl hover:-translate-y-2 transition-transform duration-300">
               <CardHeader>
                <CardTitle className="flex items-center gap-2"><LineChart /> {translations.doctorDashboard.healthAnalytics}</CardTitle>
                <CardDescription>{translations.doctorDashboard.healthAnalyticsDesc}</CardDescription>
              </CardHeader>
              <CardContent>
                 <Button className="w-full">{translations.doctorDashboard.viewAnalytics}</Button>
              </CardContent>
            </Card>
          </div>

          <div className="animate-content-fade-in" style={{ animationDelay: '1s' }}>
            <Tabs defaultValue="appointments" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="appointments">{translations.doctorDashboard.appointments}</TabsTrigger>
                <TabsTrigger value="patients">{translations.doctorDashboard.patients}</TabsTrigger>
                <TabsTrigger value="consultations">{translations.doctorDashboard.consultations}</TabsTrigger>
                <TabsTrigger value="reports">{translations.doctorDashboard.reports}</TabsTrigger>
              </TabsList>
              
              <TabsContent value="appointments" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{translations.doctorDashboard.manageAppointments}</CardTitle>
                    <CardDescription>{translations.doctorDashboard.manageAppointmentsDesc}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex justify-center items-center text-center py-12 text-muted-foreground">
                        <p>{translations.doctorDashboard.noAppointments}</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <Button className="w-full sm:w-auto">
                            <PlusCircle className="mr-2 h-5 w-5" />
                            {translations.doctorDashboard.scheduleAppointment}
                        </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="patients" className="mt-6">
                 <Card>
                  <CardHeader>
                    <CardTitle>{translations.doctorDashboard.yourPatients}</CardTitle>
                    <CardDescription>{translations.doctorDashboard.yourPatientsDesc}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                     <div className="flex justify-between items-center bg-muted/50 p-4 rounded-lg">
                      <div>
                        <p className="font-semibold">Ravi Kumar</p>
                        <p className="text-sm text-muted-foreground">Last visit: 12 Dec 2024</p>
                      </div>
                      <Button variant="ghost" size="icon">
                        <ChevronRight className="w-5 h-5" />
                      </Button>
                    </div>
                    <div className="flex justify-between items-center bg-muted/50 p-4 rounded-lg">
                      <div>
                        <p className="font-semibold">Priya Sharma</p>
                        <p className="text-sm text-muted-foreground">Last visit: 10 Dec 2024</p>
                      </div>
                       <Button variant="ghost" size="icon">
                        <ChevronRight className="w-5 h-5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="consultations" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{translations.doctorDashboard.pastConsultations}</CardTitle>
                    <CardDescription>{translations.doctorDashboard.pastConsultationsDesc}</CardDescription>
                  </CardHeader>
                   <CardContent className="text-center text-muted-foreground py-12">
                    <p>{translations.doctorDashboard.consultationsPlaceholder}</p>
                  </CardContent>
                </Card>
              </TabsContent>

               <TabsContent value="reports" className="mt-6">
                 <Card>
                  <CardHeader>
                    <CardTitle>{translations.doctorDashboard.patientReports}</CardTitle>
                    <CardDescription>{translations.doctorDashboard.patientReportsDesc}</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center text-muted-foreground py-12">
                    <p>{translations.doctorDashboard.reportsPlaceholder}</p>
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
