"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Video, Calendar, Clock, Play, Lock, Crown, Music, Mic } from "lucide-react";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api";
import MuxVideoPlayer from "@/components/MuxVideoPlayer";
import DJBoothMixer from "@/components/DJBoothMixer";
import { GuildMasterTag } from "@/components/ui/GuildMasterBadge";
import { cn } from "@/lib/utils";

// Types
interface LiveCall {
  id: string;
  title: string;
  description: string | null;
  scheduled_at: string;
  duration_minutes: number;
  status: string;
  zoom_link: string | null;
  zoom_meeting_id: string | null;
  recording_mux_playback_id: string | null;
  recording_thumbnail_url: string | null;
}

interface LiveCallStatus {
  state: "no_upcoming" | "upcoming" | "live";
  call: LiveCall | null;
  countdown_seconds: number | null;
  message: string;
}

interface PastRecording {
  id: string;
  title: string;
  description: string | null;
  recorded_at: string;
  duration_minutes: number;
  mux_playback_id: string;
  thumbnail_url: string | null;
}

interface CoachingStatus {
  can_submit: boolean;
  current_submission: CoachingSubmission | null;
  next_credit_date: string | null;
  message: string;
}

interface CoachingSubmission {
  id: string;
  user_id: string;
  video_mux_playback_id: string;
  video_duration_seconds: number | null;
  specific_question: string | null;
  allow_social_share: boolean;
  status: string;
  feedback_video_url: string | null;
  feedback_notes: string | null;
  reviewed_at: string | null;
  submission_month: number;
  submission_year: number;
  submitted_at: string;
}

interface DJBoothTrack {
  id: string;
  title: string;
  artist: string;
  album: string | null;
  year: number | null;
  duration_seconds: number;
  bpm: number | null;
  cover_image_url: string | null;
  full_mix_url: string;
  percussion_url: string;
  piano_bass_url: string;
  vocals_brass_url: string;
}

type Tab = "live" | "coaching" | "mixer";

