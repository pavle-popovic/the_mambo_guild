"use client";

import { useState, useRef, useEffect } from "react";
import { 
  Play, Pause, Volume2, VolumeX, RotateCcw, 
  Music, Drum, Piano, Bell, Waves, Radio
} from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================
// Types
// ============================================

type InstrumentKey = 
  | "clave" 
  | "conga" 
  | "timbales" 
  | "bongo" 
  | "cowbell" 
  | "guiro"
  | "maracas"
  | "piano"
  | "bass";

type ClavePattern = "son-23" | "son-32" | "rumba-23" | "rumba-32";
type CongaPattern = "basic-tumbao" | "modern-tumbao" | "timba-tumbao" | "rumba-tumbao";
type TimbalesPattern = "cascara" | "mambo-bell" | "cascara-variation" | "abierto";
type BongoPattern = "martillo" | "martillo-variation" | "guaguanco" | "modern";
type CowbellPattern = "mambo" | "montuno" | "double-time" | "syncopated";
type GuiroPattern = "basic" | "variation" | "fast" | "slow";
type MaracasPattern = "basic" | "accented" | "fast" | "syncopated";
type PianoPattern = "son-montuno" | "montuno-variation" | "guajeo" | "modern";
type BassPattern = "basic-tumbao" | "anticipated" | "walking" | "modern";

interface InstrumentState {
  volume: number;
  muted: boolean;
  solo: boolean;
  pattern: string;
}

// ============================================
// Pattern Definitions
// ============================================

const CLAVE_PATTERNS: Record<ClavePattern, number[]> = {
  "son-23": [0,0,0,1,0,0,1,0, 0,0,1,0,1,0,0,0], // 2-3 Son clave
  "son-32": [0,0,1,0,1,0,0,0, 0,0,0,1,0,0,1,0], // 3-2 Son clave
  "rumba-23": [0,0,0,1,0,0,0,1, 0,0,1,0,1,0,0,0], // 2-3 Rumba clave
  "rumba-32": [0,0,1,0,1,0,0,0, 0,0,0,1,0,0,0,1], // 3-2 Rumba clave
};

// Conga patterns: { beat, type: "slap" | "tone" | "open" | "muff" | "bass" }
const CONGA_PATTERNS: Record<CongaPattern, Array<{ beat: number; type: string }>> = {
  "basic-tumbao": [
    { beat: 0, type: "slap" },
    { beat: 2, type: "tone" },
    { beat: 4, type: "open" },
    { beat: 5, type: "muff" },
    { beat: 6, type: "slap" },
    { beat: 8, type: "slap" },
    { beat: 10, type: "tone" },
    { beat: 12, type: "open" },
    { beat: 13, type: "muff" },
    { beat: 14, type: "slap" },
  ],
  "modern-tumbao": [
    { beat: 0, type: "slap" },
    { beat: 1, type: "tone" },
    { beat: 2, type: "open" },
    { beat: 4, type: "open" },
    { beat: 5, type: "muff" },
    { beat: 6, type: "slap" },
    { beat: 8, type: "slap" },
    { beat: 9, type: "tone" },
    { beat: 10, type: "open" },
    { beat: 12, type: "open" },
    { beat: 13, type: "muff" },
    { beat: 14, type: "slap" },
  ],
  "timba-tumbao": [
    { beat: 0, type: "slap" },
    { beat: 1, type: "bass" },
    { beat: 2, type: "tone" },
    { beat: 3, type: "open" },
    { beat: 4, type: "open" },
    { beat: 5, type: "muff" },
    { beat: 6, type: "slap" },
    { beat: 7, type: "tone" },
    { beat: 8, type: "slap" },
    { beat: 9, type: "bass" },
    { beat: 10, type: "tone" },
    { beat: 11, type: "open" },
    { beat: 12, type: "open" },
    { beat: 13, type: "muff" },
    { beat: 14, type: "slap" },
    { beat: 15, type: "tone" },
  ],
  "rumba-tumbao": [
    { beat: 0, type: "slap" },
    { beat: 2, type: "tone" },
    { beat: 3, type: "open" },
    { beat: 4, type: "open" },
    { beat: 6, type: "slap" },
    { beat: 8, type: "slap" },
    { beat: 10, type: "tone" },
    { beat: 11, type: "open" },
    { beat: 12, type: "open" },
    { beat: 14, type: "slap" },
  ],
};

// Timbales patterns (1 = hit, 0 = rest)
const TIMBALES_PATTERNS: Record<TimbalesPattern, number[]> = {
  "cascara": [1,0,1,1,0,1,0,1, 1,0,1,1,0,1,0,1],
  "mambo-bell": [1,0,0,1,0,0,1,0, 1,0,0,1,0,0,1,0],
  "cascara-variation": [1,0,1,1,0,1,1,0, 1,0,1,1,0,1,1,0],
  "abierto": [1,1,0,1,1,0,1,0, 1,1,0,1,1,0,1,0],
};

