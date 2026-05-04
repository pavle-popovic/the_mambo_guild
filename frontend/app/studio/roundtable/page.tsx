"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Radio, Calendar, Play, Users, Crown, Lock,
  ArrowLeft, ExternalLink, Tag, X, CalendarPlus, Download
} from "lucide-react";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import AuthPromptModal from "@/components/AuthPromptModal";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useTranslations } from "@/i18n/useTranslations";
import { buildGoogleCalendarUrl, buildIcsBlobUrl } from "@/lib/calendarLinks";

interface MeetingConfig {
  meeting_url: string | null;
  meeting_notes: string | null;
  meeting_starts_at: string | null;
  meeting_day_of_week: number;
  meeting_hour_utc: number;
  meeting_minute_utc: number;
  updated_at: string | null;
}

interface WeeklyArchive {
  id: string;
  title: string;
  description: string | null;
  recorded_at: string;
  duration_minutes: number | null;
  topics: string[];
  youtube_url: string | null;
  thumbnail_url: string | null;
}

function getYouTubeId(url: string): string | null {
  const m = url.match(/(?:v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

// Locked Page Component for non-Guild Masters
function LockedPage({ user }: { user: any }) {
  const t = useTranslations("roundtable");
  return (
    <div className="min-h-screen bg-mambo-dark">
      <NavBar user={user} />
      <main className="pt-32 pb-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-500/20 to-yellow-500/20 border border-amber-400/30 flex items-center justify-center mx-auto mb-6">
              <Lock size={40} className="text-amber-400" />
            </div>

            <h1 className="text-4xl font-bold text-white mb-4">
              {t("lockedTitle")}
            </h1>

            <p className="text-lg text-gray-400 mb-8 max-w-md mx-auto">
              {t("lockedSubtitle")}
            </p>

            <div className="space-y-4 text-left max-w-md mx-auto mb-6">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-800/50 border border-gray-700">
                <Radio size={20} className="text-red-400" />
                <span className="text-gray-300">{t("perk1")}</span>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-800/50 border border-gray-700">
                <Play size={20} className="text-cyan-400" />
                <span className="text-gray-300">{t("perk2")}</span>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-800/50 border border-gray-700">
                <Users size={20} className="text-purple-400" />
                <span className="text-gray-300">{t("perk3")}</span>
              </div>
            </div>

            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-bold text-lg hover:from-amber-400 hover:to-yellow-400 transition-all shadow-lg shadow-amber-500/25"
            >
              <Crown size={20} />
              {t("upgradeCta")}
            </Link>

            <Link
              href="/studio"
              className="block mt-6 text-gray-400 hover:text-white transition-colors"
            >
              ← {t("backToStudio")}
            </Link>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function RoundtablePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const t = useTranslations("roundtable");
  const isGuildMaster = user?.tier?.toLowerCase() === "performer";
  // TEMP 2026-05-05: bonus Live Masterclass open to Advanced + trial members
  // (trial users carry tier="advanced"). REVERT on or after 2026-05-06 18:00 UTC,
  // before the next Performer-only Roundtable on 2026-05-13. To revert: delete
  // canAccessRoundtable and replace its three call-sites with isGuildMaster.
  const canAccessRoundtable =
    isGuildMaster || user?.tier?.toLowerCase() === "advanced";

  const [meetingConfig, setMeetingConfig] = useState<MeetingConfig | null>(null);
  const [archives, setArchives] = useState<WeeklyArchive[]>([]);
  const [selectedArchive, setSelectedArchive] = useState<WeeklyArchive | null>(null);
  const [signedVideoUrl, setSignedVideoUrl] = useState<string | null>(null);
  const [youtubeEmbedUrl, setYoutubeEmbedUrl] = useState<string | null>(null);
  const [isLoadingArchives, setIsLoadingArchives] = useState(true);
  const [isLoadingVideo, setIsLoadingVideo] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const [, setIsPlaying] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login?redirect=/studio/roundtable");
    }
  }, [user, loading, router]);

  // Fetch meeting config and archives
  useEffect(() => {
    if (!user || !canAccessRoundtable) return;

    const fetchData = async () => {
      try {
        const [configData, archivesData] = await Promise.all([
          apiClient.getWeeklyMeetingConfig(),
          apiClient.getWeeklyArchives(),
        ]);
        setMeetingConfig(configData);
        setArchives(archivesData);
        // Admin picks an explicit one-off datetime in /admin/settings. If they
        // haven't set one, no countdown — the UI shows "Date TBA" instead.
        if (configData.meeting_starts_at) {
          const target = new Date(configData.meeting_starts_at);
          const secs = Math.floor((target.getTime() - Date.now()) / 1000);
          setCountdown(secs > 0 ? secs : 0);
        } else {
          setCountdown(null);
        }
      } catch (error) {
        console.error("Failed to fetch roundtable data:", error);
      } finally {
        setIsLoadingArchives(false);
      }
    };

    fetchData();
  }, [user, canAccessRoundtable]);

  // Countdown timer
  useEffect(() => {
    if (countdown === null || countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  // Select archive for playback
  const handleSelectArchive = async (archive: WeeklyArchive) => {
    setSelectedArchive(archive);
    setSignedVideoUrl(null);
    setYoutubeEmbedUrl(null);

    // YouTube-backed archive: embed directly
    if (archive.youtube_url) {
      const ytId = getYouTubeId(archive.youtube_url);
      if (ytId) {
        setYoutubeEmbedUrl(`https://www.youtube.com/embed/${ytId}?autoplay=1`);
        return;
      }
    }

    // R2-backed archive: get signed URL
    setIsLoadingVideo(true);
    try {
      const { url } = await apiClient.getArchiveSignedUrl(archive.id);
      setSignedVideoUrl(url);
    } catch (error) {
      console.error("Failed to get signed URL:", error);
    } finally {
      setIsLoadingVideo(false);
    }
  };

  const formatCountdown = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (days > 0) return `${days}${t("unitDay")} ${hours}${t("unitHour")} ${mins}${t("unitMinute")}`;
    if (hours > 0) return `${hours}${t("unitHour")} ${mins}${t("unitMinute")} ${secs}${t("unitSecond")}`;
    return `${mins}${t("unitMinute")} ${secs}${t("unitSecond")}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-mambo-dark flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-mambo-gold border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) return null;

  // Rookies (and any other tier that doesn't qualify) get the subscribe
  // modal instead of the static LockedPage. Same pattern as lesson/[id]:
  // it's a hard interrupt with a "View Pricing" CTA going to /pricing,
  // and "Back" routes them out of the gated area.
  if (!canAccessRoundtable) {
    return (
      <AuthPromptModal
        isOpen={true}
        onClose={() => router.push("/studio")}
        type="subscribe"
        courseTitle="The Roundtable: weekly live calls + masterclass archive"
      />
    );
  }

  return (
    <div className="min-h-screen bg-mambo-dark">
      <NavBar user={user} />

      <main className="pt-32 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Back Link */}
          <Link
            href="/studio"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft size={16} />
            <span>{t("backToStudio")}</span>
          </Link>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center">
                <Radio size={28} className="text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white">{t("pageTitle")}</h1>
                <p className="text-gray-400">{t("pageSubtitle")}</p>
              </div>
            </div>
          </motion.div>

          {/* Next Meeting Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-12"
          >
            <div className="rounded-2xl p-6 border border-amber-400/30 bg-gradient-to-br from-amber-500/10 to-yellow-500/10">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                  <span className="text-sm font-bold text-amber-400 uppercase tracking-wide">
                    {t("weeklyVipSession")}
                  </span>
                  <h2 className="text-2xl font-bold text-white mt-1 mb-2">
                    {t("nextMeeting")}
                  </h2>
                  <div className="flex items-center gap-1.5 text-sm text-gray-400">
                    <Calendar size={14} />
                    <span>
                      {meetingConfig?.meeting_starts_at
                        ? `${new Date(meetingConfig.meeting_starts_at).toLocaleString("en-GB", {
                            weekday: "long",
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                            timeZone: "UTC",
                          })} UTC`
                        : "Date TBA"}
                    </span>
                  </div>
                  {meetingConfig?.meeting_notes && (
                    <p className="text-gray-300 text-sm mt-3">
                      {meetingConfig.meeting_notes}
                    </p>
                  )}
                </div>

                <div className="flex flex-col items-start md:items-end gap-3">
                  {countdown !== null && countdown > 0 && (
                    <div className="text-center">
                      <div className="text-3xl font-mono font-bold text-amber-400 mb-1">
                        {formatCountdown(countdown)}
                      </div>
                      <span className="text-xs text-gray-500 uppercase tracking-wide">
                        {t("untilNextSession")}
                      </span>
                    </div>
                  )}
                  <a
                    href={meetingConfig?.meeting_url || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) =>
                      !meetingConfig?.meeting_url && e.preventDefault()
                    }
                    className={cn(
                      "flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all",
                      meetingConfig?.meeting_url
                        ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-black hover:from-amber-400 hover:to-yellow-400 shadow-lg shadow-amber-500/25"
                        : "bg-gray-700/50 text-gray-500 cursor-not-allowed"
                    )}
                  >
                    <ExternalLink size={18} />
                    {meetingConfig?.meeting_url ? t("joinMeeting") : t("linkComingSoon")}
                  </a>
                  {meetingConfig?.meeting_starts_at && (
                    <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                      <a
                        href={buildGoogleCalendarUrl({
                          title: "Mambo Guild Roundtable",
                          startUtcIso: meetingConfig.meeting_starts_at,
                          description:
                            (meetingConfig.meeting_notes ? meetingConfig.meeting_notes + "\n\n" : "") +
                            (meetingConfig.meeting_url ? `Join: ${meetingConfig.meeting_url}` : ""),
                          location: meetingConfig.meeting_url || "",
                        })}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-white/15 bg-white/5 text-white hover:bg-white/10 transition-colors"
                      >
                        <CalendarPlus size={16} />
                        Add to Google Calendar
                      </a>
                      <a
                        href={buildIcsBlobUrl({
                          title: "Mambo Guild Roundtable",
                          startUtcIso: meetingConfig.meeting_starts_at,
                          description:
                            (meetingConfig.meeting_notes ? meetingConfig.meeting_notes + "\n\n" : "") +
                            (meetingConfig.meeting_url ? `Join: ${meetingConfig.meeting_url}` : ""),
                          location: meetingConfig.meeting_url || "",
                        })}
                        download="mambo-guild-roundtable.ics"
                        className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-white/15 bg-white/5 text-white hover:bg-white/10 transition-colors"
                      >
                        <Download size={16} />
                        Apple / Outlook (.ics)
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Video Player (when archive selected) */}
          <AnimatePresence>
            {selectedArchive && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-12"
              >
                <div className="rounded-2xl bg-gray-900 border border-gray-700 overflow-hidden">
                  {/* Video Container */}
                  <div className="relative aspect-video bg-black">
                    {isLoadingVideo ? (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="animate-spin w-12 h-12 border-2 border-amber-400 border-t-transparent rounded-full" />
                      </div>
                    ) : youtubeEmbedUrl ? (
                      <iframe
                        src={youtubeEmbedUrl}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : signedVideoUrl ? (
                      <video
                        ref={videoRef}
                        controls
                        controlsList="nodownload"
                        className="w-full h-full"
                        onPlay={() => setIsPlaying(true)}
                        onPause={() => setIsPlaying(false)}
                      >
                        <source src={signedVideoUrl} type="video/mp4" />
                        {t("videoFallback")}
                      </video>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                        {t("videoLoadFailed")}
                      </div>
                    )}
                  </div>

                  {/* Video Info */}
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-bold text-white mb-2">
                          {selectedArchive.title}
                        </h3>
                        {selectedArchive.description && (
                          <p className="text-gray-400 text-sm mb-3">
                            {selectedArchive.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>
                            {new Date(selectedArchive.recorded_at).toLocaleDateString(undefined, {
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                          {selectedArchive.duration_minutes && (
                            <>
                              <span>•</span>
                              <span>{selectedArchive.duration_minutes} {t("mins")}</span>
                            </>
                          )}
                        </div>
                        {selectedArchive.topics.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {selectedArchive.topics.map((topic) => (
                              <span
                                key={topic}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-800 border border-gray-700 text-xs text-gray-400"
                              >
                                <Tag size={10} />
                                {topic}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          setSelectedArchive(null);
                          setSignedVideoUrl(null);
                          setYoutubeEmbedUrl(null);
                        }}
                        className="p-1.5 text-gray-400 hover:text-white transition-colors flex-shrink-0"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Archives Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold text-white mb-6">{t("pastRecordings")}</h2>

            {isLoadingArchives ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="rounded-xl bg-gray-800/50 border border-gray-700 animate-pulse"
                  >
                    <div className="aspect-video bg-gray-700 rounded-t-xl" />
                    <div className="p-4">
                      <div className="h-5 bg-gray-700 rounded w-3/4 mb-2" />
                      <div className="h-4 bg-gray-700 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : archives.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Radio size={48} className="mx-auto mb-4 opacity-50" />
                <p>{t("noRecordingsTitle")}</p>
                <p className="text-sm">{t("noRecordingsBody")}</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {archives.map((archive) => {
                  const ytId = archive.youtube_url
                    ? getYouTubeId(archive.youtube_url)
                    : null;
                  const thumbSrc = ytId
                    ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`
                    : archive.thumbnail_url;

                  return (
                    <motion.button
                      key={archive.id}
                      onClick={() => handleSelectArchive(archive)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={cn(
                        "text-left rounded-xl border overflow-hidden transition-all",
                        selectedArchive?.id === archive.id
                          ? "bg-gradient-to-br from-red-500/20 to-orange-500/20 border-red-400/50"
                          : "bg-gray-800/50 border-gray-700 hover:border-gray-600"
                      )}
                    >
                      {/* Thumbnail */}
                      <div className="relative aspect-video bg-gray-900">
                        {thumbSrc ? (
                          <img
                            src={thumbSrc}
                            alt={archive.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-red-500/20 to-orange-500/20">
                            <Radio size={32} className="text-red-400/50" />
                          </div>
                        )}

                        {/* Duration Badge */}
                        {archive.duration_minutes && (
                          <div className="absolute bottom-2 right-2 px-2 py-1 rounded bg-black/80 text-xs font-mono text-white">
                            {archive.duration_minutes} {t("min")}
                          </div>
                        )}

                        {/* YouTube badge */}
                        {ytId && (
                          <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-red-600/90 text-[10px] font-bold text-white uppercase tracking-wide">
                            YouTube
                          </div>
                        )}

                        {/* Play Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity">
                          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                            <Play size={32} className="text-white ml-1" />
                          </div>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="p-4">
                        <h3 className="font-semibold text-white mb-1 line-clamp-1">
                          {archive.title}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {new Date(archive.recorded_at).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                        {archive.topics.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {archive.topics.slice(0, 3).map((topic) => (
                              <span
                                key={topic}
                                className="px-1.5 py-0.5 rounded bg-gray-700/50 text-[10px] text-gray-400"
                              >
                                {topic}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            )}
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
