
'use client';

import { useContext, useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Pill, FileText, Heart, PlusCircle, Upload, Search, ChevronRight, BellRing, Video, Building, Stethoscope, MapPin, Phone, Trash2, BrainCircuit, Clock } from "lucide-react";
import TextFlipper from "@/components/ui/text-effect-flipper";
import { LanguageContext } from '@/context/language-context';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import type { Doctor, Pharmacy, Prescription, Reminder, Consultation } from '@/lib/types';
import Link from 'next/link';
import Image from 'next/image';
import { VideoConsultationBooking } from '@/components/patient/video-consultation-booking';
import { JitsiCall } from '@/components/jitsi-call';
import { getPatientRecordByNameDob, ensurePatientRecord, copyTextToClipboard } from '@/lib/dhidService';
import { Download, Copy } from 'lucide-react';
import jsPDF from 'jspdf';

export default function PatientDashboard() {
  const { translations } = useContext(LanguageContext);
  const { toast } = useToast();
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [userDob, setUserDob] = useState<string>('');
  const [dhid, setDhid] = useState<string>('');
  const [dhidIssuedAt, setDhidIssuedAt] = useState<string>('');
  
  const [allDoctors, setAllDoctors] = useState<Doctor[]>([]);
  const [allPharmacies, setAllPharmacies] = useState<Pharmacy[]>([]);
  
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [filteredPharmacies, setFilteredPharmacies] = useState<Pharmacy[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [newReminder, setNewReminder] = useState('');
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [activeCall, setActiveCall] = useState<Consultation | null>(null);

  const [specializationFilter, setSpecializationFilter] = useState('All');
  const [locationFilter, setLocationFilter] = useState('');

  useEffect(() => {
    // Fetch user, doctors, and pharmacies data from localStorage
    const userString = localStorage.getItem('temp_user');
    if (!userString) {
      router.push('/auth');
      return;
    }
    
    let currentUserName = 'Patient';
    if (userString) {
      try {
        const user = JSON.parse(userString);
        currentUserName = user.fullName || 'Patient';
        setUserName(currentUserName);
        const dobDate: Date | string = user.dob;
        const dobStr = typeof dobDate === 'string' ? new Date(dobDate).toISOString().slice(0,10) : new Date(dobDate).toISOString().slice(0,10);
        setUserDob(dobStr);
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

    // Load DHID if available; if absent, generate as a non-blocking fallback
    try {
      const uStr = localStorage.getItem('temp_user');
      if (uStr) {
        const u = JSON.parse(uStr);
        const d = typeof u.dob === 'string' ? new Date(u.dob) : new Date(u.dob);
        const dob = isNaN(d.getTime()) ? new Date().toISOString().slice(0,10) : d.toISOString().slice(0,10);
        let rec = getPatientRecordByNameDob(currentUserName, dob);
        if (!rec) {
          const id = u.phone ? `PAT-${u.phone}` : `PAT-${Date.now()}`;
          rec = ensurePatientRecord({ id, name: currentUserName, dob });
        }
        if (rec) {
          setDhid(rec.digitalHealthId);
          setDhidIssuedAt(rec.dhidCreatedAt);
        }
      } else {
        // No temp user, still ensure a DHID so the banner is visible
        const fallbackDob = '1970-01-01';
        const id = `PAT-${Date.now()}`;
        const rec = ensurePatientRecord({ id, name: currentUserName || 'Patient', dob: fallbackDob });
        setDhid(rec.digitalHealthId);
        setDhidIssuedAt(rec.dhidCreatedAt);
      }
    } catch {}

    loadData(currentUserName);
  }, [router]);

  const lastPrescCountRef = useRef<number>(0);

  const loadData = (currentUserName: string) => {
    if (!currentUserName) return;
    const dsKey = 'medilink_prescriptions';
    const allPrescriptions = JSON.parse(localStorage.getItem(dsKey) || '[]');
    const userPrescriptions = allPrescriptions.filter((p: any) => (p.patient || p.patientName) === currentUserName);
    setPrescriptions(userPrescriptions);
    if (lastPrescCountRef.current && userPrescriptions.length > lastPrescCountRef.current) {
      toast({ title: 'New Prescription Added', description: 'A new prescription was added to your records.' });
    }
    lastPrescCountRef.current = userPrescriptions.length;

    const remindersString = localStorage.getItem('reminders_list');
    const allReminders = remindersString ? JSON.parse(remindersString) : [];
    const userReminders = allReminders.filter((r: Reminder) => r.patientName === currentUserName);
    setReminders(userReminders);

    const consultationsString = localStorage.getItem('consultations_list');
    const allConsultations = consultationsString ? JSON.parse(consultationsString) : [];
    const userConsultations = allConsultations.filter((c: Consultation) => c.patientName === currentUserName);
    setConsultations(userConsultations);
  };

  // Live-sync prescriptions between portals (prototype mode)
  useEffect(() => {
    if (!userName) return;
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'medilink_prescriptions') {
        loadData(userName);
      }
    };
    window.addEventListener('storage', handleStorage);
    const interval = setInterval(() => loadData(userName), 2000);
    return () => {
      window.removeEventListener('storage', handleStorage);
      clearInterval(interval);
    };
  }, [userName]);

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
  
  const handleBookingConfirmed = () => {
      loadData(userName);
  };

  useEffect(() => {
    let doctors = allDoctors;
    if (specializationFilter !== 'All') {
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
  
  const upcomingConsultations = consultations.filter(c => new Date(c.date) >= new Date());
  const pastConsultations = consultations.filter(c => new Date(c.date) < new Date());

  const handleCopyDhid = async () => {
    if (!dhid) return;
    await copyTextToClipboard(dhid);
    toast({ title: 'Copied', description: 'Digital Health ID copied to clipboard.' });
  };

  const handleDownloadDhidPdf = () => {
    if (!dhid) return;
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();

    // Brand header bar
    doc.setFillColor('#0ea5e9');
    doc.rect(0, 0, pageWidth, 80, 'F');
    doc.setTextColor('#ffffff');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('MediLink', 40, 50);

    // Subheader title
    doc.setTextColor('#0b1324');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('Digital Health ID', 40, 120);

    // Card container
    const cardX = 40;
    const cardY = 140;
    const cardW = pageWidth - 80;
    const cardH = 220;
    doc.setDrawColor('#e5e7eb');
    doc.setFillColor('#f8fafc');
    doc.roundedRect(cardX, cardY, cardW, cardH, 8, 8, 'FD');

    // Labels and values
    const labelColor = '#64748b';
    const valueColor = '#0b1324';
    let y = cardY + 36;
    const line = 28;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(labelColor);
    doc.setFontSize(11);
    doc.text('Patient Name', cardX + 20, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(valueColor);
    doc.setFontSize(13);
    doc.text(userName || 'Patient', cardX + 160, y);

    y += line;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(labelColor);
    doc.setFontSize(11);
    doc.text('DOB', cardX + 20, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(valueColor);
    doc.setFontSize(13);
    doc.text(userDob || '-', cardX + 160, y);

    y += line;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(labelColor);
    doc.setFontSize(11);
    doc.text('Digital Health ID', cardX + 20, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor('#0ea5e9');
    doc.setFontSize(14);
    doc.text(dhid, cardX + 160, y);

    y += line;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(labelColor);
    doc.setFontSize(11);
    doc.text('Issued', cardX + 20, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(valueColor);
    doc.setFontSize(13);
    doc.text(dhidIssuedAt ? new Date(dhidIssuedAt).toLocaleString() : new Date().toLocaleString(), cardX + 160, y);

    // Footer note
    doc.setTextColor('#94a3b8');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('Keep this DHID private. It helps link your health records within MediLink.', cardX, cardY + cardH + 30);

    doc.save(`DHID_${userName.replace(/\s+/g,'_')}.pdf`);
  };

  // Predefined common specialties for a clearer dropdown (capitalized)
  const allKnownSpecialties = [
    'General Physician',
    'Cardiologist',
    'Orthopedic',
    'Dermatologist',
    'Pediatrician',
    'Gynecologist',
    'Neurologist',
    'Psychiatrist',
    'ENT Specialist',
    'Ophthalmologist',
    'Dentist',
    'Oncologist',
    'Endocrinologist',
    'Gastroenterologist',
    'Nephrologist',
    'Pulmonologist',
    'Rheumatologist',
    'Urologist',
    'Physiotherapist'
  ];
  const uniqueSpecializations = ['All', ...allKnownSpecialties];
  
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 pt-20 pb-24">
        <div className="max-w-5xl mx-auto">
          
          <div className="relative text-center py-16 md:py-24 animate-fade-in-down overflow-hidden rounded-lg">
            <div className="relative z-10">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                <TextFlipper>{translations.patientDashboard.welcome}</TextFlipper> <TextFlipper delay={0.2} className="text-primary font-cursive">{userName}!</TextFlipper>
              </h1>
              <p className="mt-4 text-lg text-muted-foreground animate-text-fade-in-scale" style={{ animationDelay: '0.4s' }}>
                {translations.patientDashboard.subtitle}
              </p>
              {dhid ? (
                <div className="mt-6 mx-auto max-w-xl">
                  <div className="border rounded-lg p-4 bg-muted/30">
                    <p className="text-sm text-muted-foreground mb-2">Your Digital Health ID</p>
                    <p className="font-mono text-lg select-text break-all" aria-live="polite">{dhid}</p>
                    <div className="mt-3 flex gap-2 justify-center">
                      <Button variant="outline" size="sm" aria-label="Copy Digital Health ID" onClick={handleCopyDhid}>
                        <Copy className="w-4 h-4 mr-2" /> Copy
                      </Button>
                      <Button variant="default" size="sm" aria-label="Download Digital Health ID PDF" onClick={handleDownloadDhidPdf}>
                        <Download className="w-4 h-4 mr-2" /> Download PDF
                      </Button>
                    </div>
                    {dhidIssuedAt ? (
                      <p className="mt-2 text-xs text-muted-foreground">Issued on {new Date(dhidIssuedAt).toLocaleString()}</p>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 animate-content-fade-in" style={{ animationDelay: '0.6s' }}>
            <Card className="hover:shadow-xl hover:-translate-y-2 transition-transform duration-300">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{translations.patientDashboard.upcomingAppointments}</CardTitle>
                <Calendar className="w-5 h-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{upcomingConsultations.length}</div>
                <p className="text-xs text-muted-foreground">{translations.patientDashboard.viewSchedule}</p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-xl hover:-translate-y-2 transition-transform duration-300">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{translations.patientDashboard.activeMedications}</CardTitle>
                <Pill className="w-5 h-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{prescriptions.reduce((acc, p) => acc + p.medications.length, 0)}</div>
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

          {!dhid ? null : (
            <div className="mb-8 animate-content-fade-in" style={{ animationDelay: '0.7s' }}>
              <Card>
                <CardHeader>
                  <CardTitle>Your Digital Health ID</CardTitle>
                  <CardDescription>Keep this ID safe. You can copy or download it.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <p className="font-mono text-base select-text break-all" aria-live="polite">{dhid}</p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" aria-label="Copy Digital Health ID" onClick={handleCopyDhid}>
                        <Copy className="w-4 h-4 mr-2" /> Copy
                      </Button>
                      <Button variant="default" size="sm" aria-label="Download Digital Health ID PDF" onClick={handleDownloadDhidPdf}>
                        <Download className="w-4 h-4 mr-2" /> Download PDF
                      </Button>
                    </div>
                  </div>
                  {dhidIssuedAt ? (
                    <p className="mt-2 text-xs text-muted-foreground">Issued on {new Date(dhidIssuedAt).toLocaleString()}</p>
                  ) : null}
                </CardContent>
              </Card>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 animate-content-fade-in" style={{ animationDelay: '0.8s' }}>
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
                 <Button className="w-full" asChild>
                  <Link href="/patient/video-consultation">{translations.patientDashboard.videoConsultationButton}</Link>
                </Button>
              </CardContent>
            </Card>
            
          </div>

          <div className="animate-content-fade-in" style={{ animationDelay: '1s' }}>
            <Tabs defaultValue="appointments" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="appointments">{translations.patientDashboard.appointments}</TabsTrigger>
                <TabsTrigger value="reminders">{translations.patientDashboard.reminders.tabTitle}</TabsTrigger>
                <TabsTrigger value="doctors">{translations.patientDashboard.doctors}</TabsTrigger>
                <TabsTrigger value="digital-prescriptions">Digital Prescriptions</TabsTrigger>
              </TabsList>
              
              <TabsContent value="appointments" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{translations.patientDashboard.manageAppointments}</CardTitle>
                    <CardDescription>{translations.patientDashboard.manageAppointmentsDesc}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {upcomingConsultations.map((consult, index) => (
                       <div key={index} className="flex justify-between items-center bg-muted/50 p-4 rounded-lg">
                        <div>
                          <p className="font-semibold">{consult.doctorName}</p>
                          <p className="text-sm text-muted-foreground">{consult.specialization} | {new Date(consult.date).toLocaleDateString()} at {consult.time}</p>
                        </div>
                        <Button variant="ghost" size="icon">
                          <ChevronRight className="w-5 h-5" />
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="digital-prescriptions" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Digital Prescriptions</CardTitle>
                    <CardDescription>Your prescriptions issued by doctors.</CardDescription>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {prescriptions.length > 0 ? prescriptions.map((p: any) => (
                      <div key={p.id} className="animate-content-fade-in" style={{ animationDelay: '0s' }}>
                        <Card className="border-l-4 border-l-primary">
                          <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                              <span>{p.diagnosis || 'Prescription'}</span>
                              <span className="text-sm text-muted-foreground">{new Date(p.date).toLocaleDateString()}</span>
                            </CardTitle>
                            <CardDescription>By {p.doctor || `Dr. ${p.doctorName}`}</CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-3 text-sm">
                            <div>
                              <p className="font-medium">Medicines</p>
                              <ul className="list-disc ml-5 mt-1 space-y-1">
                                {p.medications.map((m: any, idx: number) => (
                                  <li key={idx}>{m.name} — {m.dosage}{m.frequency ? `, ${m.frequency}` : ''} for {m.duration}</li>
                                ))}
                              </ul>
                            </div>
                            {p.notes ? (
                              <div>
                                <p className="font-medium">Notes</p>
                                <p className="text-muted-foreground">{p.notes}</p>
                              </div>
                            ) : null}
                            <div className="pt-2">
                              <Button variant="outline" onClick={() => window.print()}>Download PDF</Button>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )) : (
                      <p className="text-muted-foreground">No prescriptions yet.</p>
                    )}
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
                       {prescriptions.map((presc: any) => presc.medications.map((med: any, index: number) => (
                           <div key={`${presc.id}-${index}`} className="flex justify-between items-center bg-blue-100/50 dark:bg-blue-900/20 p-3 rounded-lg">
                              <p className="font-medium text-sm">
                                {translations.patientDashboard.reminders.take} <span className="text-primary">{med.name}</span> ({med.dosage}) {med.frequency ? `- ${med.frequency}` : ''} - {med.duration}
                              </p>
                              <p className="text-xs text-muted-foreground">{translations.patientDashboard.reminders.from} {presc.doctor || `Dr. ${presc.doctorName}`}</p>
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
                        <Select onValueChange={setSpecializationFilter} defaultValue="All">
                            <SelectTrigger className="w-full sm:w-1/2">
                                <SelectValue placeholder={translations.patientDashboard.filterBySpecialization} />
                            </SelectTrigger>
                            <SelectContent>
                                {uniqueSpecializations.map((spec) => (
                                    <SelectItem key={spec} value={spec}>{spec}</SelectItem>
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
