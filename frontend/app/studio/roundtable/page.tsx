"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Radio, Calendar, Clock, Play, Pause, Users, Crown, Lock,
  ArrowLeft, ExternalLink, Volume2, VolumeX, Maximize,
  ChevronRight, Tag
} from "lucide-react";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api";
import { cn } from "@/lib/utils";

interface LiveCallStatus {
  state: "no_upcoming" | "upcoming" | "live";
  call: {
    id: string;
    title: string;
    description: string | null;
    scheduled_at: string;
    duration_minutes: number;
    zoom_link: string | null;
  } | null;
  countdown_seconds: number | null;
  message: string;
}

interface WeeklyArchive {
  id: string;
  title: string;
  description: string | null;
  recorded_at: string;
  duration_minutes: number | null;
  topics: string[];
  thumbnail_url: string | null;
}

// Locked Page Component for non-Guild Masters
function LockedPage({ user }: { user: any }) {
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
              The Roundtable is for Guild Masters
            </h1>

            <p className="text-lg text-gray-400 mb-8 max-w-md mx-auto">
              Join our exclusive weekly live sessions, access the full archive of past discussions, and connect directly with instructors.
            </p>

            <div className="space-y-4 text-left max-w-md mx-auto mb-8">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-800/50 border border-gray-700">
                <Radio size={20} className="text-red-400" />
                <span className="text-gray-300">Weekly live Q&A sessions</span>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-800/50 border border-gray-700">
                <Play size={20} className="text-cyan-400" />
                <span className="text-gray-300">Full archive of past recordings</span>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-800/50 border border-gray-700">
                <Users size={20} className="text-purple-400" />
                <span className="text-gray-300">Direct instructor interaction</span>
              </div>
            </div>

            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-bold text-lg hover:from-amber-400 hover:to-yellow-400 transition-all shadow-lg shadow-amber-500/25"
            >
              <Crown size={20} />
              Upgrade to Guild Master
            </Link>

            <Link
              href="/studio"
              className="block mt-6 text-gray-400 hover:text-white transition-colors"
            >
              ← Back to Studio
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
  const isGuildMaster = user?.tier?.toLowerCase() === "performer";

  const [liveStatus, setLiveStatus] = useState<LiveCallStatus | null>(null);
  const [archives, setArchives] = useState<WeeklyArchive[]>([]);
  const [selectedArchive, setSelectedArchive] = useState<WeeklyArchive | null>(null);
  const [signedVideoUrl, setSignedVideoUrl] = useState<string | null>(null);
  const [isLoadingArchives, setIsLoadingArchives] = useState(true);
  const [isLoadingVideo, setIsLoadingVideo] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login?redirect=/studio/roundtable");
    }
  }, [user, loading, router]);

  // Fetch live status and archives
  useEffect(() => {
    if (!user || !isGuildMaster) return;

    const fetchData = async () => {
      try {
        // Fetch live call status
        const statusData = await apiClient.getLiveCallStatus();
        setLiveStatus(statusData);
        if (statusData.countdown_seconds) {
          setCountdown(statusData.countdown_seconds);
        }

        // Fetch archives
        const archivesData = await apiClient.getWeeklyArchives();
        setArchives(archivesData);
      } catch (error) {
        console.error("Failed to fetch roundtable data:", error);
      } finally {
        setIsLoadingArchives(false);
      }
    };

    fetchData();
  }, [user, isGuildMaster]);

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

  // Load signed video URL when archive is selected
  const handleSelectArchive = async (archive: WeeklyArchive) => {
    setSelectedArchive(archive);
    setIsLoadingVideo(true);
    setSignedVideoUrl(null);

    try {
      const { url } = await apiClient.getArchiveSignedUrl(archive.id);
      setSignedVideoUrl(url);
    } catch (error) {
      console.error("Failed to get signed URL:", error);
    } finally {
      setIsLoadingVideo(false);
    }
  };

  // Video controls
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatCountdown = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (days > 0) {
      return `${days}d ${hours}h ${mins}m`;
    }
    if (hours > 0) {
      return `${hours}h ${mins}m ${secs}s`;
    }
    return `${mins}m ${secs}s`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-mambo-dark flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-mambo-gold border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Show locked page for non-Guild Masters
  if (!isGuildMaster) {
    return <LockedPage user={user} />;
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
            <span>Back to Studio</span>
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
                <h1 className="text-4xl font-bold text-white">The Roundtable</h1>
                <p className="text-gray-400">Live calls & archives</p>
              </div>
            </div>
          </motion.div>

          {/* Live Call Status Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-12"
          >
            <div className={cn(
              "rounded-2xl p-6 border",
              liveStatus?.state === "live"
                ? "bg-gradient-to-br from-red-500/20 to-orange-500/20 border-red-400/30"
                : liveStatus?.state === "upcoming"
                  ? "bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border-amber-400/30"
                  : "bg-gray-800/50 border-gray-700"
            )}>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    {liveStatus?.state === "live" ? (
                      <>
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                        </span>
                        <span className="text-sm font-bold text-red-400 uppercase tracking-wide">Live Now</span>
                      </>
                    ) : liveStatus?.state === "upcoming" ? (
                      <span className="text-sm font-bold text-amber-400 uppercase tracking-wide">Next Session</span>
                    ) : (
                      <span className="text-sm font-bold text-gray-500 uppercase tracking-wide">No Upcoming Session</span>
                    )}
                  </div>

                  {liveStatus?.call ? (
                    <>
                      <h2 className="text-2xl font-bold text-white mb-1">{liveStatus.call.title}</h2>
                      {liveStatus.call.description && (
                        <p className="text-gray-400 mb-3">{liveStatus.call.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={14} />
                          <span>{new Date(liveStatus.call.scheduled_at).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock size={14} />
                          <span>{new Date(liveStatus.call.scheduled_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <p className="text-gray-400">Check back soon for the next scheduled session.</p>
                  )}
                </div>

                <div className="flex flex-col items-center gap-2">
                  {liveStatus?.state === "live" && liveStatus?.call?.zoom_link ? (
                    <a
                      href={liveStatus.call.zoom_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold hover:from-red-400 hover:to-orange-400 transition-all shadow-lg shadow-red-500/25"
                    >
                      <ExternalLink size={18} />
                      Join Zoom Room
                    </a>
                  ) : liveStatus?.state === "upcoming" && countdown !== null ? (
                    <div className="text-center">
                      <div className="text-3xl font-mono font-bold text-amber-400 mb-1">
                        {formatCountdown(countdown)}
                      </div>
                      <span className="text-xs text-gray-500 uppercase tracking-wide">until start</span>
                    </div>
                  ) : null}
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
                        <div className="animate-spin w-12 h-12 border-3 border-mambo-gold border-t-transparent rounded-full" />
                      </div>
                    ) : signedVideoUrl ? (
                      <video
                        ref={videoRef}
                        controls
                        controlsList="nodownload"
                        poster="/images/roundtable-thumbnail.jpg"
                        className="w-full h-full"
                        onTimeUpdate={handleTimeUpdate}
                        onLoadedMetadata={handleLoadedMetadata}
                        onPlay={() => setIsPlaying(true)}
                        onPause={() => setIsPlaying(false)}
                      >
                        <source src={signedVideoUrl} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                        Failed to load video
                      </div>
                    )}
                  </div>

                  {/* Video Info */}
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-bold text-white mb-2">{selectedArchive.title}</h3>
                        {selectedArchive.description && (
                          <p className="text-gray-400 text-sm mb-3">{selectedArchive.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>{new Date(selectedArchive.recorded_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
                          <span>•</span>
                          <span>{selectedArchive.duration_minutes ?? '--'} mins</span>
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
                        onClick={() => setSelectedArchive(null)}
                        className="text-gray-400 hover:text-white transition-colors text-sm"
                      >
                        Close
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
            <h2 className="text-2xl font-bold text-white mb-6">Past Recordings</h2>

            {isLoadingArchives ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="rounded-xl bg-gray-800/50 border border-gray-700 animate-pulse">
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
                <p>No recordings available yet.</p>
                <p className="text-sm">Check back after the next live session!</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {archives.map((archive) => (
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
                      {archive.thumbnail_url ? (
                        <img
                          src={archive.thumbnail_url}
                          alt={archive.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-red-500/20 to-orange-500/20">
                          <Radio size={32} className="text-red-400/50" />
                        </div>
                      )}

                      {/* Duration Badge */}
                      <div className="absolute bottom-2 right-2 px-2 py-1 rounded bg-black/80 text-xs font-mono text-white">
                        {archive.duration_minutes ?? '--'} min
                      </div>

                      {/* Play Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity">
                        <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                          <Play size={32} className="text-white ml-1" />
                        </div>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-4">
                      <h3 className="font-semibold text-white mb-1 line-clamp-1">{archive.title}</h3>
                      <p className="text-sm text-gray-500">
                        {new Date(archive.recorded_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
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
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
