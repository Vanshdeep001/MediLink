
"use client";

import { useState } from 'react';
import { User, Stethoscope, Pill } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { FadeIn } from '../fade-in';
import { useRouter } from 'next/navigation';

type Role = 'patient' | 'doctor' | 'pharmacy';

const roles = [
  { id: 'patient' as Role, label: 'Patient', icon: User },
  { id: 'doctor' as Role, label: 'Doctor', icon: Stethoscope },
  { id: 'pharmacy' as Role, label: 'Pharmacy', icon: Pill },
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
    <div className="w-full max-w-4xl mx-auto pt-48">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold">Are you joining as a...</h1>
        <p className="text-lg md:text-xl text-muted-foreground mt-2">
          Choose your role to get a personalized experience.
        </p>
      </div>

      <div className="w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {roles.map((role, index) => (
            <FadeIn key={role.id} delay={100 + index * 100}>
              <Card
                className={cn(
                  "cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-2xl",
                  selectedRole === role.id ? "ring-2 ring-primary shadow-2xl scale-105" : "hover:bg-accent"
                )}
                onClick={() => handleRoleSelect(role.id)}
              >
                <CardContent className="p-8 flex flex-col items-center justify-center">
                  <role.icon className="w-20 h-20 text-primary mb-6" />
                  <h3 className="text-2xl font-semibold">{role.label}</h3>
                </CardContent>
              </Card>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={500} className="mt-12 text-center">
          <Button
            size="lg"
            className="w-full max-w-sm h-14 text-xl"
            onClick={handleSubmit}
            disabled={!selectedRole}
          >
            Continue
          </Button>
        </FadeIn>
      </div>
    </div>
  );
}
