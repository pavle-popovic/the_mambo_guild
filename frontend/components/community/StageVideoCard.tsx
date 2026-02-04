"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Heart, MessageCircle, Award, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCallback, useState } from "react";
import { UISound } from "@/hooks/useUISound";
import GuildMasterAvatar from "@/components/ui/GuildMasterAvatar";

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
    mux_playback_id: string | null;
    is_wip: boolean;
    feedback_type: "coach" | "hype";
    reaction_count: number;
    reply_count: number;
    has_instructor_comment?: boolean;
}

interface StageVideoCardProps {
    post: Post;
    onClick: () => void;
    isLocked?: boolean;
    onLockedClick?: () => void;
}

export default function StageVideoCard({
    post,
    onClick,
    isLocked = false,
    onLockedClick,
}: StageVideoCardProps) {
    const [isHovered, setIsHovered] = useState(false);

    // Static thumbnail (default) and animated GIF (on hover)
    const thumbnailUrl = post.mux_playback_id
        ? `https://image.mux.com/${post.mux_playback_id}/thumbnail.jpg?width=400&time=1`
        : null;

    // Animated GIF preview (first 4 seconds, 15fps) - only load on hover
    const previewUrl = post.mux_playback_id
        ? `https://image.mux.com/${post.mux_playback_id}/animated.gif?width=320&start=0&end=4&fps=15`
        : null;

    // Show GIF on hover, static thumbnail otherwise
    const displayUrl = isHovered && previewUrl ? previewUrl : thumbnailUrl;

    const handleClick = () => {
        if (isLocked && onLockedClick) {
            onLockedClick();
        } else if (!isLocked) {
            onClick();
        }
    };

    const handleHoverStart = useCallback(() => {
        UISound.hover();
    }, []);

    const handleMouseDown = useCallback(() => {
        UISound.click();
    }, []);

    return (
        <motion.div
            onClick={handleClick}
            onHoverStart={() => {
                handleHoverStart();
                setIsHovered(true);
            }}
            onHoverEnd={() => setIsHovered(false)}
            onMouseDown={handleMouseDown}
            className={cn(
                "relative aspect-[9/16] rounded-2xl overflow-hidden cursor-pointer group bg-black shadow-2xl border border-white/10 transition-all duration-300",
                !isLocked && "hover:border-mambo-gold/50 hover:shadow-2xl hover:shadow-mambo-gold/10 hover:scale-[1.02] z-0 hover:z-10",
                isLocked && "cursor-pointer"
            )}
        >
            {/* Inner Content Container */}
            <div className="relative h-full w-full bg-[#0a0a0a] rounded-2xl overflow-hidden">
                {/* Video Preview - Static thumbnail, animated GIF on hover */}
                {displayUrl ? (
                    <Image
                        src={displayUrl}
                        alt={post.title}
                        fill
                        unoptimized={isHovered} // Only unoptimized for animated GIFs
                        className={cn(
                            "object-cover transition-transform duration-700",
                            !isLocked && "group-hover:scale-105"
                        )}
                        sizes="(max-width: 768px) 50vw, 33vw"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
                        <div className="text-center text-white/40">
                            <span className="text-4xl block mb-2">📺</span>
                            <span className="text-xs">Processing...</span>
                        </div>
                    </div>
                )}

                {/* Lock Overlay for Preview Mode - Palladium Era */}
                {isLocked && (
                    <div className="absolute inset-0 flex items-center justify-center z-20">
                        <motion.div
                            className="w-14 h-14 rounded-full bg-black/80 border border-[#D4AF37]/50 flex items-center justify-center backdrop-blur-md shadow-[0_0_20px_rgba(212,175,55,0.3)]"
                            initial={{ scale: 0.9, opacity: 0.7 }}
                            animate={{ scale: 1, opacity: 1 }}
                            whileHover={{ scale: 1.1, borderColor: "#FCE205" }}
                        >
                            <Lock size={24} className="text-[#FCE205]" />
                        </motion.div>
                    </div>
                )}

                {/* WIP Banner */}
                {post.is_wip && (
                    <div className="absolute top-3 left-0 right-0 z-10 flex justify-center">
                        <div className="bg-orange-500/90 py-1 px-3 rounded-full shadow-lg border border-black/20 backdrop-blur-sm">
                            <span className="text-[10px] font-black uppercase tracking-widest text-black">Work in Progress</span>
                        </div>
                    </div>
                )}

                {/* Maestro Reviewed Badge - Palladium Era */}
                {post.has_instructor_comment && (
                    <div className="absolute top-3 right-3 z-10">
                        <div className="bg-[linear-gradient(135deg,#FCE205_0%,#D4AF37_100%)] text-black text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-[0_0_15px_rgba(252,226,5,0.4)] border border-white/20">
                            <Award size={12} />
                            <span>Maestro</span>
                        </div>
                    </div>
                )}

                {/* Hover Overlay - only show when not locked */}
                {!isLocked && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                        {/* Stats */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1.5 text-white">
                                    <Heart size={18} className="text-pink-500 fill-pink-500 drop-shadow-[0_0_8px_rgba(236,72,153,0.5)]" />
                                    <span className="text-sm font-bold shadow-black drop-shadow-md">{post.reaction_count}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-white">
                                    <MessageCircle size={18} className="text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]" />
                                    <span className="text-sm font-bold shadow-black drop-shadow-md">{post.reply_count}</span>
                                </div>
                            </div>

                            {/* User Avatar - Guild Master styling */}
                            <GuildMasterAvatar
                                avatarUrl={post.user.avatar_url}
                                firstName={post.user.first_name}
                                lastName={post.user.last_name}
                                isPro={post.user.is_pro}
                                isGuildMaster={post.user.is_guild_master}
                                size="sm"
                                showBadge={true}
                            />
                        </div>
                    </div>
                )}

                {/* Stats always visible when locked */}
                {isLocked && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                        <div className="flex items-center justify-between opacity-60">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1.5 text-white">
                                    <Heart size={16} />
                                    <span className="text-sm font-medium">{post.reaction_count}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-white">
                                    <MessageCircle size={16} />
                                    <span className="text-sm font-medium">{post.reply_count}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
