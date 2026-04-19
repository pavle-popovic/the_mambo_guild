"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Clock,
  CheckCircle,
  User,
  Circle,
  Square,
  Upload,
  X,
  Video,
  Camera,
  AlertCircle,
} from "lucide-react";
import AdminSidebar from "@/components/AdminSidebar";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import MuxVideoPlayer, { type MuxVideoPlayerHandle } from "@/components/MuxVideoPlayer";

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

type RecordingState = "idle" | "recording" | "stopped" | "uploading" | "done";

// ─── Recording Studio ────────────────────────────────────────────────────────

function ReviewStudio({
  submission,
  onClose,
  onComplete,
}: {
  submission: CoachingSubmission;
  onClose: () => void;
  onComplete: () => void;
}) {
  const studentVideoRef = useRef<MuxVideoPlayerHandle>(null);
  const webcamVideoRef = useRef<HTMLVideoElement>(null);
  const previewVideoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const webcamStreamRef = useRef<MediaStream | null>(null);

  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [webcamError, setWebcamError] = useState<string | null>(null);
  const [feedbackNotes, setFeedbackNotes] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Start webcam on mount
  useEffect(() => {
    startWebcam();
    return () => {
      stopWebcam();
      cancelAnimationFrame(animFrameRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Set crossOrigin="anonymous" on the underlying Mux <video> as early as
  // possible so canvas recording isn't tainted. Mux HLS is CORS-enabled, so
  // subsequent segment fetches will carry the header.
  useEffect(() => {
    let cancelled = false;
    const attempt = (tries = 0) => {
      if (cancelled) return;
      const video = studentVideoRef.current?.getVideoElement();
      if (!video) {
        if (tries < 30) setTimeout(() => attempt(tries + 1), 200);
        return;
      }
      if (video.crossOrigin !== "anonymous") {
        video.crossOrigin = "anonymous";
      }
    };
    attempt();
    return () => {
      cancelled = true;
    };
  }, [submission.video_mux_playback_id]);

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: true,
      });
      webcamStreamRef.current = stream;
      if (webcamVideoRef.current) {
        webcamVideoRef.current.srcObject = stream;
      }
    } catch (err) {
      setWebcamError("Could not access webcam/mic. Please allow camera permissions.");
    }
  };

  const stopWebcam = () => {
    webcamStreamRef.current?.getTracks().forEach((t) => t.stop());
    webcamStreamRef.current = null;
  };

  // Canvas draw loop — student video left 65%, webcam right 35%
  const drawFrame = useCallback(() => {
    const canvas = canvasRef.current;
    
    const studentVid = studentVideoRef.current?.getVideoElement() ?? null;
    const webcamVid = webcamVideoRef.current;
    if (!canvas || !studentVid || !webcamVid) {
      if (recordingState === "recording") {
         animFrameRef.current = requestAnimationFrame(drawFrame);
      }
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width; // 1280
    const H = canvas.height; // 720
    const leftW = Math.round(W * 0.65);
    const rightW = W - leftW;

    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, W, H);
    ctx.drawImage(studentVid, 0, 0, leftW, H);
    ctx.drawImage(webcamVid, leftW, 0, rightW, H);

    // Label overlays
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.fillRect(8, 8, 130, 28);
    ctx.fillRect(leftW + 8, 8, 100, 28);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 14px Arial";
    ctx.fillText("STUDENT VIDEO", 14, 27);
    ctx.fillText("INSTRUCTOR", leftW + 14, 27);

    animFrameRef.current = requestAnimationFrame(drawFrame);
  }, []);

  const startRecording = async () => {
    if (!canvasRef.current || !webcamStreamRef.current) return;

    chunksRef.current = [];

    // Start drawing
    animFrameRef.current = requestAnimationFrame(drawFrame);

    // Capture canvas video stream
    const canvasStream = (canvasRef.current as any).captureStream(25) as MediaStream;
    const videoTrack = canvasStream.getVideoTracks()[0];

    // Get audio track from webcam
    const audioTrack = webcamStreamRef.current.getAudioTracks()[0];

    const combinedStream = new MediaStream(
      audioTrack ? [videoTrack, audioTrack] : [videoTrack]
    );

    const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")
      ? "video/webm;codecs=vp9,opus"
      : MediaRecorder.isTypeSupported("video/webm")
      ? "video/webm"
      : "";

    const recorder = new MediaRecorder(combinedStream, mimeType ? { mimeType } : {});
    mediaRecorderRef.current = recorder;

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      setRecordedBlob(blob);
      if (previewVideoRef.current) {
        previewVideoRef.current.src = URL.createObjectURL(blob);
      }
      cancelAnimationFrame(animFrameRef.current);
    };

    recorder.start(1000);
    setRecordingState("recording");
    setRecordingSeconds(0);
    timerRef.current = setInterval(() => setRecordingSeconds((s) => s + 1), 1000);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setRecordingState("stopped");
  };

  const uploadAndComplete = async () => {
    if (!recordedBlob) return;
    setRecordingState("uploading");
    setUploadProgress(0);

    try {
      // 1. Get presigned URL
      const urlRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/uploads/coaching-feedback-url`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ submission_id: submission.id }),
        }
      );
      if (!urlRes.ok) throw new Error("Failed to get upload URL");
      const { upload_url, public_url } = await urlRes.json();

      setUploadProgress(20);

      // 2. PUT blob to R2
      const putRes = await fetch(upload_url, {
        method: "PUT",
        headers: { "Content-Type": "video/webm" },
        body: recordedBlob,
      });
      if (!putRes.ok) throw new Error("Failed to upload video to R2");

      setUploadProgress(70);

      // 3. Mark submission as completed
      const completeRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/premium/admin/coaching/${submission.id}`,
        {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "completed",
            feedback_video_url: public_url,
            feedback_notes: feedbackNotes || null,
          }),
        }
      );
      if (!completeRes.ok) throw new Error("Failed to mark submission complete");

      setUploadProgress(100);
      setRecordingState("done");
      setToast({ type: "success", msg: "Feedback uploaded and student notified!" });
      setTimeout(() => {
        onComplete();
      }, 2000);
    } catch (err: any) {
      setToast({ type: "error", msg: err.message || "Upload failed" });
      setRecordingState("stopped");
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 z-50 flex flex-col bg-mambo-dark overflow-y-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-mambo-panel">
        <div>
          <h2 className="text-xl font-bold text-white">Recording Studio</h2>
          <p className="text-sm text-white/50">
            {submission.user_first_name} {submission.user_last_name} —{" "}
            {submission.user_email}
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 p-6 space-y-6 max-w-7xl mx-auto w-full">
        {/* Question */}
        {submission.specific_question && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
            <p className="text-sm text-amber-200">
              <strong>Student's question:</strong> {submission.specific_question}
            </p>
          </div>
        )}

        {/* Video feeds */}
        <div className="grid grid-cols-1 lg:grid-cols-[65fr_35fr] gap-4">
          {/* Student video */}
          <div className="space-y-2">
            <p className="text-xs text-white/40 uppercase tracking-wider flex items-center gap-1.5">
              <Video className="w-3 h-3" /> Student Submission
            </p>
            <div className="aspect-video rounded-xl overflow-hidden bg-black">
              <MuxVideoPlayer
                ref={studentVideoRef}
                playbackId={submission.video_mux_playback_id}
                metadata={{ video_title: "Coaching submission" }}
              />
            </div>
          </div>

          {/* Webcam */}
          <div className="space-y-2">
            <p className="text-xs text-white/40 uppercase tracking-wider flex items-center gap-1.5">
              <Camera className="w-3 h-3" /> Your Webcam
              {recordingState === "recording" && (
                <span className="ml-auto flex items-center gap-1 text-red-400 font-mono text-xs">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  REC {formatTime(recordingSeconds)}
                </span>
              )}
            </p>
            <div className="aspect-video rounded-xl overflow-hidden bg-black relative">
              {webcamError ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center px-4">
                  <AlertCircle className="w-8 h-8 text-red-400" />
                  <p className="text-sm text-red-300">{webcamError}</p>
                </div>
              ) : (
                <video
                  ref={webcamVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover scale-x-[-1]"
                />
              )}
            </div>
          </div>
        </div>

        {/* Hidden canvas for recording */}
        <canvas
          ref={canvasRef}
          width={1280}
          height={720}
          className="hidden"
        />

        {/* Controls */}
        <div className="bg-mambo-panel border border-white/10 rounded-xl p-4 flex flex-wrap items-center gap-3">
          {recordingState === "idle" && (
            <button
              onClick={startRecording}
              disabled={!!webcamError}
              className="flex items-center gap-2 px-5 py-2.5 bg-red-500 hover:bg-red-400 disabled:bg-white/10 disabled:text-white/30 text-white font-bold rounded-lg transition"
            >
              <Circle className="w-4 h-4 fill-current" />
              Start Recording
            </button>
          )}

          {recordingState === "recording" && (
            <button
              onClick={stopRecording}
              className="flex items-center gap-2 px-5 py-2.5 bg-white/20 hover:bg-white/30 text-white font-bold rounded-lg transition"
            >
              <Square className="w-4 h-4 fill-current" />
              Stop Recording
            </button>
          )}

          {recordingState === "stopped" && (
            <>
              <button
                onClick={() => {
                  setRecordedBlob(null);
                  setRecordingState("idle");
                  setRecordingSeconds(0);
                }}
                className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white/70 rounded-lg transition text-sm"
              >
                <Circle className="w-4 h-4" />
                Re-record
              </button>
              <button
                onClick={uploadAndComplete}
                className="flex items-center gap-2 px-5 py-2.5 bg-green-500 hover:bg-green-400 text-white font-bold rounded-lg transition"
              >
                <Upload className="w-4 h-4" />
                Upload &amp; Send to Student
              </button>
            </>
          )}

          {recordingState === "uploading" && (
            <div className="flex items-center gap-3 flex-1">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <div className="flex-1 bg-white/10 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-green-500 transition-all duration-500"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <span className="text-white/60 text-sm">{uploadProgress}%</span>
            </div>
          )}

          {recordingState === "done" && (
            <div className="flex items-center gap-2 text-green-400 font-semibold">
              <CheckCircle className="w-5 h-5" />
              Done! Student has been notified.
            </div>
          )}

          {/* Duration */}
          {recordingState === "recording" && (
            <span className="ml-auto font-mono text-red-400 text-sm">
              {formatTime(recordingSeconds)}
            </span>
          )}
        </div>

        {/* Preview */}
        {(recordingState === "stopped" || recordingState === "uploading" || recordingState === "done") && recordedBlob && (
          <div className="space-y-2">
            <p className="text-xs text-white/40 uppercase tracking-wider">Preview Recording</p>
            <div className="aspect-video rounded-xl overflow-hidden bg-black max-w-2xl">
              <video
                ref={previewVideoRef}
                controls
                className="w-full h-full"
              />
            </div>
          </div>
        )}

        {/* Feedback Notes */}
        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">
            Additional Notes (optional — visible to student)
          </label>
          <textarea
            value={feedbackNotes}
            onChange={(e) => setFeedbackNotes(e.target.value)}
            placeholder="Any written feedback or timestamps to highlight..."
            rows={3}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none"
          />
        </div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={cn(
              "fixed bottom-6 right-6 px-5 py-3 rounded-xl font-medium shadow-lg text-sm flex items-center gap-2",
              toast.type === "success"
                ? "bg-green-500 text-white"
                : "bg-red-500 text-white"
            )}
          >
            {toast.type === "success" ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminCoachingPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [submissions, setSubmissions] = useState<CoachingSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewingSubmission, setReviewingSubmission] = useState<CoachingSubmission | null>(null);
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
        { credentials: "include" }
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
      <AdminSidebar coachingPendingCount={submissions.filter((s) => s.status === "pending").length} />

      <main className="flex-1 overflow-y-auto p-4 pt-16 lg:pt-8 lg:p-8 ml-0 lg:ml-64">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-white">Coaching Queue</h1>
          <p className="text-white/60">Review 1-on-1 video analysis submissions</p>
        </header>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {["pending", "in_review", "completed"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition",
                statusFilter === s
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              )}
            >
              {s.charAt(0).toUpperCase() + s.slice(1).replace("_", " ")}
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
                    onClick={() => setReviewingSubmission(submission)}
                    className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-lg transition text-sm font-medium flex items-center gap-2"
                  >
                    <Play className="w-4 h-4" />
                    Review
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Recording Studio overlay */}
      <AnimatePresence>
        {reviewingSubmission && (
          <ReviewStudio
            submission={reviewingSubmission}
            onClose={() => setReviewingSubmission(null)}
            onComplete={() => {
              setReviewingSubmission(null);
              loadSubmissions();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
