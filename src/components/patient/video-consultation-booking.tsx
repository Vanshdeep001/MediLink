
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
    console.log('Is instant call:', isInstantCall);
    
    if (isInstantCall) {
      // Set default values for instant calls
      const instantValues = {
        ...values,
        date: values.date || new Date(),
        time: values.time || 'Instant Call'
      };
      console.log('Calling handleInstantCall with:', instantValues);
      handleInstantCall(instantValues);
    } else {
      handleScheduledBooking(values);
    }
  };

  const handleInstantCall = (values: z.infer<typeof bookingSchema>) => {
    console.log('handleInstantCall called with:', values);
    
    // Extract doctor name without "Dr." prefix for the call system
    const doctorName = values.doctor.replace('Dr. ', '');
    console.log('Extracted doctor name:', doctorName);
    console.log('Patient name:', patientName);
    
    // Create instant call request using the call management service (same as doctor-initiated calls)
    const callSession = initiateCall(doctorName, patientName, 'patient');
    console.log('Call session created:', callSession);
    
    // Store the instant consultation for history
    const instantConsultation: Consultation = {
      id: `INSTANT-${Date.now()}`,
      patientName,
      doctorName: values.doctor,
      specialization: values.specialization,
      date: new Date().toISOString(),
      time: 'Instant Call',
      jitsiLink: callSession.jitsiLink,
      roomName: callSession.roomName
    };

    const consultationsString = localStorage.getItem('consultations_list');
    const allConsultations = consultationsString ? JSON.parse(consultationsString) : [];
    allConsultations.push(instantConsultation);
    localStorage.setItem('consultations_list', JSON.stringify(allConsultations));

    // Simulate ringing and auto-join (exactly like doctor portal)
    setTimeout(() => {
      console.log('Calling onInstantCall with:', callSession);
      if (onInstantCall) {
        onInstantCall(callSession);
      } else {
        console.log('onInstantCall callback not provided');
      }
    }, 1000);

    // The JitsiCall component will handle the video call interface
    
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
              <FormLabel>Doctor</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || ""}>
                <FormControl>
                  <SelectTrigger><SelectValue placeholder="Select a doctor" /></SelectTrigger>
                </FormControl>
                <SelectContent>
                  {filteredDoctors.map(doc => <SelectItem key={doc.fullName} value={`Dr. ${doc.fullName}`}>Dr. {doc.fullName}</SelectItem>)}
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
