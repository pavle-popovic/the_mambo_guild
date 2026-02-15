"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import NavBar from "@/components/NavBar";
import { useAuth } from "@/contexts/AuthContext";
import ConstellationGraph from "@/components/skill-tree/ConstellationGraph";

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
  levels: Level[];
  edges: Edge[];
}

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const courseId = params.id as string;

  const [skillTree, setSkillTree] = useState<SkillTreeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Wait for auth to complete before loading skill tree
    if (authLoading) return;
    loadSkillTree();
  }, [courseId, user, authLoading]);

  const loadSkillTree = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/courses/worlds/${courseId}/skill-tree`,
        {
          credentials: "include" as RequestCredentials,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to load skill tree");
      }

      const data = await response.json();
      setSkillTree(data);
    } catch (err: any) {
      console.error("Failed to load skill tree:", err);
      setError(err.message || "Failed to load skill tree");
    } finally {
      setLoading(false);
    }
  };

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

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-mambo-dark flex items-center justify-center">
        <div className="text-gray-400">Loading skill tree...</div>
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
              ← Back to Courses
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
        />
      </div>

      {/* Overlays */}
      <div className="relative z-10 pointer-events-none">
        <div className="max-w-7xl mx-auto px-8 pt-28">
          <Link
            href="/courses"
            className="text-gray-400 hover:text-mambo-text transition mb-6 inline-block pointer-events-auto bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full border border-gray-800"
          >
            ← Back to Courses
          </Link>
        </div>
      </div>

      {/* Course Progress Widget (Top Right) - Compact */}
      <div className="absolute top-20 right-4 z-30 w-52 bg-black/70 backdrop-blur-md border border-yellow-900/20 rounded-xl p-3 shadow-xl pointer-events-auto">
        <h2 className="text-sm font-serif font-bold text-white mb-2 truncate">{skillTree.title}</h2>

        <div className="flex justify-between items-baseline mb-1">
          <span className="text-[10px] font-bold text-gray-500 tracking-wider uppercase">Progress</span>
          <span className="text-sm font-bold text-mambo-gold">
            {Math.round(stats.progress)}%
          </span>
        </div>

        <div className="h-2 bg-gray-900/50 rounded-full overflow-hidden border border-white/10 mb-1">
          <div
            className="bg-gradient-to-r from-mambo-blue to-purple-600 h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(139,92,246,0.5)]"
            style={{
              width: `${Math.round(stats.progress)}%`
            }}
          />
        </div>

        <div className="text-[10px] text-gray-500">
          {stats.completed}/{stats.total} lessons
        </div>
      </div>
    </div>
  );
}
