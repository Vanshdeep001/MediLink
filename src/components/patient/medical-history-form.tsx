"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
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
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { UploadCloud, File, X, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const conditions = [
  { id: "diabetes", label: "Diabetes" },
  { id: "hypertension", label: "Hypertension" },
  { id: "heart_disease", label: "Heart Disease" },
  { id: "asthma", label: "Asthma" },
  { id: "none", label: "None" },
] as const;

const formSchema = z.object({
  preExistingConditions: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: "You have to select at least one item.",
  }),
  medications: z.enum(["yes", "no"]),
  medicationsList: z.string().optional(),
  allergies: z.enum(["yes", "no"]),
  allergiesList: z.string().optional(),
  familyHistory: z.enum(["yes", "no"]),
  familyHistoryDetails: z.string().optional(),
  otherNotes: z.string().optional(),
});

export function MedicalHistoryForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [files, setFiles] = useState<File[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      preExistingConditions: [],
      medications: "no",
      medicationsList: "",
      allergies: "no",
      allergiesList: "",
      familyHistory: "no",
      familyHistoryDetails: "",
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

  return (
    <Card className="shadow-lg animate-content-fade-in" style={{ animationDelay: '0.5s' }}>
      <CardContent className="p-6 md:p-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="preExistingConditions"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-lg font-semibold">Do you have any pre-existing conditions?</FormLabel>
                    <FormDescription>Select all that apply.</FormDescription>
                  </div>
                  {conditions.map((item) => (
                    <FormField
                      key={item.id}
                      control={form.control}
                      name="preExistingConditions"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={item.id}
                            className="flex flex-row items-start space-x-3 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(item.id)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...field.value, item.id])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== item.id
                                        )
                                      );
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">{item.label}</FormLabel>
                          </FormItem>
                        );
                      }}
                    />
                  ))}
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Separator />

            <FormField
              control={form.control}
              name="medications"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-lg font-semibold">Are you currently on any medications?</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl><RadioGroupItem value="no" /></FormControl>
                        <FormLabel className="font-normal">No</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl><RadioGroupItem value="yes" /></FormControl>
                        <FormLabel className="font-normal">Yes</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {form.watch("medications") === "yes" && (
              <FormField
                control={form.control}
                name="medicationsList"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Please list your medications</FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g., Aspirin, Metformin" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <Separator />
            
            <FormField
              control={form.control}
              name="allergies"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-lg font-semibold">Do you have any allergies?</FormLabel>
                   <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl><RadioGroupItem value="no" /></FormControl>
                        <FormLabel className="font-normal">No</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl><RadioGroupItem value="yes" /></FormControl>
                        <FormLabel className="font-normal">Yes</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.watch("allergies") === "yes" && (
              <FormField
                control={form.control}
                name="allergiesList"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Please list your allergies</FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g., Peanuts, Penicillin" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            <Separator />
            
            <FormField
              control={form.control}
              name="familyHistory"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-lg font-semibold">Do you have a family history of major diseases?</FormLabel>
                   <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl><RadioGroupItem value="no" /></FormControl>
                        <FormLabel className="font-normal">No</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl><RadioGroupItem value="yes" /></FormControl>
                        <FormLabel className="font-normal">Yes</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.watch("familyHistory") === "yes" && (
              <FormField
                control={form.control}
                name="familyHistoryDetails"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Please provide details</FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g., Heart disease in family" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

             <Separator />
            
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
                                        <span className="text-sm">{file.name}</span>
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


            <div className="pt-6 text-right">
                <Button type="submit" size="lg" className="w-full md:w-auto">
                    Complete Profile & Continue
                </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