export default function GuildMasterPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("live");
  
  // Live call state
  const [liveStatus, setLiveStatus] = useState<LiveCallStatus | null>(null);
  const [pastRecordings, setPastRecordings] = useState<PastRecording[]>([]);
  const [loadingLive, setLoadingLive] = useState(true);
  const [countdown, setCountdown] = useState<number | null>(null);
  
  // Selected recording for playback
  const [selectedRecording, setSelectedRecording] = useState<PastRecording | null>(null);

  // Coaching state
  const [coachingStatus, setCoachingStatus] = useState<CoachingStatus | null>(null);
  const [loadingCoaching, setLoadingCoaching] = useState(true);
  const [mySubmissions, setMySubmissions] = useState<CoachingSubmission[]>([]);
  
  // Coaching submission form
  const [specificQuestion, setSpecificQuestion] = useState("");
  const [allowSocialShare, setAllowSocialShare] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedVideo, setUploadedVideo] = useState<{
    playbackId: string;
    assetId: string;
    duration: number;
  } | null>(null);

  // DJ Booth state
  const [djTracks, setDjTracks] = useState<DJBoothTrack[]>([]);
  const [loadingDjTracks, setLoadingDjTracks] = useState(true);
  const [selectedDjTrack, setSelectedDjTrack] = useState<DJBoothTrack | null>(null);

  // Check if user is Guild Master
  const isGuildMaster = user?.tier?.toLowerCase() === "performer";

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }
    if (!authLoading && user && !isGuildMaster) {
      router.push("/pricing");
      return;
    }
    if (user && isGuildMaster) {
      loadLiveStatus();
      loadPastRecordings();
      loadCoachingStatus();
      loadMySubmissions();
      loadDjTracks();
    }
  }, [user, authLoading, isGuildMaster, router]);

  // Countdown timer
  useEffect(() => {
    if (countdown === null || countdown <= 0) return;
    
    const timer = setInterval(() => {
      setCountdown((prev) => (prev !== null && prev > 0 ? prev - 1 : null));
    }, 1000);
    
    return () => clearInterval(timer);
  }, [countdown]);

  const loadLiveStatus = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/premium/live/status`, {
        credentials: "include",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setLiveStatus(data);
        if (data.countdown_seconds) {
          setCountdown(data.countdown_seconds);
        }
      }
    } catch (error) {
      console.error("Failed to load live status:", error);
    } finally {
      setLoadingLive(false);
    }
  };

  const loadPastRecordings = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/premium/live/recordings`, {
        credentials: "include",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setPastRecordings(data);
      }
    } catch (error) {
      console.error("Failed to load recordings:", error);
    }
  };

  const loadCoachingStatus = async () => {
    setLoadingCoaching(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/premium/coaching/status`, {
        credentials: "include",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setCoachingStatus(data);
      }
    } catch (error) {
      console.error("Failed to load coaching status:", error);
    } finally {
      setLoadingCoaching(false);
    }
  };

  const loadMySubmissions = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/premium/coaching/my-submissions`, {
        credentials: "include",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setMySubmissions(data);
      }
    } catch (error) {
      console.error("Failed to load submissions:", error);
    }
  };

  const handleSubmitCoaching = async () => {
    if (!uploadedVideo) return;
    
    setIsSubmitting(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/premium/coaching/submit`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify({
          video_mux_playback_id: uploadedVideo.playbackId,
          video_mux_asset_id: uploadedVideo.assetId,
          video_duration_seconds: uploadedVideo.duration,
          specific_question: specificQuestion || null,
          allow_social_share: allowSocialShare,
        }),
      });
      
      if (response.ok) {
        // Reset form and reload status
        setUploadedVideo(null);
        setSpecificQuestion("");
        setAllowSocialShare(false);
        loadCoachingStatus();
        loadMySubmissions();
      } else {
        const error = await response.json();
        alert(error.detail || "Failed to submit video");
      }
    } catch (error) {
      console.error("Failed to submit:", error);
      alert("Failed to submit video. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const loadDjTracks = async () => {
    setLoadingDjTracks(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/premium/dj-booth/tracks`, {
        credentials: "include",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setDjTracks(data);
      }
    } catch (error) {
      console.error("Failed to load DJ tracks:", error);
    } finally {
      setLoadingDjTracks(false);
    }
  };

  const formatCountdown = (seconds: number): string => {
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

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-mambo-dark flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || !isGuildMaster) {
    return null;
  }

  return (
    <div className="min-h-screen bg-mambo-dark">
      <NavBar user={user} />

      <div className="max-w-6xl mx-auto px-6 py-8 pt-24">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
            <Crown className="w-6 h-6 text-black" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-white">Guild Master Hub</h1>
              <GuildMasterTag />
            </div>
            <p className="text-white/60">Exclusive features for top-tier members</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8 border-b border-white/10 pb-4">
          {[
            { id: "live" as Tab, label: "Weekly Live", icon: Video },
            { id: "coaching" as Tab, label: "1-on-1 Analysis", icon: Mic },
            { id: "mixer" as Tab, label: "DJ Booth", icon: Music },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all",
                activeTab === tab.id
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "live" && (
          <div className="space-y-8">
            {/* Live Status Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "relative rounded-2xl border p-6 overflow-hidden",
                liveStatus?.state === "live"
                  ? "border-red-500/50 bg-gradient-to-br from-red-500/10 to-red-900/20"
                  : liveStatus?.state === "upcoming"
                  ? "border-amber-500/50 bg-gradient-to-br from-amber-500/10 to-amber-900/20"
                  : "border-white/10 bg-mambo-panel"
              )}
            >
              {/* Live indicator */}
              {liveStatus?.state === "live" && (
                <div className="absolute top-4 right-4 flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
                  </span>
                  <span className="text-red-400 font-bold text-sm uppercase tracking-wider">LIVE NOW</span>
                </div>
              )}

              {loadingLive ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
                </div>
              ) : liveStatus?.state === "no_upcoming" ? (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-white/30 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No Upcoming Calls</h3>
                  <p className="text-white/50">Check back soon for the next Roundtable session!</p>
                </div>
              ) : (
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {liveStatus?.call?.title}
                    </h3>
                    {liveStatus?.call?.description && (
                      <p className="text-white/70 mb-4">{liveStatus.call.description}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-white/60">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        {liveStatus?.call && formatDate(liveStatus.call.scheduled_at)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        {liveStatus?.call?.duration_minutes} min
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-center gap-3">
                    {liveStatus?.state === "live" ? (
                      <a
                        href={liveStatus.call?.zoom_link || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white font-bold rounded-xl transition shadow-lg shadow-red-500/30 flex items-center gap-2"
                      >
                        <Video className="w-5 h-5" />
                        JOIN ZOOM ROOM
                      </a>
                    ) : liveStatus?.state === "upcoming" && countdown !== null ? (
                      <div className="text-center">
                        <div className="text-3xl font-bold text-amber-400 font-mono mb-1">
                          {formatCountdown(countdown)}
                        </div>
                        <div className="text-xs text-white/50 uppercase tracking-wider">until live</div>
                      </div>
                    ) : null}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Past Recordings (The Vault) */}
            <div>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-2xl">🏛️</span> The Vault
                <span className="text-sm font-normal text-white/50">Past Recordings</span>
              </h2>

              {pastRecordings.length === 0 ? (
                <div className="bg-mambo-panel border border-white/10 rounded-xl p-8 text-center">
                  <Video className="w-12 h-12 text-white/30 mx-auto mb-4" />
                  <p className="text-white/50">No recordings yet. Past sessions will appear here.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pastRecordings.map((recording) => (
                    <motion.div
                      key={recording.id}
                      whileHover={{ scale: 1.02 }}
                      className="bg-mambo-panel border border-white/10 rounded-xl overflow-hidden cursor-pointer group hover:border-amber-500/30 transition"
                      onClick={() => setSelectedRecording(recording)}
                    >
                      <div className="aspect-video relative bg-black/50">
                        {recording.thumbnail_url ? (
                          <img
                            src={recording.thumbnail_url}
                            alt={recording.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Video className="w-12 h-12 text-white/20" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                          <div className="w-14 h-14 rounded-full bg-amber-500 flex items-center justify-center">
                            <Play className="w-6 h-6 text-black ml-1" fill="currentColor" />
                          </div>
                        </div>
                      </div>
                      <div className="p-4">
                        <h4 className="font-semibold text-white truncate">{recording.title}</h4>
                        <p className="text-sm text-white/50">
                          {new Date(recording.recorded_at).toLocaleDateString()} • {recording.duration_minutes} min
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "coaching" && (
          <div className="space-y-8">
            {/* Status Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "rounded-2xl border p-6",
                coachingStatus?.can_submit
                  ? "border-green-500/30 bg-gradient-to-br from-green-500/10 to-green-900/10"
                  : "border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-amber-900/10"
              )}
            >
              {loadingCoaching ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
                </div>
              ) : coachingStatus?.can_submit ? (
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                      <Mic className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">1 Credit Available</h3>
                      <p className="text-sm text-white/60">{coachingStatus.message}</p>
                    </div>
                  </div>
                  
                  {/* Upload Section */}
                  <div className="bg-black/30 rounded-xl p-6 mb-4">
                    <h4 className="font-semibold text-white mb-4">Submit Your Video</h4>
                    
                    {/* Video Requirements */}
                    <div className="bg-white/5 rounded-lg p-4 mb-4 text-sm">
                      <p className="text-white/70 mb-2">📋 Requirements:</p>
                      <ul className="text-white/50 space-y-1 ml-4">
                        <li>• Max duration: 60 seconds</li>
                        <li>• Max file size: 50MB</li>
                        <li>• Formats: MP4, MOV</li>
                      </ul>
                    </div>

                    {/* Video Upload Area - Placeholder for MuxUploader */}
                    {!uploadedVideo ? (
                      <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:border-amber-500/50 transition cursor-pointer">
                        <Video className="w-12 h-12 text-white/30 mx-auto mb-3" />
                        <p className="text-white/50 mb-2">Drop your video here or click to upload</p>
                        <p className="text-xs text-white/30">Video upload will use Mux for processing</p>
                        {/* TODO: Integrate MuxUploader component here */}
                      </div>
                    ) : (
                      <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                          <Play className="w-5 h-5 text-green-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-green-400 font-medium">Video uploaded</p>
                          <p className="text-sm text-white/50">{uploadedVideo.duration}s duration</p>
                        </div>
                        <button
                          onClick={() => setUploadedVideo(null)}
                          className="text-white/50 hover:text-white"
                        >
                          Remove
                        </button>
                      </div>
                    )}

                    {/* Specific Question */}
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-white/70 mb-2">
                        What should I look at? (optional)
                      </label>
                      <input
                        type="text"
                        value={specificQuestion}
                        onChange={(e) => setSpecificQuestion(e.target.value.slice(0, 140))}
                        placeholder="e.g., 'My spin balance' or 'Timing on the break'"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                        maxLength={140}
                      />
                      <p className="text-xs text-white/40 mt-1 text-right">{specificQuestion.length}/140</p>
                    </div>

                    {/* Marketing Consent */}
                    <label className="flex items-start gap-3 mt-4 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={allowSocialShare}
                        onChange={(e) => setAllowSocialShare(e.target.checked)}
                        className="mt-1 w-4 h-4 rounded bg-white/10 border-white/20 text-amber-500 focus:ring-amber-500/50"
                      />
                      <div>
                        <span className="text-white/80">Allow The Mambo Guild to feature this review on social media</span>
                        <p className="text-xs text-amber-400 mt-0.5">+50 XP bonus if selected!</p>
                      </div>
                    </label>

                    {/* Submit Button */}
                    <button
                      onClick={handleSubmitCoaching}
                      disabled={!uploadedVideo || isSubmitting}
                      className={cn(
                        "w-full mt-6 py-3 rounded-lg font-bold transition flex items-center justify-center gap-2",
                        uploadedVideo && !isSubmitting
                          ? "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black"
                          : "bg-white/10 text-white/40 cursor-not-allowed"
                      )}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Mic className="w-5 h-5" />
                          Submit for Review
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : coachingStatus?.current_submission ? (
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center",
                      coachingStatus.current_submission.status === "completed"
                        ? "bg-green-500/20"
                        : "bg-amber-500/20"
                    )}>
                      {coachingStatus.current_submission.status === "completed" ? (
                        <Play className="w-5 h-5 text-green-400" />
                      ) : (
                        <Clock className="w-5 h-5 text-amber-400" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">
                        {coachingStatus.current_submission.status === "completed" 
                          ? "Your Analysis is Ready!" 
                          : "Pending Review"}
                      </h3>
                      <p className="text-sm text-white/60">{coachingStatus.message}</p>
                    </div>
                  </div>

                  {/* Current Submission Card */}
                  <div className="bg-black/30 rounded-xl p-4">
                    <div className="flex items-start gap-4">
                      <div className="w-32 aspect-video rounded-lg overflow-hidden bg-black/50 flex-shrink-0">
                        <img
                          src={`https://image.mux.com/${coachingStatus.current_submission.video_mux_playback_id}/thumbnail.jpg?width=200`}
                          alt="Your submission"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-white/80 text-sm mb-2">
                          {coachingStatus.current_submission.specific_question || "No specific question provided"}
                        </p>
                        <p className="text-xs text-white/40">
                          Submitted {new Date(coachingStatus.current_submission.submitted_at).toLocaleDateString()}
                        </p>
                        
                        {/* Feedback */}
                        {coachingStatus.current_submission.status === "completed" && coachingStatus.current_submission.feedback_video_url && (
                          <a
                            href={coachingStatus.current_submission.feedback_video_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded-lg transition text-sm font-medium"
                          >
                            <Play className="w-4 h-4" />
                            Watch Feedback
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </motion.div>

            {/* Past Submissions */}
            {mySubmissions.length > 1 && (
              <div>
                <h3 className="text-lg font-bold text-white mb-4">Past Submissions</h3>
                <div className="space-y-3">
                  {mySubmissions.slice(1).map((submission) => (
                    <div
                      key={submission.id}
                      className="bg-mambo-panel border border-white/10 rounded-xl p-4 flex items-center gap-4"
                    >
                      <div className="w-20 aspect-video rounded-lg overflow-hidden bg-black/50 flex-shrink-0">
                        <img
                          src={`https://image.mux.com/${submission.video_mux_playback_id}/thumbnail.jpg?width=120`}
                          alt="Submission"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-white/60 text-sm">
                          {new Date(submission.submitted_at).toLocaleDateString("en-US", {
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                        <p className={cn(
                          "text-xs font-medium",
                          submission.status === "completed" ? "text-green-400" : "text-amber-400"
                        )}>
                          {submission.status === "completed" ? "Reviewed" : "Pending"}
                        </p>
                      </div>
                      {submission.feedback_video_url && (
                        <a
                          href={submission.feedback_video_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white/70 rounded-lg transition text-sm"
                        >
                          View
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "mixer" && (
          <div className="space-y-6">
            {/* Selected Track Mixer */}
            {selectedDjTrack && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <DJBoothMixer
                  track={selectedDjTrack}
                  onClose={() => setSelectedDjTrack(null)}
                />
              </motion.div>
            )}

            {/* Track Selection */}
            <div>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Music className="w-5 h-5 text-amber-400" />
                Track Library
              </h2>

              {loadingDjTracks ? (
                <div className="bg-mambo-panel border border-white/10 rounded-xl p-8 text-center">
                  <div className="w-10 h-10 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mx-auto" />
                </div>
              ) : djTracks.length === 0 ? (
                <div className="bg-mambo-panel border border-white/10 rounded-xl p-8 text-center">
                  <Music className="w-12 h-12 text-white/30 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">Coming Soon!</h3>
                  <p className="text-white/50 max-w-md mx-auto">
                    Our DJ Booth tracks are being prepared. Classic salsa tracks with isolated stems will be available soon.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {djTracks.map((track) => (
                    <motion.div
                      key={track.id}
                      whileHover={{ scale: 1.02 }}
                      className={cn(
                        "bg-mambo-panel border rounded-xl overflow-hidden cursor-pointer transition-all",
                        selectedDjTrack?.id === track.id
                          ? "border-amber-500 shadow-lg shadow-amber-500/20"
                          : "border-white/10 hover:border-amber-500/30"
                      )}
                      onClick={() => setSelectedDjTrack(track)}
                    >
                      <div className="aspect-square relative bg-black/50">
                        {track.cover_image_url ? (
                          <img
                            src={track.cover_image_url}
                            alt={track.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-amber-900/50 to-black">
                            <Music className="w-16 h-16 text-amber-500/50" />
                          </div>
                        )}
                        {/* Play overlay */}
                        <div className={cn(
                          "absolute inset-0 flex items-center justify-center bg-black/50 transition-opacity",
                          selectedDjTrack?.id === track.id ? "opacity-100" : "opacity-0 hover:opacity-100"
                        )}>
                          <div className="w-16 h-16 rounded-full bg-amber-500 flex items-center justify-center shadow-lg">
                            <Play className="w-8 h-8 text-black ml-1" fill="currentColor" />
                          </div>
                        </div>
                        {/* Duration badge */}
                        <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/80 rounded text-xs text-white font-mono">
                          {Math.floor(track.duration_seconds / 60)}:{(track.duration_seconds % 60).toString().padStart(2, "0")}
                        </div>
                      </div>
                      <div className="p-4">
                        <h4 className="font-bold text-white truncate">{track.title}</h4>
                        <p className="text-sm text-white/60 truncate">{track.artist}</p>
                        <div className="flex items-center gap-2 mt-2">
                          {track.bpm && (
                            <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded">
                              {track.bpm} BPM
                            </span>
                          )}
                          {track.year && (
                            <span className="text-xs text-white/40">{track.year}</span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* How to Use */}
            <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl p-6">
              <h3 className="font-bold text-amber-300 mb-3">🎧 How to Use the Mambo Mixer</h3>
              <ul className="space-y-2 text-sm text-white/70">
                <li>• <strong>Faders:</strong> Adjust volume for each instrument stem</li>
                <li>• <strong>Mute (M):</strong> Silence a stem to practice without it</li>
                <li>• <strong>Solo (S):</strong> Listen to only that stem - great for hearing the clave pattern</li>
                <li>• <strong>Master:</strong> Control the full mix while stems are active</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Recording Playback Modal */}
      {selectedRecording && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90">
          <div className="relative w-full max-w-4xl">
            <button
              onClick={() => setSelectedRecording(null)}
              className="absolute -top-12 right-0 text-white/60 hover:text-white transition"
            >
              Close ×
            </button>
            <div className="bg-mambo-panel rounded-xl overflow-hidden">
              <MuxVideoPlayer
                playbackId={selectedRecording.mux_playback_id}
                metadata={{
                  video_title: selectedRecording.title,
                  video_id: selectedRecording.id,
                }}
              />
              <div className="p-4">
                <h3 className="text-lg font-bold text-white">{selectedRecording.title}</h3>
                {selectedRecording.description && (
                  <p className="text-white/60 text-sm mt-1">{selectedRecording.description}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
