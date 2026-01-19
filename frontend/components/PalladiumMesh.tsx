"use client";

import { motion } from "framer-motion";

/**
 * PalladiumMesh - Dark monochrome mesh gradient background
 * Creates a subtle, drifting "smoke-like" effect with blurred circles
 * 90% black background with 10% subtle mesh elements
 */
export default function PalladiumMesh() {
  // Animation variants for each circle - long, slow, drifting motion
  const circleVariants = [
    {
      // Circle 1: Dark Grey (#1a1a1a)
      initial: { x: 0, y: 0, scale: 1 },
      animate: {
        x: [0, 120, -80, 60, 0],
        y: [0, -100, 90, -50, 0],
        scale: [1, 1.08, 0.92, 1.05, 1],
      },
      transition: {
        duration: 28000,
        repeat: Infinity,
        repeatType: "reverse" as const,
        ease: "easeInOut" as const,
      },
    },
    {
      // Circle 2: Medium Charcoal (#2e2e2e)
      initial: { x: 0, y: 0, scale: 1 },
      animate: {
        x: [0, -150, 100, -70, 0],
        y: [0, 110, -85, 55, 0],
        scale: [1, 0.95, 1.12, 0.98, 1],
      },
      transition: {
        duration: 32000,
        repeat: Infinity,
        repeatType: "reverse" as const,
        ease: "easeInOut" as const,
      },
    },
    {
      // Circle 3: Dark Grey (#1a1a1a)
      initial: { x: 0, y: 0, scale: 1 },
      animate: {
        x: [0, 90, -120, 40, 0],
        y: [0, 95, -110, 65, 0],
        scale: [1, 1.1, 0.88, 1.02, 1],
      },
      transition: {
        duration: 25000,
        repeat: Infinity,
        repeatType: "reverse" as const,
        ease: "easeInOut" as const,
      },
    },
    {
      // Circle 4: Medium Charcoal (#2e2e2e)
      initial: { x: 0, y: 0, scale: 1 },
      animate: {
        x: [0, -110, 130, -45, 0],
        y: [0, -85, 105, -60, 0],
        scale: [1, 0.9, 1.15, 0.96, 1],
      },
      transition: {
        duration: 30000,
        repeat: Infinity,
        repeatType: "reverse" as const,
        ease: "easeInOut" as const,
      },
    },
    {
      // Circle 5: Palladium Grey (#4a4a4a) - used sparingly
      initial: { x: 0, y: 0, scale: 1 },
      animate: {
        x: [0, 70, -90, 30, 0],
        y: [0, -70, 80, -35, 0],
        scale: [1, 1.05, 0.94, 1.01, 1],
      },
      transition: {
        duration: 35000,
        repeat: Infinity,
        repeatType: "reverse" as const,
        ease: "easeInOut" as const,
      },
    },
  ];

  // Circle configurations: color, size, position
  const circles = [
    {
      color: "#1a1a1a", // Dark Grey
      size: 600,
      position: { top: "10%", left: "15%" },
      variant: circleVariants[0],
    },
    {
      color: "#2e2e2e", // Medium Charcoal
      size: 550,
      position: { top: "60%", right: "20%" },
      variant: circleVariants[1],
    },
    {
      color: "#1a1a1a", // Dark Grey
      size: 580,
      position: { bottom: "20%", left: "25%" },
      variant: circleVariants[2],
    },
    {
      color: "#2e2e2e", // Medium Charcoal
      size: 520,
      position: { top: "40%", right: "10%" },
      variant: circleVariants[3],
    },
    {
      color: "#4a4a4a", // Palladium Grey (sparingly)
      size: 480,
      position: { top: "50%", left: "50%" },
      variant: circleVariants[4],
    },
  ];

  return (
    <div className="fixed inset-0 bg-black pointer-events-none -z-10">
      {circles.map((circle, index) => (
        <motion.div
          key={index}
          className="absolute rounded-full"
          style={{
            width: `${circle.size}px`,
            height: `${circle.size}px`,
            backgroundColor: circle.color,
            filter: "blur(100px)",
            opacity: 0.25, // Very subtle - 90% black, 10% mesh
            ...circle.position,
            willChange: "transform", // Performance optimization
          }}
          initial={circle.variant.initial}
          animate={circle.variant.animate}
          transition={circle.variant.transition}
        />
      ))}
    </div>
  );
}
