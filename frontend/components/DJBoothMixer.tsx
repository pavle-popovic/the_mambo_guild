"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Play, Pause, SkipBack, Volume2, VolumeX, Headphones, Music, Disc } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api";

interface Track {
  id: string;
  title: string;
  artist: string;
  album: string | null;
  year: number | null;
  duration_seconds: number;
  bpm: number | null;
  cover_image_url: string | null;
  full_mix_url: string;
  percussion_url: string;
  piano_bass_url: string;
  vocals_brass_url: string;
}

interface StemState {
  volume: number;
  muted: boolean;
  solo: boolean;
}

type StemKey = "full_mix" | "percussion" | "piano_bass" | "vocals_brass";

const STEM_LABELS: Record<StemKey, { label: string; color: string; icon: string }> = {
  full_mix: { label: "Master", color: "from-amber-500 to-orange-500", icon: "🎵" },
  percussion: { label: "Percussion", color: "from-red-500 to-pink-500", icon: "🥁" },
  piano_bass: { label: "Piano/Bass", color: "from-blue-500 to-cyan-500", icon: "🎹" },
  vocals_brass: { label: "Vocals/Brass", color: "from-green-500 to-emerald-500", icon: "🎺" },
};

// Track List Component
function TrackList({ 
  tracks, 
  selectedTrack, 
  onSelectTrack,
  isLoading 
}: { 
  tracks: Track[]; 
  selectedTrack: Track | null;
  onSelectTrack: (track: Track) => void;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="w-10 h-10 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white/60">Loading tracks...</p>
      </div>
    );
  }

  if (tracks.length === 0) {
    return (
      <div className="p-8 text-center">
        <Disc size={48} className="mx-auto mb-4 text-white/20" />
        <p className="text-white/60">No tracks available yet.</p>
        <p className="text-white/40 text-sm mt-2">Check back soon for new salsa classics!</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {tracks.map((track) => (
        <button
          key={track.id}
          onClick={() => onSelectTrack(track)}
          className={cn(
            "w-full flex items-center gap-4 p-3 rounded-xl transition-all",
            selectedTrack?.id === track.id
              ? "bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-400/30"
              : "bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10"
          )}
        >
          {track.cover_image_url ? (
            <img
              src={track.cover_image_url}
              alt={track.title}
              className="w-12 h-12 rounded-lg object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
              <Music size={20} className="text-amber-400/50" />
            </div>
          )}
          <div className="flex-1 text-left">
            <h4 className="font-semibold text-white text-sm">{track.title}</h4>
            <p className="text-white/50 text-xs">{track.artist}</p>
          </div>
          <div className="text-right">
            {track.bpm && <span className="text-xs text-amber-400">{track.bpm} BPM</span>}
            <p className="text-white/40 text-xs">
              {Math.floor(track.duration_seconds / 60)}:{(track.duration_seconds % 60).toString().padStart(2, "0")}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
}

// Mixer Component (when a track is selected)
function Mixer({ track, onBack }: { track: Track; onBack: () => void }) {
  // Audio element refs
  const audioRefs = useRef<Record<StemKey, HTMLAudioElement | null>>({
    full_mix: null,
    percussion: null,
    piano_bass: null,
    vocals_brass: null,
  });

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadedCount, setLoadedCount] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [failedStems, setFailedStems] = useState<string[]>([]);

  // Stem states
  const [stemStates, setStemStates] = useState<Record<StemKey, StemState>>({
    full_mix: { volume: 0, muted: true, solo: false }, // Master off by default
    percussion: { volume: 100, muted: false, solo: false },
    piano_bass: { volume: 100, muted: false, solo: false },
    vocals_brass: { volume: 100, muted: false, solo: false },
  });

  // Sync interval ref
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize audio elements
  useEffect(() => {
    const stems: { key: StemKey; url: string }[] = [
      { key: "full_mix", url: track.full_mix_url },
      { key: "percussion", url: track.percussion_url },
      { key: "piano_bass", url: track.piano_bass_url },
      { key: "vocals_brass", url: track.vocals_brass_url },
    ];

    let loaded = 0;
    let errors: string[] = [];

    stems.forEach(({ key, url }) => {
      const audio = new Audio(url);
      audio.preload = "auto";
      audio.volume = key === "full_mix" ? 0 : 1; // Master off by default
      
      audio.addEventListener("canplaythrough", () => {
        loaded++;
        setLoadedCount(loaded);
        if (loaded === 4) {
          setIsLoaded(true);
          setDuration(audio.duration);
        }
      });

      audio.addEventListener("error", () => {
        errors.push(key);
        setFailedStems([...errors]);
        if (errors.length + loaded >= 4) {
          // All stems have either loaded or failed
          if (errors.length === 4) {
            setLoadError("Audio stems not found. See instructions below to add them.");
          }
        }
      });

      audio.addEventListener("timeupdate", () => {
        if (key === "percussion") { // Use one as the source of truth
          setCurrentTime(audio.currentTime);
        }
      });

      audio.addEventListener("ended", () => {
        setIsPlaying(false);
        setCurrentTime(0);
        // Reset all to start
        Object.values(audioRefs.current).forEach((a) => {
          if (a) a.currentTime = 0;
        });
      });

      audioRefs.current[key] = audio;
    });

    return () => {
      // Cleanup
      Object.values(audioRefs.current).forEach((audio) => {
        if (audio) {
          audio.pause();
          audio.src = "";
        }
      });
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, [track]);

  // Sync loop to keep tracks aligned
  useEffect(() => {
    if (isPlaying) {
      syncIntervalRef.current = setInterval(() => {
        const masterTime = audioRefs.current.percussion?.currentTime || 0;
        Object.entries(audioRefs.current).forEach(([key, audio]) => {
          if (audio && key !== "percussion") {
            const diff = Math.abs(audio.currentTime - masterTime);
            if (diff > 0.05) {
              audio.currentTime = masterTime;
            }
          }
        });
      }, 100);
    } else {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    }

    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, [isPlaying]);

  // Apply volume and mute/solo states
  useEffect(() => {
    const hasSolo = Object.values(stemStates).some((s) => s.solo);

    Object.entries(stemStates).forEach(([key, state]) => {
      const audio = audioRefs.current[key as StemKey];
      if (!audio) return;

      let effectiveVolume = state.volume / 100;

      // If any stem is soloed, only play soloed stems
      if (hasSolo) {
        effectiveVolume = state.solo ? effectiveVolume : 0;
      }

      // Apply mute
      if (state.muted) {
        effectiveVolume = 0;
      }

      audio.volume = effectiveVolume;
    });
  }, [stemStates]);

  // Play/Pause all
  const togglePlayback = useCallback(() => {
    if (!isLoaded) return;

    if (isPlaying) {
      Object.values(audioRefs.current).forEach((audio) => audio?.pause());
    } else {
      // Sync all to the same time first
      const targetTime = audioRefs.current.percussion?.currentTime || 0;
      Object.values(audioRefs.current).forEach((audio) => {
        if (audio) {
          audio.currentTime = targetTime;
          audio.play();
        }
      });
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying, isLoaded]);

  // Seek
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;

    Object.values(audioRefs.current).forEach((audio) => {
      if (audio) audio.currentTime = newTime;
    });
    setCurrentTime(newTime);
  };

  // Reset to start
  const resetToStart = () => {
    Object.values(audioRefs.current).forEach((audio) => {
      if (audio) audio.currentTime = 0;
    });
    setCurrentTime(0);
  };

  // Stem controls
  const setVolume = (stem: StemKey, volume: number) => {
    setStemStates((prev) => ({
      ...prev,
      [stem]: { ...prev[stem], volume },
    }));
  };

  const toggleMute = (stem: StemKey) => {
    setStemStates((prev) => ({
      ...prev,
      [stem]: { ...prev[stem], muted: !prev[stem].muted },
    }));
  };

  const toggleSolo = (stem: StemKey) => {
    setStemStates((prev) => ({
      ...prev,
      [stem]: { ...prev[stem], solo: !prev[stem].solo },
    }));
  };

  // Format time
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const hasSolo = Object.values(stemStates).some((s) => s.solo);

  return (
    <>
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center gap-4">
        {track.cover_image_url ? (
          <img
            src={track.cover_image_url}
            alt={track.title}
            className="w-16 h-16 rounded-lg object-cover"
          />
        ) : (
          <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
            <Music size={24} className="text-amber-400/50" />
          </div>
        )}
        <div className="flex-1">
          <h3 className="text-lg font-bold text-white">{track.title}</h3>
          <p className="text-white/60 text-sm">{track.artist}</p>
          {track.bpm && <p className="text-xs text-amber-400">{track.bpm} BPM</p>}
        </div>
        <button 
          onClick={onBack} 
          className="text-white/50 hover:text-white text-sm px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition"
        >
          ← Back
        </button>
      </div>

      {/* Error State - Stems not found */}
      {loadError && (
        <div className="p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto mb-4">
              <Music size={32} className="text-amber-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Audio Stems Required</h3>
            <p className="text-white/60 text-sm max-w-md mx-auto">
              This track needs separated audio stems to use the mixer.
            </p>
          </div>

          <div className="bg-white/5 rounded-xl p-5 border border-white/10 max-w-lg mx-auto">
            <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
              <span className="text-amber-400">📁</span> How to Add Stems
            </h4>
            <ol className="space-y-2 text-sm text-white/70">
              <li className="flex gap-2">
                <span className="text-amber-400 font-bold">1.</span>
                <span>Get the original track (high quality MP3 or WAV)</span>
              </li>
              <li className="flex gap-2">
                <span className="text-amber-400 font-bold">2.</span>
                <span>Use <a href="https://github.com/facebookresearch/demucs" target="_blank" className="text-cyan-400 hover:underline">Demucs</a> or <a href="https://www.lalal.ai/" target="_blank" className="text-cyan-400 hover:underline">LALAL.AI</a> to separate stems</span>
              </li>
              <li className="flex gap-2">
                <span className="text-amber-400 font-bold">3.</span>
                <span>Place 4 files in <code className="bg-black/30 px-1.5 py-0.5 rounded text-xs">/public/audio/dj-booth/{track.title.toLowerCase().replace(/\s+/g, '-')}/</code></span>
              </li>
              <li className="flex gap-2">
                <span className="text-amber-400 font-bold">4.</span>
                <span>Required: <code className="bg-black/30 px-1 rounded text-xs">full_mix.mp3</code>, <code className="bg-black/30 px-1 rounded text-xs">percussion.mp3</code>, <code className="bg-black/30 px-1 rounded text-xs">piano_bass.mp3</code>, <code className="bg-black/30 px-1 rounded text-xs">vocals_brass.mp3</code></span>
              </li>
            </ol>
            
            <div className="mt-4 p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
              <p className="text-xs text-amber-300">
                <strong>🎵 Salsa Stems:</strong> Percussion = congas/timbales/bongos • Piano/Bass = montuno/tumbao • Vocals/Brass = vocals/trumpets/trombones
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {!isLoaded && !loadError && (
        <div className="p-8 text-center">
          <div className="w-10 h-10 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/60">Loading stems... ({loadedCount}/4)</p>
          {failedStems.length > 0 && (
            <p className="text-amber-400/60 text-xs mt-2">
              Missing: {failedStems.map(s => STEM_LABELS[s as StemKey]?.label).join(', ')}
            </p>
          )}
        </div>
      )}

      {isLoaded && !loadError && (
        <>
          {/* Mixer Faders */}
          <div className="p-6 flex justify-center gap-6">
            {(Object.keys(STEM_LABELS) as StemKey[]).map((stem) => {
              const { label, color, icon } = STEM_LABELS[stem];
              const state = stemStates[stem];
              const isEffectivelyMuted = state.muted || (hasSolo && !state.solo);

              return (
                <div key={stem} className="flex flex-col items-center gap-3">
                  {/* Solo Button */}
                  <button
                    onClick={() => toggleSolo(stem)}
                    className={cn(
                      "w-10 h-6 rounded text-xs font-bold transition flex items-center justify-center gap-1",
                      state.solo
                        ? "bg-amber-500 text-black"
                        : "bg-white/10 text-white/50 hover:bg-white/20"
                    )}
                    title="Solo"
                  >
                    <Headphones className="w-3 h-3" />
                    S
                  </button>

                  {/* Fader */}
                  <div className="relative h-40 w-8 bg-black/50 rounded-full border border-white/10">
                    <div
                      className={cn(
                        "absolute bottom-0 left-0 right-0 rounded-full transition-all",
                        `bg-gradient-to-t ${color}`,
                        isEffectivelyMuted && "opacity-30"
                      )}
                      style={{ height: `${state.volume}%` }}
                    />
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={state.volume}
                      onChange={(e) => setVolume(stem, parseInt(e.target.value))}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      style={{ writingMode: "vertical-lr", direction: "rtl" }}
                    />
                  </div>

                  {/* Volume Display */}
                  <span className="text-xs text-white/50 font-mono">{state.volume}%</span>

                  {/* Mute Button */}
                  <button
                    onClick={() => toggleMute(stem)}
                    className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center transition",
                      state.muted
                        ? "bg-red-500/20 text-red-400"
                        : "bg-white/10 text-white/60 hover:bg-white/20"
                    )}
                    title={state.muted ? "Unmute" : "Mute"}
                  >
                    {state.muted ? (
                      <VolumeX className="w-5 h-5" />
                    ) : (
                      <Volume2 className="w-5 h-5" />
                    )}
                  </button>

                  {/* Label */}
                  <div className="text-center">
                    <span className="text-xl">{icon}</span>
                    <p className="text-xs text-white/70 mt-1">{label}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Playback Controls */}
          <div className="p-4 border-t border-white/10">
            {/* Progress Bar */}
            <div
              className="h-2 bg-white/10 rounded-full cursor-pointer mb-4 group"
              onClick={handleSeek}
            >
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full relative"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition" />
              </div>
            </div>

            <div className="flex items-center justify-between">
              {/* Time Display */}
              <span className="text-sm text-white/50 font-mono">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>

              {/* Transport Controls */}
              <div className="flex items-center gap-3">
                <button
                  onClick={resetToStart}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
                >
                  <SkipBack className="w-5 h-5 text-white" />
                </button>
                <motion.button
                  onClick={togglePlayback}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-14 h-14 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/30 transition"
                >
                  {isPlaying ? (
                    <Pause className="w-6 h-6 text-black" fill="currentColor" />
                  ) : (
                    <Play className="w-6 h-6 text-black ml-1" fill="currentColor" />
                  )}
                </motion.button>
              </div>

              {/* BPM Display */}
              <span className="text-sm text-amber-400 font-mono">
                {track.bpm ? `${track.bpm} BPM` : ""}
              </span>
            </div>
          </div>
        </>
      )}
    </>
  );
}

// Main Component
export default function DJBoothMixer() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch tracks on mount
  useEffect(() => {
    const fetchTracks = async () => {
      try {
        setIsLoading(true);
        const data = await apiClient.getDJBoothTracks();
        setTracks(data);
      } catch (err: any) {
        console.error("Failed to fetch DJ Booth tracks:", err);
        setError(err.message || "Failed to load tracks");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTracks();
  }, []);

  return (
    <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-2xl border border-white/10 overflow-hidden">
      {error ? (
        <div className="p-8 text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition"
          >
            Try Again
          </button>
        </div>
      ) : selectedTrack ? (
        <Mixer track={selectedTrack} onBack={() => setSelectedTrack(null)} />
      ) : (
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <Disc size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Select a Track</h3>
              <p className="text-white/50 text-sm">Choose a song to practice with the mixer</p>
            </div>
          </div>
          <TrackList
            tracks={tracks}
            selectedTrack={selectedTrack}
            onSelectTrack={setSelectedTrack}
            isLoading={isLoading}
          />
        </div>
      )}
    </div>
  );
}
