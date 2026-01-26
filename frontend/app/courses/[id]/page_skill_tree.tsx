"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import NavBar from "@/components/NavBar";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api";
import ConstellationGraph from "@/components/skill-tree/ConstellationGraph";
import ModuleModal from "@/components/skill-tree/ModuleModal";

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

interface Lesson {
    id: string;
    title: string;
    xp_value: number;
    is_completed: boolean;
    is_locked: boolean;
    is_boss_battle: boolean;
    lesson_type: string;
    thumbnail_url?: string;
    order_index: number;
}

export default function CourseDetailPage() {
    const params = useParams();
    const { user } = useAuth();
    const courseId = params.id as string;

    const [skillTree, setSkillTree] = useState<SkillTreeData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Modal state
    const [selectedLevelId, setSelectedLevelId] = useState<string | null>(null);
    const [levelLessons, setLevelLessons] = useState<Lesson[]>([]);
    const [loadingLessons, setLoadingLessons] = useState(false);

    useEffect(() => {
        loadSkillTree();
    }, [courseId, user]);

    const loadSkillTree = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/courses/worlds/${courseId}/skill-tree`,
                {
                    headers: user
                        ? { Authorization: `Bearer ${localStorage.getItem("token")}` }
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

    const handleNodeClick = async (levelId: string) => {
        setSelectedLevelId(levelId);
        setLoadingLessons(true);

        try {
            // Fetch lessons for this level
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/courses/levels/${levelId}/lessons`,
                {
                    headers: user
                        ? { Authorization: `Bearer ${localStorage.getItem("token")}` }
                        : {},
                }
            );

            if (!response.ok) {
                throw new Error("Failed to load lessons");
            }

            const lessons = await response.json();
            setLevelLessons(lessons);
        } catch (err) {
            console.error("Failed to load lessons:", err);
            setLevelLessons([]);
        } finally {
            setLoadingLessons(false);
        }
    };

    const handleCloseModal = () => {
        setSelectedLevelId(null);
        setLevelLessons([]);
    };

    if (loading) {
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

    const selectedLevel = skillTree.levels.find((l) => l.id === selectedLevelId);

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
                    <h1 className="text-4xl font-bold mb-4 text-mambo-text">{skillTree.title}</h1>
                    {skillTree.description && (
                        <p className="text-gray-400 max-w-2xl">{skillTree.description}</p>
                    )}
                </div>

                {/* Constellation Graph */}
                <ConstellationGraph
                    levels={skillTree.levels}
                    edges={skillTree.edges}
                    onNodeClick={handleNodeClick}
                    courseId={courseId}
                />

                {/* Course Progress Widget (Top Right) */}
                <div className="absolute top-24 right-8 z-30 w-80 bg-black/80 backdrop-blur-xl border border-yellow-900/30 rounded-2xl p-6 shadow-2xl">
                    <h2 className="text-2xl font-serif font-bold text-white mb-4 text-center">{skillTree.title}</h2>

                    <div className="flex justify-between items-baseline mb-2">
                        <span className="text-xs font-bold text-gray-500 tracking-widest uppercase">Course Progress</span>
                        <span
                            className="text-xl font-bold"
                            style={{
                                background: 'linear-gradient(to right, #60a5fa, #c084fc, #e879f9)', // blue-400, purple-400, pink-400
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                                color: 'transparent',
                                display: 'inline-block'
                            }}
                        >
                            {Math.round(
                                skillTree.levels.reduce((acc, level) => acc + (level.completion_percentage * level.lesson_count), 0) /
                                Math.max(skillTree.levels.reduce((acc, level) => acc + level.lesson_count, 0), 1)
                            )}%
                        </span>
                    </div>

                    <div className="h-3 bg-gray-900/50 rounded-full overflow-hidden border border-white/10 mb-2">
                        <div
                            className="h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(168,85,247,0.6)] relative"
                            style={{
                                width: `${Math.round(
                                    skillTree.levels.reduce((acc, level) => acc + (level.completion_percentage * level.lesson_count), 0) /
                                    Math.max(skillTree.levels.reduce((acc, level) => acc + level.lesson_count, 0), 1)
                                )}%`,
                                background: 'linear-gradient(to right, #3b82f6, #a855f7, #ec4899)' // blue-500, purple-500, pink-500
                            }}
                        >
                            <div className="absolute inset-0 bg-white/20 animate-pulse" />
                        </div>
                    </div>

                    <div className="text-xs text-gray-500 font-medium">
                        {Math.round(
                            (skillTree.levels.reduce((acc, level) => acc + (level.completion_percentage * level.lesson_count), 0) /
                                Math.max(skillTree.levels.reduce((acc, level) => acc + level.lesson_count, 0), 1) / 100) *
                            skillTree.levels.reduce((acc, level) => acc + level.lesson_count, 0)
                        )}/{skillTree.levels.reduce((acc, level) => acc + level.lesson_count, 0)} lessons completed
                    </div>
                </div>

                {/* Module Modal */}
                {selectedLevel && (
                    <ModuleModal
                        isOpen={!!selectedLevelId}
                        onClose={handleCloseModal}
                        levelId={selectedLevelId!}
                        levelTitle={selectedLevel.title}
                        levelDescription={selectedLevel.description}
                        lessons={levelLessons}
                        completionPercentage={selectedLevel.completion_percentage}
                    />
                )}
            </div>
        </div>
    );
}
