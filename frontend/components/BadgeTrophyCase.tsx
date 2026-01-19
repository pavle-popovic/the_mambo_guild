"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api";
import { GlassCard } from "./ui/GlassCard";

interface Badge {
  id: string;
  name: string;
  description: string;
  icon_url: string | null;
  category: string;
  requirement_type?: string;
  requirement_value?: number;
  is_earned?: boolean;
  earned_at: string | null;
}

interface BadgeTrophyCaseProps {
  userId?: string; // If provided, shows that user's badges (public view), otherwise shows current user's
}

export function BadgeTrophyCase({ userId }: BadgeTrophyCaseProps) {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        if (userId) {
          // Public view - get specific user's earned badges only
          const earnedBadges = await apiClient.getUserBadges(userId);
          setBadges(earnedBadges);
        } else {
          // Own profile - get all badges with earned status
          const allBadges = await apiClient.getBadges();
          setBadges(allBadges);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load badges");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBadges();
  }, [userId]);

  const earnedBadges = badges.filter((b) => b.is_earned);
  const unearnedBadges = badges.filter((b) => !b.is_earned);

  const categoryColors: Record<string, string> = {
    course: "from-blue-500 to-cyan-500",
    community: "from-amber-500 to-orange-500",
    performance: "from-purple-500 to-pink-500",
  };

  const categoryIcons: Record<string, string> = {
    course: "📚",
    community: "👥",
    performance: "⭐",
  };

  if (isLoading) {
    return (
      <GlassCard className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
        </div>
      </GlassCard>
    );
  }

  if (error) {
    return (
      <GlassCard className="p-6">
        <p className="text-red-400 text-center">{error}</p>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">🏆 Trophy Case</h2>
          <p className="text-sm text-white/50">
            {earnedBadges.length} of {badges.length} badges earned
          </p>
        </div>
        {earnedBadges.length > 0 && (
          <div className="text-right">
            <div className="text-3xl font-bold text-amber-400">
              {Math.round((earnedBadges.length / badges.length) * 100)}%
            </div>
            <div className="text-xs text-white/40">Complete</div>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
          <motion.div
            className={cn(
              "h-full bg-gradient-to-r",
              earnedBadges.length > 0 ? categoryColors.community : "from-gray-500 to-gray-600"
            )}
            initial={{ width: 0 }}
            animate={{ width: `${(earnedBadges.length / badges.length) * 100}%` }}
            transition={{ duration: 0.5, delay: 0.2 }}
          />
        </div>
      </div>

      {/* Earned Badges */}
      {earnedBadges.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-white/70 mb-3 uppercase tracking-wide">
            Earned Badges
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {earnedBadges.map((badge, index) => (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.05, y: -2 }}
                className={cn(
                  "relative p-4 rounded-lg border-2 bg-gradient-to-br",
                  categoryColors[badge.category] || "from-gray-600 to-gray-700",
                  "border-amber-400/50 shadow-lg"
                )}
              >
                <div className="text-center">
                  <div className="text-3xl mb-2">
                    {badge.icon_url ? (
                      <img
                        src={badge.icon_url}
                        alt={badge.name}
                        className="w-12 h-12 mx-auto object-contain"
                      />
                    ) : (
                      <span>{categoryIcons[badge.category] || "🏆"}</span>
                    )}
                  </div>
                  <h4 className="font-bold text-white text-sm mb-1">{badge.name}</h4>
                  <p className="text-xs text-white/80 line-clamp-2">{badge.description}</p>
                  {badge.earned_at && (
                    <p className="text-xs text-white/60 mt-2">
                      {new Date(badge.earned_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
                {/* Shine effect */}
                <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Unearned Badges (only show on own profile) */}
      {!userId && unearnedBadges.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-white/70 mb-3 uppercase tracking-wide">
            Locked Badges
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {unearnedBadges.map((badge, index) => (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: (earnedBadges.length + index) * 0.05 }}
                className="relative p-4 rounded-lg border-2 border-white/10 bg-white/5 opacity-60"
              >
                <div className="text-center">
                  <div className="text-3xl mb-2 grayscale">
                    {badge.icon_url ? (
                      <img
                        src={badge.icon_url}
                        alt={badge.name}
                        className="w-12 h-12 mx-auto object-contain"
                      />
                    ) : (
                      <span>{categoryIcons[badge.category] || "🏆"}</span>
                    )}
                  </div>
                  <h4 className="font-bold text-white/60 text-sm mb-1">{badge.name}</h4>
                  <p className="text-xs text-white/40 line-clamp-2">{badge.description}</p>
                  {badge.requirement_type && (
                    <p className="text-xs text-amber-400/60 mt-2">
                      {badge.requirement_type.replace(/_/g, " ")}: {badge.requirement_value}
                    </p>
                  )}
                </div>
                {/* Lock overlay */}
                <div className="absolute inset-0 rounded-lg bg-black/40 flex items-center justify-center">
                  <span className="text-2xl">🔒</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {badges.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🏆</div>
          <h3 className="text-xl font-semibold text-white mb-2">No badges yet</h3>
          <p className="text-white/60">
            Complete courses, help others, and engage with the community to earn badges!
          </p>
        </div>
      )}
    </GlassCard>
  );
}

export default BadgeTrophyCase;
