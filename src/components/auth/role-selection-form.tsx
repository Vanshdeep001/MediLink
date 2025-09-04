
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
    <div className="w-full max-w-4xl mx-auto text-center mt-24">
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-bold">
          Are you joining as a...
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground mt-2">
          Choose your role to get a personalized experience.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {roles.map((role, index) => (
          <FadeIn key={role.id} delay={200 * (index + 1)}>
            <Card
              className={cn(
                "cursor-pointer transition-all duration-300 transform hover:-translate-y-2 hover:shadow-xl group",
                selectedRole === role.id && "ring-2 ring-primary -translate-y-2 shadow-xl"
              )}
              onClick={() => handleRoleSelect(role.id)}
            >
              <CardContent className="p-6 flex flex-col items-center justify-center">
                <div className="w-24 h-24 mb-4">
                  <role.icon />
                </div>
                <h3 className="text-xl font-semibold">{role.label}</h3>
                <p className="text-sm text-muted-foreground mt-1">{role.description}</p>
              </CardContent>
            </Card>
          </FadeIn>
        ))}
      </div>

      <FadeIn delay={800}>
        <div className="mt-12">
          <Button
            size="lg"
            className="w-full max-w-xs h-12 text-lg"
            onClick={handleSubmit}
            disabled={!selectedRole}
          >
            Continue as a {selectedRole ? selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1) : '...'}
          </Button>
        </div>
      </FadeIn>
    </div>
  );
}
