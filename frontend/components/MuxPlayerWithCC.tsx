"use client";

/**
 * MuxPlayerWithCC — Mux video player with automatic closed-caption track
 * synchronisation to the global UI language.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * HOW MUX + CC WORKS
 * ─────────────────────────────────────────────────────────────────────────────
 * 1. When you add a VTT subtitle track to a Mux asset (via the Mux API or
 *    Dashboard), you supply a `language_code` (BCP-47, e.g. "en", "es", "fr").
 * 2. Mux exposes these as <track> elements inside the shadow DOM of <mux-player>.
 * 3. The browser's TextTrackList API lets us read and switch them at runtime.
 * 4. This component:
 *    a. Passes `defaultSubtitlesLang` to <MuxPlayer> so the correct track is
 *       shown on first load.
 *    b. On every locale change, imperatively iterates the video element's
 *       textTracks and sets the matching track to "showing" / others to "hidden".
 *    c. Falls back gracefully to English if the requested language has no track.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * REQUIRED MUX SETUP (do this once per video asset)
 * ─────────────────────────────────────────────────────────────────────────────
 *   POST https://api.mux.com/video/v1/assets/{ASSET_ID}/tracks
 *   Body: { "type": "text", "text_type": "subtitles",
 *           "language_code": "es",
 *           "url": "https://your-cdn.com/subs/es.vtt" }
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * USAGE
 * ─────────────────────────────────────────────────────────────────────────────
 *   import MuxPlayerWithCC from '@/components/MuxPlayerWithCC';
 *
 *   <MuxPlayerWithCC
 *     playbackId="your-mux-playback-id"
 *     // All props from MuxVideoPlayerProps are forwarded.
 *   />
 *
 * The component reads the active locale automatically from <LocaleProvider>.
 * No extra props needed for language switching.
 */

import MuxPlayer from "@mux/mux-player-react";
import type MuxPlayerElement from "@mux/mux-player";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { useLocale } from "@/i18n/client";
import { LOCALE_TO_MUX_LANG } from "@/i18n/config";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface MuxPlayerWithCCProps {
  playbackId: string;
  poster?: string;
  onEnded?: () => void;
  onPlay?: () => void;
  onPlaying?: () => void;
  onPause?: () => void;
  onTimeUpdate?: (currentTime: number) => void;
  onLoadedMetadata?: (duration: number) => void;
  autoPlay?: boolean;
  durationMinutes?: number | null;
  metadata?: {
    video_title?: string;
    video_id?: string;
  };
  /** Show CC UI at all? Defaults to true. */
  enableCaptions?: boolean;
}

export interface MuxPlayerWithCCHandle {
  getVideoElement: () => HTMLVideoElement | null;
  getCurrentTime: () => number;
  getDuration: () => number;
  setCurrentTime: (time: number) => void;
  getPlaybackRate: () => number;
  setPlaybackRate: (rate: number) => void;
  isPaused: () => boolean;
  play: () => void;
  pause: () => void;
}

// ─── Track switcher ───────────────────────────────────────────────────────────

/**
 * Given a video element and a target BCP-47 language code, activate the
 * matching subtitle/caption track and hide all others.
 * Returns the language that was actually activated ('en' fallback if needed).
 */
function switchCaptionTrack(
  video: HTMLVideoElement,
  targetLang: string
): string {
  const tracks = video.textTracks;
  if (!tracks || tracks.length === 0) return targetLang;

  let found = false;
  let activeLang = targetLang;

  // First pass — try exact match
  for (let i = 0; i < tracks.length; i++) {
    const track = tracks[i];
    if (
      (track.kind === "subtitles" || track.kind === "captions") &&
      track.language === targetLang
    ) {
      track.mode = "showing";
      found = true;
      break;
    }
  }

  // Second pass — if no exact match, fall back to English
  if (!found) {
    for (let i = 0; i < tracks.length; i++) {
      const track = tracks[i];
      if (
        (track.kind === "subtitles" || track.kind === "captions") &&
        (track.language === "en" || track.language === "en-US")
      ) {
        track.mode = "showing";
        found = true;
        activeLang = "en";
        break;
      }
    }
  }

  // Third pass — hide all other tracks
  for (let i = 0; i < tracks.length; i++) {
    const track = tracks[i];
    if (track.mode === "showing" && track.language !== activeLang) {
      track.mode = "hidden";
    }
  }

  return activeLang;
}

// ─── Component ───────────────────────────────────────────────────────────────

