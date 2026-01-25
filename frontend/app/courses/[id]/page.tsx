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

      const token = localStorage.getItem("auth_token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/courses/worlds/${courseId}/skill-tree`,
        {
          headers: token
            ? { Authorization: `Bearer ${token}` }
            : {},
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

      {/* Course Progress Widget (Top Right) */}
      <div className="absolute top-24 right-8 z-30 w-80 bg-black/80 backdrop-blur-xl border border-yellow-900/30 rounded-2xl p-6 shadow-2xl pointer-events-auto">
        <h2 className="text-2xl font-serif font-bold text-white mb-4 text-center">{skillTree.title}</h2>

        <div className="flex justify-between items-baseline mb-2">
          <span className="text-xs font-bold text-gray-500 tracking-widest uppercase">Course Progress</span>
          <span className="text-xl font-bold text-mambo-gold">
            {Math.round(stats.progress)}%
          </span>
        </div>

        <div className="h-3 bg-gray-900/50 rounded-full overflow-hidden border border-white/10 mb-2">
          <div
            className="bg-gradient-to-r from-mambo-blue to-purple-600 h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_12px_rgba(139,92,246,0.6),0_0_20px_rgba(59,130,246,0.4)]"
            style={{
              width: `${Math.round(stats.progress)}%`
            }}
          />
        </div>

        <div className="text-xs text-gray-500 font-medium">
          {stats.completed}/{stats.total} lessons completed
        </div>
      </div>
    </div>
  );
}
