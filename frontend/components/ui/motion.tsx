"use client";

import { motion, MotionProps, Variants } from "framer-motion";
import { ReactNode, useCallback } from "react";
import { cn } from "@/lib/utils";
import { UISound } from "@/hooks/useUISound";

// HoverCard: Card with hover scale and lift effect
// PALLADIUM ERA: Polished brass glow, snappy spring
interface HoverCardProps extends MotionProps {
  children: ReactNode;
  className?: string;
}

export function HoverCard({ children, className, ...props }: HoverCardProps) {
  // Shaker sound on hover
  const handleHoverStart = useCallback(() => {
    UISound.hover();
  }, []);

  return (
    <motion.div
      whileHover={{
        scale: 1.02,
        y: -8,
        boxShadow: "0 12px 40px -5px rgba(212, 175, 55, 0.3)",
      }}
      transition={{
        type: "spring",
        stiffness: 400,  // Snappy, rhythmic
        damping: 17,
      }}
      className={cn("relative", className)}
      onHoverStart={handleHoverStart}
      {...props}
    >
      {children}
      {/* Polished Brass glow on hover */}
      <motion.div
        className="absolute inset-0 rounded-xl opacity-0 pointer-events-none"
        whileHover={{
          opacity: 1,
          boxShadow: "0 20px 40px -5px rgba(212, 175, 55, 0.35), 0 10px 20px -5px rgba(212, 175, 55, 0.2)",
        }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      />
    </motion.div>
  );
}

// FadeIn: Entry animation for pages
interface FadeInProps extends MotionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function FadeIn({ children, className, delay = 0, ...props }: FadeInProps) {
  const variants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        delay,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={variants}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Clickable: Button with tap scale effect and tactile sound
// PALLADIUM ERA: Polished brass glow, snappy spring, percussion sounds
interface ClickableProps extends MotionProps {
  children: ReactNode;
  className?: string;
  enableSound?: boolean;
  enableHoverSound?: boolean;
}

export function Clickable({ 
  children, 
  className, 
  enableSound = true,
  enableHoverSound = true,
  ...props 
}: ClickableProps) {
  // Woodblock "toc" on mousedown
  const handleMouseDown = useCallback(() => {
    if (enableSound) {
      UISound.click();
    }
  }, [enableSound]);

  // Shaker "chhh" on hover with random pitch
  const handleHoverStart = useCallback(() => {
    if (enableSound && enableHoverSound) {
      UISound.hover();
    }
  }, [enableSound, enableHoverSound]);

  return (
    <motion.div
      whileTap={{ scale: 0.95 }}
      whileHover={{
        scale: 1.05,
        // Polished brass glow
        boxShadow: "0 8px 30px -4px rgba(212, 175, 55, 0.35), 0 4px 15px -4px rgba(212, 175, 55, 0.2)",
      }}
      transition={{
        type: "spring",
        stiffness: 400,   // Snappy, rhythmic
        damping: 17,
      }}
      className={cn("cursor-pointer", className)}
      onMouseDown={handleMouseDown}
      onHoverStart={handleHoverStart}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// StaggerContainer: For animating lists
interface StaggerContainerProps extends MotionProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
}

export function StaggerContainer({ 
  children, 
  className, 
  staggerDelay = 0.1,
  ...props 
}: StaggerContainerProps) {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0,
      },
    },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// StaggerItem: Individual item for stagger container
interface StaggerItemProps extends MotionProps {
  children: ReactNode;
  className?: string;
}

export function StaggerItem({ children, className, ...props }: StaggerItemProps) {
  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
  };

  return (
    <motion.div variants={itemVariants} className={cn(className)} {...props}>
      {children}
    </motion.div>
  );
}

