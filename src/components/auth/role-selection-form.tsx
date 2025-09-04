"use client";

import { useState, useTransition } from 'react';
import { User, Stethoscope, Pill } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { updateUserRole } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { FadeIn } from '../fade-in';

type Role = 'patient' | 'doctor' | 'pharmacy';

const roles = [
  { id: 'patient' as Role, label: 'Patient', icon: User },
  { id: 'doctor' as Role, label: 'Doctor', icon: Stethoscope },
  { id: 'pharmacy' as Role, label: 'Pharmacy', icon: Pill },
];

export function RoleSelectionForm() {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

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

    startTransition(async () => {
      const formData = new FormData();
      formData.append('role', selectedRole);
      try {
        const result = await updateUserRole(formData);
        if (result?.error) {
          toast({
            title: "Update Failed",
            description: result.error,
            variant: "destructive",
          });
        }
      } catch (e) {
        // Redirect will throw an error, which is expected.
      }
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto text-center">
      <FadeIn delay={200}>
        <h1 className="text-4xl md:text-5xl font-bold">Are you joining as a...</h1>
        <p className="text-lg md:text-xl text-muted-foreground mt-2">
          Choose your role to get a personalized experience.
        </p>
      </FadeIn>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        {roles.map((role, index) => (
          <FadeIn key={role.id} delay={400 + index * 100}>
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

      <FadeIn delay={800} className="mt-12">
        <Button
          size="lg"
          className="w-full max-w-sm h-14 text-xl"
          onClick={handleSubmit}
          disabled={isPending || !selectedRole}
        >
          {isPending ? 'Saving...' : 'Continue'}
        </Button>
      </FadeIn>
    </div>
  );
}
