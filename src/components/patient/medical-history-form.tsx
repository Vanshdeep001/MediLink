
"use client";

import { useState } from "react";
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { UploadCloud, File, X, Info, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";

const formSchema = z.object({
  preExistingConditions: z.string().optional(),
  medications: z.string().optional(),
  allergies: z.string().optional(),
  familyHistory: z.string().optional(),
  otherNotes: z.string().optional(),
});

const formSteps = [
  { id: 'conditions', title: 'Pre-existing Conditions' },
  { id: 'medications', title: 'Current Medications' },
  { id: 'allergies', title: 'Allergies' },
  { id: 'familyHistory', title: 'Family History' },
  { id: 'reports', title: 'Medical Reports' }
];

export function MedicalHistoryForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [currentStep, setCurrentStep] = useState(0);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      preExistingConditions: "",
      medications: "",
      allergies: "",
      familyHistory: "",
      otherNotes: "",
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
      title: "Profile Updated!",
      description: "Thanks for sharing. Your health profile is ready.",
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
            Step {currentStep + 1} of {formSteps.length}: {formSteps[currentStep].title}
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
                        <FormLabel className="text-lg font-semibold">Do you have any pre-existing conditions?</FormLabel>
                        <FormDescription>List any chronic or significant health issues you have.</FormDescription>
                        <FormControl>
                          <Textarea placeholder="e.g., Diabetes, Migraine, Thyroid disorder" {...field} rows={4} />
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
                        <FormLabel className="text-lg font-semibold">Are you currently taking any medications?</FormLabel>
                        <FormDescription>Please include the name, dosage, and frequency.</FormDescription>
                        <FormControl>
                          <Textarea placeholder="e.g., Metformin 500mg twice daily, Aspirin 81mg once daily" {...field} rows={4} />
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
                        <FormLabel className="text-lg font-semibold">Do you have any allergies?</FormLabel>
                        <FormDescription>Include medications, food, or environmental allergies.</FormDescription>
                        <FormControl>
                          <Textarea placeholder="e.g., Penicillin (rash), Peanuts (anaphylaxis), Pollen (hay fever)" {...field} rows={4} />
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
                        <FormLabel className="text-lg font-semibold">Is there a family history of major diseases?</FormLabel>
                        <FormDescription>Mention any significant health issues in your immediate family.</FormDescription>
                        <FormControl>
                          <Textarea placeholder="e.g., Heart disease (father), Diabetes (mother), Cancer (sibling)" {...field} rows={4} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                {currentStep === 4 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold">Upload Medical Reports</h3>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="w-4 h-4 text-muted-foreground cursor-pointer" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Your data is stored securely and only shared with your doctor.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <FormDescription>Upload lab reports, prescriptions, or past diagnoses here.</FormDescription>
                    <div className="relative border-2 border-dashed border-muted-foreground/30 rounded-xl p-8 flex flex-col items-center justify-center text-center">
                      <UploadCloud className="w-12 h-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground mb-2">Drag & drop files here or</p>
                      <Button type="button" variant="outline" size="sm" asChild>
                        <label htmlFor="file-upload" className="cursor-pointer">
                          Browse Files
                        </label>
                      </Button>
                      <Input id="file-upload" type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" multiple onChange={handleFileChange} accept=".pdf,.jpg,.jpeg,.png" />
                    </div>
                    
                    {files.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-medium">Uploaded Files:</h4>
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
                  Back
                </Button>
              ) : <div></div>}

              {currentStep < formSteps.length - 1 ? (
                <Button type="button" size="lg" onClick={nextStep}>
                  Next
                </Button>
              ) : (
                <Button type="submit" size="lg">
                  Complete Profile & Continue
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
