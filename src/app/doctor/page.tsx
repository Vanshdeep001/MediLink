
'use client';
import { useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Users, FileText, HeartPulse, PlusCircle, MessageSquare, LineChart, ChevronRight, Building, MapPin, Phone, ClipboardEdit, Trash2, Save, Video, Clock } from "lucide-react";
import TextFlipper from "@/components/ui/text-effect-flipper";
import { LanguageContext } from '@/context/language-context';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import type { Patient, Pharmacy, Prescription, Medication, Consultation } from '@/lib/types';
import Image from 'next/image';
import { JitsiCall } from '@/components/jitsi-call';

export default function DoctorDashboard() {
  const { translations } = useContext(LanguageContext);
  const { toast } = useToast();
  const router = useRouter();
  const [doctorName, setDoctorName] = useState('');
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [activeCall, setActiveCall] = useState<Consultation | null>(null);


  // Prescription State
  const [selectedPatient, setSelectedPatient] = useState('');
  const [medications, setMedications] = useState<Medication[]>([{ name: '', dosage: '', frequency: '', duration: '' }]);
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const userString = localStorage.getItem('temp_user');
    if (!userString) {
      router.push('/auth');
      return;
    }

    let currentDoctorName = 'Doctor';
    if (userString) {
      try {
        const user = JSON.parse(userString);
        currentDoctorName = user.fullName || 'Doctor';
        setDoctorName(currentDoctorName);
      } catch (e) {
        setDoctorName('Doctor');
      }
    } else {
      setDoctorName('Doctor');
    }
    
    const pharmaciesString = localStorage.getItem('pharmacies_list');
    if (pharmaciesString) {
      setPharmacies(JSON.parse(pharmaciesString));
    }

    const patientsKey = 'users_list';
    let users = [] as any[];
    const existingUsers = localStorage.getItem(patientsKey);
    if (existingUsers) {
      users = JSON.parse(existingUsers);
    } else {
      users = [
        { fullName: 'Vanshdeep', email: 'vanshdeep@example.com', phone: '9999999999', age: 24, role: 'patient' },
        { fullName: 'Aman', email: 'aman@example.com', phone: '8888888888', age: 28, role: 'patient' },
        { fullName: 'Priya', email: 'priya@example.com', phone: '7777777777', age: 26, role: 'patient' }
      ];
      localStorage.setItem(patientsKey, JSON.stringify(users));
    }
    setPatients(users.filter((u: any) => u.role === 'patient'));

    const consultationsString = localStorage.getItem('consultations_list');
    if (consultationsString) {
      const allConsultations = JSON.parse(consultationsString);
      const doctorConsultations = allConsultations.filter((c: Consultation) => c.doctorName.includes(currentDoctorName));
      setConsultations(doctorConsultations);
    }
  }, [router]);

  const handleAddMedication = () => {
    setMedications([...medications, { name: '', dosage: '', frequency: '', duration: '' }]);
  };

  const handleRemoveMedication = (index: number) => {
    const newMedications = medications.filter((_, i) => i !== index);
    setMedications(newMedications);
  };
  
  const handleMedicationChange = (index: number, field: keyof Medication, value: string) => {
    const newMedications = [...medications];
    newMedications[index][field] = value;
    setMedications(newMedications);
  };
  
  const handleSavePrescription = () => {
    if (!selectedPatient || medications.some(m => !m.name || !m.dosage || !m.frequency || !m.duration)) {
      toast({
        title: translations.doctorDashboard.prescriptions.validationErrorTitle,
        description: translations.doctorDashboard.prescriptions.validationErrorDesc,
        variant: "destructive",
      });
      return;
    }

    const patientDetails = patients.find(p => p.fullName === selectedPatient);
    if (!patientDetails) return;

    const newPrescription: Prescription = {
      id: `pres-${Date.now()}`,
      doctor: `Dr. ${doctorName}`,
      patient: selectedPatient,
      date: new Date().toISOString().split('T')[0],
      diagnosis,
      medications,
      notes,
    };

    const dsKey = 'medilink_prescriptions';
    const existing = JSON.parse(localStorage.getItem(dsKey) || '[]');
    existing.push(newPrescription);
    localStorage.setItem(dsKey, JSON.stringify(existing));
    // Emit a custom event so other tabs/pages can pick up instantly
    try { window.dispatchEvent(new StorageEvent('storage', { key: dsKey } as any)); } catch {}
    
    // Add notifications
    const notificationsString = localStorage.getItem('notifications');
    const allNotifications = notificationsString ? JSON.parse(notificationsString) : [];
    
    // Notification for patient
    allNotifications.push({
      id: `notif-${Date.now()}-p`,
      for: 'patient',
      patientName: selectedPatient,
      message: `${translations.notifications.newPrescriptionPatient} Dr. ${doctorName}`,
      read: false
    });
    localStorage.setItem('notifications', JSON.stringify(allNotifications));

    toast({
      title: translations.doctorDashboard.prescriptions.successTitle,
      description: `${translations.doctorDashboard.prescriptions.successDesc} ${selectedPatient}.`,
    });

    // Reset form
    setSelectedPatient('');
    setDiagnosis('');
    setNotes('');
    setMedications([{ name: '', dosage: '', frequency: '', duration: '' }]);
  };
  
  const upcomingConsultations = consultations.filter(c => new Date(c.date) >= new Date());
  const pastConsultations = consultations.filter(c => new Date(c.date) < new Date());

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 pt-20 pb-24">
        <div className="max-w-5xl mx-auto">
          
          <div className="relative text-center py-16 md:py-24 animate-fade-in-down overflow-hidden rounded-lg">
             <Image
                src="/doctor.jpg"
                alt="Doctor background"
                fill
                className="object-cover object-center z-0 opacity-20"
                data-ai-hint="doctor professional"
              />
            <div className="relative z-10">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                <TextFlipper>{translations.doctorDashboard.welcome}</TextFlipper> <TextFlipper delay={0.2} className="text-primary font-cursive">Dr. {doctorName}!</TextFlipper>
              </h1>
              <p className="mt-4 text-lg text-muted-foreground animate-text-fade-in-scale" style={{ animationDelay: '0.4s' }}>
                {translations.doctorDashboard.subtitle}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 animate-content-fade-in" style={{ animationDelay: '0.6s' }}>
            <Card className="hover:shadow-xl hover:-translate-y-2 transition-transform duration-300">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{translations.doctorDashboard.todaysAppointments}</CardTitle>
                <Calendar className="w-5 h-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{upcomingConsultations.length}</div>
                <p className="text-xs text-muted-foreground">{translations.doctorDashboard.viewSchedule}</p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-xl hover:-translate-y-2 transition-transform duration-300">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{translations.doctorDashboard.totalPatients}</CardTitle>
                <Users className="w-5 h-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{patients.length}</div>
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
                <div className="text-2xl font-bold">{consultations.length}</div>
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
                <TabsTrigger value="video-consultation">Video Consultation</TabsTrigger>
                <TabsTrigger value="prescriptions">{translations.doctorDashboard.prescriptions.tabTitle}</TabsTrigger>
                <TabsTrigger value="patients">{translations.doctorDashboard.patients}</TabsTrigger>
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
              
              <TabsContent value="video-consultation" className="mt-6">
                 <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Video /> Video Consultations</CardTitle>
                    <CardDescription>Manage your scheduled video calls with patients.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                     <div>
                       <h3 className="font-semibold mb-2">Incoming Consultations</h3>
                        {upcomingConsultations.length > 0 ? (
                           <div className="space-y-4">
                            {upcomingConsultations.map(consult => (
                                <div key={consult.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-muted/50 p-4 rounded-lg">
                                    <div>
                                        <p className="font-semibold">{consult.patientName}</p>
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                            <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {new Date(consult.date).toLocaleDateString()}</span>
                                            <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {consult.time}</span>
                                        </div>
                                    </div>
                                    <Button className="mt-2 sm:mt-0" onClick={() => setActiveCall(consult)}>Join Call</Button>
                                </div>
                            ))}
                           </div>
                        ) : (
                           <p className="text-sm text-muted-foreground text-center py-4">No upcoming consultations.</p>
                        )}
                     </div>
                      <div>
                       <h3 className="font-semibold mb-2">Past Consultations</h3>
                        {pastConsultations.length > 0 ? (
                           <div className="space-y-4">
                            {pastConsultations.map(consult => (
                                <div key={consult.id} className="flex justify-between items-center bg-muted/30 p-4 rounded-lg opacity-70">
                                    <div>
                                        <p className="font-semibold">{consult.patientName}</p>
                                        <p className="text-sm text-muted-foreground">{new Date(consult.date).toLocaleDateString()} at {consult.time}</p>
                                    </div>
                                    <Button variant="outline" disabled>View Details</Button>
                                </div>
                            ))}
                           </div>
                        ) : (
                           <p className="text-sm text-muted-foreground text-center py-4">No past consultations.</p>
                        )}
                     </div>
                  </CardContent>
                </Card>
              </TabsContent>

               <TabsContent value="prescriptions" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><ClipboardEdit />{translations.doctorDashboard.prescriptions.title}</CardTitle>
                    <CardDescription>{translations.doctorDashboard.prescriptions.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <label className="text-sm font-medium">{translations.doctorDashboard.prescriptions.selectPatient}</label>
                      <Select onValueChange={setSelectedPatient} value={selectedPatient}>
                          <SelectTrigger>
                            <SelectValue placeholder={translations.doctorDashboard.prescriptions.patientPlaceholder} />
                          </SelectTrigger>
                          <SelectContent>
                              {patients.map((p) => (
                                <SelectItem key={p.email} value={p.fullName}>{p.fullName}</SelectItem>
                              ))}
                          </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Diagnosis</label>
                      <Input value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} placeholder="e.g., Viral Fever" />
                    </div>
                    
                    <div className="space-y-4">
                        {medications.map((med, index) => (
                          <div key={index} className="flex flex-col md:flex-row gap-4 items-end bg-muted/50 p-4 rounded-lg">
                              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 flex-grow">
                                  <div>
                                    <label className="text-xs text-muted-foreground">{translations.doctorDashboard.prescriptions.medicineName}</label>
                                    <Input value={med.name} onChange={(e) => handleMedicationChange(index, 'name', e.target.value)} placeholder={translations.doctorDashboard.prescriptions.medicinePlaceholder} />
                                  </div>
                                  <div>
                                    <label className="text-xs text-muted-foreground">{translations.doctorDashboard.prescriptions.dosage}</label>
                                    <Input value={med.dosage} onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)} placeholder={translations.doctorDashboard.prescriptions.dosagePlaceholder} />
                                  </div>
                                  <div>
                                    <label className="text-xs text-muted-foreground">Frequency</label>
                                    <Input value={med.frequency} onChange={(e) => handleMedicationChange(index, 'frequency', e.target.value)} placeholder="e.g., Twice daily" />
                                  </div>
                                  <div>
                                    <label className="text-xs text-muted-foreground">{translations.doctorDashboard.prescriptions.duration}</label>
                                    <Input value={med.duration} onChange={(e) => handleMedicationChange(index, 'duration', e.target.value)} placeholder={translations.doctorDashboard.prescriptions.durationPlaceholder} />
                                  </div>
                              </div>
                              <Button variant="ghost" size="icon" onClick={() => handleRemoveMedication(index)}>
                                <Trash2 className="w-5 h-5 text-destructive" />
                              </Button>
                          </div>
                        ))}
                    </div>

                    <div>
                      <label className="text-sm font-medium">Notes</label>
                      <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Additional advice or instructions (optional)" />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                       <Button onClick={handleAddMedication} variant="outline">
                        <PlusCircle className="mr-2 h-5 w-5" />
                        {translations.doctorDashboard.prescriptions.addMedicine}
                      </Button>
                      <Button onClick={handleSavePrescription}>
                        <Save className="mr-2 h-5 w-5" />
                        {translations.doctorDashboard.prescriptions.savePrescription}
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
                    {patients.map(p => (
                      <div key={p.email} className="flex justify-between items-center bg-muted/50 p-4 rounded-lg">
                        <div>
                          <p className="font-semibold">{p.fullName}</p>
                          <p className="text-sm text-muted-foreground">{p.email}</p>
                        </div>
                        <Button variant="ghost" size="icon">
                          <ChevronRight className="w-5 h-5" />
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              

            </Tabs>
          </div>
        </div>
      </main>
      <Footer />
      {activeCall && (
        <JitsiCall 
            roomName={activeCall.jitsiLink.split('/').pop()!}
            userName={doctorName}
            onClose={() => setActiveCall(null)}
        />
      )}
    </div>
  );
}
