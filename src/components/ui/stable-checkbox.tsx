'use client';

import { useState, useEffect } from 'react';
import { Check } from 'lucide-react';

interface StableCheckboxProps {
  id?: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  className?: string;
  children?: React.ReactNode;
}

export function StableCheckbox({ 
  id, 
  checked = false, 
  onCheckedChange, 
  className = '', 
  children 
}: StableCheckboxProps) {
  const [isChecked, setIsChecked] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setIsChecked(checked);
  }, [checked]);

  const handleClick = () => {
    if (!isMounted) return;
    const newChecked = !isChecked;
    setIsChecked(newChecked);
    onCheckedChange?.(newChecked);
  };

  if (!isMounted) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="h-4 w-4 border border-gray-300 rounded bg-white"></div>
        {children && <span>{children}</span>}
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <button
        type="button"
        id={id}
        onClick={handleClick}
        className={`
          h-4 w-4 border rounded flex items-center justify-center transition-colors
          ${isChecked 
            ? 'bg-primary border-primary text-primary-foreground' 
            : 'border-gray-300 bg-white hover:border-gray-400'
          }
        `}
        aria-checked={isChecked}
        role="checkbox"
      >
        {isChecked && <Check className="h-3 w-3" />}
      </button>
      {children && (
        <label 
          htmlFor={id} 
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
        >
          {children}
        </label>
      )}
    </div>
  );
}
