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
      d="M5.15039 12.0001V8.2501C5.15039 6.2001 6.80039 4.5501 8.85039 4.5501H11.5004C13.5504 4.5501 15.2004 6.2001 15.2004 8.2501V12.0001M5.15039 12.0001C5.15039 14.5001 7.15039 16.5001 9.65039 16.5001C11.0504 16.5001 12.2504 15.8001 13.0504 14.8001L15.3004 11.9501C16.2004 10.9501 17.7504 10.9501 18.6504 11.9501C19.5504 12.9501 19.5504 14.5001 18.6504 15.4001L17.5004 16.5501C17.5004 18.2001 16.1504 19.5501 14.5004 19.5501C12.8504 19.5501 11.5004 18.2001 11.5004 16.5501"
      stroke="currentColor"
      strokeWidth="1.5"
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
