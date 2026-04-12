"use client";

import { usePathname } from "next/navigation";
import { ReactNode, useEffect, useState, useRef, Suspense } from "react";
import { UISound } from "@/hooks/useUISound";
import NavigationProgress from "@/components/NavigationProgress";

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

  return (
    <>
      {/* Navigation progress bar at top of viewport */}
      <Suspense fallback={null}>
        <NavigationProgress />
      </Suspense>

      {children}
    </>
  );
}

