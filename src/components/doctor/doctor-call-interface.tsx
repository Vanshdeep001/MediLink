'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Phone, PhoneOff, Users, Clock, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  initiateCall, 
  getAllPatients, 
  getDoctorCalls, 
  endCall,
  type CallSession,
  type Patient 
} from '@/lib/call-management-service';

interface DoctorCallInterfaceProps {
  doctorName: string;
}

export function DoctorCallInterface({ doctorName }: DoctorCallInterfaceProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCalls, setActiveCalls] = useState<CallSession[]>([]);
  const [isCalling, setIsCalling] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadPatients();
    loadActiveCalls();
    
    // Poll for call status updates every 2 seconds
    const interval = setInterval(() => {
      loadActiveCalls();
    }, 2000);
    
    return () => clearInterval(interval);
  }, [doctorName]);

  const loadPatients = () => {
    const allPatients = getAllPatients();
    setPatients(allPatients);
  };

  const loadActiveCalls = () => {
    const calls = getDoctorCalls(doctorName);
    setActiveCalls(calls);
  };

  const filteredPatients = patients.filter(patient =>
    patient.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCallPatient = async () => {
    if (!selectedPatient) {
      toast({
        title: "No patient selected",
        description: "Please select a patient to call.",
        variant: "destructive",
      });
      return;
    }

    const patient = patients.find(p => p.fullName === selectedPatient);
    if (!patient) return;

    setIsCalling(true);
    
    try {
      const callSession = initiateCall(doctorName, patient.fullName);
      
      toast({
        title: "Call initiated",
        description: `Calling ${patient.fullName}...`,
      });

      // Update active calls
      loadActiveCalls();
      
      // Simulate ringing
      setTimeout(() => {
        updateCallStatus(callSession.id, 'ringing');
      }, 1000);

      // Auto-join the call after a short delay
      setTimeout(() => {
        toast({
          title: "Joining call",
          description: "Opening video consultation room...",
        });
        window.open(callSession.jitsiLink, '_blank');
      }, 2000);

    } catch (error) {
      toast({
        title: "Call failed",
        description: "Failed to initiate call. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCalling(false);
    }
  };

  const updateCallStatus = (callId: string, status: CallSession['status']) => {
    const updatedCall = activeCalls.find(call => call.id === callId);
    if (updatedCall) {
      updatedCall.status = status;
      setActiveCalls([...activeCalls]);
    }
  };

  const handleEndCall = (callId: string) => {
    endCall(callId);
    loadActiveCalls();
    toast({
      title: "Call ended",
      description: "The call has been ended.",
    });
  };

  const getStatusColor = (status: CallSession['status']) => {
    switch (status) {
      case 'initiated': return 'bg-blue-500';
      case 'ringing': return 'bg-yellow-500';
      case 'connected': return 'bg-green-500';
      case 'ended': return 'bg-gray-500';
      case 'missed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: CallSession['status']) => {
    switch (status) {
      case 'initiated': return 'Calling...';
      case 'ringing': return 'Ringing';
      case 'connected': return 'Connected';
      case 'ended': return 'Ended';
      case 'missed': return 'Missed';
      default: return 'Unknown';
    }
  };

  return (
    <div className="space-y-6">
      {/* Call Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="w-5 h-5" />
            Call Patient
          </CardTitle>
          <CardDescription>
            Select a patient to initiate a video consultation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Patients */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search patients by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Patient Selection */}
          <Select value={selectedPatient} onValueChange={setSelectedPatient}>
            <SelectTrigger>
              <SelectValue placeholder="Select a patient to call" />
            </SelectTrigger>
            <SelectContent>
              {filteredPatients.map((patient) => (
                <SelectItem key={patient.email} value={patient.fullName}>
                  <div className="flex items-center justify-between w-full">
                    <span>{patient.fullName}</span>
                    <span className="text-sm text-muted-foreground ml-2">
                      {patient.email}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Call Button */}
          <Button
            onClick={handleCallPatient}
            disabled={!selectedPatient || isCalling}
            className="w-full"
            size="lg"
          >
            {isCalling ? (
              <>
                <Clock className="w-4 h-4 mr-2 animate-spin" />
                Calling...
              </>
            ) : (
              <>
                <Phone className="w-4 h-4 mr-2" />
                Call Patient
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Active Calls */}
      {activeCalls.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Active Calls
            </CardTitle>
            <CardDescription>
              Manage your ongoing video consultations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activeCalls.map((call) => (
                <div
                  key={call.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(call.status)}`} />
                    <div>
                      <p className="font-semibold">{call.patientName}</p>
                      <p className="text-sm text-muted-foreground">
                        Room: {call.roomName}
                      </p>
                      <Badge variant="outline" className="mt-1">
                        {getStatusText(call.status)}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {(call.status === 'connected' || call.status === 'ringing') && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(call.jitsiLink, '_blank')}
                      >
                        {call.status === 'connected' ? 'Rejoin Call' : 'Join Call'}
                      </Button>
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleEndCall(call.id)}
                    >
                      <PhoneOff className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Patient List */}
      <Card>
        <CardHeader>
          <CardTitle>Registered Patients</CardTitle>
          <CardDescription>
            {patients.length} patients available for consultation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {filteredPatients.map((patient) => (
              <div
                key={patient.email}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
              >
                <div>
                  <p className="font-medium">{patient.fullName}</p>
                  <p className="text-sm text-muted-foreground">{patient.email}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedPatient(patient.fullName)}
                >
                  Select
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
