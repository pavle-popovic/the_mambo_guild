"use client";

import { useCallback, useEffect, useRef } from "react";

// ============================================================================
// CONFIGURATION - Hardcoded for maximum tactile feel
// ============================================================================

const MASTER_VOLUME = 0.75; // 75% volume - clearly audible on laptop speakers

// Sound presets tuned for distinct, satisfying feedback
const SOUND_PRESETS = {
  // TICK: Short, crisp high-pitched click for hover (max 50ms)
  // Like a mechanical keyboard key touching the switch
  tick: {
    frequency: 3200,           // High-pitched for crispness
    type: "square" as OscillatorType,
    duration: 0.035,           // 35ms - very short and snappy
    attackTime: 0.001,         // Instant attack
    volume: 0.6,               // Prominent
  },
  
  // THOCK: Deeper bubble pop / mechanical thock for clicks
  // Satisfying, tactile "thunk" sound
  thock: {
    baseFrequency: 180,        // Deep bass
    popFrequency: 800,         // Mid "pop" harmonic
    type: "sine" as OscillatorType,
    duration: 0.12,            // 120ms - fuller body
    attackTime: 0.002,
    volume: 0.8,               // Very prominent
  },
  
  // WHOOSH: Smooth transition sweep
  whoosh: {
    startFrequency: 600,
    endFrequency: 200,
    type: "sine" as OscillatorType,
    duration: 0.25,
    attackTime: 0.02,
    volume: 0.5,
  },
  
  // SUCCESS: Satisfying completion chime
  success: {
    frequencies: [523.25, 659.25, 783.99], // C5, E5, G5 chord
    type: "sine" as OscillatorType,
    duration: 0.2,
    gap: 0.1,
    volume: 0.6,
  },
} as const;

// ============================================================================
// AUDIO ENGINE - Low-latency Web Audio API implementation
// ============================================================================

interface UIAudioContext {
  ctx: AudioContext | null;
  gainNode: GainNode | null;
  activeOscillators: Map<string, OscillatorNode[]>;
}

// Global singleton for performance
let globalAudioCtx: UIAudioContext = {
  ctx: null,
  gainNode: null,
  activeOscillators: new Map(),
};

/**
 * Initialize or get the global audio context
 */
