'use client';

import React from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { MessageCircle, Video, Phone } from 'lucide-react';

interface VideoCallFallbackProps {
  isOpen: boolean;
  onClose: () => void;
  onStartChat: () => void;
  onRetryVideo: () => void;
  onPhoneCall?: () => void;
  doctorName: string;
  reason?: string;
}

export function VideoCallFallback({
  isOpen,
  onClose,
  onStartChat,
  onRetryVideo,
  onPhoneCall,
  doctorName,
  reason = "Doctor is currently unavailable for video calls"
}: VideoCallFallbackProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-orange-600">
            <Video className="w-5 h-5" />
            Video Call Unavailable
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base">
            {reason}. Would you like to start a chat instead?
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="py-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-blue-900">ChatDoc Alternative</h4>
                <p className="text-sm text-blue-700">
                  Send messages to {doctorName} in real-time
                </p>
              </div>
            </div>
          </div>
        </div>

        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel onClick={onClose}>
            Cancel
          </AlertDialogCancel>
          
          <div className="flex gap-2">
            {onPhoneCall && (
              <Button variant="outline" onClick={onPhoneCall}>
                <Phone className="w-4 h-4 mr-2" />
                Call Instead
              </Button>
            )}
            
            <Button variant="outline" onClick={onRetryVideo}>
              <Video className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            
            <AlertDialogAction onClick={onStartChat} className="bg-blue-600 hover:bg-blue-700">
              <MessageCircle className="w-4 h-4 mr-2" />
              Start Chat
            </AlertDialogAction>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}




