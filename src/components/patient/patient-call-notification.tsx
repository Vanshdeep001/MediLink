'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Phone, PhoneOff, Video, Clock, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  getPendingCalls, 
  acceptCall, 
  declineCall, 
  type CallSession 
} from '@/lib/call-management-service';

interface PatientCallNotificationProps {
  patientName: string;
  onCallAccepted?: (call: CallSession) => void;
}

export function PatientCallNotification({ patientName, onCallAccepted }: PatientCallNotificationProps) {
  const [pendingCalls, setPendingCalls] = useState<CallSession[]>([]);
  const [currentCall, setCurrentCall] = useState<CallSession | null>(null);
  const [isRinging, setIsRinging] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadPendingCalls();
    
    // Listen for new calls
    const handleStorageChange = () => {
      loadPendingCalls();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [patientName]);

  const loadPendingCalls = () => {
    const calls = getPendingCalls(patientName);
    setPendingCalls(calls);
    
    // Show notification for the most recent call
    if (calls.length > 0) {
      const latestCall = calls[calls.length - 1];
      setCurrentCall(latestCall);
      setIsRinging(true);
    }
  };

  const handleAcceptCall = () => {
    if (!currentCall) return;

    const updatedCall = acceptCall(currentCall.id);
    setIsRinging(false);
    
    toast({
      title: "Call accepted",
      description: `Connecting to ${currentCall.doctorName}...`,
    });

    // Notify parent component
    if (onCallAccepted && updatedCall) {
      onCallAccepted(updatedCall);
    }

    // Open call in new window/tab
    window.open(currentCall.jitsiLink, '_blank');
    
    setCurrentCall(null);
  };

  const handleDeclineCall = () => {
    if (!currentCall) return;

    declineCall(currentCall.id);
    setIsRinging(false);
    
    toast({
      title: "Call declined",
      description: "You declined the video consultation.",
    });

    setCurrentCall(null);
  };

  const handleCloseNotification = () => {
    setIsRinging(false);
    setCurrentCall(null);
  };

  // Auto-decline after 30 seconds
  useEffect(() => {
    if (currentCall && isRinging) {
      const timer = setTimeout(() => {
        handleDeclineCall();
      }, 30000); // 30 seconds

      return () => clearTimeout(timer);
    }
  }, [currentCall, isRinging]);

  return (
    <>
      {/* Incoming Call Notification */}
      <Dialog open={isRinging && !!currentCall} onOpenChange={handleCloseNotification}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Video className="w-5 h-5 text-green-500" />
              Incoming Video Call
            </DialogTitle>
          </DialogHeader>
          
          {currentCall && (
            <div className="space-y-4">
              {/* Call Info */}
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <User className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{currentCall.doctorName}</h3>
                  <p className="text-sm text-muted-foreground">Doctor</p>
                </div>
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                  <Clock className="w-3 h-3 mr-1" />
                  Video Consultation
                </Badge>
              </div>

              {/* Call Actions */}
              <div className="flex justify-center gap-4">
                <Button
                  variant="destructive"
                  size="lg"
                  onClick={handleDeclineCall}
                  className="rounded-full w-12 h-12"
                >
                  <PhoneOff className="w-5 h-5" />
                </Button>
                
                <Button
                  variant="default"
                  size="lg"
                  onClick={handleAcceptCall}
                  className="rounded-full w-12 h-12 bg-green-500 hover:bg-green-600"
                >
                  <Phone className="w-5 h-5" />
                </Button>
              </div>

              {/* Call Details */}
              <div className="text-center text-sm text-muted-foreground">
                <p>Room: {currentCall.roomName}</p>
                <p className="mt-1">Call will auto-decline in 30 seconds</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Call Status Indicator */}
      {pendingCalls.length > 0 && !isRinging && (
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg">
            <div className="flex items-center gap-2">
              <Video className="w-4 h-4" />
              <span className="text-sm">
                {pendingCalls.length} pending call{pendingCalls.length > 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
