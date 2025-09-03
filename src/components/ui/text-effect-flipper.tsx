"use client";

import React from "react";
import { motion, Variants } from "framer-motion";
import { cn } from "@/lib/utils";

const DURATION = 0.4;

interface TextFlipperProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

const TextFlipper: React.FC<TextFlipperProps> = ({ children, className, delay = 0 }) => {
  const variants: Variants = {
    initial: {
      y: "100%",
      opacity: 0,
      rotateX: -90,
    },
    animate: {
      y: "0%",
      opacity: 1,
      rotateX: 0,
    },
  };

  return (
    <div className={cn("inline-block", className)}>
       <motion.div
        initial="initial"
        animate="animate"
        transition={{
            duration: DURATION,
            ease: [0.34, 1.56, 0.64, 1], // A bouncy ease
            delay: delay
        }}
        variants={variants}
        style={{ transformOrigin: "top center" }}
        className="inline-block"
      >
        {children}
      </motion.div>
    </div>
  );
};

export default TextFlipper;
