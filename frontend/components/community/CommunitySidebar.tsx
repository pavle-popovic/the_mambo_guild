"use client";

import { useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Tv, FlaskConical, Bookmark, ShoppingBag, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "@/i18n/useTranslations";

type ViewMode = "stage" | "lab" | "saved" | "my_posts";

interface Post {
    id: string;
    tags: string[];
    post_type: "stage" | "lab";
}

interface CommunitySidebarProps {
    viewMode: ViewMode;
    onViewModeChange: (mode: ViewMode) => void;
    selectedLevels: string[];
    onLevelsChange: (levels: string[]) => void;
    posts?: Post[]; // Pass posts to calculate counts
}

export default function CommunitySidebar({
    viewMode,
    onViewModeChange,
    selectedLevels,
    onLevelsChange,
    posts = [],
}: CommunitySidebarProps) {
    const t = useTranslations("community");
    const tShop = useTranslations("shop");
    const tGuide = useTranslations("communityGuide");
    const levels = [
        { id: "level-1", label: t("beginner"), value: "beginner", keywords: ["beginner", "level 1", "level-1", "I"] },
        { id: "level-2", label: t("intermediate"), value: "intermediate", keywords: ["intermediate", "level 2", "level-2", "II"] },
        { id: "level-3", label: t("advanced"), value: "advanced", keywords: ["advanced", "level 3", "level-3", "III"] },
        { id: "level-4", label: t("master"), value: "master", keywords: ["master", "level 4", "level-4", "IV", "expert"] },
    ];
    // Calculate counts for each filter
    const filterCounts = useMemo(() => {
        const levelCounts: Record<string, number> = {};

        levels.forEach((l) => (levelCounts[l.value] = 0));

        posts.forEach((post) => {
            const tagsLower = post.tags.map((t) => t.toLowerCase());

            levels.forEach((level) => {
                const matches = level.keywords.some((kw) =>
                    tagsLower.some((tag) => tag.includes(kw.toLowerCase()))
                );
                if (matches) levelCounts[level.value]++;
            });
        });

        return { levelCounts };
    }, [posts]);

    const toggleLevel = (value: string) => {
        if (selectedLevels.includes(value)) {
            onLevelsChange(selectedLevels.filter((l) => l !== value));
        } else {
            onLevelsChange([...selectedLevels, value]);
        }
    };

    return (
        <div className="lg:sticky lg:top-28 lg:h-[calc(100vh-8rem)] bg-[#121212]/60 backdrop-blur-xl border border-white/10 rounded-2xl lg:rounded-3xl p-4 lg:p-6 flex flex-col gap-4 lg:gap-8 shadow-2xl">
            {/* Navigation */}
            <div>
                <nav className="space-y-2">
                    {[
                        { mode: "stage" as ViewMode, label: t("theStage"), icon: Tv },
                        { mode: "lab" as ViewMode, label: t("theLab"), icon: FlaskConical },
                        { mode: "my_posts" as ViewMode, label: t("myPosts"), icon: Bookmark },
                    ].map(({ mode, label, icon: Icon }) => (
                        <motion.button
                            key={mode}
                            onClick={() => onViewModeChange(mode)}
                            className={cn(
                                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all font-medium border border-transparent",
                                viewMode === mode
                                    ? "bg-white/10 text-[#FCE205] border-[#FCE205]/30 shadow-[0_0_15px_rgba(252,226,5,0.1)]"
                                    : "text-white/60 hover:text-white hover:bg-white/5"
                            )}
                            whileHover={{ x: 4 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Icon size={20} className={cn(viewMode === mode ? "text-[#FCE205]" : "text-white/60")} />
                            <span className="font-serif tracking-wide">{label}</span>
                        </motion.button>
                    ))}
                </nav>
            </div>

            {/* Separator */}
            <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            {/* Community Guide CTA */}
            <Link
                href="/community/guide"
                className="group flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 hover:border-[#FCE205]/40 hover:bg-white/[0.06] transition-all"
            >
                <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-white/70 group-hover:text-[#FCE205] transition-colors">
                    <BookOpen size={14} />
                </div>
                <span className="flex-1 text-sm font-medium text-white/70 group-hover:text-white transition-colors truncate">
                    {tGuide("metaTitle")}
                </span>
                <span className="text-white/30 group-hover:text-[#FCE205] transition-colors text-sm">→</span>
            </Link>

            {/* Shop CTA */}
            <Link
                href="/shop"
                className="group relative overflow-hidden flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-amber-500/15 to-orange-500/10 border border-amber-500/30 hover:border-amber-500/60 hover:from-amber-500/25 hover:to-orange-500/20 transition-all"
            >
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-sm shadow-lg shadow-amber-500/20">
                    🥢
                </div>
                <div className="flex-1 min-w-0">
                    <div className="font-serif tracking-wide text-sm font-bold text-amber-200 group-hover:text-amber-100 transition-colors">
                        {tShop("pageTitle")}
                    </div>
                    <div className="text-[10px] text-white/40 uppercase tracking-wider mt-0.5">
                        {tShop("inventoryTitle")} →
                    </div>
                </div>
                <ShoppingBag size={16} className="text-amber-400/80 group-hover:text-amber-300 transition-colors" />
            </Link>

            {/* Level Filter */}
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                <h3 className="text-xs font-bold text-[#D4AF37] uppercase tracking-[0.2em] mb-4 font-serif pl-2">
                    {t("experienceLevel")}
                </h3>
                <div className="space-y-2">
                    {levels.map((level) => {
                        const count = filterCounts.levelCounts[level.value] || 0;
                        return (
                            <label
                                key={level.id}
                                className="flex items-center gap-3 cursor-pointer group px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
                                onClick={() => toggleLevel(level.value)}
                            >
                                <div
                                    className={cn(
                                        "w-4 h-4 rounded border flex items-center justify-center transition-all",
                                        selectedLevels.includes(level.value)
                                            ? "bg-[#D4AF37] border-[#D4AF37]"
                                            : "border-white/20 group-hover:border-[#D4AF37]/50"
                                    )}
                                >
                                    {selectedLevels.includes(level.value) && (
                                        <svg
                                            className="w-3 h-3 text-black"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            strokeWidth={3}
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </div>
                                <span
                                    className={cn(
                                        "flex-1 text-sm transition-colors",
                                        selectedLevels.includes(level.value)
                                            ? "text-white font-medium"
                                            : "text-white/50 group-hover:text-white/80"
                                    )}
                                >
                                    {level.label}
                                </span>
                                {count > 0 && (
                                    <span className="text-xs text-[#D4AF37]/60 font-medium">({count})</span>
                                )}
                            </label>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
