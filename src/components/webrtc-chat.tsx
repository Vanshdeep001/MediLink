'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Send, 
  Smile, 
  Paperclip, 
  Phone, 
  Video, 
  MoreVertical,
  Check,
  CheckCheck,
  Clock,
  AlertCircle
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { websocketService, WebSocketMessage } from '@/lib/websocket-service';
import { ChatMessage, ChatSession } from '@/lib/chat-service';

interface WebRTCChatProps {
  chatId: string;
  currentUserId: string;
  currentUserName: string;
  otherUserId: string;
  otherUserName: string;
  onStartVideoCall?: () => void;
  onStartVoiceCall?: () => void;
}

interface TypingIndicator {
  userId: string;
  userName: string;
  isTyping: boolean;
  timestamp: number;
}

export function WebRTCChat({ 
  chatId, 
  currentUserId, 
  currentUserName, 
  otherUserId, 
  otherUserName,
  onStartVideoCall,
  onStartVoiceCall
}: WebRTCChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingIndicator, setTypingIndicator] = useState<TypingIndicator | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // Initialize WebSocket connection
  useEffect(() => {
    const initializeChat = async () => {
      try {
        // Connect to WebSocket
        await websocketService.connect();
        setIsConnected(true);

        // Register for chat messages
        websocketService.onMessage('chat_message', handleChatMessage);
        websocketService.onMessage('typing_start', handleTypingStart);
        websocketService.onMessage('typing_stop', handleTypingStop);
        websocketService.onMessage('message_read', handleMessageRead);
        websocketService.onMessage('user_online', handleUserOnline);
        websocketService.onMessage('user_offline', handleUserOffline);

        // Load existing messages
        await loadMessages();

        // Send user online status
        websocketService.sendUserStatus(currentUserId, true);

        setIsLoading(false);
      } catch (error) {
        console.error('Failed to initialize chat:', error);
        toast({
          title: "Connection Error",
          description: "Failed to connect to chat service",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    };

    initializeChat();

    // Cleanup on unmount
    return () => {
      websocketService.offMessage('chat_message');
      websocketService.offMessage('typing_start');
      websocketService.offMessage('typing_stop');
      websocketService.offMessage('message_read');
      websocketService.offMessage('user_online');
      websocketService.offMessage('user_offline');
      
      // Send user offline status
      websocketService.sendUserStatus(currentUserId, false);
    };
  }, [chatId, currentUserId, currentUserName, otherUserId, otherUserName, toast]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle typing timeout
  useEffect(() => {
    if (isTyping) {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        handleTypingStop();
      }, 3000);
    }

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [isTyping]);

  const loadMessages = async () => {
    try {
      // In a real app, this would load from your database
      // For now, we'll use localStorage as fallback
      const storedMessages = localStorage.getItem(`chat_${chatId}`);
      if (storedMessages) {
        const parsedMessages = JSON.parse(storedMessages);
        setMessages(parsedMessages);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const handleChatMessage = useCallback((message: WebSocketMessage) => {
    if (message.roomId === chatId) {
      const chatMessage: ChatMessage = message.data;
      
      setMessages(prev => {
        const updated = [...prev, chatMessage];
        // Store in localStorage for persistence
        localStorage.setItem(`chat_${chatId}`, JSON.stringify(updated));
        return updated;
      });

      // Mark as read if it's from the other user
      if (chatMessage.sender !== currentUserId) {
        setUnreadCount(prev => prev + 1);
        websocketService.sendMessageRead(chatId, chatMessage.id, currentUserId);
      }
    }
  }, [chatId, currentUserId]);

  const handleTypingStart = useCallback((message: WebSocketMessage) => {
    if (message.roomId === chatId && message.data.userId !== currentUserId) {
      setTypingIndicator({
        userId: message.data.userId,
        userName: otherUserName,
        isTyping: true,
        timestamp: Date.now()
      });
    }
  }, [chatId, currentUserId, otherUserName]);

  const handleTypingStop = useCallback((message?: WebSocketMessage) => {
    if (!message || (message.roomId === chatId && message.data.userId !== currentUserId)) {
      setTypingIndicator(null);
    }
  }, [chatId, currentUserId]);

  const handleMessageRead = useCallback((message: WebSocketMessage) => {
    if (message.roomId === chatId) {
      // Update message read status
      setMessages(prev => prev.map(msg => 
        msg.id === message.data.messageId ? { ...msg, status: 'seen' as const } : msg
      ));
    }
  }, [chatId]);

  const handleUserOnline = useCallback((message: WebSocketMessage) => {
    if (message.data.userId === otherUserId) {
      // User came online
    }
  }, [otherUserId]);

  const handleUserOffline = useCallback((message: WebSocketMessage) => {
    if (message.data.userId === otherUserId) {
      // User went offline
    }
  }, [otherUserId]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !isConnected) return;

    const message: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sender: currentUserId === 'patient' ? 'patient' : 'doctor',
      text: newMessage.trim(),
      timestamp: new Date().toISOString(),
      status: 'sent'
    };

    try {
      // Send via WebSocket
      websocketService.sendChatMessage(chatId, message, otherUserId);
      
      // Add to local state immediately
      setMessages(prev => {
        const updated = [...prev, message];
        localStorage.setItem(`chat_${chatId}`, JSON.stringify(updated));
        return updated;
      });

      setNewMessage('');
      
      // Stop typing indicator
      handleTypingStop();
    } catch (error) {
      console.error('Failed to send message:', error);
      toast({
        title: "Send Failed",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    
    // Send typing indicator
    if (!isTyping && e.target.value.trim()) {
      setIsTyping(true);
      websocketService.sendTypingStatus(chatId, currentUserId, true);
    }
  };

  const handleLocalTypingStop = () => {
    if (isTyping) {
      setIsTyping(false);
      websocketService.sendTypingStatus(chatId, currentUserId, false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getMessageStatus = (message: ChatMessage) => {
    if (message.sender === (currentUserId === 'patient' ? 'patient' : 'doctor')) {
      if (message.status === 'seen') {
        return <CheckCheck className="w-4 h-4 text-blue-500" />;
      } else {
        return <Check className="w-4 h-4 text-gray-400" />;
      }
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-500">Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* Chat Header */}
      <div className="p-4 border-b bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={`/api/avatar/${otherUserId}`} />
              <AvatarFallback>{otherUserName.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{otherUserName}</h3>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-sm text-gray-500">
                  {isConnected ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {unreadCount}
              </Badge>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onStartVoiceCall}
              className="text-gray-600 hover:text-gray-900"
            >
              <Phone className="w-4 h-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onStartVideoCall}
              className="text-gray-600 hover:text-gray-900"
            >
              <Video className="w-4 h-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-gray-900"
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === (currentUserId === 'patient' ? 'patient' : 'doctor') ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.sender === (currentUserId === 'patient' ? 'patient' : 'doctor')
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                }`}
              >
                <p className="text-sm">{message.text}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs opacity-75">
                    {formatTime(message.timestamp)}
                  </span>
                  {getMessageStatus(message)}
                </div>
              </div>
            </div>
          ))}
          
          {/* Typing Indicator */}
          {typingIndicator && (
            <div className="flex justify-start">
              <div className="bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-lg">
                <div className="flex items-center gap-1">
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {typingIndicator.userName} is typing
                  </span>
                  <div className="flex gap-1">
                    <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="p-4 border-t bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-600 hover:text-gray-900"
          >
            <Paperclip className="w-4 h-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-600 hover:text-gray-900"
          >
            <Smile className="w-4 h-4" />
          </Button>
          
          <Input
            ref={inputRef}
            value={newMessage}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            onBlur={handleLocalTypingStop}
            placeholder="Type a message..."
            className="flex-1"
            disabled={!isConnected}
          />
          
          <Button
            onClick={sendMessage}
            disabled={!newMessage.trim() || !isConnected}
            size="sm"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        
        {!isConnected && (
          <div className="flex items-center gap-2 mt-2 text-sm text-red-600">
            <AlertCircle className="w-4 h-4" />
            <span>Connection lost. Trying to reconnect...</span>
          </div>
        )}
      </div>
    </div>
  );
}

