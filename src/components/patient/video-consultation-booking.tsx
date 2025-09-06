
'use client';

import { useState, useContext, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { LanguageContext } from '@/context/language-context';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Doctor } from '@/lib/types';

const bookingSchema = z.object({
  doctor: z.string({ required_error: 'Please select a doctor.' }),
  specialization: z.string({ required_error: 'Please select a specialization.' }),
  date: z.date({ required_error: 'Please select a date.' }),
  time: z.string({ required_error: 'Please select a time slot.' }),
});

export function VideoConsultationBooking() {
  const { translations } = useContext(LanguageContext);
  const { toast } = useToast();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [specializations, setSpecializations] = useState<string[]>([]);
  
  useEffect(() => {
    const doctorsString = localStorage.getItem('doctors_list');
    const allDoctors = doctorsString ? JSON.parse(doctorsString) : [];
    setDoctors(allDoctors);
    const uniqueSpecs = [...new Set(allDoctors.map((d: Doctor) => d.specialization))];
    setSpecializations(uniqueSpecs);
  }, []);

  const form = useForm<z.infer<typeof bookingSchema>>({
    resolver: zodResolver(bookingSchema),
  });
  
  const onSubmit = (values: z.infer<typeof bookingSchema>) => {
    console.log(values);
    // In a real app, you would send this to a backend and create a notification for the doctor
    toast({
      title: "Booking Confirmed!",
      description: `Your appointment with ${values.doctor} is scheduled for ${format(values.date, 'PPP')} at ${values.time}.`,
    });
    form.reset();
  };
  
  const timeSlots = ["09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM", "04:00 PM"];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="specialization"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Specialization</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
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
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!doctors.length}>
                <FormControl>
                  <SelectTrigger><SelectValue placeholder="Select a doctor" /></SelectTrigger>
                </FormControl>
                <SelectContent>
                  {doctors.map(doc => <SelectItem key={doc.fullName} value={doc.fullName}>Dr. {doc.fullName}</SelectItem>)}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
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
              <Select onValueChange={field.onChange} defaultValue={field.value}>
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
        <Button type="submit" className="w-full">Confirm Booking</Button>
      </form>
    </Form>
  );
}
