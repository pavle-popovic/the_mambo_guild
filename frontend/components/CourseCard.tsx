"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { HoverCard } from "@/components/ui/motion";
import { Clock, CheckCircle, Sparkles } from "lucide-react";
import { useTranslations } from "@/i18n/useTranslations";
import { apiClient } from "@/lib/api";

type CourseTypeKey = "course" | "choreo" | "topic";

function resolveCourseType(raw?: string): CourseTypeKey {
  const v = (raw || "").toLowerCase();
  // Backend seeds store the long form "choreography"; accept both.
  if (v === "choreo" || v === "choreography") return "choreo";
  if (v === "topic") return "topic";
  return "course";
}

// Translation key for the on-card type badge — resolved via t('courses.<key>').
const COURSE_TYPE_LABEL_KEY: Record<CourseTypeKey, string> = {
  course: "typeCourse",
  choreo: "typeChoreo",
  topic: "typeTopic",
};

// Translation key for the on-card difficulty pill — DB value is one of
// "Beginner" | "Intermediate" | "Advanced" | null/empty.
function difficultyKey(raw?: string): string {
  const d = (raw || "").toLowerCase().trim();
  if (d === "beginner") return "difficultyBeginner";
  if (d === "intermediate") return "difficultyIntermediate";
  if (d === "advanced") return "difficultyAdvanced";
  return "difficultyAll"; // shown as "All Levels" in en, localized elsewhere
}

const COURSE_TYPE_STYLES: Record<
  CourseTypeKey,
  {
    labelText: string;
    border: string;
    hoverBorder: string;
    hoverShadow: string;
    accentBar: string;
  }
> = {
  course: {
    labelText: "text-emerald-300",
    border: "border-emerald-500/20",
    hoverBorder: "hover:border-emerald-400/60",
    hoverShadow: "hover:shadow-emerald-500/20",
    accentBar: "bg-gradient-to-r from-emerald-500 via-green-400 to-emerald-500",
  },
  choreo: {
    labelText: "text-rose-300",
    border: "border-rose-500/20",
    hoverBorder: "hover:border-rose-400/60",
    hoverShadow: "hover:shadow-rose-500/20",
    accentBar: "bg-gradient-to-r from-rose-500 via-red-400 to-rose-500",
  },
  topic: {
    labelText: "text-sky-300",
    border: "border-sky-500/20",
    hoverBorder: "hover:border-sky-400/60",
    hoverShadow: "hover:shadow-sky-500/20",
    accentBar: "bg-gradient-to-r from-sky-500 via-blue-400 to-sky-500",
  },
};

