"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { ReactNode, useEffect, useState, useRef, Suspense } from "react";
import { UISound } from "@/hooks/useUISound";
import NavigationProgress from "@/components/NavigationProgress";

// Transition animation configuration
const pageTransition = {
  initial: { 
    opacity: 0, 
    y: 15,  // Slide up from 15px below
  },
  animate: { 
    opacity: 1, 
    y: 0,
  },
  exit: { 
    opacity: 0, 
    y: -15, // Slide up 15px on exit
  },
  transition: {
    duration: 0.3,
    ease: [0.16, 1, 0.3, 1], // Custom easeOut curve for snappy feel
  },
};

export default function Template({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const previousPathRef = useRef<string | null>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Play whoosh sound on route change (not on initial load)
  useEffect(() => {
    if (!mounted) return;
    
    // Skip sound on initial render
    if (isFirstRender.current) {
      isFirstRender.current = false;
      previousPathRef.current = pathname;
      return;
    }
    
    // Play whoosh only when pathname actually changes
    if (previousPathRef.current !== pathname) {
      UISound.whoosh();
      previousPathRef.current = pathname;
    }
  }, [pathname, mounted]);

  // During SSR, just render children without animation to prevent hydration mismatch
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <>
      {/* Navigation progress bar at top of viewport */}
      <Suspense fallback={null}>
        <NavigationProgress />
      </Suspense>
      
      {/* Page transition wrapper */}
      <AnimatePresence mode="wait">
        <motion.div
          key={pathname}
          initial={pageTransition.initial}
          animate={pageTransition.animate}
          exit={pageTransition.exit}
          transition={pageTransition.transition}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </>
  );
}

