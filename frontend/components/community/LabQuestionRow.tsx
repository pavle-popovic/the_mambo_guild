"use client";

import { motion } from "framer-motion";
import { CheckCircle, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import GuildMasterBadge from "@/components/ui/GuildMasterBadge";

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
    tags: string[];
    is_solved: boolean;
    reaction_count: number;
    reply_count: number;
    created_at: string;
}

interface LabQuestionRowProps {
    post: Post;
    onClick: () => void;
    isLocked?: boolean;
    onLockedClick?: () => void;
}

export default function LabQuestionRow({
    post,
    onClick,
    isLocked = false,
    onLockedClick,
}: LabQuestionRowProps) {
    const timeAgo = getTimeAgo(post.created_at);

    const handleClick = () => {
        if (isLocked && onLockedClick) {
            onLockedClick();
        } else if (!isLocked) {
            onClick();
        }
    };

    return (
        <motion.div
            onClick={handleClick}
            className={cn(
                "relative flex items-center gap-4 p-4 rounded-lg border border-amber-400/20 bg-black/40 transition-all cursor-pointer group",
                !isLocked && "hover:bg-amber-400/5 hover:border-amber-400/40"
            )}
            whileHover={{ x: isLocked ? 0 : 4 }}
            whileTap={{ scale: 0.995 }}
        >
            {/* Lock Icon for Preview Mode */}
            {isLocked && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10">
                    <motion.div
                        className="w-8 h-8 rounded-full bg-black/60 border border-amber-400/50 flex items-center justify-center backdrop-blur-sm"
                        whileHover={{ scale: 1.1, backgroundColor: "rgba(251, 191, 36, 0.2)" }}
                    >
                        <Lock size={14} className="text-amber-400" />
                    </motion.div>
                </div>
            )}

            {/* Vote/Score Box - Art Deco Ticket Style */}
            <div className="flex-shrink-0 w-16 h-16 flex flex-col items-center justify-center border-2 border-amber-400/50 rounded-lg bg-gradient-to-b from-amber-400/10 to-transparent relative overflow-hidden">
                {/* Decorative corner notches */}
                <div className="absolute top-0 left-0 w-2 h-2 border-l-2 border-t-2 border-amber-400/30" />
                <div className="absolute top-0 right-0 w-2 h-2 border-r-2 border-t-2 border-amber-400/30" />
                <div className="absolute bottom-0 left-0 w-2 h-2 border-l-2 border-b-2 border-amber-400/30" />
                <div className="absolute bottom-0 right-0 w-2 h-2 border-r-2 border-b-2 border-amber-400/30" />

                <span className="text-2xl font-serif font-bold text-amber-400">
                    {post.reaction_count}
                </span>
                <span className="text-[10px] text-white/50 uppercase tracking-wider">votes</span>
            </div>

            {/* Content */}
            <div className={cn("flex-1 min-w-0", isLocked && "pr-12")}>
                {/* Title */}
                <h3
                    className={cn(
                        "font-serif text-lg font-bold text-white transition-colors line-clamp-1 mb-2",
                        !isLocked && "group-hover:text-amber-400"
                    )}
                >
                    {post.title}
                </h3>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5">
                    {post.tags.slice(0, 3).map((tag) => (
                        <span
                            key={tag}
                            className="px-2 py-0.5 text-xs rounded bg-white/10 text-white/70 border border-white/10"
                        >
                            {tag}
                        </span>
                    ))}
                    {post.tags.length > 3 && (
                        <span className="px-2 py-0.5 text-xs text-white/40">
                            +{post.tags.length - 3}
                        </span>
                    )}
                </div>

                {/* Meta */}
                <div className="flex items-center gap-3 mt-2 text-xs text-white/40">
                    <span className="flex items-center gap-1">
                        {post.user.first_name} {post.user.last_name[0]}.
                        {post.user.is_guild_master && <GuildMasterBadge size="sm" animate={false} />}
                    </span>
                    <span>•</span>
                    <span>{timeAgo}</span>
                </div>
            </div>

            {/* Status/Answer Count */}
            <div className={cn("flex-shrink-0 text-center", isLocked && "hidden md:block")}>
                <div
                    className={cn(
                        "w-16 h-16 flex flex-col items-center justify-center rounded-lg border-2 transition-colors",
                        post.is_solved
                            ? "border-green-500/50 bg-green-500/10"
                            : post.reply_count > 0
                                ? "border-amber-400/50 bg-amber-400/10"
                                : "border-white/20 bg-white/5"
                    )}
                >
                    {post.is_solved ? (
                        <>
                            <CheckCircle size={20} className="text-green-400 mb-1" />
                            <span className="text-[10px] text-green-400 font-bold uppercase">Solved</span>
                        </>
                    ) : (
                        <>
                            <span
                                className={cn(
                                    "text-2xl font-bold",
                                    post.reply_count > 0 ? "text-amber-400" : "text-white/40"
                                )}
                            >
                                {post.reply_count}
                            </span>
                            <span className="text-[10px] text-white/50 uppercase tracking-wider">
                                {post.reply_count === 1 ? "Answer" : "Answers"}
                            </span>
                        </>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

function getTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
}
