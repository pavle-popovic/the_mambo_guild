"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { ReactNode, useCallback } from "react";
import { cn } from "@/lib/utils";
import { UISound } from "@/hooks/useUISound";

/**
 * MagicButton - Premium animated button with gradient border
 * Part of the "Vintage Salsa/Palladium" design system
 */
interface MagicButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  disabled?: boolean;
  enableSound?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

export function MagicButton({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled = false,
  enableSound = true,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className,
  onClick,
  ...props
}: MagicButtonProps) {
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (enableSound && !disabled && !isLoading) {
        UISound.click();
      }
      onClick?.(e);
    },
    [enableSound, disabled, isLoading, onClick]
  );

  const handleHoverStart = useCallback(() => {
    if (enableSound && !disabled && !isLoading) {
      UISound.hover();
    }
  }, [enableSound, disabled, isLoading]);

  const sizeStyles = {
    sm: "px-3 py-1.5 text-sm gap-1.5",
    md: "px-5 py-2.5 text-base gap-2",
    lg: "px-7 py-3.5 text-lg gap-2.5",
  };

  const variantStyles = {
    primary: cn(
      "bg-gradient-to-r from-amber-500 to-orange-500",
      "text-white font-semibold",
      "shadow-lg shadow-amber-500/30",
      "hover:shadow-amber-500/50",
      "border-none"
    ),
    secondary: cn(
      "bg-white/10 backdrop-blur-sm",
      "text-amber-100",
      "border border-amber-500/30",
      "hover:bg-white/20",
      "hover:border-amber-500/50"
    ),
    ghost: cn(
      "bg-transparent",
      "text-amber-200",
      "border border-transparent",
      "hover:bg-white/10",
      "hover:border-white/20"
    ),
    danger: cn(
      "bg-gradient-to-r from-red-500 to-rose-500",
      "text-white font-semibold",
      "shadow-lg shadow-red-500/30",
      "hover:shadow-red-500/50",
      "border-none"
    ),
  };

  const isDisabled = disabled || isLoading;

  return (
    <motion.button
      whileHover={
        isDisabled
          ? undefined
          : {
              scale: 1.03,
              boxShadow:
                variant === "primary"
                  ? "0 10px 30px -5px rgba(255, 180, 0, 0.4)"
                  : "0 8px 20px -5px rgba(255, 255, 255, 0.1)",
            }
      }
      whileTap={isDisabled ? undefined : { scale: 0.97 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 15,
        mass: 0.8,
      }}
      onClick={handleClick}
      onHoverStart={handleHoverStart}
      disabled={isDisabled}
      className={cn(
        // Base styles
        "relative inline-flex items-center justify-center",
        "rounded-xl font-medium",
        "transition-colors duration-200",
        "focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:ring-offset-2 focus:ring-offset-transparent",
        // Size
        sizeStyles[size],
        // Variant
        variantStyles[variant],
        // States
        isDisabled && "opacity-50 cursor-not-allowed",
        fullWidth && "w-full",
        // Gradient border animation for primary
        variant === "primary" && "overflow-hidden",
        className
      )}
      {...props}
    >
      {/* Animated gradient border (for primary) */}
      {variant === "primary" && !isDisabled && (
        <motion.div
          className="absolute inset-0 rounded-xl opacity-0"
          animate={{
            opacity: [0, 0.3, 0],
            scale: [1, 1.02, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            background:
              "linear-gradient(90deg, rgba(255,180,0,0), rgba(255,200,50,0.5), rgba(255,180,0,0))",
          }}
        />
      )}

      {/* Loading spinner */}
      {isLoading && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
        </motion.div>
      )}

      {/* Content */}
      <span
        className={cn(
          "relative z-10 flex items-center",
          sizeStyles[size].split(" ").find((s) => s.startsWith("gap")),
          isLoading && "invisible"
        )}
      >
        {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
        {children}
        {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
      </span>
    </motion.button>
  );
}

/**
 * IconButton - Circular icon button
 */
interface IconButtonProps extends Omit<MagicButtonProps, "leftIcon" | "rightIcon" | "children"> {
  icon: ReactNode;
  label: string; // For accessibility
}

export function IconButton({
  icon,
  label,
  size = "md",
  ...props
}: IconButtonProps) {
  const iconSizes = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  };

  return (
    <MagicButton
      size={size}
      aria-label={label}
      className={cn(
        iconSizes[size],
        "!p-0 rounded-full"
      )}
      {...props}
    >
      {icon}
    </MagicButton>
  );
}

export default MagicButton;
