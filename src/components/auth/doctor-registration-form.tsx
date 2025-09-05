
"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User, Mail, Phone, Briefcase, Award, GraduationCap, UploadCloud, File, X, Lock } from "lucide-react";
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
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  fullName: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  phone: z.string().min(10, { message: 'Phone number must be at least 10 digits.' }),
  specialization: z.string().min(2, { message: 'Specialization is required.' }),
  experience: z.coerce.number().min(0, { message: 'Experience cannot be negative.' }),
  degree: z.string().min(2, { message: 'Medical degree is required.' }),
  licenseNumber: z.string().min(5, { message: 'A valid license number is required.' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters.' }),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export function DoctorRegistrationForm() {
  const [startAnimation, setStartAnimation] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
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
      specialization: "",
      experience: 0,
      degree: "",
      licenseNumber: "",
      password: "",
      confirmPassword: "",
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

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log({ ...values, files });
    toast({
      title: "Registration Submitted",
      description: "Your profile is under review. We will notify you upon verification.",
    });
    router.push("/doctor");
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        className={cn(
          "text-center absolute left-1/2 -translate-x-1/2 transition-all duration-1000 ease-in-out",
          startAnimation ? "top-[10rem] -translate-y-1/2" : "top-1/2 -translate-y-1/2 scale-125"
        )}
      >
        <h1 className="text-4xl md:text-5xl font-bold">Join as a Doctor</h1>
        <p className="text-lg md:text-xl text-muted-foreground mt-2">
          Complete your profile to start consulting patients.
        </p>
      </div>

      {startAnimation && (
        <div className="w-full animate-content-fade-in" style={{ animationDelay: '0.5s', paddingTop: '16rem' }}>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FadeIn delay={600} direction="left">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <FormControl><Input className="pl-10 h-12" {...field} /></FormControl>
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
                        <FormLabel>Email Address</FormLabel>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <FormControl><Input className="pl-10 h-12" {...field} /></FormControl>
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
                        <FormLabel>Phone Number</FormLabel>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <FormControl><Input className="pl-10 h-12" {...field} /></FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </FadeIn>
                <FadeIn delay={900} direction="right">
                   <FormField
                    control={form.control}
                    name="specialization"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Specialization</FormLabel>
                        <div className="relative">
                          <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <FormControl><Input className="pl-10 h-12" placeholder="e.g., Cardiology" {...field} /></FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </FadeIn>
                 <FadeIn delay={1000} direction="left">
                   <FormField
                    control={form.control}
                    name="experience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Years of Experience</FormLabel>
                        <div className="relative">
                          <Award className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <FormControl><Input type="number" className="pl-10 h-12" {...field} /></FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </FadeIn>
                <FadeIn delay={1100} direction="right">
                  <FormField
                    control={form.control}
                    name="degree"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Medical Degree</FormLabel>
                        <div className="relative">
                          <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <FormControl><Input className="pl-10 h-12" placeholder="e.g., MBBS, MD" {...field} /></FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </FadeIn>
                 <FadeIn delay={1200} direction="up" className="md:col-span-2">
                   <FormField
                    control={form.control}
                    name="licenseNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Medical License Number</FormLabel>
                        <FormControl><Input className="h-12" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </FadeIn>
              </div>

              <FadeIn delay={1300} direction="up">
                <div className="space-y-2">
                    <FormLabel>Upload Degree Photo</FormLabel>
                    <div className="relative border-2 border-dashed border-muted-foreground/30 rounded-xl p-8 flex flex-col items-center justify-center text-center">
                      <UploadCloud className="w-12 h-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground mb-2">Drag & drop file here or</p>
                      <Button type="button" variant="outline" size="sm" asChild>
                        <label htmlFor="file-upload" className="cursor-pointer">Browse File</label>
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
                <FadeIn delay={1400} direction="left">
                   <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <FormControl><Input type="password" className="pl-10 h-12" {...field} /></FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </FadeIn>
                <FadeIn delay={1500} direction="right">
                   <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
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
              
              <FadeIn delay={1600} direction="up">
                <Button type="submit" className="w-full text-lg h-14">
                  Submit for Verification
                </Button>
              </FadeIn>
            </form>
          </Form>
        </div>
      )}
    </div>
  );
}
