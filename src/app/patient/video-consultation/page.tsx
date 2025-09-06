
'use client';

import { useState, useContext } from 'react';
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { LanguageContext } from '@/context/language-context';
import TextFlipper from '@/components/ui/text-effect-flipper';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Stethoscope, Video, History, PlusCircle, Mic, MicOff, VideoOff, PhoneOff, Upload, Send } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { VideoConsultationBooking } from '@/components/patient/video-consultation-booking';
import { FadeIn } from '@/components/fade-in';

export default function VideoConsultationPage() {
  const { translations } = useContext(LanguageContext);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);

  const upcomingAppointments = [
    { doctor: "Dr. Anjali Sharma", specialization: "Cardiology", date: "Tomorrow", time: "10:30 AM" },
    { doctor: "Dr. Vikram Singh", specialization: "General Physician", date: "25 Dec 2024", time: "02:00 PM" },
  ];

  const consultationHistory = [
    { doctor: "Dr. Priya Desai", date: "15 Nov 2024", summary: "Discussed routine check-up results. All clear." },
    { doctor: "Dr. Vikram Singh", date: "02 Oct 2024", summary: "Follow-up on seasonal flu. Prescribed rest and fluids." },
  ];

  const handleJoinCall = () => {
    setIsCallActive(true);
  };
  
  const handleEndCall = () => {
    setIsCallActive(false);
  };

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
                  <VideoConsultationBooking />
                </CardContent>
              </Card>
            </FadeIn>
            
            <FadeIn delay={300}>
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Calendar /> Upcoming Appointments</CardTitle>
                  <CardDescription>Your scheduled video calls.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {upcomingAppointments.map((appt, index) => (
                      <div key={index} className="p-4 bg-muted/50 rounded-lg">
                        <div className="flex justify-between items-center">
                          <div>
                              <p className="font-semibold">{appt.doctor}</p>
                              <p className="text-sm text-muted-foreground">{appt.specialization}</p>
                          </div>
                          <Button onClick={handleJoinCall}>Join Call</Button>
                        </div>
                        <Separator className="my-2" />
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {appt.date}</span>
                          <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {appt.time}</span>
                        </div>
                      </div>
                  ))}
                </CardContent>
              </Card>
            </FadeIn>

            <FadeIn delay={400}>
              <Card className="shadow-lg">
                  <CardHeader>
                      <CardTitle className="flex items-center gap-2"><History /> Consultation History</CardTitle>
                      <CardDescription>Review your past video consultations.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                      {consultationHistory.map((item, index) => (
                          <div key={index} className="p-3 bg-muted/50 rounded-lg text-sm">
                              <p className="font-semibold">Dr. {item.doctor} - <span className="font-normal text-muted-foreground">{item.date}</span></p>
                              <p className="text-muted-foreground mt-1">{item.summary}</p>
                          </div>
                      ))}
                  </CardContent>
              </Card>
            </FadeIn>
          </div>
        </div>
      </main>
      <Footer />
      
      {/* Mock Video Call Dialog */}
      <Dialog open={isCallActive} onOpenChange={setIsCallActive}>
        <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0 gap-0">
          <DialogHeader className="p-4 border-b">
            <DialogTitle>Video Call with Dr. Anjali Sharma</DialogTitle>
          </DialogHeader>
          <div className="flex-grow grid grid-cols-1 md:grid-cols-3 overflow-hidden">
            <div className="col-span-2 bg-black flex items-center justify-center relative">
              <p className="text-white">Doctor's Video Feed</p>
              <div className="absolute bottom-4 right-4 w-40 h-32 bg-muted/20 border-2 border-primary rounded-lg flex items-center justify-center">
                  <p className="text-white text-sm">Your Video</p>
              </div>
            </div>
            <div className="col-span-1 flex flex-col border-l">
              <div className="flex-grow p-4 space-y-4 overflow-y-auto">
                  <h4 className="font-semibold">Live Chat</h4>
                  <div className="text-sm p-2 bg-muted rounded-md">
                    <p className="font-bold">Dr. Sharma</p>
                    <p>Hello! How are you feeling today?</p>
                  </div>
                  <div className="text-sm p-2 bg-primary/10 rounded-md text-right">
                    <p className="font-bold">You</p>
                    <p>I have a slight headache.</p>
                  </div>
              </div>
              <div className="p-4 border-t flex gap-2 items-center">
                <Button variant="outline" size="icon"><Upload className="w-4 h-4"/></Button>
                <Input placeholder="Type a message..." />
                <Button size="icon"><Send className="w-4 h-4" /></Button>
              </div>
            </div>
          </div>
          <div className="flex justify-center items-center gap-4 p-4 border-t bg-background">
            <Button variant={isMicMuted ? "secondary" : "outline"} size="icon" className="w-12 h-12 rounded-full" onClick={() => setIsMicMuted(p => !p)}>
                {isMicMuted ? <MicOff /> : <Mic />}
            </Button>
            <Button variant={isCameraOff ? "secondary" : "outline"} size="icon" className="w-12 h-12 rounded-full" onClick={() => setIsCameraOff(p => !p)}>
                {isCameraOff ? <VideoOff /> : <Video />}
            </Button>
            <Button variant="destructive" size="icon" className="w-16 h-12 rounded-full" onClick={handleEndCall}>
                <PhoneOff />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
