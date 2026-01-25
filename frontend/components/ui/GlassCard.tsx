"use client";

import { ReactNode, useCallback } from "react";
import { cn } from "@/lib/utils";
import { UISound } from "@/hooks/useUISound";

/**
 * GlassCard - Stage lighting card with polished brass glow
 * Part of the "Palladium Era" design system
 *
 * Uses the standardized Mambo Gold hover pattern:
 * - Base: border-white/10
 * - Hover: border-mambo-gold/50, shadow-2xl, shadow-mambo-gold/10, scale-[1.02]
 */
interface GlassCardProps {
  children: ReactNode;
  className?: string;
  enableSound?: boolean;
  enableHover?: boolean;
}

export function GlassCard({
  children,
  className,
  enableSound = true,
  enableHover = true,
}: GlassCardProps) {
  const handleMouseEnter = useCallback(() => {
    if (enableSound) {
      UISound.hover();
    }
  }, [enableSound]);

  return (
    <div
      onMouseEnter={enableHover ? handleMouseEnter : undefined}
      className={cn(
        // Palladium Era: Stage lighting effect
        "relative overflow-hidden rounded-xl",
        "backdrop-blur-sm",
        "bg-black/80",
        "border border-white/10",
        "transition-all duration-300",
        // Mambo Gold hover pattern (when enabled)
        enableHover && "cursor-pointer z-0 hover:border-mambo-gold/50 hover:shadow-2xl hover:shadow-mambo-gold/10 hover:scale-[1.02] hover:z-10",
        className
      )}
    >
      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

/**
 * GlassPanel - Palladium Era: Stage lighting container
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
        "backdrop-blur-sm",
        "bg-black/80",
        "border border-[rgba(212,175,55,0.2)]",
        className
      )}
    >
      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export default GlassCard;
