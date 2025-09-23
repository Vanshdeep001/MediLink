'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageCircle, ArrowLeft, Video, Phone } from 'lucide-react';
import { ChatList } from './chat-list';
import { ChatInterface } from './chat-interface';
import ChatService, { type ChatSession } from '@/lib/chat-service';
import { useToast } from '@/hooks/use-toast';

interface ChatDocProps {
  currentUserId: string;
  currentUserName: string;
  currentUserType: 'patient' | 'doctor';
  onVideoCall?: (doctorId: string, doctorName: string) => void;
  onPhoneCall?: (doctorId: string, doctorName: string) => void;
  className?: string;
}

// Get registered doctors from ChatService
const getRegisteredDoctors = () => {
  const chatService = ChatService.getInstance();
  return chatService.getRegisteredDoctors();
};

export function ChatDoc({ 
  currentUserId, 
  currentUserName, 
  currentUserType, 
  onVideoCall,
  onPhoneCall,
  className = '' 
}: ChatDocProps) {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [showNewChatDialog, setShowNewChatDialog] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const { toast } = useToast();

  const chatService = ChatService.getInstance();

  useEffect(() => {
    // Initialize demo data if no sessions exist and there are registered doctors
    const sessions = chatService.getChatSessionsForUser(currentUserId, currentUserType);
    const registeredDoctors = getRegisteredDoctors();
    
    if (sessions.length === 0 && registeredDoctors.length > 0) {
      chatService.initializeDemoData();
    }
  }, [currentUserId, currentUserType, chatService]);

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

    const registeredDoctors = getRegisteredDoctors();
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
        selectedDoctor.name
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
    if (selectedSession && onVideoCall) {
      const doctorId = currentUserType === 'patient' ? selectedSession.doctorId : selectedSession.patientId;
      const doctorName = currentUserType === 'patient' ? selectedSession.doctorName : selectedSession.patientName;
      onVideoCall(doctorId, doctorName);
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
                <h3 className="text-lg font-semibold mb-2">Welcome to ChatDoc</h3>
                <p className="mb-4">Select a chat to start messaging with your doctor</p>
                <Button onClick={handleStartNewChat}>
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Start New Chat
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
            <DialogTitle>Start New Chat</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Select Doctor
              </label>
              {getRegisteredDoctors().length === 0 ? (
                <div className="p-4 border border-dashed border-muted-foreground/25 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground mb-2">
                    No doctors are currently registered
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Doctors need to register through the doctor portal to be available for chat
                  </p>
                </div>
              ) : (
                <Select value={selectedDoctorId || ""} onValueChange={setSelectedDoctorId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a doctor to chat with" />
                  </SelectTrigger>
                  <SelectContent>
                    {getRegisteredDoctors().map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id}>
                        <div>
                          <div className="font-medium">{doctor.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {doctor.specialization}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowNewChatDialog(false)}>
                Cancel
              </Button>
              {getRegisteredDoctors().length > 0 && (
                <Button onClick={handleCreateNewChat}>
                  Start Chat
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
