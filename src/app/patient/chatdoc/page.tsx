'use client';

import { useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { LanguageContext } from '@/context/language-context';
import { useToast } from '@/hooks/use-toast';
import { ChatDoc } from '@/components/chatdoc/chatdoc';
import { addDemoDoctors } from '@/lib/demo-doctors';
import TextFlipper from '@/components/ui/text-effect-flipper';

export default function PatientChatDocPage() {
  const { translations } = useContext(LanguageContext);
  const { toast } = useToast();
  const router = useRouter();
  const [userName, setUserName] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const userString = localStorage.getItem('temp_user');
    if (!userString) {
      router.push('/auth');
      return;
    }

    try {
      const user = JSON.parse(userString);
      setUserName(user.fullName || 'Patient');
    } catch (e) {
      setUserName('Patient');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <div className="mb-6">
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>

          {/* Page Header */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              <TextFlipper>Chat</TextFlipper> <TextFlipper delay={0.2} className="text-primary font-cursive">Doc</TextFlipper>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">Chat with your doctor in real-time as a backup to video calls</p>
          </div>

          {/* Demo Doctors Button */}
          <div className="mb-6">
            <Button 
              variant="outline" 
              onClick={() => {
                addDemoDoctors();
                toast({
                  title: "Demo Doctors Added",
                  description: "Demo doctors have been added for testing ChatDoc functionality",
                });
              }}
            >
              Add Demo Doctors (for testing)
            </Button>
          </div>

          {/* ChatDoc Component */}
          <div className="bg-white rounded-lg shadow-lg">
            <ChatDoc
              currentUserId={userName || `patient_${Date.now()}`}
              currentUserName={userName || 'Patient'}
              currentUserType="patient"
              onVideoCall={(doctorId, doctorName) => {
                toast({
                  title: "Video Call Requested",
                  description: `Initiating video call with ${doctorName}`,
                });
                // You can implement actual video call logic here
              }}
              onPhoneCall={(doctorId, doctorName) => {
                toast({
                  title: "Phone Call Requested",
                  description: `Calling ${doctorName}`,
                });
                // You can implement actual phone call logic here
              }}
              className="h-[600px]"
            />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
