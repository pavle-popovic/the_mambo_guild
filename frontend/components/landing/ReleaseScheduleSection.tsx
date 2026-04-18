"use client";

import { useState, useEffect, useMemo, useRef, useLayoutEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import Link from "next/link";
import { FaCalendarAlt, FaStar, FaTimes } from "react-icons/fa";
import { HiSparkles } from "react-icons/hi";
import { apiClient, type ReleaseScheduleItemDTO } from "@/lib/api";
import { useTranslations } from "@/i18n/useTranslations";

// ============ DATA ============
type ReleaseType = "choreo" | "course";
type ReleaseLevel = "beginner" | "intermediate" | "advanced" | "mastery";

interface ReleaseItem {
    date: string; // ISO date
    title: string;
    artist?: string;
    type: ReleaseType;
    level: ReleaseLevel;
    featured?: boolean;
}

// Fallback data shown if the API is unavailable so the landing page never
// looks empty. The admin-editable source of truth lives in the DB.
const RELEASE_SCHEDULE_FALLBACK: ReleaseItem[] = [
    { date: "2026-05-06", type: "choreo", level: "advanced", title: "Soneros de Bailadores", artist: "Cheo Feliciano" },
    { date: "2026-05-20", type: "choreo", level: "intermediate", title: "Rebelión", artist: "Gilberto Santa Rosa" },
    { date: "2026-06-03", type: "choreo", level: "beginner", title: "Ella", artist: "La Sra Tomasa" },
    { date: "2026-06-17", type: "course", level: "mastery", title: "Full Body Movement Mastery", featured: true },
    { date: "2026-07-01", type: "choreo", level: "advanced", title: "Los Dinteles", artist: "Juan Luis Guerra" },
    { date: "2026-07-15", type: "choreo", level: "intermediate", title: "Because of You", artist: "Ne-Yo" },
    { date: "2026-07-29", type: "choreo", level: "beginner", title: "Baile Inolvidable", artist: "Bad Bunny" },
    { date: "2026-08-12", type: "course", level: "mastery", title: "Full Jazz Course", artist: "feat. Alexander McCormack", featured: true },
];

function dtoToItem(dto: ReleaseScheduleItemDTO): ReleaseItem {
    return {
        date: dto.release_date,
        title: dto.title,
        artist: dto.artist ?? undefined,
        type: dto.release_type,
        level: dto.level,
        featured: dto.featured,
    };
}

function useReleaseSchedule(): ReleaseItem[] {
    // DB is the source of truth (seeded on first boot from RELEASE_SCHEDULE_FALLBACK
    // by the backend). The fallback only paints during the initial fetch and on
    // outright API failure so the landing page never looks empty.
    const [items, setItems] = useState<ReleaseItem[]>(RELEASE_SCHEDULE_FALLBACK);
    useEffect(() => {
        let cancelled = false;
        apiClient
            .getReleaseSchedule()
            .then((data) => {
                if (cancelled) return;
                if (Array.isArray(data)) {
                    setItems(data.map(dtoToItem));
                }
            })
            .catch(() => {
                /* keep fallback */
            });
        return () => {
            cancelled = true;
        };
    }, []);
    return items;
}

const LEVEL_STYLES: Record<ReleaseLevel, {
    label: string;
    text: string;
    border: string;
    bg: string;
    glow: string;
    dot: string;
    dotGlow: string;
}> = {
    beginner: {
        label: "Beginner",
        text: "text-emerald-300",
        border: "border-emerald-400/40",
        bg: "from-emerald-500/15 via-emerald-900/5 to-transparent",
        glow: "shadow-[0_0_25px_rgba(16,185,129,0.22)]",
        dot: "bg-emerald-400",
        dotGlow: "shadow-[0_0_12px_rgba(16,185,129,0.9)]",
    },
    intermediate: {
        label: "Intermediate",
        text: "text-cyan-300",
        border: "border-cyan-400/40",
        bg: "from-cyan-500/15 via-blue-900/5 to-transparent",
        glow: "shadow-[0_0_25px_rgba(34,211,238,0.22)]",
        dot: "bg-cyan-400",
        dotGlow: "shadow-[0_0_12px_rgba(34,211,238,0.9)]",
    },
    advanced: {
        label: "Advanced",
        text: "text-rose-300",
        border: "border-rose-400/40",
        bg: "from-rose-500/15 via-orange-900/5 to-transparent",
        glow: "shadow-[0_0_25px_rgba(244,63,94,0.22)]",
        dot: "bg-rose-400",
        dotGlow: "shadow-[0_0_12px_rgba(244,63,94,0.9)]",
    },
    mastery: {
        label: "Mastery",
        text: "text-amber-300",
        border: "border-amber-300/60",
        bg: "from-amber-400/25 via-yellow-900/10 to-transparent",
        glow: "shadow-[0_0_35px_rgba(252,226,5,0.35)]",
        dot: "bg-amber-300",
        dotGlow: "shadow-[0_0_14px_rgba(252,226,5,1)]",
    },
};

// ============ HOOKS ============
function useLayoutMode(): "desktop" | "portrait" | "landscape" {
    const [mode, setMode] = useState<"desktop" | "portrait" | "landscape">("desktop");
    useEffect(() => {
        const update = () => {
            const w = window.innerWidth;
            const h = window.innerHeight;
            if (w >= 1280) setMode("desktop");
            else if (w > h) setMode("landscape");
            else setMode("portrait");
        };
        update();
        window.addEventListener("resize", update);
        window.addEventListener("orientationchange", update);
        return () => {
            window.removeEventListener("resize", update);
            window.removeEventListener("orientationchange", update);
        };
    }, []);
    return mode;
}

function useCountdown(target: Date) {
    const [now, setNow] = useState<number | null>(null);
    useEffect(() => {
        setNow(Date.now());
        const id = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(id);
    }, []);
    if (now === null) return { days: 0, hours: 0, minutes: 0, seconds: 0, ready: false };
    const diff = Math.max(0, target.getTime() - now);
    return {
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff / 3600000) % 24),
        minutes: Math.floor((diff / 60000) % 60),
        seconds: Math.floor((diff / 1000) % 60),
        ready: true,
    };
}

