"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Play, BookOpen, Award, Clock, Zap, ChevronRight, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import MuxPlayer from "@mux/mux-player-react";

interface Lesson {
    id: string;
    title: string;
    xp_value: number;
    is_completed: boolean;
    is_locked: boolean;
    is_boss_battle: boolean;
    lesson_type: string;
    thumbnail_url?: string;
    duration_minutes?: number;
    order_index: number;
}

interface ModuleModalProps {
    isOpen: boolean;
    onClose: () => void;
    levelId: string;
    levelTitle: string;
    levelDescription?: string;
    lessons: Lesson[];
    completionPercentage: number;
    // New props for enhanced modal
    thumbnail_url?: string;
    mux_preview_playback_id?: string;
    total_duration?: number; // in minutes
    courseId?: string;
    onNavigateToModule?: () => void;
}

export default function ModuleModal({
    isOpen,
    onClose,
    levelId,
    levelTitle,
    levelDescription,
    lessons,
    completionPercentage,
    thumbnail_url,
    mux_preview_playback_id,
    total_duration,
    courseId,
    onNavigateToModule,
}: ModuleModalProps) {
    const router = useRouter();

    const handleLessonClick = (lessonId: string, isLocked: boolean) => {
        if (isLocked) return;
        router.push(`/lesson/${lessonId}`);
    };

    const handleStartLearning = () => {
        if (onNavigateToModule) {
            onNavigateToModule();
        } else if (lessons.length > 0) {
            // Navigate to first uncompleted lesson, or first lesson if all completed
            const sortedLessons = [...lessons].sort((a, b) => a.order_index - b.order_index);
            const nextLesson = sortedLessons.find((l) => !l.is_completed && !l.is_locked) || sortedLessons[0];
            router.push(`/lesson/${nextLesson.id}`);
        }
        onClose();
    };

    const getLessonIcon = (lessonType: string, isBoss: boolean) => {
        if (isBoss) return <Award className="w-5 h-5 text-amber-400" />;
        if (lessonType === "quiz") return <BookOpen className="w-5 h-5 text-blue-400" />;
        if (lessonType === "history") return <BookOpen className="w-5 h-5 text-purple-400" />;
        return <Play className="w-5 h-5 text-green-400" />;
    };

    // Calculate total XP for the module
    const totalXP = lessons.reduce((sum, lesson) => sum + lesson.xp_value, 0);
    const completedLessons = lessons.filter((l) => l.is_completed).length;

    // Determine action button state
    const getActionButton = () => {
        if (completionPercentage >= 100) {
            return {
                label: "Review Module",
                icon: <RotateCcw className="w-5 h-5" />,
                className: "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500",
            };
        } else if (completionPercentage > 0) {
            return {
                label: "Continue Learning",
                icon: <Play className="w-5 h-5" />,
                className: "bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500",
            };
        }
        return {
            label: "Start Module",
            icon: <ChevronRight className="w-5 h-5" />,
            className: "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500",
        };
    };

    const actionButton = getActionButton();

    // Format duration
    const formatDuration = (minutes: number) => {
        if (minutes >= 60) {
            const hours = Math.floor(minutes / 60);
            const mins = minutes % 60;
            return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
        }
        return `${minutes} min`;
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="relative bg-gradient-to-b from-gray-900/95 to-black/95 backdrop-blur-xl border border-yellow-900/30 rounded-2xl shadow-[0_0_60px_rgba(212,175,55,0.15)] max-w-2xl w-full max-h-[85vh] overflow-hidden pointer-events-auto"
                            initial={{ scale: 0.9, y: 30, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.95, y: 20, opacity: 0 }}
                            transition={{ type: "spring", damping: 20, stiffness: 300 }}
                        >
                            {/* Video Preview / Thumbnail Section */}
                            <div className="relative w-full aspect-video bg-black/50 overflow-hidden">
                                {mux_preview_playback_id ? (
                                    <MuxPlayer
                                        playbackId={mux_preview_playback_id}
                                        streamType="on-demand"
                                        autoPlay={false}
                                        muted
                                        loop
                                        className="w-full h-full object-cover"
                                        style={{ aspectRatio: "16/9" }}
                                    />
                                ) : thumbnail_url ? (
                                    <img
                                        src={thumbnail_url}
                                        alt={levelTitle}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
                                        <div className="text-center">
                                            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-yellow-900/20 border border-yellow-700/30 flex items-center justify-center">
                                                <Play className="w-8 h-8 text-yellow-500/70" />
                                            </div>
                                            <p className="text-gray-500 text-sm">No preview available</p>
                                        </div>
                                    </div>
                                )}

                                {/* Gradient overlay at bottom */}
                                <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-gray-900/95 to-transparent" />

                                {/* Close button on video */}
                                <button
                                    onClick={onClose}
                                    className="absolute top-4 right-4 p-2 bg-black/60 hover:bg-black/80 rounded-full transition backdrop-blur-sm border border-white/10"
                                >
                                    <X className="w-5 h-5 text-white" />
                                </button>
                            </div>

                            {/* Header */}
                            <div className="p-6 border-b border-yellow-900/20">
                                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-amber-400 mb-2">
                                    {levelTitle}
                                </h2>
                                {levelDescription && (
                                    <p className="text-gray-400 text-sm leading-relaxed">{levelDescription}</p>
                                )}

                                {/* Stats Row */}
                                <div className="flex items-center gap-6 mt-4">
                                    {total_duration && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <Clock className="w-4 h-4 text-yellow-500/70" />
                                            <span className="text-gray-300">{formatDuration(total_duration)}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2 text-sm">
                                        <Zap className="w-4 h-4 text-amber-500" />
                                        <span className="text-gray-300">{totalXP} XP</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <BookOpen className="w-4 h-4 text-blue-400/70" />
                                        <span className="text-gray-300">
                                            {completedLessons}/{lessons.length} lessons
                                        </span>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="mt-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-gray-500">Progress</span>
                                        <span className="text-sm text-yellow-400 font-bold">
                                            {Math.round(completionPercentage)}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-800/50 h-2.5 rounded-full overflow-hidden border border-gray-700/50">
                                        <motion.div
                                            className="bg-gradient-to-r from-yellow-600 via-amber-500 to-yellow-400 h-full rounded-full shadow-[0_0_10px_rgba(255,215,0,0.4)]"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${completionPercentage}%` }}
                                            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                                        />
                                    </div>
                                </div>

                                {/* Action Button */}
                                <motion.button
                                    onClick={handleStartLearning}
                                    className={`w-full mt-5 py-3 px-6 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all shadow-lg ${actionButton.className}`}
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                >
                                    {actionButton.icon}
                                    {actionButton.label}
                                </motion.button>
                            </div>

                            {/* Lessons List */}
                            <div className="p-5 overflow-y-auto max-h-[35vh]">
                                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                                    Lessons ({lessons.length})
                                </h3>
                                <div className="space-y-2">
                                    {lessons.map((lesson, index) => (
                                        <motion.div
                                            key={lesson.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.3 + index * 0.04 }}
                                            className={`p-3 rounded-xl border transition-all ${lesson.is_locked
                                                    ? "bg-gray-900/30 border-gray-800/50 opacity-50 cursor-not-allowed"
                                                    : lesson.is_completed
                                                        ? "bg-gradient-to-r from-green-900/20 to-emerald-900/10 border-green-700/30 hover:border-green-600/50 cursor-pointer"
                                                        : "bg-gradient-to-r from-gray-800/40 to-gray-900/40 border-yellow-900/20 hover:border-yellow-700/40 cursor-pointer hover:shadow-[0_0_20px_rgba(212,175,55,0.1)]"
                                                }`}
                                            onClick={() => handleLessonClick(lesson.id, lesson.is_locked)}
                                            whileHover={lesson.is_locked ? {} : { x: 4, scale: 1.01 }}
                                        >
                                            <div className="flex items-center gap-3">
                                                {/* Icon */}
                                                <div
                                                    className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${lesson.is_locked
                                                            ? "bg-gray-800/50"
                                                            : lesson.is_completed
                                                                ? "bg-green-500/20 border border-green-600/30"
                                                                : "bg-yellow-900/20 border border-yellow-700/30"
                                                        }`}
                                                >
                                                    {getLessonIcon(lesson.lesson_type, lesson.is_boss_battle)}
                                                </div>

                                                {/* Content */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <h4
                                                            className={`font-medium text-sm truncate ${lesson.is_locked
                                                                    ? "text-gray-600"
                                                                    : lesson.is_completed
                                                                        ? "text-green-400"
                                                                        : "text-gray-200"
                                                                }`}
                                                        >
                                                            {lesson.title}
                                                        </h4>
                                                        {lesson.is_completed && (
                                                            <span className="text-[10px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded font-medium">
                                                                ✓
                                                            </span>
                                                        )}
                                                        {lesson.is_boss_battle && (
                                                            <span className="text-[10px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded font-medium">
                                                                👑 Boss
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-3 mt-0.5">
                                                        <span className="text-xs text-gray-500">
                                                            {lesson.xp_value} XP
                                                        </span>
                                                        {lesson.duration_minutes && (
                                                            <span className="text-xs text-gray-600">
                                                                {lesson.duration_minutes} min
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Lock/Arrow indicator */}
                                                {lesson.is_locked ? (
                                                    <div className="text-gray-700 text-sm">🔒</div>
                                                ) : (
                                                    <ChevronRight className={`w-4 h-4 ${lesson.is_completed ? "text-green-500/50" : "text-yellow-600/50"}`} />
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            {/* Bottom glow accent */}
                            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-700/30 to-transparent" />
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
