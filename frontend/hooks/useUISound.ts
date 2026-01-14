"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Sound configuration for different UI interactions
interface SoundConfig {
  enabled: boolean;
  volume: number;
}

interface UIAudioContext {
  ctx: AudioContext | null;
  gainNode: GainNode | null;
}

// Global audio context (singleton for performance)
let globalAudioCtx: UIAudioContext = {
  ctx: null,
  gainNode: null,
};

// Pre-computed oscillator settings for different sound types
const SOUND_PRESETS = {
  // Soft pop for clicks - 880Hz triangle wave with fast decay
  click: {
    frequency: 880,
    type: "triangle" as OscillatorType,
    duration: 0.06,
    attackTime: 0.005,
    decayTime: 0.055,
    volume: 0.15,
  },
  // Subtle tick for hover - higher frequency, very short
  hover: {
    frequency: 1200,
    type: "sine" as OscillatorType,
    duration: 0.03,
    attackTime: 0.002,
    decayTime: 0.028,
    volume: 0.08,
  },
  // Swoosh for transitions - frequency sweep with noise
  whoosh: {
    startFrequency: 400,
    endFrequency: 150,
    type: "sine" as OscillatorType,
    duration: 0.2,
    attackTime: 0.01,
    decayTime: 0.19,
    volume: 0.12,
  },
  // Success sound - ascending tones
  success: {
    frequencies: [523.25, 659.25, 783.99], // C5, E5, G5
    type: "sine" as OscillatorType,
    duration: 0.15,
    gap: 0.08,
    volume: 0.1,
  },
} as const;

/**
 * Initialize or get the global audio context
 * Lazy initialization for performance - only creates when first sound is played
 */
function getAudioContext(): UIAudioContext {
  if (typeof window === "undefined") {
    return { ctx: null, gainNode: null };
  }

  if (!globalAudioCtx.ctx) {
    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        globalAudioCtx.ctx = new AudioContextClass();
        globalAudioCtx.gainNode = globalAudioCtx.ctx.createGain();
        globalAudioCtx.gainNode.connect(globalAudioCtx.ctx.destination);
        globalAudioCtx.gainNode.gain.value = 0.5; // Master volume
      }
    } catch (e) {
      console.warn("Web Audio API not supported:", e);
    }
  }

  return globalAudioCtx;
}

/**
 * Resume audio context after user interaction (required by browsers)
 */
async function ensureContextResumed(): Promise<boolean> {
  const { ctx } = getAudioContext();
  if (ctx && ctx.state === "suspended") {
    try {
      await ctx.resume();
      return true;
    } catch {
      return false;
    }
  }
  return ctx?.state === "running";
}

/**
 * Play a synthetic click sound using Web Audio API
 * Zero latency, no file loading required
 */
function playClickSound(volume: number = SOUND_PRESETS.click.volume): void {
  const { ctx, gainNode } = getAudioContext();
  if (!ctx || !gainNode) return;

  ensureContextResumed().then((resumed) => {
    if (!resumed) return;

    const preset = SOUND_PRESETS.click;
    const now = ctx.currentTime;

    // Create oscillator
    const oscillator = ctx.createOscillator();
    const envelope = ctx.createGain();

    oscillator.type = preset.type;
    oscillator.frequency.value = preset.frequency;

    // Connect nodes
    oscillator.connect(envelope);
    envelope.connect(gainNode);

    // Shape the envelope (attack-decay)
    envelope.gain.setValueAtTime(0, now);
    envelope.gain.linearRampToValueAtTime(volume, now + preset.attackTime);
    envelope.gain.exponentialRampToValueAtTime(0.001, now + preset.duration);

    // Play and cleanup
    oscillator.start(now);
    oscillator.stop(now + preset.duration);
  });
}

/**
 * Play a subtle hover tick sound
 */
function playHoverSound(volume: number = SOUND_PRESETS.hover.volume): void {
  const { ctx, gainNode } = getAudioContext();
  if (!ctx || !gainNode) return;

  ensureContextResumed().then((resumed) => {
    if (!resumed) return;

    const preset = SOUND_PRESETS.hover;
    const now = ctx.currentTime;

    const oscillator = ctx.createOscillator();
    const envelope = ctx.createGain();

    oscillator.type = preset.type;
    oscillator.frequency.value = preset.frequency;

    oscillator.connect(envelope);
    envelope.connect(gainNode);

    envelope.gain.setValueAtTime(0, now);
    envelope.gain.linearRampToValueAtTime(volume, now + preset.attackTime);
    envelope.gain.exponentialRampToValueAtTime(0.001, now + preset.duration);

    oscillator.start(now);
    oscillator.stop(now + preset.duration);
  });
}

/**
 * Play a whoosh sound for page transitions
 * Uses frequency sweep for a swooshing effect
 */
