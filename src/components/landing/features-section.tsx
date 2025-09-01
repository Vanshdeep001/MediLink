import { FadeIn } from "@/components/fade-in";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Ambulance, Pill, Stethoscope } from "lucide-react";

const features = [
  {
    icon: <Stethoscope className="w-8 h-8 text-primary" />,
    title: "Doctor Connectivity",
    description: "Instantly find and connect with specialists and general practitioners in your area.",
  },
  {
    icon: <Pill className="w-8 h-8 text-primary" />,
    title: "Pharmacy Network",
    description: "Locate pharmacies, check medication availability, and manage prescriptions with ease.",
  },
  {
    icon: <Ambulance className="w-8 h-8 text-primary" />,
    title: "Emergency Services",
    description: "One-tap access to ambulance services with real-time location tracking for faster response.",
  },
];

export function FeaturesSection() {
  return (
    <section className="w-full py-24 md:py-32 bg-secondary/50 relative overflow-hidden">
        <div 
            className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
            style={{ willChange: 'transform' }}
        ></div>
        <div className="container mx-auto text-center">
            <FadeIn>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tighter">Everything You Need for Connected Care</h2>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                    MediLink provides a comprehensive suite of tools to manage your health journey.
                </p>
            </FadeIn>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                {features.map((feature, index) => (
                    <FadeIn key={feature.title} delay={index * 200}>
                        <Card className="h-full text-left bg-background/50 backdrop-blur-sm border-border/60 hover:border-primary/50 transition-colors duration-300">
                            <CardHeader>
                                <div className="mb-4">{feature.icon}</div>
                                <CardTitle>{feature.title}</CardTitle>
                                <CardDescription className="pt-2">{feature.description}</CardDescription>
                            </CardHeader>
                        </Card>
                    </FadeIn>
                ))}
            </div>
        </div>
    </section>
  );
}
