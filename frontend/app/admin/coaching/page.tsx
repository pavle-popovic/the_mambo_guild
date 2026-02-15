"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Play, Clock, CheckCircle, ExternalLink, User } from "lucide-react";
import AdminSidebar from "@/components/AdminSidebar";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

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
  user_first_name: string;
  user_last_name: string;
  user_email: string;
  user_avatar_url: string | null;
}

export default function AdminCoachingPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [submissions, setSubmissions] = useState<CoachingSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<CoachingSubmission | null>(null);
  const [feedbackUrl, setFeedbackUrl] = useState("");
  const [feedbackNotes, setFeedbackNotes] = useState("");
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("pending");

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "admin")) {
      router.push("/login");
      return;
    }
    if (user) {
      loadSubmissions();
    }
  }, [user, authLoading, router, statusFilter]);

  const loadSubmissions = async () => {
    setLoading(true);
    try {
      const params = statusFilter ? `?status_filter=${statusFilter}` : "";
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/premium/admin/coaching${params}`,
        {
          credentials: "include",
        }
      );
      if (response.ok) {
        const data = await response.json();
        setSubmissions(data);
      }
    } catch (error) {
      console.error("Failed to load submissions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkComplete = async () => {
    if (!selectedSubmission) return;
    
    setIsSubmittingFeedback(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/premium/admin/coaching/${selectedSubmission.id}`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: "completed",
            feedback_video_url: feedbackUrl || null,
            feedback_notes: feedbackNotes || null,
          }),
        }
      );
      
      if (response.ok) {
        setSelectedSubmission(null);
        setFeedbackUrl("");
        setFeedbackNotes("");
        loadSubmissions();
      } else {
        const error = await response.json();
        alert(error.detail || "Failed to update submission");
      }
    } catch (error) {
      console.error("Failed to submit feedback:", error);
      alert("Failed to submit feedback. Please try again.");
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="h-screen bg-mambo-dark flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-mambo-dark">
      <AdminSidebar pendingCount={submissions.filter(s => s.status === "pending").length} />

      <main className="flex-1 overflow-y-auto p-8">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-white">Coaching Queue</h1>
          <p className="text-white/60">Review 1-on-1 video analysis submissions</p>
        </header>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {["pending", "in_review", "completed"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition",
                statusFilter === status
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              )}
            >
              {status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ")}
            </button>
          ))}
        </div>

        {/* Submissions Grid */}
        {submissions.length === 0 ? (
          <div className="bg-mambo-panel border border-white/10 rounded-xl p-12 text-center">
            <CheckCircle className="w-12 h-12 text-green-500/50 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">All caught up!</h3>
            <p className="text-white/50">No {statusFilter} submissions at the moment.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {submissions.map((submission) => (
              <motion.div
                key={submission.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-mambo-panel border border-white/10 rounded-xl p-4 hover:border-amber-500/30 transition"
              >
                <div className="flex items-start gap-4">
                  {/* Video Thumbnail */}
                  <div className="w-40 aspect-video rounded-lg overflow-hidden bg-black/50 flex-shrink-0 relative group">
                    <img
                      src={`https://image.mux.com/${submission.video_mux_playback_id}/thumbnail.jpg?width=320`}
                      alt="Submission video"
                      className="w-full h-full object-cover"
                    />
                    <a
                      href={`https://stream.mux.com/${submission.video_mux_playback_id}.m3u8`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition"
                    >
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                        <Play className="w-5 h-5 text-black ml-0.5" fill="currentColor" />
                      </div>
                    </a>
                    {submission.video_duration_seconds && (
                      <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/80 rounded text-xs text-white">
                        {submission.video_duration_seconds}s
                      </div>
                    )}
                  </div>

                  {/* Submission Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      {submission.user_avatar_url ? (
                        <img
                          src={submission.user_avatar_url}
                          alt={submission.user_first_name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                          <User className="w-4 h-4 text-amber-400" />
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-white">
                          {submission.user_first_name} {submission.user_last_name}
                        </p>
                        <p className="text-xs text-white/50">{submission.user_email}</p>
                      </div>
                      {submission.allow_social_share && (
                        <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">
                          Social OK
                        </span>
                      )}
                    </div>

                    {submission.specific_question && (
                      <div className="bg-white/5 rounded-lg p-3 mb-3">
                        <p className="text-sm text-white/70">
                          <span className="text-amber-400 font-medium">Question:</span>{" "}
                          {submission.specific_question}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-xs text-white/40">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(submission.submitted_at).toLocaleDateString()}
                      </span>
                      <span>
                        {submission.submission_month}/{submission.submission_year}
                      </span>
                    </div>
                  </div>

                  {/* Action */}
                  <button
                    onClick={() => setSelectedSubmission(submission)}
                    className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-lg transition text-sm font-medium"
                  >
                    Review
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Review Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl bg-mambo-panel rounded-2xl border border-white/10 overflow-hidden">
            <div className="p-6 border-b border-white/10">
              <h2 className="text-xl font-bold text-white">Complete Review</h2>
              <p className="text-white/60 text-sm">
                {selectedSubmission.user_first_name} {selectedSubmission.user_last_name}
              </p>
            </div>

            <div className="p-6 space-y-4">
              {/* Video Preview */}
              <div className="aspect-video rounded-lg overflow-hidden bg-black">
                <video
                  src={`https://stream.mux.com/${selectedSubmission.video_mux_playback_id}/medium.mp4`}
                  controls
                  className="w-full h-full"
                />
              </div>

              {/* Question */}
              {selectedSubmission.specific_question && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
                  <p className="text-sm text-amber-200">
                    <strong>Their question:</strong> {selectedSubmission.specific_question}
                  </p>
                </div>
              )}

              {/* Feedback URL */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Feedback Video URL (Loom/YouTube link)
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={feedbackUrl}
                    onChange={(e) => setFeedbackUrl(e.target.value)}
                    placeholder="https://www.loom.com/share/..."
                    className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                  <a
                    href="https://www.loom.com/looms/videos"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition"
                    title="Open Loom"
                  >
                    <ExternalLink className="w-5 h-5 text-white/60" />
                  </a>
                </div>
              </div>

              {/* Feedback Notes */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Additional Notes (optional)
                </label>
                <textarea
                  value={feedbackNotes}
                  onChange={(e) => setFeedbackNotes(e.target.value)}
                  placeholder="Any written feedback..."
                  rows={3}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none"
                />
              </div>
            </div>

            <div className="p-6 border-t border-white/10 flex justify-end gap-3">
              <button
                onClick={() => {
                  setSelectedSubmission(null);
                  setFeedbackUrl("");
                  setFeedbackNotes("");
                }}
                className="px-4 py-2 text-white/60 hover:text-white transition"
              >
                Cancel
              </button>
              <button
                onClick={handleMarkComplete}
                disabled={isSubmittingFeedback}
                className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white font-bold rounded-lg transition flex items-center gap-2"
              >
                {isSubmittingFeedback ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Mark as Complete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
