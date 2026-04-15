"use client";

import { useEffect, useCallback, useState } from "react";
import type { MuxVideoPlayerHandle } from "./MuxVideoPlayer";
import SpeedControl from "./pro-controls/SpeedControl";
import FrameByFrame from "./pro-controls/FrameByFrame";
import { SlidersHorizontal } from "lucide-react";
import { FaRedo } from "react-icons/fa";

interface VideoControlsProps {
  playerRef: React.RefObject<MuxVideoPlayerHandle | null>;
  duration: number;
  onCollapse?: () => void;
  variant?: "sidebar" | "mobile";
  abEnabled?: boolean;
  onToggleAB?: () => void;
}

// 1 frame at approximately 25fps
const FRAME_DURATION = 0.04;

export default function VideoControls({
  playerRef,
  variant = "sidebar",
  onCollapse,
  abEnabled = false,
  onToggleAB,
}: VideoControlsProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState<"speed" | "frames" | null>(null);

  // Keyboard shortcuts for frame stepping (available to all users now)
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!playerRef.current) return;
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
    [playerRef]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

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

          {/* A/B Loop toggle */}
          {onToggleAB && (
            <button
              onClick={onToggleAB}
              className={`flex flex-col items-center gap-1 ${abEnabled ? "text-mambo-gold" : "text-gray-300"}`}
            >
              <FaRedo className={`text-xl ${abEnabled ? "animate-spin" : ""}`} style={{ animationDuration: "2s" }} />
              <span className="text-[10px] uppercase font-bold tracking-wider">A/B Loop</span>
            </button>
          )}
        </div>

        {/* Mobile Expanded Menus */}
        {mobileMenuOpen && (
          <div className="absolute bottom-full left-0 w-full bg-gray-900/95 backdrop-blur-xl border-t border-white/10 p-4 rounded-t-2xl animate-slide-up shadow-2xl">
            <div className="flex justify-between items-center mb-4 border-b border-gray-800 pb-2">
              <span className="text-sm font-bold text-white uppercase tracking-wider">
                {mobileMenuOpen === "speed" && "Playback Speed"}
                {mobileMenuOpen === "frames" && "Frame Precision"}
              </span>
              <button onClick={() => setMobileMenuOpen(null)} className="text-xs text-gray-400 p-2">Close</button>
            </div>

            {mobileMenuOpen === "speed" && <SpeedControl playerRef={playerRef} />}
            {mobileMenuOpen === "frames" && <FrameByFrame playerRef={playerRef} />}
          </div>
        )}
      </div>
    );
  }

  // --- DESKTOP SIDEBAR LAYOUT ---
  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={16} className="text-mambo-blue" />
          <span className="text-xs font-bold text-white/80 uppercase tracking-wider">Video Controls</span>
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
      <div className="space-y-3">
        {/* Speed */}
        <div>
          <SpeedControl playerRef={playerRef} />
        </div>

        {/* Frames */}
        <div>
          <FrameByFrame playerRef={playerRef} />
        </div>

        {/* A/B Loop toggle — big, obvious, shows overlay on video when enabled */}
        {onToggleAB && (
          <div className="pt-3 border-t border-white/5">
            <button
              onClick={onToggleAB}
              className={`w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg font-extrabold text-sm uppercase tracking-wide transition-all ${
                abEnabled
                  ? "bg-mambo-gold text-black border-2 border-yellow-200 shadow-[0_0_25px_rgba(212,175,55,1)] hover:brightness-110 animate-pulse-glow-gold"
                  : "bg-white/10 text-white hover:bg-white/15 border border-white/20"
              }`}
            >
              <FaRedo className={abEnabled ? "animate-spin" : ""} style={{ animationDuration: "2s" }} />
              <span>{abEnabled ? "Turn OFF A/B Loop" : "Enable A/B Loop"}</span>
            </button>
            {abEnabled && (
              <p className="text-[10px] text-gray-400 text-center mt-1.5">
                Drag the A and B markers on the video to set the loop.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
