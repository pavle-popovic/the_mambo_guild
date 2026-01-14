"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Custom navigation progress bar using Framer Motion
 * No external dependencies required - uses framer-motion which is already installed
 */
export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, setIsNavigating] = useState(false);
  const [progress, setProgress] = useState(0);
  const previousPath = useRef<string | null>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  // Handle link clicks to start progress
  useEffect(() => {
    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");
      
      if (!anchor) return;
      
      const href = anchor.getAttribute("href");
      if (!href) return;
      
      // Only handle internal links
      const isInternal = href.startsWith("/") && !href.startsWith("//");
      const isHashOnly = href.startsWith("#");
      const isNewTab = anchor.target === "_blank";
      const hasModifier = e.metaKey || e.ctrlKey || e.shiftKey;
      
      if (isInternal && !isHashOnly && !isNewTab && !hasModifier) {
        // Start progress animation
        setIsNavigating(true);
        setProgress(0);
        
        // Animate progress with trickle effect
        let currentProgress = 0;
        progressInterval.current = setInterval(() => {
          // Slow down as we approach 90%
          const increment = Math.random() * (90 - currentProgress) * 0.1;
          currentProgress = Math.min(currentProgress + increment, 90);
          setProgress(currentProgress);
        }, 100);
      }
    };

    document.addEventListener("click", handleLinkClick, { capture: true });

    return () => {
      document.removeEventListener("click", handleLinkClick, { capture: true });
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, []);

  // Complete progress when route changes
  useEffect(() => {
    const url = pathname + (searchParams?.toString() || "");
    
    if (previousPath.current !== null && previousPath.current !== url) {
      // Route changed - complete the progress
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
      setProgress(100);
      
      // Hide after animation completes
      setTimeout(() => {
        setIsNavigating(false);
        setProgress(0);
      }, 300);
    }
    
    previousPath.current = url;
  }, [pathname, searchParams]);

  return (
    <AnimatePresence>
      {isNavigating && (
        <motion.div
          className="fixed top-0 left-0 right-0 z-[9999] h-[2px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Background track */}
          <div className="absolute inset-0 bg-white/10" />
          
          {/* Progress bar - Warm Amber/Gold for Vintage Palladium vibe */}
          <motion.div
            className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-orange-400"
            style={{
              boxShadow: "0 0 10px rgba(255, 180, 0, 0.7), 0 0 5px rgba(255, 150, 0, 0.5)",
            }}
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            transition={{ 
              duration: 0.2, 
              ease: "easeOut" 
            }}
          />
          
          {/* Glowing peg at the end */}
          <motion.div
            className="absolute top-0 h-full w-20 bg-gradient-to-r from-transparent to-white/30"
            style={{
              right: `${100 - progress}%`,
              boxShadow: "0 0 15px rgba(255, 255, 255, 0.5)",
            }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default NavigationProgress;
