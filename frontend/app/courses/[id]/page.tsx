"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import NavBar from "@/components/NavBar";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api";
import QuestLogSidebar from "@/components/QuestLogSidebar";

interface Lesson {
  id: string;
  title: string;
  xp_value: number;
  is_completed: boolean;
  is_locked: boolean;
  is_boss_battle: boolean;
  order_index: number;
  week_number: number | null;
  day_number: number | null;
}

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const courseId = params.id as string;

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [courseTitle, setCourseTitle] = useState("Loading...");
  const [courseProgress, setCourseProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadCourse();
  }, [courseId]);

  const loadCourse = async () => {
    try {
      setLoading(true);
      setError("");
      const courses = await apiClient.getWorlds();
      const course = courses.find((c) => c.id === courseId);
      
      if (!course) {
        setError("Course not found");
        return;
      }

      setCourseTitle(course.title);
      
      // Load lessons - works for both authenticated and unauthenticated users
      try {
        const courseLessons = await apiClient.getWorldLessons(courseId);
        setLessons(courseLessons);
        
        if (user) {
          const completed = courseLessons.filter((l) => l.is_completed).length;
          setCourseProgress((completed / courseLessons.length) * 100);
        } else {
          setCourseProgress(0);
        }
      } catch (lessonErr: any) {
        // If lessons can't be loaded, show empty list but don't show error
        console.error("Failed to load lessons:", lessonErr);
        setLessons([]);
        setCourseProgress(0);
      }
    } catch (err: any) {
      console.error("Failed to load course:", err);
      setError(err.message || "Failed to load course");
    } finally {
      setLoading(false);
    }
  };

  const handleLessonClick = (lessonId: string, isLocked: boolean) => {
    // If lesson is locked, don't navigate
    if (isLocked) {
      return;
    }
    
    // Navigate immediately - no confirm dialogs for speed
    router.push(`/lesson/${lessonId}`, { scroll: false });
  };

  const getFirstUnlockedLesson = () => {
    return lessons.find((l) => !l.is_locked && !l.is_completed) || lessons.find((l) => !l.is_locked) || lessons[0];
  };

  const getNextLesson = () => {
    // Find the first uncompleted, unlocked lesson
    return lessons.find((l) => !l.is_locked && !l.is_completed) || lessons.find((l) => !l.is_locked);
  };

  const hasStartedCourse = () => {
    // Check if user has completed any lessons
    return lessons.some((l) => l.is_completed);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-mambo-dark flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-mambo-dark">
        <NavBar user={user ? { ...user, avatar_url: user.avatar_url || undefined } : undefined} />
        <div className="max-w-7xl mx-auto px-8 py-16 pt-28">
          <div className="bg-red-900/20 border border-red-600/30 rounded-xl p-8 text-center">
            <p className="text-red-400 mb-6 text-lg">{error}</p>
            {!user && (
              <div className="flex gap-4 justify-center">
                <Link
                  href="/register"
                  className="px-6 py-3 bg-mambo-blue hover:bg-blue-600 text-white rounded-lg font-bold transition"
                >
                  Create Free Account
                </Link>
                <Link
                  href="/login"
                  className="px-6 py-3 border border-gray-600 hover:bg-gray-800 text-mambo-text rounded-lg font-bold transition"
                >
                  Log In
                </Link>
              </div>
            )}
            <Link
              href="/courses"
              className="inline-block mt-4 text-gray-400 hover:text-mambo-text transition"
            >
              ← Back to Courses
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const firstLesson = getFirstUnlockedLesson();
  const nextLesson = getNextLesson();
  const courseStarted = hasStartedCourse();

  return (
    <div className="min-h-screen bg-mambo-dark">
      <NavBar user={user ? { ...user, avatar_url: user.avatar_url || undefined } : undefined} />

      <div className="max-w-7xl mx-auto px-8 py-12 pt-28">
        <Link
          href="/courses"
          className="text-gray-400 hover:text-mambo-text transition mb-6 inline-block"
        >
          ← Back to Courses
        </Link>

        <div className="mb-8">
          <div className="flex items-start justify-between gap-6 mb-6">
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-4 text-mambo-text">{courseTitle}</h1>
              {user && courseProgress > 0 && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex-1 bg-gray-800 h-2 rounded-full overflow-hidden max-w-md">
                    <div
                      className="bg-green-500 h-full transition-all"
                      style={{ width: `${courseProgress}%` }}
                    />
                  </div>
                  <span className="text-gray-400">
                    {Math.round(courseProgress)}% Complete
                  </span>
                </div>
              )}
            </div>
            
            {/* Prominent button at top - always visible when available */}
            {user && firstLesson && !firstLesson.is_locked && (
              <div className="flex-shrink-0">
                {firstLesson.is_completed && nextLesson ? (
                  <Link
                    href={`/lesson/${nextLesson.id}`}
                    className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-mambo-blue via-blue-500 to-purple-600 hover:from-blue-600 hover:via-blue-600 hover:to-purple-700 text-white font-bold rounded-full transition-all duration-300 shadow-lg shadow-blue-500/40 hover:shadow-xl hover:shadow-blue-500/50 hover:scale-105 active:scale-95"
                  >
                    <span className="relative z-10">Continue Learning</span>
                    <svg 
                      className="w-5 h-5 relative z-10 transition-transform group-hover:translate-x-1" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </Link>
                ) : (
                  <Link
                    href={`/lesson/${courseStarted && nextLesson ? nextLesson.id : firstLesson.id}`}
                    className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-mambo-blue via-blue-500 to-purple-600 hover:from-blue-600 hover:via-blue-600 hover:to-purple-700 text-white font-bold rounded-full transition-all duration-300 shadow-lg shadow-blue-500/40 hover:shadow-xl hover:shadow-blue-500/50 hover:scale-105 active:scale-95"
                  >
                    <span className="relative z-10">{courseStarted ? "Continue Learning" : "Start First Lesson"}</span>
                    <svg 
                      className="w-5 h-5 relative z-10 transition-transform group-hover:translate-x-1" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>

        {lessons.length === 0 ? (
          <div className="text-center text-gray-400 py-16">
            No lessons available in this course yet.
          </div>
        ) : (
          (() => {
            // Group lessons by week, then by day
            const weekGroups: { [week: number]: { [day: number]: Lesson[] } } = {};
            const ungroupedLessons: Lesson[] = [];
            
            lessons.forEach((lesson) => {
              if (lesson.week_number !== null && lesson.week_number !== undefined &&
                  lesson.day_number !== null && lesson.day_number !== undefined) {
                const week = lesson.week_number;
                const day = lesson.day_number;
                
                if (!weekGroups[week]) {
                  weekGroups[week] = {};
                }
                if (!weekGroups[week][day]) {
                  weekGroups[week][day] = [];
                }
                weekGroups[week][day].push(lesson);
              } else {
                ungroupedLessons.push(lesson);
              }
            });
            
            // Sort lessons within each day group by order_index
            Object.keys(weekGroups).forEach(week => {
              Object.keys(weekGroups[parseInt(week)]).forEach(day => {
                weekGroups[parseInt(week)][parseInt(day)].sort((a, b) => a.order_index - b.order_index);
              });
            });
            
            // Sort weeks and days
            const sortedWeeks = Object.keys(weekGroups)
              .map(Number)
              .sort((a, b) => a - b);

            return (
              <div className="space-y-12">
                {/* Grouped Lessons by Week/Day with proper hierarchy */}
                {sortedWeeks.map((week) => {
                  const days = Object.keys(weekGroups[week])
                    .map(Number)
                    .sort((a, b) => a - b);
                  
                  return (
                    <div key={week} className="space-y-8">
                      {/* Week Header */}
                      <div className="border-l-4 border-mambo-blue pl-4">
                        <h1 className="text-3xl font-bold text-mambo-text">
                          Week {week}
                        </h1>
                      </div>
                      
                      {/* Days within this week */}
                      <div className="space-y-8 pl-8">
                        {days.map((day) => {
                          const dayLessons = weekGroups[week][day];
                          return (
                            <div key={day} className="space-y-4">
                              {/* Day Header */}
                              <div className="flex items-center gap-3">
                                <h2 className="text-xl font-semibold text-gray-300">
                                  Day {day}
                                </h2>
                                <div className="flex-1 h-px bg-gray-800" />
                                <span className="text-sm text-gray-500">
                                  {dayLessons.length} {dayLessons.length === 1 ? 'lesson' : 'lessons'}
                                </span>
                              </div>
                              
                              {/* Lessons for this day */}
                              <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4 pl-4">
                                {dayLessons.map((lesson) => {
                                  // Get thumbnail: Use thumbnail_url if available, otherwise fallback to Mux thumbnail
                                  const thumbnailUrl = lesson.thumbnail_url
                                    ? lesson.thumbnail_url
                                    : lesson.mux_playback_id
                                    ? `https://image.mux.com/${lesson.mux_playback_id}/thumbnail.png`
                                    : null;

                                  return (
                                  <Link
                                    key={lesson.id}
                                    href={lesson.is_locked ? "#" : `/lesson/${lesson.id}`}
                                    onClick={(e) => {
                                      if (lesson.is_locked) {
                                        e.preventDefault();
                                        return;
                                      }
                                    }}
                                    className={`relative bg-mambo-panel border border-transparent rounded-xl overflow-hidden transition-all duration-300 block ${
                                      lesson.is_locked
                                        ? "border-gray-800 opacity-60 cursor-not-allowed"
                                        : "hover:border-blue-500/60 hover:shadow-2xl hover:shadow-blue-500/40 hover:scale-[1.02] cursor-pointer aspect-video min-h-[140px] group"
                                    }`}
                                  >
                                    {/* Thumbnail background - full card */}
                                    <div className="absolute inset-0 bg-black overflow-hidden">
                                      {lesson.thumbnail_url ? (
                                        <Image
                                          src={lesson.thumbnail_url}
                                          alt={lesson.title}
                                          fill
                                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                      ) : lesson.mux_playback_id ? (
                                        <Image
                                          src={`https://image.mux.com/${lesson.mux_playback_id}/thumbnail.png`}
                                          alt={lesson.title}
                                          fill
                                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                      ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900" />
                                      )}
                                      {/* Dark overlay for better text readability */}
                                      <div className="absolute inset-0 bg-black/50 group-hover:bg-black/40 transition-colors duration-300" />

                                      {/* Lock icon */}
                                      {lesson.is_locked && (
                                        <div className="absolute inset-0 flex items-center justify-center z-10">
                                          <svg
                                            className="w-8 h-8 text-gray-400"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                            />
                                          </svg>
                                        </div>
                                      )}

                                      {/* Boss battle indicator */}
                                      {lesson.is_boss_battle && (
                                        <div className="absolute top-1 left-1 z-20">
                                          <span className="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded">⚔️ Boss</span>
                                        </div>
                                      )}

                                      {/* Completed indicator */}
                                      {lesson.is_completed && (
                                        <div className="absolute top-1 right-1 z-20">
                                          <span className="bg-green-500 text-black text-xs font-bold px-2 py-0.5 rounded">✓</span>
                                        </div>
                                      )}
                                    </div>

                                    {/* Lesson info - overlaid on thumbnail */}
                                    <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
                                      <h3 className="font-bold text-sm mb-1 text-white line-clamp-2 drop-shadow-lg">{lesson.title}</h3>
                                      <p className="text-xs text-gray-200 drop-shadow-lg">
                                        {lesson.xp_value} XP
                                      </p>
                                    </div>
                                  </Link>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                {/* Ungrouped Lessons */}
                {ungroupedLessons.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl font-bold text-gray-500">Other Lessons</h2>
                      <div className="flex-1 h-px bg-gray-800" />
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                      {ungroupedLessons.map((lesson) => (
                        <Link
                          key={lesson.id}
                          href={lesson.is_locked ? "#" : `/lesson/${lesson.id}`}
                          onClick={(e) => {
                            if (lesson.is_locked) {
                              e.preventDefault();
                              return;
                            }
                          }}
                          className={`bg-mambo-panel border border-transparent rounded-xl p-6 transition-all duration-300 block ${
                            lesson.is_locked
                              ? "border-gray-800 opacity-60 cursor-not-allowed"
                              : "hover:border-blue-500/60 hover:shadow-2xl hover:shadow-blue-500/40 hover:scale-[1.02] cursor-pointer group"
                          }`}
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                                lesson.is_boss_battle
                                  ? "bg-red-600 text-white"
                                  : lesson.is_completed
                                  ? "bg-green-500 text-black"
                                  : lesson.is_locked
                                  ? "bg-gray-800 text-gray-500 border border-gray-700"
                                  : "bg-mambo-blue text-white"
                              }`}
                            >
                              {lesson.is_boss_battle ? "⚔️" : lesson.order_index}
                            </div>
                            {lesson.is_locked && (
                              <svg
                                className="w-5 h-5 text-gray-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                />
                              </svg>
                            )}
                          </div>
                          <h3 className="font-bold text-lg mb-2 text-mambo-text">{lesson.title}</h3>
                          <p className="text-sm text-gray-500 mb-4">
                            {lesson.xp_value} XP {lesson.is_boss_battle && "• Boss Battle"}
                          </p>
                          {lesson.is_completed && (
                            <div className="text-green-400 text-sm font-semibold">✓ Completed</div>
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })()
        )}

      </div>
    </div>
  );
}

