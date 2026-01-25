"use client";

import { useState, useEffect } from "react";
import type { MuxVideoPlayerHandle } from "../MuxVideoPlayer";

interface SpeedControlProps {
  playerRef: React.RefObject<MuxVideoPlayerHandle | null>;
}

const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5];

export default function SpeedControl({ playerRef }: SpeedControlProps) {
  const [currentSpeed, setCurrentSpeed] = useState(1);

  // Sync speed state with video element when it changes externally
  useEffect(() => {
    const checkSpeed = () => {
      if (playerRef.current) {
        const speed = playerRef.current.getPlaybackRate();
        if (speed !== currentSpeed) {
          setCurrentSpeed(speed);
        }
      }
    };

    // Check periodically in case speed is changed externally
    const interval = setInterval(checkSpeed, 500);
    return () => clearInterval(interval);
  }, [playerRef, currentSpeed]);

  const handleSpeedChange = (speed: number) => {
    if (playerRef.current) {
      playerRef.current.setPlaybackRate(speed);
      setCurrentSpeed(speed);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Speed</span>
        <div className="flex gap-1.5">
          {SPEED_OPTIONS.map((speed) => (
            <button
              key={speed}
              onClick={() => handleSpeedChange(speed)}
              className={`
                px-3 py-1.5 rounded-lg text-sm font-bold transition-all duration-200
                ${
                  currentSpeed === speed
                    ? "bg-mambo-gold text-black shadow-[0_0_10px_rgba(212,175,55,0.3)]"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
                }
              `}
            >
              {speed}x
            </button>
          ))}
        </div>
      </div>

      {/* Warning for slower speeds */}
      {currentSpeed < 0.75 && (
        <div className="flex items-center gap-1.5 text-xs text-amber-400">
          <svg
            className="w-4 h-4"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <span>Slower speeds may affect audio quality</span>
        </div>
      )}
    </div>
  );
}