function useNextRelease(items: ReleaseItem[]): ReleaseItem {
    const [now, setNow] = useState<number | null>(null);
    useEffect(() => {
        setNow(Date.now());
    }, []);
    return useMemo(() => {
        if (now === null) return items[0];
        const upcoming = items.find(r => parseDate(r.date).getTime() > now);
        return upcoming || items[items.length - 1];
    }, [items, now]);
}

// ============ UTILS ============
const parseDate = (s: string) => new Date(s + "T00:00:00");
const fmtShort = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
const fmtFull = (d: Date) => d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

// ============ LEVEL LABELS ============
function useLevelLabels() {
    const t = useTranslations("landing.releases");
    return {
        beginner: t("levelBeginner"),
        intermediate: t("levelIntermediate"),
        advanced: t("levelAdvanced"),
        mastery: t("levelMastery"),
    } as Record<ReleaseLevel, string>;
}

// ============ CARD ============
function ReleaseCard({ item, compact = false }: { item: ReleaseItem; compact?: boolean }) {
    const t = useTranslations("landing.releases");
    const labels = useLevelLabels();
    const style = LEVEL_STYLES[item.level];
    const date = parseDate(item.date);
    return (
        <div
            className={`relative rounded-2xl border bg-gradient-to-br ${style.bg} ${style.border} ${style.glow} ${
                item.featured ? "ring-1 ring-amber-300/60" : ""
            } overflow-hidden ${compact ? "p-3" : "p-4"}`}
        >
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(110deg,transparent_20%,rgba(255,255,255,0.05)_50%,transparent_80%)]" />
            <div className="relative">
                <div className="flex flex-wrap items-center gap-1.5">
                    <span className={`rounded-full bg-black/50 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest ${style.text}`}>
                        {labels[item.level]}
                    </span>
                    <span className="rounded-full bg-black/50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-gray-300">
                        {item.type === "course" ? t("typeCourse") : t("typeChoreo")}
                    </span>
                    {item.featured && (
                        <span className="flex items-center gap-1 rounded-full bg-amber-300/20 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-amber-200">
                            <FaStar className="text-[8px]" /> {t("featuredFull")}
                        </span>
                    )}
                </div>
                <h4 className={`mt-2 font-bold leading-tight text-white ${compact ? "text-sm" : "text-base"}`}>
                    {item.title}
                </h4>
                {item.artist && (
                    <p className={`mt-0.5 italic text-gray-400 ${compact ? "text-[11px]" : "text-xs"}`}>{item.artist}</p>
                )}
                <div className="mt-2 flex items-center gap-1 text-[10px] font-bold text-amber-300">
                    <FaCalendarAlt className="text-[9px]" /> {fmtShort(date)}
                </div>
            </div>
        </div>
    );
}