const MuxPlayerWithCC = forwardRef<MuxPlayerWithCCHandle, MuxPlayerWithCCProps>(
  function MuxPlayerWithCC(
    {
      playbackId,
      poster,
      onEnded,
      onPlay,
      onPlaying,
      onPause,
      onTimeUpdate,
      onLoadedMetadata,
      autoPlay = false,
      durationMinutes,
      metadata,
      enableCaptions = true,
    },
    ref
  ) {
    const locale = useLocale();
    const muxRef = useRef<MuxPlayerElement>(null);
    const [ccFallback, setCcFallback] = useState(false);

    // Map locale → BCP-47 code Mux understands
    const muxLang = LOCALE_TO_MUX_LANG[locale] ?? locale;

    // ── Get the underlying <video> element ──────────────────────────────────
    const getVideoElement = useCallback((): HTMLVideoElement | null => {
      const player = muxRef.current;
      if (!player) return null;
      return (player as any).media?.nativeEl ?? null;
    }, []);

    // ── Switch tracks whenever the locale changes ────────────────────────────
    useEffect(() => {
      if (!enableCaptions) return;

      const video = getVideoElement();
      if (!video) return;

      const apply = () => {
        const activated = switchCaptionTrack(video, muxLang);
        setCcFallback(activated !== muxLang);
      };

      // textTracks may not be loaded yet — listen for addtrack as well
      if (video.readyState >= 1) {
        apply();
      }

      video.textTracks.addEventListener("addtrack", apply);
      video.addEventListener("loadedmetadata", apply);

      return () => {
        video.textTracks.removeEventListener("addtrack", apply);
        video.removeEventListener("loadedmetadata", apply);
      };
    }, [locale, muxLang, enableCaptions, getVideoElement]);

    // ── Expose imperative handle ─────────────────────────────────────────────
    useImperativeHandle(ref, () => ({
      getVideoElement,
      getCurrentTime: () => getVideoElement()?.currentTime ?? 0,
      getDuration: () => getVideoElement()?.duration ?? 0,
      setCurrentTime: (t) => {
        const v = getVideoElement();
        if (v) v.currentTime = t;
      },
      getPlaybackRate: () => getVideoElement()?.playbackRate ?? 1,
      setPlaybackRate: (r) => {
        const v = getVideoElement();
        if (!v) return;
        v.playbackRate = r;
        if ("preservesPitch" in v) (v as any).preservesPitch = true;
        else if ("webkitPreservesPitch" in v) (v as any).webkitPreservesPitch = true;
      },
      isPaused: () => getVideoElement()?.paused ?? true,
      play: () => getVideoElement()?.play(),
      pause: () => getVideoElement()?.pause(),
    }), [getVideoElement]);

    // ── Event handlers ───────────────────────────────────────────────────────
    const handleTimeUpdate = useCallback(() => {
      if (!onTimeUpdate) return;
      const v = getVideoElement();
      if (v) onTimeUpdate(v.currentTime);
    }, [onTimeUpdate, getVideoElement]);

    const handleLoadedMetadata = useCallback(() => {
      if (!onLoadedMetadata) return;
      const v = getVideoElement();
      if (v) onLoadedMetadata(v.duration);
    }, [onLoadedMetadata, getVideoElement]);

    const posterUrl =
      poster ?? (playbackId ? `https://image.mux.com/${playbackId}/thumbnail.png` : undefined);

    return (
      <div className="w-full bg-gray-900 relative aspect-video max-h-[70vh]">
        {/* Transparent caption background (covers both native ::cue and Mux shadow DOM) */}
        <style>{`
          ::cue {
            background-color: transparent !important;
            background: transparent !important;
            color: white !important;
            font-family: "Helvetica Neue", Helvetica, Arial, sans-serif !important;
            font-size: 85% !important;
            text-shadow:
              -1px -1px 0 rgba(0,0,0,0.95),
               1px -1px 0 rgba(0,0,0,0.95),
              -1px  1px 0 rgba(0,0,0,0.95),
               1px  1px 0 rgba(0,0,0,0.95) !important;
          }
          ::cue-region { background-color: transparent !important; }
        `}</style>

        <MuxPlayer
          ref={muxRef}
          playbackId={playbackId}
          streamType="on-demand"
          autoPlay={autoPlay}
          maxResolution="1080p"
          preload={autoPlay ? "auto" : "metadata"}
          poster={posterUrl}
          primaryColor="#D4AF37"
          secondaryColor="#8c8c8c"
          playbackRates={[] as any}
          /* Tell Mux which subtitle track to activate on initial load */
          {...(enableCaptions && muxLang ? { defaultSubtitlesLang: muxLang } as any : {})}
          metadata={{
            video_title: metadata?.video_title,
            video_id: metadata?.video_id ?? playbackId,
            ...metadata,
          }}
          onEnded={onEnded}
          onPlay={onPlay}
          onPlaying={onPlaying}
          onPause={onPause}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          style={{
            "--controls-background-color": "rgba(0,0,0,0.8)",
            "--media-range-buffered-color": "#6b7280",
            "--media-range-track-buffered-color": "#6b7280",
            "--media-cue-background-color": "transparent",
            "--media-captions-background-color": "transparent",
            "--media-text-display-background-color": "transparent",
            "--media-captions-display-background": "transparent",
            "--cue-background-color": "transparent",
            "--media-text-color": "white",
            "--media-captions-text-color": "white",
            height: "100%",
            width: "100%",
          } as any}
        />

        {/* Subtle fallback notice when the requested language has no VTT track */}
        {ccFallback && enableCaptions && (
          <div
            className="
              absolute bottom-14 left-1/2 -translate-x-1/2
              text-xs text-white/60 bg-black/40 rounded px-2 py-0.5
              pointer-events-none select-none
            "
          >
            Showing English captions — {locale.toUpperCase()} coming soon
          </div>
        )}
      </div>
    );
  }
);

export default MuxPlayerWithCC;
