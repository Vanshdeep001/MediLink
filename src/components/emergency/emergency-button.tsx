'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Siren, MapPin, Phone, Clock, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { EmergencyService, type Location, type EmergencyResponse } from '@/lib/emergency-service';
import { useToast } from '@/hooks/use-toast';

interface EmergencyButtonProps {
  patientId: string;
  patientName: string;
  digitalHealthId: string;
  onEmergencyConfirmed?: (response: EmergencyResponse) => void;
  className?: string;
}

export function EmergencyButton({ 
  patientId, 
  patientName, 
  digitalHealthId, 
  onEmergencyConfirmed,
  className = '' 
}: EmergencyButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [pinCode, setPinCode] = useState('');
  const [showPinCodeInput, setShowPinCodeInput] = useState(false);
  const { toast } = useToast();

  const emergencyService = EmergencyService.getInstance();

  // Countdown effect
  useEffect(() => {
    if (isCountingDown && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (isCountingDown && countdown === 0) {
      handleConfirmEmergency();
    }
  }, [isCountingDown, countdown]);

  const handleEmergencyClick = () => {
    setIsDialogOpen(true);
    setLocationError(null);
    setShowPinCodeInput(false);
    setPinCode('');
  };

  const handleStartCountdown = async () => {
    setIsCountingDown(true);
    setCountdown(3);
    
    // Try to get location permission early
    try {
      await emergencyService.getCurrentLocation();
    } catch (error) {
      console.log('Location access will be requested during emergency processing');
    }
  };

  const handleCancelCountdown = () => {
    setIsCountingDown(false);
    setCountdown(3);
    setIsDialogOpen(false);
  };

  const handleConfirmEmergency = async () => {
    setIsCountingDown(false);
    setIsProcessing(true);
    
    try {
      let location: Location | undefined;
      let pinCodeFallback: string | undefined;

      // Try to get location
      try {
        location = await emergencyService.getCurrentLocation();
      } catch (error) {
        console.error('Location access failed:', error);
        setLocationError('Location access denied. Please provide PIN code as fallback.');
        setShowPinCodeInput(true);
        setIsProcessing(false);
        return;
      }

      // Process emergency request
      const response = await emergencyService.processEmergencyRequest(
        patientId,
        patientName,
        digitalHealthId,
        location,
        pinCode || undefined
      );

      if (response.success) {
        toast({
          title: "Emergency Alert Sent!",
          description: response.message,
          variant: "default",
        });
        
        onEmergencyConfirmed?.(response);
      } else {
        toast({
          title: "Emergency Request Failed",
          description: response.message,
          variant: "destructive",
        });
      }

      setIsDialogOpen(false);
      setIsProcessing(false);
      setShowPinCodeInput(false);
      setPinCode('');

    } catch (error) {
      console.error('Emergency processing failed:', error);
      toast({
        title: "Emergency Request Failed",
        description: "Unable to process emergency request. Please try again or call emergency services directly.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  const handlePinCodeSubmit = () => {
    if (!pinCode.trim()) {
      toast({
        title: "PIN Code Required",
        description: "Please enter your PIN code to continue.",
        variant: "destructive",
      });
      return;
    }
    
    handleConfirmEmergency();
  };

  return (
    <>
      {/* Emergency Button */}
      <Button
        onClick={handleEmergencyClick}
        variant="destructive"
        size="lg"
        className={`w-full h-16 text-lg font-bold shadow-lg hover:shadow-xl transition-all duration-300 animate-pulse-slow ${className}`}
      >
        <Siren className="w-6 h-6 mr-3" />
        EMERGENCY SOS
      </Button>

      {/* Emergency Confirmation Dialog */}
      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Emergency Confirmation
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              Are you sure you want to trigger an emergency alert? This will notify emergency services and your contacts immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {!isCountingDown && !isProcessing && !showPinCodeInput && (
            <div className="space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 text-red-800 font-semibold mb-2">
                  <Siren className="w-4 h-4" />
                  What happens next:
                </div>
                <ul className="text-sm text-red-700 space-y-1">
                  <li>• Your location will be shared with emergency services</li>
                  <li>• Nearest ambulance will be dispatched</li>
                  <li>• Your emergency contacts will be notified</li>
                  <li>• You'll receive real-time updates</li>
                </ul>
              </div>
            </div>
          )}

          {isCountingDown && (
            <div className="text-center py-8">
              <div className="text-6xl font-bold text-red-600 mb-4">
                {countdown}
              </div>
              <p className="text-lg text-muted-foreground">
                Emergency alert will be sent in {countdown} seconds...
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                You can still cancel if this was accidental
              </p>
            </div>
          )}

          {isProcessing && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
              <p className="text-lg text-muted-foreground">
                Processing emergency request...
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Please wait while we locate and dispatch help
              </p>
            </div>
          )}

          {showPinCodeInput && (
            <div className="space-y-4">
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2 text-yellow-800 font-semibold mb-2">
                  <MapPin className="w-4 h-4" />
                  Location Access Denied
                </div>
                <p className="text-sm text-yellow-700">
                  Please enter your PIN code so we can locate you for emergency services.
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="pinCode">PIN Code</Label>
                <Input
                  id="pinCode"
                  type="text"
                  placeholder="Enter your 6-digit PIN code"
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value)}
                  maxLength={6}
                />
              </div>
            </div>
          )}

          <AlertDialogFooter>
            {!isCountingDown && !isProcessing && !showPinCodeInput && (
              <>
                <AlertDialogCancel onClick={handleCancelCountdown}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleStartCountdown}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Confirm Emergency
                </AlertDialogAction>
              </>
            )}

            {isCountingDown && (
              <AlertDialogCancel onClick={handleCancelCountdown}>
                Cancel Emergency
              </AlertDialogCancel>
            )}

            {showPinCodeInput && (
              <>
                <AlertDialogCancel onClick={handleCancelCountdown}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handlePinCodeSubmit}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Submit PIN & Send Alert
                </AlertDialogAction>
              </>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}




