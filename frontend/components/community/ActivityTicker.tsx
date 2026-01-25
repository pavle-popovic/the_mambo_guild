"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame } from "lucide-react";
import { apiClient } from "@/lib/api";

interface ActivityItem {
    id: string;
    userName: string;
    action: string;
    target: string;
    timestamp: Date;
}

// Sample activity data - in production, this would come from an API/WebSocket
const sampleActivities: ActivityItem[] = [
    { id: "1", userName: "Maria G.", action: "just posted", target: "a new video", timestamp: new Date() },
    { id: "2", userName: "Carlos M.", action: "replied to", target: "'Spin Drills'", timestamp: new Date() },
    { id: "3", userName: "Elena R.", action: "solved", target: "'On2 Timing Question'", timestamp: new Date() },
    { id: "4", userName: "David K.", action: "earned", target: "🔥 Firestarter badge", timestamp: new Date() },
    { id: "5", userName: "Sofia L.", action: "just posted", target: "a shine combo", timestamp: new Date() },
    { id: "6", userName: "Miguel P.", action: "replied to", target: "'Musicality Tips'", timestamp: new Date() },
];

interface ActivityTickerProps {
    className?: string;
}

export default function ActivityTicker({ className }: ActivityTickerProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [activities] = useState<ActivityItem[]>(sampleActivities);
    const [activeNow, setActiveNow] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch real active user count from API using apiClient
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await apiClient.getCommunityStats();
                setActiveNow(data.active_now || 0);
            } catch (err) {
                // Use fallback value on error
            } finally {
                setIsLoading(false);
            }
        };
        fetchStats();
    }, []);

    // Add slight variance for "live" feel
    useEffect(() => {
        if (activeNow === 0) return;
        const interval = setInterval(() => {
            setActiveNow((prev) => {
                const variance = Math.floor(Math.random() * 3) - 1; // -1 to +1
                return Math.max(1, prev + variance);
            });
        }, 12000);
        return () => clearInterval(interval);
    }, [activeNow]);

    // Rotate through activities
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % activities.length);
        }, 4000);
        return () => clearInterval(interval);
    }, [activities.length]);

    const current = activities[currentIndex];

    return (
        <div className={`flex items-center justify-center gap-4 text-sm ${className}`}>
            {/* Activity message */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={current.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center gap-2"
                >
                    <Flame size={14} className="text-orange-400" />
                    <span className="text-amber-400 font-semibold">{current.userName}</span>
                    <span className="text-white/60">{current.action}</span>
                    <span className="text-white/80">{current.target}</span>
                </motion.div>
            </AnimatePresence>

            {/* Separator */}
            <span className="text-white/30">•</span>

            {/* Online count */}
            <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-white/60">
                    {isLoading ? (
                        <span className="text-white/40">...</span>
                    ) : (
                        <>
                            <span className="text-white font-medium">{activeNow}</span> Dancers online now
                        </>
                    )}
                </span>
            </div>
        </div>
    );
}
