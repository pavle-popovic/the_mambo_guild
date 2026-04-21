"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api";
import { UISound } from "@/hooks/useUISound";
import { GlassCard } from "./ui/GlassCard";
import { MagicButton } from "./ui/MagicButton";
import { useTranslations } from "@/i18n/useTranslations";

interface Tag {
  slug: string;
  name: string;
  category: string | null;
  usage_count: number;
}

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "stage" | "lab";
  onPostCreated: (postData?: any) => void;
}

// Static Style/Focus/Level tags (optional)
const STATIC_TAGS: Tag[] = [
  { slug: "salsa-on2", name: "Salsa On2", category: "Style", usage_count: 0 },
  { slug: "mambo", name: "Mambo", category: "Style", usage_count: 0 },
  { slug: "cha-cha-cha", name: "Cha Cha Cha", category: "Style", usage_count: 0 },
  { slug: "boogaloo", name: "Boogaloo", category: "Style", usage_count: 0 },
  { slug: "pachanga", name: "Pachanga", category: "Style", usage_count: 0 },
  { slug: "salsa-fusion", name: "Salsa Fusion", category: "Style", usage_count: 0 },
  { slug: "timing", name: "Timing", category: "Focus", usage_count: 0 },
  { slug: "body-movement", name: "Body Movement", category: "Focus", usage_count: 0 },
  { slug: "styling", name: "Styling", category: "Focus", usage_count: 0 },
  { slug: "musicality", name: "Musicality", category: "Focus", usage_count: 0 },
  { slug: "choreo", name: "Choreo", category: "Focus", usage_count: 0 },
  { slug: "turn", name: "Turn", category: "Focus", usage_count: 0 },
  { slug: "drills", name: "Drills", category: "Focus", usage_count: 0 },
  { slug: "beginner", name: "Beginner", category: "Level", usage_count: 0 },
  { slug: "intermediate", name: "Intermediate", category: "Level", usage_count: 0 },
  { slug: "advanced", name: "Advanced", category: "Level", usage_count: 0 },
];

type VideoType = "motw" | "original" | "guild";