function TimelineNode({ item, pulse }: { item: ReleaseItem; pulse?: boolean }) {
    const s = LEVEL_STYLES[item.level];
    return (
        <div className="relative flex items-center justify-center">
            {pulse && <div className={`absolute h-5 w-5 rounded-full ${s.dot} opacity-40 animate-ping`} />}
            <div className={`relative h-3.5 w-3.5 rounded-full ${s.dot} ${s.dotGlow} ring-2 ring-black`} />
        </div>
    );
}

// ============ LAYOUT: DESKTOP HORIZONTAL ============
function HorizontalTimeline({ items, nextId }: { items: ReleaseItem[]; nextId: string | null }) {
    return (
        <div className="relative -mx-4 overflow-x-auto px-4 pb-4">
            <div className="mx-auto flex min-w-[1500px] items-stretch px-6">
                {items.map((item, i) => {
                    const isAbove = i % 2 === 0;
                    const isNext = item.date === nextId;
                    const date = parseDate(item.date);
                    return (
                        <div key={i} className="relative flex w-[200px] flex-1 flex-col">
                            {/* Card slot above */}
                            <div className="flex min-h-[170px] items-end justify-center pb-4">
                                {isAbove && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true, margin: "-80px" }}
                                        transition={{ duration: 0.5, delay: i * 0.06 }}
                                        whileHover={{ y: -4 }}
                                        className="relative w-[180px]"
                                    >
                                        <ReleaseCard item={item} compact />
                                        <div className="absolute left-1/2 top-full h-4 w-[2px] -translate-x-1/2 bg-gradient-to-b from-amber-300/60 to-transparent" />
                                    </motion.div>
                                )}
                            </div>

                            {/* Axis + node */}
                            <div className="relative h-[52px]">
                                <div className="absolute left-0 right-0 top-1/2 h-[2px] -translate-y-1/2">
                                    <div className="h-full w-full bg-gradient-to-r from-amber-300/50 via-amber-200/60 to-amber-300/50" />
                                    <div className="absolute inset-0 bg-amber-300/30 blur-[3px]" />
                                </div>
                                <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
                                    <TimelineNode item={item} pulse={isNext} />
                                </div>
                                <div className="absolute left-1/2 top-[calc(50%+18px)] -translate-x-1/2 whitespace-nowrap text-[10px] font-black uppercase tracking-wider text-amber-200">
                                    {fmtShort(date)}
                                </div>
                            </div>

                            {/* Card slot below */}
                            <div className="flex min-h-[170px] items-start justify-center pt-6">
                                {!isAbove && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true, margin: "-80px" }}
                                        transition={{ duration: 0.5, delay: i * 0.06 }}
                                        whileHover={{ y: 4 }}
                                        className="relative w-[180px]"
                                    >
                                        <div className="absolute bottom-full left-1/2 h-4 w-[2px] -translate-x-1/2 bg-gradient-to-t from-amber-300/60 to-transparent" />
                                        <ReleaseCard item={item} compact />
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ============ LAYOUT: VERTICAL (PORTRAIT MOBILE) ============
function VerticalTimeline({ items, nextId }: { items: ReleaseItem[]; nextId: string | null }) {
    const t = useTranslations("landing.releases");
    return (
        <div className="relative mx-auto max-w-md px-2">
            <div className="absolute bottom-2 left-5 top-2 w-[2px] bg-gradient-to-b from-amber-300/10 via-amber-300/70 to-amber-300/10">
                <div className="absolute inset-0 bg-amber-300/40 blur-sm" />
            </div>
            <div className="space-y-5">
                {items.map((item, i) => {
                    const isNext = item.date === nextId;
                    const date = parseDate(item.date);
                    return (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, margin: "-40px" }}
                            transition={{ duration: 0.5, delay: i * 0.05 }}
                            className="relative pl-14"
                        >
                            <div className="absolute left-5 top-6 -translate-x-1/2">
                                <TimelineNode item={item} pulse={isNext} />
                            </div>
                            <div className="mb-1 flex items-center gap-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-amber-300">
                                    {fmtShort(date)}
                                </span>
                                {isNext && (
                                    <span className="flex items-center gap-1 rounded-full bg-amber-300/20 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest text-amber-200">
                                        <HiSparkles /> {t("nextLabel")}
                                    </span>
                                )}
                            </div>
                            <ReleaseCard item={item} compact />
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}

// ============ LAYOUT: LANDSCAPE (MOBILE HORIZONTAL) ============
function LandscapeCarousel({ items, nextId }: { items: ReleaseItem[]; nextId: string | null }) {
    return (
        <div className="relative">
            <div className="pointer-events-none absolute left-0 right-0 top-[68px] h-[2px] bg-gradient-to-r from-transparent via-amber-300/50 to-transparent" />
            <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-4 pt-2 [scrollbar-color:rgba(252,226,5,0.5)_rgba(255,255,255,0.08)] [scrollbar-width:thin] [&::-webkit-scrollbar]:h-2.5 [&::-webkit-scrollbar-track]:bg-white/5 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-amber-300/50 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb:hover]:bg-amber-300/80" style={{ touchAction: "pan-x pan-y" }}>
                {items.map((item, i) => {
                    const isNext = item.date === nextId;
                    const date = parseDate(item.date);
                    return (
                        <div key={i} className="w-[190px] flex-shrink-0 snap-center">
                            <div className="mb-1 flex items-center justify-between">
                                <span className="text-[9px] font-black uppercase tracking-widest text-amber-300">{fmtShort(date)}</span>
                                {isNext && <HiSparkles className="animate-pulse text-xs text-amber-300" />}
                            </div>
                            <div className="mb-2 flex justify-center">
                                <TimelineNode item={item} pulse={isNext} />
                            </div>
                            <ReleaseCard item={item} compact />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ============ RESPONSIVE WRAPPER ============
function ResponsiveTimeline({ items }: { items: ReleaseItem[] }) {
    const mode = useLayoutMode();
    const next = useNextRelease(items);
    const nextId = next.date;
    if (mode === "desktop") return <HorizontalTimeline items={items} nextId={nextId} />;
    if (mode === "landscape") return <LandscapeCarousel items={items} nextId={nextId} />;
    return <VerticalTimeline items={items} nextId={nextId} />;
}

// ============ COUNTDOWN HERO ============
function CountdownHero({ release }: { release: ReleaseItem }) {
    const t = useTranslations("landing.releases");
    const labels = useLevelLabels();
    const target = useMemo(() => parseDate(release.date), [release.date]);
    const { days, hours, minutes, seconds, ready } = useCountdown(target);
    const style = LEVEL_STYLES[release.level];
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative mx-auto mb-10 max-w-2xl overflow-hidden rounded-3xl border border-amber-300/30 bg-gradient-to-br from-amber-500/10 via-black/40 to-black/60 p-6 shadow-[0_0_60px_rgba(252,226,5,0.12)] backdrop-blur-xl sm:p-8"
        >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(252,226,5,0.12),transparent_60%)]" />
            <div className="relative text-center">
                <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/40 bg-amber-300/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.25em] text-amber-200">
                    <HiSparkles className="animate-pulse" /> {t("nextDrop")} • {fmtFull(target)}
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5">
                    <span className={`rounded-full bg-black/50 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest ${style.text}`}>{labels[release.level]}</span>
                    <span className="rounded-full bg-black/50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-gray-300">
                        {release.type === "course" ? t("typeCourse") : t("typeChoreography")}
                    </span>
                </div>
                <h3 className="mt-3 text-2xl font-extrabold text-white sm:text-4xl tracking-tight">
                    {release.title}
                </h3>
                {release.artist && <p className="mt-1 text-sm text-gray-400 sm:text-base">{release.artist}</p>}
                <div className="mx-auto mt-5 grid max-w-lg grid-cols-4 gap-2 sm:gap-3">
                    {[
                        { v: days, l: t("countdownDays") },
                        { v: hours, l: t("countdownHours") },
                        { v: minutes, l: t("countdownMin") },
                        { v: seconds, l: t("countdownSec") },
                    ].map((tx, i) => (
                        <div key={i} className="rounded-xl border border-amber-300/20 bg-black/60 py-3 backdrop-blur-sm">
                            <div className="font-mono text-2xl font-black tabular-nums text-amber-200 sm:text-4xl">
                                {ready ? String(tx.v).padStart(2, "0") : "--"}
                            </div>
                            <div className="text-[9px] uppercase tracking-widest text-gray-500 sm:text-[10px]">{tx.l}</div>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}

// ============ LANDING SECTION ============
export default function ReleaseScheduleSection() {
    const t = useTranslations("landing.releases");
    const items = useReleaseSchedule();
    const next = useNextRelease(items);
    return (
        <section className="relative overflow-hidden bg-gradient-to-b from-transparent via-black/30 to-transparent py-12 sm:py-20">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(ellipse_at_top,rgba(252,226,5,0.08),transparent_70%)]" />
            <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="mb-8 text-center md:mb-12"
                >
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.25em] text-amber-300 backdrop-blur-sm">
                        <HiSparkles /> {t("eyebrow")}
                    </div>
                    <h2 className="mt-4 text-3xl font-extrabold text-mambo-text sm:text-4xl md:text-5xl tracking-tight">
                        {t("headingPre")} <span className="text-mambo-gold">{t("headingAccent")}</span>
                    </h2>
                    <p className="mx-auto mt-3 max-w-2xl text-sm text-gray-400 md:text-base">
                        {t("subheading")}
                    </p>
                </motion.div>

                <CountdownHero release={next} />

                <ResponsiveTimeline items={items} />

                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                    className="mt-10 text-center md:mt-14"
                >
                    <Link
                        href="/register"
                        className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-mambo-gold to-amber-500 px-6 py-3 text-sm font-bold text-black shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all hover:from-amber-500 hover:to-mambo-gold hover:shadow-[0_0_30px_rgba(212,175,55,0.5)] md:px-8 md:py-4 md:text-base"
                    >
                        <FaCalendarAlt /> {t("cta")}
                    </Link>
                    <p className="mt-3 text-xs text-gray-500">{t("ctaHint")}</p>
                </motion.div>
            </div>
        </section>
    );
}

// ============ COURSES PAGE BUTTON + POPOVER/MODAL ============
export function ReleaseScheduleButton() {
    const t = useTranslations("landing.releases");
    const mode = useLayoutMode();
    const [open, setOpen] = useState(false);
    const [hovered, setHovered] = useState(false);
    const isMobile = mode !== "desktop";
    const items = useReleaseSchedule();
    const next = useNextRelease(items);
    const target = useMemo(() => parseDate(next.date), [next.date]);
    const { days } = useCountdown(target);

    const buttonRef = useRef<HTMLButtonElement>(null);
    const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [mounted, setMounted] = useState(false);
    const [anchor, setAnchor] = useState<{ top: number; right: number } | null>(null);

    useEffect(() => setMounted(true), []);

    const cancelClose = () => {
        if (closeTimer.current) {
            clearTimeout(closeTimer.current);
            closeTimer.current = null;
        }
    };
    const scheduleClose = () => {
        cancelClose();
        closeTimer.current = setTimeout(() => setHovered(false), 120);
    };

    const updateAnchor = () => {
        const el = buttonRef.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        setAnchor({ top: r.bottom + 10, right: Math.max(8, window.innerWidth - r.right) });
    };

    useLayoutEffect(() => {
        if (!hovered || isMobile) return;
        updateAnchor();
        const onScrollOrResize = () => updateAnchor();
        window.addEventListener("scroll", onScrollOrResize, true);
        window.addEventListener("resize", onScrollOrResize);
        return () => {
            window.removeEventListener("scroll", onScrollOrResize, true);
            window.removeEventListener("resize", onScrollOrResize);
        };
    }, [hovered, isMobile]);

    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open]);

    useEffect(() => {
        if (!open || !isMobile) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = prev;
        };
    }, [open, isMobile]);

    useEffect(() => () => cancelClose(), []);

    const showPopover = !isMobile && hovered && anchor !== null;

    const popoverNode =
        mounted && showPopover
            ? createPortal(
                  <AnimatePresence>
                      <motion.div
                          key="release-popover"
                          initial={{ opacity: 0, y: 8, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.98 }}
                          transition={{ duration: 0.18 }}
                          style={{ position: "fixed", top: anchor!.top, right: anchor!.right, zIndex: 100 }}
                          className="w-[min(92vw,560px)] origin-top-right"
                          onMouseEnter={cancelClose}
                          onMouseLeave={scheduleClose}
                      >
                          <div className="overflow-hidden rounded-2xl border border-amber-300/30 bg-black/90 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.7),0_0_50px_rgba(252,226,5,0.15)] backdrop-blur-xl">
                              <div className="mb-4 text-center">
                                  <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/40 bg-amber-300/10 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-amber-200">
                                      <HiSparkles /> {t("upcomingDrops")}
                                  </div>
                                  <h4 className="mt-2 text-lg font-bold text-white">
                                      {t("nextPrefix")} {next.title}
                                  </h4>
                                  <p className="text-xs text-gray-400">
                                      {t("inDays", { days })} • {fmtFull(target)}
                                  </p>
                              </div>
                              <div className="-mr-1 max-h-[60vh] space-y-2 overflow-y-auto pr-1">
                                  {items.map((item, i) => (
                                      <PopoverRow key={i} item={item} isNext={item.date === next.date} />
                                  ))}
                              </div>
                          </div>
                      </motion.div>
                  </AnimatePresence>,
                  document.body
              )
            : null;

    return (
        <>
            <button
                ref={buttonRef}
                type="button"
                onClick={() => isMobile && setOpen(true)}
                onMouseEnter={() => {
                    if (isMobile) return;
                    cancelClose();
                    setHovered(true);
                }}
                onMouseLeave={() => {
                    if (isMobile) return;
                    scheduleClose();
                }}
                className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full border border-amber-300/40 bg-gradient-to-r from-amber-500/20 via-amber-400/10 to-amber-500/20 px-3.5 py-2 text-[11px] font-black uppercase tracking-wider text-amber-200 shadow-[0_0_20px_rgba(252,226,5,0.2)] transition-all hover:border-amber-300/80 hover:text-amber-100 hover:shadow-[0_0_30px_rgba(252,226,5,0.4)] sm:px-4 sm:text-xs"
            >
                <HiSparkles className="animate-pulse" />
                <span className="whitespace-nowrap">{t("eyebrow")}</span>
                <span className="hidden rounded-full bg-amber-300/30 px-2 py-0.5 text-[9px] tabular-nums text-amber-100 md:inline">
                    {t("nextInDaysShort", { days })}
                </span>
            </button>

            {popoverNode}

            <MobileModal open={isMobile && open} onClose={() => setOpen(false)} next={next} items={items} />
        </>
    );
}

function PopoverRow({ item, isNext }: { item: ReleaseItem; isNext: boolean }) {
    const t = useTranslations("landing.releases");
    const labels = useLevelLabels();
    const style = LEVEL_STYLES[item.level];
    const date = parseDate(item.date);
    return (
        <div
            className={`flex items-center gap-3 rounded-xl border ${style.border} bg-gradient-to-r ${style.bg} p-2.5 ${
                isNext ? "ring-1 ring-amber-300/50" : ""
            }`}
        >
            <div className="flex w-14 flex-col items-center">
                <div className={`h-2.5 w-2.5 rounded-full ${style.dot} ${style.dotGlow}`} />
                <span className="mt-1 text-[9px] font-black uppercase tracking-wider text-amber-300">{fmtShort(date)}</span>
            </div>
            <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1">
                    <span className={`rounded-full bg-black/50 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider ${style.text}`}>
                        {labels[item.level]}
                    </span>
                    <span className="rounded-full bg-black/50 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-gray-300">
                        {item.type === "course" ? t("typeCourse") : t("typeChoreo")}
                    </span>
                    {item.featured && <FaStar className="text-[9px] text-amber-300" />}
                </div>
                <div className="mt-0.5 truncate text-sm font-bold text-white">{item.title}</div>
                {item.artist && <div className="truncate text-[11px] italic text-gray-400">{item.artist}</div>}
            </div>
        </div>
    );
}

function MobileModal({ open, onClose, next, items }: { open: boolean; onClose: () => void; next: ReleaseItem; items: ReleaseItem[] }) {
    const t = useTranslations("landing.releases");
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    const mode = useLayoutMode();
    const target = useMemo(() => parseDate(next.date), [next.date]);
    const { days, hours, minutes, seconds, ready } = useCountdown(target);

    if (!mounted) return null;

    const content = (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-end justify-center bg-black/75 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 32, stiffness: 280 }}
                        onClick={(e) => e.stopPropagation()}
                        className="relative h-[92vh] w-full max-w-2xl overflow-hidden rounded-t-3xl border-t border-amber-300/30 bg-gradient-to-b from-black via-black to-zinc-950 shadow-[0_-10px_60px_rgba(252,226,5,0.2)]"
                    >
                        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-black/80 px-4 py-3 backdrop-blur-xl">
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-amber-300">
                                <HiSparkles className="animate-pulse" /> {t("eyebrow")}
                            </div>
                            <button
                                onClick={onClose}
                                className="rounded-full border border-white/10 bg-white/5 p-2 text-white transition-colors hover:bg-white/10"
                                aria-label={t("close")}
                            >
                                <FaTimes className="text-xs" />
                            </button>
                        </div>

                        <div className="h-[calc(92vh-52px)] overflow-y-auto px-4 py-4">
                            <div className="mb-4 rounded-2xl border border-amber-300/30 bg-gradient-to-br from-amber-500/10 via-black/40 to-black/60 p-4 text-center">
                                <div className="text-[9px] font-black uppercase tracking-widest text-amber-300">
                                    {t("nextDrop")} — {fmtFull(target)}
                                </div>
                                <h3 className="mt-1 text-lg font-bold text-white">
                                    {next.title}
                                </h3>
                                {next.artist && <p className="text-xs text-gray-400">{next.artist}</p>}
                                <div className="mx-auto mt-3 grid max-w-sm grid-cols-4 gap-1.5">
                                    {[
                                        { v: days, l: t("countdownDShort") },
                                        { v: hours, l: t("countdownHShort") },
                                        { v: minutes, l: t("countdownMShort") },
                                        { v: seconds, l: t("countdownSShort") },
                                    ].map((tx, i) => (
                                        <div key={i} className="rounded-lg border border-amber-300/20 bg-black/60 py-2">
                                            <div className="font-mono text-lg font-black tabular-nums text-amber-200">
                                                {ready ? String(tx.v).padStart(2, "0") : "--"}
                                            </div>
                                            <div className="text-[8px] uppercase tracking-widest text-gray-500">{tx.l}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {mode === "landscape" ? (
                                <LandscapeCarousel items={items} nextId={next.date} />
                            ) : (
                                <VerticalTimeline items={items} nextId={next.date} />
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );

    return createPortal(content, document.body);
}
