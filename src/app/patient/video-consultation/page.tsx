
'use client';

import { useState, useContext, useEffect } from 'react';
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { LanguageContext } from '@/context/language-context';
import TextFlipper from '@/components/ui/text-effect-flipper';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, History, PlusCircle, Video } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { VideoConsultationBooking } from '@/components/patient/video-consultation-booking';
import { FadeIn } from '@/components/fade-in';
import { FeedbackForm } from '@/components/patient/feedback-form';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import type { Consultation, Doctor } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { JitsiCall } from '@/components/jitsi-call';


export default function VideoConsultationPage() {
  const { translations } = useContext(LanguageContext);
  const { toast } = useToast();
  
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [userName, setUserName] = useState('');
  const [activeCall, setActiveCall] = useState<Consultation | null>(null);

  useEffect(() => {
    const userString = localStorage.getItem('temp_user');
    let currentUserName = '';
    if (userString) {
      const user = JSON.parse(userString);
      currentUserName = user.fullName;
      setUserName(currentUserName);
    }

    const doctorsString = localStorage.getItem('doctors_list');
    if (doctorsString) {
      setDoctors(JSON.parse(doctorsString));
    }
    
    loadConsultations(currentUserName);
  }, []);
  
  const loadConsultations = (currentUserName: string) => {
     const consultationsString = localStorage.getItem('consultations_list');
    if (consultationsString) {
      const allConsultations: Consultation[] = JSON.parse(consultationsString);
      setConsultations(allConsultations.filter(c => c.patientName === currentUserName));
    }
  }

  const handleBookingConfirmed = () => {
    toast({
        title: "Booking Confirmed!",
        description: `Your appointment has been scheduled.`
    });
    loadConsultations(userName);
  };

  const upcomingAppointments = consultations.filter(c => new Date(c.date) >= new Date());
  const consultationHistory = consultations.filter(c => new Date(c.date) < new Date());
  
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-24 md:py-28 pb-32">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 animate-fade-in-down">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              <TextFlipper>Video</TextFlipper> <TextFlipper delay={0.2} className="text-primary font-cursive">Consultation</TextFlipper>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Connect with doctors instantly through secure video calls.
            </p>
          </div>
          
          <div className="space-y-8">
            <FadeIn delay={200}>
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><PlusCircle /> Start New Consultation</CardTitle>
                  <CardDescription>Book a new video call with a doctor.</CardDescription>
                </CardHeader>
                <CardContent>
                  <VideoConsultationBooking doctors={doctors} patientName={userName} onBookingConfirmed={handleBookingConfirmed} />
                </CardContent>
              </Card>
            </FadeIn>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FadeIn delay={300}>
                <Card className="shadow-lg h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Calendar /> Upcoming Appointments</CardTitle>
                    <CardDescription>Your scheduled video calls.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {upcomingAppointments.map((appt, index) => (
                        <div key={index} className="p-4 bg-muted/50 rounded-lg">
                          <div className="flex justify-between items-center">
                            <div>
                                <p className="font-semibold">{appt.doctorName}</p>
                                <p className="text-sm text-muted-foreground">{appt.specialization}</p>
                            </div>
                            <Button onClick={() => setActiveCall(appt)}>Join Call</Button>
                          </div>
                          <Separator className="my-2" />
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {new Date(appt.date).toLocaleDateString()}</span>
                            <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {appt.time}</span>
                          </div>
                        </div>
                    ))}
                    {upcomingAppointments.length === 0 && <p className="text-sm text-muted-foreground text-center">No upcoming appointments.</p>}
                  </CardContent>
                </Card>
              </FadeIn>

              <FadeIn delay={400}>
                <Card className="shadow-lg h-full">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><History /> Consultation History</CardTitle>
                        <CardDescription>Review your past video consultations.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Accordion type="single" collapsible className="w-full">
                        {consultationHistory.map((item, index) => (
                            <div key={index} className="p-3 bg-muted/50 rounded-lg text-sm">
                                <p className="font-semibold">{item.doctorName} - <span className="font-normal text-muted-foreground">{new Date(item.date).toLocaleDateString()}</span></p>
                                <p className="text-muted-foreground mt-1">Video consultation regarding {item.specialization}.</p>
                                <AccordionItem value={`item-${index}`} className="border-none">
                                    <AccordionTrigger className="text-xs pt-2 pb-0 text-primary hover:no-underline justify-start gap-1">Leave Feedback</AccordionTrigger>
                                    <AccordionContent className="pt-4">
                                        <FeedbackForm />
                                    </AccordionContent>
                                </AccordionItem>
                            </div>
                        ))}
                        </Accordion>
                         {consultationHistory.length === 0 && <p className="text-sm text-muted-foreground text-center">No past consultations.</p>}
                    </CardContent>
                </Card>
              </FadeIn>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      
      {activeCall && (
        <JitsiCall 
            roomName={activeCall.jitsiLink.split('/').pop()!}
            userName={userName}
            onClose={() => setActiveCall(null)}
        />
      )}
    </div>
  );
}
