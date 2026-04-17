"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Trophy, TrendingUp, Users, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api";

interface Post {
    id: string;
    user: {
        id: string;
        first_name: string;
        last_name: string;
        avatar_url: string | null;
        is_pro: boolean;
    };
    tags: string[];
    reaction_count: number;
    reply_count: number;
    created_at: string;
}

interface LeaderboardUser {
    id: string;
    username?: string | null;
    first_name: string;
    avatar_url: string | null;
    score: number;
    rank: number;
}

interface CommunityWidgetsProps {
    posts?: Post[];
    onTagClick?: (tag: string) => void;
    activeTopic?: string;
}

const rankStyles = {
    1: "border-amber-400 bg-gradient-to-r from-amber-400/20 to-yellow-400/10",
    2: "border-gray-300 bg-gradient-to-r from-gray-300/20 to-gray-400/10",
    3: "border-amber-600 bg-gradient-to-r from-amber-600/20 to-orange-400/10",
};

const rankLabels = {
    1: "🥇",
    2: "🥈",
    3: "🥉",
};

type Period = "weekly" | "monthly" | "all_time";
type Category = "overall" | "helpful" | "creative" | "active";

const PERIOD_LABELS: Record<Period, string> = {
    weekly: "This Week",
    monthly: "This Month",
    all_time: "All Time",
};

const CATEGORY_LABELS: Record<Category, string> = {
    overall: "Overall",
    helpful: "Helpful",
    creative: "Creative",
    active: "Active",
};

