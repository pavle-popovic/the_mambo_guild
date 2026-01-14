"use client";

import { useCallback, useEffect, useRef } from "react";

// ============================================================================
// VINTAGE SALSA / PALLADIUM (1950s NYC) - PERCUSSION SECTION
// Organic, Warm, and Rhythmic - Purely percussive sounds
// ============================================================================

const MASTER_VOLUME = 0.4; // Acoustic sounds cut through well at lower volume

// ============================================================================
// AUDIO ENGINE
// ============================================================================

interface UIAudioContext {
  ctx: AudioContext | null;
  gainNode: GainNode | null;
}

let globalAudioCtx: UIAudioContext = {
  ctx: null,
  gainNode: null,
};

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
        globalAudioCtx.gainNode.gain.value = MASTER_VOLUME;
      }
    } catch (e) {
      console.warn("Web Audio API not supported:", e);
    }
  }

  return globalAudioCtx;
}

function ensureContextResumed(): boolean {
  const { ctx } = getAudioContext();
  if (!ctx) return false;
  if (ctx.state === "suspended") ctx.resume();
  return ctx.state === "running" || ctx.state === "suspended";
}

// ============================================================================
// SHAKER / MARACA - Hover Sound (LOUDER)
// Crisp "chhh" sound - white noise burst with high-pass filter
// Max 80ms, with random pitch shift (0.95 - 1.05)
// ============================================================================

function playShaker(pitchShift: number = 1.0): void {
  const { ctx, gainNode } = getAudioContext();
  if (!ctx || !gainNode || !ensureContextResumed()) return;

  const now = ctx.currentTime;
  const duration = 0.08; // 80ms - crisp and short

  // Create white noise buffer
  const bufferSize = ctx.sampleRate * duration;
  const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const output = noiseBuffer.getChannelData(0);
  
  for (let i = 0; i < bufferSize; i++) {
    output[i] = Math.random() * 2 - 1;
  }

  const noise = ctx.createBufferSource();
  noise.buffer = noiseBuffer;
  noise.playbackRate.value = pitchShift;

  // High-pass filter for crisp "chhh" character
  const highpass = ctx.createBiquadFilter();
  highpass.type = "highpass";
  highpass.frequency.value = 6000 * pitchShift;
  highpass.Q.value = 0.7;

  // Band-pass for maraca resonance
  const bandpass = ctx.createBiquadFilter();
  bandpass.type = "bandpass";
  bandpass.frequency.value = 5000 * pitchShift;
  bandpass.Q.value = 1.5;

  // Envelope - sharp attack, quick decay - LOUDER
  const envelope = ctx.createGain();
  envelope.gain.setValueAtTime(0, now);
  envelope.gain.linearRampToValueAtTime(1.2, now + 0.003); // Faster attack, louder peak
  envelope.gain.exponentialRampToValueAtTime(0.001, now + duration);

  // Connect chain
  noise.connect(highpass);
  highpass.connect(bandpass);
  bandpass.connect(envelope);
  envelope.connect(gainNode);

  noise.start(now);
  noise.stop(now + duration);
}

// ============================================================================
// TIMBALE - Click Sound
// Bright metallic shell hit - classic salsa percussion
// Sharp attack with ringing metallic overtones
// ============================================================================

