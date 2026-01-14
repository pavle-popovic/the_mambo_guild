"use client";

import { motion, MotionProps, HTMLMotionProps } from "framer-motion";
import { ReactNode, useCallback } from "react";
import { cn } from "@/lib/utils";
import { UISound } from "@/hooks/useUISound";

/**
 * GlassCard - Frosted glass card with warm amber glow
 * Part of the "Vintage Salsa/Palladium" design system
 */
interface GlassCardProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  className?: string;
  enableSound?: boolean;
  enableHover?: boolean;
  glowIntensity?: "subtle" | "medium" | "strong";
}

export function GlassCard({
  children,
  className,
  enableSound = true,
  enableHover = true,
  glowIntensity = "medium",
  ...props
}: GlassCardProps) {
  const handleHoverStart = useCallback(() => {
    if (enableSound) {
      UISound.hover();
    }
  }, [enableSound]);

  const glowStyles = {
    subtle: "0 8px 20px -4px rgba(255, 180, 0, 0.15), 0 4px 10px -4px rgba(255, 150, 0, 0.1)",
    medium: "0 15px 30px -5px rgba(255, 180, 0, 0.25), 0 8px 15px -5px rgba(255, 150, 0, 0.15)",
    strong: "0 20px 40px -5px rgba(255, 180, 0, 0.35), 0 10px 20px -5px rgba(255, 150, 0, 0.2)",
  };

  return (
    <motion.div
      whileHover={
        enableHover
          ? {
              scale: 1.02,
              y: -4,
              boxShadow: glowStyles[glowIntensity],
            }
          : undefined
      }
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 15,
        mass: 0.8,
      }}
      className={cn(
        // Frosted glass effect
        "relative overflow-hidden rounded-xl",
        "backdrop-blur-md",
        "bg-white/10 dark:bg-white/5",
        "border border-white/20 dark:border-white/10",
        // Subtle inner glow
        "shadow-inner shadow-white/5",
        className
      )}
      onHoverStart={enableHover ? handleHoverStart : undefined}
      {...props}
    >
      {/* Subtle gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
      
      {/* Content */}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}

/**
 * GlassPanel - Larger glass container without hover effects
 * For sections and containers
 */
interface GlassPanelProps {
  children: ReactNode;
  className?: string;
}

export function GlassPanel({ children, className }: GlassPanelProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl",
        "backdrop-blur-lg",
        "bg-white/10 dark:bg-white/5",
        "border border-white/20 dark:border-white/10",
        className
      )}
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/5 pointer-events-none" />
      
      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export default GlassCard;
