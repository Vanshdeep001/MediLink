
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { FadeIn } from '../fade-in';
import { useRouter } from 'next/navigation';
import TextFlipper from '../ui/text-effect-flipper';
import Image from 'next/image';

type Role = 'patient' | 'doctor' | 'pharmacy';

const roles = [
  { 
    id: 'patient' as Role, 
    label: 'Patient', 
    image: {
      src: "https://picsum.photos/200/201",
      alt: "Patient illustration",
      hint: "patient"
    },
    description: 'Consult doctors & manage health records'
  },
  { 
    id: 'doctor' as Role, 
    label: 'Doctor', 
    image: {
      src: "https://picsum.photos/200/202",
      alt: "Doctor illustration",
      hint: "doctor"
    },
    description: 'Provide consultations and e-prescriptions'
  },
  { 
    id: 'pharmacy' as Role, 
    label: 'Pharmacy', 
    image: {
      src: "https://picsum.photos/200/203",
      alt: "Pharmacy illustration",
      hint: "pharmacy"
    },
    description: 'Manage medicine stock and deliveries'
  },
];

export function RoleSelectionForm() {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [startAnimation, setStartAnimation] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      setStartAnimation(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

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
        
        if (selectedRole === 'patient') {
          router.push('/patient/medical-history');
        } else if (selectedRole === 'doctor') {
          router.push('/doctor/register');
        } else if (selectedRole === 'pharmacy') {
          router.push('/pharmacy/register');
        } else {
          router.push(`/${selectedRole}`);
        }

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
    <div className="w-full max-w-4xl mx-auto">
       <div
        className={cn(
          "text-center absolute left-1/2 -translate-x-1/2 transition-all duration-1000 ease-in-out",
          startAnimation ? "top-[10rem] -translate-y-1/2" : "top-1/2 -translate-y-1/2 scale-125"
        )}
      >
        <h1 className="text-4xl md:text-5xl font-bold whitespace-nowrap">
          <TextFlipper>Are you</TextFlipper> <TextFlipper delay={0.2} className="text-primary font-cursive">joining as a...</TextFlipper>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground mt-2 font-serif">
          Select your role to get started.
        </p>
      </div>
      
      {startAnimation && (
        <div className="w-full animate-content-fade-in" style={{ animationDelay: '0.5s', paddingTop: '16rem' }}>
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
                    <div className="w-24 h-24 mb-4 relative">
                      <Image 
                        src={role.image.src} 
                        alt={role.image.alt}
                        width={96}
                        height={96}
                        data-ai-hint={role.image.hint}
                        className="rounded-full object-cover"
                      />
                    </div>
                    <h3 className="text-xl font-semibold">{role.label}</h3>
                    <p className="text-sm text-muted-foreground mt-1 text-center">{role.description}</p>
                  </CardContent>
                </Card>
              </FadeIn>
            ))}
          </div>

          <FadeIn delay={800}>
            <div className="mt-12 text-center">
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
      )}
    </div>
  );
}
