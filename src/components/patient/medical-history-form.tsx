
"use client";

import { useState, useContext } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { UploadCloud, File, X, Info, ArrowLeft, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { LanguageContext } from "@/context/language-context";
import { ensurePatientRecord } from "@/lib/dhidService";

const formSchema = z.object({
  preExistingConditions: z.string().optional(),
  medications: z.string().optional(),
  allergies: z.string().optional(),
  familyHistory: z.string().optional(),
  otherNotes: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  pinCode: z.string().optional(),
});

export function MedicalHistoryForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const { translations } = useContext(LanguageContext);

  const formSteps = [
    { id: 'conditions', title: translations.medicalHistory.conditions },
    { id: 'medications', title: translations.medicalHistory.medications },
    { id: 'allergies', title: translations.medicalHistory.allergies },
    { id: 'familyHistory', title: translations.medicalHistory.familyHistory },
    { id: 'address', title: translations.medicalHistory.address },
    { id: 'reports', title: translations.medicalHistory.reports }
  ];

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      preExistingConditions: "",
      medications: "",
      allergies: "",
      familyHistory: "",
      otherNotes: "",
      address: "",
      city: "",
      pinCode: "",
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
    try {
      const userString = localStorage.getItem('temp_user');
      if (userString) {
        const user = JSON.parse(userString);
        const name: string = user.fullName || 'Patient';
        const dobDate: Date | string = user.dob;
        const dobStr = typeof dobDate === 'string' ? new Date(dobDate).toISOString().slice(0,10) : new Date(dobDate).toISOString().slice(0,10);
        const id: string = user.phone ? `PAT-${user.phone}` : `PAT-${Date.now()}`;
        const medicalHistory: string[] = [
          values.preExistingConditions,
          values.medications,
          values.allergies,
          values.familyHistory,
          values.otherNotes,
        ].filter(Boolean) as string[];

        const record = ensurePatientRecord({ id, name, dob: dobStr, medicalHistory });
        localStorage.setItem('dhid_last_issued_for', record.id);
      }
    } catch (e) {
      // Non-blocking alert if DHID fails
      toast({
        title: 'Digital Health ID',
        description: 'Digital Health ID could not be generated. Please retry.',
      });
    }

    toast({
      title: translations.medicalHistory.toastTitle,
      description: translations.medicalHistory.toastDescription,
    });
    router.push("/patient");
  };
  
  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, formSteps.length - 1));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0));

  const progress = ((currentStep + 1) / formSteps.length) * 100;

  return (
    <Card className="shadow-lg animate-content-fade-in w-full" style={{ animationDelay: '0.5s' }}>
      <CardHeader>
        <div className="mb-4">
          <Progress value={progress} className="w-full h-2" />
          <p className="text-sm text-muted-foreground mt-2 text-center">
            {translations.medicalHistory.step} {currentStep + 1} {translations.medicalHistory.of} {formSteps.length}: {formSteps[currentStep].title}
          </p>
        </div>
      </CardHeader>
      <CardContent className="p-6 md:p-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                {currentStep === 0 && (
                  <FormField
                    control={form.control}
                    name="preExistingConditions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-lg font-semibold">{translations.medicalHistory.conditionsLabel}</FormLabel>
                        <FormDescription>{translations.medicalHistory.conditionsDescription}</FormDescription>
                        <FormControl>
                          <Textarea placeholder={translations.medicalHistory.conditionsPlaceholder} {...field} rows={4} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                {currentStep === 1 && (
                  <FormField
                    control={form.control}
                    name="medications"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-lg font-semibold">{translations.medicalHistory.medicationsLabel}</FormLabel>
                        <FormDescription>{translations.medicalHistory.medicationsDescription}</FormDescription>
                        <FormControl>
                          <Textarea placeholder={translations.medicalHistory.medicationsPlaceholder} {...field} rows={4} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                {currentStep === 2 && (
                  <FormField
                    control={form.control}
                    name="allergies"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-lg font-semibold">{translations.medicalHistory.allergiesLabel}</FormLabel>
                        <FormDescription>{translations.medicalHistory.allergiesDescription}</FormDescription>
                        <FormControl>
                          <Textarea placeholder={translations.medicalHistory.allergiesPlaceholder} {...field} rows={4} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                {currentStep === 3 && (
                   <FormField
                    control={form.control}
                    name="familyHistory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-lg font-semibold">{translations.medicalHistory.familyHistoryLabel}</FormLabel>
                        <FormDescription>{translations.medicalHistory.familyHistoryDescription}</FormDescription>
                        <FormControl>
                          <Textarea placeholder={translations.medicalHistory.familyHistoryPlaceholder} {...field} rows={4} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-lg font-semibold">{translations.medicalHistory.addressLabel}</FormLabel>
                          <FormDescription>{translations.medicalHistory.addressDescription}</FormDescription>
                           <div className="relative">
                            <MapPin className="absolute left-3 top-5 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <FormControl><Textarea className="pl-10" rows={3} placeholder={translations.medicalHistory.addressPlaceholder} {...field} /></FormControl>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{translations.medicalHistory.cityLabel}</FormLabel>
                            <FormControl><Input placeholder="e.g. Nabha" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                       <FormField
                        control={form.control}
                        name="pinCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{translations.medicalHistory.pinCodeLabel}</FormLabel>
                            <FormControl><Input placeholder="e.g. 147201" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                     </div>
                  </div>
                )}
                {currentStep === 5 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold">{translations.medicalHistory.reportsLabel}</h3>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="w-4 h-4 text-muted-foreground cursor-pointer" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{translations.medicalHistory.reportsTooltip}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <FormDescription>{translations.medicalHistory.reportsDescription}</FormDescription>
                    <div className="relative border-2 border-dashed border-muted-foreground/30 rounded-xl p-8 flex flex-col items-center justify-center text-center">
                      <UploadCloud className="w-12 h-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground mb-2">{translations.medicalHistory.dragDrop}</p>
                      <Button type="button" variant="outline" size="sm" asChild>
                        <label htmlFor="file-upload" className="cursor-pointer">
                          {translations.medicalHistory.browse}
                        </label>
                      </Button>
                      <Input id="file-upload" type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" multiple onChange={handleFileChange} accept=".pdf,.jpg,.jpeg,.png" />
                    </div>
                    
                    {files.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-medium">{translations.medicalHistory.uploadedFiles}</h4>
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
                )}
              </motion.div>
            </AnimatePresence>

            <div className="pt-6 flex justify-between items-center">
              {currentStep > 0 ? (
                <Button type="button" variant="outline" onClick={prevStep}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {translations.medicalHistory.back}
                </Button>
              ) : <div></div>}

              {currentStep < formSteps.length - 1 ? (
                <Button type="button" size="lg" onClick={nextStep}>
                  {translations.medicalHistory.next}
                </Button>
              ) : (
                <Button type="submit" size="lg">
                  {translations.medicalHistory.complete}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
