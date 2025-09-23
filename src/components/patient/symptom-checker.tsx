
'use client';

import React, { useState, useTransition, useContext, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, AlertTriangle, Lightbulb, ListChecks, Sparkles, HeartPulse, BrainCircuit } from 'lucide-react';
import { LanguageContext } from '@/context/language-context';
import { analyzeSymptoms, getAvailableAIServices, type SymptomAnalysisRequest, type SymptomAnalysisResponse } from '@/lib/ai-service';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { 
  getRecommendedDoctor, 
  getOTCMedicines, 
  analyzeSeverity,
  type Doctor,
  type OTCMedicine 
} from '@/lib/doctor-database';
import { 
  SeverityIndicator, 
  SuggestedDoctorCard, 
  OTCMedicines, 
  NextSteps 
} from './symptom-checker-components';

const formSchema = z.object({
  mainSymptom: z.string().min(3, { message: 'Please describe your symptom in more detail.' }),
  bodyPart: z.string({ required_error: 'Please select an affected body part.' }),
  duration: z.string().min(2, { message: 'Please specify the duration.' }),
  severity: z.enum(['Mild', 'Moderate', 'Severe'], { required_error: 'Please select a severity level.' }),
  additionalSymptoms: z.array(z.string()).default([]),
  additionalInfo: z.string().optional(),
});

type SymptomFormValues = z.infer<typeof formSchema>;
type SymptomAnalysis = SymptomAnalysisResponse;

const additionalSymptomOptions = [
  'Fever', 'Headache', 'Fatigue', 'Nausea', 'Cough',
  'Dizziness', 'Vomiting', 'Diarrhea', 'Abdominal Pain', 'Chest Pain',
  'Shortness of Breath', 'Muscle Pain', 'Joint Pain', 'Back Pain', 'Skin Rash',
  'Loss of Appetite', 'Sleep Problems', 'Anxiety', 'Sore Throat', 'Runny Nose',
  'Congestion', 'Heart Palpitations', 'Frequent Urination', 'Painful Urination', 'Swelling'
];

const getSymptomAnalysis = async (values: SymptomFormValues): Promise<{ result?: SymptomAnalysis; error?: string }> => {
  try {
    const request: SymptomAnalysisRequest = {
      mainSymptom: values.mainSymptom,
      bodyPart: values.bodyPart,
      duration: values.duration,
      severity: values.severity,
      additionalSymptoms: values.additionalSymptoms,
      additionalInfo: values.additionalInfo,
    };
    
    const result = await analyzeSymptoms(request);
    return { result };
  } catch (error) {
    console.error('AI analysis error:', error);
    return { error: "We couldn't analyze your symptoms at the moment. Please try again or consult a doctor." };
  }
};

