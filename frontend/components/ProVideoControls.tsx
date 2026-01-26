"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import type { MuxVideoPlayerHandle } from "./MuxVideoPlayer";
import SpeedControl from "./pro-controls/SpeedControl";
import FrameByFrame from "./pro-controls/FrameByFrame";
import ABLooper from "./pro-controls/ABLooper";
import UpgradePrompt from "./pro-controls/UpgradePrompt";
import { FaCrown, FaRedo } from "react-icons/fa";

interface ProVideoControlsProps {
  playerRef: React.RefObject<MuxVideoPlayerHandle | null>;
  isPerformer: boolean;
  duration: number;
  onUpgradeClick?: () => void;
  onCollapse?: () => void;
}

// 1 frame at approximately 25fps
const FRAME_DURATION = 0.04;

export default function ProVideoControls({
  playerRef,
  isPerformer,
  duration,
  onUpgradeClick,
  variant = "sidebar",
  onCollapse,
}: ProVideoControlsProps & { variant?: "sidebar" | "mobile" }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<"speed" | "loop" | "frames" | null>(null);

  // Keyboard shortcuts (keep existing logic)
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isPerformer || !playerRef.current) return;
      if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA") return;
      if (playerRef.current.isPaused()) {
        if (e.key === ",") {
          e.preventDefault();
          const t = playerRef.current.getCurrentTime();
          playerRef.current.setCurrentTime(Math.max(t - FRAME_DURATION, 0));
        } else if (e.key === ".") {
          e.preventDefault();
          const t = playerRef.current.getCurrentTime();
          playerRef.current.setCurrentTime(Math.min(t + FRAME_DURATION, playerRef.current.getDuration()));
        }
      }
    },
    [isPerformer, playerRef]
  );

  useEffect(() => {
    if (isPerformer) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [isPerformer, handleKeyDown]);

  if (!isPerformer) {
    return (
      <div className="p-4 bg-gray-900 rounded-xl border border-gray-800">
        <UpgradePrompt onUpgrade={onUpgradeClick} />
      </div>
    );
  }

  // --- MOBILE STICKY LAYOUT ---
  if (variant === "mobile") {
    return (
      <div className="bg-black/80 backdrop-blur-xl border-t border-white/10 px-4 py-3 pb-safe">
        <div className="flex items-center justify-around">
          {/* Speed Toggle */}
          <button
            onClick={() => setMobileMenuOpen(mobileMenuOpen === "speed" ? null : "speed")}
            className={`flex flex-col items-center gap-1 ${mobileMenuOpen === "speed" ? "text-mambo-gold" : "text-gray-300"}`}
          >
            <span className="text-xl font-bold">1x</span>
            <span className="text-[10px] uppercase font-bold tracking-wider">Speed</span>
          </button>

          {/* Frame Steps */}
          <button
            onClick={() => setMobileMenuOpen(mobileMenuOpen === "frames" ? null : "frames")}
            className={`flex flex-col items-center gap-1 ${mobileMenuOpen === "frames" ? "text-mambo-gold" : "text-gray-300"}`}
          >
            <span className="text-xl">⏯</span>
            <span className="text-[10px] uppercase font-bold tracking-wider">Frames</span>
          </button>

          {/* Loop Toggle */}
          <button
            onClick={() => setMobileMenuOpen(mobileMenuOpen === "loop" ? null : "loop")}
            className={`flex flex-col items-center gap-1 ${mobileMenuOpen === "loop" ? "text-mambo-gold" : "text-gray-300"}`}
          >
            <FaRedo className="text-xl" />
            <span className="text-[10px] uppercase font-bold tracking-wider">Loop</span>
          </button>
        </div>

        {/* Mobile Expanded Menus */}
        {mobileMenuOpen && (
          <div className="absolute bottom-full left-0 w-full bg-gray-900/95 backdrop-blur-xl border-t border-white/10 p-4 rounded-t-2xl animate-slide-up shadow-2xl">
            <div className="flex justify-between items-center mb-4 border-b border-gray-800 pb-2">
              <span className="text-sm font-bold text-white uppercase tracking-wider">
                {mobileMenuOpen === "speed" && "Playback Speed"}
                {mobileMenuOpen === "frames" && "Frame Precision"}
                {mobileMenuOpen === "loop" && "A-B Repeat"}
              </span>
              <button onClick={() => setMobileMenuOpen(null)} className="text-xs text-gray-400 p-2">Close</button>
            </div>

            {mobileMenuOpen === "speed" && <SpeedControl playerRef={playerRef} />}
            {mobileMenuOpen === "frames" && <FrameByFrame playerRef={playerRef} />}
            {mobileMenuOpen === "loop" && <ABLooper playerRef={playerRef} duration={duration} />}
          </div>
        )}
      </div>
    );
  }

  // --- DESKTOP SIDEBAR LAYOUT ---
  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <FaCrown className="text-mambo-gold" />
          <span className="text-xs font-bold text-mambo-gold uppercase tracking-wider">Pro Controls</span>
        </div>
        {onCollapse && (
          <button
            onClick={onCollapse}
            className="text-gray-500 hover:text-white transition-colors p-1"
            title="Minimize Controls"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Controls Stack */}
      <div className="space-y-4">
        {/* Speed */}
        <div>
          <SpeedControl playerRef={playerRef} />
        </div>

        {/* Frames */}
        <div>
          <FrameByFrame playerRef={playerRef} />
        </div>

        {/* Loop */}
        <div className="pt-2 border-t border-white/5">
          <ABLooper playerRef={playerRef} duration={duration} />
        </div>
      </div>
    </div>
  );
}