interface CourseCardProps {
  course: {
    id: string;
    slug?: string | null;
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
  const tCourses = useTranslations('courses');
  const tObjectives = useTranslations('courseObjectives');
  const [isHovering, setIsHovering] = useState(false);
  const [isResolvingChoreo, setIsResolvingChoreo] = useState(false);

  const typeKey = resolveCourseType(course.course_type);
  const typeStyle = COURSE_TYPE_STYLES[typeKey];

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

  const handleCourseClickInternal = async () => {
    if (isResolvingChoreo) return;
    onCourseClick(course);

    // Choreographies have a single lesson — jump straight into it.
    if (typeKey === "choreo" && !course.is_locked) {
      try {
        setIsResolvingChoreo(true);
        const lessons = await apiClient.getWorldLessons(course.id);
        const firstUnlocked = lessons.find((l) => !l.is_locked) || lessons[0];
        if (firstUnlocked) {
          router.push(`/lesson/${firstUnlocked.id}`);
          return;
        }
      } catch (err) {
        console.error("Failed to resolve choreo lesson, falling back:", err);
      } finally {
        setIsResolvingChoreo(false);
      }
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
          className={`relative bg-zinc-900 border ${typeStyle.border} rounded-xl overflow-hidden transition-all duration-300 group cursor-pointer ${typeStyle.hoverBorder} hover:shadow-2xl ${typeStyle.hoverShadow} hover:scale-[1.02] z-0 hover:z-10`}
        >
          {/* Top accent bar — colored by course type */}
          <div className={`absolute top-0 left-0 right-0 h-[3px] z-30 ${typeStyle.accentBar}`} />
          {/* Image/Preview section — wider ratio on mobile for compact cards */}
          <div className="relative aspect-[2/1] sm:aspect-[16/9]">
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
              <div className="absolute top-1 left-1 flex items-center gap-1 sm:gap-2 z-20">
                {moduleCount > 0 && (
                  <div className="bg-black/70 backdrop-blur-sm rounded-lg px-1.5 sm:px-2.5 py-0.5 sm:py-1 border border-white/10">
                    <span className="text-xs sm:text-sm font-bold text-mambo-gold">{moduleCount}</span>
                    <span className="text-[9px] sm:text-[10px] text-gray-400 ml-0.5 sm:ml-1 uppercase">{tCourses('modules')}</span>
                  </div>
                )}
                {lessonCount > 0 && (
                  <div className="bg-black/70 backdrop-blur-sm rounded-lg px-1.5 sm:px-2.5 py-0.5 sm:py-1 border border-white/10">
                    <span className="text-xs sm:text-sm font-bold text-cyan-400">{lessonCount}</span>
                    <span className="text-[9px] sm:text-[10px] text-gray-400 ml-0.5 sm:ml-1 uppercase">{tCourses('lessons')}</span>
                  </div>
                )}
                {duration && (
                  <div className="bg-black/70 backdrop-blur-sm rounded-lg px-1.5 sm:px-2.5 py-0.5 sm:py-1 border border-white/10 flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-purple-400" />
                    <span className="text-[10px] sm:text-[11px] font-bold text-purple-100 uppercase tracking-wide">{duration}</span>
                  </div>
                )}
              </div>
            )}

            {/* Choreo loading overlay — while we resolve the single lesson */}
            {isResolvingChoreo && (
              <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                <div className="w-8 h-8 border-2 border-rose-400/30 border-t-rose-400 rounded-full animate-spin" />
              </div>
            )}

            {/* Lock Badge - Top Right */}
            {course.is_locked && (
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
                <h3 className="gold-shimmer-text font-bold text-base sm:text-xl tracking-wide drop-shadow-md line-clamp-2">{course.title}</h3>
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider font-semibold">
                  <span className={`${course.difficulty === 'Beginner' ? 'text-green-400' : course.difficulty === 'Intermediate' ? 'text-yellow-400' : course.difficulty === 'Advanced' ? 'text-red-400' : 'text-purple-400'}`}>
                    {tCourses(difficultyKey(course.difficulty))}
                  </span>
                  <span className="text-gray-500">•</span>
                  <span className={typeStyle.labelText}>{tCourses(COURSE_TYPE_LABEL_KEY[typeKey])}</span>
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
                  <i className="fa-solid fa-play text-xs"></i> {tCourses('startCourse')}
                </span>
              </button>
            ) : course.progress_percentage >= 100 ? (
              // 100% - Completed Badge
              <div className="w-full py-2.5 bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 font-bold text-sm uppercase tracking-wider rounded-lg border border-green-500/40 flex items-center justify-center gap-2">
                <i className="fa-solid fa-check-circle"></i> {tCourses('completed')}
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

          {/* Objectives Section - Always visible on mobile, hover-expand on desktop */}
          {hasObjectives && (
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out max-h-60 opacity-100 lg:opacity-0 lg:max-h-0 ${
                isHovering ? 'lg:max-h-60 lg:opacity-100' : ''
              }`}
            >
              <div className="p-4 pt-0 bg-black border-t border-gray-800">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-mambo-gold" />
                  <span className="text-xs uppercase text-mambo-gold font-bold tracking-wider">{tCourses('whatYoullLearn')}</span>
                </div>
                <ul className="space-y-2">
                  {course.objectives?.slice(0, 3).map((objective, idx) => {
                    // Prefer the i18n lookup courseObjectives.<slug>.<idx>; fall
                    // back to the DB-provided English string if the slug isn't
                    // known or the key is missing.
                    const key = course.slug ? `${course.slug}.${idx}` : "";
                    const translated = key ? tObjectives(key) : "";
                    const text = translated && translated !== key ? translated : objective;
                    return (
                      <li key={idx} className="flex items-start gap-2.5">
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mt-0.5">
                          <CheckCircle className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-sm text-gray-200 leading-tight">{text}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          )}
        </div>
      </HoverCard>


    </>
  );
}
