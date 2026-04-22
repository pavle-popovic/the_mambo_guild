"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { MuxVideoPlayerHandle } from "@/components/MuxVideoPlayer";

export type SkipSide = "left" | "right";

export interface DoubleTapSeekState {
  /** Which side just got a double-tap — drives the transient UI flash. */
  flash: SkipSide | null;
  /** Bind to the wrapper that sits around the video. Only fires on touch
   * devices (mouse clicks never trigger touchstart), so desktop UX is
   * unchanged. */
  onTouchStart: (e: React.TouchEvent<HTMLElement>) => void;
}

const SKIP_SECONDS = 10;
const DOUBLE_TAP_MS = 300;
const SAME_SPOT_PX = 80;

/**
 * YouTube-style double-tap-to-skip on mobile. Double-tap on the left or
 * right half of the video seeks -10s / +10s and shows a brief flash. Single
 * taps fall through so Mux's own play/pause and control toggling still work.
 *
 * Bottom 20% (Mux's scrubber + control strip) and the center 20% (play
 * button zone) are excluded so we never hijack a scrubber drag or the
 * play/pause tap.
 */
export function useDoubleTapSeek(
  playerRef: React.RefObject<MuxVideoPlayerHandle | null>
): DoubleTapSeekState {
  const lastTapRef = useRef<{ time: number; x: number } | null>(null);
  const [flash, setFlash] = useState<SkipSide | null>(null);
  const flashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
    };
  }, []);

  const onTouchStart = useCallback(
    (e: React.TouchEvent<HTMLElement>) => {
      const touch = e.touches[0];
      if (!touch) return;
      const rect = e.currentTarget.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;

      // Ignore the Mux control strip (bottom 20%) and the center play/pause
      // zone (40–60%).
      if (y > rect.height * 0.8) {
        lastTapRef.current = null;
        return;
      }
      const relX = x / rect.width;
      if (relX > 0.4 && relX < 0.6) {
        lastTapRef.current = null;
        return;
      }

      const now =
        typeof performance !== "undefined" ? performance.now() : Date.now();
      const last = lastTapRef.current;
      const sameSpot =
        last !== null && Math.abs(last.x - touch.clientX) < SAME_SPOT_PX;
      const quickEnough = last !== null && now - last.time < DOUBLE_TAP_MS;

      if (sameSpot && quickEnough) {
        const side: SkipSide = relX < 0.5 ? "left" : "right";
        const player = playerRef.current;
        if (player) {
          const current = player.getCurrentTime();
          const duration = player.getDuration();
          const delta = side === "left" ? -SKIP_SECONDS : SKIP_SECONDS;
          const target = Math.max(0, Math.min(duration || current + delta, current + delta));
          player.setCurrentTime(target);
        }
        setFlash(side);
        if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
        flashTimerRef.current = setTimeout(() => setFlash(null), 550);
        lastTapRef.current = null;
      } else {
        lastTapRef.current = { time: now, x: touch.clientX };
      }
    },
    [playerRef]
  );

  return { flash, onTouchStart };
}
