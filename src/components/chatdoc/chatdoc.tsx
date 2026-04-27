'use client';

import React, { useState, useEffect, useContext } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageCircle, ArrowLeft, Video, Phone } from 'lucide-react';
import { ChatList } from './chat-list';
import { ChatInterface } from './chat-interface';
import ChatService, { type ChatSession } from '@/lib/chat-service';
import { useToast } from '@/hooks/use-toast';
import { LanguageContext } from '@/context/language-context';
import { useSocket } from '@/hooks/use-socket';
import { WebRTCCall } from './WebRTCCall';

interface ChatDocProps {
  currentUserId: string;
  currentUserName: string;
  currentUserType: 'patient' | 'doctor';
  onVideoCall?: (doctorId: string, doctorName: string) => void;
  onPhoneCall?: (doctorId: string, doctorName: string) => void;
  className?: string;
}

// Registration check helper
const hasDoctors = (doctors: any[]) => doctors.length > 0;

export function ChatDoc({ 
  currentUserId, 
  currentUserName, 
  currentUserType, 
  onVideoCall,
  onPhoneCall,
  className = '' 
}: ChatDocProps) {
  const { translations } = useContext(LanguageContext);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [showNewChatDialog, setShowNewChatDialog] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const { toast } = useToast();

  const chatService = ChatService.getInstance();
  const [registeredDoctors, setRegisteredDoctors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCall, setActiveCall] = useState<{ room: string; remoteName: string; targetId: string; isCaller: boolean } | null>(null);
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    // Listen for incoming WebRTC calls
    socket.on(`call:incoming-${currentUserId}`, ({ from, callerName }) => {
      setActiveCall({
        room: `call_${from}_${currentUserId}`,
        remoteName: callerName,
        targetId: from,
        isCaller: false
      });
      toast({ title: "Incoming Call", description: `${callerName} is calling you for a video consultation.` });
    });


    socket.on(`call:rejected-${currentUserId}`, () => {
      setActiveCall(null);
      toast({ title: "Call Rejected", variant: "destructive" });
    });

    return () => {
      socket.off(`call:incoming-${currentUserId}`);
      socket.off(`call:rejected-${currentUserId}`);
    };
  }, [socket, currentUserId, toast]);

  // Identify identity for WebRTC signaling
  useEffect(() => {
    if (!socket || !currentUserId) return;

    const onConnect = () => {
      console.log('🆔 Identifying with socket as patient:', currentUserId);
      socket.emit('identify', currentUserId);
    };

    if (socket.connected) {
      onConnect();
    }

    socket.on('connect', onConnect);
    return () => {
      socket.off('connect', onConnect);
    };
  }, [socket, currentUserId]);

  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 3;

    const fetchDoctors = async () => {
      setIsLoading(true);
      try {
        console.log('Fetching doctors from:', 'http://localhost:5000/api/public/doctors');
        const response = await fetch('http://localhost:5000/api/public/doctors');
        const result = await response.json();
        
        if (result.success) {
          console.log(`Fetched ${result.data.length} doctors`);
          setRegisteredDoctors(result.data);
          setIsLoading(false);
          
          if (result.data.length === 0 && retryCount < maxRetries) {
            retryCount++;
            setTimeout(fetchDoctors, 2000);
          }
        }
      } catch (error) {
        console.error('Error fetching doctors:', error);
        if (retryCount < maxRetries) {
          retryCount++;
          setTimeout(fetchDoctors, 2000);
        } else {
          setIsLoading(false);
        }
      }
    };
    fetchDoctors();
  }, []);

  useEffect(() => {
    // Initialize demo data if no sessions exist
    const sessions = chatService.getChatSessionsForUser(currentUserId, currentUserType);
    
    if (sessions.length === 0 && registeredDoctors.length > 0) {
      chatService.initializeDemoData();
    }
  }, [currentUserId, currentUserType, chatService, registeredDoctors]);

  useEffect(() => {
    if (selectedChatId) {
      const session = chatService.getChatSession(selectedChatId);
      setSelectedSession(session);
    }
  }, [selectedChatId, chatService]);

  const handleChatSelect = (chatId: string) => {
    setSelectedChatId(chatId);
  };

  const handleStartNewChat = () => {
    setShowNewChatDialog(true);
  };

  const handleCreateNewChat = () => {
    if (!selectedDoctorId) {
      toast({
        title: "Please select a doctor",
        description: "Choose a doctor to start a new chat.",
        variant: "destructive",
      });
      return;
    }

    const selectedDoctor = registeredDoctors.find(d => d.id === selectedDoctorId);
    if (!selectedDoctor) {
      toast({
        title: "Doctor not found",
        description: "The selected doctor is no longer available.",
        variant: "destructive",
      });
      return;
    }

    try {
      const session = chatService.createChatSession(
        currentUserId,
        currentUserName,
        selectedDoctorId,
        selectedDoctor.name || selectedDoctor.fullName
      );

      setSelectedChatId(session.chatId);
      setShowNewChatDialog(false);
      setSelectedDoctorId('');

      toast({
        title: "Chat started",
        description: `You can now chat with ${selectedDoctor.name}`,
      });
    } catch (error) {
      toast({
        title: "Failed to start chat",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleVideoCall = () => {
    if (selectedSession && socket) {
      const targetId = currentUserType === 'patient' ? selectedSession.doctorId : selectedSession.patientId;
      const targetName = currentUserType === 'patient' ? selectedSession.doctorName : selectedSession.patientName;
      
      setActiveCall({
        room: `call_${currentUserId}_${targetId}`,
        remoteName: targetName,
        targetId: targetId,
        isCaller: true
      });

      socket.emit('call:initiate', { to: targetId, callerName: currentUserName });
      
      if (onVideoCall) onVideoCall(targetId, targetName);
    }
  };

  const handlePhoneCall = () => {
    if (selectedSession && onPhoneCall) {
      const doctorId = currentUserType === 'patient' ? selectedSession.doctorId : selectedSession.patientId;
      const doctorName = currentUserType === 'patient' ? selectedSession.doctorName : selectedSession.patientName;
      onPhoneCall(doctorId, doctorName);
    }
  };

  const handleBackToList = () => {
    setSelectedChatId(null);
    setSelectedSession(null);
  };

  return (
    <div className={`flex h-[700px] ${className}`}>
      {/* Chat List Sidebar */}
      <div className={`${selectedChatId ? 'hidden md:block md:w-1/3' : 'w-full'} border-r`}>
        <ChatList
          currentUserId={currentUserId}
          currentUserType={currentUserType}
          onChatSelect={handleChatSelect}
          onStartNewChat={handleStartNewChat}
          className="h-full"
        />
      </div>

      {/* Chat Interface */}
      <div className={`${selectedChatId ? 'w-full md:w-2/3' : 'hidden'}`}>
        {selectedChatId && selectedSession ? (
          <div className="h-full flex flex-col">
            {/* Mobile Back Button */}
            <div className="md:hidden p-4 border-b">
              <Button variant="ghost" onClick={handleBackToList}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Chats
              </Button>
            </div>

            {/* Chat Interface */}
            <ChatInterface
              chatId={selectedChatId}
              currentUserId={currentUserId}
              currentUserType={currentUserType}
              onVideoCall={handleVideoCall}
              onPhoneCall={handlePhoneCall}
              className="flex-1"
            />
          </div>
        ) : (
          <Card className="h-full">
            <CardContent className="flex items-center justify-center h-full">
              <div className="text-center text-muted-foreground">
                <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">{translations.patientDashboard.welcomeToChatDoc}</h3>
                <p className="mb-4">Select a chat to start messaging with your doctor</p>
                <Button onClick={handleStartNewChat}>
                  <MessageCircle className="w-4 h-4 mr-2" />
                  {translations.patientDashboard.startNewChat}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* New Chat Dialog */}
      <Dialog open={showNewChatDialog} onOpenChange={setShowNewChatDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start New Consultation</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Select Online Doctor
              </label>
              
              {isLoading ? (
                <div className="p-4 border rounded-lg text-center animate-pulse bg-muted/50">
                  <p className="text-sm text-muted-foreground">Connecting to medilink cluster...</p>
                </div>
              ) : !hasDoctors(registeredDoctors) ? (
                <div className="p-4 border border-dashed border-red-500/25 rounded-lg text-center bg-red-50">
                  <p className="text-sm text-red-600 mb-2 font-semibold">
                    No approved doctors found in database
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Try refreshing or check if the seeder ran correctly.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <Select value={selectedDoctorId} onValueChange={(val) => setSelectedDoctorId(val)}>
                    <SelectTrigger className="w-full h-12">
                      <SelectValue placeholder="Click to choose a doctor" />
                    </SelectTrigger>
                    <SelectContent>
                      {registeredDoctors.map((doctor) => (
                        <SelectItem key={doctor.id} value={doctor.id}>
                          {doctor.name} ({doctor.specialization})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Fallback Selection if Dropdown is stuck */}
                  <div className="pt-2 border-t">
                    <p className="text-[10px] text-muted-foreground mb-1 uppercase tracking-wider">Quick Select:</p>
                    <div className="flex flex-wrap gap-2">
                      {registeredDoctors.map((doctor) => (
                        <Button 
                          key={`btn-${doctor.id}`}
                          variant={selectedDoctorId === doctor.id ? "default" : "outline"}
                          size="sm"
                          className="text-xs h-8"
                          onClick={() => setSelectedDoctorId(doctor.id)}
                        >
                          {doctor.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowNewChatDialog(false)}>
                Cancel
              </Button>
              {hasDoctors(registeredDoctors) && (
                <Button onClick={handleCreateNewChat}>
                  Start Chat
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Video Call Overlay */}
      {activeCall && (
        <WebRTCCall
          room={activeCall.room}
          isCaller={activeCall.isCaller}
          remoteUserName={activeCall.remoteName}
          targetId={activeCall.targetId}
          onClose={() => setActiveCall(null)}
        />
      )}
    </div>
  );
}
