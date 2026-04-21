"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, X, Tv, FlaskConical, ChevronDown, Bookmark } from "lucide-react";
import { useRouter } from "next/navigation";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api";
import CommunitySidebar from "@/components/community/CommunitySidebar";
import CommunityWidgets from "@/components/community/CommunityWidgets";
import StageVideoCard from "@/components/community/StageVideoCard";
import LabQuestionRow from "@/components/community/LabQuestionRow";
import PreviewCTABar from "@/components/community/PreviewCTABar";
import CreatePostModal from "@/components/CreatePostModal";
import PostDetailModal from "@/components/PostDetailModal";
import { useTranslations } from "@/i18n/useTranslations";

interface Post {
    id: string;
    user: {
        id: string;
        first_name: string;
        last_name: string;
        avatar_url: string | null;
        is_pro: boolean;
        is_guild_master?: boolean;
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
    video_type?: "motw" | "original" | "guild" | null;
    is_solved: boolean;
    reaction_count: number;
    reply_count: number;
    user_reaction: string | null;
    is_saved?: boolean;
    has_instructor_comment?: boolean;
    created_at: string;
    updated_at: string;
}

type ViewMode = "stage" | "lab" | "saved" | "my_posts";

export default function CommunityPage() {
    const t = useTranslations("community");
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const [viewMode, setViewMode] = useState<ViewMode>("stage");
    const [posts, setPosts] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filters
    const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
    const [selectedTopics, setSelectedTopics] = useState<string[]>([]);

    // Mobile search & dropdowns
    const [searchQuery, setSearchQuery] = useState("");
    const [levelDropdownOpen, setLevelDropdownOpen] = useState(false);
    const levelDropdownRef = useRef<HTMLDivElement>(null);
    const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [isMobile, setIsMobile] = useState(false);

    // Modals
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
    const [isPostDetailOpen, setIsPostDetailOpen] = useState(false);

    // Check if user is a paying member (has tier above rookie/free)
    const userTier = user?.tier?.toLowerCase() || "rookie";
    const isPaidMember = !!user && userTier !== "rookie";
    const isPreviewMode = !isPaidMember;

    // Mobile detection
    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 1024);
        check();
        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, []);

    // Deep-link: /community?post=<id> opens the post detail modal.
    // Used by notification bell click-throughs for reply/reaction notifications.
    // Read from window.location to avoid useSearchParams' Suspense requirement
    // in Next 14 (which otherwise breaks static generation at build time).
    useEffect(() => {
        if (typeof window === "undefined") return;
        const params = new URLSearchParams(window.location.search);
        const postId = params.get("post");
        if (postId && !isPreviewMode) {
            setSelectedPostId(postId);
            setIsPostDetailOpen(true);
        }
    }, [isPreviewMode]);

    // Click-outside for mobile dropdowns
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (levelDropdownRef.current && !levelDropdownRef.current.contains(e.target as Node)) setLevelDropdownOpen(false);
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    // Debounced search
    const handleSearch = useCallback((query: string) => {
        setSearchQuery(query);
        if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
        if (!query.trim()) return; // will use normal loadPosts via useEffect
        searchTimerRef.current = setTimeout(async () => {
            setIsLoading(true);
            try {
                const results = await apiClient.searchPosts(query, {
                    post_type: viewMode === "lab" ? "lab" : viewMode === "stage" ? "stage" : undefined,
                    tags: selectedTopics.length > 0 ? selectedTopics : undefined,
                }) as Post[];
                setPosts(results);
            } catch (err) {
                console.error("Search failed:", err);
            } finally {
                setIsLoading(false);
            }
        }, 300);
    }, [viewMode, selectedTopics]);

    // When search is cleared, reload normal feed
    useEffect(() => {
        if (!searchQuery.trim() && !authLoading) {
            loadPosts();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchQuery]);

    // Level filter constants for mobile dropdown
    const levelOptions = [
        { value: "", label: t("allLevels") },
        { value: "beginner", label: t("beginner") },
        { value: "intermediate", label: t("intermediate") },
        { value: "advanced", label: t("advanced") },
        { value: "master", label: t("master") },
    ];

    // Load posts - load for everyone including preview mode
    const loadPosts = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            let feed: Post[];
            if (viewMode === "saved") {
                feed = (await apiClient.getSavedPosts()) as Post[];
            } else {
                feed = (await apiClient.getCommunityFeed({
                    post_type: viewMode === "my_posts" ? undefined : viewMode,
                    tag: selectedTopics.length === 1 ? selectedTopics[0] : undefined,
                    tags: selectedTopics.length > 1 ? selectedTopics : undefined,
                    forceRefresh: true,
                })) as Post[];
            }
            setPosts(feed);
        } catch (err: any) {
            console.error("Failed to load community feed:", err);
            if (!isPreviewMode) {
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

    const handleReaction = async (postId: string) => {
        try {
            await apiClient.addReaction(postId);
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
        <div className="min-h-[100dvh] bg-transparent pb-[env(safe-area-inset-bottom)]">
            <NavBar user={user || undefined} />

            {/* Main Content - 3 Column Grid */}
            <div className="max-w-7xl mx-auto px-4 pb-[calc(env(safe-area-inset-bottom)+5rem)] sm:pb-32 pt-20 sm:pt-24 relative">
                <div className="grid grid-cols-12 gap-4 lg:gap-6">
                    {/* Left Sidebar — hidden on mobile, replaced by mobile header */}
                    <div className="hidden lg:block lg:col-span-2 lg:order-1">
                        <CommunitySidebar
                            viewMode={viewMode}
                            onViewModeChange={setViewMode}
                            selectedLevels={selectedLevels}
                            onLevelsChange={setSelectedLevels}
                            posts={
                                viewMode === "my_posts"
                                    ? posts.filter((p) => p.user.id === user?.id)
                                    : posts
                            }
                        />
                    </div>

                    {/* Mobile Header — search, toggle, filters */}
                    <div className="lg:hidden col-span-12 order-1 sticky top-16 z-40 bg-black/80 backdrop-blur-xl -mx-4 px-4 pb-3 pt-2 border-b border-white/10">
                        {/* Search Bar */}
                        <div className="relative mb-2.5">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => handleSearch(e.target.value)}
                                placeholder={t("searchPlaceholder")}
                                className="w-full bg-white/[0.04] border border-white/10 rounded-xl pl-9 pr-8 py-2.5 text-[13px] text-white placeholder-gray-500 focus:outline-none focus:border-white/20 transition-all"
                            />
                            {searchQuery && (
                                <button onClick={() => handleSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                                    <X className="w-3.5 h-3.5 text-gray-400 hover:text-white transition" />
                                </button>
                            )}
                        </div>

                        {/* Toggle + Filters Row */}
                        <div className="flex items-center gap-2">
                            {/* Stage/Lab Toggle */}
                            <div className="flex bg-white/[0.04] rounded-full p-0.5 border border-white/10 flex-shrink-0">
                                <button
                                    onClick={() => { setViewMode("stage"); setSearchQuery(""); }}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all ${
                                        viewMode === "stage"
                                            ? "bg-white/10 text-mambo-gold shadow-[0_0_12px_rgba(252,226,5,0.15)]"
                                            : "text-white/50"
                                    }`}
                                >
                                    <Tv size={12} />
                                    {t("stageTab")}
                                </button>
                                <button
                                    onClick={() => { setViewMode("lab"); setSearchQuery(""); }}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all ${
                                        viewMode === "lab"
                                            ? "bg-white/10 text-mambo-gold shadow-[0_0_12px_rgba(252,226,5,0.15)]"
                                            : "text-white/50"
                                    }`}
                                >
                                    <FlaskConical size={12} />
                                    {t("labTab")}
                                </button>
                                <button
                                    onClick={() => { setViewMode("my_posts"); setSearchQuery(""); }}
                                    className={`portrait:flex landscape:hidden items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all ${
                                        viewMode === "my_posts"
                                            ? "bg-white/10 text-mambo-gold shadow-[0_0_12px_rgba(252,226,5,0.15)]"
                                            : "text-white/50"
                                    }`}
                                >
                                    <Bookmark size={12} />
                                    {t("myPostsTab")}
                                </button>
                            </div>

                            {/* Level Dropdown */}
                            <div className="relative flex-1" ref={levelDropdownRef}>
                                <button
                                    onClick={() => setLevelDropdownOpen(!levelDropdownOpen)}
                                    className={`w-full border rounded-xl pl-3 pt-5 pb-1.5 pr-7 text-left focus:outline-none transition-all relative ${
                                        selectedLevels.length > 0
                                            ? "bg-amber-500/10 border-amber-500/40"
                                            : "bg-white/[0.04] border-white/10"
                                    } ${levelDropdownOpen ? "border-amber-400/60 bg-white/[0.08]" : ""}`}
                                >
                                    <span className="absolute left-3 top-1.5 text-[9px] uppercase tracking-widest text-gray-500 font-semibold">{t("levelLabel")}</span>
                                    <span className={`text-[11px] font-bold ${selectedLevels.length > 0 ? "text-amber-300" : "text-white"}`}>
                                        {selectedLevels.length > 0
                                            ? levelOptions.find((o) => o.value === selectedLevels[0])?.label || t("allLevels")
                                            : t("allLevels")}
                                    </span>
                                    <ChevronDown className={`absolute right-2 bottom-2.5 w-3 h-3 text-gray-400 transition-transform ${levelDropdownOpen ? "rotate-180" : ""}`} />
                                </button>
                                {levelDropdownOpen && (
                                    <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-gray-900/90 backdrop-blur-xl border border-white/15 rounded-xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
                                        {levelOptions.map((opt) => (
                                            <button
                                                key={opt.value}
                                                onClick={() => {
                                                    setSelectedLevels(opt.value ? [opt.value] : []);
                                                    setLevelDropdownOpen(false);
                                                }}
                                                className={`w-full px-3 py-2.5 text-left text-[12px] font-semibold transition-all ${
                                                    (opt.value === "" && selectedLevels.length === 0) || selectedLevels.includes(opt.value)
                                                        ? "bg-amber-500/20 text-amber-300"
                                                        : "text-gray-300 hover:bg-white/[0.08] hover:text-white active:bg-white/[0.12]"
                                                }`}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                        </div>
                    </div>

                    {/* Main Feed */}
                    <div className="col-span-12 lg:col-span-7 relative order-2 lg:order-2">
                        {/* Desktop Search Bar */}
                        <div className="hidden lg:block mb-4">
                            <div className="relative">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    placeholder={t("searchPlaceholder")}
                                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl pl-10 pr-10 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-400/40 focus:bg-white/[0.06] transition-all"
                                />
                                {searchQuery && (
                                    <button onClick={() => handleSearch("")} className="absolute right-3.5 top-1/2 -translate-y-1/2">
                                        <X className="w-4 h-4 text-gray-400 hover:text-white transition" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Active tag chip — set by trending-tag click */}
                        {selectedTopics.length > 0 && (
                            <div className="mb-4 flex flex-wrap items-center gap-2">
                                <span className="text-[11px] uppercase tracking-widest text-white/40 font-semibold">{t("filteringBy")}</span>
                                {selectedTopics.map((tag) => (
                                    <button
                                        key={tag}
                                        onClick={() => setSelectedTopics((prev) => prev.filter((t) => t !== tag))}
                                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-400/40 text-cyan-200 text-xs font-bold hover:bg-cyan-500/25 transition"
                                    >
                                        #{tag}
                                        <X className="w-3 h-3" />
                                    </button>
                                ))}
                            </div>
                        )}

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
                                    {t("retry")}
                                </button>
                            </div>
                        ) : filteredPosts.length === 0 && !isPreviewMode ? (
                            <div className="text-center py-16">
                                <p className="text-white/50 mb-4">
                                    {viewMode === "stage"
                                        ? t("noStageVideos")
                                        : t("noLabQuestions")}
                                </p>
                                <button
                                    onClick={() => setIsCreateModalOpen(true)}
                                    className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold rounded-lg transition shadow-lg shadow-amber-500/20"
                                >
                                    {t("createPost")}
                                </button>
                            </div>
                        ) : (
                            <>
                                {viewMode === "stage" ? (
                                    /* Stage: Instagram-style tight grid on mobile, card grid on desktop */
                                    <div className="relative">
                                        <div className="grid grid-cols-3 gap-0.5 lg:gap-4">
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
                                                            variant={isMobile ? "grid-compact" : "default"}
                                                        />
                                                    </motion.div>
                                                ))}
                                            </AnimatePresence>
                                        </div>

                                        {/* Fade gradient for preview mode - starts after 2nd row (6 items for 3 cols) */}
                                        {isPreviewMode && filteredPosts.length > 0 && (
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

                                        {isPreviewMode && filteredPosts.length > 0 && (
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

                                {/* Preview Mode CTA — appears below the post preview */}
                                {isPreviewMode && (
                                    <div className="flex flex-col items-center justify-center py-6 sm:py-12 text-center">
                                        <div
                                            className="relative overflow-hidden rounded-2xl border-2 border-amber-400/50 p-5 sm:p-8 max-w-lg"
                                            style={{
                                                background: "linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(20,20,20,0.9) 100%)",
                                                backdropFilter: "blur(20px)",
                                                boxShadow: "0 0 40px rgba(251, 191, 36, 0.15), 0 20px 40px rgba(0, 0, 0, 0.5)",
                                            }}
                                        >
                                            <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-amber-400/60 rounded-tl-xl" />
                                            <div className="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 border-amber-400/60 rounded-tr-xl" />
                                            <div className="absolute bottom-0 left-0 w-8 h-8 border-l-2 border-b-2 border-amber-400/60 rounded-bl-xl" />
                                            <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-amber-400/60 rounded-br-xl" />

                                            <h2 className="text-2xl font-serif font-bold text-white mb-3">
                                                {t("joinPre")} <span className="text-amber-400">{t("joinAccent")}</span>
                                            </h2>
                                            <p className="text-white/70 mb-6">
                                                {t("joinBody")}
                                            </p>
                                            <motion.a
                                                href="/pricing"
                                                className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 text-black font-bold rounded-lg shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 transition-shadow"
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.98 }}
                                            >
                                                <span className="font-serif tracking-wide">{t("becomeMember")}</span>
                                            </motion.a>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Right Widgets — hidden on mobile */}
                    <div className="hidden lg:block lg:col-span-3 lg:order-3">
                        <CommunityWidgets
                            posts={posts}
                            activeTopic={selectedTopics[0]}
                            onTagClick={(tag) => {
                                // Preserve original casing — backend Post.tags.any() is case-sensitive
                                const normalized = tag.replace(/^#/, "");
                                if (searchQuery) handleSearch("");
                                setSelectedTopics((prev) =>
                                    prev.length === 1 && prev[0] === normalized ? [] : [normalized]
                                );
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Floating Action Button - only for members */}
            {!isPreviewMode && (
                <motion.button
                    onClick={() => setIsCreateModalOpen(true)}
                    style={{ bottom: "max(1.5rem, calc(env(safe-area-inset-bottom) + 1rem))" }}
                    className="fixed right-4 sm:right-8 w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-full shadow-[0_0_30px_rgba(219,39,119,0.5)] flex items-center justify-center z-50 border border-white/20"
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
