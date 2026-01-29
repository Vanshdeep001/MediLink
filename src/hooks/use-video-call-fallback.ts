'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ChatService from '@/lib/chat-service';

interface UseVideoCallFallbackProps {
  currentUserId: string;
  currentUserName: string;
  currentUserType: 'patient' | 'doctor';
}

export function useVideoCallFallback({ 
  currentUserId, 
  currentUserName, 
  currentUserType 
}: UseVideoCallFallbackProps) {
  const [isFallbackOpen, setIsFallbackOpen] = useState(false);
  const [fallbackData, setFallbackData] = useState<{
    doctorId: string;
    doctorName: string;
    reason?: string;
  } | null>(null);
  const router = useRouter();

  const chatService = ChatService.getInstance();

  const showFallback = (doctorId: string, doctorName: string, reason?: string) => {
    setFallbackData({ doctorId, doctorName, reason });
    setIsFallbackOpen(true);
  };

  const hideFallback = () => {
    setIsFallbackOpen(false);
    setFallbackData(null);
  };

  const handleStartChat = () => {
    if (!fallbackData) return;

    try {
      // Create or get existing chat session
      const chatId = `${currentUserId}_${fallbackData.doctorId}`;
      let session = chatService.getChatSession(chatId);
      
      if (!session) {
        session = chatService.createChatSession(
          currentUserId,
          currentUserName,
          fallbackData.doctorId,
          fallbackData.doctorName
        );
      }

      // Navigate to ChatDoc tab
      const targetPath = currentUserType === 'patient' ? '/patient' : '/doctor';
      router.push(`${targetPath}?tab=chatdoc&chatId=${chatId}`);
      
      hideFallback();
    } catch (error) {
      console.error('Failed to start chat:', error);
    }
  };

  const handleRetryVideo = () => {
    // You can implement retry logic here
    hideFallback();
  };

  const handlePhoneCall = () => {
    // You can implement phone call logic here
    hideFallback();
  };

  return {
    isFallbackOpen,
    fallbackData,
    showFallback,
    hideFallback,
    handleStartChat,
    handleRetryVideo,
    handlePhoneCall,
  };
}











