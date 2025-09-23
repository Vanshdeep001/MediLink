"use client";

import { useContext } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User, Mail, Phone, Calendar as CalendarIcon, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FadeIn } from "../fade-in";
import { useToast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import TextFlipper from "../ui/text-effect-flipper";
import { LanguageContext } from "@/context/language-context";
import { useVoiceForm } from "@/context/voice-form-context";
import { useEffect } from "react";

const formSchema = z.object({
  fullName: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  phone: z.string().min(10, { message: 'Phone number must be at least 10 digits.' }),
  dob: z.date({
    required_error: "A date of birth is required.",
    invalid_type_error: "That's not a valid date!",
  }),
});

function calculateAge(dob: Date) {
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
  }
  return age;
}

export function AuthForm() {
  const { toast } = useToast();
  const router = useRouter();
  const { translations } = useContext(LanguageContext);
  const { registerForm } = useVoiceForm();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      dob: undefined,
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    try {
      const age = calculateAge(values.dob);
      const user = { ...values, age };
      localStorage.setItem('temp_user', JSON.stringify(user));

      toast({
        title: translations.authForm.toastSuccessTitle,
        description: translations.authForm.toastSuccessDescription,
      });

      router.push('/role-selection');

    } catch (e) {
      toast({
        title: translations.authForm.toastErrorTitle,
        description: translations.authForm.toastErrorDescription,
        variant: "destructive",
      });
    }
  };

  // Register this form with the voice context
  useEffect(() => {
    console.log('AuthForm: Registering form with voice context', form);
    console.log('AuthForm: Form has setValue?', !!form.setValue);
    registerForm(form, () => {
      form.handleSubmit(onSubmit)();
    });
  }, [form, registerForm]);

  return (
    <div className="w-full max-w-lg mx-auto">
      <Card>
        <CardHeader className="text-center">
          <CardTitle>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight whitespace-nowrap">
              <TextFlipper>{translations.authForm.title}</TextFlipper>
            </h1>
          </CardTitle>
          <CardDescription className="text-lg pt-2">{translations.authForm.subtitle}</CardDescription>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FadeIn delay={100} direction="left">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{translations.authForm.fullNameLabel}</FormLabel>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <FormControl><Input className="pl-10 h-12" {...field} /></FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </FadeIn>
              <FadeIn delay={200} direction="right">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{translations.authForm.emailLabel}</FormLabel>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <FormControl><Input className="pl-10 h-12" {...field} /></FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </FadeIn>
              <FadeIn delay={300} direction="left">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{translations.authForm.phoneLabel}</FormLabel>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <FormControl><Input className="pl-10 h-12" {...field} /></FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </FadeIn>
              <FadeIn delay={400} direction="right">
                <FormField
                  control={form.control}
                  name="dob"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>{translations.authForm.dobLabel}</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button variant={"outline"} className={cn("pl-3 text-left font-normal h-12", !field.value && "text-muted-foreground")}>
                              {field.value ? (format(field.value, "PPP")) : (<span>{translations.authForm.dobPlaceholder}</span>)}
                              <CalendarIcon className="ml-auto h-5 w-5 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" captionLayout="dropdown-buttons" fromYear={1920} toYear={new Date().getFullYear()} selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date() || date < new Date("1900-01-01")} initialFocus />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </FadeIn>
              <FadeIn delay={500} direction="up">
                <Button type="submit" className="w-full h-14">
                  {translations.authForm.submitButton}
                </Button>
              </FadeIn>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
