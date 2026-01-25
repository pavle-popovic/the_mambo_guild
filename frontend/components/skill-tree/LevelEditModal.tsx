"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    X,
    Save,
    Upload,
    Trash2,
    Plus,
    BookOpen,
    Image as ImageIcon,
    Loader2,
    Video,
    Play,
    Check,
    VideoOff,
} from "lucide-react";
import { useMuxVideoUpload } from "@/hooks/useMuxVideoUpload";

interface Lesson {
    id: string;
    title: string;
    xp_value: number;
    lesson_type: string;
    is_boss_battle: boolean;
    order_index: number;
    mux_playback_id?: string | null;
}

interface Level {
    id: string;
    title: string;
    description?: string;
    thumbnail_url?: string;
    mux_preview_playback_id?: string | null;
    mux_preview_asset_id?: string | null;
}

interface LevelEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    level: Level | null;
    onSave: () => void;
    onEditLesson?: (lesson: Lesson) => void;
}

export default function LevelEditModal({
    isOpen,
    onClose,
    level,
    onSave,
    onEditLesson,
}: LevelEditModalProps) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [thumbnailUrl, setThumbnailUrl] = useState("");
    const [previewPlaybackId, setPreviewPlaybackId] = useState<string | null>(null);
    const [previewAssetId, setPreviewAssetId] = useState<string | null>(null);
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoadingLessons, setIsLoadingLessons] = useState(false);
    const [activeTab, setActiveTab] = useState<"details" | "lessons">("details");
    const [isPreviewHovered, setIsPreviewHovered] = useState(false);

    // Mux video upload hook for preview video
    const {
        uploadStatus,
        uploadProgress,
        handleFileSelect: handleMuxFileSelect,
        handleDelete: handleMuxDelete,
        resetError: resetUpload,
    } = useMuxVideoUpload({
        entityId: level?.id,
        entityType: "level",
        currentPlaybackId: previewPlaybackId,
        onUploadComplete: (playbackId, assetId) => {
            setPreviewPlaybackId(playbackId);
            setPreviewAssetId(assetId);
        },
        onDelete: async () => {
            // Clear from level in database
            if (!level?.id) return;
            try {
                await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/admin/levels/${level.id}`,
                    {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                        body: JSON.stringify({
                            mux_preview_playback_id: null,
                            mux_preview_asset_id: null,
                        }),
                    }
                );
            } catch (err) {
                console.error("Error clearing preview video from level:", err);
            }
        },
    });

    useEffect(() => {
        if (level) {
            setTitle(level.title);
            setDescription(level.description || "");
            setThumbnailUrl(level.thumbnail_url || "");
            setPreviewPlaybackId(level.mux_preview_playback_id || null);
            setPreviewAssetId(level.mux_preview_asset_id || null);
            loadLessons();
        }
    }, [level]);

    const loadLessons = async () => {
        if (!level) return;

        setIsLoadingLessons(true);
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/admin/levels/${level.id}/lessons`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );

            if (response.ok) {
                const data = await response.json();
                setLessons(data.sort((a: Lesson, b: Lesson) => a.order_index - b.order_index));
            }
        } catch (err) {
            console.error("Error loading lessons:", err);
        } finally {
            setIsLoadingLessons(false);
        }
    };

    const handleSave = async () => {
        if (!level) return;

        setIsSaving(true);
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/admin/levels/${level.id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                    body: JSON.stringify({
                        title,
                        description,
                        thumbnail_url: thumbnailUrl || null,
                        mux_preview_playback_id: previewPlaybackId,
                        mux_preview_asset_id: previewAssetId,
                    }),
                }
            );

            if (response.ok) {
                onSave();
                onClose();
            }
        } catch (err) {
            console.error("Error saving level:", err);
        } finally {
            setIsSaving(false);
        }
    };

    const handlePreviewVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        handleMuxFileSelect(e);
    };

    const handleDeletePreviewVideo = async () => {
        // Use the hook's delete function which handles Mux deletion + DB cleanup
        await handleMuxDelete();
        // Clear local state after successful deletion
        setPreviewPlaybackId(null);
        setPreviewAssetId(null);
    };

    // Generate preview URLs
    const previewGifUrl = previewPlaybackId
        ? `https://image.mux.com/${previewPlaybackId}/animated.gif?start=0&end=3&width=400&fps=15`
        : null;
    const previewThumbnailUrl = previewPlaybackId
        ? `https://image.mux.com/${previewPlaybackId}/thumbnail.jpg?width=400&time=1`
        : null;
    const previewDisplayUrl = isPreviewHovered && previewGifUrl ? previewGifUrl : previewThumbnailUrl;

    const handleAddLesson = async () => {
        if (!level) return;

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/admin/levels/${level.id}/lessons`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                    body: JSON.stringify({
                        title: "New Lesson",
                        lesson_type: "video",
                        xp_value: 100,
                        order_index: lessons.length,
                    }),
                }
            );

            if (response.ok) {
                loadLessons();
            }
        } catch (err) {
            console.error("Error creating lesson:", err);
        }
    };

    const handleDeleteLesson = async (lessonId: string) => {
        if (!confirm("Are you sure you want to delete this lesson?")) return;

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/admin/lessons/${lessonId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );

            if (response.ok) {
                setLessons((prev) => prev.filter((l) => l.id !== lessonId));
            }
        } catch (err) {
            console.error("Error deleting lesson:", err);
        }
    };

    if (!level) return null;

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
                            className="bg-mambo-panel border border-gray-700 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden pointer-events-auto"
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                        >
                            {/* Header */}
                            <div className="p-6 border-b border-gray-700">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-2xl font-bold text-mambo-text">Edit Level</h2>
                                    <button
                                        onClick={onClose}
                                        className="p-2 hover:bg-gray-800 rounded-lg transition"
                                    >
                                        <X className="w-5 h-5 text-gray-400" />
                                    </button>
                                </div>

                                {/* Tabs */}
                                <div className="flex gap-2 mt-4">
                                    <button
                                        onClick={() => setActiveTab("details")}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === "details"
                                                ? "bg-amber-600 text-white"
                                                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                                            }`}
                                    >
                                        Details
                                    </button>
                                    <button
                                        onClick={() => setActiveTab("lessons")}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${activeTab === "lessons"
                                                ? "bg-amber-600 text-white"
                                                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                                            }`}
                                    >
                                        <BookOpen className="w-4 h-4" />
                                        Lessons ({lessons.length})
                                    </button>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6 overflow-y-auto max-h-[60vh]">
                                {activeTab === "details" ? (
                                    <div className="space-y-6">
                                        {/* Title */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                                Level Title
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
                                                rows={4}
                                                className="w-full px-4 py-3 bg-mambo-dark border border-gray-700 rounded-lg text-mambo-text focus:outline-none focus:border-amber-500 resize-none"
                                            />
                                        </div>

                                        {/* Thumbnail URL */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                                Thumbnail URL
                                            </label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={thumbnailUrl}
                                                    onChange={(e) => setThumbnailUrl(e.target.value)}
                                                    placeholder="https://..."
                                                    className="flex-1 px-4 py-3 bg-mambo-dark border border-gray-700 rounded-lg text-mambo-text focus:outline-none focus:border-amber-500"
                                                />
                                            </div>
                                            {thumbnailUrl && (
                                                <div className="mt-3 rounded-lg overflow-hidden border border-gray-700">
                                                    <img
                                                        src={thumbnailUrl}
                                                        alt="Thumbnail preview"
                                                        className="w-full h-32 object-cover"
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).style.display = "none";
                                                        }}
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        {/* Preview Video (for hover animation) */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                                Preview Video (3s GIF on hover)
                                            </label>
                                            <p className="text-xs text-gray-500 mb-3">
                                                Upload a short video clip. First 3 seconds will play as animated GIF when users hover over this node in the skill tree.
                                            </p>

                                            {/* Deleting state */}
                                            {uploadStatus === "deleting" && (
                                                <div className="p-4 bg-red-900/20 border border-red-700/50 rounded-lg">
                                                    <div className="flex items-center gap-3">
                                                        <Loader2 className="w-5 h-5 text-red-400 animate-spin" />
                                                        <span className="text-sm text-red-300">Deleting video from Mux...</span>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Show preview when video exists and not deleting */}
                                            {previewPlaybackId && uploadStatus !== "deleting" ? (
                                                <div className="space-y-3">
                                                    {/* Preview with hover animation */}
                                                    <div
                                                        className="relative rounded-lg overflow-hidden border border-green-700/50 cursor-pointer"
                                                        onMouseEnter={() => setIsPreviewHovered(true)}
                                                        onMouseLeave={() => setIsPreviewHovered(false)}
                                                    >
                                                        <img
                                                            src={previewDisplayUrl || ""}
                                                            alt="Preview video"
                                                            className="w-full h-32 object-cover"
                                                        />
                                                        <div className="absolute top-2 left-2 bg-green-900/80 rounded-full px-2 py-1 text-[10px] text-green-400 flex items-center gap-1">
                                                            <Check className="w-3 h-3" />
                                                            Uploaded
                                                        </div>
                                                        <div className="absolute top-2 right-2 bg-black/60 rounded-full px-2 py-1 text-[10px] text-white/80 flex items-center gap-1">
                                                            <Play className="w-3 h-3" />
                                                            {isPreviewHovered ? "Playing" : "Hover to preview"}
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={handleDeletePreviewVideo}
                                                        disabled={uploadStatus === "deleting"}
                                                        className="w-full px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                        Remove Preview Video
                                                    </button>
                                                </div>
                                            ) : uploadStatus === "uploading" || uploadStatus === "processing" ? (
                                                <div className="p-4 bg-mambo-dark border border-gray-700 rounded-lg">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />
                                                        <span className="text-sm text-gray-300">
                                                            {uploadStatus === "uploading"
                                                                ? `Uploading... ${Math.round(uploadProgress)}%`
                                                                : "Processing video..."}
                                                        </span>
                                                    </div>
                                                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-amber-500 transition-all duration-300"
                                                            style={{ width: `${uploadStatus === "processing" ? 100 : uploadProgress}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            ) : uploadStatus !== "deleting" ? (
                                                <label className="block w-full p-4 border-2 border-dashed border-gray-700 hover:border-amber-500/50 rounded-lg cursor-pointer transition text-center">
                                                    <input
                                                        type="file"
                                                        accept="video/*"
                                                        onChange={handlePreviewVideoUpload}
                                                        className="hidden"
                                                    />
                                                    <Video className="w-8 h-8 mx-auto mb-2 text-gray-500" />
                                                    <span className="text-sm text-gray-400">
                                                        Click to upload preview video
                                                    </span>
                                                    <span className="block text-xs text-gray-600 mt-1">
                                                        MP4, MOV, WebM (max 50MB recommended)
                                                    </span>
                                                </label>
                                            ) : null}
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        {/* Add Lesson Button */}
                                        <button
                                            onClick={handleAddLesson}
                                            className="w-full mb-4 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition flex items-center justify-center gap-2"
                                        >
                                            <Plus className="w-4 h-4" />
                                            Add New Lesson
                                        </button>

                                        {/* Lessons List */}
                                        {isLoadingLessons ? (
                                            <div className="flex items-center justify-center py-8">
                                                <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
                                            </div>
                                        ) : lessons.length === 0 ? (
                                            <div className="text-center py-8 text-gray-500">
                                                No lessons yet. Add your first lesson above.
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                {lessons.map((lesson, index) => {
                                                    const hasVideo = !!lesson.mux_playback_id;
                                                    const isVideoLesson = lesson.lesson_type === "video";
                                                    return (
                                                        <div
                                                            key={lesson.id}
                                                            className={`flex items-center gap-3 p-3 bg-mambo-dark border rounded-lg hover:border-gray-600 transition ${
                                                                isVideoLesson && hasVideo ? 'border-green-700/50' : 'border-gray-700'
                                                            }`}
                                                        >
                                                            <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center text-xs text-gray-400 font-medium">
                                                                {index + 1}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="text-sm font-medium text-mambo-text truncate flex items-center gap-2">
                                                                    {lesson.title}
                                                                    {/* Video status indicator */}
                                                                    {isVideoLesson && (
                                                                        hasVideo ? (
                                                                            <span className="flex items-center gap-1 text-[10px] bg-green-900/50 text-green-400 px-1.5 py-0.5 rounded-full">
                                                                                <Check className="w-3 h-3" />
                                                                                Video
                                                                            </span>
                                                                        ) : (
                                                                            <span className="flex items-center gap-1 text-[10px] bg-gray-800 text-gray-500 px-1.5 py-0.5 rounded-full">
                                                                                <VideoOff className="w-3 h-3" />
                                                                                No Video
                                                                            </span>
                                                                        )
                                                                    )}
                                                                </div>
                                                                <div className="text-xs text-gray-500 flex items-center gap-2">
                                                                    <span className={`uppercase ${
                                                                        lesson.lesson_type === 'video' ? 'text-green-500' :
                                                                        lesson.lesson_type === 'quiz' ? 'text-blue-400' :
                                                                        'text-amber-400'
                                                                    }`}>{lesson.lesson_type}</span>
                                                                    <span>•</span>
                                                                    <span>{lesson.xp_value} XP</span>
                                                                    {lesson.is_boss_battle && (
                                                                        <>
                                                                            <span>•</span>
                                                                            <span className="text-amber-500">Boss</span>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="flex gap-1">
                                                                {onEditLesson && (
                                                                    <button
                                                                        onClick={() => onEditLesson(lesson)}
                                                                        className="p-2 bg-amber-600 hover:bg-amber-700 rounded-lg text-white transition"
                                                                        title="Edit Lesson"
                                                                    >
                                                                        <BookOpen className="w-4 h-4" />
                                                                    </button>
                                                                )}
                                                                <button
                                                                    onClick={() => handleDeleteLesson(lesson.id)}
                                                                    className="p-2 bg-red-600 hover:bg-red-700 rounded-lg text-white transition"
                                                                    title="Delete Lesson"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            {activeTab === "details" && (
                                <div className="p-6 border-t border-gray-700 flex justify-end gap-3">
                                    <button
                                        onClick={onClose}
                                        className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        disabled={isSaving || !title.trim()}
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
                                                Save Changes
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
