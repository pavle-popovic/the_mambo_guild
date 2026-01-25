"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { HoverCard } from "@/components/ui/motion";
import AuthPromptModal from "@/components/AuthPromptModal";
import { Clock, CheckCircle, Sparkles } from "lucide-react";

interface CourseCardProps {
  course: {
    id: string;
    title: string;
    description: string | null;
    image_url: string | null;
    thumbnail_url: string | null;
    mux_preview_playback_id?: string | null;
    difficulty: string;
    course_type?: string;
    progress_percentage: number;
    is_locked: boolean;
    // Course metadata
    total_duration_minutes?: number;
    objectives?: string[];
    module_count?: number;
    lesson_count?: number;
  };
  index: number;
  user: any;
  onCourseClick: (course: CourseCardProps["course"]) => void;
}

export default function CourseCard({ course, index, user, onCourseClick }: CourseCardProps) {
  const router = useRouter();
  const [isHovering, setIsHovering] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);

  // Static thumbnail URL
  const thumbnailUrl = course.thumbnail_url || course.image_url || "/assets/Mambo_image_1.png";

  // Animated GIF preview URL (3 seconds, 15fps) - only loads on hover, uses Mux Image API (cheap!)
  const previewGifUrl = course.mux_preview_playback_id
    ? `https://image.mux.com/${course.mux_preview_playback_id}/animated.gif?start=0&end=3&width=480&fps=15`
    : null;

  // Show GIF on hover if available, otherwise show static thumbnail
  const displayUrl = isHovering && previewGifUrl ? previewGifUrl : thumbnailUrl;

  // Format duration (e.g., "15 min" or "1h 30m")
  const formatDuration = (minutes: number) => {
    if (!minutes) return null;
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
  };

  const handleMouseEnter = () => {
    setIsHovering(true);
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

  const duration = formatDuration(course.total_duration_minutes || 0);
  const hasObjectives = course.objectives && course.objectives.length > 0;
  const moduleCount = course.module_count ?? 0;
  const lessonCount = course.lesson_count ?? 0;

  return (
    <>
      {/* Gold shimmer animation style */}
      <style jsx>{`
        @keyframes gold-shimmer {
          0% {
            background-position: -200% center;
          }
          100% {
            background-position: 200% center;
          }
        }
        .gold-shimmer-text {
          background: linear-gradient(
            90deg,
            #d4af37 0%,
            #f4e5a3 25%,
            #d4af37 50%,
            #f4e5a3 75%,
            #d4af37 100%
          );
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: gold-shimmer 3s linear infinite;
        }
      `}</style>

      <HoverCard>
        <div
          onClick={handleCourseClickInternal}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className={`relative bg-zinc-900 border border-white/10 rounded-xl overflow-hidden transition-all duration-300 group cursor-pointer ${course.is_locked || !user ? "opacity-90" : "hover:border-mambo-gold/50 hover:shadow-2xl hover:shadow-mambo-gold/10 hover:scale-[1.02] z-0 hover:z-10"
            }`}
        >
          {/* Image/Preview section */}
          <div className="relative aspect-[16/9]">
            <Image
              src={displayUrl}
              alt={course.title}
              fill
              unoptimized={isHovering && !!previewGifUrl}
              className="object-cover transition-opacity duration-300"
            />

            {/* Gradient Overlay for Text Readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-80" />

            {/* Stats Badge - Top Left */}
            {(moduleCount > 0 || lessonCount > 0 || duration) && (
              <div className="absolute top-1 left-1 flex items-center gap-2 z-20">
                {moduleCount > 0 && (
                  <div className="bg-black/70 backdrop-blur-sm rounded-lg px-2.5 py-1 border border-white/10">
                    <span className="text-sm font-bold text-mambo-gold">{moduleCount}</span>
                    <span className="text-[10px] text-gray-400 ml-1 uppercase">Modules</span>
                  </div>
                )}
                {lessonCount > 0 && (
                  <div className="bg-black/70 backdrop-blur-sm rounded-lg px-2.5 py-1 border border-white/10">
                    <span className="text-sm font-bold text-cyan-400">{lessonCount}</span>
                    <span className="text-[10px] text-gray-400 ml-1 uppercase">Lessons</span>
                  </div>
                )}
                {duration && (
                  <div className="bg-black/70 backdrop-blur-sm rounded-lg px-2.5 py-1 border border-white/10 flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-purple-400" />
                    <span className="text-[11px] font-bold text-purple-100 uppercase tracking-wide">{duration}</span>
                  </div>
                )}
              </div>
            )}

            {/* Lock Badge - Top Right */}
            {(course.is_locked || !user) && (
              <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md p-1.5 rounded-full text-mambo-gold z-20">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </div>
            )}

            {/* Title and metadata overlay at bottom of image */}
            <div className="absolute bottom-0 left-0 right-0 px-4 pt-4 pb-0 z-10">
              {/* Title + Level + Type on same line */}
              <div className="flex items-baseline gap-3 flex-wrap mb-0.5">
                <h3 className="gold-shimmer-text font-bold text-xl tracking-wide drop-shadow-md">{course.title}</h3>
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider font-semibold">
                  <span className={`${course.difficulty === 'Beginner' ? 'text-green-400' : course.difficulty === 'Intermediate' ? 'text-yellow-400' : course.difficulty === 'Advanced' ? 'text-red-400' : 'text-purple-400'}`}>
                    {course.difficulty || "All Levels"}
                  </span>
                  <span className="text-gray-500">•</span>
                  <span className="text-cyan-300">{course.course_type === 'choreo' ? 'Choreo' : course.course_type === 'topic' ? 'Topic' : 'Course'}</span>
                </div>
              </div>

            </div>
          </div>

          {/* Bottom Section - Progress/Action */}
          <div className="p-3 bg-gradient-to-b from-zinc-900 to-black">
            {course.progress_percentage === 0 ? (
              // 0% - Start Course Button
              <button
                className="w-full py-2.5 bg-gradient-to-r from-mambo-gold/20 to-yellow-600/20 hover:from-mambo-gold/30 hover:to-yellow-600/30 text-mambo-gold font-bold text-sm uppercase tracking-wider rounded-lg border border-mambo-gold/40 transition-all duration-300"
              >
                <span className="flex items-center justify-center gap-2">
                  <i className="fa-solid fa-play text-xs"></i> Start Course
                </span>
              </button>
            ) : course.progress_percentage >= 100 ? (
              // 100% - Completed Badge
              <div className="w-full py-2.5 bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 font-bold text-sm uppercase tracking-wider rounded-lg border border-green-500/40 flex items-center justify-center gap-2">
                <i className="fa-solid fa-check-circle"></i> Completed
              </div>
            ) : (
              // 1-99% - Progress Bar
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2.5 bg-gray-800/50 rounded-full overflow-hidden border border-white/5">
                  <div
                    className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 h-full transition-all duration-500 relative"
                    style={{ width: `${Math.min(course.progress_percentage, 100)}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20 animate-pulse" />
                  </div>
                </div>
                <span className="text-sm font-bold text-purple-400 min-w-[3ch]">
                  {Math.round(course.progress_percentage)}%
                </span>
              </div>
            )}
          </div>

          {/* Objectives Section - Expands below on hover */}
          {hasObjectives && (
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isHovering ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="p-4 pt-0 bg-black border-t border-gray-800">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-mambo-gold" />
                  <span className="text-xs uppercase text-mambo-gold font-bold tracking-wider">What You'll Learn</span>
                </div>
                <ul className="space-y-2">
                  {course.objectives?.slice(0, 3).map((objective, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mt-0.5">
                        <CheckCircle className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-sm text-gray-200 leading-tight">{objective}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </HoverCard>


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