export default function CommunityWidgets({ posts = [], onTagClick, activeTopic }: CommunityWidgetsProps) {
    const [memberCount, setMemberCount] = useState(0);
    const [activeNow, setActiveNow] = useState(0);
    const [apiLeaderboard, setApiLeaderboard] = useState<LeaderboardUser[]>([]);
    const [hallOfFame, setHallOfFame] = useState<LeaderboardUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [period, setPeriod] = useState<Period>("all_time");
    const [category, setCategory] = useState<Category>("overall");
    const [myRank, setMyRank] = useState<{ rank: number | null; score: number }>({ rank: null, score: 0 });

    // Fetch stats and leaderboard
    useEffect(() => {
        const fetchStats = async () => {
            setIsLoading(true);
            try {
                const data = await apiClient.getCommunityStats(period, category);
                setMemberCount(data.member_count || 0);
                setActiveNow(data.active_now || 0);
                if (data.leaderboard && data.leaderboard.length > 0) {
                    setApiLeaderboard(data.leaderboard);
                } else {
                    setApiLeaderboard([]);
                }
                if ((data as any).hall_of_fame) {
                    setHallOfFame((data as any).hall_of_fame);
                }
            } catch (err) {
                console.log("Using fallback stats due to error", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchStats();
    }, [period, category]);

    // Fetch personal rank
    useEffect(() => {
        const fetchRank = async () => {
            try {
                const data = await apiClient.getMyLeaderboardRank(period, category);
                setMyRank(data);
            } catch {}
        };
        fetchRank();
    }, [period, category]);

    // Add slight variance to active users for "live" feel
    useEffect(() => {
        if (activeNow === 0) return;
        const interval = setInterval(() => {
            setActiveNow((prev) => {
                const variance = Math.floor(Math.random() * 3) - 1; // -1 to +1
                const newCount = prev + variance;
                return Math.max(1, newCount);
            });
        }, 10000);
        return () => clearInterval(interval);
    }, [activeNow]);

    // Calculate trending tags from posts
    const trendingTags = useMemo<{ tag: string; count: number }[]>(() => {
        const tagCounts: Record<string, number> = {};

        posts.forEach((post) => {
            post.tags.forEach((tag) => {
                const normalizedTag = `#${tag.replace(/^#/, "")}`;
                tagCounts[normalizedTag] = (tagCounts[normalizedTag] || 0) + 1;
            });
        });

        return Object.entries(tagCounts)
            .map(([tag, count]) => ({ tag, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 8);
    }, [posts]);

    // Calculate weekly stats
    const weeklyStats = useMemo(() => {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const recentPosts = posts.filter((p) => new Date(p.created_at) >= oneWeekAgo);
        const videosShared = recentPosts.filter((p) => p.tags.length > 0).length;
        const questionsSolved = recentPosts.filter((p) => p.reply_count > 0).length;

        return {
            videosShared: videosShared || posts.length || 0,
            questionsSolved: questionsSolved || Math.floor(posts.length * 0.3) || 0,
        };
    }, [posts]);

    const fallbackTags = [
        { tag: "#On2Timing", count: 12 },
        { tag: "#Shines", count: 10 },
        { tag: "#SpinDrills", count: 8 },
        { tag: "#SalsaVienna", count: 7 },
        { tag: "#Partnerwork", count: 6 },
        { tag: "#Musicality", count: 5 },
        { tag: "#Footwork", count: 4 },
    ];

    const displayLeaderboard = apiLeaderboard;
    const displayTags = trendingTags.length > 0 ? trendingTags : fallbackTags;

    return (
        <div className="sticky top-28 h-[calc(100vh-8rem)] bg-[#121212]/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex flex-col gap-6 shadow-2xl relative overflow-hidden">
            {/* Leaderboard */}
            <div className="flex-1 flex flex-col min-h-0">
                <div className="pb-3 border-b border-white/10 mb-2">
                    <div className="flex items-center gap-2 mb-3">
                        <Crown size={20} className="text-[#FCE205]" />
                        <h3 className="font-serif font-bold text-white tracking-wide">High Rollers</h3>
                    </div>

                    {/* Period Toggle */}
                    <div className="flex gap-1 mb-2">
                        {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
                            <button
                                key={p}
                                onClick={() => setPeriod(p)}
                                className={cn(
                                    "px-2 py-1 rounded-md text-[10px] font-bold transition-all",
                                    period === p
                                        ? "bg-[#D4AF37]/20 text-[#FCE205] border border-[#D4AF37]/40"
                                        : "text-white/40 hover:text-white/60 hover:bg-white/5"
                                )}
                            >
                                {PERIOD_LABELS[p]}
                            </button>
                        ))}
                    </div>

                    {/* Category Tabs */}
                    <div className="flex gap-1">
                        {(Object.keys(CATEGORY_LABELS) as Category[]).map((c) => (
                            <button
                                key={c}
                                onClick={() => setCategory(c)}
                                className={cn(
                                    "px-2 py-0.5 rounded text-[10px] font-medium transition-all",
                                    category === c
                                        ? "bg-white/10 text-white"
                                        : "text-white/30 hover:text-white/50"
                                )}
                            >
                                {CATEGORY_LABELS[c]}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <div className="w-8 h-8 border-2 border-[#D4AF37]/30 border-t-[#D4AF37] rounded-full animate-spin" />
                        </div>
                    ) : displayLeaderboard.length > 0 ? (
                        <>
                            {/* Top 3 Podium Style */}
                            {displayLeaderboard.slice(0, 3).map((user) => (
                                <motion.div
                                    key={user.id}
                                    className={cn(
                                        "flex items-center gap-4 p-3 rounded-xl border transition-all relative overflow-hidden group",
                                        rankStyles[user.rank as keyof typeof rankStyles]
                                    )}
                                    whileHover={{ scale: 1.02 }}
                                >
                                    {/* Glowing shine effect for top 3 */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 translate-x-[-100%] group-hover:animate-shine" />

                                    <div className="flex flex-col items-center justify-center w-8">
                                        <span className="text-2xl drop-shadow-md">{rankLabels[user.rank as keyof typeof rankLabels]}</span>
                                    </div>

                                    <div
                                        className={cn(
                                            "w-10 h-10 rounded-full flex items-center justify-center text-black font-bold text-sm overflow-hidden border-2",
                                            user.rank === 1 ? "border-[#FCE205] shadow-[0_0_10px_#FCE205]" :
                                                user.rank === 2 ? "border-gray-300 shadow-[0_0_10px_gray]" :
                                                    "border-amber-700 shadow-[0_0_10px_#b45309]"
                                        )}
                                    >
                                        {user.avatar_url ? (
                                            <Image
                                                src={user.avatar_url}
                                                alt={user.username || "User"}
                                                width={40}
                                                height={40}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            (user.username || "?")[0].toUpperCase()
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <span className={cn(
                                            "font-bold truncate block text-lg",
                                            user.rank === 1 ? "text-[#FCE205]" :
                                                user.rank === 2 ? "text-gray-200" :
                                                    "text-amber-600"
                                        )}>{user.username || "Anonymous"}</span>
                                        <span className="text-xs text-white/50">{PERIOD_LABELS[period]} • {CATEGORY_LABELS[category]}</span>
                                    </div>
                                    <span className="text-white font-bold font-mono text-lg">{user.score}</span>
                                </motion.div>
                            ))}

                            {/* Rest of the list */}
                            {displayLeaderboard.slice(3).map((user) => (
                                <motion.div
                                    key={user.id}
                                    className="flex items-center gap-3 p-2 rounded-lg border border-white/5 hover:bg-white/5 transition-all"
                                    whileHover={{ x: 2 }}
                                >
                                    <span className="w-6 text-center text-white/40 font-mono text-sm">#{user.rank}</span>
                                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/80 font-bold text-xs overflow-hidden">
                                        {user.avatar_url ? (
                                            <Image src={user.avatar_url} alt={user.username || "User"} width={32} height={32} className="w-full h-full object-cover" />
                                        ) : (user.username || "?")[0].toUpperCase()}
                                    </div>
                                    <span className="flex-1 text-white/80 font-medium truncate text-sm">{user.username || "Anonymous"}</span>
                                    <span className="text-[#D4AF37] font-bold text-sm">{user.score}</span>
                                </motion.div>
                            ))}
                        </>
                    ) : (
                        <p className="text-white/50 text-sm text-center py-4">Be the first on the leaderboard!</p>
                    )}
                </div>

                {/* Personal Rank Bar */}
                <div className="mt-4 pt-4 border-t border-white/10">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-purple-900/40 to-blue-900/40 border border-white/10 backdrop-blur-md">
                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold text-white">You</div>
                        <div className="flex-1">
                            <p className="text-white text-sm font-bold">
                                {myRank.rank ? `You are #${myRank.rank}` : "Your Rank"}
                            </p>
                            <p className="text-white/50 text-xs">
                                {myRank.rank ? `Score: ${myRank.score}` : "Keep dancing to rise up!"}
                            </p>
                        </div>
                        <span className="text-[#D4AF37] font-mono font-bold">
                            {myRank.rank ? `#${myRank.rank}` : "--"}
                        </span>
                    </div>
                </div>
            </div>

            {/* Trending Tags (Compact at bottom) */}
            <div className="border-t border-white/10 pt-4">
                <h3 className="text-xs font-bold text-[#D4AF37] uppercase tracking-[0.2em] mb-3 font-serif">Trending</h3>
                <div className="flex flex-wrap gap-2">
                    {displayTags.slice(0, 5).map(({ tag, count }) => {
                        const normalized = tag.replace(/^#/, "").toLowerCase();
                        const isActive = !!activeTopic && activeTopic.toLowerCase() === normalized;
                        return (
                            <motion.button
                                key={tag}
                                onClick={() => onTagClick?.(tag)}
                                className={cn(
                                    "px-2 py-1 rounded-md text-xs font-bold border transition-all",
                                    isActive
                                        ? "bg-[#00E0FF]/30 text-white border-[#00E0FF] shadow-[0_0_10px_rgba(0,224,255,0.5)]"
                                        : "bg-[#00E0FF]/10 text-[#00E0FF] border-[#00E0FF]/30 hover:bg-[#00E0FF]/20 hover:shadow-[0_0_10px_rgba(0,224,255,0.3)]"
                                )}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.97 }}
                                title={`${count} posts`}
                                type="button"
                            >
                                {tag}
                            </motion.button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
