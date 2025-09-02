import { HeartPulse, Stethoscope, Pill, Plus } from 'lucide-react';

export function FloatingIcons() {
  const iconClasses = "absolute text-primary/20 animate-float";

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      <Stethoscope
        className={iconClasses}
        style={{ top: '15%', left: '10%', animationDelay: '0s', width: '64px', height: '64px' }}
      />
      <HeartPulse
        className={iconClasses}
        style={{ top: '25%', right: '15%', animationDelay: '1s', width: '48px', height: '48px' }}
      />
      <Pill
        className={iconClasses}
        style={{ bottom: '20%', left: '20%', animationDelay: '2s', width: '40px', height: '40px' }}
      />
      <Plus
        className={iconClasses}
        style={{ bottom: '10%', right: '10%', animationDelay: '3s', width: '56px', height: '56px' }}
      />
      <HeartPulse
        className={iconClasses}
        style={{ top: '60%', left: '5%', animationDelay: '4s', width: '32px', height: '32px' }}
      />
       <Stethoscope
        className={iconClasses}
        style={{ top: '75%', right: '25%', animationDelay: '5s', width: '44px', height: '44px' }}
      />
    </div>
  );
}
