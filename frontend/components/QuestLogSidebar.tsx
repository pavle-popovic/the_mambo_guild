"use client";

import { useMemo } from "react";
import { FaLock, FaCheck, FaPlay, FaSkull } from "react-icons/fa";
import Link from "next/link";

interface Lesson {
  id: string;
  title: string;
  xp_value: number;
  is_completed: boolean;
  is_locked: boolean;
  is_boss_battle: boolean;
  order_index: number;
  week_number?: number | null;
  day_number?: number | null;
  duration_minutes?: number | null;
}

interface QuestLogSidebarProps {
  currentLessonId: string;
  lessons: Lesson[];
  worldTitle: string;
  worldProgress: number;
}

export default function QuestLogSidebar({
  currentLessonId,
  lessons,
  worldTitle,
  worldProgress,
}: QuestLogSidebarProps) {
  // Memoize completed count calculation
  const { completedCount, progressPercentage } = useMemo(() => {
    const completed = lessons.filter((l) => l.is_completed).length;
    const progress = lessons.length > 0 ? (completed / lessons.length) * 100 : 0;
    return { completedCount: completed, progressPercentage: progress };
  }, [lessons]);

  // Memoize sorted lessons - only recalculate when lessons array changes
  const sortedLessons = useMemo(() => {
    return [...lessons].sort((a, b) => {
      const weekA = a.week_number ?? 0;
      const weekB = b.week_number ?? 0;
      if (weekA !== weekB) return weekA - weekB;
      
      const dayA = a.day_number ?? 0;
      const dayB = b.day_number ?? 0;
      if (dayA !== dayB) return dayA - dayB;
      
      return a.order_index - b.order_index;
    });
  }, [lessons]);

  // Memoize grouping logic - only recalculate when sortedLessons changes
  const { weekGroups, ungroupedLessons, sortedWeeks } = useMemo(() => {
    const groups: { [week: number]: { [day: number]: Lesson[] } } = {};
    const ungrouped: Lesson[] = [];
    
    sortedLessons.forEach((lesson) => {
      if (lesson.week_number !== null && lesson.week_number !== undefined &&
          lesson.day_number !== null && lesson.day_number !== undefined) {
        const week = lesson.week_number;
        const day = lesson.day_number;
        
        if (!groups[week]) {
          groups[week] = {};
        }
        if (!groups[week][day]) {
          groups[week][day] = [];
        }
        groups[week][day].push(lesson);
      } else {
        ungrouped.push(lesson);
      }
    });

    const weeks = Object.keys(groups)
      .map(Number)
      .sort((a, b) => a - b);
    
    return { weekGroups: groups, ungroupedLessons: ungrouped, sortedWeeks: weeks };
  }, [sortedLessons]);

  return (
    <aside className="w-80 bg-mambo-panel border-l border-gray-800 flex-none hidden lg:flex flex-col z-10 shadow-2xl">
      <div className="p-6 border-b border-gray-800 bg-black/20">
        <h3 className="font-bold text-gray-500 text-[10px] uppercase tracking-wider mb-2">
          Current World
        </h3>
        <div className="font-serif font-bold text-xl text-white mb-4">{worldTitle}</div>
        
        <div className="flex justify-between text-xs mb-1">
          <span className="text-gray-400">Progress</span>
          <span className="text-mambo-gold font-bold">{Math.round(progressPercentage)}%</span>
        </div>
        <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-mambo-gold h-full shadow-[0_0_10px_rgba(212,175,55,0.5)] transition-all"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      <div className="overflow-y-auto flex-1 p-3 space-y-4">
        {(() => {
          const regularLessonsByWeek = sortedWeeks.map(week => {
            const days = Object.keys(weekGroups[week])
              .map(Number)
              .sort((a, b) => a - b);
            
            return { week, days: days.map(day => ({ day, lessons: weekGroups[week][day].filter(l => !l.is_boss_battle) })) };
          });

          const bossLessons = sortedLessons.filter(l => l.is_boss_battle);

          return (
            <>
              {/* Grouped lessons by Week/Day */}
              {regularLessonsByWeek.map(({ week, days }) => (
                <div key={week} className="space-y-3">
                  {/* Week Header */}
                  <div className="border-l-2 border-mambo-blue/50 pl-2">
                    <h4 className="text-xs font-bold text-mambo-blue uppercase tracking-wider">
                      Week {week}
                    </h4>
                  </div>
                  
                  {/* Days within this week */}
                  {days.map(({ day, lessons: dayLessons }) => (
                    <div key={day} className="pl-4 space-y-2">
                      {/* Day Header */}
                      <div className="flex items-center gap-2 mb-1">
                        <h5 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                          Day {day}
                        </h5>
                        <div className="flex-1 h-px bg-gray-800" />
                      </div>
                      
                      {/* Lessons for this day - already sorted by order_index from backend */}
                      {dayLessons.sort((a, b) => a.order_index - b.order_index).map((lesson) => {
                        const isActive = lesson.id === currentLessonId;
                        const isCompleted = lesson.is_completed;
                        const isLocked = lesson.is_locked;

                        return (
                          <Link
                            key={lesson.id}
                            href={isLocked ? "#" : `/lesson/${lesson.id}`}
                            className={`p-2.5 rounded-lg flex gap-2.5 items-center transition relative overflow-hidden group ${
                              isActive
                                ? "bg-mambo-blue/10 border border-mambo-blue/40"
                                : isLocked
                                ? "opacity-80 cursor-not-allowed"
                                : "hover:bg-white/5 cursor-pointer"
                            }`}
                            onClick={(e) => {
                              if (isLocked) {
                                e.preventDefault();
                              }
                            }}
                          >
                            {isActive && <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-mambo-blue"></div>}
                            <div
                              className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                                isCompleted
                                  ? "bg-green-600 text-white"
                                  : isActive
                                  ? "bg-mambo-blue text-white shadow-lg shadow-blue-500/20"
                                  : "border border-gray-600 text-gray-400"
                              }`}
                            >
                              {isCompleted ? (
                                <FaCheck className="text-[9px]" />
                              ) : isActive ? (
                                <FaPlay className="text-[9px]" />
                              ) : (
                                lesson.order_index
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div
                                className={`text-xs font-bold ${
                                  isActive
                                    ? "text-white"
                                    : isLocked
                                    ? "text-gray-400 group-hover:text-white transition"
                                    : "text-gray-400 group-hover:text-white transition"
                                }`}
                              >
                                {isActive ? (
                                  <>
                                    {lesson.title}
                                    <div className="text-[9px] text-mambo-blue font-bold">Now Playing</div>
                                  </>
                                ) : (
                                  lesson.title
                                )}
                              </div>
                              {!isActive && (
                                <div className="text-[9px] text-gray-600">
                                  {lesson.duration_minutes ? `${lesson.duration_minutes} min • ` : ""}
                                  {lesson.xp_value} XP
                                </div>
                              )}
                            </div>
                            {isLocked && (
                              <FaLock className="text-[10px] text-gray-700 shrink-0" />
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  ))}
                </div>
              ))}
              
              {/* Ungrouped lessons (no week/day) */}
              {ungroupedLessons.filter(l => !l.is_boss_battle).map((lesson) => {
                const isActive = lesson.id === currentLessonId;
                const isCompleted = lesson.is_completed;
                const isLocked = lesson.is_locked;

                return (
                  <Link
                    key={lesson.id}
                    href={isLocked ? "#" : `/lesson/${lesson.id}`}
                    className={`p-2.5 rounded-lg flex gap-2.5 items-center transition relative overflow-hidden group ${
                      isActive
                        ? "bg-mambo-blue/10 border border-mambo-blue/40"
                        : isLocked
                        ? "opacity-80 cursor-not-allowed"
                        : "hover:bg-white/5 cursor-pointer"
                    }`}
                    onClick={(e) => {
                      if (isLocked) {
                        e.preventDefault();
                      }
                    }}
                  >
                    {isActive && <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-mambo-blue"></div>}
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                        isCompleted
                          ? "bg-green-600 text-white"
                          : isActive
                          ? "bg-mambo-blue text-white shadow-lg shadow-blue-500/20"
                          : "border border-gray-600 text-gray-400"
                      }`}
                    >
                      {isCompleted ? (
                        <FaCheck className="text-[9px]" />
                      ) : isActive ? (
                        <FaPlay className="text-[9px]" />
                      ) : (
                        lesson.order_index
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div
                        className={`text-xs font-bold ${
                          isActive
                            ? "text-white"
                            : isLocked
                            ? "text-gray-400 group-hover:text-white transition"
                            : "text-gray-400 group-hover:text-white transition"
                        }`}
                      >
                        {isActive ? (
                          <>
                            {lesson.title}
                            <div className="text-[9px] text-mambo-blue font-bold">Now Playing</div>
                          </>
                        ) : (
                          lesson.title
                        )}
                      </div>
                      {!isActive && (
                        <div className="text-[9px] text-gray-600">
                          {lesson.duration_minutes ? `${lesson.duration_minutes} min • ` : ""}
                          {lesson.xp_value} XP
                        </div>
                      )}
                    </div>
                    {isLocked && (
                      <FaLock className="text-[10px] text-gray-700 shrink-0" />
                    )}
                  </Link>
                );
              })}

              {bossLessons.length > 0 && (
                <>
                  {bossLessons.map((lesson) => {
                    const isActive = lesson.id === currentLessonId;
                    const isLocked = lesson.is_locked;

                    return (
                      <Link
                        key={lesson.id}
                        href={isLocked ? "#" : `/lesson/${lesson.id}`}
                        className={`mt-6 p-4 border rounded-xl flex gap-3 items-center transition ${
                          isLocked
                            ? "border-red-900/30 bg-red-900/5 opacity-50 grayscale hover:grayscale-0 cursor-not-allowed"
                            : isActive
                            ? "border-red-900/50 bg-red-900/10"
                            : "border-red-900/30 bg-red-900/5 hover:bg-red-900/10 cursor-pointer"
                        }`}
                        onClick={(e) => {
                          if (isLocked) {
                            e.preventDefault();
                          }
                        }}
                      >
                        <div className="w-8 h-8 rounded-full bg-red-900/50 flex items-center justify-center text-xs text-red-200 border border-red-500/30">
                          <FaSkull className="text-xs" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-bold text-red-200">{lesson.title}</div>
                          <div className="text-[10px] text-red-400">
                            {isLocked ? "Locked • " : ""}
                            {lesson.duration_minutes ? `${lesson.duration_minutes} min • ` : ""}
                            {lesson.xp_value} XP
                          </div>
                        </div>
                        {isLocked && <FaLock className="text-xs text-gray-700 shrink-0" />}
                      </Link>
                    );
                  })}
                </>
              )}
            </>
          );
        })()}
      </div>
    </aside>
  );
}