function getAudioContext(): UIAudioContext {
  if (typeof window === "undefined") {
    return { ctx: null, gainNode: null, activeOscillators: new Map() };
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
        globalAudioCtx.gainNode.gain.value = MASTER_VOLUME;
        globalAudioCtx.activeOscillators = new Map();
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
function ensureContextResumed(): boolean {
  const { ctx } = getAudioContext();
  if (!ctx) return false;
  
  if (ctx.state === "suspended") {
    ctx.resume();
  }
  return ctx.state === "running" || ctx.state === "suspended";
}

/**
 * Stop any currently playing sounds of a given type (interrupt mode)
 */
function interruptSound(soundType: string): void {
  const { activeOscillators } = globalAudioCtx;
  const oscillators = activeOscillators.get(soundType);
  
  if (oscillators) {
    oscillators.forEach((osc) => {
      try {
        osc.stop();
      } catch {
        // Already stopped
      }
    });
    activeOscillators.delete(soundType);
  }
}

/**
 * Track an oscillator for potential interruption
 */
function trackOscillator(soundType: string, oscillator: OscillatorNode): void {
  const { activeOscillators } = globalAudioCtx;
  if (!activeOscillators.has(soundType)) {
    activeOscillators.set(soundType, []);
  }
  activeOscillators.get(soundType)!.push(oscillator);
  
  // Auto-cleanup when oscillator ends
  oscillator.onended = () => {
    const oscs = activeOscillators.get(soundType);
    if (oscs) {
      const idx = oscs.indexOf(oscillator);
      if (idx > -1) oscs.splice(idx, 1);
    }
  };
}

// ============================================================================
// SOUND FUNCTIONS - Distinct, satisfying audio feedback
// ============================================================================

/**
 * Play TICK sound - crisp, high-pitched click for hover
 * Short and snappy like a mechanical switch
 */
function playTickSound(): void {
  const { ctx, gainNode } = getAudioContext();
  if (!ctx || !gainNode || !ensureContextResumed()) return;

  // Interrupt any previous tick
  interruptSound("tick");

  const preset = SOUND_PRESETS.tick;
  const now = ctx.currentTime;

  // Main high-pitched tick
  const oscillator = ctx.createOscillator();
  const envelope = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  oscillator.type = preset.type;
  oscillator.frequency.setValueAtTime(preset.frequency, now);
  // Quick pitch drop for "click" character
  oscillator.frequency.exponentialRampToValueAtTime(preset.frequency * 0.7, now + preset.duration);

  // High-pass filter to keep it crisp
  filter.type = "highpass";
  filter.frequency.value = 1000;

  oscillator.connect(filter);
  filter.connect(envelope);
  envelope.connect(gainNode);

  // Sharp attack, quick decay
  envelope.gain.setValueAtTime(0, now);
  envelope.gain.linearRampToValueAtTime(preset.volume * MASTER_VOLUME, now + preset.attackTime);
  envelope.gain.exponentialRampToValueAtTime(0.001, now + preset.duration);

  oscillator.start(now);
  oscillator.stop(now + preset.duration);
  trackOscillator("tick", oscillator);
}

/**
 * Play THOCK sound - deep, satisfying bubble pop / mechanical thock for clicks
 * Fuller, more tactile than the tick
 */
function playThockSound(): void {
  const { ctx, gainNode } = getAudioContext();
  if (!ctx || !gainNode || !ensureContextResumed()) return;

  // Interrupt any previous thock
  interruptSound("thock");

  const preset = SOUND_PRESETS.thock;
  const now = ctx.currentTime;

  // === Layer 1: Deep bass thump ===
  const bassOsc = ctx.createOscillator();
  const bassEnv = ctx.createGain();
  
  bassOsc.type = "sine";
  bassOsc.frequency.setValueAtTime(preset.baseFrequency, now);
  bassOsc.frequency.exponentialRampToValueAtTime(preset.baseFrequency * 0.5, now + preset.duration);
  
  bassOsc.connect(bassEnv);
  bassEnv.connect(gainNode);
  
  bassEnv.gain.setValueAtTime(0, now);
  bassEnv.gain.linearRampToValueAtTime(preset.volume * MASTER_VOLUME * 0.7, now + preset.attackTime);
  bassEnv.gain.exponentialRampToValueAtTime(0.001, now + preset.duration);
  
  bassOsc.start(now);
  bassOsc.stop(now + preset.duration);
  trackOscillator("thock", bassOsc);

  // === Layer 2: Mid "pop" transient ===
  const popOsc = ctx.createOscillator();
  const popEnv = ctx.createGain();
  
  popOsc.type = "triangle";
  popOsc.frequency.setValueAtTime(preset.popFrequency, now);
  popOsc.frequency.exponentialRampToValueAtTime(preset.popFrequency * 0.4, now + 0.08);
  
  popOsc.connect(popEnv);
  popEnv.connect(gainNode);
  
  // Faster decay for the pop
  popEnv.gain.setValueAtTime(0, now);
  popEnv.gain.linearRampToValueAtTime(preset.volume * MASTER_VOLUME * 0.5, now + 0.003);
  popEnv.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
  
  popOsc.start(now);
  popOsc.stop(now + 0.08);
  trackOscillator("thock", popOsc);

  // === Layer 3: High click transient ===
  const clickOsc = ctx.createOscillator();
  const clickEnv = ctx.createGain();
  
  clickOsc.type = "square";
  clickOsc.frequency.setValueAtTime(2000, now);
  
  clickOsc.connect(clickEnv);
  clickEnv.connect(gainNode);
  
  clickEnv.gain.setValueAtTime(preset.volume * MASTER_VOLUME * 0.3, now);
  clickEnv.gain.exponentialRampToValueAtTime(0.001, now + 0.015);
  
  clickOsc.start(now);
  clickOsc.stop(now + 0.015);
  trackOscillator("thock", clickOsc);
}

/**
 * Play WHOOSH sound for page transitions
 */
function playWhooshSound(): void {
  const { ctx, gainNode } = getAudioContext();
  if (!ctx || !gainNode || !ensureContextResumed()) return;

  interruptSound("whoosh");

  const preset = SOUND_PRESETS.whoosh;
  const now = ctx.currentTime;

  // Frequency sweep oscillator
  const oscillator = ctx.createOscillator();
  const envelope = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  oscillator.type = preset.type;
  oscillator.frequency.setValueAtTime(preset.startFrequency, now);
  oscillator.frequency.exponentialRampToValueAtTime(preset.endFrequency, now + preset.duration);

  // Low-pass for smoothness
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(3000, now);
  filter.frequency.exponentialRampToValueAtTime(500, now + preset.duration);
  filter.Q.value = 2;

  oscillator.connect(filter);
  filter.connect(envelope);
  envelope.connect(gainNode);

  envelope.gain.setValueAtTime(0, now);
  envelope.gain.linearRampToValueAtTime(preset.volume * MASTER_VOLUME, now + preset.attackTime);
  envelope.gain.exponentialRampToValueAtTime(0.001, now + preset.duration);

  oscillator.start(now);
  oscillator.stop(now + preset.duration);
  trackOscillator("whoosh", oscillator);
}

/**
 * Play SUCCESS sound - ascending chord
 */
function playSuccessSound(): void {
  const { ctx, gainNode } = getAudioContext();
  if (!ctx || !gainNode || !ensureContextResumed()) return;

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
    envelope.gain.linearRampToValueAtTime(preset.volume * MASTER_VOLUME, noteStart + 0.01);
    envelope.gain.exponentialRampToValueAtTime(0.001, noteStart + preset.duration);

    oscillator.start(noteStart);
    oscillator.stop(noteStart + preset.duration);
    trackOscillator("success", oscillator);
  });
}

