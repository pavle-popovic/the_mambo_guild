"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import NavBar from "@/components/NavBar";
import { useAuth } from "@/contexts/AuthContext";
import ConstellationGraph from "@/components/skill-tree/ConstellationGraph";
import { useTranslations } from "@/i18n/useTranslations";
import { useLocale } from "@/i18n/client";

interface Level {
  id: string;
  title: string;
  description?: string;
  x_position: number;
  y_position: number;
  is_unlocked: boolean;
  completion_percentage: number;
  lesson_count: number;
  thumbnail_url?: string;
}

interface Edge {
  id: string;
  from_level_id: string;
  to_level_id: string;
}

interface SkillTreeData {
  id: string;
  title: string;
  description?: string;
  difficulty: string;
  is_free: boolean;
  is_locked: boolean;
  levels: Level[];
  edges: Edge[];
}

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const courseId = params.id as string;

  const [skillTree, setSkillTree] = useState<SkillTreeData | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState("");
  const tCommon = useTranslations('common');
  const tCourses = useTranslations('courses');
  const locale = useLocale();

  // Load skill tree on mount. Only depends on courseId + locale — NOT on user.
  // When user auth resolves, a second fetch updates progress silently.
  const hasFetchedForUser = useRef(false);
  useEffect(() => {
    async function load() {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL ?? ""}/api/courses/worlds/${courseId}/skill-tree?locale=${locale}`,
          { credentials: "include" as RequestCredentials }
        );
        if (!response.ok) throw new Error("Failed to load skill tree");
        const data = await response.json();
        setSkillTree(data);
      } catch (err: any) {
        console.error("Failed to load skill tree:", err);
        setError(err.message || "Failed to load skill tree");
      } finally {
        setInitialLoading(false);
      }
    }
    load();
  }, [courseId, locale]);

  // Silent re-fetch when user changes (to get progress data)
  useEffect(() => {
    if (!user?.id || !skillTree) return;
    if (hasFetchedForUser.current) return;
    hasFetchedForUser.current = true;
    fetch(
      `${process.env.NEXT_PUBLIC_API_URL ?? ""}/api/courses/worlds/${courseId}/skill-tree?locale=${locale}`,
      { credentials: "include" as RequestCredentials }
    )
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setSkillTree(data); })
      .catch(() => {});
  }, [user?.id, skillTree, courseId, locale]);

  // Calculate overall course progress and stats
  const stats = useMemo(() => {
    if (!skillTree || skillTree.levels.length === 0) return { progress: 0, completed: 0, total: 0 };

    const totalLessons = skillTree.levels.reduce((acc, level) => acc + level.lesson_count, 0);
    // Weighted completion: sum(level_completion * level_lesson_count)
    const weightedSum = skillTree.levels.reduce((acc, level) => acc + (level.completion_percentage * level.lesson_count), 0);

    const progress = totalLessons > 0 ? weightedSum / totalLessons : 0;
    const completedLessons = Math.round(weightedSum / 100);

    return { progress, completed: completedLessons, total: totalLessons };
  }, [skillTree]);

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-mambo-dark flex items-center justify-center">
        <div className="text-gray-400">{tCommon('loading')}</div>
      </div>
    );
  }

  if (error || !skillTree) {
    return (
      <div className="min-h-screen bg-mambo-dark">
        <NavBar user={user ? { ...user, avatar_url: user.avatar_url || undefined } : undefined} />
        <div className="max-w-7xl mx-auto px-8 py-16 pt-28">
          <div className="bg-red-900/20 border border-red-600/30 rounded-xl p-8 text-center">
            <p className="text-red-400 mb-6 text-lg">{error || "Failed to load course"}</p>
            <Link
              href="/courses"
              className="inline-block text-gray-400 hover:text-mambo-text transition"
            >
              {`← ${tCourses('title')}`}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      <NavBar user={user ? { ...user, avatar_url: user.avatar_url || undefined } : undefined} />

      {/* Full Screen Constellation Graph */}
      <div className="absolute inset-0 z-0" style={{ width: '100vw', height: '100vh' }}>
        <ConstellationGraph
          levels={skillTree.levels}
          edges={skillTree.edges}
          courseId={courseId}
          courseTitle={skillTree.title}
          isCourseLocked={skillTree.is_locked}
        />
      </div>

      {/* Top bar — back button + progress widget in one slim row */}
      <div className="absolute top-14 sm:top-16 left-0 right-0 z-30 pointer-events-none">
        <div className="flex items-center justify-between px-3 sm:px-6 py-1">
          {/* Back link */}
          <Link
            href="/courses"
            className="text-gray-400 hover:text-mambo-text transition pointer-events-auto bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full border border-gray-800 text-sm"
          >
            {`← ${tCourses('title')}`}
          </Link>

          {/* Course Progress Widget — compact inline */}
          <div className="pointer-events-auto bg-black/70 backdrop-blur-md border border-yellow-900/20 rounded-xl p-2 sm:p-3 shadow-xl max-w-[55%] sm:max-w-64 xl:max-w-md 2xl:max-w-lg">
            <h2 className="text-xs sm:text-sm font-serif font-bold text-white mb-1 break-words">{skillTree.title}</h2>

            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 sm:h-2 bg-gray-900/50 rounded-full overflow-hidden border border-white/10">
                <div
                  className="bg-gradient-to-r from-mambo-blue to-purple-600 h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(139,92,246,0.5)]"
                  style={{ width: `${Math.round(stats.progress)}%` }}
                />
              </div>
              <span className="text-xs font-bold text-mambo-gold whitespace-nowrap">
                {Math.round(stats.progress)}%
              </span>
            </div>

            <div className="text-[10px] text-gray-500 mt-0.5">
              {stats.completed}/{stats.total} lessons
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
