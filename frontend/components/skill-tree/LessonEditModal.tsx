"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    X,
    Save,
    Video,
    BookOpen,
    Award,
    Clock,
    Zap,
    Loader2,
    Crown,
} from "lucide-react";

interface Lesson {
    id: string;
    title: string;
    description?: string;
    xp_value: number;
    duration_minutes?: number;
    lesson_type: string;
    is_boss_battle: boolean;
    mux_playback_id?: string;
    thumbnail_url?: string;
    content_json?: any;
}

interface LessonEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    lessonId: string | null;
    onSave: () => void;
}

const LESSON_TYPES = [
    { value: "video", label: "Video Lesson", icon: Video },
    { value: "quiz", label: "Quiz", icon: BookOpen },
    { value: "history", label: "History", icon: BookOpen },
];

export default function LessonEditModal({
    isOpen,
    onClose,
    lessonId,
    onSave,
}: LessonEditModalProps) {
    const [lesson, setLesson] = useState<Lesson | null>(null);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [xpValue, setXpValue] = useState(100);
    const [durationMinutes, setDurationMinutes] = useState(0);
    const [lessonType, setLessonType] = useState("video");
    const [isBossBattle, setIsBossBattle] = useState(false);
    const [muxPlaybackId, setMuxPlaybackId] = useState("");
    const [thumbnailUrl, setThumbnailUrl] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (lessonId && isOpen) {
            loadLesson();
        }
    }, [lessonId, isOpen]);

    const loadLesson = async () => {
        if (!lessonId) return;

        setIsLoading(true);
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/admin/lessons/${lessonId}`,
                {
                    credentials: "include" as RequestCredentials,
                }
            );

            if (response.ok) {
                const data = await response.json();
                setLesson(data);
                setTitle(data.title || "");
                setDescription(data.description || "");
                setXpValue(data.xp_value || 100);
                setDurationMinutes(data.duration_minutes || 0);
                setLessonType(data.lesson_type || "video");
                setIsBossBattle(data.is_boss_battle || false);
                setMuxPlaybackId(data.mux_playback_id || "");
                setThumbnailUrl(data.thumbnail_url || "");
            }
        } catch (err) {
            console.error("Error loading lesson:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!lessonId) return;

        setIsSaving(true);
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/admin/lessons/${lessonId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include" as RequestCredentials,
                    body: JSON.stringify({
                        title,
                        description,
                        xp_value: xpValue,
                        duration_minutes: durationMinutes,
                        lesson_type: lessonType,
                        is_boss_battle: isBossBattle,
                        mux_playback_id: muxPlaybackId || null,
                        thumbnail_url: thumbnailUrl || null,
                    }),
                }
            );

            if (response.ok) {
                onSave();
                onClose();
            }
        } catch (err) {
            console.error("Error saving lesson:", err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleClose = () => {
        setLesson(null);
        setTitle("");
        setDescription("");
        setXpValue(100);
        setDurationMinutes(0);
        setLessonType("video");
        setIsBossBattle(false);
        setMuxPlaybackId("");
        setThumbnailUrl("");
        onClose();
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
                        onClick={handleClose}
                    />

                    {/* Modal */}
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="bg-mambo-panel border border-gray-700 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden pointer-events-auto"
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                        >
                            {/* Header */}
                            <div className="p-6 border-b border-gray-700">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-2xl font-bold text-mambo-text">Edit Lesson</h2>
                                    <button
                                        onClick={handleClose}
                                        className="p-2 hover:bg-gray-800 rounded-lg transition"
                                    >
                                        <X className="w-5 h-5 text-gray-400" />
                                    </button>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6 overflow-y-auto max-h-[65vh]">
                                {isLoading ? (
                                    <div className="flex items-center justify-center py-12">
                                        <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {/* Title */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                                Lesson Title
                                            </label>
                                            <input
                                                type="text"
                                                value={title}
                                                onChange={(e) => setTitle(e.target.value)}
                                                className="w-full px-4 py-3 bg-mambo-dark border border-gray-700 rounded-lg text-mambo-text focus:outline-none focus:border-amber-500"
                                            />
                                        </div>

                                        {/* Description */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                                Description
                                            </label>
                                            <textarea
                                                value={description}
                                                onChange={(e) => setDescription(e.target.value)}
                                                rows={3}
                                                className="w-full px-4 py-3 bg-mambo-dark border border-gray-700 rounded-lg text-mambo-text focus:outline-none focus:border-amber-500 resize-none"
                                            />
                                        </div>

                                        {/* Lesson Type */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                                Lesson Type
                                            </label>
                                            <div className="grid grid-cols-3 gap-2">
                                                {LESSON_TYPES.map((type) => (
                                                    <button
                                                        key={type.value}
                                                        onClick={() => setLessonType(type.value)}
                                                        className={`p-3 rounded-lg border-2 transition flex flex-col items-center gap-2 ${
                                                            lessonType === type.value
                                                                ? "bg-amber-600/20 border-amber-500 text-amber-400"
                                                                : "bg-mambo-dark border-gray-700 text-gray-400 hover:border-gray-600"
                                                        }`}
                                                    >
                                                        <type.icon className="w-5 h-5" />
                                                        <span className="text-xs font-medium">
                                                            {type.label}
                                                        </span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* XP and Duration Row */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                                                    <Zap className="w-4 h-4 text-amber-500" />
                                                    XP Value
                                                </label>
                                                <input
                                                    type="number"
                                                    value={xpValue}
                                                    onChange={(e) =>
                                                        setXpValue(Math.max(0, parseInt(e.target.value) || 0))
                                                    }
                                                    min={0}
                                                    className="w-full px-4 py-3 bg-mambo-dark border border-gray-700 rounded-lg text-mambo-text focus:outline-none focus:border-amber-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                                                    <Clock className="w-4 h-4 text-blue-400" />
                                                    Duration (minutes)
                                                </label>
                                                <input
                                                    type="number"
                                                    value={durationMinutes}
                                                    onChange={(e) =>
                                                        setDurationMinutes(
                                                            Math.max(0, parseInt(e.target.value) || 0)
                                                        )
                                                    }
                                                    min={0}
                                                    className="w-full px-4 py-3 bg-mambo-dark border border-gray-700 rounded-lg text-mambo-text focus:outline-none focus:border-amber-500"
                                                />
                                            </div>
                                        </div>

                                        {/* Boss Battle Toggle */}
                                        <div className="flex items-center justify-between p-4 bg-mambo-dark border border-gray-700 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <Crown
                                                    className={`w-5 h-5 ${
                                                        isBossBattle ? "text-amber-400" : "text-gray-500"
                                                    }`}
                                                />
                                                <div>
                                                    <div className="text-sm font-medium text-mambo-text">
                                                        Boss Battle
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        Mark this as a boss/challenge lesson
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setIsBossBattle(!isBossBattle)}
                                                className={`relative w-12 h-6 rounded-full transition ${
                                                    isBossBattle ? "bg-amber-600" : "bg-gray-700"
                                                }`}
                                            >
                                                <div
                                                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                                                        isBossBattle
                                                            ? "translate-x-7"
                                                            : "translate-x-1"
                                                    }`}
                                                />
                                            </button>
                                        </div>

                                        {/* Video Settings (for video type) */}
                                        {lessonType === "video" && (
                                            <div className="space-y-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                                                <h4 className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                                    <Video className="w-4 h-4" />
                                                    Video Settings
                                                </h4>
                                                <div>
                                                    <label className="block text-xs text-gray-500 mb-1">
                                                        Mux Playback ID
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={muxPlaybackId}
                                                        onChange={(e) => setMuxPlaybackId(e.target.value)}
                                                        placeholder="Enter Mux playback ID..."
                                                        className="w-full px-3 py-2 bg-mambo-dark border border-gray-700 rounded-lg text-sm text-mambo-text focus:outline-none focus:border-amber-500"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-gray-500 mb-1">
                                                        Thumbnail URL
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={thumbnailUrl}
                                                        onChange={(e) => setThumbnailUrl(e.target.value)}
                                                        placeholder="https://..."
                                                        className="w-full px-3 py-2 bg-mambo-dark border border-gray-700 rounded-lg text-sm text-mambo-text focus:outline-none focus:border-amber-500"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="p-6 border-t border-gray-700 flex justify-end gap-3">
                                <button
                                    onClick={handleClose}
                                    className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving || !title.trim() || isLoading}
                                    className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {isSaving ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4" />
                                            Save Lesson
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
