
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { FadeIn } from '../fade-in';
import { useRouter } from 'next/navigation';
import { PatientIcon } from './icons/patient-icon';
import { DoctorIcon } from './icons/doctor-icon';
import { PharmacyIcon } from './icons/pharmacy-icon';

type Role = 'patient' | 'doctor' | 'pharmacy';

const roles = [
  { 
    id: 'patient' as Role, 
    label: 'Patient', 
    icon: PatientIcon,
    description: 'Consult doctors & manage health records'
  },
  { 
    id: 'doctor' as Role, 
    label: 'Doctor', 
    icon: DoctorIcon,
    description: 'Provide consultations and e-prescriptions'
  },
  { 
    id: 'pharmacy' as Role, 
    label: 'Pharmacy', 
    icon: PharmacyIcon,
    description: 'Manage medicine stock and deliveries'
  },
];

export function RoleSelectionForm() {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
  };

  const handleSubmit = () => {
    if (!selectedRole) {
      toast({
        title: "Selection Required",
        description: "Please select a role to continue.",
        variant: "destructive",
      });
      return;
    }

    try {
      const userString = localStorage.getItem('temp_user');
      if (userString) {
        const user = JSON.parse(userString);
        user.role = selectedRole;
        localStorage.setItem('temp_user', JSON.stringify(user));
        router.push(`/${selectedRole}`);
      } else {
        toast({
          title: "Error",
          description: "User data not found. Please register again.",
          variant: "destructive",
        });
        router.push('/auth');
      }
    } catch (error) {
        toast({
          title: "Error",
          description: "Failed to save role. Please try again.",
          variant: "destructive",
        });
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto pt-24 md:pt-16">
      <FadeIn delay={100}>
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-green-400">
            Are you joining as a...
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mt-2">
            Choose your role to get a personalized experience.
          </p>
        </div>
      </FadeIn>
      <div className="w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {roles.map((role, index) => (
            <FadeIn key={role.id} delay={200 + index * 100} direction="up">
              <Card
                className={cn(
                  "cursor-pointer transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/20",
                  "border-2",
                  selectedRole === role.id 
                    ? "ring-4 ring-primary ring-offset-4 ring-offset-background shadow-2xl shadow-primary/30 -translate-y-2" 
                    : "border-transparent hover:border-primary/50"
                )}
                onClick={() => handleRoleSelect(role.id)}
              >
                <CardContent className={cn("p-6 md:p-8 flex flex-col items-center justify-center text-center transition-opacity duration-300",
                    selectedRole && selectedRole !== role.id ? "opacity-50" : "opacity-100"
                )}>
                  <div className="w-32 h-32 md:w-40 md:h-40 mb-6">
                    <role.icon />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-semibold">{role.label}</h3>
                  <p className="text-muted-foreground mt-2">{role.description}</p>
                </CardContent>
              </Card>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={600} direction="up" className="mt-16 text-center">
          <Button
            size="lg"
            className="w-full max-w-sm h-14 text-xl rounded-full shadow-lg"
            onClick={handleSubmit}
            disabled={!selectedRole}
          >
            Continue as a {selectedRole ? selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1) : '...'}
          </Button>
        </FadeIn>
      </div>
    </div>
  );
}
