"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

/**
 * PalladiumMesh - Dark monochrome mesh gradient background
 * Creates a subtle, drifting "smoke-like" effect with blurred circles
 * 90% black background with 10% subtle mesh elements
 * On mobile: renders only 2 static circles (no animation) to save GPU/battery
 */
export default function PalladiumMesh() {
  const prefersReduced = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // On mobile or reduced-motion: render 2 static blurred circles, no animation
  if (isMobile || prefersReduced) {
    return (
      <div className="fixed inset-0 bg-black pointer-events-none -z-10">
        <div
          className="absolute rounded-full"
          style={{
            width: 400,
            height: 400,
            backgroundColor: "#1a1a1a",
            filter: "blur(100px)",
            opacity: 0.25,
            top: "15%",
            left: "10%",
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: 350,
            height: 350,
            backgroundColor: "#2e2e2e",
            filter: "blur(100px)",
            opacity: 0.2,
            bottom: "20%",
            right: "15%",
          }}
        />
      </div>
    );
  }

  // Desktop: full animated mesh
  const circleVariants = [
    {
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

  const circles = [
    { color: "#1a1a1a", size: 600, position: { top: "10%", left: "15%" }, variant: circleVariants[0] },
    { color: "#2e2e2e", size: 550, position: { top: "60%", right: "20%" }, variant: circleVariants[1] },
    { color: "#1a1a1a", size: 580, position: { bottom: "20%", left: "25%" }, variant: circleVariants[2] },
    { color: "#2e2e2e", size: 520, position: { top: "40%", right: "10%" }, variant: circleVariants[3] },
    { color: "#4a4a4a", size: 480, position: { top: "50%", left: "50%" }, variant: circleVariants[4] },
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
            opacity: 0.25,
            ...circle.position,
            willChange: "transform",
          }}
          initial={circle.variant.initial}
          animate={circle.variant.animate}
          transition={circle.variant.transition}
        />
      ))}
    </div>
  );
}
