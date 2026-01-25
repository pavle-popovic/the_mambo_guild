"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Tv, FlaskConical, Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";

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
    selectedTopics: string[];
    onTopicsChange: (topics: string[]) => void;
    posts?: Post[]; // Pass posts to calculate counts
}

const levels = [
    { id: "level-1", label: "Beginner", value: "beginner", keywords: ["beginner", "level 1", "level-1", "I"] },
    { id: "level-2", label: "Intermediate", value: "intermediate", keywords: ["intermediate", "level 2", "level-2", "II"] },
    { id: "level-3", label: "Advanced", value: "advanced", keywords: ["advanced", "level 3", "level-3", "III"] },
    { id: "level-4", label: "Master", value: "master", keywords: ["master", "level 4", "level-4", "IV", "expert"] },
];

const topics = [
    { id: "dancing", label: "Dancing", slug: "dancing" },
    { id: "expression", label: "Expression", slug: "expression" },
    { id: "musicality", label: "Musicality", slug: "musicality" },
    { id: "partnerwork", label: "Partnerwork", slug: "partnerwork" },
    { id: "shines", label: "Shines", slug: "shines" },
];

export default function CommunitySidebar({
    viewMode,
    onViewModeChange,
    selectedLevels,
    onLevelsChange,
    selectedTopics,
    onTopicsChange,
    posts = [],
}: CommunitySidebarProps) {
    // Calculate counts for each filter
    const filterCounts = useMemo(() => {
        const levelCounts: Record<string, number> = {};
        const topicCounts: Record<string, number> = {};

        // Initialize counts
        levels.forEach((l) => (levelCounts[l.value] = 0));
        topics.forEach((t) => (topicCounts[t.slug] = 0));

        // Count posts matching each filter
        posts.forEach((post) => {
            const tagsLower = post.tags.map((t) => t.toLowerCase());

            // Count levels
            levels.forEach((level) => {
                const matches = level.keywords.some((kw) =>
                    tagsLower.some((tag) => tag.includes(kw.toLowerCase()))
                );
                if (matches) levelCounts[level.value]++;
            });

            // Count topics
            topics.forEach((topic) => {
                const matches = tagsLower.some((tag) => tag.includes(topic.slug.toLowerCase()));
                if (matches) topicCounts[topic.slug]++;
            });
        });

        return { levelCounts, topicCounts };
    }, [posts]);

    const toggleLevel = (value: string) => {
        if (selectedLevels.includes(value)) {
            onLevelsChange(selectedLevels.filter((l) => l !== value));
        } else {
            onLevelsChange([...selectedLevels, value]);
        }
    };

    const toggleTopic = (slug: string) => {
        if (selectedTopics.includes(slug)) {
            onTopicsChange(selectedTopics.filter((t) => t !== slug));
        } else {
            onTopicsChange([...selectedTopics, slug]);
        }
    };

    return (
        <div className="sticky top-28 h-[calc(100vh-8rem)] bg-[#121212]/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex flex-col gap-8 shadow-2xl">
            {/* Navigation */}
            <div>
                <nav className="space-y-2">
                    {[
                        { mode: "stage" as ViewMode, label: "The Stage", icon: Tv },
                        { mode: "lab" as ViewMode, label: "The Lab", icon: FlaskConical },
                        { mode: "my_posts" as ViewMode, label: "My Posts", icon: Bookmark },
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

            {/* Level Filter */}
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                <h3 className="text-xs font-bold text-[#D4AF37] uppercase tracking-[0.2em] mb-4 font-serif pl-2">
                    Experience Level
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

                <div className="my-6 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                {/* Topic Filter */}
                <h3 className="text-xs font-bold text-[#D4AF37] uppercase tracking-[0.2em] mb-4 font-serif pl-2">
                    Focus Area
                </h3>
                <div className="space-y-2 mb-4">
                    {topics.map((topic) => {
                        const count = filterCounts.topicCounts[topic.slug] || 0;
                        return (
                            <label
                                key={topic.id}
                                className="flex items-center gap-3 cursor-pointer group px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
                                onClick={() => toggleTopic(topic.slug)}
                            >
                                <div
                                    className={cn(
                                        "w-4 h-4 rounded border flex items-center justify-center transition-all",
                                        selectedTopics.includes(topic.slug)
                                            ? "bg-[#D4AF37] border-[#D4AF37]"
                                            : "border-white/20 group-hover:border-[#D4AF37]/50"
                                    )}
                                >
                                    {selectedTopics.includes(topic.slug) && (
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
                                        selectedTopics.includes(topic.slug)
                                            ? "text-white font-medium"
                                            : "text-white/50 group-hover:text-white/80"
                                    )}
                                >
                                    {topic.label}
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
