'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Send, 
  Paperclip, 
  Phone, 
  Video, 
  MoreVertical, 
  Check, 
  CheckCheck,
  Clock,
  User,
  MessageCircle
} from 'lucide-react';
import ChatService, { type ChatMessage, type ChatSession } from '@/lib/chat-service';
import { useToast } from '@/hooks/use-toast';

interface ChatInterfaceProps {
  chatId: string;
  currentUserId: string;
  currentUserType: 'patient' | 'doctor';
  onVideoCall?: () => void;
  onPhoneCall?: () => void;
  className?: string;
}

export function ChatInterface({ 
  chatId, 
  currentUserId, 
  currentUserType, 
  onVideoCall,
  onPhoneCall,
  className = '' 
}: ChatInterfaceProps) {
  const [session, setSession] = useState<ChatSession | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const chatService = ChatService.getInstance();

  useEffect(() => {
    // Load chat session
    const chatSession = chatService.getChatSession(chatId);
    setSession(chatSession);

    // Mark messages as seen
    if (chatSession) {
      chatService.markMessagesAsSeen(chatId, currentUserId);
    }

    // Set up real-time listeners
    const handleNewMessage = (data: { chatId: string; message: ChatMessage; session: ChatSession }) => {
      if (data.chatId === chatId) {
        setSession(data.session);
        scrollToBottom();
      }
    };

    const handleMessageStatusUpdate = (data: { chatId: string; messageId: string; status: string }) => {
      if (data.chatId === chatId && session) {
        const updatedSession = { ...session };
        const message = updatedSession.messages.find(m => m.id === data.messageId);
        if (message) {
          message.status = data.status as 'sent' | 'delivered' | 'seen';
          setSession(updatedSession);
        }
      }
    };

    const handleNetworkStatusChange = (data: { isOnline: boolean }) => {
      setIsOnline(data.isOnline);
    };

    chatService.on('newMessage', handleNewMessage);
    chatService.on('messageStatusUpdate', handleMessageStatusUpdate);
    chatService.on('networkStatusChange', handleNetworkStatusChange);

    return () => {
      chatService.off('newMessage', handleNewMessage);
      chatService.off('messageStatusUpdate', handleMessageStatusUpdate);
      chatService.off('networkStatusChange', handleNetworkStatusChange);
    };
  }, [chatId, currentUserId, chatService]);

  useEffect(() => {
    scrollToBottom();
  }, [session?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !session) return;

    try {
      chatService.sendMessage(chatId, currentUserType, newMessage.trim());
      setNewMessage('');
      setIsTyping(false);
    } catch (error) {
      toast({
        title: "Failed to send message",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <Check className="w-3 h-3 text-muted-foreground" />;
      case 'delivered':
        return <CheckCheck className="w-3 h-3 text-muted-foreground" />;
      case 'seen':
        return <CheckCheck className="w-3 h-3 text-blue-500" />;
      default:
        return <Clock className="w-3 h-3 text-muted-foreground" />;
    }
  };

  const getOtherUserName = () => {
    if (!session) return '';
    return currentUserType === 'patient' ? session.doctorName : session.patientName;
  };

  const getOtherUserInitials = () => {
    const name = getOtherUserName();
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (!session) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center h-96">
          <div className="text-center text-muted-foreground">
            <MessageCircle className="w-12 h-12 mx-auto mb-4" />
            <p>Chat session not found</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`flex flex-col h-[600px] ${className}`}>
      {/* Chat Header */}
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarFallback className="bg-primary text-primary-foreground">
                {getOtherUserInitials()}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{getOtherUserName()}</CardTitle>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                <span className="text-sm text-muted-foreground">
                  {isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {onPhoneCall && (
              <Button variant="outline" size="sm" onClick={onPhoneCall}>
                <Phone className="w-4 h-4" />
              </Button>
            )}
            {onVideoCall && (
              <Button variant="outline" size="sm" onClick={onVideoCall}>
                <Video className="w-4 h-4" />
              </Button>
            )}
            <Button variant="outline" size="sm">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* Messages Area */}
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-4">
            {session.messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === currentUserType ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg px-3 py-2 ${
                    message.sender === currentUserType
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  <div className="flex items-center justify-end gap-1 mt-1">
                    <span className="text-xs opacity-70">
                      {chatService.formatTimestamp(message.timestamp)}
                    </span>
                    {message.sender === currentUserType && (
                      <span className="flex items-center">
                        {getStatusIcon(message.status)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg px-3 py-2">
                  <div className="flex items-center gap-1">
                    <div className="flex gap-1">
                      <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" />
                      <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                    <span className="text-xs text-muted-foreground ml-2">typing...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </CardContent>

      {/* Message Input */}
      <div className="p-4 border-t">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Paperclip className="w-4 h-4" />
          </Button>
          <Input
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              setIsTyping(e.target.value.length > 0);
            }}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button 
            onClick={handleSendMessage} 
            disabled={!newMessage.trim() || !isOnline}
            size="sm"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        
        {!isOnline && (
          <div className="mt-2 text-xs text-muted-foreground text-center">
            You're offline. Messages will be sent when connection is restored.
          </div>
        )}
      </div>
    </Card>
  );
}




