"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { HoverCard, Clickable, StaggerItem } from "@/components/ui/motion";
import AuthPromptModal from "@/components/AuthPromptModal";

// Dynamically import Mux player to avoid SSR issues
const MuxPlayer = dynamic(() => import("@mux/mux-player-react"), { ssr: false });

interface CourseCardProps {
  course: {
    id: string;
    title: string;
    description: string | null;
    image_url: string | null;
    thumbnail_url: string | null;
    mux_preview_playback_id?: string | null;
    difficulty: string;
    progress_percentage: number;
    is_locked: boolean;
  };
  index: number;
  user: any;
  onCourseClick: (course: CourseCardProps["course"]) => void;
}

export default function CourseCard({ course, index, user, onCourseClick }: CourseCardProps) {
  const router = useRouter();
  const [isHovering, setIsHovering] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);
  const playerRef = useRef<any>(null);
  const errorHandledRef = useRef(false);

  // Reset state when mouse leaves
  const handleMouseLeave = () => {
    setIsHovering(false);
    setIsPlaying(false);
    setHasError(false);
    errorHandledRef.current = false;
    
    // Pause and reset video if player exists
    if (playerRef.current) {
      try {
        const playerElement = playerRef.current;
        if (playerElement && typeof playerElement.pause === 'function') {
          playerElement.pause();
          if (playerElement.currentTime !== undefined) {
            playerElement.currentTime = 0;
          }
        }
      } catch (e) {
        // Ignore errors when resetting
      }
    }
  };

  const handleMouseEnter = () => {
    // Only set hovering if we have a preview video
    if (course.mux_preview_playback_id && !hasError) {
      setIsHovering(true);
      setIsPlaying(false);
      setHasError(false);
      errorHandledRef.current = false;
    }
  };

  const handlePlaying = () => {
    setIsPlaying(true);
    setHasError(false);
  };

  const handleError = (e?: Event) => {
    if (!errorHandledRef.current) {
      errorHandledRef.current = true;
      setHasError(true);
      setIsPlaying(false);
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
    }
  };

  const handleCourseClickInternal = () => {
    onCourseClick(course);
    
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (course.is_locked) {
      setShowSubscribeModal(true);
      return;
    }
    
    router.push(`/courses/${course.id}`);
  };

  // Determine if we should show the video
  const shouldShowVideo = isHovering && course.mux_preview_playback_id && !hasError;
  
  // Determine thumbnail opacity - only hide when video is actually playing
  const thumbnailOpacity = shouldShowVideo && isPlaying ? "opacity-0" : "opacity-100";

  return (
    <>
      <StaggerItem>
        <HoverCard>
          <div
            onClick={handleCourseClickInternal}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={`bg-mambo-panel border border-transparent hover:border-blue-500/30 rounded-xl overflow-hidden transition-all duration-300 ${
              course.is_locked || !user
                ? "opacity-75 relative"
                : "group cursor-pointer shadow-lg shadow-black/20"
            } cursor-pointer`}
          >
            {/* Image/Preview section */}
            <div className="h-48 relative overflow-hidden bg-black">
              {/* Video Player - Load behind thumbnail, only mount when hovering */}
              {shouldShowVideo && (
                <div className="absolute inset-0 z-0 course-preview-player">
                  <MuxPlayer
                    ref={playerRef}
                    streamType="on-demand"
                    playbackId={course.mux_preview_playback_id!}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-cover"
                    style={{ 
                      pointerEvents: "none",
                    } as React.CSSProperties}
                    controls={false}
                    nohotkeys
                    novolumepref
                    defaultShowCaptions={false}
                    onPlaying={handlePlaying}
                    onError={handleError}
                    onLoadedData={() => {
                      // Video data loaded, ready to play
                      setIsPlaying(false); // Will be set to true by onPlaying
                    }}
                  />
                </div>
              )}

              {/* Thumbnail - Always visible, fades out when video is playing */}
              {(course.thumbnail_url || course.image_url) ? (
                <Image
                  src={course.thumbnail_url || course.image_url || ""}
                  alt={course.title}
                  fill
                  className={`object-cover aspect-video transition-opacity duration-300 rounded-t-xl relative z-10 ${
                    thumbnailOpacity === "opacity-0" 
                      ? "opacity-0" 
                      : "opacity-100 group-hover:scale-105"
                  }`}
                />
              ) : (
                <Image
                  src="/assets/Mambo_image_1.png"
                  alt={course.title}
                  fill
                  className={`object-cover aspect-video transition-opacity duration-300 rounded-t-xl relative z-10 ${
                    thumbnailOpacity === "opacity-0" 
                      ? "opacity-0" 
                      : "opacity-100 group-hover:scale-105"
                  }`}
                  style={{ objectPosition: 'center 15%' }}
                />
              )}

              {/* Dark overlay for better text readability */}
              <div className="absolute inset-0 bg-black/30 z-10" />
              
              {/* Course badge at bottom-left */}
              <div className="absolute bottom-3 left-3 bg-black/80 backdrop-blur px-2 py-1 rounded text-xs font-bold text-white z-20">
                COURSE {index + 1}
              </div>
            </div>

            {/* Content section */}
            <div className="p-6 border-t border-white/10">
              <div className="flex justify-between items-start mb-3">
                <h3
                  className={`font-bold text-lg tracking-tight transition ${
                    course.is_locked || !user
                      ? "text-gray-500"
                      : "group-hover:text-mambo-blue text-mambo-text"
                  }`}
                >
                  {course.title}
                </h3>
                {!course.is_locked && user && (
                  <svg
                    className="w-6 h-6 text-mambo-blue shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
              <p className="text-sm text-gray-300 mb-6 line-clamp-2 leading-relaxed flex-1">
                {course.description}
              </p>
            
              <div className="flex items-center gap-3 text-xs font-semibold text-gray-400 mb-4">
                <div className="flex-1 bg-gray-800 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-emerald-500 h-full transition-all duration-500" 
                    style={{ width: `${course.progress_percentage}%` }}
                  ></div>
                </div>
                <span className="text-white font-bold">{Math.round(course.progress_percentage)}%</span>
              </div>
              
              {/* Action Button */}
              {course.is_locked || !user ? (
                <div className="w-full py-2.5 bg-gray-800 text-gray-500 rounded-lg text-sm font-bold text-center cursor-not-allowed">
                  Locked
                </div>
              ) : (
                <Clickable>
                  <Link
                    href={`/courses/${course.id}`}
                    className="w-full py-2.5 bg-gradient-to-r from-mambo-blue via-blue-500 to-purple-600 hover:from-blue-600 hover:via-blue-600 hover:to-purple-700 rounded-lg text-sm font-bold text-white transition-all duration-300 text-center cursor-pointer shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30"
                  >
                    Start Course
                  </Link>
                </Clickable>
              )}
            </div>
          </div>
        </HoverCard>
      </StaggerItem>

      {/* Auth Prompt Modal */}
      <AuthPromptModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        type="login"
        courseTitle={course.title}
      />

      {/* Subscribe Prompt Modal */}
      <AuthPromptModal
        isOpen={showSubscribeModal}
        onClose={() => setShowSubscribeModal(false)}
        type="subscribe"
        courseTitle={course.title}
      />
    </>
  );
}