function playTimbale(): void {
  const { ctx, gainNode } = getAudioContext();
  if (!ctx || !gainNode || !ensureContextResumed()) return;

  const now = ctx.currentTime;
  const duration = 0.12; // 120ms - metallic ring

  // === Shell tone (fundamental) - bright, metallic ===
  const shell = ctx.createOscillator();
  shell.type = "sine";
  shell.frequency.setValueAtTime(520, now); // Timbale shell pitch
  shell.frequency.exponentialRampToValueAtTime(480, now + duration);

  // === First overtone - metallic ring ===
  const ring1 = ctx.createOscillator();
  ring1.type = "sine";
  ring1.frequency.setValueAtTime(1040, now); // 2x fundamental
  ring1.frequency.exponentialRampToValueAtTime(960, now + 0.08);

  // === Second overtone - brightness ===
  const ring2 = ctx.createOscillator();
  ring2.type = "sine";
  ring2.frequency.setValueAtTime(1560, now); // 3x fundamental
  ring2.frequency.exponentialRampToValueAtTime(1440, now + 0.06);

  // === Stick attack transient - the "tick" ===
  const stick = ctx.createOscillator();
  stick.type = "triangle";
  stick.frequency.setValueAtTime(4000, now);
  stick.frequency.exponentialRampToValueAtTime(2000, now + 0.008);

  // === High metallic shimmer ===
  const shimmer = ctx.createOscillator();
  shimmer.type = "sine";
  shimmer.frequency.setValueAtTime(3200, now);

  // Envelopes
  const shellEnv = ctx.createGain();
  shellEnv.gain.setValueAtTime(0.9, now);
  shellEnv.gain.exponentialRampToValueAtTime(0.001, now + duration);

  const ring1Env = ctx.createGain();
  ring1Env.gain.setValueAtTime(0.5, now);
  ring1Env.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

  const ring2Env = ctx.createGain();
  ring2Env.gain.setValueAtTime(0.3, now);
  ring2Env.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

  const stickEnv = ctx.createGain();
  stickEnv.gain.setValueAtTime(0.6, now);
  stickEnv.gain.exponentialRampToValueAtTime(0.001, now + 0.012);

  const shimmerEnv = ctx.createGain();
  shimmerEnv.gain.setValueAtTime(0.15, now);
  shimmerEnv.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

  // High-pass filter to remove mud
  const highpass = ctx.createBiquadFilter();
  highpass.type = "highpass";
  highpass.frequency.value = 300;
  highpass.Q.value = 0.5;

  // Resonant peak for metallic character
  const resonance = ctx.createBiquadFilter();
  resonance.type = "peaking";
  resonance.frequency.value = 1200;
  resonance.Q.value = 4;
  resonance.gain.value = 6;

  // Connect shell and rings through filters
  shell.connect(shellEnv);
  ring1.connect(ring1Env);
  ring2.connect(ring2Env);
  stick.connect(stickEnv);
  shimmer.connect(shimmerEnv);

  shellEnv.connect(highpass);
  ring1Env.connect(highpass);
  ring2Env.connect(highpass);
  highpass.connect(resonance);
  resonance.connect(gainNode);

  // Stick and shimmer direct to output
  stickEnv.connect(gainNode);
  shimmerEnv.connect(gainNode);

  // Start all oscillators
  shell.start(now);
  ring1.start(now);
  ring2.start(now);
  stick.start(now);
  shimmer.start(now);

  // Stop all oscillators
  shell.stop(now + duration);
  ring1.stop(now + 0.08);
  ring2.stop(now + 0.06);
  stick.stop(now + 0.012);
  shimmer.stop(now + 0.04);
}

// ============================================================================
// CONGA SLAP - Navigation Sound  
// Open tone with slap attack - warm, resonant "pah" sound
// ~180ms duration for richness
// ============================================================================