// Bongo patterns
const BONGO_PATTERNS: Record<BongoPattern, Array<{ beat: number; high: boolean }>> = {
  "martillo": [
    { beat: 0, high: true }, { beat: 1, high: false },
    { beat: 2, high: true }, { beat: 3, high: false },
    { beat: 4, high: true }, { beat: 5, high: false },
    { beat: 6, high: true }, { beat: 7, high: false },
    { beat: 8, high: true }, { beat: 9, high: false },
    { beat: 10, high: true }, { beat: 11, high: false },
    { beat: 12, high: true }, { beat: 13, high: false },
    { beat: 14, high: true }, { beat: 15, high: false },
  ],
  "martillo-variation": [
    { beat: 0, high: true }, { beat: 1, high: true },
    { beat: 2, high: false }, { beat: 3, high: true },
    { beat: 4, high: true }, { beat: 5, high: false },
    { beat: 6, high: true }, { beat: 7, high: true },
    { beat: 8, high: true }, { beat: 9, high: true },
    { beat: 10, high: false }, { beat: 11, high: true },
    { beat: 12, high: true }, { beat: 13, high: false },
    { beat: 14, high: true }, { beat: 15, high: true },
  ],
  "guaguanco": [
    { beat: 0, high: true }, { beat: 2, high: false },
    { beat: 4, high: true }, { beat: 5, high: false },
    { beat: 6, high: true }, { beat: 8, high: true },
    { beat: 10, high: false }, { beat: 12, high: true },
    { beat: 13, high: false }, { beat: 14, high: true },
  ],
  "modern": [
    { beat: 0, high: true }, { beat: 1, high: false },
    { beat: 2, high: true }, { beat: 3, high: true },
    { beat: 4, high: false }, { beat: 5, high: true },
    { beat: 6, high: true }, { beat: 7, high: false },
    { beat: 8, high: true }, { beat: 9, high: false },
    { beat: 10, high: true }, { beat: 11, high: true },
    { beat: 12, high: false }, { beat: 13, high: true },
    { beat: 14, high: true }, { beat: 15, high: false },
  ],
};

// Cowbell patterns
const COWBELL_PATTERNS: Record<CowbellPattern, number[]> = {
  "mambo": [1,0,1,0,1,0,1,0, 1,0,1,0,1,0,1,0],
  "montuno": [1,0,0,1,0,0,1,0, 1,0,0,1,0,0,1,0],
  "double-time": [1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1],
  "syncopated": [1,0,0,1,1,0,1,0, 1,0,0,1,1,0,1,0],
};

// Guiro patterns
const GUIRO_PATTERNS: Record<GuiroPattern, number[]> = {
  "basic": [1,1,0,1,1,1,0,1, 1,1,0,1,1,1,0,1],
  "variation": [1,1,1,0,1,1,0,1, 1,1,1,0,1,1,0,1],
  "fast": [1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1],
  "slow": [1,0,1,0,1,0,1,0, 1,0,1,0,1,0,1,0],
};

// Maracas patterns
const MARACAS_PATTERNS: Record<MaracasPattern, number[]> = {
  "basic": [1,0,1,0,1,0,1,0, 1,0,1,0,1,0,1,0],
  "accented": [1,0,1,1,0,1,0,1, 1,0,1,1,0,1,0,1],
  "fast": [1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1],
  "syncopated": [1,0,0,1,0,1,0,1, 1,0,0,1,0,1,0,1],
};

// Piano patterns: { beat, notes: number[] } (MIDI note numbers)
const PIANO_PATTERNS: Record<PianoPattern, Array<{ beat: number; notes: number[] }>> = {
  "son-montuno": [
    { beat: 0, notes: [60, 64, 67] },  // C major
    { beat: 2, notes: [62, 65, 69] },  // D minor
    { beat: 4, notes: [64, 67, 71] },  // E minor
    { beat: 6, notes: [62, 65, 69] },  // D minor
    { beat: 8, notes: [60, 64, 67] },
    { beat: 10, notes: [62, 65, 69] },
    { beat: 12, notes: [64, 67, 71] },
    { beat: 14, notes: [65, 69, 72] }, // F major
  ],
  "montuno-variation": [
    { beat: 0, notes: [60, 64, 67] },
    { beat: 1, notes: [62, 65, 69] },
    { beat: 2, notes: [64, 67, 71] },
    { beat: 3, notes: [62, 65, 69] },
    { beat: 4, notes: [60, 64, 67] },
    { beat: 5, notes: [62, 65, 69] },
    { beat: 6, notes: [64, 67, 71] },
    { beat: 7, notes: [65, 69, 72] },
    { beat: 8, notes: [60, 64, 67] },
    { beat: 9, notes: [62, 65, 69] },
    { beat: 10, notes: [64, 67, 71] },
    { beat: 11, notes: [62, 65, 69] },
    { beat: 12, notes: [60, 64, 67] },
    { beat: 13, notes: [62, 65, 69] },
    { beat: 14, notes: [64, 67, 71] },
    { beat: 15, notes: [65, 69, 72] },
  ],
  "guajeo": [
    { beat: 0, notes: [60, 64, 67] },
    { beat: 2, notes: [62, 65, 69] },
    { beat: 4, notes: [60, 64, 67] },
    { beat: 6, notes: [62, 65, 69] },
    { beat: 8, notes: [60, 64, 67] },
    { beat: 10, notes: [62, 65, 69] },
    { beat: 12, notes: [60, 64, 67] },
    { beat: 14, notes: [62, 65, 69] },
  ],
  "modern": [
    { beat: 0, notes: [60, 64, 67, 71] },  // Cmaj7
    { beat: 2, notes: [62, 65, 69, 72] },  // Dm7
    { beat: 4, notes: [64, 67, 71, 74] },  // Em7
    { beat: 6, notes: [62, 65, 69, 72] },  // Dm7
    { beat: 8, notes: [60, 64, 67, 71] },
    { beat: 10, notes: [62, 65, 69, 72] },
    { beat: 12, notes: [64, 67, 71, 74] },
    { beat: 14, notes: [65, 69, 72, 76] }, // Fmaj7
  ],
};

