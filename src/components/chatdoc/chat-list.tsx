'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, 
  Plus, 
  Search,
  Video,
  Phone,
  MoreVertical
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import ChatService, { type ChatSession } from '@/lib/chat-service';
import { useToast } from '@/hooks/use-toast';

interface ChatListProps {
  currentUserId: string;
  currentUserType: 'patient' | 'doctor';
  onChatSelect: (chatId: string) => void;
  onStartNewChat?: () => void;
  className?: string;
}

export function ChatList({ 
  currentUserId, 
  currentUserType, 
  onChatSelect, 
  onStartNewChat,
  className = '' 
}: ChatListProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const { toast } = useToast();

  const chatService = ChatService.getInstance();

  useEffect(() => {
    loadChatSessions();

    // Set up real-time listeners
    const handleNewMessage = () => {
      loadChatSessions();
    };

    const handleSessionCreated = () => {
      loadChatSessions();
    };

    chatService.on('newMessage', handleNewMessage);
    chatService.on('sessionCreated', handleSessionCreated);

    return () => {
      chatService.off('newMessage', handleNewMessage);
      chatService.off('sessionCreated', handleSessionCreated);
    };
  }, [currentUserId, chatService]);

  const loadChatSessions = () => {
    const userSessions = chatService.getChatSessionsForUser(currentUserId, currentUserType);
    setSessions(userSessions);
    
    const totalUnread = chatService.getUnreadCount(currentUserId, currentUserType);
    setUnreadCount(totalUnread);
  };

  const filteredSessions = sessions.filter(session => {
    const otherUserName = currentUserType === 'patient' ? session.doctorName : session.patientName;
    return otherUserName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleChatClick = (chatId: string) => {
    // Mark messages as seen
    chatService.markMessagesAsSeen(chatId, currentUserId);
    loadChatSessions();
    onChatSelect(chatId);
  };

  const getOtherUserName = (session: ChatSession) => {
    return currentUserType === 'patient' ? session.doctorName : session.patientName;
  };

  const getOtherUserInitials = (session: ChatSession) => {
    const name = getOtherUserName(session);
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const formatLastMessage = (session: ChatSession) => {
    if (!session.lastMessage) return 'No messages yet';
    
    const message = session.lastMessage.text;
    return message.length > 50 ? `${message.substring(0, 50)}...` : message;
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            ChatDoc
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </CardTitle>
          {onStartNewChat && (
            <Button size="sm" onClick={onStartNewChat}>
              <Plus className="w-4 h-4 mr-2" />
              New Chat
            </Button>
          )}
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {filteredSessions.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="mb-2">
              {searchQuery ? 'No chats found' : 'No active chats'}
            </p>
            <p className="text-sm">
              {searchQuery ? 'Try a different search term' : 'Start a new conversation with your doctor'}
            </p>
            {onStartNewChat && !searchQuery && (
              <Button variant="outline" className="mt-4" onClick={onStartNewChat}>
                <Plus className="w-4 h-4 mr-2" />
                Start New Chat
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-1">
            {filteredSessions.map((session) => (
              <div
                key={session.chatId}
                onClick={() => handleChatClick(session.chatId)}
                className="p-4 hover:bg-muted/50 cursor-pointer transition-colors border-b last:border-b-0"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getOtherUserInitials(session)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-sm truncate">
                        {getOtherUserName(session)}
                      </h3>
                      <div className="flex items-center gap-2">
                        {session.unreadCount > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {session.unreadCount}
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {chatService.formatTimestamp(session.lastActivity)}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground truncate">
                      {formatLastMessage(session)}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm">
                      <Video className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Phone className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
