"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, Flame, Zap, Award, Star, CheckCircle2, Lock } from "lucide-react";
import { apiClient, type UserProfile } from "@/lib/api";
import { cn } from "@/lib/utils";
import GuildMasterAvatar, { TitleChip } from "@/components/ui/GuildMasterAvatar";
import { GuildMasterTag } from "@/components/ui/GuildMasterBadge";
import { getTitleSpec } from "@/lib/cosmetics";

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string | null;
}

export default function UserProfileModal({ isOpen, onClose, username }: UserProfileModalProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !username) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    setProfile(null);
    apiClient
      .getPublicProfile(username)
      .then((data) => {
        if (!cancelled) setProfile(data);
      })
      .catch((err: any) => {
        if (!cancelled) setError(err?.message || "Failed to load profile");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isOpen, username]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  const earnedBadges = (profile?.badges || []).filter((b) => b.is_earned);
  // The profile page's BadgeTrophyCase treats the first 5 earned badges
  // (ordered by display_order, then earn date) as the user's "displayed"
  // trophy set. We surface the same five here so the preview matches.
  const displayedBadges = earnedBadges.slice(0, 5);

  const isGuildMaster = profile?.tier === "performer";
  const isPro =
    profile?.tier === "advanced" || profile?.tier === "performer";

  const title = getTitleSpec(profile?.equipped_title_sku ?? null);

  // Match the profile page's level curve: Math.pow(level, 2) * 100.
  const currentLevelXP = profile ? Math.pow(profile.level, 2) * 100 : 0;
  const nextLevelXP = profile ? Math.pow(profile.level + 1, 2) * 100 : 0;
  const xpProgress = profile
    ? Math.max(
        0,
        Math.min(
          100,
          ((profile.xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100
        )
      )
    : 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 landscape:p-2"
        >
          <motion.div
            key="panel"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className={cn(
              "relative w-full overflow-hidden rounded-2xl border border-mambo-gold/20 bg-mambo-panel shadow-2xl",
              // portrait / desktop: vertical stack up to 560px
              "max-w-[560px]",
              // horizontal landscape (short viewports): wider, two-column
              "landscape:max-h-[94vh] landscape:max-w-[860px]"
            )}
          >
            {/* Close */}
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute right-3 top-3 z-20 rounded-full bg-black/50 p-1.5 text-white/80 transition hover:bg-black/70 hover:text-white"
            >
              <X size={18} />
            </button>

            {/* Gold accent header bar */}
            <div className="h-20 bg-gradient-to-br from-amber-500/20 via-amber-400/5 to-transparent landscape:h-16" />

            <div className="relative px-5 pb-6 sm:px-6 landscape:px-6 landscape:pb-5">
              {loading && (
                <div className="flex h-40 items-center justify-center text-sm text-white/50">
                  Loading profile…
                </div>
              )}

              {error && !loading && (
                <div className="flex h-40 items-center justify-center text-sm text-red-400">
                  {error}
                </div>
              )}

              {profile && !loading && !error && (
                <div
                  className={cn(
                    "flex flex-col gap-5",
                    // landscape: two columns to avoid vertical squish
                    "landscape:grid landscape:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] landscape:gap-6 landscape:items-start"
                  )}
                >
                  {/* LEFT / TOP: Identity */}
                  <div className="-mt-14 flex flex-col items-center text-center landscape:-mt-12">
                    <GuildMasterAvatar
                      avatarUrl={profile.avatar_url}
                      username={profile.username}
                      isPro={isPro}
                      isGuildMaster={isGuildMaster}
                      size="xl"
                      equippedBorderSku={profile.equipped_border_sku}
                    />
                    <h2 className="mt-3 text-xl font-bold text-white">
                      {profile.username || "Anonymous"}
                    </h2>
                    {title && (
                      <div className="mt-1.5">
                        <TitleChip label={title.label} tone={title.tone} />
                      </div>
                    )}
                    <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
                      {isGuildMaster ? (
                        <GuildMasterTag />
                      ) : isPro ? (
                        <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[11px] font-semibold text-amber-200">
                          PRO
                        </span>
                      ) : null}
                      <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] uppercase tracking-wider text-white/60">
                        {profile.tier} tier
                      </span>
                    </div>

                    {/* LEVEL + XP PROGRESS (desktop identity column) */}
                    <div className="mt-4 w-full rounded-xl border border-white/10 bg-black/30 p-3">
                      <div className="mb-1.5 flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-mambo-gold">
                          Lvl {profile.level}
                        </span>
                        <span className="font-mono text-[10px] text-white/50">
                          {profile.xp.toLocaleString()} / {nextLevelXP.toLocaleString()} XP
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-mambo-blue to-purple-500 transition-all"
                          style={{ width: `${xpProgress}%` }}
                        />
                      </div>
                      <p className="mt-1 text-[10px] text-white/40">
                        {Math.max(0, nextLevelXP - profile.xp).toLocaleString()} XP to Lvl {profile.level + 1}
                      </p>
                    </div>
                  </div>

                  {/* RIGHT / BOTTOM: Badges + progression */}
                  <div className="flex flex-col gap-5">
                    {/* INSTAGRAM */}
                    {profile.instagram_url && (
                      <a
                        href={profile.instagram_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-[linear-gradient(45deg,#f09433_0%,#e6683c_25%,#dc2743_50%,#cc2366_75%,#bc1888_100%)] px-3 py-2 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(220,39,67,0.35)] transition hover:brightness-110"
                      >
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                          <path d="M12 2.2c3.2 0 3.58 0 4.85.07 1.17.05 1.8.25 2.22.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.05.41 2.22.07 1.27.07 1.65.07 4.85s0 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.22-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.05.36-2.22.41-1.27.07-1.65.07-4.85.07s-3.58 0-4.85-.07c-1.17-.05-1.8-.25-2.22-.41-.56-.22-.96-.48-1.38-.9-.42-.42-.68-.82-.9-1.38-.16-.42-.36-1.05-.41-2.22C2.2 15.58 2.2 15.2 2.2 12s0-3.58.07-4.85c.05-1.17.25-1.8.41-2.22.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.05-.36 2.22-.41C8.42 2.2 8.8 2.2 12 2.2zm0 2c-3.14 0-3.5 0-4.74.07-.98.04-1.51.21-1.86.35-.47.18-.8.4-1.15.75-.35.35-.57.68-.75 1.15-.14.35-.31.88-.35 1.86C3.2 9.5 3.2 9.86 3.2 13s0 3.5.07 4.74c.04.98.21 1.51.35 1.86.18.47.4.8.75 1.15.35.35.68.57 1.15.75.35.14.88.31 1.86.35 1.24.07 1.6.07 4.74.07s3.5 0 4.74-.07c.98-.04 1.51-.21 1.86-.35.47-.18.8-.4 1.15-.75.35-.35.57-.68.75-1.15.14-.35.31-.88.35-1.86.07-1.24.07-1.6.07-4.74s0-3.5-.07-4.74c-.04-.98-.21-1.51-.35-1.86a3.1 3.1 0 0 0-.75-1.15 3.1 3.1 0 0 0-1.15-.75c-.35-.14-.88-.31-1.86-.35C15.5 4.2 15.14 4.2 12 4.2zm0 3.4a4.4 4.4 0 1 1 0 8.8 4.4 4.4 0 0 1 0-8.8zm0 2a2.4 2.4 0 1 0 0 4.8 2.4 2.4 0 0 0 0-4.8zm5-2.7a1.05 1.05 0 1 1 0 2.1 1.05 1.05 0 0 1 0-2.1z"/>
                        </svg>
                        Connect on Instagram
                      </a>
                    )}

                    {/* DISPLAYED BADGES — the 5 the user chose to showcase */}
                    <section>
                      <h3 className="mb-2 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.15em] text-mambo-gold">
                        <span>Displayed Badges</span>
                        <span className="text-white/40">
                          {displayedBadges.length} / {earnedBadges.length}
                        </span>
                      </h3>
                      {displayedBadges.length > 0 ? (
                        <div className="grid grid-cols-5 gap-2">
                          {displayedBadges.map((b) => (
                            <div
                              key={b.id}
                              title={`${b.name} — ${b.description}`}
                              className="group relative flex aspect-square items-center justify-center rounded-lg border border-mambo-gold/30 bg-gradient-to-br from-amber-500/10 to-amber-900/5 transition hover:border-mambo-gold/60"
                            >
                              {b.icon_url ? (
                                <Image
                                  src={b.icon_url}
                                  alt={b.name}
                                  width={40}
                                  height={40}
                                  className="object-contain"
                                />
                              ) : (
                                <Award className="h-5 w-5 text-mambo-gold" />
                              )}
                            </div>
                          ))}
                          {/* Empty slots so the row always shows 5 cells */}
                          {Array.from({ length: Math.max(0, 5 - displayedBadges.length) }).map((_, i) => (
                            <div
                              key={`empty-${i}`}
                              className="flex aspect-square items-center justify-center rounded-lg border border-white/5 bg-white/[0.02]"
                            >
                              <Lock className="h-3.5 w-3.5 text-white/20" />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 text-center text-xs text-white/40">
                          <Lock className="mx-auto mb-1 h-4 w-4" />
                          No badges earned yet
                        </div>
                      )}
                    </section>

                    {/* STAT CHIPS — streak / rep / claves / badges / solutions */}
                    <section className="grid grid-cols-3 gap-2">
                      <Stat icon={<Flame className="h-4 w-4 text-orange-400" />} label="Streak" value={`${profile.streak_count}d`} />
                      <Stat icon={<Zap className="h-4 w-4 text-amber-400" />} label="Rep" value={profile.reputation ?? 0} />
                      <Stat icon={<span className="text-sm leading-none">🥢</span>} label="Claves" value={profile.current_claves ?? 0} />
                      <Stat icon={<Star className="h-4 w-4 text-sky-400" />} label="Badges" value={earnedBadges.length} />
                      <Stat icon={<CheckCircle2 className="h-4 w-4 text-emerald-400" />} label="Solved" value={profile.stats?.solutions_accepted ?? 0} />
                      <Stat icon={<Award className="h-4 w-4 text-purple-400" />} label="Reactions" value={profile.stats?.reactions_received ?? 0} />
                    </section>

                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex flex-col items-center rounded-lg border border-white/10 bg-black/20 py-2">
      <div className="flex items-center gap-1 text-xs text-white/50">
        {icon}
        <span className="uppercase tracking-wider">{label}</span>
      </div>
      <div className="mt-0.5 text-sm font-bold text-white">{value}</div>
    </div>
  );
}
