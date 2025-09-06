
'use client';

import { useState, useTransition, useContext } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AnimatePresence, motion } from 'framer-motion';
import { CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { getSymptomAnalysis } from '@/app/actions';
import type { SymptomCheckerOutput } from '@/ai/flows/symptom-checker-flow';
import { Loader2, AlertTriangle, Lightbulb, ListChecks, Sparkles, HeartPulse } from 'lucide-react';
import { LanguageContext } from '@/context/language-context';

const formSchema = z.object({
  mainSymptom: z.string().min(5, { message: 'Please describe your symptom in more detail.' }),
  bodyPart: z.string({ required_error: 'Please select an affected body part.' }),
  duration: z.string().min(2, { message: 'Please specify the duration.' }),
  severity: z.enum(['Mild', 'Moderate', 'Severe']),
  additionalSymptoms: z.array(z.string()).default([]),
  additionalInfo: z.string().optional(),
});

type SymptomFormValues = z.infer<typeof formSchema>;

const additionalSymptomOptions = ['Fever', 'Headache', 'Fatigue', 'Nausea', 'Cough', 'Dizziness'];

export function SymptomChecker() {
  const [isPending, startTransition] = useTransition();
  const [analysis, setAnalysis] = useState<SymptomCheckerOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { translations } = useContext(LanguageContext);

  const form = useForm<SymptomFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      additionalSymptoms: [],
    },
  });

  const onSubmit = (values: SymptomFormValues) => {
    setError(null);
    setAnalysis(null);
    startTransition(async () => {
      const response = await getSymptomAnalysis(values);
      if (response.error) {
        setError(response.error);
      } else {
        setAnalysis(response.result!);
      }
    });
  };

  const resetChecker = () => {
    form.reset({ additionalSymptoms: [] });
    setAnalysis(null);
    setError(null);
  }

  return (
    <>
      <CardHeader>
        <div className="flex items-center gap-3">
            <HeartPulse className="w-8 h-8 text-primary" />
            <div>
                <CardTitle>{translations.patientDashboard.symptomChecker}</CardTitle>
                <CardDescription>{translations.patientDashboard.symptomCheckerDesc}</CardDescription>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <AnimatePresence mode="wait">
          {!analysis && !isPending && !error && (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.3 }}
            >
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="mainSymptom"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Main Symptom</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Describe your main symptom in detail…" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <FormField
                      control={form.control}
                      name="bodyPart"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Affected Body Part</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a body part" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="Head">Head</SelectItem>
                                    <SelectItem value="Chest">Chest</SelectItem>
                                    <SelectItem value="Stomach">Stomach</SelectItem>
                                    <SelectItem value="Back">Back</SelectItem>
                                    <SelectItem value="Legs">Legs</SelectItem>
                                    <SelectItem value="Arms">Arms</SelectItem>
                                    <SelectItem value="Skin">Skin</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="duration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Duration of Symptom</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., 3 days, 2 weeks…" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                   <FormField
                      control={form.control}
                      name="severity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Severity Level</FormLabel>
                             <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select severity" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="Mild">Mild</SelectItem>
                                    <SelectItem value="Moderate">Moderate</SelectItem>
                                    <SelectItem value="Severe">Severe</SelectItem>
                                </SelectContent>
                            </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                        control={form.control}
                        name="additionalSymptoms"
                        render={() => (
                            <FormItem>
                                <div className="mb-4">
                                    <FormLabel className="text-base">Additional Symptoms</FormLabel>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {additionalSymptomOptions.map((item) => (
                                    <FormField
                                    key={item}
                                    control={form.control}
                                    name="additionalSymptoms"
                                    render={({ field }) => {
                                        return (
                                        <FormItem
                                            key={item}
                                            className="flex flex-row items-start space-x-3 space-y-0"
                                        >
                                            <FormControl>
                                            <Checkbox
                                                checked={field.value?.includes(item)}
                                                onCheckedChange={(checked) => {
                                                return checked
                                                    ? field.onChange([...field.value, item])
                                                    : field.onChange(
                                                        field.value?.filter(
                                                        (value) => value !== item
                                                        )
                                                    )
                                                }}
                                            />
                                            </FormControl>
                                            <FormLabel className="font-normal">
                                            {item}
                                            </FormLabel>
                                        </FormItem>
                                        )
                                    }}
                                    />
                                ))}
                                </div>
                            </FormItem>
                        )}
                    />
                     <FormField
                      control={form.control}
                      name="additionalInfo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Additional Information</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Add anything else we should know…" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                  <Button type="submit" className="w-full" disabled={isPending}>
                    Analyze Symptoms
                  </Button>
                </form>
              </Form>
            </motion.div>
          )}

          {isPending && (
             <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center text-center space-y-4 py-8"
            >
              <Loader2 className="w-12 h-12 animate-spin text-primary" />
              <p className="font-semibold text-muted-foreground">Analyzing your symptoms...</p>
              <p className="text-sm text-muted-foreground/80">Please wait while our AI assistant prepares your report.</p>
            </motion.div>
          )}
          
          {error && (
             <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center text-center space-y-4 py-8 text-destructive"
            >
                <AlertTriangle className="w-12 h-12" />
                <p className="font-semibold">Analysis Failed</p>
                <p className="text-sm">{error}</p>
                <Button variant="outline" onClick={resetChecker}>Try Again</Button>
            </motion.div>
          )}
          
          {analysis && (
             <motion.div
              key="analysis"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
                <div className="text-center">
                    <Sparkles className="w-10 h-10 text-primary/80 mx-auto mb-2" />
                    <h3 className="text-2xl font-bold">Your AI Health Report</h3>
                    <p className="text-sm text-muted-foreground">This is not a medical diagnosis. Please consult a doctor.</p>
                </div>

                <div className="space-y-4">
                   <div className="p-4 bg-muted/50 rounded-lg">
                        <h4 className="font-semibold flex items-center gap-2"><ListChecks className="text-primary"/> Possible Conditions</h4>
                        <ul className="list-disc list-inside pl-2 mt-2 text-sm space-y-1">
                            {analysis.possibleConditions.map((item, i) => <li key={i}>{item}</li>)}
                        </ul>
                   </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                        <h4 className="font-semibold flex items-center gap-2"><Lightbulb className="text-primary"/> Recommendations</h4>
                        <ul className="list-disc list-inside pl-2 mt-2 text-sm space-y-1">
                            {analysis.recommendations.map((item, i) => <li key={i}>{item}</li>)}
                        </ul>
                   </div>
                   <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                        <h4 className="font-semibold flex items-center gap-2 text-destructive"><AlertTriangle/> When to Seek Medical Help</h4>
                        <ul className="list-disc list-inside pl-2 mt-2 text-sm space-y-1 text-destructive/90">
                            {analysis.whenToSeekHelp.map((item, i) => <li key={i}>{item}</li>)}
                        </ul>
                   </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                        <h4 className="font-semibold flex items-center gap-2"><HeartPulse className="text-primary"/> Good Health Advice</h4>
                        <p className="mt-2 text-sm">{analysis.goodHealthAdvice}</p>
                   </div>
                </div>

                <Button onClick={resetChecker} className="w-full">Start a New Check</Button>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </>
  );
}
