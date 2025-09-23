'use client';

import { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Copy, Download, Shield, Calendar, User, Hash, Eye, EyeOff, QrCode } from 'lucide-react';
import { LanguageContext } from '@/context/language-context';
import { useToast } from '@/hooks/use-toast';
import { DigitalHealthLogo } from '@/components/digital-health-logo';
import { cn } from '@/lib/utils';

export default function DigitalHealthIdPage() {
  const router = useRouter();
  const { translations } = useContext(LanguageContext);
  const { toast } = useToast();
  
  const [patientData, setPatientData] = useState({
    name: '',
    dob: '',
    digitalHealthId: '',
    issuedAt: '',
    phone: '',
    address: ''
  });
  
  const [showFullId, setShowFullId] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      const userString = localStorage.getItem('temp_user');
      if (userString) {
        const user = JSON.parse(userString);
        const dhidString = localStorage.getItem('dhid_last_issued_for');
        const dhidIssuedAt = localStorage.getItem('dhid_issued_at');
        
        setPatientData({
          name: user.fullName || 'Patient',
          dob: user.dob || '',
          digitalHealthId: dhidString || `UXSP-${Math.random().toString(36).substr(2, 4).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
          issuedAt: dhidIssuedAt || new Date().toISOString(),
          phone: user.phone || '',
          address: user.address || ''
        });
      }
    } catch (error) {
      console.error('Failed to load patient data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(patientData.digitalHealthId);
      toast({
        title: "Copied!",
        description: "Digital Health ID copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy Digital Health ID",
        variant: "destructive",
      });
    }
  };

  const handleDownloadPdf = () => {
    toast({
      title: "Download Started",
      description: "Your Digital Health ID PDF is being generated",
    });
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Unknown';
    }
  };

  const formatDob = (dobString: string) => {
    try {
      return new Date(dobString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch {
      return dobString;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <Header />
        <div className="pt-20 pb-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Header />
      
      <div className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          {/* Back Button */}
          <div className="mb-8">
            <Button 
              variant="ghost" 
              onClick={() => router.back()}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>

          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-32 h-32 bg-gradient-to-br from-primary to-blue-600 rounded-3xl flex items-center justify-center shadow-2xl p-4">
                  <DigitalHealthLogo className="w-full h-full text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <Shield className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4 font-serif">
              Digital Health ID
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Your secure, portable health identity that connects all your medical records within MediLink
            </p>
          </div>

          {/* Main Card */}
          <div className="max-w-4xl mx-auto">
            <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center pb-8">
                <div className="flex justify-center mb-4">
                  <Badge variant="secondary" className="px-4 py-2 text-sm font-medium">
                    <Shield className="w-4 h-4 mr-2" />
                    Verified & Secure
                  </Badge>
                </div>
                <CardTitle className="text-2xl font-semibold text-gray-800">
                  Patient Health Identity
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-8">
                {/* Patient Information */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground font-medium">Patient Name</p>
                        <p className="text-lg font-semibold text-gray-900">{patientData.name}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground font-medium">Date of Birth</p>
                        <p className="text-lg font-semibold text-gray-900">{formatDob(patientData.dob)}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Hash className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground font-medium">Phone Number</p>
                        <p className="text-lg font-semibold text-gray-900">{patientData.phone || 'Not provided'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground font-medium">Issued On</p>
                        <p className="text-lg font-semibold text-gray-900">{formatDate(patientData.issuedAt)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator className="my-8" />

                {/* Digital Health ID Section */}
                <div className="text-center space-y-6">
                  <div className="flex justify-center">
                    <Badge variant="outline" className="px-4 py-2 text-sm font-medium">
                      <QrCode className="w-4 h-4 mr-2" />
                      Digital Health ID
                    </Badge>
                  </div>
                  
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border-2 border-blue-100">
                    <div className="font-mono text-2xl md:text-3xl font-bold text-blue-900 tracking-wider break-all">
                      {showFullId ? patientData.digitalHealthId : `${patientData.digitalHealthId.substring(0, 8)}...${patientData.digitalHealthId.substring(patientData.digitalHealthId.length - 8)}`}
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowFullId(!showFullId)}
                      className="mt-4 text-blue-600 hover:text-blue-700"
                    >
                      {showFullId ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                      {showFullId ? 'Hide' : 'Show'} Full ID
                    </Button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    onClick={handleCopyId}
                    className="px-8 py-3 text-lg font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Copy className="w-5 h-5 mr-2" />
                    Copy ID
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={handleDownloadPdf}
                    className="px-8 py-3 text-lg font-medium border-2 border-blue-200 text-blue-600 hover:bg-blue-50 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    Download PDF
                  </Button>
                </div>

                {/* Security Notice */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                  <div className="flex items-start space-x-3">
                    <Shield className="w-6 h-6 text-amber-600 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-amber-800 mb-2">Security Notice</h3>
                      <p className="text-amber-700 text-sm leading-relaxed">
                        Keep your Digital Health ID private and secure. This unique identifier helps link your health records within MediLink. 
                        Never share it with unauthorized parties and always verify the identity of anyone requesting this information.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Information */}
          <div className="max-w-4xl mx-auto mt-12">
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="text-center p-6 bg-white/60 backdrop-blur-sm border-0 shadow-lg">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Secure & Encrypted</h3>
                <p className="text-sm text-muted-foreground">Your health data is protected with industry-standard encryption</p>
              </Card>
              
              <Card className="text-center p-6 bg-white/60 backdrop-blur-sm border-0 shadow-lg">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <User className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Portable Identity</h3>
                <p className="text-sm text-muted-foreground">Access your health records anywhere, anytime with this unique ID</p>
              </Card>
              
              <Card className="text-center p-6 bg-white/60 backdrop-blur-sm border-0 shadow-lg">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Hash className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Universal Access</h3>
                <p className="text-sm text-muted-foreground">Works across all MediLink services and partner healthcare providers</p>
              </Card>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