function playCongaSlap(): void {
  const { ctx, gainNode } = getAudioContext();
  if (!ctx || !gainNode || !ensureContextResumed()) return;

  const now = ctx.currentTime;
  const duration = 0.18; // 180ms - warm and resonant

  // Fundamental tone (low, warm)
  const fundamental = ctx.createOscillator();
  fundamental.type = "sine";
  fundamental.frequency.setValueAtTime(180, now);
  fundamental.frequency.exponentialRampToValueAtTime(120, now + duration);

  // Second harmonic
  const harmonic2 = ctx.createOscillator();
  harmonic2.type = "sine";
  harmonic2.frequency.setValueAtTime(360, now);
  harmonic2.frequency.exponentialRampToValueAtTime(240, now + 0.1);

  // Slap transient (high, sharp)
  const slap = ctx.createOscillator();
  slap.type = "triangle";
  slap.frequency.setValueAtTime(800, now);
  slap.frequency.exponentialRampToValueAtTime(300, now + 0.03);

  // Noise burst for skin texture
  const noiseLength = 0.02;
  const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * noiseLength, ctx.sampleRate);
  const noiseData = noiseBuffer.getChannelData(0);
  for (let i = 0; i < noiseData.length; i++) {
    noiseData[i] = Math.random() * 2 - 1;
  }
  const noise = ctx.createBufferSource();
  noise.buffer = noiseBuffer;

  // Envelopes
  const fundEnv = ctx.createGain();
  fundEnv.gain.setValueAtTime(0.8, now);
  fundEnv.gain.exponentialRampToValueAtTime(0.001, now + duration);

  const harm2Env = ctx.createGain();
  harm2Env.gain.setValueAtTime(0.4, now);
  harm2Env.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

  const slapEnv = ctx.createGain();
  slapEnv.gain.setValueAtTime(0.5, now);
  slapEnv.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

  const noiseEnv = ctx.createGain();
  noiseEnv.gain.setValueAtTime(0.3, now);
  noiseEnv.gain.exponentialRampToValueAtTime(0.001, now + noiseLength);

  // Low-pass filter for warmth
  const lowpass = ctx.createBiquadFilter();
  lowpass.type = "lowpass";
  lowpass.frequency.value = 2000;
  lowpass.Q.value = 1;

  // Band-pass for noise (skin slap character)
  const noiseBand = ctx.createBiquadFilter();
  noiseBand.type = "bandpass";
  noiseBand.frequency.value = 3000;
  noiseBand.Q.value = 1;

  // Connect
  fundamental.connect(fundEnv);
  harmonic2.connect(harm2Env);
  slap.connect(slapEnv);
  noise.connect(noiseBand);
  noiseBand.connect(noiseEnv);

  fundEnv.connect(lowpass);
  harm2Env.connect(lowpass);
  slapEnv.connect(lowpass);
  lowpass.connect(gainNode);
  noiseEnv.connect(gainNode);

  fundamental.start(now);
  harmonic2.start(now);
  slap.start(now);
  noise.start(now);

  fundamental.stop(now + duration);
  harmonic2.stop(now + 0.1);
  slap.stop(now + 0.04);
  noise.stop(now + noiseLength);
}

// ============================================================================
// HOOK & EXPORTS
// ============================================================================

export function useUISound() {
  const lastHoverTime = useRef(0);

  // Shaker with random pitch shift (0.95 - 1.05) for human feel
  const playHover = useCallback(() => {
    const now = Date.now();
    // Debounce: max 1 per 100ms to avoid noise mess
    if (now - lastHoverTime.current < 100) return;
    lastHoverTime.current = now;
    
    // Random pitch shift for natural variation
    const pitchShift = 0.95 + Math.random() * 0.1; // 0.95 to 1.05
    playShaker(pitchShift);
  }, []);

  const playClick = useCallback(() => {
    playTimbale();
  }, []);

  const playWhoosh = useCallback(() => {
    playCongaSlap();
  }, []);

  // Pre-warm audio context
  useEffect(() => {
    const warmUp = () => {
      const { ctx } = getAudioContext();
      if (ctx?.state === "suspended") ctx.resume();
    };
    document.addEventListener("click", warmUp, { once: true });
    document.addEventListener("touchstart", warmUp, { once: true });
    return () => {
      document.removeEventListener("click", warmUp);
      document.removeEventListener("touchstart", warmUp);
    };
  }, []);

  return {
    playHover,    // Shaker - crisp "chhh"
    playClick,    // Timbale - metallic "ting"
    playWhoosh,   // Conga - warm "pah"
    // Aliases
    playTick: playHover,
    playThock: playClick,
  };
}

// Global sound player
export const UISound = {
  shaker: (pitch?: number) => playShaker(pitch),
  timbale: playTimbale,
  conga: playCongaSlap,
  // Aliases for existing code
  hover: () => playShaker(0.95 + Math.random() * 0.1),
  tick: () => playShaker(0.95 + Math.random() * 0.1),
  click: playTimbale,
  thock: playTimbale,
  whoosh: playCongaSlap,
};

export default useUISound;