function playWhooshSound(volume: number = SOUND_PRESETS.whoosh.volume): void {
  const { ctx, gainNode } = getAudioContext();
  if (!ctx || !gainNode) return;

  ensureContextResumed().then((resumed) => {
    if (!resumed) return;

    const preset = SOUND_PRESETS.whoosh;
    const now = ctx.currentTime;

    // Create oscillator with frequency sweep
    const oscillator = ctx.createOscillator();
    const envelope = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    oscillator.type = preset.type;
    oscillator.frequency.setValueAtTime(preset.startFrequency, now);
    oscillator.frequency.exponentialRampToValueAtTime(
      preset.endFrequency,
      now + preset.duration
    );

    // Low-pass filter for smoothness
    filter.type = "lowpass";
    filter.frequency.value = 2000;
    filter.Q.value = 1;

    // Connect nodes
    oscillator.connect(filter);
    filter.connect(envelope);
    envelope.connect(gainNode);

    // Envelope
    envelope.gain.setValueAtTime(0, now);
    envelope.gain.linearRampToValueAtTime(volume, now + preset.attackTime);
    envelope.gain.exponentialRampToValueAtTime(0.001, now + preset.duration);

    oscillator.start(now);
    oscillator.stop(now + preset.duration);
  });
}

/**
 * Play a success sound (ascending tones)
 */
function playSuccessSound(volume: number = SOUND_PRESETS.success.volume): void {
  const { ctx, gainNode } = getAudioContext();
  if (!ctx || !gainNode) return;

  ensureContextResumed().then((resumed) => {
    if (!resumed) return;

    const preset = SOUND_PRESETS.success;
    const now = ctx.currentTime;

    preset.frequencies.forEach((freq, i) => {
      const oscillator = ctx.createOscillator();
      const envelope = ctx.createGain();

      oscillator.type = preset.type;
      oscillator.frequency.value = freq;

      oscillator.connect(envelope);
      envelope.connect(gainNode);

      const noteStart = now + i * preset.gap;
      envelope.gain.setValueAtTime(0, noteStart);
      envelope.gain.linearRampToValueAtTime(volume, noteStart + 0.01);
      envelope.gain.exponentialRampToValueAtTime(
        0.001,
        noteStart + preset.duration
      );

      oscillator.start(noteStart);
      oscillator.stop(noteStart + preset.duration);
    });
  });
}

/**
 * Hook for UI sounds with easy configuration
 * @returns Object with sound playing functions and controls
 */
export function useUISound(config?: Partial<SoundConfig>) {
  const [enabled, setEnabled] = useState(config?.enabled ?? true);
  const [volume, setVolume] = useState(config?.volume ?? 0.5);
  const lastHoverTime = useRef(0);

  // Debounced hover to prevent sound spam
  const playHover = useCallback(() => {
    if (!enabled) return;
    const now = Date.now();
    // Debounce hover sounds to max 1 per 100ms
    if (now - lastHoverTime.current < 100) return;
    lastHoverTime.current = now;
    playHoverSound(SOUND_PRESETS.hover.volume * volume);
  }, [enabled, volume]);

  const playClick = useCallback(() => {
    if (!enabled) return;
    playClickSound(SOUND_PRESETS.click.volume * volume);
  }, [enabled, volume]);

  const playWhoosh = useCallback(() => {
    if (!enabled) return;
    playWhooshSound(SOUND_PRESETS.whoosh.volume * volume);
  }, [enabled, volume]);

  const playSuccess = useCallback(() => {
    if (!enabled) return;
    playSuccessSound(SOUND_PRESETS.success.volume * volume);
  }, [enabled, volume]);

  // Pre-warm audio context on first user interaction
  useEffect(() => {
    const warmUp = () => {
      getAudioContext();
      document.removeEventListener("click", warmUp);
      document.removeEventListener("keydown", warmUp);
    };
    document.addEventListener("click", warmUp, { once: true });
    document.addEventListener("keydown", warmUp, { once: true });
    return () => {
      document.removeEventListener("click", warmUp);
      document.removeEventListener("keydown", warmUp);
    };
  }, []);

  return {
    playClick,
    playHover,
    playWhoosh,
    playSuccess,
    enabled,
    setEnabled,
    volume,
    setVolume,
  };
}

/**
 * Global sound player for use in non-hook contexts
 * (e.g., route change handlers)
 */
export const UISound = {
  click: playClickSound,
  hover: playHoverSound,
  whoosh: playWhooshSound,
  success: playSuccessSound,
  setMasterVolume: (volume: number) => {
    const { gainNode } = getAudioContext();
    if (gainNode) {
      gainNode.gain.value = Math.max(0, Math.min(1, volume));
    }
  },
};

export default useUISound;
