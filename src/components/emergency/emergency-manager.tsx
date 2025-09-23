'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Siren, 
  MapPin, 
  Phone, 
  Clock, 
  AlertTriangle,
  Wifi,
  WifiOff,
  RefreshCw
} from 'lucide-react';
import { EmergencyButton } from './emergency-button';
import { EmergencyStatusCard } from './emergency-status-card';
import { EmergencyService, type EmergencyResponse, type EmergencyRequest } from '@/lib/emergency-service';
import { useToast } from '@/hooks/use-toast';

interface EmergencyManagerProps {
  patientId: string;
  patientName: string;
  digitalHealthId: string;
  className?: string;
}

export function EmergencyManager({ 
  patientId, 
  patientName, 
  digitalHealthId, 
  className = '' 
}: EmergencyManagerProps) {
  const [activeEmergency, setActiveEmergency] = useState<EmergencyRequest | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [pendingRequests, setPendingRequests] = useState<EmergencyRequest[]>([]);
  const { toast } = useToast();

  const emergencyService = EmergencyService.getInstance();

  useEffect(() => {
    // Check network status
    const checkNetworkStatus = () => {
      const online = navigator.onLine;
      setIsOnline(online);
      emergencyService.setOnlineStatus(online);
      
      if (online) {
        // Sync offline requests when coming back online
        emergencyService.syncOfflineRequests();
        toast({
          title: "Connection Restored",
          description: "Syncing offline emergency requests...",
        });
      } else {
        toast({
          title: "You're Offline",
          description: "Emergency requests will be saved locally and synced when connection is restored.",
          variant: "destructive",
        });
      }
    };

    checkNetworkStatus();
    window.addEventListener('online', checkNetworkStatus);
    window.addEventListener('offline', checkNetworkStatus);

    // Check for pending offline requests
    const checkPendingRequests = () => {
      try {
        const offlineRequests = JSON.parse(localStorage.getItem('emergency_requests') || '[]');
        setPendingRequests(offlineRequests.filter((req: EmergencyRequest) => req.status === 'pending'));
      } catch (error) {
        console.error('Failed to load pending requests:', error);
      }
    };

    checkPendingRequests();

    return () => {
      window.removeEventListener('online', checkNetworkStatus);
      window.removeEventListener('offline', checkNetworkStatus);
    };
  }, [emergencyService, toast]);

  const handleEmergencyConfirmed = (response: EmergencyResponse) => {
    if (response.success && response.requestId) {
      const request = emergencyService.getRequestStatus(response.requestId);
      if (request) {
        setActiveEmergency(request);
      }
    }
  };

  const handleCloseStatusCard = () => {
    setActiveEmergency(null);
  };

  const handleRetryOfflineRequests = async () => {
    try {
      await emergencyService.syncOfflineRequests();
      setPendingRequests([]);
      toast({
        title: "Offline Requests Synced",
        description: "All pending emergency requests have been processed.",
      });
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: "Unable to sync offline requests. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCallEmergencyServices = () => {
    window.open('tel:108');
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Network Status */}
      <Card className={`border-2 ${isOnline ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isOnline ? (
                <Wifi className="w-5 h-5 text-green-600" />
              ) : (
                <WifiOff className="w-5 h-5 text-red-600" />
              )}
              <span className={`font-semibold ${isOnline ? 'text-green-800' : 'text-red-800'}`}>
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
            
            {!isOnline && (
              <Badge variant="outline" className="text-red-600 border-red-600">
                Emergency requests will be saved locally
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pending Offline Requests */}
      {pendingRequests.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <AlertTriangle className="w-5 h-5" />
              Pending Offline Requests
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-yellow-700">
              You have {pendingRequests.length} emergency request(s) waiting to be sent.
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleRetryOfflineRequests}
                className="bg-yellow-600 hover:bg-yellow-700"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Sync Now
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCallEmergencyServices}
              >
                <Phone className="w-4 h-4 mr-2" />
                Call 108
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Emergency Status */}
      {activeEmergency && (
        <EmergencyStatusCard
          requestId={activeEmergency.id}
          onClose={handleCloseStatusCard}
        />
      )}

      {/* Emergency Button */}
      {!activeEmergency && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <Siren className="w-5 h-5" />
              Emergency SOS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <EmergencyButton
              patientId={patientId}
              patientName={patientName}
              digitalHealthId={digitalHealthId}
              onEmergencyConfirmed={handleEmergencyConfirmed}
            />
            
            <div className="mt-4 p-3 bg-white rounded-lg border border-red-200">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <MapPin className="w-4 h-4" />
                <span>Emergency Services</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">National Emergency</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCallEmergencyServices}
                    className="h-6 px-2 text-xs"
                  >
                    <Phone className="w-3 h-3 mr-1" />
                    Call 108
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Police</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open('tel:100')}
                    className="h-6 px-2 text-xs"
                  >
                    <Phone className="w-3 h-3 mr-1" />
                    Call 100
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Emergency Instructions */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-blue-800 text-sm">
            Emergency Instructions
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-700 space-y-2">
          <div className="flex items-start gap-2">
            <span className="font-semibold">1.</span>
            <span>Press the Emergency SOS button only in genuine emergencies</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-semibold">2.</span>
            <span>Allow location access for faster response</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-semibold">3.</span>
            <span>Stay calm and follow instructions from emergency responders</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-semibold">4.</span>
            <span>Keep your phone charged and accessible</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}




