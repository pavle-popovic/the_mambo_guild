"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { FaVolumeMute, FaVolumeUp } from "react-icons/fa";

export default function GlobalAudioPlayer() {
  // ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const pathname = usePathname();
  
  // Check if we're on pages where music should NOT play
  const isLessonPage = pathname?.startsWith("/lesson/");
  const isAdminPage = pathname?.startsWith("/admin/");
  const shouldHidePlayer = isLessonPage || isAdminPage;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // On lesson/admin pages, pause and stop audio
    if (shouldHidePlayer) {
      audio.pause();
      audio.currentTime = 0; // Reset to beginning
      return;
    }

    // Set volume to low (20%)
    audio.volume = 0.2;
    audio.loop = true;

    // Try to play on mount (only if not on lesson/admin pages)
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((error) => {
        // Autoplay was prevented, user interaction required
        console.log("Audio autoplay prevented:", error);
      });
    }
  }, [shouldHidePlayer]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // On lesson/admin pages, always pause
    if (shouldHidePlayer) {
      audio.pause();
      return;
    }

    // Handle mute/unmute only when not on lesson/admin pages
    if (isMuted) {
      audio.pause();
    } else {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.log("Audio play failed:", error);
        });
      }
    }
  }, [isMuted, shouldHidePlayer]);

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  // Don't render the audio player at all on lesson or admin pages
  if (shouldHidePlayer) {
    return null;
  }

  return (
    <>
      <audio ref={audioRef} src="/assets/Mambo_Inn.mp3" preload="auto" />
      <button
        onClick={toggleMute}
        className="fixed bottom-6 right-6 z-50 w-12 h-12 bg-mambo-panel border border-gray-700 rounded-full flex items-center justify-center hover:bg-gray-800 transition shadow-lg"
        aria-label={isMuted ? "Unmute background music" : "Mute background music"}
      >
        {isMuted ? (
          <FaVolumeMute className="text-gray-400 text-lg" />
        ) : (
          <FaVolumeUp className="text-mambo-blue text-lg" />
        )}
      </button>
    </>
  );
}