// Bass patterns: { beat, note: number } (MIDI note numbers)
const BASS_PATTERNS: Record<BassPattern, Array<{ beat: number; note: number }>> = {
  "basic-tumbao": [
    { beat: 0, note: 36 },   // C
    { beat: 3, note: 36 },   // C (anticipated)
    { beat: 6, note: 43 },   // G
    { beat: 8, note: 36 },
    { beat: 11, note: 36 },
    { beat: 14, note: 43 },
  ],
  "anticipated": [
    { beat: 0, note: 36 },
    { beat: 2, note: 36 },   // More anticipation
    { beat: 4, note: 43 },
    { beat: 6, note: 36 },
    { beat: 8, note: 36 },
    { beat: 10, note: 36 },
    { beat: 12, note: 43 },
    { beat: 14, note: 36 },
  ],
  "walking": [
    { beat: 0, note: 36 },   // C
    { beat: 2, note: 38 },   // D
    { beat: 4, note: 40 },   // E
    { beat: 6, note: 43 },   // G
    { beat: 8, note: 36 },
    { beat: 10, note: 38 },
    { beat: 12, note: 40 },
    { beat: 14, note: 43 },
  ],
  "modern": [
    { beat: 0, note: 36 },
    { beat: 1, note: 36 },
    { beat: 3, note: 43 },
    { beat: 4, note: 36 },
    { beat: 6, note: 43 },
    { beat: 8, note: 36 },
    { beat: 9, note: 36 },
    { beat: 11, note: 43 },
    { beat: 12, note: 36 },
    { beat: 14, note: 43 },
  ],
};

// ============================================
// Audio Context & Sound Generation
// ============================================

class SalsaSoundEngine {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private instrumentGains: Map<InstrumentKey, GainNode> = new Map();
  private isPlaying: boolean = false;
  private currentBeat: number = 0;
  private intervalId: number | null = null;
  private bpm: number = 180;
  
  // Pattern selections
  private clavePattern: ClavePattern = "son-23";
  private congaPattern: CongaPattern = "basic-tumbao";
  private timbalesPattern: TimbalesPattern = "cascara";
  private bongoPattern: BongoPattern = "martillo";
  private cowbellPattern: CowbellPattern = "mambo";
  private guiroPattern: GuiroPattern = "basic";
  private maracasPattern: MaracasPattern = "basic";
  private pianoPattern: PianoPattern = "son-montuno";
  private bassPattern: BassPattern = "basic-tumbao";
  
