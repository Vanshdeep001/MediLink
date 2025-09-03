"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface TextFlipperProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

const TextFlipper: React.FC<TextFlipperProps> = ({ children, className, delay = 0 }) => {
  return (
    <div
      className={cn("animate-word-rotate-in", className)}
      style={{ animationDelay: `${delay}s` }}
    >
      {children}
    </div>
  );
};

export default TextFlipper;
