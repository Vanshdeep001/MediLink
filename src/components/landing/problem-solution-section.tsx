
'use client';

import { Stethoscope, Pill, Siren, AlertTriangle, CheckCircle, BrainCircuit, Truck } from 'lucide-react';
import TextFlipper from '../ui/text-effect-flipper';
import { FadeIn } from '../fade-in';
import { Card, CardContent } from '../ui/card';
import { Separator } from '../ui/separator';

export function ProblemSolutionSection() {
  const challenges = [
    {
      problemIcon: <AlertTriangle className="w-10 h-10 text-destructive/80" />,
      problemTitle: 'Lack of Nearby Doctors',
      problemDescription: 'Access to specialized medical consultation is limited and often requires long travel.',
      solutionIcon: <BrainCircuit className="w-10 h-10 text-primary" />,
      solutionTitle: 'AI + Teleconsultation',
      solutionDescription: 'Get instant AI-driven preliminary diagnoses and connect with certified doctors via video call, anytime.'
    },
    {
      problemIcon: <AlertTriangle className="w-10 h-10 text-destructive/80" />,
      problemTitle: 'Unavailable Medicines',
      problemDescription: 'Local pharmacies often run out of essential medicines, causing treatment delays.',
      solutionIcon: <Truck className="w-10 h-10 text-primary" />,
      solutionTitle: 'Local Pharmacy Network',
      solutionDescription: 'Check medicine availability in real-time across multiple local pharmacies and get them delivered.'
    },
    {
      problemIcon: <AlertTriangle className="w-10 h-10 text-destructive/80" />,
      problemTitle: 'Emergency Delays',
      problemDescription: 'Critical time is lost during medical emergencies due to a lack of immediate response.',
      solutionIcon: <Siren className="w-10 h-10 text-primary" />,
      solutionTitle: 'SOS Emergency Button',
      solutionDescription: 'Our one-tap SOS feature instantly alerts the nearest ambulance and healthcare providers for a rapid response.'
    },
  ];

  return (
    <section className="py-20 md:py-32 bg-[hsl(224,71%,10%)] text-white">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            <TextFlipper>Bridging the</TextFlipper>{' '}
            <TextFlipper
              delay={0.2}
              className="font-cursive text-primary"
            >
              Healthcare Gap
            </TextFlipper>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            How MediLink addresses the core challenges of rural healthcare.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {challenges.map((item, index) => (
            <FadeIn key={index} delay={200 * (index + 1)} direction="up">
              <Card className="group bg-card h-full flex flex-col transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/10">
                <CardContent className="p-6 text-center flex flex-col items-center">
                  {/* Problem Section */}
                  <div className="flex flex-col items-center">
                    {item.problemIcon}
                    <h3 className="mt-4 text-xl font-semibold text-destructive/80">{item.problemTitle}</h3>
                    <p className="mt-2 text-sm text-muted-foreground h-16">{item.problemDescription}</p>
                  </div>
                  
                  <Separator className="my-6" />

                  {/* Solution Section */}
                  <div className="flex flex-col items-center">
                     <div className="relative mb-4">
                        {item.solutionIcon}
                        <CheckCircle className="absolute -bottom-1 -right-1 w-5 h-5 text-green-500 bg-card rounded-full" />
                     </div>
                    <h3 className="text-xl font-bold text-primary">{item.solutionTitle}</h3>
                    <p className="mt-2 text-sm text-muted-foreground h-16">{item.solutionDescription}</p>
                  </div>

                </CardContent>
              </Card>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