  // Callbacks
  onBeatChange: ((beat: number) => void) | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      this.init();
    }
  }

  private init() {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.masterGain = this.audioContext.createGain();
    this.masterGain.connect(this.audioContext.destination);
    this.masterGain.gain.value = 0.7;

    const instruments: InstrumentKey[] = ["clave", "conga", "timbales", "bongo", "cowbell", "guiro", "maracas", "piano", "bass"];
    instruments.forEach(inst => {
      const gain = this.audioContext!.createGain();
      gain.connect(this.masterGain!);
      gain.gain.value = 1;
      this.instrumentGains.set(inst, gain);
    });
  }

  setPattern(instrument: InstrumentKey, pattern: string) {
    switch (instrument) {
      case "clave": this.clavePattern = pattern as ClavePattern; break;
      case "conga": this.congaPattern = pattern as CongaPattern; break;
      case "timbales": this.timbalesPattern = pattern as TimbalesPattern; break;
      case "bongo": this.bongoPattern = pattern as BongoPattern; break;
      case "cowbell": this.cowbellPattern = pattern as CowbellPattern; break;
      case "guiro": this.guiroPattern = pattern as GuiroPattern; break;
      case "maracas": this.maracasPattern = pattern as MaracasPattern; break;
      case "piano": this.pianoPattern = pattern as PianoPattern; break;
      case "bass": this.bassPattern = pattern as BassPattern; break;
    }
  }

  setBpm(bpm: number) {
    this.bpm = bpm * 2;
    if (this.isPlaying) {
      this.stop();
      this.play();
    }
  }

  setInstrumentVolume(instrument: InstrumentKey, volume: number) {
    const gain = this.instrumentGains.get(instrument);
    if (gain) {
      gain.gain.value = volume;
    }
  }

  // Sound synthesis functions (keeping existing implementations)
  private playNoise(gainNode: GainNode, duration: number, filterFreq: number, attack: number = 0.001) {
    if (!this.audioContext) return;
    
    const bufferSize = this.audioContext.sampleRate * duration;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    const noise = this.audioContext.createBufferSource();
    noise.buffer = buffer;
    
    const filter = this.audioContext.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = filterFreq;
    filter.Q.value = 1;
    
    const env = this.audioContext.createGain();
    env.gain.setValueAtTime(0, this.audioContext.currentTime);
    env.gain.linearRampToValueAtTime(0.5, this.audioContext.currentTime + attack);
    env.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
    
    noise.connect(filter);
    filter.connect(env);
    env.connect(gainNode);
    
    noise.start();
    noise.stop(this.audioContext.currentTime + duration);
  }

  private playTone(gainNode: GainNode, freq: number, duration: number, type: OscillatorType = "sine") {
    if (!this.audioContext) return;
    
    const osc = this.audioContext.createOscillator();
    osc.type = type;
    osc.frequency.value = freq;
    
    const env = this.audioContext.createGain();
    env.gain.setValueAtTime(0.3, this.audioContext.currentTime);
    env.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
    
    osc.connect(env);
    env.connect(gainNode);
    
    osc.start();
    osc.stop(this.audioContext.currentTime + duration);
  }

  private playClave() {
    const gain = this.instrumentGains.get("clave");
    if (!gain || !this.audioContext) return;
    
    const osc = this.audioContext.createOscillator();
    osc.type = "triangle";
    osc.frequency.value = 2500;
    
    const env = this.audioContext.createGain();
    env.gain.setValueAtTime(0.4, this.audioContext.currentTime);
    env.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.05);
    
    osc.connect(env);
    env.connect(gain);
    
    osc.start();
    osc.stop(this.audioContext.currentTime + 0.05);
  }

  private playConga(type: string) {
    const gain = this.instrumentGains.get("conga");
    if (!gain || !this.audioContext) return;
    
    const freqMap: Record<string, number> = {
      "slap": 400,
      "tone": 200,
      "open": 180,
      "muff": 150,
      "bass": 100,
    };
    
    const durationMap: Record<string, number> = {
      "slap": 0.08,
      "tone": 0.15,
      "open": 0.3,
      "muff": 0.1,
      "bass": 0.2,
    };
    
    const freq = freqMap[type] || 200;
    const duration = durationMap[type] || 0.15;
    
    const osc = this.audioContext.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq * 1.5, this.audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq, this.audioContext.currentTime + 0.02);
    
    const env = this.audioContext.createGain();
    env.gain.setValueAtTime(type === "slap" ? 0.5 : 0.35, this.audioContext.currentTime);
    env.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
    
    osc.connect(env);
    env.connect(gain);
    
    osc.start();
    osc.stop(this.audioContext.currentTime + duration);
    
    if (type === "slap") {
      this.playNoise(gain, 0.03, 3000);
    }
  }

  private playTimbales() {
    const gain = this.instrumentGains.get("timbales");
    if (!gain) return;
    this.playTone(gain, 800, 0.08, "square");
    this.playNoise(gain, 0.05, 5000);
  }

  private playBongo(isHigh: boolean) {
    const gain = this.instrumentGains.get("bongo");
    if (!gain || !this.audioContext) return;
    
    const freq = isHigh ? 500 : 350;
    
    const osc = this.audioContext.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq * 1.3, this.audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq, this.audioContext.currentTime + 0.01);
    
    const env = this.audioContext.createGain();
    env.gain.setValueAtTime(0.25, this.audioContext.currentTime);
    env.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.12);
    
    osc.connect(env);
    env.connect(gain);
    
    osc.start();
    osc.stop(this.audioContext.currentTime + 0.12);
  }

  private playCowbell() {
    const gain = this.instrumentGains.get("cowbell");
    if (!gain || !this.audioContext) return;
    
    [560, 845].forEach(freq => {
      const osc = this.audioContext!.createOscillator();
      osc.type = "square";
      osc.frequency.value = freq;
      
      const env = this.audioContext!.createGain();
      env.gain.setValueAtTime(0.15, this.audioContext!.currentTime);
      env.gain.exponentialRampToValueAtTime(0.001, this.audioContext!.currentTime + 0.15);
      
      const filter = this.audioContext!.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = freq;
      filter.Q.value = 5;
      
      osc.connect(filter);
      filter.connect(env);
      env.connect(gain);
      
      osc.start();
      osc.stop(this.audioContext!.currentTime + 0.15);
    });
  }

  private playGuiro(isLong: boolean) {
    const gain = this.instrumentGains.get("guiro");
    if (!gain) return;
    this.playNoise(gain, isLong ? 0.15 : 0.05, 4000, 0.01);
  }

  private playMaracas() {
    const gain = this.instrumentGains.get("maracas");
    if (!gain) return;
    this.playNoise(gain, 0.1, 6000, 0.005);
  }

  private playPiano(notes: number[]) {
    const gain = this.instrumentGains.get("piano");
    if (!gain || !this.audioContext) return;
    
    notes.forEach((note, i) => {
      const freq = 440 * Math.pow(2, (note - 69) / 12);
      
      const osc = this.audioContext!.createOscillator();
      osc.type = "triangle";
      osc.frequency.value = freq;
      
      const env = this.audioContext!.createGain();
      env.gain.setValueAtTime(0.12, this.audioContext!.currentTime);
      env.gain.exponentialRampToValueAtTime(0.001, this.audioContext!.currentTime + 0.25);
      
      osc.connect(env);
      env.connect(gain);
      
      osc.start();
      osc.stop(this.audioContext!.currentTime + 0.25);
    });
  }

  private playBass(note: number) {
    const gain = this.instrumentGains.get("bass");
    if (!gain || !this.audioContext) return;
    
    const freq = 440 * Math.pow(2, (note - 69) / 12);
    
    const osc = this.audioContext.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.value = freq;
    
    const filter = this.audioContext.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 500;
    
    const env = this.audioContext.createGain();
    env.gain.setValueAtTime(0.35, this.audioContext.currentTime);
    env.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.3);
    
    osc.connect(filter);
    filter.connect(env);
    env.connect(gain);
    
    osc.start();
    osc.stop(this.audioContext.currentTime + 0.3);
  }

  private tick() {
    const beat = this.currentBeat % 16;
    
    // Clave
    if (CLAVE_PATTERNS[this.clavePattern][beat]) {
      this.playClave();
    }
    
    // Conga
    const congaHit = CONGA_PATTERNS[this.congaPattern].find(h => h.beat === beat);
    if (congaHit) {
      this.playConga(congaHit.type);
    }
    
    // Timbales
    if (TIMBALES_PATTERNS[this.timbalesPattern][beat]) {
      this.playTimbales();
    }
    
    // Bongo
    const bongoHit = BONGO_PATTERNS[this.bongoPattern].find(h => h.beat === beat);
    if (bongoHit) {
      this.playBongo(bongoHit.high);
    }
    
    // Cowbell
    if (COWBELL_PATTERNS[this.cowbellPattern][beat]) {
      this.playCowbell();
    }
    
    // Guiro
    if (GUIRO_PATTERNS[this.guiroPattern][beat]) {
      this.playGuiro(beat % 4 === 0);
    }
    
    // Maracas
    if (MARACAS_PATTERNS[this.maracasPattern][beat]) {
      this.playMaracas();
    }
    
    // Piano
    const pianoHit = PIANO_PATTERNS[this.pianoPattern].find(h => h.beat === beat);
    if (pianoHit) {
      this.playPiano(pianoHit.notes);
    }
    
    // Bass
    const bassHit = BASS_PATTERNS[this.bassPattern].find(h => h.beat === beat);
    if (bassHit) {
      this.playBass(bassHit.note);
    }
    
    if (this.onBeatChange) {
      this.onBeatChange(beat);
    }
    
    this.currentBeat++;
  }

  play() {
    if (this.isPlaying) return;
    
    if (this.audioContext?.state === "suspended") {
      this.audioContext.resume();
    }
    
    this.isPlaying = true;
    const intervalMs = (60 / this.bpm) * 1000;
    this.intervalId = window.setInterval(() => this.tick(), intervalMs);
  }

  stop() {
    this.isPlaying = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  reset() {
    this.stop();
    this.currentBeat = 0;
    if (this.onBeatChange) {
      this.onBeatChange(0);
    }
  }

  destroy() {
    this.stop();
    this.audioContext?.close();
  }
}

