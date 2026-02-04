"use client";

import { useState, useRef, useEffect } from "react";
import { 
  Play, Pause, Volume2, VolumeX, RotateCcw, 
  Music, Drum, Piano, Bell, Waves, Radio, Info, X, BookOpen, ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
// Import rhythm encyclopedia data
// @ts-ignore - JSON import
import rhythmEncyclopediaData from "@/data/rhythm-encyclopedia.json";

const rhythmEncyclopedia = rhythmEncyclopediaData as Record<string, any>;

// ============================================
// Types
// ============================================

type RhythmId = keyof typeof rhythmEncyclopedia;
type SectionType = "verse" | "montuno";

interface RhythmData {
  id: string;
  title: string;
  clave_direction: string;
  bpm: number;
  description: string;
  musical_context: {
    genre: string[];
    section_usage: string[];
    dance_feel: string;
  };
  instruments: Array<{
    name: string;
    role: string;
    pattern_description: string;
    tip: string;
    audio_file?: string;
  }>;
  audio_files: {
    full_mix?: string;
    percussion?: string;
  };
}

interface InstrumentState {
  volume: number;
  muted: boolean;
  solo: boolean;
}

// ============================================
// Audio File Mapping (from samples)
// ============================================

const AUDIO_FILE_MAP: Record<string, string> = {
  // Old School Salsa samples - map instrument names to actual files
  "conga": "/audio/samples/TC_OSS_90_conga_tape_harlem.wav",
  "congas": "/audio/samples/TC_OSS_90_conga_tape_harlem.wav",
  "cowbell": "/audio/samples/TC_OSS_90_cowbell_tape_harlem.wav",
  "campana": "/audio/samples/TC_OSS_90_cowbell_tape_harlem.wav",
  "guiro": "/audio/samples/TC_OSS_90_guiro_tape_harlem.wav",
  "güiro": "/audio/samples/TC_OSS_90_guiro_tape_harlem.wav",
  "maracas": "/audio/samples/TC_OSS_90_maracas_tape_harlem.wav",
  "timbal": "/audio/samples/TC_OSS_90_timbal_tape_harlem.wav",
  "timbales": "/audio/samples/TC_OSS_90_timbal_tape_harlem.wav",
  "percussion_stack": "/audio/samples/TC_OSS_90_percussion_stack_tape_harlem.wav",
  // Clave
  "clave": "/audio/samples/TC_MR_120_percussion_kit_high_monte_clave.wav",
};

// Helper function to find audio file for an instrument
function getAudioFile(instName: string, audioFile?: string): string | undefined {
  if (audioFile) return audioFile;
  
  // Try to match instrument name to audio file map
  const lowerName = instName.toLowerCase();
  for (const [key, file] of Object.entries(AUDIO_FILE_MAP)) {
    if (lowerName.includes(key.toLowerCase())) {
      return file;
    }
  }
  
  return undefined;
}

// ============================================
// Component
// ============================================

export default function SalsaRhythmTutor() {
  const [selectedRhythm, setSelectedRhythm] = useState<RhythmId>("son-montuno-suave");
  const [section, setSection] = useState<SectionType>("verse");
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState(90);
  
  // Sync BPM with selected rhythm
  useEffect(() => {
    const rhythm = rhythmEncyclopedia[selectedRhythm] as RhythmData;
    if (rhythm?.bpm) {
      setBpm(rhythm.bpm);
    }
  }, [selectedRhythm]);
  const [showInspector, setShowInspector] = useState(false);
  const [selectedInstrument, setSelectedInstrument] = useState<string | null>(null);
  
  const audioRefs = useRef<Map<string, HTMLAudioElement>>(new Map());
  const [instruments, setInstruments] = useState<Record<string, InstrumentState>>({});
  const [loadedAudio, setLoadedAudio] = useState<Set<string>>(new Set());
  const [audioErrors, setAudioErrors] = useState<Set<string>>(new Set());

  // Determine which rhythm data to use
  // For Son Montuno, allow switching between verse and montuno
  // For other rhythms, use the selected rhythm directly
  const getCurrentRhythmData = (): RhythmData => {
    if (selectedRhythm === "son-montuno-suave") {
      // If Son Montuno is selected, use section switching
      const currentSection = section === "verse" ? "son-montuno-suave" : "son-montuno-fuerte";
      return rhythmEncyclopedia[currentSection] as RhythmData;
    }
    // For all other rhythms, use the selected rhythm directly
    return rhythmEncyclopedia[selectedRhythm] as RhythmData;
  };

  const rhythmData = rhythmEncyclopedia[selectedRhythm] as RhythmData;
  const sectionData = getCurrentRhythmData();

  // Initialize instruments state
  useEffect(() => {
    const initialInstruments: Record<string, InstrumentState> = {};
    sectionData.instruments.forEach((inst) => {
      initialInstruments[inst.name] = {
        volume: 100,
        muted: false,
        solo: false,
      };
    });
    setInstruments(initialInstruments);
  }, [sectionData]);

  // Initialize audio elements with error handling
  useEffect(() => {
    setLoadedAudio(new Set());
    setAudioErrors(new Set());
    
    sectionData.instruments.forEach((inst) => {
      const audioFile = getAudioFile(inst.name, inst.audio_file);
      if (audioFile) {
        const audio = new Audio(audioFile);
        audio.loop = true;
        audio.volume = 1;
        
        // Handle loading errors gracefully
        audio.addEventListener('error', (e) => {
          console.warn(`Failed to load audio for ${inst.name}:`, audioFile);
          setAudioErrors(prev => new Set([...prev, inst.name]));
        }, { once: true });
        
        // Track successful loads
        audio.addEventListener('canplaythrough', () => {
          audioRefs.current.set(inst.name, audio);
          setLoadedAudio(prev => new Set([...prev, inst.name]));
        }, { once: true });
        
        // Load the audio (errors are handled via the 'error' event listener above)
        audio.load();
      } else {
        // No audio file found for this instrument
        setAudioErrors(prev => new Set([...prev, inst.name]));
      }
    });

    return () => {
      audioRefs.current.forEach((audio) => {
        audio.pause();
        audio.src = "";
      });
      audioRefs.current.clear();
    };
  }, [sectionData]);

  // Update audio playback
  useEffect(() => {
    const hasSolo = Object.values(instruments).some(i => i.solo);
    
    audioRefs.current.forEach((audio, instName) => {
      const state = instruments[instName];
      if (!state || !loadedAudio.has(instName)) return;
      
      const effectiveVolume = state.muted || (hasSolo && !state.solo) 
        ? 0 
        : (state.volume / 100);
      
      audio.volume = effectiveVolume;
      
      if (isPlaying && effectiveVolume > 0) {
        audio.play().catch(err => {
          console.warn(`Error playing audio for ${instName}:`, err);
        });
      } else {
        audio.pause();
      }
    });
  }, [isPlaying, instruments, loadedAudio]);

  const togglePlay = () => {
    if (isPlaying) {
      audioRefs.current.forEach((audio) => audio.pause());
      setIsPlaying(false);
    } else {
      if (audioRefs.current.size === 0) {
        alert("No audio files are available. Please add audio samples to /public/audio/samples/");
        return;
      }
      
      audioRefs.current.forEach((audio) => {
        audio.currentTime = 0;
        audio.play().catch(err => {
          console.warn("Error playing audio:", err);
        });
      });
      setIsPlaying(true);
    }
  };

  const reset = () => {
    audioRefs.current.forEach((audio) => {
      audio.pause();
      audio.currentTime = 0;
    });
    setIsPlaying(false);
  };

  const toggleMute = (instName: string) => {
    setInstruments(prev => ({
      ...prev,
      [instName]: { ...prev[instName], muted: !prev[instName].muted }
    }));
  };

  const toggleSolo = (instName: string) => {
    setInstruments(prev => ({
      ...prev,
      [instName]: { ...prev[instName], solo: !prev[instName].solo }
    }));
  };

  const setVolume = (instName: string, volume: number) => {
    setInstruments(prev => ({
      ...prev,
      [instName]: { ...prev[instName], volume }
    }));
  };

  const switchSection = () => {
    reset();
    setSection(section === "verse" ? "montuno" : "verse");
  };

  const hasSolo = Object.values(instruments).some(i => i.solo);
  const selectedInstData = selectedInstrument 
    ? sectionData.instruments.find(i => i.name === selectedInstrument)
    : null;

  return (
    <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-2xl border border-white/10 overflow-hidden relative">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        {/* Audio Files Warning */}
        {audioErrors.size > 0 && (
          <div className="mb-4 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
            <p className="text-amber-300 text-sm">
              <strong>⚠️ Audio Files Not Found:</strong> Some instrument audio files are missing. 
              The component will work with educational content, but audio playback may not be available. 
              Please add audio samples to <code className="bg-black/30 px-1 rounded">/public/audio/samples/</code>
            </p>
          </div>
        )}
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white">Salsa Rhythm Tutor</h2>
              <p className="text-white/50 text-sm">Interactive Encyclopedia of Salsa Rhythms</p>
            </div>
            <button
              onClick={() => setShowInspector(!showInspector)}
              className={cn(
                "p-2 rounded-lg transition-all",
                showInspector 
                  ? "bg-amber-500 text-black" 
                  : "bg-white/5 text-white/60 hover:bg-white/10"
              )}
              title="Show/Hide Info Panel"
            >
              <Info size={20} />
            </button>
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

        {/* Rhythm Selector */}
        <div className="flex flex-wrap gap-2 mb-4">
          {(Object.keys(rhythmEncyclopedia) as RhythmId[]).map((rhythmId) => {
            const rhythm = rhythmEncyclopedia[rhythmId] as RhythmData;
            return (
              <button
                key={rhythmId}
                onClick={() => {
                  reset();
                  setSelectedRhythm(rhythmId);
                  // Reset section to verse when switching rhythms
                  setSection("verse");
                  // Update BPM to match the rhythm's default BPM
                  setBpm(rhythm.bpm);
                  // Clear selected instrument
                  setSelectedInstrument(null);
                }}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                  selectedRhythm === rhythmId
                    ? "bg-amber-500 text-black"
                    : "bg-white/5 text-white/70 hover:bg-white/10"
                )}
              >
                {rhythm.title}
              </button>
            );
          })}
        </div>

        {/* Verse/Montuno Switch (only for Son Montuno) */}
        {selectedRhythm === "son-montuno-suave" && (
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={switchSection}
              className="px-6 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-black font-semibold hover:from-cyan-400 hover:to-blue-400 transition-all flex items-center gap-2"
            >
              <ChevronRight size={18} className={cn("transition-transform", section === "montuno" && "rotate-180")} />
              Switch to {section === "verse" ? "Montuno" : "Verse"}
            </button>
            <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
              <div 
                className={cn(
                  "h-full transition-all duration-500",
                  section === "verse" ? "bg-cyan-500 w-1/2" : "bg-amber-500 w-full"
                )}
              />
            </div>
            <span className="text-white/60 text-sm">
              {section === "verse" ? "Verse (Suave)" : "Montuno (Fuerte)"}
            </span>
          </div>
        )}

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

      <div className="flex">
        {/* Main Mixer */}
        <div className={cn("p-6 transition-all", showInspector ? "w-2/3" : "w-full")}>
          <h3 className="text-lg font-semibold text-white mb-4">Instruments</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sectionData.instruments.map((inst) => {
              const state = instruments[inst.name];
              if (!state) return null;
              
              const isEffectivelyMuted = state.muted || (hasSolo && !state.solo);
              const isSelected = selectedInstrument === inst.name;
              
              return (
                <div
                  key={inst.name}
                  onClick={() => {
                    setSelectedInstrument(inst.name);
                    setShowInspector(true);
                  }}
                  className={cn(
                    "p-4 rounded-xl border transition-all cursor-pointer",
                    isEffectivelyMuted
                      ? "bg-black/30 border-white/5 opacity-50"
                      : isSelected
                      ? "bg-amber-500/20 border-amber-500/50"
                      : "bg-white/5 border-white/10 hover:bg-white/10"
                  )}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center",
                        isEffectivelyMuted ? "bg-white/10 text-white/30" : "bg-amber-500/20 text-amber-400"
                      )}>
                        <Drum size={18} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white text-sm flex items-center gap-2">
                          {inst.name}
                          {audioErrors.has(inst.name) && !loadedAudio.has(inst.name) && (
                            <span className="text-xs text-amber-400" title="Audio file not available">
                              (No Audio)
                            </span>
                          )}
                        </h4>
                        <p className="text-white/40 text-xs">{inst.role}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Volume Slider */}
                  <div className="flex items-center gap-2 mb-3">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={state.volume}
                      onChange={(e) => setVolume(inst.name, Number(e.target.value))}
                      className="flex-1 h-2 accent-amber-500"
                      disabled={isEffectivelyMuted}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <span className="text-white/50 text-xs w-8 text-right">{state.volume}%</span>
                  </div>
                  
                  {/* Mute/Solo Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleMute(inst.name);
                      }}
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
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSolo(inst.name);
                      }}
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

        {/* Inspector Panel */}
        {showInspector && (
          <div className="w-1/3 border-l border-white/10 bg-black/50 p-6 overflow-y-auto max-h-[800px]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <BookOpen size={20} />
                Rhythm Encyclopedia
              </h3>
              <button
                onClick={() => setShowInspector(false)}
                className="p-1 rounded hover:bg-white/10 text-white/60 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* Rhythm Info */}
            <div className="mb-6">
              <h4 className="text-amber-400 font-semibold mb-2">{sectionData.title}</h4>
              <p className="text-white/70 text-sm mb-4">{sectionData.description}</p>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-white/50">Clave:</span>
                  <span className="text-white">{sectionData.clave_direction}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-white/50">BPM:</span>
                  <span className="text-white">{sectionData.bpm}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-white/50">Genre:</span>
                  <span className="text-white">{sectionData.musical_context.genre.join(", ")}</span>
                </div>
              </div>

              <div className="bg-white/5 rounded-lg p-3 mb-4">
                <p className="text-white/80 text-sm italic">"{sectionData.musical_context.dance_feel}"</p>
              </div>

              {/* Song Section Timeline */}
              <div className="mb-6">
                <h5 className="text-white/60 text-xs font-semibold mb-2">WHERE YOU HEAR THIS</h5>
                <div className="flex gap-1">
                  {["Intro", "Verse", "Montuno", "Outro"].map((sec, i) => (
                    <div
                      key={sec}
                      className={cn(
                        "flex-1 p-2 rounded text-xs text-center transition-all",
                        sectionData.musical_context.section_usage.some(s => s.toLowerCase().includes(sec.toLowerCase()))
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          : "bg-white/5 text-white/30"
                      )}
                    >
                      {sec}
                      {sectionData.musical_context.section_usage.some(s => s.toLowerCase().includes(sec.toLowerCase())) && (
                        <div className="text-amber-400 mt-1">●</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Selected Instrument Info */}
            {selectedInstData && (
              <div className="border-t border-white/10 pt-6">
                <h5 className="text-white font-semibold mb-2">{selectedInstData.name}</h5>
                <p className="text-amber-400 text-sm mb-2">{selectedInstData.role}</p>
                <p className="text-white/70 text-sm mb-4">{selectedInstData.pattern_description}</p>
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
                  <p className="text-amber-300 text-sm">
                    <strong>💡 Tip:</strong> {selectedInstData.tip}
                  </p>
                </div>
              </div>
            )}

            {/* All Instruments List */}
            {!selectedInstData && (
              <div className="border-t border-white/10 pt-6">
                <h5 className="text-white font-semibold mb-3">Instrument Breakdown</h5>
                <div className="space-y-3">
                  {sectionData.instruments.map((inst) => (
                    <button
                      key={inst.name}
                      onClick={() => setSelectedInstrument(inst.name)}
                      className="w-full text-left p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all"
                    >
                      <div className="font-semibold text-white text-sm">{inst.name}</div>
                      <div className="text-amber-400 text-xs mt-1">{inst.role}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
