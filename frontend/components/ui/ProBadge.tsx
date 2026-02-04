"use client";

import { motion } from "framer-motion";
import { Star, Zap, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProBadgeProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showTooltip?: boolean;
  animate?: boolean;
}

/**
 * Pro Badge - Displayed next to Advanced tier user names
 * Shows a star with electric blue/purple gradient and glow effect
 */
export default function ProBadge({
  className,
  size = "sm",
  showTooltip = true,
  animate = true,
}: ProBadgeProps) {
  const sizeClasses = {
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  return (
    <motion.span
      className={cn(
        "inline-flex items-center justify-center",
        className
      )}
      initial={animate ? { scale: 0.8, opacity: 0.8 } : undefined}
      animate={
        animate
          ? {
              scale: [1, 1.15, 1],
              opacity: 1,
            }
          : undefined
      }
      transition={
        animate
          ? {
              duration: 2.5,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
            }
          : undefined
      }
      title={showTooltip ? "Pro Member" : undefined}
    >
      <Star
        className={cn(
          sizeClasses[size],
          "text-blue-400 drop-shadow-[0_0_6px_rgba(96,165,250,0.8)]"
        )}
        fill="currentColor"
        strokeWidth={1.5}
      />
    </motion.span>
  );
}

/**
 * Pro Tag - Inline text badge showing "PRO" with star
 */
export function ProTag({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full",
        "bg-gradient-to-r from-blue-500/20 to-purple-500/20",
        "border border-blue-400/40",
        "text-xs font-bold text-blue-300",
        "shadow-[0_0_10px_rgba(96,165,250,0.3)]",
        className
      )}
    >
      <Star className="w-3 h-3" fill="currentColor" strokeWidth={1.5} />
      <span>PRO</span>
    </span>
  );
}

/**
 * Large Pro Badge for dashboard headers
 */
export function ProBadgeLarge({ className }: { className?: string }) {
  return (
    <motion.div
      className={cn(
        "relative inline-flex items-center justify-center w-12 h-12 rounded-full",
        "bg-gradient-to-br from-blue-600 via-purple-600 to-blue-600",
        "shadow-[0_0_20px_rgba(96,165,250,0.5)]",
        className
      )}
      animate={{
        boxShadow: [
          "0 0 20px rgba(96,165,250,0.5)",
          "0 0 30px rgba(147,51,234,0.6)",
          "0 0 20px rgba(96,165,250,0.5)",
        ],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <Star className="w-6 h-6 text-white" fill="currentColor" strokeWidth={1.5} />
      
      {/* Sparkle effects */}
      <motion.div
        className="absolute -top-1 -right-1"
        animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <Sparkles className="w-3 h-3 text-yellow-300" />
      </motion.div>
    </motion.div>
  );
}

/**
 * Pro Avatar Ring - Wraps an avatar with a pro gradient ring
 */
interface ProAvatarRingProps {
  children: React.ReactNode;
  isPro: boolean;
  className?: string;
}

export function ProAvatarRing({ children, isPro, className }: ProAvatarRingProps) {
  if (!isPro) {
    return <>{children}</>;
  }

  return (
    <div className={cn("relative", className)}>
      {/* Animated ring */}
      <motion.div
        className="absolute inset-[-2px] rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500"
        animate={{
          backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{
          backgroundSize: "200% 200%",
        }}
      />
      <div className="relative rounded-full bg-gray-900 p-[2px]">
        {children}
      </div>
    </div>
  );
}
