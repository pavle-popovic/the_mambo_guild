"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { MuxVideoPlayerHandle } from "@/components/MuxVideoPlayer";

const MIN_LOOP = 1.0;

export interface ABLoopState {
  enabled: boolean;
  aTime: number;
  bTime: number;
  currentTime: number;
  toggle: () => void;
  setATime: (t: number) => void;
  setBTime: (t: number) => void;
  /** Seek the underlying video to an absolute time. Exposed so the loop bar
   * can act as a scrubber — on mobile the bar visually reads as a play bar
   * (yellow loop segment + current-time indicator), and users expect to tap
   * it to advance the video. */
  seek: (t: number) => void;
}

export function useABLoop(
  playerRef: React.RefObject<MuxVideoPlayerHandle | null>,
  duration: number
): ABLoopState {
  const [enabled, setEnabled] = useState(false);
  const [aTime, setATimeRaw] = useState(0);
  const [bTime, setBTimeRaw] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const enabledRef = useRef(false);
  const aRef = useRef(0);
  const bRef = useRef(0);
  useEffect(() => { enabledRef.current = enabled; }, [enabled]);
  useEffect(() => { aRef.current = aTime; }, [aTime]);
  useEffect(() => { bRef.current = bTime; }, [bTime]);

  useEffect(() => {
    if (duration > 0 && bRef.current === 0) {
      setBTimeRaw(duration);
    }
  }, [duration]);

  useEffect(() => {
    const interval = setInterval(() => {
      const p = playerRef.current;
      if (!p) return;
      const t = p.getCurrentTime();
      setCurrentTime(t);
      if (enabledRef.current && bRef.current > aRef.current && t >= bRef.current) {
        p.setCurrentTime(aRef.current);
      }
    }, 80);
    return () => clearInterval(interval);
  }, [playerRef]);

  const toggle = useCallback(() => {
    const next = !enabledRef.current;
    enabledRef.current = next;
    setEnabled(next);
    const p = playerRef.current;
    if (p && next && bRef.current > aRef.current) {
      p.setCurrentTime(aRef.current);
      p.play();
    } else if (p && !next) {
      p.play();
    }
  }, [playerRef]);

  const setATime = useCallback((t: number) => {
    setATimeRaw(Math.max(0, Math.min(t, bRef.current - MIN_LOOP)));
  }, []);

  const setBTime = useCallback((t: number) => {
    setBTimeRaw(Math.max(t, aRef.current + MIN_LOOP));
  }, []);

  const seek = useCallback((t: number) => {
    const p = playerRef.current;
    if (!p) return;
    const clamped = Math.max(0, Math.min(t, duration || t));
    p.setCurrentTime(clamped);
    setCurrentTime(clamped);
  }, [playerRef, duration]);

  return { enabled, aTime, bTime, currentTime, toggle, setATime, setBTime, seek };
}