export function CreatePostModal({ isOpen, onClose, mode, onPostCreated }: CreatePostModalProps) {
  const t = useTranslations("community");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [context, setContext] = useState(""); // Stage-only "what you worked on"
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [videoType, setVideoType] = useState<VideoType | null>(null);
  const [isWip, setIsWip] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Video upload state (Stage only)
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "processing" | "error">("idle");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [muxAssetId] = useState<string | null>(null);
  const [muxPlaybackId] = useState<string | null>(null);
  const [videoDuration] = useState<number | null>(null);
  const [, setUploadId] = useState<string | null>(null);
  const [, setCreatedPostId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Question slot status (Lab only)
  const [questionSlots, setQuestionSlots] = useState<{ current_slots: number; max_slots: number } | null>(null);

  // Fetch slot status when modal opens (Lab only)
  useEffect(() => {
    if (!isOpen) return;
    if (mode === "lab") {
      apiClient
        .getQuestionSlotStatus()
        .then((status) => {
          setQuestionSlots({ current_slots: status.current_slots, max_slots: status.max_slots });
        })
        .catch(() => {});
    }
  }, [isOpen, mode]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setTitle("");
      setBody("");
      setContext("");
      setSelectedTags([]);
      setVideoType(null);
      setIsWip(false);
      setVideoFile(null);
      setUploadStatus("idle");
      setUploadProgress(0);
      setUploadId(null);
      setCreatedPostId(null);
      setError(null);
      setIsLoading(false);
    }
  }, [isOpen]);

  const handleTagToggle = (tagSlug: string) => {
    UISound.hover();
    setSelectedTags((prev) =>
      prev.includes(tagSlug) ? prev.filter((t) => t !== tagSlug) : [...prev, tagSlug].slice(0, 5)
    );
  };

  const handleVideoSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      alert(t("selectVideoFile"));
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    try {
      const slotStatus = await apiClient.getSlotStatus();
      if (!slotStatus.allowed) {
        alert(slotStatus.message);
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
    } catch (err: any) {
      alert(err.message || t("failedCheckSlot"));
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (!title.trim()) {
      setError(t("enterTitleFirst"));
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setVideoFile(file);
    setError(null);
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError(t("titleRequired"));
      return;
    }

    if (mode === "lab" && !body.trim()) {
      setError(t("bodyRequired"));
      return;
    }

    if (mode === "stage" && !videoFile) {
      setError(t("selectVideoRequired"));
      return;
    }

    if (mode === "stage" && !videoType) {
      setError(t("videoTypeRequired"));
      return;
    }

    if (mode === "stage" && uploadStatus === "uploading") {
      setError(t("waitForUpload"));
      return;
    }

    setIsLoading(true);
    setError(null);

    // Build final body: Stage uses optional "What I worked on" context
    let finalBody = mode === "lab" ? body.trim() : "";
    if (mode === "stage" && context.trim()) {
      finalBody = context.trim();
    }

    const tagsPayload = selectedTags;

    try {
      const createPostPromise = apiClient.createPost({
        post_type: mode,
        title: title.trim(),
        body: finalBody || undefined,
        tags: tagsPayload,
        feedback_type: "coach",
        video_type: mode === "stage" && videoType ? videoType : undefined,
        is_wip: isWip,
        mux_asset_id: muxAssetId || undefined,
        mux_playback_id: muxPlaybackId || undefined,
        video_duration_seconds: videoDuration || undefined,
      });

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error(t("requestTimedOut"))), 15000)
      );

      const result = (await Promise.race([createPostPromise, timeoutPromise])) as any;

      const postId = result.post?.id || (result as any).post_id;
      if (postId) setCreatedPostId(postId);

      if (mode === "stage" && videoFile && !muxPlaybackId && postId) {
        setUploadStatus("uploading");
        setUploadProgress(0);

        try {
          const { upload_url, upload_id } = await apiClient.createMuxUploadUrl(
            undefined,
            videoFile.name,
            undefined,
            postId
          );

          if (!upload_url || !upload_id) throw new Error(t("uploadUrlFailed"));

          await new Promise<void>((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.upload.addEventListener("progress", (e) => {
              if (e.lengthComputable) setUploadProgress((e.loaded / e.total) * 100);
            });
            xhr.addEventListener("load", () => {
              if (xhr.status === 200 || xhr.status === 201) {
                setUploadStatus("processing");
                setUploadProgress(100);
                setUploadId(upload_id);

                let pollCount = 0;
                const maxPolls = 30;
                const pollInterval = setInterval(async () => {
                  pollCount++;
                  try {
                    const status = await apiClient.checkMuxUploadStatus(undefined, undefined, postId);
                    if (status.status === "ready" && status.playback_id) {
                      clearInterval(pollInterval);
                      window.dispatchEvent(new Event("post-video-ready"));
                    } else if (pollCount >= maxPolls) {
                      clearInterval(pollInterval);
                    }
                  } catch {
                    if (pollCount >= maxPolls) clearInterval(pollInterval);
                  }
                }, 2000);

                resolve();
              } else {
                const errorMsg = t("videoUploadFailed", { status: xhr.status });
                setUploadStatus("error");
                setError(errorMsg);
                reject(new Error(errorMsg));
              }
            });
            xhr.addEventListener("error", () => {
              const errorMsg = t("videoUploadError");
              setUploadStatus("error");
              setError(errorMsg);
              reject(new Error(errorMsg));
            });
            xhr.addEventListener("abort", () => {
              const errorMsg = t("videoUploadCancelled");
              setUploadStatus("error");
              setError(errorMsg);
              reject(new Error(errorMsg));
            });
            xhr.open("PUT", upload_url);
            xhr.setRequestHeader("Content-Type", videoFile.type);
            xhr.send(videoFile);
          });
        } catch (err: any) {
          setUploadStatus("error");
          setError(err.message || t("videoUploadPostFailed"));
          setIsLoading(false);
          return;
        }
      }

      UISound.click();
      window.dispatchEvent(new Event("wallet-updated"));

      onPostCreated(
        result.post || {
          id: postId,
          title: title.trim(),
          post_type: mode,
          body: finalBody || null,
          tags: tagsPayload,
          feedback_type: "coach",
          video_type: mode === "stage" ? videoType : null,
          is_wip: isWip,
          mux_playback_id: muxPlaybackId || null,
          video_duration_seconds: videoDuration || null,
          reaction_count: 0,
          reply_count: 0,
          user_reaction: null,
          is_solved: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      );

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
      }, 1200);
    } catch (err: any) {
      let errorMessage = err.message || t("createPostFailed");
      if (err.message && err.message.includes("detail")) {
        try {
          const errorObj = JSON.parse(err.message);
          if (errorObj.detail?.message) errorMessage = errorObj.detail.message;
          else if (errorObj.detail)
            errorMessage = typeof errorObj.detail === "string" ? errorObj.detail : JSON.stringify(errorObj.detail);
        } catch {}
      }
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        >
          <GlassCard className="p-6 relative" enableHover={false}>
            <motion.button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-white/60 hover:bg-white/20 hover:text-white transition-all"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </motion.button>

            {/* Header */}
            <div className="mb-4 pr-8">
              <h2 className="text-2xl font-bold text-white mb-1">
                {mode === "stage" ? t("shareProgressTitle") : t("askQuestionTitle")}
              </h2>
              <p className="text-sm text-white/50">
                {mode === "stage" ? t("shareProgressSubtitle") : t("askQuestionSubtitle")}
              </p>
            </div>

            {/* Nudge banner */}
            <div className="mb-5 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-100/80 text-xs leading-relaxed">
              {t("nudgePoster")}
            </div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-200 text-sm"
              >
                {error}
              </motion.div>
            )}

            {/* Title */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-white/70 mb-2">{t("titleLabel")}</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={mode === "stage" ? t("titlePlaceholderStage") : t("titlePlaceholderLab")}
                className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-amber-500/50"
                maxLength={200}
              />
            </div>

            {/* Video Upload (Stage only) */}
            {mode === "stage" && (
              <div className="mb-4">
                <label className="block text-sm font-semibold text-white/70 mb-2">{t("videoLabel")}</label>
                <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center">
                  {uploadStatus === "idle" && !videoFile && (
                    <>
                      <input ref={fileInputRef} type="file" accept="video/*" onChange={handleVideoSelect} className="hidden" />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                      >
                        {t("chooseVideoFile")}
                      </button>
                      <p className="text-xs text-white/40 mt-2">{t("videoFormatsHint")}</p>
                      <p className="text-xs text-amber-400/60 mt-1">{t("videoAutoUploadHint")}</p>
                    </>
                  )}

                  {videoFile && uploadStatus === "idle" && (
                    <div className="p-3 bg-blue-900/20 border border-blue-700/50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-blue-400 text-sm">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                            <line x1="12" y1="18" x2="12" y2="12"></line>
                            <line x1="9" y1="15" x2="15" y2="15"></line>
                          </svg>
                          <span className="truncate">{videoFile.name}</span>
                        </div>
                        <button
                          onClick={() => {
                            setVideoFile(null);
                            if (fileInputRef.current) fileInputRef.current.value = "";
                          }}
                          className="text-red-400 hover:text-red-300 text-xs"
                        >
                          {t("removeBtn")}
                        </button>
                      </div>
                      <p className="text-xs text-blue-300/60 mt-1">{t("videoWillUpload")}</p>
                    </div>
                  )}

                  {uploadStatus === "uploading" && videoFile && (
                    <div className="p-3 bg-blue-900/20 border border-blue-700/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-blue-400 font-medium truncate">{videoFile.name}</span>
                        <span className="text-blue-300 text-xs font-mono">{Math.round(uploadProgress)}%</span>
                      </div>
                      <div className="w-full bg-gray-800 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                      </div>
                    </div>
                  )}

                  {uploadStatus === "processing" && videoFile && (
                    <div className="p-3 bg-yellow-900/20 border border-yellow-700/50 rounded-lg">
                      <div className="flex items-center gap-2 text-yellow-400 text-sm">
                        <div className="w-4 h-4 border-2 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin" />
                        <span>{t("processingVideoHint")}</span>
                      </div>
                    </div>
                  )}

                  {uploadStatus === "error" && videoFile && (
                    <div className="p-3 bg-red-900/20 border border-red-700/50 rounded-lg">
                      <p className="text-sm text-red-400 mb-2">{t("uploadFailedLabel")}</p>
                      <button
                        onClick={() => {
                          setVideoFile(null);
                          setUploadStatus("idle");
                          setUploadProgress(0);
                          if (fileInputRef.current) fileInputRef.current.value = "";
                        }}
                        className="text-sm text-amber-400 hover:text-amber-300"
                      >
                        {t("tryAgainBtn")}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Stage: What you worked on (optional) */}
            {mode === "stage" && (
              <div className="mb-4">
                <label className="block text-sm font-semibold text-white/70 mb-2">{t("contextLabel")}</label>
                <textarea
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  placeholder={t("contextPlaceholder")}
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-amber-500/50 resize-none"
                />
              </div>
            )}

            {/* Lab: Body (required) */}
            {mode === "lab" && (
              <div className="mb-4">
                <label className="block text-sm font-semibold text-white/70 mb-2">{t("questionLabel")}</label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder={t("questionPlaceholder")}
                  rows={6}
                  className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-amber-500/50 resize-none"
                />
              </div>
            )}

            {/* Video Type Picker (Stage only) */}
            {mode === "stage" && (
              <div className="mb-4">
                <label className="block text-sm font-semibold text-white/70 mb-1">{t("videoTypeLabel")}</label>
                <p className="text-xs text-white/40 mb-2">{t("videoTypeHint")}</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {([
                    { key: "motw" as VideoType, emoji: "🔥", label: t("videoTypeMotw"), hint: t("videoTypeMotwHint") },
                    { key: "original" as VideoType, emoji: "🎵", label: t("videoTypeOriginal"), hint: t("videoTypeOriginalHint") },
                    { key: "guild" as VideoType, emoji: "👏", label: t("videoTypeGuild"), hint: t("videoTypeGuildHint") },
                  ]).map(({ key, emoji, label, hint }) => (
                    <motion.button
                      key={key}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => { UISound.hover(); setVideoType(key); }}
                      className={cn(
                        "flex flex-col items-start gap-1 px-3 py-2.5 rounded-xl text-left transition-colors border",
                        videoType === key
                          ? "bg-amber-500/20 border-amber-400/60 text-amber-100"
                          : "bg-white/5 border-white/10 text-white/70 hover:border-white/20"
                      )}
                    >
                      <span className="flex items-center gap-2 text-sm font-bold">
                        <span className="text-base leading-none">{emoji}</span>
                        <span>{label}</span>
                      </span>
                      <span className="text-[11px] text-white/50 leading-tight">{hint}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Style / Focus / Level tags (optional) */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-white/70 mb-2">
                {t("tagsLabel", { count: selectedTags.length })}
              </label>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                {STATIC_TAGS.map((tag) => (
                  <motion.button
                    key={tag.slug}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => handleTagToggle(tag.slug)}
                    className={cn(
                      "px-3 py-1 rounded-full text-sm transition-colors",
                      selectedTags.includes(tag.slug)
                        ? "bg-amber-500/30 text-amber-200 border border-amber-500/50"
                        : "bg-white/10 text-white/60 border border-white/10 hover:border-white/20"
                    )}
                  >
                    {tag.name}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* WIP Toggle */}
            <div className="mb-6 flex items-center gap-3">
              <input
                type="checkbox"
                id="wip"
                checked={isWip}
                onChange={(e) => setIsWip(e.target.checked)}
                className="w-5 h-5 rounded bg-white/10 border-white/20 text-amber-500 focus:ring-amber-500"
              />
              <label htmlFor="wip" className="text-sm text-white/70 cursor-pointer">
                {t("markWip")}
              </label>
            </div>

            {/* Submit */}
            <div className="flex gap-3">
              <MagicButton
                onClick={handleSubmit}
                isLoading={isLoading}
                fullWidth
                disabled={
                  !title.trim() ||
                  (mode === "lab" && !body.trim()) ||
                  (mode === "stage" && !videoType) ||
                  (mode === "stage" && (uploadStatus === "uploading" || uploadStatus === "error"))
                }
              >
                {mode === "stage"
                  ? uploadStatus === "processing"
                    ? t("shareVideoProcessing")
                    : t("shareVideoBtn")
                  : t("postQuestionBtn")}
              </MagicButton>
            </div>

            {/* Free to post footer */}
            <p className="text-xs text-white/40 mt-4 text-center">
              {mode === "stage"
                ? t("stageCost")
                : `${t("labCost")}${questionSlots ? t("questionSlotsRemaining", { remaining: questionSlots.max_slots - questionSlots.current_slots }) : ""}`}
            </p>
          </GlassCard>

          <AnimatePresence>
            {showSuccess && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-3xl z-50"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  className="w-20 h-20 rounded-full bg-green-500/20 border-2 border-green-400 flex items-center justify-center"
                >
                  <motion.svg
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="w-10 h-10 text-green-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <motion.path
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </motion.svg>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default CreatePostModal;
