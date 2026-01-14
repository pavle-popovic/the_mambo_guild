"use client";

import { motion, MotionProps, Variants } from "framer-motion";
import { ReactNode, useCallback } from "react";
import { cn } from "@/lib/utils";
import { UISound } from "@/hooks/useUISound";

// HoverCard: Card with hover scale and lift effect
interface HoverCardProps extends MotionProps {
  children: ReactNode;
  className?: string;
}

export function HoverCard({ children, className, ...props }: HoverCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -5 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={cn("relative", className)}
      {...props}
    >
      {children}
      <motion.div
        className="absolute inset-0 rounded-lg opacity-0 pointer-events-none"
        whileHover={{
          opacity: 1,
          boxShadow: "0 20px 25px -5px rgba(59, 130, 246, 0.2), 0 10px 10px -5px rgba(59, 130, 246, 0.1)",
        }}
        transition={{ duration: 0.2 }}
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
  // THOCK sound on mousedown (deeper, satisfying click)
  const handleMouseDown = useCallback(() => {
    if (enableSound) {
      UISound.thock();
    }
  }, [enableSound]);

  // TICK sound on hover (crisp, high-pitched)
  const handleHoverStart = useCallback(() => {
    if (enableSound && enableHoverSound) {
      UISound.tick();
    }
  }, [enableSound, enableHoverSound]);

  return (
    <motion.div
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
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