// ============================================
// Instrument Info & Pattern Options
// ============================================

const INSTRUMENTS: {
  key: InstrumentKey;
  name: string;
  icon: React.ReactNode;
  bgClass: string;
  borderClass: string;
  iconBgClass: string;
  iconTextClass: string;
  description: string;
  patterns: { value: string; label: string }[];
}[] = [
  {
    key: "clave",
    name: "Clave",
    icon: <Music size={18} />,
    bgClass: "bg-amber-500/10",
    borderClass: "border-amber-500/30",
    iconBgClass: "bg-amber-500/20",
    iconTextClass: "text-amber-400",
    description: "The heartbeat - defines 2-3 or 3-2 pattern",
    patterns: [
      { value: "son-23", label: "Son 2-3" },
      { value: "son-32", label: "Son 3-2" },
      { value: "rumba-23", label: "Rumba 2-3" },
      { value: "rumba-32", label: "Rumba 3-2" },
    ],
  },
  {
    key: "conga",
    name: "Congas",
    icon: <Drum size={18} />,
    bgClass: "bg-orange-500/10",
    borderClass: "border-orange-500/30",
    iconBgClass: "bg-orange-500/20",
    iconTextClass: "text-orange-400",
    description: "Tumbao patterns with slaps, tones & opens",
    patterns: [
      { value: "basic-tumbao", label: "Basic Tumbao" },
      { value: "modern-tumbao", label: "Modern Tumbao" },
      { value: "timba-tumbao", label: "Timba Tumbao" },
      { value: "rumba-tumbao", label: "Rumba Tumbao" },
    ],
  },
  {
    key: "timbales",
    name: "Timbales",
    icon: <Drum size={18} />,
    bgClass: "bg-red-500/10",
    borderClass: "border-red-500/30",
    iconBgClass: "bg-red-500/20",
    iconTextClass: "text-red-400",
    description: "Cascara shell patterns",
    patterns: [
      { value: "cascara", label: "Cascara" },
      { value: "mambo-bell", label: "Mambo Bell" },
      { value: "cascara-variation", label: "Cascara Var." },
      { value: "abierto", label: "Abierto" },
    ],
  },
  {
    key: "bongo",
    name: "Bongos",
    icon: <Drum size={18} />,
    bgClass: "bg-rose-500/10",
    borderClass: "border-rose-500/30",
    iconBgClass: "bg-rose-500/20",
    iconTextClass: "text-rose-400",
    description: "Martillo (hammer) patterns",
    patterns: [
      { value: "martillo", label: "Martillo" },
      { value: "martillo-variation", label: "Martillo Var." },
      { value: "guaguanco", label: "Guaguancó" },
      { value: "modern", label: "Modern" },
    ],
  },
  {
    key: "cowbell",
    name: "Campana",
    icon: <Bell size={18} />,
    bgClass: "bg-yellow-500/10",
    borderClass: "border-yellow-500/30",
    iconBgClass: "bg-yellow-500/20",
    iconTextClass: "text-yellow-400",
    description: "Cowbell for mambo sections",
    patterns: [
      { value: "mambo", label: "Mambo" },
      { value: "montuno", label: "Montuno" },
      { value: "double-time", label: "Double Time" },
      { value: "syncopated", label: "Syncopated" },
    ],
  },
  {
    key: "guiro",
    name: "Güiro",
    icon: <Waves size={18} />,
    bgClass: "bg-lime-500/10",
    borderClass: "border-lime-500/30",
    iconBgClass: "bg-lime-500/20",
    iconTextClass: "text-lime-400",
    description: "Scraped gourd texture",
    patterns: [
      { value: "basic", label: "Basic" },
      { value: "variation", label: "Variation" },
      { value: "fast", label: "Fast" },
      { value: "slow", label: "Slow" },
    ],
  },
  {
    key: "maracas",
    name: "Maracas",
    icon: <Radio size={18} />,
    bgClass: "bg-green-500/10",
    borderClass: "border-green-500/30",
    iconBgClass: "bg-green-500/20",
    iconTextClass: "text-green-400",
    description: "Shaker patterns",
    patterns: [
      { value: "basic", label: "Basic" },
      { value: "accented", label: "Accented" },
      { value: "fast", label: "Fast" },
      { value: "syncopated", label: "Syncopated" },
    ],
  },
  {
    key: "piano",
    name: "Piano",
    icon: <Piano size={18} />,
    bgClass: "bg-cyan-500/10",
    borderClass: "border-cyan-500/30",
    iconBgClass: "bg-cyan-500/20",
    iconTextClass: "text-cyan-400",
    description: "Son montuno patterns",
    patterns: [
      { value: "son-montuno", label: "Son Montuno" },
      { value: "montuno-variation", label: "Montuno Var." },
      { value: "guajeo", label: "Guajeo" },
      { value: "modern", label: "Modern" },
    ],
  },
  {
    key: "bass",
    name: "Bass",
    icon: <Waves size={18} />,
    bgClass: "bg-blue-500/10",
    borderClass: "border-blue-500/30",
    iconBgClass: "bg-blue-500/20",
    iconTextClass: "text-blue-400",
    description: "Tumbao with anticipated notes",
    patterns: [
      { value: "basic-tumbao", label: "Basic Tumbao" },
      { value: "anticipated", label: "Anticipated" },
      { value: "walking", label: "Walking" },
      { value: "modern", label: "Modern" },
    ],
  },
];

