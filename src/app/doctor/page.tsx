
'use client';
import { useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Users, FileText, HeartPulse, PlusCircle, MessageSquare, LineChart, ChevronRight, Building, MapPin, Phone, ClipboardEdit, Trash2, Save, Video, Clock, MessageCircle, X, Send } from "lucide-react";
import TextFlipper from "@/components/ui/text-effect-flipper";
import { LanguageContext } from '@/context/language-context';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import type { Patient, Pharmacy, Prescription, Medication, Consultation } from '@/lib/types';
import Image from 'next/image';
import { JitsiCall } from '@/components/jitsi-call';
import ChatService, { type ChatSession } from '@/lib/chat-service';
import { DoctorCallInterface } from '@/components/doctor/doctor-call-interface';
import { orderService } from '@/lib/order-service';
import { ChatDoc } from '@/components/chatdoc/chatdoc';
import { addDemoDoctors } from '@/lib/demo-doctors';

export default function DoctorDashboard() {
  const { translations } = useContext(LanguageContext);
  const { toast } = useToast();
  const router = useRouter();
  const [doctorName, setDoctorName] = useState('');
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [activeCall, setActiveCall] = useState<Consultation | null>(null);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [selectedChatSession, setSelectedChatSession] = useState<ChatSession | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [incomingCallNotification, setIncomingCallNotification] = useState<any>(null);


  // Prescription State
  const [selectedPatient, setSelectedPatient] = useState('');
  const [medications, setMedications] = useState<Medication[]>([{ name: '', dosage: '', frequency: '', duration: '' }]);
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    // Add demo doctors if they don't exist
    addDemoDoctors();
    
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

    // Load chat sessions for this doctor
    const chatService = ChatService.getInstance();
    
    // Create a demo session with actual patient data if no sessions exist
    if (chatService.getChatSessionsForUser(currentDoctorName, 'doctor').length === 0) {
      // Get registered doctors to find the correct doctor ID
      const registeredDoctors = chatService.getRegisteredDoctors();
      const currentDoctor = registeredDoctors.find(d => d.name === currentDoctorName || d.name.includes(currentDoctorName));
      
      if (currentDoctor) {
        // Create a session with Vanshdeep (patient) and current doctor using correct IDs
        const demoSession = chatService.createChatSession(
          'Vanshdeep',
          'Vanshdeep',
          currentDoctor.id,
          currentDoctor.name
        );
        
        // Add a demo message from patient
        chatService.sendMessage(demoSession.chatId, 'patient', 'Hello Doctor, I have been experiencing some symptoms and would like to discuss them with you.');
      }
    }
    
    // Get sessions using the correct doctor ID
    const registeredDoctors = chatService.getRegisteredDoctors();
    const currentDoctor = registeredDoctors.find(d => d.name === currentDoctorName || d.name.includes(currentDoctorName));
    const doctorId = currentDoctor ? currentDoctor.id : currentDoctorName;
    
    const sessions = chatService.getChatSessionsForUser(doctorId, 'doctor');
    setChatSessions(sessions);

    // Listen for new messages
    const handleNewMessage = () => {
      const updatedSessions = chatService.getChatSessionsForUser(doctorId, 'doctor');
      setChatSessions(updatedSessions);
      
      // Update selected session if it exists
      if (selectedChatSession) {
        const updatedSelectedSession = chatService.getChatSession(selectedChatSession.chatId);
        if (updatedSelectedSession) {
          setSelectedChatSession(updatedSelectedSession);
        }
      }
    };

    chatService.on('newMessage', handleNewMessage);
    
    return () => {
      chatService.off('newMessage', handleNewMessage);
    };
  }, [router, doctorName, selectedChatSession]);

  // Listen for incoming call notifications
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      console.log('Storage event received:', e.key);
      if (e.key === 'notifications') {
        const notificationsString = localStorage.getItem('notifications');
        console.log('Notifications from localStorage:', notificationsString);
        if (notificationsString) {
          const allNotifications = JSON.parse(notificationsString);
          console.log('All notifications:', allNotifications);
          const incomingCall = allNotifications.find((notif: any) => 
            notif.type === 'incoming_call' && 
            notif.for === 'doctor' && 
            notif.doctorName === doctorName &&
            !notif.read
          );
          
          console.log('Found incoming call:', incomingCall);
          console.log('Current doctor name:', doctorName);
          
          if (incomingCall) {
            setIncomingCallNotification(incomingCall);
            toast({
              title: "Incoming Call!",
              description: `${incomingCall.patientName} is calling you for a video consultation`,
              duration: 10000
            });
          }
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also check for existing notifications on mount
    const notificationsString = localStorage.getItem('notifications');
    console.log('Checking existing notifications on mount:', notificationsString);
    if (notificationsString) {
      const allNotifications = JSON.parse(notificationsString);
      console.log('Existing notifications:', allNotifications);
      const incomingCall = allNotifications.find((notif: any) => 
        notif.type === 'incoming_call' && 
        notif.for === 'doctor' && 
        notif.doctorName === doctorName &&
        !notif.read
      );
      
      console.log('Found existing incoming call:', incomingCall);
      if (incomingCall) {
        setIncomingCallNotification(incomingCall);
      }
    }

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [doctorName, toast]);

  const handleAcceptCall = () => {
    if (incomingCallNotification) {
      const consultation: Consultation = {
        id: incomingCallNotification.callSession.id,
        patientName: incomingCallNotification.patientName,
        doctorName: incomingCallNotification.doctorName,
        specialization: 'Instant Call',
        date: new Date().toISOString(),
        time: new Date().toLocaleTimeString(),
        jitsiLink: incomingCallNotification.jitsiLink,
        roomName: incomingCallNotification.roomName
      };
      
      console.log('Doctor accepting call with consultation:', consultation);
      console.log('Room name for doctor JitsiCall:', incomingCallNotification.roomName);
      
      setActiveCall(consultation);
      setIncomingCallNotification(null);
      
      // Mark notification as read
      const notificationsString = localStorage.getItem('notifications');
      if (notificationsString) {
        const allNotifications = JSON.parse(notificationsString);
        const updatedNotifications = allNotifications.map((notif: any) => 
          notif.id === incomingCallNotification.id ? { ...notif, read: true } : notif
        );
        localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
      }
    }
  };

  const handleDeclineCall = () => {
    if (incomingCallNotification) {
      setIncomingCallNotification(null);
      
      // Mark notification as read
      const notificationsString = localStorage.getItem('notifications');
      if (notificationsString) {
        const allNotifications = JSON.parse(notificationsString);
        const updatedNotifications = allNotifications.map((notif: any) => 
          notif.id === incomingCallNotification.id ? { ...notif, read: true } : notif
        );
        localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
      }
    }
  };

  const handleAddMedication = () => {
    setMedications([...medications, { name: '', dosage: '', frequency: '', duration: '' }]);
  };

  const handleRemoveMedication = (index: number) => {
    const newMedications = medications.filter((_, i) => i !== index);
    setMedications(newMedications);
  };

  const handleSendMessage = () => {
    if (!selectedChatSession || !newMessage.trim()) return;
    
    const chatService = ChatService.getInstance();
    chatService.sendMessage(selectedChatSession.chatId, 'doctor', newMessage.trim());
    
    // Update local state
    const updatedSession = chatService.getChatSession(selectedChatSession.chatId);
    if (updatedSession) {
      setSelectedChatSession(updatedSession);
      setChatSessions(prev => prev.map(session => 
        session.chatId === selectedChatSession.chatId ? updatedSession : session
      ));
    }
    
    setNewMessage('');
    toast({
      title: 'Message sent',
      description: `Message sent to ${selectedChatSession.patientName}`,
    });
  };

  const createChatWithPatient = (patientName: string) => {
    const chatService = ChatService.getInstance();
    
    // Find patient in the patients list
    const patient = patients.find(p => p.fullName === patientName);
    if (!patient) {
      toast({
        title: 'Patient not found',
        description: 'Could not find the patient in your records.',
        variant: 'destructive'
      });
      return;
    }
    
    // Get the correct doctor ID
    const registeredDoctors = chatService.getRegisteredDoctors();
    const currentDoctor = registeredDoctors.find(d => d.name === doctorName || d.name.includes(doctorName));
    const doctorId = currentDoctor ? currentDoctor.id : doctorName;
    
    // Create a new chat session
    const session = chatService.createChatSession(
      patient.id || patient.fullName,
      patient.fullName,
      doctorId,
      currentDoctor ? currentDoctor.name : doctorName
    );
    
    // Update local state
    setChatSessions(prev => [session, ...prev]);
    setSelectedChatSession(session);
    
    toast({
      title: 'Chat created',
      description: `Started new chat with ${patientName}`,
    });
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
    
    // Create prescription order for auto-population in patient's order medicines
    // Note: This would need to be implemented in orderService if needed
    // orderService.createPrescriptionOrder(newPrescription);
    
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
              <CardContent className="space-y-3">
                {selectedChatSession ? (
                  // Chat Interface
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-2 bg-primary/10 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                          {selectedChatSession.patientName.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{selectedChatSession.patientName}</p>
                          <p className="text-xs text-muted-foreground">Online</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => setSelectedChatSession(null)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    {/* Messages */}
                    <div className="h-48 overflow-y-auto space-y-2 p-2 bg-muted/30 rounded-lg">
                      {selectedChatSession.messages.map((message) => (
                        <div key={message.id} className={`flex ${message.sender === 'doctor' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] p-2 rounded-lg text-sm ${
                            message.sender === 'doctor' 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-background border'
                          }`}>
                            <p>{message.text}</p>
                            <p className="text-xs opacity-70 mt-1">
                              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Message Input */}
                    <div className="flex gap-2">
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      />
                      <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  // Chat List
                  <>
                    {chatSessions.length > 0 ? (
                      <>
                        {chatSessions.slice(0, 3).map((session) => (
                          <div key={session.chatId} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted/70 transition-colors" onClick={() => setSelectedChatSession(session)}>
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                                {session.patientName.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-sm">{session.patientName}</p>
                                <p className="text-xs text-muted-foreground truncate">
                                  {session.lastMessage?.text || 'No messages yet'}
                                </p>
                              </div>
                            </div>
                            {session.unreadCount > 0 && (
                              <div className="bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                {session.unreadCount}
                              </div>
                            )}
                          </div>
                        ))}
                      </>
                    ) : (
                      <div className="text-center text-muted-foreground py-4">
                        <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No messages from patients yet</p>
                        {patients.length > 0 && (
                          <div className="mt-3 space-y-2">
                            <p className="text-xs">Start a chat with:</p>
                            {patients.slice(0, 2).map((patient) => (
                              <Button
                                key={patient.fullName}
                                variant="outline"
                                size="sm"
                                onClick={() => createChatWithPatient(patient.fullName)}
                                className="w-full text-xs"
                              >
                                <MessageSquare className="w-3 h-3 mr-1" />
                                {patient.fullName}
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
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
                <DoctorCallInterface doctorName={doctorName} />
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
                      <Select onValueChange={setSelectedPatient} value={selectedPatient || ""}>
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
            roomName={activeCall.roomName || activeCall.jitsiLink.split('/').pop()!}
            userName={doctorName}
            onClose={() => setActiveCall(null)}
        />
      )}

      {/* Incoming Call Notification */}
      {incomingCallNotification && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Video className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Incoming Video Call
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                <strong>{incomingCallNotification.patientName}</strong> is calling you for an instant video consultation
              </p>
              <div className="flex gap-3 justify-center">
                <Button 
                  onClick={handleDeclineCall}
                  variant="outline"
                  className="flex-1"
                >
                  <X className="w-4 h-4 mr-2" />
                  Decline
                </Button>
                <Button 
                  onClick={handleAcceptCall}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <Video className="w-4 h-4 mr-2" />
                  Accept Call
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
