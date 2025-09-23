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

// Function to convert common English names to Punjabi (only when language is Punjabi)
const convertNameToPunjabi = (englishName: string, currentLanguage: string): string => {
  // Only convert to Punjabi if the current language is Punjabi
  if (currentLanguage !== 'pa') {
    return englishName; // Return original name for English and Hindi
  }

  const nameMap: { [key: string]: string } = {
    'Ananya': 'ਅਨੰਨਿਆ',
    'Singh': 'ਸਿੰਘ',
    'Kaur': 'ਕੌਰ',
    'Kumar': 'ਕੁਮਾਰ',
    'Sharma': 'ਸ਼ਰਮਾ',
    'Gupta': 'ਗੁਪਤਾ',
    'Patel': 'ਪਟੇਲ',
    'Jain': 'ਜੈਨ',
    'Agarwal': 'ਅਗਰਵਾਲ',
    'Malhotra': 'ਮਲਹੋਤਰਾ',
    'Chopra': 'ਚੋਪੜਾ',
    'Bhatia': 'ਭਾਟੀਆ',
    'Sethi': 'ਸੇਠੀ',
    'Verma': 'ਵਰਮਾ',
    'Yadav': 'ਯਾਦਵ',
    'Raj': 'ਰਾਜ',
    'Khan': 'ਖਾਨ',
    'Ahmed': 'ਅਹਿਮਦ',
    'Ali': 'ਅਲੀ',
    'Hussain': 'ਹੁਸੈਨ',
    'Patient': 'ਮਰੀਜ਼'
  };

  // Split the name into parts and convert each part
  const nameParts = englishName.split(' ');
  const punjabiParts = nameParts.map(part => nameMap[part] || part);
  return punjabiParts.join(' ');
};

export default function PatientChatDocPage() {
  const { translations, language } = useContext(LanguageContext);
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
              {translations.patientDashboard.backToDashboard}
            </Button>
          </div>

          {/* Page Header */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              <TextFlipper>{translations.patientDashboard.chatDoc}</TextFlipper>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">{translations.patientDashboard.chatDocDesc}</p>
          </div>

          {/* Demo Doctors Button */}
          <div className="mb-6">
            <Button 
              variant="outline" 
              onClick={() => {
                addDemoDoctors();
                toast({
                  title: translations.patientDashboard.demoDoctorsAdded,
                  description: translations.patientDashboard.demoDoctorsAddedDesc,
                });
              }}
            >
              {translations.patientDashboard.addDemoDoctors}
            </Button>
          </div>

          {/* ChatDoc Component */}
          <div className="bg-white rounded-lg shadow-lg">
            <ChatDoc
              currentUserId={userName || `patient_${Date.now()}`}
              currentUserName={convertNameToPunjabi(userName, language) || 'Patient'}
              currentUserType="patient"
              onVideoCall={(doctorId, doctorName) => {
                toast({
                  title: translations.patientDashboard.videoCallRequested,
                  description: `${translations.patientDashboard.initiatingVideoCall} ${doctorName}`,
                });
                // You can implement actual video call logic here
              }}
              onPhoneCall={(doctorId, doctorName) => {
                toast({
                  title: translations.patientDashboard.phoneCallRequested,
                  description: `${translations.patientDashboard.calling} ${doctorName}`,
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