const CLAVE_OPTIONS: { value: ClavePattern; label: string; description: string }[] = [
  { value: "son-23", label: "Son 2-3", description: "Most common in NY-style salsa" },
  { value: "son-32", label: "Son 3-2", description: "Common in Cuban son" },
  { value: "rumba-23", label: "Rumba 2-3", description: "Delayed third beat" },
  { value: "rumba-32", label: "Rumba 3-2", description: "Afro-Cuban rumba feel" },
];

// ============================================
// Component
// ============================================

export default function SalsaRhythmMachine() {
  const engineRef = useRef<SalsaSoundEngine | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(0);
  const [bpm, setBpm] = useState(90);
  const [clavePattern, setClavePattern] = useState<ClavePattern>("son-23");
  
  const [instruments, setInstruments] = useState<Record<InstrumentKey, InstrumentState>>({
    clave: { volume: 100, muted: false, solo: false, pattern: "son-23" },
    conga: { volume: 100, muted: false, solo: false, pattern: "basic-tumbao" },
    timbales: { volume: 80, muted: false, solo: false, pattern: "cascara" },
    bongo: { volume: 70, muted: false, solo: false, pattern: "martillo" },
    cowbell: { volume: 60, muted: true, solo: false, pattern: "mambo" },
    guiro: { volume: 50, muted: false, solo: false, pattern: "basic" },
    maracas: { volume: 40, muted: true, solo: false, pattern: "basic" },
    piano: { volume: 80, muted: false, solo: false, pattern: "son-montuno" },
    bass: { volume: 90, muted: false, solo: false, pattern: "basic-tumbao" },
  });

  // Initialize engine
  useEffect(() => {
    engineRef.current = new SalsaSoundEngine();
    engineRef.current.onBeatChange = setCurrentBeat;
    
    return () => {
      engineRef.current?.destroy();
    };
  }, []);

  // Update engine when settings change
  useEffect(() => {
    if (!engineRef.current) return;
    
    engineRef.current.setBpm(bpm);
    
    // Apply pattern changes
    // Clave uses separate state, other instruments use instruments state
    engineRef.current.setPattern("clave", clavePattern);
    Object.entries(instruments).forEach(([key, state]) => {
      if (key !== "clave") { // Clave already set above from clavePattern state
        engineRef.current!.setPattern(key as InstrumentKey, state.pattern);
      }
    });
    
    // Apply volume/mute settings
    const hasSolo = Object.values(instruments).some(i => i.solo);
    
    Object.entries(instruments).forEach(([key, state]) => {
      const effectiveVolume = state.muted || (hasSolo && !state.solo) 
        ? 0 
        : state.volume / 100;
      engineRef.current!.setInstrumentVolume(key as InstrumentKey, effectiveVolume);
    });
  }, [bpm, clavePattern, instruments]);

  const togglePlay = () => {
    if (isPlaying) {
      engineRef.current?.stop();
    } else {
      engineRef.current?.play();
    }
    setIsPlaying(!isPlaying);
  };

  const reset = () => {
    engineRef.current?.reset();
    setIsPlaying(false);
  };

  const toggleMute = (key: InstrumentKey) => {
    setInstruments(prev => ({
      ...prev,
      [key]: { ...prev[key], muted: !prev[key].muted }
    }));
  };

  const toggleSolo = (key: InstrumentKey) => {
    setInstruments(prev => ({
      ...prev,
      [key]: { ...prev[key], solo: !prev[key].solo }
    }));
  };

  const setVolume = (key: InstrumentKey, volume: number) => {
    setInstruments(prev => ({
      ...prev,
      [key]: { ...prev[key], volume }
    }));
  };

  const setPattern = (key: InstrumentKey, pattern: string) => {
    setInstruments(prev => ({
      ...prev,
      [key]: { ...prev[key], pattern }
    }));
  };

  const hasSolo = Object.values(instruments).some(i => i.solo);

  // Beat visualization
  const beatDisplay = Array.from({ length: 16 }, (_, i) => i);

  return (
    <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-2xl border border-white/10 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Salsa Rhythm Machine</h2>
            <p className="text-white/50 text-sm">Mix authentic salsa percussion patterns</p>
          </div>
          
          {/* BPM Control */}
          <div className="flex items-center gap-4">
            <label className="text-white/60 text-sm">BPM</label>
            <input
              type="range"
              min="70"
              max="120"
              value={bpm}
              onChange={(e) => setBpm(Number(e.target.value))}
              className="w-24 accent-amber-500"
            />
            <span className="text-amber-400 font-mono w-12 text-center">{bpm}</span>
          </div>
        </div>

        {/* Clave Pattern Selector */}
        <div className="flex flex-wrap gap-2 mb-6">
          {CLAVE_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                setClavePattern(option.value);
                setPattern("clave", option.value);
              }}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                clavePattern === option.value
                  ? "bg-amber-500 text-black"
                  : "bg-white/5 text-white/70 hover:bg-white/10"
              )}
              title={option.description}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Beat Visualization */}
        <div className="flex gap-1 mb-4">
          {beatDisplay.map((beat) => (
            <div
              key={beat}
              className={cn(
                "flex-1 h-3 rounded-sm transition-all",
                beat === currentBeat
                  ? "bg-amber-400"
                  : beat < 8
                  ? "bg-white/10"
                  : "bg-white/5"
              )}
            />
          ))}
        </div>
        <div className="flex justify-between text-xs text-white/40 px-1">
          <span>1</span>
          <span>2</span>
          <span>3</span>
          <span>4</span>
          <span>|</span>
          <span>5</span>
          <span>6</span>
          <span>7</span>
          <span>8</span>
        </div>

        {/* Transport Controls */}
        <div className="flex justify-center gap-4 mt-6">
          <button
            onClick={togglePlay}
            className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center transition-all",
              isPlaying
                ? "bg-amber-500 text-black hover:bg-amber-400"
                : "bg-white/10 text-white hover:bg-white/20"
            )}
          >
            {isPlaying ? <Pause size={28} /> : <Play size={28} className="ml-1" />}
          </button>
          <button
            onClick={reset}
            className="w-12 h-12 rounded-full bg-white/5 text-white/60 hover:bg-white/10 hover:text-white flex items-center justify-center transition-all"
          >
            <RotateCcw size={20} />
          </button>
        </div>
      </div>

      {/* Instrument Mixer */}
      <div className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Instruments & Patterns</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {INSTRUMENTS.map((inst) => {
            const state = instruments[inst.key];
            const isEffectivelyMuted = state.muted || (hasSolo && !state.solo);
            
            return (
              <div
                key={inst.key}
                className={cn(
                  "p-4 rounded-xl border transition-all",
                  isEffectivelyMuted
                    ? "bg-black/30 border-white/5 opacity-50"
                    : `${inst.bgClass} ${inst.borderClass}`
                )}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center",
                      isEffectivelyMuted ? "bg-white/10 text-white/30" : `${inst.iconBgClass} ${inst.iconTextClass}`
                    )}>
                      {inst.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-white text-sm">{inst.name}</h4>
                      <p className="text-white/40 text-xs">{inst.description}</p>
                    </div>
                  </div>
                </div>
                
                {/* Pattern Selector */}
                <div className="mb-3">
                  <select
                    value={state.pattern}
                    onChange={(e) => setPattern(inst.key, e.target.value)}
                    className={cn(
                      "w-full px-2 py-1.5 rounded text-xs bg-black/30 border text-white",
                      isEffectivelyMuted ? "border-white/10 opacity-50" : "border-white/20"
                    )}
                    disabled={isEffectivelyMuted}
                  >
                    {inst.patterns.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Volume Slider */}
                <div className="flex items-center gap-2 mb-3">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={state.volume}
                    onChange={(e) => setVolume(inst.key, Number(e.target.value))}
                    className="flex-1 h-2 accent-amber-500"
                    disabled={isEffectivelyMuted}
                  />
                  <span className="text-white/50 text-xs w-8 text-right">{state.volume}%</span>
                </div>
                
                {/* Mute/Solo Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleMute(inst.key)}
                    className={cn(
                      "flex-1 py-1.5 rounded text-xs font-medium transition-all flex items-center justify-center gap-1",
                      state.muted
                        ? "bg-red-500/20 text-red-400"
                        : "bg-white/5 text-white/50 hover:bg-white/10"
                    )}
                  >
                    {state.muted ? <VolumeX size={12} /> : <Volume2 size={12} />}
                    Mute
                  </button>
                  <button
                    onClick={() => toggleSolo(inst.key)}
                    className={cn(
                      "flex-1 py-1.5 rounded text-xs font-medium transition-all",
                      state.solo
                        ? "bg-amber-500 text-black"
                        : "bg-white/5 text-white/50 hover:bg-white/10"
                    )}
                  >
                    Solo
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pattern Guide */}
      <div className="p-6 border-t border-white/10 bg-white/5">
        <h3 className="text-lg font-semibold text-white mb-4">🎵 Understanding Salsa Rhythms</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div className="p-4 rounded-lg bg-black/30">
            <h4 className="text-amber-400 font-semibold mb-2">2-3 Clave (NYC Style)</h4>
            <div className="font-mono text-white/70 mb-2">
              | . . . X . . X . | . . X . X . . . |
            </div>
            <p className="text-white/50 text-xs">The "2" side has 2 hits, then the "3" side has 3 hits. Most common in NY salsa.</p>
          </div>
          <div className="p-4 rounded-lg bg-black/30">
            <h4 className="text-cyan-400 font-semibold mb-2">3-2 Clave (Cuban Style)</h4>
            <div className="font-mono text-white/70 mb-2">
              | . . X . X . . . | . . . X . . X . |
            </div>
            <p className="text-white/50 text-xs">Starts with the "3" side. More traditional Cuban son feel.</p>
          </div>
        </div>
        <p className="mt-4 text-white/40 text-xs">
          💡 <strong>Practice tip:</strong> Solo the clave first. Once you feel it, add instruments one by one. The clave is the DNA of salsa! Each instrument has multiple pattern variations - experiment to find your sound.
        </p>
      </div>
    </div>
  );
}
