"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { ReactNode, useEffect, useState, useRef } from "react";
import { UISound } from "@/hooks/useUISound";

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
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{
          duration: 0.3,
          ease: [0.25, 0.1, 0.25, 1],
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