// ============================================================================
// HOOK & EXPORTS
// ============================================================================

/**
 * Hook for UI sounds - returns memoized sound functions
 */
export function useUISound() {
  const lastHoverTime = useRef(0);

  // Debounced tick to prevent sound spam
  const playTick = useCallback(() => {
    const now = Date.now();
    // Max 1 tick per 80ms to prevent overlap
    if (now - lastHoverTime.current < 80) return;
    lastHoverTime.current = now;
    playTickSound();
  }, []);

  const playThock = useCallback(() => {
    playThockSound();
  }, []);

  const playWhoosh = useCallback(() => {
    playWhooshSound();
  }, []);

  const playSuccess = useCallback(() => {
    playSuccessSound();
  }, []);

  // Pre-warm audio context on first interaction
  useEffect(() => {
    const warmUp = () => {
      const { ctx } = getAudioContext();
      if (ctx?.state === "suspended") {
        ctx.resume();
      }
    };
    
    document.addEventListener("click", warmUp, { once: true });
    document.addEventListener("touchstart", warmUp, { once: true });
    
    return () => {
      document.removeEventListener("click", warmUp);
      document.removeEventListener("touchstart", warmUp);
    };
  }, []);

  return {
    playTick,      // For hover - crisp, short
    playThock,     // For click - deep, satisfying
    playWhoosh,    // For transitions
    playSuccess,   // For completions
    // Legacy aliases
    playHover: playTick,
    playClick: playThock,
  };
}

/**
 * Global sound player for non-hook contexts
 */
export const UISound = {
  tick: playTickSound,
  thock: playThockSound,
  whoosh: playWhooshSound,
  success: playSuccessSound,
  // Legacy aliases
  hover: playTickSound,
  click: playThockSound,
};

export default useUISound;
