"use client";

import { ReactNode, forwardRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { UISound } from "@/hooks/useUISound";

interface StageCardProps {
  children: ReactNode;
  className?: string;
  /** Enable/disable sound effects */
  enableSound?: boolean;
  /** Enable/disable hover interactions */
  enableHover?: boolean;
  /** Card variant */
  variant?: "default" | "elevated" | "spotlight";
  /** Make card clickable */
  clickable?: boolean;
  onClick?: () => void;
}

/**
 * StageCard - Palladium Era Card Component
 *
 * "Stage Lighting" aesthetic: Dark container lit by a spotlight
 *
 * Uses the standardized Mambo Gold hover pattern:
 * - Base: border-white/10
 * - Hover: border-mambo-gold/50, shadow-2xl, shadow-mambo-gold/10, scale-[1.02]
 *
 * Variants:
 * - `default`: Standard stage card
 * - `elevated`: Stronger initial shadow (appears lifted)
 * - `spotlight`: Radial gradient "spotlight" effect on hover
 */
export const StageCard = forwardRef<HTMLDivElement, StageCardProps>(
  (
    {
      children,
      className,
      enableSound = true,
      enableHover = true,
      variant = "default",
      clickable = false,
      onClick,
    },
    ref
  ) => {
    // Variant-specific styles
    const variantStyles = {
      default: "",
      elevated: "shadow-lg shadow-black/50",
      spotlight: "stage-spotlight overflow-hidden",
    };

    const handleMouseEnter = useCallback(() => {
      if (enableSound && enableHover) {
        UISound.hover();
      }
    }, [enableSound, enableHover]);

    const handleClick = useCallback(() => {
      if (clickable && enableSound) {
        UISound.click();
      }
      onClick?.();
    }, [clickable, enableSound, onClick]);

    return (
      <div
        ref={ref}
        onMouseEnter={handleMouseEnter}
        onClick={clickable ? handleClick : onClick}
        className={cn(
          // Base stage lighting styles
          "bg-black/80 backdrop-blur-sm",
          "border border-white/10",
          "rounded-xl",
          "transition-all duration-300",
          // Variant styles
          variantStyles[variant],
          // Mambo Gold hover pattern (when enabled)
          enableHover && "z-0 hover:border-mambo-gold/50 hover:shadow-2xl hover:shadow-mambo-gold/10 hover:scale-[1.02] hover:z-10",
          clickable && "cursor-pointer",
          className
        )}
      >
        {children}
      </div>
    );
  }
);

StageCard.displayName = "StageCard";

/**
 * StagePanel - Larger container for sections/panels
 * Similar to StageCard but with more subtle hover (disabled by default)
 */
interface StagePanelProps {
  children: ReactNode;
  className?: string;
  /** Enable/disable sound effects */
  enableSound?: boolean;
  /** Enable/disable hover interactions */
  enableHover?: boolean;
  /** Panel size affects padding */
  size?: "sm" | "md" | "lg";
}

export const StagePanel = forwardRef<HTMLDivElement, StagePanelProps>(
  (
    {
      children,
      className,
      enableSound = true,
      enableHover = false,
      size = "md",
    },
    ref
  ) => {
    const sizeStyles = {
      sm: "p-4",
      md: "p-6",
      lg: "p-8",
    };

    return (
      <StageCard
        ref={ref}
        enableSound={enableSound}
        enableHover={enableHover}
        className={cn(sizeStyles[size], className)}
      >
        {children}
      </StageCard>
    );
  }
);

StagePanel.displayName = "StagePanel";

export default StageCard;
