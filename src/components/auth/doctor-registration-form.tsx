"use client";

import { useContext } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User, Mail, Phone, Briefcase, Award, GraduationCap, Lock, MapPin, Pin } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FadeIn } from "../fade-in";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import TextFlipper from "../ui/text-effect-flipper";
import { LanguageContext } from "@/context/language-context";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const registrationSchema = z.object({
  fullName: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  phone: z.string().min(10, { message: 'Phone number must be at least 10 digits.' }),
  specialization: z.string().min(2, { message: 'Specialization is required.' }),
  experience: z.coerce.number().min(0, { message: 'Experience cannot be negative.' }),
  degree: z.string().min(2, { message: 'Medical degree is required.' }),
  licenseNumber: z.string().min(5, { message: 'A valid license number is required.' }),
  address: z.string().min(10, { message: 'Clinic address is required.' }),
  city: z.string().min(2, { message: 'City is required.' }),
  pinCode: z.string().min(6, { message: 'A valid 6-digit pin code is required.' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters.' }),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const loginSchema = z.object({
  fullName: z.string().min(2, { message: 'Name is required.' }),
  licenseNumber: z.string().min(5, { message: 'License number is required.' }),
  password: z.string().min(8, { message: 'Password is required.' }),
});


export function DoctorRegistrationForm() {
  const { toast } = useToast();
  const router = useRouter();
  const { translations } = useContext(LanguageContext);

  const registrationForm = useForm<z.infer<typeof registrationSchema>>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      specialization: "",
      experience: 0,
      degree: "",
      licenseNumber: "",
      address: "",
      city: "",
      pinCode: "",
      password: "",
      confirmPassword: "",
    },
  });

   const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      fullName: "",
      licenseNumber: "",
      password: "",
    },
  });

  const onRegisterSubmit = (values: z.infer<typeof registrationSchema>) => {
    const user = { ...values, role: 'doctor' };
    localStorage.setItem('temp_user', JSON.stringify(user));
    
    const doctorsString = localStorage.getItem('doctors_list');
    const doctors = doctorsString ? JSON.parse(doctorsString) : [];
    doctors.push(values);
    localStorage.setItem('doctors_list', JSON.stringify(doctors));

    toast({
      title: translations.doctorRegForm.toastTitle,
      description: translations.doctorRegForm.toastDescription,
    });
    router.push("/doctor");
  };

  const onLoginSubmit = (values: z.infer<typeof loginSchema>) => {
    const doctorsString = localStorage.getItem('doctors_list');
    const doctors = doctorsString ? JSON.parse(doctorsString) : [];
    
    const foundDoctor = doctors.find(
      (d: any) =>
        d.fullName.toLowerCase() === values.fullName.toLowerCase() &&
        d.licenseNumber === values.licenseNumber &&
        d.password === values.password
    );

    if (foundDoctor) {
      localStorage.setItem('temp_user', JSON.stringify(foundDoctor));
      toast({
        title: translations.doctorRegForm.login.toastSuccessTitle,
        description: translations.doctorRegForm.login.toastSuccessDescription,
      });
      router.push('/doctor');
    } else {
      toast({
        title: translations.doctorRegForm.login.toastErrorTitle,
        description: translations.doctorRegForm.login.toastErrorDescription,
        variant: "destructive",
      });
    }
  };


  return (
    <div className="w-full max-w-4xl mx-auto z-10">
       <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          <TextFlipper>{translations.doctorRegForm.titleMain}</TextFlipper>{' '}
          <TextFlipper delay={0.2} className="text-primary font-cursive">{translations.doctorRegForm.titleCursive}</TextFlipper>
        </h1>
        <p className="mt-4 text-lg text-muted-foreground font-serif">
          {translations.doctorRegForm.subtitle}
        </p>
      </div>
      <Card>
        <CardContent className="p-4 md:p-6">
          <Tabs defaultValue="register" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="register">{translations.doctorRegForm.tabs.register}</TabsTrigger>
                  <TabsTrigger value="login">{translations.doctorRegForm.tabs.login}</TabsTrigger>
              </TabsList>
              <TabsContent value="register" className="mt-6">
                  <Form {...registrationForm}>
                  <form onSubmit={registrationForm.handleSubmit(onRegisterSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FadeIn delay={100} direction="left">
                          <FormField
                          control={registrationForm.control}
                          name="fullName"
                          render={({ field }) => (
                              <FormItem>
                              <FormLabel>{translations.doctorRegForm.fullNameLabel}</FormLabel>
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
                          control={registrationForm.control}
                          name="email"
                          render={({ field }) => (
                              <FormItem>
                              <FormLabel>{translations.doctorRegForm.emailLabel}</FormLabel>
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
                          control={registrationForm.control}
                          name="phone"
                          render={({ field }) => (
                              <FormItem>
                              <FormLabel>{translations.doctorRegForm.phoneLabel}</FormLabel>
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
                          control={registrationForm.control}
                          name="specialization"
                          render={({ field }) => (
                              <FormItem>
                              <FormLabel>{translations.doctorRegForm.specializationLabel}</FormLabel>
                              <div className="relative">
                                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                  <FormControl><Input className="pl-10 h-12" placeholder={translations.doctorRegForm.specializationPlaceholder} {...field} /></FormControl>
                              </div>
                              <FormMessage />
                              </FormItem>
                          )}
                          />
                      </FadeIn>
                      <FadeIn delay={500} direction="left">
                          <FormField
                          control={registrationForm.control}
                          name="experience"
                          render={({ field }) => (
                              <FormItem>
                              <FormLabel>{translations.doctorRegForm.experienceLabel}</FormLabel>
                              <div className="relative">
                                  <Award className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                  <FormControl><Input type="number" className="pl-10 h-12" {...field} /></FormControl>
                              </div>
                              <FormMessage />
                              </FormItem>
                          )}
                          />
                      </FadeIn>
                      <FadeIn delay={600} direction="right">
                          <FormField
                          control={registrationForm.control}
                          name="degree"
                          render={({ field }) => (
                              <FormItem>
                              <FormLabel>{translations.doctorRegForm.degreeLabel}</FormLabel>
                              <div className="relative">
                                  <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                  <FormControl><Input className="pl-10 h-12" placeholder={translations.doctorRegForm.degreePlaceholder} {...field} /></FormControl>
                              </div>
                              <FormMessage />
                              </FormItem>
                          )}
                          />
                      </FadeIn>
                      <FadeIn delay={700} direction="up" className="md:col-span-2">
                          <FormField
                          control={registrationForm.control}
                          name="licenseNumber"
                          render={({ field }) => (
                              <FormItem>
                              <FormLabel>{translations.doctorRegForm.licenseLabel}</FormLabel>
                              <FormControl><Input className="h-12" {...field} /></FormControl>
                              <FormMessage />
                              </FormItem>
                          )}
                          />
                      </FadeIn>
                      <FadeIn delay={800} direction="up" className="md:col-span-2">
                          <FormField
                          control={registrationForm.control}
                          name="address"
                          render={({ field }) => (
                              <FormItem>
                              <FormLabel>{translations.doctorRegForm.addressLabel}</FormLabel>
                              <div className="relative">
                                  <MapPin className="absolute left-3 top-5 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                  <FormControl><Textarea className="pl-10" rows={3} {...field} /></FormControl>
                              </div>
                              <FormMessage />
                              </FormItem>
                          )}
                          />
                      </FadeIn>
                      <FadeIn delay={900} direction="left">
                          <FormField
                          control={registrationForm.control}
                          name="city"
                          render={({ field }) => (
                              <FormItem>
                              <FormLabel>{translations.doctorRegForm.cityLabel}</FormLabel>
                              <FormControl><Input className="h-12" {...field} /></FormControl>
                              <FormMessage />
                              </FormItem>
                          )}
                          />
                      </FadeIn>
                      <FadeIn delay={1000} direction="right">
                          <FormField
                          control={registrationForm.control}
                          name="pinCode"
                          render={({ field }) => (
                              <FormItem>
                              <FormLabel>{translations.doctorRegForm.pinCodeLabel}</FormLabel>
                              <FormControl><Input className="h-12" {...field} /></FormControl>
                              <FormMessage />
                              </FormItem>
                          )}
                          />
                      </FadeIn>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FadeIn delay={1200} direction="left">
                          <FormField
                          control={registrationForm.control}
                          name="password"
                          render={({ field }) => (
                              <FormItem>
                              <FormLabel>{translations.doctorRegForm.passwordLabel}</FormLabel>
                              <div className="relative">
                                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                  <FormControl><Input type="password" className="pl-10 h-12" {...field} /></FormControl>
                              </div>
                              <FormMessage />
                              </FormItem>
                          )}
                          />
                      </FadeIn>
                      <FadeIn delay={1300} direction="right">
                          <FormField
                          control={registrationForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                              <FormItem>
                              <FormLabel>{translations.doctorRegForm.confirmPasswordLabel}</FormLabel>
                              <div className="relative">
                                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                  <FormControl><Input type="password" className="pl-10 h-12" {...field} /></FormControl>
                              </div>
                              <FormMessage />
                              </FormItem>
                          )}
                          />
                      </FadeIn>
                      </div>
                      
                      <FadeIn delay={1400} direction="up">
                      <Button type="submit" className="w-full text-lg h-14">
                          {translations.doctorRegForm.submitButton}
                      </Button>
                      </FadeIn>
                  </form>
                  </Form>
              </TabsContent>
              <TabsContent value="login" className="mt-6">
                  <Form {...loginForm}>
                      <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-6">
                          <FadeIn delay={100} direction="up">
                          <FormField
                              control={loginForm.control}
                              name="fullName"
                              render={({ field }) => (
                              <FormItem>
                                  <FormLabel>{translations.doctorRegForm.fullNameLabel}</FormLabel>
                                  <div className="relative">
                                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                  <FormControl><Input className="pl-10 h-12" {...field} /></FormControl>
                                  </div>
                                  <FormMessage />
                              </FormItem>
                              )}
                          />
                          </FadeIn>
                          <FadeIn delay={200} direction="up">
                          <FormField
                              control={loginForm.control}
                              name="licenseNumber"
                              render={({ field }) => (
                              <FormItem>
                                  <FormLabel>{translations.doctorRegForm.licenseLabel}</FormLabel>
                                  <div className="relative">
                                  <Award className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                  <FormControl><Input className="pl-10 h-12" {...field} /></FormControl>
                                  </div>
                                  <FormMessage />
                              </FormItem>
                              )}
                          />
                          </FadeIn>
                          <FadeIn delay={300} direction="up">
                          <FormField
                              control={loginForm.control}
                              name="password"
                              render={({ field }) => (
                              <FormItem>
                                  <FormLabel>{translations.doctorRegForm.passwordLabel}</FormLabel>
                                  <div className="relative">
                                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                  <FormControl><Input type="password" className="pl-10 h-12" {...field} /></FormControl>
                                  </div>
                                  <FormMessage />
                              </FormItem>
                              )}
                          />
                          </FadeIn>
                          <FadeIn delay={400} direction="up">
                              <Button type="submit" className="w-full text-lg h-14">
                              {translations.doctorRegForm.login.loginButton}
                              </Button>
                          </FadeIn>
                      </form>
                  </Form>
              </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
