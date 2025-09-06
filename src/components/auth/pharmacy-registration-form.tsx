"use client";

import { useContext } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User, Mail, Phone, Building, Award, MapPin, Lock, Pin, Truck } from "lucide-react";
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
  pharmacyName: z.string().min(2, { message: 'Pharmacy name is required.' }),
  licenseNumber: z.string().min(5, { message: 'A valid license number is required.' }),
  ownerName: z.string().min(2, { message: 'Owner name is required.' }),
  phone: z.string().min(10, { message: 'Phone number must be at least 10 digits.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  address: z.string().min(10, { message: 'A valid store address is required.' }),
  city: z.string().min(2, { message: 'City is required' }),
  pinCode: z.string().min(6, { message: 'A valid 6-digit pin code is required.' }),
  deliveryRange: z.string().min(1, { message: 'Delivery range is required.' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters.' }),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const loginSchema = z.object({
  pharmacyName: z.string().min(2, { message: 'Pharmacy name is required.' }),
  pinCode: z.string().min(6, { message: 'A valid 6-digit pin code is required.' }),
  password: z.string().min(8, { message: 'Password is required.' }),
});

export function PharmacyRegistrationForm() {
  const { toast } = useToast();
  const router = useRouter();
  const { translations } = useContext(LanguageContext);
  
  const registrationForm = useForm<z.infer<typeof registrationSchema>>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      pharmacyName: "",
      licenseNumber: "",
      ownerName: "",
      phone: "",
      email: "",
      address: "",
      city: "",
      pinCode: "",
      deliveryRange: "",
      password: "",
      confirmPassword: "",
    },
  });

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      pharmacyName: "",
      pinCode: "",
      password: "",
    },
  });
  
  const onRegisterSubmit = (values: z.infer<typeof registrationSchema>) => {
    const user = { ...values, role: 'pharmacy' };
    localStorage.setItem('temp_user', JSON.stringify(user));

    const pharmaciesString = localStorage.getItem('pharmacies_list');
    const pharmacies = pharmaciesString ? JSON.parse(pharmaciesString) : [];
    pharmacies.push(values);
    localStorage.setItem('pharmacies_list', JSON.stringify(pharmacies));

    toast({
      title: translations.pharmacyRegForm.toastTitle,
      description: translations.pharmacyRegForm.toastDescription,
    });
    router.push("/pharmacy");
  };

  const onLoginSubmit = (values: z.infer<typeof loginSchema>) => {
    const pharmaciesString = localStorage.getItem('pharmacies_list');
    const pharmacies = pharmaciesString ? JSON.parse(pharmaciesString) : [];
    
    const foundPharmacy = pharmacies.find(
      (p: any) =>
        p.pharmacyName.toLowerCase() === values.pharmacyName.toLowerCase() &&
        p.pinCode === values.pinCode &&
        p.password === values.password
    );

    if (foundPharmacy) {
      const user = { pharmacyName: foundPharmacy.pharmacyName };
      localStorage.setItem('temp_user', JSON.stringify(user));

      toast({
        title: translations.pharmacyRegForm.login.toastSuccessTitle,
        description: translations.pharmacyRegForm.login.toastSuccessDescription,
      });
      router.push('/pharmacy');
    } else {
      toast({
        title: translations.pharmacyRegForm.login.toastErrorTitle,
        description: translations.pharmacyRegForm.login.toastErrorDescription,
        variant: "destructive",
      });
    }
  };


  return (
    <div className="w-full max-w-4xl mx-auto z-10">
       <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          <TextFlipper>{translations.pharmacyRegForm.titleMain}</TextFlipper>{' '}
          <TextFlipper delay={0.2} className="text-primary font-cursive">{translations.pharmacyRegForm.titleCursive}</TextFlipper>
        </h1>
        <p className="mt-4 text-lg text-muted-foreground font-serif">
          {translations.pharmacyRegForm.subtitle}
        </p>
      </div>
      <Card>
          <CardContent className="p-4 md:p-6">
              <Tabs defaultValue="register" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="register">{translations.pharmacyRegForm.tabs.register}</TabsTrigger>
                  <TabsTrigger value="login">{translations.pharmacyRegForm.tabs.login}</TabsTrigger>
              </TabsList>
              <TabsContent value="register" className="mt-6">
                  <Form {...registrationForm}>
                  <form onSubmit={registrationForm.handleSubmit(onRegisterSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FadeIn delay={100} direction="left">
                          <FormField
                          control={registrationForm.control}
                          name="pharmacyName"
                          render={({ field }) => (
                              <FormItem>
                              <FormLabel>{translations.pharmacyRegForm.pharmacyNameLabel}</FormLabel>
                              <div className="relative">
                                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
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
                          name="licenseNumber"
                          render={({ field }) => (
                              <FormItem>
                              <FormLabel>{translations.pharmacyRegForm.licenseLabel}</FormLabel>
                              <div className="relative">
                                  <Award className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
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
                          name="ownerName"
                          render={({ field }) => (
                              <FormItem>
                              <FormLabel>{translations.pharmacyRegForm.ownerNameLabel}</FormLabel>
                              <div className="relative">
                                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
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
                          name="phone"
                          render={({ field }) => (
                              <FormItem>
                              <FormLabel>{translations.pharmacyRegForm.contactLabel}</FormLabel>
                              <div className="relative">
                                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                  <FormControl><Input className="pl-10 h-12" {...field} /></FormControl>
                              </div>
                              <FormMessage />
                              </FormItem>
                          )}
                          />
                      </FadeIn>
                      <FadeIn delay={500} direction="left" className="md:col-span-2">
                          <FormField
                          control={registrationForm.control}
                          name="email"
                          render={({ field }) => (
                              <FormItem>
                              <FormLabel>{translations.pharmacyRegForm.emailLabel}</FormLabel>
                              <div className="relative">
                                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                  <FormControl><Input className="pl-10 h-12" {...field} /></FormControl>
                              </div>
                              <FormMessage />
                              </FormItem>
                          )}
                          />
                      </FadeIn>
                      <FadeIn delay={600} direction="right" className="md:col-span-2">
                          <FormField
                          control={registrationForm.control}
                          name="address"
                          render={({ field }) => (
                              <FormItem>
                              <FormLabel>{translations.pharmacyRegForm.addressLabel}</FormLabel>
                              <div className="relative">
                                  <MapPin className="absolute left-3 top-5 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                  <FormControl><Textarea className="pl-10" rows={3} {...field} /></FormControl>
                              </div>
                              <FormMessage />
                              </FormItem>
                          )}
                          />
                      </FadeIn>
                       <FadeIn delay={650} direction="left">
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
                      <FadeIn delay={700} direction="right">
                          <FormField
                          control={registrationForm.control}
                          name="pinCode"
                          render={({ field }) => (
                              <FormItem>
                              <FormLabel>{translations.pharmacyRegForm.pinCodeLabel}</FormLabel>
                              <div className="relative">
                                  <Pin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                  <FormControl><Input className="pl-10 h-12" {...field} /></FormControl>
                              </div>
                              <FormMessage />
                              </FormItem>
                          )}
                          />
                      </FadeIn>
                      <FadeIn delay={800} direction="left">
                          <FormField
                          control={registrationForm.control}
                          name="deliveryRange"
                          render={({ field }) => (
                              <FormItem>
                              <FormLabel>{translations.pharmacyRegForm.deliveryRangeLabel}</FormLabel>
                              <div className="relative">
                                  <Truck className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                  <FormControl><Input className="pl-10 h-12" placeholder={translations.pharmacyRegForm.deliveryRangePlaceholder} {...field} /></FormControl>
                              </div>
                              <FormMessage />
                              </FormItem>
                          )}
                          />
                      </FadeIn>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FadeIn delay={1000} direction="left">
                          <FormField
                          control={registrationForm.control}
                          name="password"
                          render={({ field }) => (
                              <FormItem>
                              <FormLabel>{translations.pharmacyRegForm.passwordLabel}</FormLabel>
                              <div className="relative">
                                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                  <FormControl><Input type="password" className="pl-10 h-12" {...field} /></FormControl>
                              </div>
                              <FormMessage />
                              </FormItem>
                          )}
                          />
                      </FadeIn>
                      <FadeIn delay={1100} direction="right">
                          <FormField
                          control={registrationForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                              <FormItem>
                              <FormLabel>{translations.pharmacyRegForm.confirmPasswordLabel}</FormLabel>
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
                      
                      <FadeIn delay={1200} direction="up">
                      <Button type="submit" className="w-full text-lg h-14">
                          {translations.pharmacyRegForm.submitButton}
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
                              name="pharmacyName"
                              render={({ field }) => (
                              <FormItem>
                                  <FormLabel>{translations.pharmacyRegForm.pharmacyNameLabel}</FormLabel>
                                  <div className="relative">
                                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
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
                              name="pinCode"
                              render={({ field }) => (
                              <FormItem>
                                  <FormLabel>{translations.pharmacyRegForm.pinCodeLabel}</FormLabel>
                                  <div className="relative">
                                  <Pin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
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
                                  <FormLabel>{translations.pharmacyRegForm.passwordLabel}</FormLabel>
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
                              {translations.pharmacyRegForm.login.loginButton}
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
