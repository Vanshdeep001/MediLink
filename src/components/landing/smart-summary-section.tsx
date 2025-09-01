"use client";

import { useState } from "react";
import { getResourceSummary } from "@/app/actions";
import { FadeIn } from "@/components/fade-in";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Bot, Link as LinkIcon, Loader2 } from "lucide-react";
import { Skeleton } from "../ui/skeleton";

const resources = [
  {
    name: "City General Hospital",
    description: "A leading hospital offering comprehensive medical services, including emergency care, specialized surgeries, and advanced diagnostics. Connects patients with top doctors and is a hub for ambulance dispatch.",
    link: "#",
  },
  {
    name: "Wellness Pharmacy Network",
    description: "A chain of pharmacies providing prescription fulfillment, over-the-counter medications, and health consultations. Integrates with doctor's prescriptions for seamless patient service.",
    link: "#",
  },
  {
    name: "Mobile Medics Ambulance Service",
    description: "A private ambulance service providing rapid emergency response. Works closely with hospitals to ensure timely patient transport and care.",
    link: "#",
  },
];

type SummaryState = {
  summary: string | null;
  link: string | null;
  isLoading: boolean;
};

export function SmartSummarySection() {
  const [selectedResourceIndex, setSelectedResourceIndex] = useState(0);
  const [summaryState, setSummaryState] = useState<SummaryState>({
    summary: null,
    link: null,
    isLoading: false,
  });
  const { toast } = useToast();

  const handleGenerateSummary = async (index: number) => {
    setSelectedResourceIndex(index);
    setSummaryState({ summary: null, link: null, isLoading: true });

    const resource = resources[index];
    const formData = new FormData();
    formData.append("resourceName", resource.name);
    formData.append("resourceDescription", resource.description);
    formData.append("resourceLink", resource.link);

    const result = await getResourceSummary(formData);

    if (result.error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.error,
      });
      setSummaryState({ summary: null, link: null, isLoading: false });
    } else {
      setSummaryState({
        summary: result.summary ?? null,
        link: resource.link,
        isLoading: false,
      });
    }
  };
  
  return (
    <section className="w-full py-24 md:py-32">
      <div className="container mx-auto">
        <FadeIn className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tighter">
            AI-Powered Resource Insights
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            Select a healthcare resource to generate a smart summary, detailing its role in the patient care ecosystem.
          </p>
        </FadeIn>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 mt-12 items-start">
          <FadeIn delay={200} className="space-y-4">
            {resources.map((resource, index) => (
              <Card 
                key={resource.name}
                className={`cursor-pointer transition-all duration-300 ${selectedResourceIndex === index ? 'border-primary shadow-lg' : 'border-border'}`}
                onClick={() => handleGenerateSummary(index)}
              >
                <CardHeader>
                  <CardTitle>{resource.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{resource.description}</p>
                </CardContent>
              </Card>
            ))}
          </FadeIn>

          <FadeIn delay={400}>
            <Card className="sticky top-24">
              <CardHeader className="flex flex-row items-center space-x-3">
                <Bot className="w-6 h-6 text-primary" />
                <CardTitle>Generated Summary</CardTitle>
              </CardHeader>
              <CardContent className="min-h-[200px]">
                {summaryState.isLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-8 w-1/2 mt-4" />
                  </div>
                ) : summaryState.summary ? (
                  <div>
                    <p className="text-foreground/90 whitespace-pre-wrap">{summaryState.summary}</p>
                    <Button variant="link" asChild className="mt-4 pl-0">
                      <a href={summaryState.link!} target="_blank" rel="noopener noreferrer">
                        Learn More <LinkIcon className="w-4 h-4 ml-2" />
                      </a>
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                    <p>Select a resource to see an AI-generated summary.</p>
                    <Button 
                      className="mt-4" 
                      onClick={() => handleGenerateSummary(selectedResourceIndex)}
                      disabled={summaryState.isLoading}
                    >
                      {summaryState.isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                      Generate Summary for {resources[selectedResourceIndex].name}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
