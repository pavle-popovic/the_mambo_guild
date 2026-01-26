"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api";
import CommunitySidebar from "@/components/community/CommunitySidebar";
import CommunityWidgets from "@/components/community/CommunityWidgets";
import StageVideoCard from "@/components/community/StageVideoCard";
import LabQuestionRow from "@/components/community/LabQuestionRow";
import ActivityTicker from "@/components/community/ActivityTicker";
import PreviewCTABar from "@/components/community/PreviewCTABar";
import CreatePostModal from "@/components/CreatePostModal";
import PostDetailModal from "@/components/PostDetailModal";

interface Post {
    id: string;
    user: {
        id: string;
        first_name: string;
        last_name: string;
        avatar_url: string | null;
        is_pro: boolean;
        level: number;
    };
    post_type: "stage" | "lab";
    title: string;
    body: string | null;
    mux_playback_id: string | null;
    video_duration_seconds: number | null;
    tags: string[];
    is_wip: boolean;
    feedback_type: "coach" | "hype";
    is_solved: boolean;
    reaction_count: number;
    reply_count: number;
    user_reaction: string | null;
    has_instructor_comment?: boolean;
    created_at: string;
    updated_at: string;
}

type ViewMode = "stage" | "lab" | "saved" | "my_posts";

export default function CommunityPage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const [viewMode, setViewMode] = useState<ViewMode>("stage");
    const [posts, setPosts] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filters
    const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
    const [selectedTopics, setSelectedTopics] = useState<string[]>([]);

    // Modals
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
    const [isPostDetailOpen, setIsPostDetailOpen] = useState(false);

    // Check if user is a paying member (has tier above rookie/free)
    const userTier = user?.tier?.toLowerCase() || "rookie";
    const isPaidMember = !!user && userTier !== "rookie";
    const isPreviewMode = !isPaidMember;

    // Load posts - load for everyone including preview mode
    const loadPosts = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const feed = await apiClient.getCommunityFeed({
                post_type: (viewMode === "saved" || viewMode === "my_posts") ? undefined : viewMode,
                tag: selectedTopics.length === 1 ? selectedTopics[0] : undefined,
                forceRefresh: true,
            });
            setPosts(feed as Post[]);
        } catch (err: any) {
            console.error("Failed to load community feed:", err);
            // In preview mode, show sample content on error
            if (isPreviewMode) {
                setPosts([]);
            } else {
                setError(err.message || "Failed to load posts");
            }
        } finally {
            setIsLoading(false);
        }
    }, [viewMode, selectedTopics, isPreviewMode]);

    useEffect(() => {
        if (!authLoading) {
            loadPosts();
        }
    }, [authLoading, loadPosts]);

    // Listen for video ready events
    useEffect(() => {
        const handleVideoReady = () => loadPosts();
        window.addEventListener("post-video-ready", handleVideoReady);
        return () => window.removeEventListener("post-video-ready", handleVideoReady);
    }, [loadPosts]);

    const handlePostCreated = () => {
        loadPosts();
    };

    const handlePostClick = (postId: string) => {
        if (isPreviewMode) {
            router.push("/pricing");
            return;
        }
        setSelectedPostId(postId);
        setIsPostDetailOpen(true);
    };

    const handleLockedClick = () => {
        router.push("/pricing");
    };

    const handlePostDeleted = (postId: string) => {
        setPosts((prev) => prev.filter((p) => p.id !== postId));
    };

    const handleReaction = async (postId: string, type: "fire" | "ruler" | "clap") => {
        try {
            await apiClient.addReaction(postId, type);
            loadPosts();
        } catch (err) {
            console.error("Reaction failed:", err);
        }
    };

    // Filter posts by level
    const filteredPosts = posts.filter((post) => {
        if (selectedLevels.length > 0) {
            const hasMatchingLevel = post.tags.some((tag) =>
                selectedLevels.some((level) => tag.toLowerCase().includes(level.toLowerCase()))
            );
            if (!hasMatchingLevel) return false;
        }
        if (selectedTopics.length > 0) {
            const hasMatchingTopic = post.tags.some((tag) => selectedTopics.includes(tag));
            if (!hasMatchingTopic) return false;
        }
        if (viewMode === "my_posts") {
            return post.user.id === user?.id;
        }
        return true;
    });

    if (authLoading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="w-10 h-10 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-transparent">
            <NavBar user={user || undefined} />

            {/* Main Content - 3 Column Grid */}
            <div className="max-w-7xl mx-auto px-4 pb-32 pt-24 relative">
                <div className="grid grid-cols-12 gap-6">
                    {/* Left Sidebar */}
                    <div className="col-span-12 lg:col-span-2">
                        <CommunitySidebar
                            viewMode={viewMode}
                            onViewModeChange={setViewMode}
                            selectedLevels={selectedLevels}
                            onLevelsChange={setSelectedLevels}
                            selectedTopics={selectedTopics}
                            onTopicsChange={setSelectedTopics}
                            posts={posts}
                        />
                    </div>

                    {/* Main Feed */}
                    <div className="col-span-12 lg:col-span-7 relative">
                        {isLoading ? (
                            <div className="flex justify-center py-16">
                                <div className="w-10 h-10 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
                            </div>
                        ) : error && !isPreviewMode ? (
                            <div className="text-center py-16">
                                <p className="text-red-400 mb-4">{error}</p>
                                <button
                                    onClick={loadPosts}
                                    className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 rounded-lg transition"
                                >
                                    Retry
                                </button>
                            </div>
                        ) : isPreviewMode ? (
                            /* Preview Mode CTA - Centered in Feed */
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <div
                                    className="relative overflow-hidden rounded-2xl border-2 border-amber-400/50 p-8 max-w-lg"
                                    style={{
                                        background: "linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(20,20,20,0.9) 100%)",
                                        backdropFilter: "blur(20px)",
                                        boxShadow: "0 0 40px rgba(251, 191, 36, 0.15), 0 20px 40px rgba(0, 0, 0, 0.5)",
                                    }}
                                >
                                    {/* Decorative corners */}
                                    <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-amber-400/60 rounded-tl-xl" />
                                    <div className="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 border-amber-400/60 rounded-tr-xl" />
                                    <div className="absolute bottom-0 left-0 w-8 h-8 border-l-2 border-b-2 border-amber-400/60 rounded-bl-xl" />
                                    <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-amber-400/60 rounded-br-xl" />

                                    <h2 className="text-2xl font-serif font-bold text-white mb-3">
                                        Join The <span className="text-amber-400">Mambo Guild</span>
                                    </h2>
                                    <p className="text-white/70 mb-6">
                                        Connect with dancers worldwide. Share videos, ask questions, and level up together.
                                    </p>
                                    <motion.a
                                        href="/pricing"
                                        className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 text-black font-bold rounded-lg shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 transition-shadow"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <span className="font-serif tracking-wide">Become a Member</span>
                                    </motion.a>
                                </div>
                            </div>
                        ) : filteredPosts.length === 0 ? (
                            <div className="text-center py-16">
                                <p className="text-white/50 mb-4">
                                    {viewMode === "stage"
                                        ? "No videos yet. Be the first to share your progress!"
                                        : "No questions yet. Ask the community for help!"}
                                </p>
                                <button
                                    onClick={() => setIsCreateModalOpen(true)}
                                    className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold rounded-lg transition shadow-lg shadow-amber-500/20"
                                >
                                    Create Post
                                </button>
                            </div>
                        ) : (
                            <>
                                {viewMode === "stage" ? (
                                    /* Stage: Masonry Grid */
                                    <div className="relative">
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                            <AnimatePresence mode="popLayout">
                                                {filteredPosts.map((post, index) => (
                                                    <motion.div
                                                        key={post.id}
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, scale: 0.9 }}
                                                        transition={{ delay: index * 0.05 }}
                                                    >
                                                        <StageVideoCard
                                                            post={post}
                                                            onClick={() => handlePostClick(post.id)}
                                                            isLocked={isPreviewMode}
                                                            onLockedClick={handleLockedClick}
                                                        />
                                                    </motion.div>
                                                ))}
                                            </AnimatePresence>
                                        </div>

                                        {/* Fade gradient for preview mode - starts after 2nd row (6 items for 3 cols) */}
                                        {isPreviewMode && filteredPosts.length > 3 && (
                                            <div
                                                className="absolute bottom-0 left-0 right-0 h-[60%] pointer-events-none"
                                                style={{
                                                    background:
                                                        "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.5) 30%, rgba(0,0,0,0.95) 70%, black 100%)",
                                                }}
                                            />
                                        )}
                                    </div>
                                ) : (
                                    /* Lab: Condensed List */
                                    <div className="relative">
                                        <div className="space-y-3">
                                            <AnimatePresence mode="popLayout">
                                                {filteredPosts.map((post, index) => (
                                                    <motion.div
                                                        key={post.id}
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        exit={{ opacity: 0, x: 20 }}
                                                        transition={{ delay: index * 0.03 }}
                                                    >
                                                        <LabQuestionRow
                                                            post={post}
                                                            onClick={() => handlePostClick(post.id)}
                                                            isLocked={isPreviewMode}
                                                            onLockedClick={handleLockedClick}
                                                        />
                                                    </motion.div>
                                                ))}
                                            </AnimatePresence>
                                        </div>

                                        {/* Fade gradient for preview mode - starts after 3rd item */}
                                        {isPreviewMode && filteredPosts.length > 3 && (
                                            <div
                                                className="absolute bottom-0 left-0 right-0 h-[50%] pointer-events-none"
                                                style={{
                                                    background:
                                                        "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.5) 30%, rgba(0,0,0,0.95) 70%, black 100%)",
                                                }}
                                            />
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Right Widgets */}
                    <div className="col-span-12 lg:col-span-3">
                        <CommunityWidgets posts={posts} />
                    </div>
                </div>
            </div>

            {/* Floating Action Button - only for members */}
            {!isPreviewMode && (
                <motion.button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-full shadow-[0_0_30px_rgba(219,39,119,0.5)] flex items-center justify-center z-50 border border-white/20"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <Plus size={28} strokeWidth={3} />
                </motion.button>
            )}

            {/* Create Post Modal */}
            <CreatePostModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                mode={viewMode === "lab" ? "lab" : "stage"}
                onPostCreated={handlePostCreated}
            />

            {/* Post Detail Modal */}
            {selectedPostId && !isPreviewMode && (
                <PostDetailModal
                    isOpen={isPostDetailOpen}
                    onClose={() => {
                        setIsPostDetailOpen(false);
                        setSelectedPostId(null);
                    }}
                    postId={selectedPostId}
                    currentUserId={user?.id}
                    onPostDeleted={handlePostDeleted}
                    onReaction={handleReaction}
                    onRefresh={loadPosts}
                />
            )}

            <Footer />
        </div>
    );
}
