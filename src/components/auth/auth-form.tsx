"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User, Mail, Phone, Calendar as CalendarIcon } from "lucide-react";
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
import { registerUser } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  fullName: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  phone: z.string().min(10, { message: 'Phone number must be at least 10 digits.' }),
  dob: z.date({
    required_error: "A date of birth is required.",
    invalid_type_error: "That's not a valid date!",
  }),
});

export function AuthForm() {
  const [startAnimation, setStartAnimation] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setStartAnimation(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      dob: undefined,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      if (value instanceof Date) {
        formData.append(key, value.toISOString());
      } else {
        formData.append(key, String(value));
      }
    });

    try {
      const result = await registerUser(formData);
      if (result?.error) {
        toast({
          title: "Registration Failed",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (e) {
      // The redirect in the server action will throw an error,
      // which is expected. We can safely ignore it.
    }
  };

  const { isSubmitting } = form.formState;

  return (
    <div className="w-full max-w-md mx-auto">
      <div
        className={cn(
          "text-center absolute left-1/2 -translate-x-1/2 transition-all duration-1000 ease-in-out",
          startAnimation ? "animate-header-center-to-top" : "top-1/2 -translate-y-1/2 scale-125"
        )}
      >
          <h1 className="text-4xl md:text-5xl font-bold">Create Account</h1>
          <p className="text-lg md:text-xl text-muted-foreground mt-2">
            Let's get you started with MediLink.
          </p>
      </div>

      {startAnimation && (
        <div className="w-full animate-content-fade-in" style={{ animationDelay: '0.5s', paddingTop: '18rem' }}>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FadeIn delay={600} direction="left">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg">Full Name</FormLabel>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <FormControl>
                          <Input className="pl-10 text-lg h-12" {...field} />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </FadeIn>

              <FadeIn delay={700} direction="right">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg">Email Address</FormLabel>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <FormControl>
                          <Input className="pl-10 text-lg h-12" {...field} />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </FadeIn>

              <FadeIn delay={800} direction="left">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg">Phone Number</FormLabel>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <FormControl>
                          <Input className="pl-10 text-lg h-12" {...field} />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </FadeIn>

              <FadeIn delay={900} direction="right">
                <FormField
                  control={form.control}
                  name="dob"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-lg">Date of Birth</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "pl-3 text-left font-normal text-lg h-12",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-5 w-5 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </FadeIn>
              
              <FadeIn delay={1000} direction="up">
                <Button type="submit" className="w-full text-lg h-14" disabled={isSubmitting}>
                  {isSubmitting ? "Registering..." : "Register & Continue"}
                </Button>
              </FadeIn>
            </form>
          </Form>
        </div>
      )}
    </div>
  );
}
