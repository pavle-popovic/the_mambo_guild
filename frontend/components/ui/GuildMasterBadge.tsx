"use client";

import { motion } from "framer-motion";
import { Crown } from "lucide-react";
import { cn } from "@/lib/utils";

interface GuildMasterBadgeProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showTooltip?: boolean;
  animate?: boolean;
}

/**
 * Guild Master crown/badge icon displayed next to premium user names.
 * Shows a golden crown with optional animation and tooltip.
 */
export default function GuildMasterBadge({
  className,
  size = "sm",
  showTooltip = true,
  animate = true,
}: GuildMasterBadgeProps) {
  const sizeClasses = {
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  const Badge = (
    <motion.span
      className={cn(
        "inline-flex items-center justify-center",
        className
      )}
      initial={animate ? { scale: 0.8, opacity: 0.8 } : undefined}
      animate={
        animate
          ? {
              scale: [1, 1.1, 1],
              opacity: 1,
            }
          : undefined
      }
      transition={
        animate
          ? {
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
            }
          : undefined
      }
      title={showTooltip ? "Guild Master" : undefined}
    >
      <Crown
        className={cn(
          sizeClasses[size],
          "text-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.6)]"
        )}
        fill="currentColor"
        strokeWidth={1.5}
      />
    </motion.span>
  );

  return Badge;
}

/**
 * Inline text badge showing "Guild Master" with crown
 */
export function GuildMasterTag({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full",
        "bg-gradient-to-r from-amber-500/20 to-yellow-500/20",
        "border border-amber-400/30",
        "text-xs font-semibold text-amber-300",
        "shadow-[0_0_10px_rgba(251,191,36,0.2)]",
        className
      )}
    >
      <Crown className="w-3 h-3" fill="currentColor" strokeWidth={1.5} />
      <span>Guild Master</span>
    </span>
  );
}
