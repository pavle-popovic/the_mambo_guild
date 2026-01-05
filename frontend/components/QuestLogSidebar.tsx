"use client";

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
  const completedCount = lessons.filter((l) => l.is_completed).length;
  const progressPercentage = lessons.length > 0 ? (completedCount / lessons.length) * 100 : 0;

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

      <div className="overflow-y-auto flex-1 p-3 space-y-2">
        {(() => {
          const regularLessons = lessons.filter(l => !l.is_boss_battle);
          const bossLessons = lessons.filter(l => l.is_boss_battle);

          return (
            <>
              {regularLessons.map((lesson) => {
                const isActive = lesson.id === currentLessonId;
                const isCompleted = lesson.is_completed;
                const isLocked = lesson.is_locked;

                return (
                  <Link
                    key={lesson.id}
                    href={isLocked ? "#" : `/lesson/${lesson.id}`}
                    className={`p-3 rounded-xl flex gap-3 items-center transition relative overflow-hidden group ${
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
                    {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-mambo-blue"></div>}
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                        isCompleted
                          ? "bg-green-600 text-white"
                          : isActive
                          ? "bg-mambo-blue text-white shadow-lg shadow-blue-500/20"
                          : "border border-gray-600 text-gray-400"
                      }`}
                    >
                      {isCompleted ? (
                        <FaCheck className="text-[10px]" />
                      ) : isActive ? (
                        <FaPlay className="text-[10px]" />
                      ) : (
                        lesson.order_index
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div
                        className={`text-sm font-bold ${
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
                            <div className="text-[10px] text-mambo-blue font-bold">Now Playing</div>
                          </>
                        ) : (
                          lesson.title
                        )}
                      </div>
                      {!isActive && (
                        <div className="text-[10px] text-gray-600">
                          {lesson.duration_minutes ? `${lesson.duration_minutes} min • ` : ""}
                          {lesson.xp_value} XP
                        </div>
                      )}
                    </div>
                    {isLocked && (
                      <FaLock className="text-xs text-gray-700 shrink-0" />
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

