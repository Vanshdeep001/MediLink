
"use client";

import { useEffect, useState, useContext } from "react";
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
import { FadeIn } from "../fade-in";
import { useToast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { LanguageContext } from "@/context/language-context";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const registrationSchema = z.object({
  fullName: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  phone: z.string().min(10, { message: 'Phone number must be at least 10 digits.' }),
  dob: z.date({
    required_error: "A date of birth is required.",
    invalid_type_error: "That's not a valid date!",
  }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters.' }),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const loginSchema = z.object({
  fullName: z.string().min(2, { message: 'Name is required.' }),
  phone: z.string().min(10, { message: 'Phone number is required.' }),
  password: z.string().min(8, { message: 'Password is required.' }),
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
  const [startAnimation, setStartAnimation] = useState(false);
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
      dob: undefined,
      password: "",
      confirmPassword: "",
    },
  });

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      password: "",
    },
  });

  const onRegisterSubmit = (values: z.infer<typeof registrationSchema>) => {
    try {
      const age = calculateAge(values.dob);
      const user = { ...values, age };
      localStorage.setItem('temp_user', JSON.stringify(user));
      
      const usersString = localStorage.getItem('users_list');
      const users = usersString ? JSON.parse(usersString) : [];
      users.push(user);
      localStorage.setItem('users_list', JSON.stringify(users));

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
  
  const onLoginSubmit = (values: z.infer<typeof loginSchema>) => {
    const usersString = localStorage.getItem('users_list');
    const users = usersString ? JSON.parse(usersString) : [];
    
    const foundUser = users.find(
      (u: any) =>
        u.fullName.toLowerCase() === values.fullName.toLowerCase() &&
        u.phone === values.phone &&
        u.password === values.password
    );

    if (foundUser) {
      localStorage.setItem('temp_user', JSON.stringify(foundUser));
      toast({
        title: translations.authForm.login.toastSuccessTitle,
        description: translations.authForm.login.toastSuccessDescription,
      });
      router.push(foundUser.role === 'patient' ? '/patient' : '/doctor');
    } else {
       toast({
        title: translations.authForm.login.toastErrorTitle,
        description: translations.authForm.login.toastErrorDescription,
        variant: "destructive",
      });
    }
  };


  return (
    <div className="w-full max-w-md mx-auto">
      <div
        className={cn(
          "text-center absolute left-1/2 -translate-x-1/2 transition-all duration-1000 ease-in-out",
          startAnimation ? "top-[10rem] -translate-y-1/2" : "top-1/2 -translate-y-1/2 scale-125"
        )}
      >
          <h1 className="text-4xl md:text-5xl font-bold">{translations.authForm.title}</h1>
          <p className="text-lg md:text-xl text-muted-foreground mt-2">
            {translations.authForm.subtitle}
          </p>
      </div>

      {startAnimation && (
        <div className="w-full animate-content-fade-in" style={{ animationDelay: '0.5s', paddingTop: '16rem' }}>
           <Tabs defaultValue="register" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="register">{translations.authForm.tabs.register}</TabsTrigger>
              <TabsTrigger value="login">{translations.authForm.tabs.login}</TabsTrigger>
            </TabsList>
            <TabsContent value="register" className="mt-6">
                <Form {...registrationForm}>
                  <form onSubmit={registrationForm.handleSubmit(onRegisterSubmit)} className="space-y-6">
                    <FadeIn delay={100} direction="left">
                      <FormField
                        control={registrationForm.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-lg">{translations.authForm.fullNameLabel}</FormLabel>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                              <FormControl><Input className="pl-10 text-lg h-12" {...field} /></FormControl>
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
                            <FormLabel className="text-lg">{translations.authForm.emailLabel}</FormLabel>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                              <FormControl><Input className="pl-10 text-lg h-12" {...field} /></FormControl>
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
                            <FormLabel className="text-lg">{translations.authForm.phoneLabel}</FormLabel>
                            <div className="relative">
                              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                              <FormControl><Input className="pl-10 text-lg h-12" {...field} /></FormControl>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </FadeIn>
                    <FadeIn delay={400} direction="right">
                      <FormField
                        control={registrationForm.control}
                        name="dob"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel className="text-lg">{translations.authForm.dobLabel}</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button variant={"outline"} className={cn("pl-3 text-left font-normal text-lg h-12", !field.value && "text-muted-foreground")}>
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
                     <FadeIn delay={500} direction="left">
                      <FormField
                        control={registrationForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-lg">{translations.authForm.passwordLabel}</FormLabel>
                             <div className="relative">
                              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                              <FormControl><Input type="password" className="pl-10 text-lg h-12" {...field} /></FormControl>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </FadeIn>
                     <FadeIn delay={600} direction="right">
                      <FormField
                        control={registrationForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-lg">{translations.authForm.confirmPasswordLabel}</FormLabel>
                             <div className="relative">
                              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                              <FormControl><Input type="password" className="pl-10 text-lg h-12" {...field} /></FormControl>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </FadeIn>
                    <FadeIn delay={700} direction="up">
                      <Button type="submit" className="w-full text-lg h-14">
                        {translations.authForm.submitButton}
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
                              <FormLabel className="text-lg">{translations.authForm.fullNameLabel}</FormLabel>
                              <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <FormControl><Input className="pl-10 text-lg h-12" {...field} /></FormControl>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </FadeIn>
                      <FadeIn delay={200} direction="up">
                        <FormField
                          control={loginForm.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-lg">{translations.authForm.phoneLabel}</FormLabel>
                              <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <FormControl><Input className="pl-10 text-lg h-12" {...field} /></FormControl>
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
                              <FormLabel className="text-lg">{translations.authForm.passwordLabel}</FormLabel>
                              <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <FormControl><Input type="password" className="pl-10 text-lg h-12" {...field} /></FormControl>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </FadeIn>
                      <FadeIn delay={400} direction="up">
                          <Button type="submit" className="w-full text-lg h-14">
                            {translations.authForm.login.loginButton}
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
