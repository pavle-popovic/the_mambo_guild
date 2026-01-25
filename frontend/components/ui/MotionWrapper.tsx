"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { ReactNode, useCallback, forwardRef, ElementType } from "react";
import { cn } from "@/lib/utils";
import { UISound } from "@/hooks/useUISound";

// ===== PALLADIUM SPRING PHYSICS =====
// Snappy, rhythmic feel - like a brass valve
const PALLADIUM_SPRING = {
  type: "spring" as const,
  stiffness: 400,
  damping: 17,
};

// ===== BRASS COLORS =====
const BRASS = {
  border: "rgba(212, 175, 55, 0.3)",
  borderHover: "rgba(212, 175, 55, 0.6)",
  shadow: "0 4px 30px rgba(212, 175, 55, 0.15)",
  shadowHover: "0 8px 40px rgba(212, 175, 55, 0.3)",
  shadowIntense: "0 12px 50px rgba(212, 175, 55, 0.4)",
  text: "#D4AF37",
};

// ===== PRESET CONFIGURATIONS =====
const presetConfigs = {
  button: {
    whileHover: {
      scale: 1.05,
      boxShadow: BRASS.shadowHover,
    },
    whileTap: { scale: 0.95 },
    hoverSound: "shaker" as const,
    clickSound: "timbale" as const,
  },
  card: {
    whileHover: {
      y: -8,
      boxShadow: BRASS.shadowHover,
    },
    whileTap: { scale: 0.98 },
    hoverSound: "shaker" as const,
    clickSound: "none" as const,
  },
  navLink: {
    whileHover: {
      color: BRASS.text,
    },
    whileTap: undefined,
    hoverSound: "shaker" as const,
    clickSound: "none" as const,
  },
  iconButton: {
    whileHover: { scale: 1.08 },
    whileTap: { scale: 0.92 },
    hoverSound: "shaker" as const,
    clickSound: "timbale" as const,
  },
  listItem: {
    whileHover: {
      y: -2,
      boxShadow: BRASS.shadow,
    },
    whileTap: undefined,
    hoverSound: "shaker" as const,
    clickSound: "none" as const,
  },
  subtle: {
    whileHover: {
      scale: 1.02,
    },
    whileTap: { scale: 0.98 },
    hoverSound: "shaker" as const,
    clickSound: "none" as const,
  },
  none: {
    whileHover: undefined,
    whileTap: undefined,
    hoverSound: "shaker" as const,
    clickSound: "none" as const,
  },
};

// ===== TYPES =====
export type InteractionPreset = keyof typeof presetConfigs;

interface MotionWrapperProps extends Omit<HTMLMotionProps<"div">, "ref"> {
  children: ReactNode;
  /** Interaction preset - determines animation and sound behavior */
  preset?: InteractionPreset;
  /** Enable/disable all sounds */
  enableSound?: boolean;
  /** Disabled state - prevents all interactions */
  disabled?: boolean;
  /** Render as different element type */
  as?: "div" | "button" | "span" | "a";
  /** Override default preset hover sound */
  hoverSound?: "shaker" | "none";
  /** Override default preset click sound */
  clickSound?: "timbale" | "conga" | "none";
  /** Override default preset hover animation */
  customHover?: HTMLMotionProps<"div">["whileHover"];
  /** Override default preset tap animation */
  customTap?: HTMLMotionProps<"div">["whileTap"];
}

/**
 * MotionWrapper - Palladium Era Interactive Component
 *
 * Centralizes all animation and sound behavior with presets:
 * - `button`: scale 1.05 hover, 0.95 tap, brass glow, hover + click sounds
 * - `card`: y: -8 hover, brass glow, hover sound only
 * - `navLink`: color to brass on hover, hover sound only
 * - `iconButton`: scale 1.08 hover, 0.92 tap, both sounds
 * - `listItem`: subtle y: -2 hover, hover sound only
 * - `subtle`: minimal scale, hover sound only
 * - `none`: sounds only, no animations
 */
export const MotionWrapper = forwardRef<HTMLDivElement, MotionWrapperProps>(
  (
    {
      children,
      className,
      preset = "button",
      enableSound = true,
      disabled = false,
      as = "div",
      hoverSound,
      clickSound,
      customHover,
      customTap,
      onClick,
      onMouseDown,
      ...props
    },
    ref
  ) => {
    const config = presetConfigs[preset];
    const resolvedHoverSound = hoverSound ?? config.hoverSound;
    const resolvedClickSound = clickSound ?? config.clickSound;

    // Shaker sound on hover
    const handleHoverStart = useCallback(() => {
      if (!disabled && enableSound && resolvedHoverSound !== "none") {
        UISound.hover();
      }
    }, [disabled, enableSound, resolvedHoverSound]);

    // Timbale or Conga sound on click/mousedown
    const handleMouseDown = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        if (!disabled && enableSound && resolvedClickSound !== "none") {
          resolvedClickSound === "timbale"
            ? UISound.click()
            : UISound.conga();
        }
        onMouseDown?.(e);
      },
      [disabled, enableSound, resolvedClickSound, onMouseDown]
    );

    const handleClick = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        if (disabled) {
          e.preventDefault();
          return;
        }
        onClick?.(e);
      },
      [disabled, onClick]
    );

    // Resolve animations
    const whileHover = disabled ? undefined : (customHover ?? config.whileHover);
    const whileTap = disabled ? undefined : (customTap ?? config.whileTap);

    // Get the motion component for the element type
    const MotionComponent = motion[as] as typeof motion.div;

    return (
      <MotionComponent
        ref={ref}
        whileHover={whileHover}
        whileTap={whileTap}
        transition={PALLADIUM_SPRING}
        onHoverStart={handleHoverStart}
        onMouseDown={handleMouseDown}
        onClick={handleClick}
        className={cn(
          disabled && "opacity-50 cursor-not-allowed pointer-events-none",
          className
        )}
        {...props}
      >
        {children}
      </MotionComponent>
    );
  }
);

MotionWrapper.displayName = "MotionWrapper";

// ===== CONVENIENCE EXPORTS =====
export { PALLADIUM_SPRING, BRASS };
export default MotionWrapper;