export function SymptomChecker() {
  const [isPending, startTransition] = useTransition();
  const [analysis, setAnalysis] = useState<SymptomAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [availableAIServices, setAvailableAIServices] = useState<string[]>([]);
  const [recommendedDoctor, setRecommendedDoctor] = useState<Doctor | null>(null);
  const [otcMedicines, setOTCMedicines] = useState<OTCMedicine[]>([]);
  const [severityLevel, setSeverityLevel] = useState<'Mild' | 'Moderate' | 'Severe'>('Mild');
  const [formData, setFormData] = useState<SymptomFormValues | null>(null);
  const { translations } = useContext(LanguageContext);
  const router = useRouter();
  const { toast } = useToast();

  // Get available AI services on component mount
  useEffect(() => {
    setAvailableAIServices(getAvailableAIServices());
  }, []);

  const form = useForm<SymptomFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      additionalSymptoms: [],
      mainSymptom: '',
      duration: '',
      additionalInfo: '',
    },
  });

  const onSubmit = (values: SymptomFormValues) => {
    setError(null);
    setAnalysis(null);
    setFormData(values);
    
    startTransition(async () => {
      const response = await getSymptomAnalysis(values);
      if (response.error) {
        setError(response.error);
      } else if (response.result) {
        setAnalysis({
            conditions: response.result.conditions,
            recommendation: response.result.recommendation,
            seekHelp: response.result.seekHelp,
            advice: response.result.advice,
            confidence: response.result.confidence || 0.8,
            aiModel: response.result.aiModel || 'fallback',
        });
        
        // Analyze severity and get recommendations
        const allSymptoms = [
          values.mainSymptom,
          ...values.additionalSymptoms,
          values.bodyPart,
          values.duration
        ].filter(Boolean);
        
        const severity = analyzeSeverity(allSymptoms, values.severity);
        setSeverityLevel(severity);
        
        // Get recommended doctor
        const doctor = getRecommendedDoctor(allSymptoms, severity);
        setRecommendedDoctor(doctor);
        
        // Get OTC medicines for mild/moderate cases
        const medicines = getOTCMedicines(allSymptoms, severity);
        setOTCMedicines(medicines);
      }
    });
  };

  const resetChecker = () => {
    form.reset();
    setAnalysis(null);
    setError(null);
    setRecommendedDoctor(null);
    setOTCMedicines([]);
    setSeverityLevel('Mild');
    setFormData(null);
  };

  // Action handlers
  const handleCallDoctor = () => {
    if (recommendedDoctor) {
      // Integrate with existing video consultation
      toast({
        title: "Initiating Video Call",
        description: `Connecting to ${recommendedDoctor.name}...`,
      });
      // Navigate to video consultation with doctor
      router.push(`/patient/video-consultation?doctor=${recommendedDoctor.id}`);
    }
  };

  const handleBookConsultation = () => {
    router.push('/patient/video-consultation');
  };

  const handleOrderMedicines = () => {
    router.push('/patient?tab=order-medicines');
  };

  const handleViewHealthAdvice = () => {
    // Scroll to advice section or show in modal
    toast({
      title: "Health Advice",
      description: "Please refer to the 'Good Health Advice' section above.",
    });
  };

  return (
      <CardContent className="p-6 md:p-8">
        {/* AI Services Status */}
        <div className="mb-4 p-3 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-2 text-sm">
            <BrainCircuit className="w-4 h-4 text-primary" />
            <span className="font-medium">AI Services:</span>
            <span className="text-muted-foreground">{availableAIServices.join(', ')}</span>
          </div>
        </div>
        
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
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="mainSymptom"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Main Symptom</FormLabel>
                          <FormControl>
                            <Textarea rows={4} placeholder="Describe your main symptom in detail…" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                     <FormField
                      control={form.control}
                      name="bodyPart"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Affected Body Part</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value || ""}>
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
                            <FormControl>
                               <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="flex gap-4 pt-2"
                                >
                                <FormItem className="flex items-center space-x-2 space-y-0">
                                    <FormControl>
                                    <RadioGroupItem value="Mild" />
                                    </FormControl>
                                    <FormLabel className="font-normal">Mild</FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-2 space-y-0">
                                    <FormControl>
                                    <RadioGroupItem value="Moderate" />
                                    </FormControl>
                                    <FormLabel className="font-normal">Moderate</FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-2 space-y-0">
                                    <FormControl>
                                    <RadioGroupItem value="Severe" />
                                    </FormControl>
                                    <FormLabel className="font-normal">Severe</FormLabel>
                                </FormItem>
                                </RadioGroup>
                            </FormControl>
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
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
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

                  <Button type="submit" className="w-full h-12" disabled={isPending}>
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
              className="flex flex-col items-center justify-center text-center space-y-4 py-8 min-h-[400px]"
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
              className="flex flex-col items-center justify-center text-center space-y-4 py-8 min-h-[400px] text-destructive"
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
              className="space-y-6 min-h-[400px]"
            >
                <div className="text-center">
                    <Sparkles className="w-10 h-10 text-primary/80 mx-auto mb-2" />
                    <h3 className="text-2xl font-bold">Your AI Health Report</h3>
                    <p className="text-sm text-muted-foreground">This is not a medical diagnosis. Please consult a doctor.</p>
                    <div className="mt-2 flex items-center justify-center gap-4 text-xs text-muted-foreground">
                      <span>Powered by: {analysis.aiModel}</span>
                      <span>Confidence: {Math.round(analysis.confidence * 100)}%</span>
                    </div>
                </div>

                {/* Severity Indicator */}
                <SeverityIndicator severity={severityLevel} />

                <div className="space-y-4">
                   <div className="p-4 bg-muted/50 rounded-lg">
                        <h4 className="font-semibold flex items-center gap-2"><ListChecks className="text-primary"/> Possible Conditions</h4>
                        <ul className="list-disc list-inside pl-2 mt-2 text-sm space-y-1">
                            {analysis.conditions.map((item, i) => <li key={i}>{item}</li>)}
                        </ul>
                   </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                        <h4 className="font-semibold flex items-center gap-2"><Lightbulb className="text-primary"/> Recommendations</h4>
                         <p className="mt-2 text-sm">{analysis.recommendation}</p>
                   </div>
                   <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                        <h4 className="font-semibold flex items-center gap-2 text-destructive"><AlertTriangle/> When to Seek Medical Help</h4>
                        <p className="mt-2 text-sm text-destructive/90">{analysis.seekHelp}</p>
                   </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                        <h4 className="font-semibold flex items-center gap-2"><HeartPulse className="text-primary"/> Good Health Advice</h4>
                        <p className="mt-2 text-sm">{analysis.advice}</p>
                   </div>
                </div>

                {/* Suggested Doctor */}
                {recommendedDoctor && (
                  <SuggestedDoctorCard 
                    doctor={recommendedDoctor} 
                    onCallNow={handleCallDoctor}
                  />
                )}

                {/* OTC Medicines */}
                <OTCMedicines medicines={otcMedicines} />

                {/* Next Steps */}
                <NextSteps 
                  severity={severityLevel}
                  hasDoctor={!!recommendedDoctor}
                  hasMedicines={otcMedicines.length > 0}
                  onBookConsultation={handleBookConsultation}
                  onOrderMedicines={handleOrderMedicines}
                  onViewHealthAdvice={handleViewHealthAdvice}
                />

                <Button onClick={resetChecker} className="w-full h-12">Start a New Check</Button>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
  );
}
