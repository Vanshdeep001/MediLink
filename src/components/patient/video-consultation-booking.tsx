
'use client';

import { useState, useContext, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { LanguageContext } from '@/context/language-context';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { StableCheckbox } from '@/components/ui/stable-checkbox';
import { ClientOnly } from '@/components/ui/client-only';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { generateJitsiUrl, initiateCall, type CallSession } from '@/lib/call-management-service';
import { Calendar as CalendarIcon, Video } from 'lucide-react';
import type { Doctor, Consultation } from '@/lib/types';

const bookingSchema = z.object({
  doctor: z.string({ required_error: 'Please select a doctor.' }),
  specialization: z.string({ required_error: 'Please select a specialization.' }),
  date: z.date().optional(),
  time: z.string().optional(),
});

interface VideoConsultationBookingProps {
  doctors: Doctor[];
  patientName: string;
  onBookingConfirmed: () => void;
  onInstantCall?: (callSession: CallSession) => void;
  selectedDoctorId?: string | null;
}

export function VideoConsultationBooking({ doctors, patientName, onBookingConfirmed, onInstantCall, selectedDoctorId }: VideoConsultationBookingProps) {
  const { translations } = useContext(LanguageContext);
  const [specializations, setSpecializations] = useState<string[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [isInstantCall, setIsInstantCall] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const { toast } = useToast();

  const [onlineDoctorIds, setOnlineDoctorIds] = useState<string[]>([]);

  useEffect(() => {
    const fetchOnlineStatus = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/public/online-status');
        const result = await response.json();
        if (result.success) {
          setOnlineDoctorIds(result.data);
        }
      } catch (err) {
        console.error('Error fetching online status:', err);
      }
    };

    fetchOnlineStatus();
    const interval = setInterval(fetchOnlineStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    const uniqueSpecs = [...new Set(doctors.map((d: Doctor) => d.specialization))];
    setSpecializations(uniqueSpecs);
    setFilteredDoctors(doctors);
  }, [doctors]);

  const form = useForm<z.infer<typeof bookingSchema>>({
    resolver: zodResolver(bookingSchema),
  });

  // Handle pre-selected doctor from symptom checker
  useEffect(() => {
    if (selectedDoctorId && doctors.length > 0) {
      const selectedDoctor = doctors.find(d => d.id === selectedDoctorId);
      if (selectedDoctor) {
        form.setValue('doctor', selectedDoctor.fullName);
        form.setValue('specialization', selectedDoctor.specialization);
        setFilteredDoctors([selectedDoctor]);
        setSpecializations([selectedDoctor.specialization]);
      }
    }
  }, [selectedDoctorId, doctors, form]);

  const onSpecializationChange = useCallback((spec: string) => {
    form.setValue('specialization', spec);
    form.resetField('doctor');
    if (spec === 'all') {
      setFilteredDoctors(doctors);
    } else {
      setFilteredDoctors(doctors.filter(d => d.specialization === spec));
    }
  }, [form, doctors]);

  const onSubmit = (values: z.infer<typeof bookingSchema>) => {
    console.log('Form submitted with values:', values);

    // Explicitly check for instant call state
    if (isInstantCall) {
      const instantValues = {
        ...values,
        date: values.date || new Date(),
        time: values.time || 'Instant Call'
      };
      handleInstantCall(instantValues);
    } else {
      // Validate for scheduled booking
      if (!values.date || !values.time) {
        toast({
          title: "Missing Information",
          description: "Please select a preferred date and time for your booking, or choose 'Instant Call'.",
          variant: "destructive"
        });
        return;
      }
      handleScheduledBooking(values);
    }
  };

  const handleInstantCall = async (values: z.infer<typeof bookingSchema>) => {
    console.log('handleInstantCall called with:', values);

    // Find the doctor's real ID for WebRTC signaling
    const cleanDoctorName = values.doctor.replace(/^Dr\.?\s+/i, '').trim();
    const doctor = doctors.find(d => {
      const dName = d.fullName.replace(/^Dr\.?\s+/i, '').trim();
      return d.id === values.doctor || d.fullName === values.doctor || dName === cleanDoctorName;
    });

    if (!doctor) {
      toast({ title: "Doctor Offline", description: "This doctor is not currently available for instant calls.", variant: "destructive" });
      return;
    }

    const doctorId = doctor.id || cleanDoctorName;
    const doctorName = doctor.fullName;



    // Store the instant consultation for history
    const instantConsultation: Consultation = {
      id: `INSTANT-${Date.now()}`,
      patientName,
      doctorName: values.doctor,
      specialization: values.specialization,
      date: new Date().toISOString(),
      time: 'Instant Call',
      jitsiLink: 'webrtc-secure-link'
    };

    const consultationsString = localStorage.getItem('consultations_list');
    const allConsultations = consultationsString ? JSON.parse(consultationsString) : [];
    allConsultations.push(instantConsultation);
    localStorage.setItem('consultations_list', JSON.stringify(allConsultations));

    // Trigger the WebRTC call via the callback
    toast({ title: "Initiating Video Call", description: `Connecting to Dr. ${doctorName}...` });

    if (onInstantCall) {
      // We pass a mock session that triggers our WebRTC dialog
      onInstantCall({
        chatId: `call_${Date.now()}`,
        patientId: patientName,
        patientName,
        doctorId: doctorId,
        doctorName: doctorName,
        messages: [],
        lastActivity: new Date().toISOString(),
        isActive: true,
        unreadCount: 0
      } as any);
    }

    form.reset();
    setIsInstantCall(false);
  };

  const handleScheduledBooking = (values: z.infer<typeof bookingSchema>) => {
    if (!values.date || !values.time) {
      console.error('Date and time are required for scheduled booking');
      return;
    }

    const dateString = format(values.date, 'yyyy-MM-dd');
    const roomName = `MediLink-${patientName.replace(/\s/g, '')}-${values.doctor.replace(/\s/g, '')}-${dateString}`;

    const newConsultation: Consultation = {
      id: `CONS-${Date.now()}`,
      patientName,
      doctorName: values.doctor,
      specialization: values.specialization,
      date: values.date.toISOString(),
      time: values.time,
      jitsiLink: generateJitsiUrl(roomName, patientName)
    };

    const consultationsString = localStorage.getItem('consultations_list');
    const allConsultations = consultationsString ? JSON.parse(consultationsString) : [];
    allConsultations.push(newConsultation);
    localStorage.setItem('consultations_list', JSON.stringify(allConsultations));

    onBookingConfirmed();
    form.reset();
  };

  const timeSlots = ["09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM", "04:00 PM"];

  const isDoctorOnline = (doctor: Doctor) => {
    const searchName = doctor.fullName.replace('Dr. ', '');
    return onlineDoctorIds.includes(doctor.id || '') || 
           onlineDoctorIds.includes(doctor.fullName) || 
           onlineDoctorIds.includes(searchName);
  };

  const sortedDoctors = [...filteredDoctors].sort((a, b) => {
    const aOnline = isDoctorOnline(a);
    const bOnline = isDoctorOnline(b);
    if (aOnline && !bOnline) return -1;
    if (!aOnline && bOnline) return 1;
    return 0;
  });


  return (
    <div suppressHydrationWarning>
      <ClientOnly fallback={
        <div className="space-y-6 p-6 bg-white rounded-lg shadow-lg">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-10 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-10 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      }>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="specialization"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Specialization</FormLabel>
                  <Select onValueChange={onSpecializationChange} value={field.value || ""}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Select a specialization" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="all">All Specializations</SelectItem>
                      {specializations.map(spec => <SelectItem key={spec} value={spec}>{spec}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="doctor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex justify-between items-center">
                    Doctor
                    {isInstantCall && (
                      <span className="text-[10px] uppercase tracking-wider text-primary font-bold bg-primary/10 px-2 py-0.5 rounded-full">
                        Online Doctors Prioritized
                      </span>
                    )}
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ""}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Select a doctor" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {sortedDoctors.map((doc, idx) => {
                        const online = isDoctorOnline(doc);
                        return (
                          <SelectItem key={doc.id || `doc-${idx}-${doc.fullName}`} value={`Dr. ${doc.fullName.replace('Dr. ', '')}`}>
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${online ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
                              Dr. {doc.fullName.replace('Dr. ', '')}
                              {online && <span className="text-[10px] text-green-600 font-medium ml-1">(Online)</span>}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Instant Call Checkbox */}
            <StableCheckbox
              id="instant-call"
              checked={isInstantCall}
              onCheckedChange={(checked) => {
                setIsInstantCall(checked);
                if (checked) {
                  // Clear date and time when instant call is selected
                  form.resetField('date');
                  form.resetField('time');
                }
              }}
              className="space-x-2"
            >
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4" />
                Instant Call (Skip scheduling)
              </div>
            </StableCheckbox>
            {!isInstantCall && (
              <>
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Preferred Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                              {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() - 1))} initialFocus />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preferred Time</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select a time slot" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {timeSlots.map(time => <SelectItem key={time} value={time}>{time}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
            <Button
              type="submit"
              className="w-full"
              disabled={isInstantCall && !isDoctorOnline(doctors.find(d => `Dr. ${d.fullName.replace('Dr. ', '')}` === form.getValues().doctor) || ({} as any))}
              onClick={() => {
                console.log('Button clicked!');
                console.log('Form values:', form.getValues());
                console.log('Form errors:', form.formState.errors);
                console.log('Is instant call:', isInstantCall);
              }}
            >
              {isInstantCall ? (
                <>
                  <Video className="w-4 h-4 mr-2" />
                  Start Instant Call
                </>
              ) : (
                'Confirm Booking'
              )}
            </Button>
          </form>
        </Form>
      </ClientOnly>
    </div>
  );

}
