'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Siren, 
  MapPin, 
  Phone, 
  Clock, 
  User, 
  Car, 
  CheckCircle, 
  AlertTriangle,
  Truck,
  Users,
  Wifi,
  WifiOff
} from 'lucide-react';
import { EmergencyService, type EmergencyRequest, type Ambulance, type LocalTransport } from '@/lib/emergency-service';
import { useToast } from '@/hooks/use-toast';

interface EmergencyStatusCardProps {
  requestId: string;
  onClose?: () => void;
  className?: string;
}

export function EmergencyStatusCard({ requestId, onClose, className = '' }: EmergencyStatusCardProps) {
  const [request, setRequest] = useState<EmergencyRequest | null>(null);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isOnline, setIsOnline] = useState(true);
  const { toast } = useToast();

  const emergencyService = EmergencyService.getInstance();

  useEffect(() => {
    // Load request data
    const loadRequest = () => {
      const requestData = emergencyService.getRequestStatus(requestId);
      if (requestData) {
        setRequest(requestData);
      }
    };

    loadRequest();

    // Update time elapsed every second
    const timeInterval = setInterval(() => {
      if (request) {
        const elapsed = Math.floor((Date.now() - new Date(request.timestamp).getTime()) / 1000);
        setTimeElapsed(elapsed);
      }
    }, 1000);

    // Check network status
    const checkNetworkStatus = () => {
      setIsOnline(navigator.onLine);
      emergencyService.setOnlineStatus(navigator.onLine);
    };

    checkNetworkStatus();
    window.addEventListener('online', checkNetworkStatus);
    window.addEventListener('offline', checkNetworkStatus);

    return () => {
      clearInterval(timeInterval);
      window.removeEventListener('online', checkNetworkStatus);
      window.removeEventListener('offline', checkNetworkStatus);
    };
  }, [requestId, request]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusConfig = (status: EmergencyRequest['status']) => {
    switch (status) {
      case 'pending':
        return {
          color: 'bg-yellow-100 text-yellow-800',
          icon: Clock,
          label: 'Processing Request',
          progress: 20
        };
      case 'assigned':
        return {
          color: 'bg-blue-100 text-blue-800',
          icon: CheckCircle,
          label: 'Vehicle Assigned',
          progress: 40
        };
      case 'en_route':
        return {
          color: 'bg-purple-100 text-purple-800',
          icon: Car,
          label: 'En Route',
          progress: 70
        };
      case 'arrived':
        return {
          color: 'bg-green-100 text-green-800',
          icon: CheckCircle,
          label: 'Arrived',
          progress: 90
        };
      case 'completed':
        return {
          color: 'bg-green-100 text-green-800',
          icon: CheckCircle,
          label: 'Completed',
          progress: 100
        };
      case 'cancelled':
        return {
          color: 'bg-red-100 text-red-800',
          icon: AlertTriangle,
          label: 'Cancelled',
          progress: 0
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800',
          icon: Clock,
          label: 'Unknown',
          progress: 0
        };
    }
  };

  const getVehicleIcon = (vehicle: Ambulance | LocalTransport) => {
    if ('equipment' in vehicle) {
      // It's an ambulance
      return <Car className="w-5 h-5" />;
    } else {
      // It's local transport
      const vehicleType = vehicle.vehicle.toLowerCase();
      if (vehicleType.includes('tractor')) {
        return <Truck className="w-5 h-5" />;
      } else {
        return <Car className="w-5 h-5" />;
      }
    }
  };

  const handleCallDriver = () => {
    if (request?.assignedVehicle) {
      window.open(`tel:${request.assignedVehicle.phone}`);
    }
  };

  const handleCallEmergencyContact = (phone: string) => {
    window.open(`tel:${phone}`);
  };

  if (!request) {
    return (
      <Card className={`border-red-200 bg-red-50 ${className}`}>
        <CardContent className="p-6 text-center">
          <AlertTriangle className="w-8 h-8 text-red-600 mx-auto mb-2" />
          <p className="text-red-800">Emergency request not found</p>
        </CardContent>
      </Card>
    );
  }

  const statusConfig = getStatusConfig(request.status);
  const StatusIcon = statusConfig.icon;

  return (
    <Card className={`border-red-200 bg-red-50 shadow-lg ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-red-800">
            <Siren className="w-5 h-5" />
            Emergency Status
          </div>
          <div className="flex items-center gap-2">
            {isOnline ? (
              <Wifi className="w-4 h-4 text-green-600" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-600" />
            )}
            <Badge className={statusConfig.color}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {statusConfig.label}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Response Progress</span>
            <span className="font-semibold">{statusConfig.progress}%</span>
          </div>
          <Progress value={statusConfig.progress} className="h-2" />
        </div>

        {/* Time Elapsed */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>Time elapsed: {formatTime(timeElapsed)}</span>
        </div>

        {/* Assigned Vehicle */}
        {request.assignedVehicle && (
          <div className="p-4 bg-white rounded-lg border border-red-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {getVehicleIcon(request.assignedVehicle)}
                <span className="font-semibold text-red-800">
                  {request.assignedVehicle.vehicle}
                </span>
              </div>
              <Badge variant="outline" className="text-xs">
                ETA: {request.assignedVehicle.eta} min
              </Badge>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <span>Driver: {request.assignedVehicle.driver}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span>{request.assignedVehicle.phone}</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCallDriver}
                  className="ml-2 h-6 px-2 text-xs"
                >
                  Call
                </Button>
              </div>

              {'equipment' in request.assignedVehicle && (
                <div className="mt-2">
                  <span className="text-xs text-muted-foreground">Equipment: </span>
                  <span className="text-xs">{request.assignedVehicle.equipment.join(', ')}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Emergency Contacts */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-red-800">
            <Users className="w-4 h-4" />
            Emergency Contacts Notified
          </div>
          
          <div className="space-y-2">
            {request.emergencyContacts.map((contact) => (
              <div key={contact.id} className="flex items-center justify-between p-2 bg-white rounded border border-red-200">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <span className="text-sm font-medium">{contact.name}</span>
                    <span className="text-xs text-muted-foreground ml-2">({contact.relationship})</span>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCallEmergencyContact(contact.phone)}
                  className="h-6 px-2 text-xs"
                >
                  <Phone className="w-3 h-3 mr-1" />
                  Call
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Location Info */}
        <div className="p-3 bg-white rounded-lg border border-red-200">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <MapPin className="w-4 h-4" />
            <span>Your Location</span>
          </div>
          <div className="text-sm">
            <div>Coordinates: {request.location.latitude.toFixed(6)}, {request.location.longitude.toFixed(6)}</div>
            {request.pinCode && <div>PIN Code: {request.pinCode}</div>}
          </div>
        </div>

        {/* Offline Notice */}
        {!isOnline && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 text-yellow-800 text-sm">
              <WifiOff className="w-4 h-4" />
              <span>You're offline. Emergency request will sync when connection is restored.</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open('tel:108')}
            className="flex-1"
          >
            <Phone className="w-4 h-4 mr-2" />
            Call 108
          </Button>
          {onClose && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="flex-1"
            >
              Close
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
