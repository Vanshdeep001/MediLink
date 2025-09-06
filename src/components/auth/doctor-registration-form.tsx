
"use client";

import { useEffect, useState, useContext } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User, Mail, Phone, Briefcase, Award, GraduationCap, UploadCloud, File, X, Lock, MapPin } from "lucide-react";
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
import { FadeIn } from "../fade-in";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { LanguageContext } from "@/context/language-context";
import TextFlipper from "../ui/text-effect-flipper";
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
  const [startAnimation, setStartAnimation] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const { toast } = useToast();
  const router = useRouter();
  const { translations } = useContext(LanguageContext);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setStartAnimation(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

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
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFiles((prev) => [...prev, ...Array.from(event.target.files!)]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const onRegisterSubmit = (values: z.infer<typeof registrationSchema>) => {
    // Store doctor details in localStorage for prototype
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
    <div className="w-full max-w-2xl mx-auto">
      <div
        className={cn(
          "text-center absolute left-1/2 -translate-x-1/2 transition-all duration-1000 ease-in-out",
          startAnimation ? "top-[10rem] -translate-y-1/2" : "top-1/2 -translate-y-1/2 scale-125"
        )}
      >
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight whitespace-nowrap">
          <TextFlipper>{translations.doctorRegForm.titleMain}</TextFlipper> <TextFlipper delay={0.2} className="text-primary font-cursive">{translations.doctorRegForm.titleCursive}</TextFlipper>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground mt-2 font-serif">
          {translations.doctorRegForm.subtitle}
        </p>
      </div>

      {startAnimation && (
        <div className="w-full animate-content-fade-in" style={{ animationDelay: '0.5s', paddingTop: '16rem' }}>
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

                  <FadeIn delay={1100} direction="up">
                    <div className="space-y-2">
                        <FormLabel>{translations.doctorRegForm.uploadLabel}</FormLabel>
                        <div className="relative border-2 border-dashed border-muted-foreground/30 rounded-xl p-8 flex flex-col items-center justify-center text-center">
                          <UploadCloud className="w-12 h-12 text-muted-foreground mb-4" />
                          <p className="text-muted-foreground mb-2">{translations.doctorRegForm.dragDrop}</p>
                          <Button type="button" variant="outline" size="sm" asChild>
                            <label htmlFor="file-upload" className="cursor-pointer">{translations.doctorRegForm.browse}</label>
                          </Button>
                          <Input id="file-upload" type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleFileChange} accept=".pdf,.jpg,.jpeg,.png" />
                        </div>
                        {files.length > 0 && (
                          <div className="space-y-2 pt-2">
                            <ul className="space-y-2">
                              {files.map((file, index) => (
                                <li key={index} className="flex items-center justify-between bg-muted p-2 rounded-md">
                                  <div className="flex items-center gap-2">
                                    <File className="w-5 h-5" />
                                    <span className="text-sm truncate max-w-xs">{file.name}</span>
                                  </div>
                                  <Button type="button" variant="ghost" size="icon" onClick={() => removeFile(index)}>
                                    <X className="w-4 h-4" />
                                  </Button>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                    </div>
                  </FadeIn>

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
        </div>
      )}
    </div>
  );
}

    