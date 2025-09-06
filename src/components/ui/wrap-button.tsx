import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const HealthcareIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="mx-2"
  >
    <path
      d="M12 4.5V19.5M19.5 12H4.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

interface WrapButtonProps {
  className?: string;
  children: React.ReactNode;
  href?: string;
}

const WrapButton: React.FC<WrapButtonProps> = ({
  className,
  children,
  href,
}) => {
  const content = (
    <div
      className={cn(
        'group cursor-pointer border border-border bg-card gap-2 h-[64px] flex items-center p-[11px] rounded-full',
        className
      )}
    >
      <div className="border border-border bg-primary h-[43px] rounded-full flex items-center justify-center text-primary-foreground">
        <HealthcareIcon />
        <p className="font-medium tracking-tight mr-3">
          {children ? children : 'Get Started'}
        </p>
      </div>
      <div className="text-muted-foreground group-hover:ml-2 ease-in-out transition-all size-[26px] flex items-center justify-center rounded-full border-2 border-border">
        <ArrowRight
          size={18}
          className="group-hover:rotate-45 ease-in-out transition-all"
        />
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
};

export default WrapButton;
