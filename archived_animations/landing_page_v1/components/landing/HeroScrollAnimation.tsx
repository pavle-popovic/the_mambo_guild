"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { Clickable } from "@/components/ui/motion";
import HeroOverlayEffects from "./HeroOverlayEffects";
import Mambobot from "./Mambobot";

const TOTAL_FRAMES = 192;
const FRAME_PATH = "/assets/hero-frames/frame_";

// Generate frame URLs
const getFrameUrl = (index: number): string => {
  const paddedIndex = index.toString().padStart(3, "0");
  return `${FRAME_PATH}${paddedIndex}.jpg`;
};

interface HeroScrollAnimationProps {
  user?: { first_name?: string } | null;
}

export default function HeroScrollAnimation({ user }: HeroScrollAnimationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Use Ref for images to avoid 192 re-renders and blocking state updates
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const [firstFrameLoaded, setFirstFrameLoaded] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  // Map scroll progress to frame index
  const frameIndex = useTransform(scrollYProgress, [0, 1], [0, TOTAL_FRAMES - 1]);

  // Text opacity fades out as user scrolls
  const textOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const textY = useTransform(scrollYProgress, [0, 0.3], [0, -50]);

  // Render frame to canvas
  const renderFrame = useCallback(
    (index: number) => {
      if (!canvasRef.current) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const frameIdx = Math.min(Math.max(Math.round(index), 0), TOTAL_FRAMES - 1);

      // Fallback: If specific frame isn't loaded yet, use the closest previous one, or Frame 0
      // This ensures we always show SOMETHING (the door) rather than blinking
      let img = imagesRef.current[frameIdx];
      if (!img) {
        // Find closest loaded frame backwards
        for (let i = frameIdx - 1; i >= 0; i--) {
          if (imagesRef.current[i]) {
            img = imagesRef.current[i];
            break;
          }
        }
        // Last resort: Frame 0 (which is guaranteed loaded if firstFrameLoaded is true)
        if (!img) img = imagesRef.current[0];
      }

      if (img) {
        // Clear and draw
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // ZOOM OUT: User requested "zoom it out a lot more".
        const containScale = Math.min(
          canvas.width / img.width,
          canvas.height / img.height
        );

        // Apply an additional factor to zoom (1.05 = ~20% bigger than 0.85)
        const finalScale = containScale * 1.05;

        // Calculate centering positions with Navbar offset
        const x = (canvas.width - img.width * finalScale) / 2;
        // Move image DOWN significantly per user request (~2cm/50-70px).
        // navbarOffset was 10. Increasing it pushes 'y' larger (down).
        const navbarOffset = 70;
        const y = (canvas.height - img.height * finalScale) / 2 + (navbarOffset / 2);

        ctx.drawImage(img, x, y, img.width * finalScale, img.height * finalScale);
      }
    },
    []
  );

  // Progressive Image Loading
  useEffect(() => {
    // 1. Load Frame 0 IMMEDIATELY
    const loadFirstFrame = () => {
      const img = new Image();
      img.src = getFrameUrl(0);
      img.onload = () => {
        imagesRef.current[0] = img;
        setFirstFrameLoaded(true);
        // Force initial render immediately
        renderFrame(0);

        // 2. Start loading the rest in background
        loadRestOfFrames();
      };
    };

    const loadRestOfFrames = () => {
      let loadedCount = 1;

      for (let i = 1; i < TOTAL_FRAMES; i++) {
        const img = new Image();
        img.src = getFrameUrl(i);
        img.onload = () => {
          imagesRef.current[i] = img;
          loadedCount++;
          // Update progress bar occasionally (every 10 frames) to minimize React renders
          if (loadedCount % 10 === 0 || loadedCount === TOTAL_FRAMES) {
            setLoadProgress(loadedCount);
          }
        };
      }
    };

    loadFirstFrame();
  }, [renderFrame]);

  // Update canvas on scroll
  useEffect(() => {
    if (!firstFrameLoaded) return;

    const unsubscribe = frameIndex.on("change", (latest) => {
      renderFrame(latest);
    });

    // Initial render
    renderFrame(frameIndex.get());

    return () => unsubscribe();
  }, [firstFrameLoaded, frameIndex, renderFrame]);

  // Handle canvas resize with DPI support
  useEffect(() => {
    const handleResize = () => {
      if (!canvasRef.current) return;

      const dpr = window.devicePixelRatio || 1;
      canvasRef.current.width = window.innerWidth * dpr;
      canvasRef.current.height = window.innerHeight * dpr;

      if (firstFrameLoaded) {
        renderFrame(frameIndex.get());
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [firstFrameLoaded, frameIndex, renderFrame]);

  // Custom Slow Scroll Function (approx 2.5 seconds)
  const handleOpenDoor = () => {
    const start = window.scrollY;
    // Scroll EXACTLY to the end of the container (250vh) to ensure the last frame (191) is rendered.
    // We add a tiny 2px buffer to avoid any rounding errors keeping it at frame 190.
    const end = window.innerHeight * 2.5 + 2;

    const distance = end - start;
    const duration = 2500; // 2.5 seconds
    let startTime: number | null = null;

    const animation = (currentTime: number) => {
      if (startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1);

      // Ease in-out cubic function for cinematic feel
      const ease = progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      window.scrollTo(0, start + distance * ease);

      if (timeElapsed < duration) {
        requestAnimationFrame(animation);
      }
    };

    requestAnimationFrame(animation);
  };

  return (
    <div ref={containerRef} className="relative h-[250vh]">
      {/* Fixed canvas container */}
      <div className="fixed inset-0 w-full h-screen z-0 bg-black">
        {/* Loading state */}
        {!firstFrameLoaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-20">
            <div className="w-64 h-1 bg-white/10 rounded-full overflow-hidden mb-4">
              <motion.div
                className="h-full bg-mambo-gold"
                initial={{ width: 0 }}
                animate={{ width: `${(loadProgress / TOTAL_FRAMES) * 100}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
          </div>
        )}

        {/* Canvas for animation */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Live Visual Effects (Neon, Smoke, Glows) */}
        <HeroOverlayEffects scrollProgress={scrollYProgress} />

        {/* Improved Overlay strategy */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.3)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      {/* ScrollyTelling Content */}
      <motion.div
        className="fixed inset-0 flex flex-col items-center justify-end pb-[45vh] z-10 pointer-events-none"
        style={{ opacity: textOpacity, y: textY }}
      >
        <div className="text-center px-4 max-w-4xl mx-auto pointer-events-auto">

          {/* Vintage Jazzy Auto-Scroll Prompt Button */}
          <motion.button
            initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
            animate={{
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
              scale: [1, 1.05, 1], // Bouncing/Scaling as requested
              textShadow: [
                "0 0 10px #fbbf24",
                "0 0 20px #fbbf24",
                "0 0 10px #fbbf24"
              ]
            }}
            whileHover={{ scale: 1.1, filter: "brightness(1.2)" }}
            transition={{
              opacity: { delay: 0.1, duration: 0.6, ease: "easeOut" },
              y: { delay: 0.1, duration: 0.6, ease: "easeOut" },
              filter: { delay: 0.1, duration: 0.6 },
              textShadow: { repeat: Infinity, duration: 2, ease: "easeInOut" },
              scale: { repeat: Infinity, duration: 2, ease: "easeInOut" } // Continuous bounce
            }}
            onClick={handleOpenDoor}
            // Ultra-Glow Styling: Layered shadows for intense effect, lifted position
            className="group relative px-12 py-3 bg-black/60 backdrop-blur-md border-[2px] border-mambo-gold rounded-full overflow-hidden transition-all duration-300 shadow-[0_0_20px_#fbbf24,0_0_60px_#fbbf24,0_0_100px_rgba(251,191,36,0.4)] hover:shadow-[0_0_40px_#fbbf24,0_0_80px_#fbbf24,0_0_120px_rgba(251,191,36,0.8)] hover:border-white/50"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-mambo-gold/40 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />

            <div className="flex flex-col items-center justify-center">
              <span className="font-serif text-2xl font-black text-mambo-gold tracking-[0.2em] uppercase" style={{ textShadow: "0 2px 4px rgba(0,0,0,0.8)" }}>
                Enter
              </span>
            </div>
          </motion.button>
        </div>
      </motion.div >

      {/* Content that appears AFTER the door opens (scroll > 100vh) */}
      < div className="relative z-10 pointer-events-none h-screen" />

      {/* --- WATERMARK MASKS --- */}
      {/* Bottom Left Mask (Veo) - Persist */}
      <div className="fixed bottom-2 left-2 w-16 h-8 bg-black blur-sm z-20 pointer-events-none" />

      {/* Mambobot covers the Bottom Right (Gemini) watermark */}
      <Mambobot />




    </div >
  );
}
