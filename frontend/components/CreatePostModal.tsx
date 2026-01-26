"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api";
import { UISound } from "@/hooks/useUISound";
import { GlassCard } from "./ui/GlassCard";
import { MagicButton } from "./ui/MagicButton";

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

export function CreatePostModal({ isOpen, onClose, mode, onPostCreated }: CreatePostModalProps) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [feedbackType, setFeedbackType] = useState<"hype" | "coach">("coach");
  const [isWip, setIsWip] = useState(false);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Video upload state (Stage only)
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "processing" | "error">("idle");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [muxAssetId, setMuxAssetId] = useState<string | null>(null);
  const [muxPlaybackId, setMuxPlaybackId] = useState<string | null>(null);
  const [videoDuration, setVideoDuration] = useState<number | null>(null);
  const [uploadId, setUploadId] = useState<string | null>(null);
  const [createdPostId, setCreatedPostId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Predefined relevant tags
  const RELEVANT_TAGS: Tag[] = [
    // Styles
    { slug: "salsa-on2", name: "Salsa On2", category: "Style", usage_count: 0 },
    { slug: "mambo", name: "Mambo", category: "Style", usage_count: 0 },
    { slug: "cha-cha-cha", name: "Cha Cha Cha", category: "Style", usage_count: 0 },
    { slug: "boogaloo", name: "Boogaloo", category: "Style", usage_count: 0 },
    { slug: "pachanga", name: "Pachanga", category: "Style", usage_count: 0 },
    { slug: "salsa-fusion", name: "Salsa Fusion", category: "Style", usage_count: 0 },

    // Focus
    { slug: "timing", name: "Timing", category: "Focus", usage_count: 0 },
    { slug: "body-movement", name: "Body Movement", category: "Focus", usage_count: 0 },
    { slug: "styling", name: "Styling", category: "Focus", usage_count: 0 },
    { slug: "musicality", name: "Musicality", category: "Focus", usage_count: 0 },
    { slug: "choreo", name: "Choreo", category: "Focus", usage_count: 0 },
    { slug: "turn", name: "Turn", category: "Focus", usage_count: 0 },
    { slug: "drills", name: "Drills", category: "Focus", usage_count: 0 },

    // Level
    { slug: "beginner", name: "Beginner", category: "Level", usage_count: 0 },
    { slug: "intermediate", name: "Intermediate", category: "Level", usage_count: 0 },
    { slug: "advanced", name: "Advanced", category: "Level", usage_count: 0 },
  ];

  // Set tags on mount
  useEffect(() => {
    if (isOpen) {
      setTags(RELEVANT_TAGS);
    }
  }, [isOpen]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setTitle("");
      setBody("");
      setSelectedTags([]);
      setFeedbackType("coach");
      setIsWip(false);
      setVideoFile(null);
      setUploadStatus("idle");
      setUploadProgress(0);
      setMuxAssetId(null);
      setMuxPlaybackId(null);
      setVideoDuration(null);
      setUploadId(null);
      setCreatedPostId(null);
      setError(null);
      setIsLoading(false);
    }
  }, [isOpen]);

  const handleTagToggle = (tagSlug: string) => {
    UISound.hover();
    setSelectedTags((prev) =>
      prev.includes(tagSlug)
        ? prev.filter((t) => t !== tagSlug)
        : [...prev, tagSlug].slice(0, 5) // Max 5 tags
    );
  };

  const handleVideoSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      alert("Please select a video file");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    // Check slot limit before upload
    try {
      const slotStatus = await apiClient.getSlotStatus();
      if (!slotStatus.allowed) {
        alert(slotStatus.message);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }
    } catch (err: any) {
      alert(err.message || "Failed to check video slot limit");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    // For community posts, we need the title to create post first
    // But we'll handle upload after post creation in handleSubmit
    if (!title.trim()) {
      setError("Please enter a title first, then upload video");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    // Store file - will upload after post is created
    setVideoFile(file);
    setError(null);

    // Show message that video will upload after post creation
    // The actual upload happens in handleSubmit after post is created
  };

  // Note: Video processing is handled by Mux webhook
  // The backend webhook handler will update the post when video is ready
  // For now, we create the post immediately after upload completes

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    if (mode === "lab" && !body.trim()) {
      setError("Question body is required for Lab posts");
      return;
    }

    if (selectedTags.length === 0) {
      setError("Please select at least one tag");
      return;
    }

    if (mode === "stage" && !videoFile) {
      setError("Please select a video file");
      return;
    }

    if (mode === "stage" && uploadStatus === "uploading") {
      setError("Please wait for video upload to complete");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Create post first to get post_id
      // Wrap in a timeout to prevent indefinite hanging
      const createPostPromise = apiClient.createPost({
        post_type: mode,
        title: title.trim(),
        body: mode === "lab" ? body.trim() : undefined,
        tags: selectedTags,
        feedback_type: feedbackType,
        is_wip: isWip,
        mux_asset_id: muxAssetId || undefined,
        mux_playback_id: muxPlaybackId || undefined,
        video_duration_seconds: videoDuration || undefined,
      });

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Request timed out. Please try again.")), 15000)
      );

      const result = await Promise.race([createPostPromise, timeoutPromise]) as any;

      // Store post_id for video upload (post.id from response)
      const postId = result.post?.id || (result as any).post_id;
      if (postId) {
        setCreatedPostId(postId);
      }

      // If video file was selected but not uploaded yet, upload it now with post_id
      if (mode === "stage" && videoFile && !muxPlaybackId && postId) {
        setUploadStatus("uploading");
        setUploadProgress(0);

        try {
          // Upload video with post_id
          const { upload_url, upload_id } = await apiClient.createMuxUploadUrl(undefined, videoFile.name, undefined, postId);

          if (!upload_url || !upload_id) {
            throw new Error("Failed to get upload URL from server");
          }

          // Upload video and wait for it to complete before closing modal
          await new Promise<void>((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.upload.addEventListener("progress", (e) => {
              if (e.lengthComputable) {
                setUploadProgress((e.loaded / e.total) * 100);
              }
            });
            xhr.addEventListener("load", () => {
              if (xhr.status === 200 || xhr.status === 201) {
                setUploadStatus("processing");
                setUploadProgress(100);
                setUploadId(upload_id);
                console.log("[CreatePostModal] Video uploaded successfully, upload_id:", upload_id);

                // Start polling for video processing completion
                console.log("[CreatePostModal] Starting to poll for video processing...");
                let pollCount = 0;
                const maxPolls = 30; // Poll for up to 60 seconds (30 * 2s)
                const pollInterval = setInterval(async () => {
                  pollCount++;
                  try {
                    const status = await apiClient.checkMuxUploadStatus(undefined, undefined, postId);
                    console.log(`[CreatePostModal] Poll ${pollCount}: Status = ${status.status}`);

                    if (status.status === "ready" && status.playback_id) {
                      clearInterval(pollInterval);
                      console.log("[CreatePostModal] Video processing complete! Playback ID:", status.playback_id);
                      // Post has been updated by the status check endpoint
                      // Refresh the feed to show the video
                      window.dispatchEvent(new Event("post-video-ready"));
                    } else if (pollCount >= maxPolls) {
                      clearInterval(pollInterval);
                      console.log("[CreatePostModal] Polling timeout - video may still be processing. Webhook will update it.");
                    }
                  } catch (err) {
                    console.error("[CreatePostModal] Poll error:", err);
                    if (pollCount >= maxPolls) {
                      clearInterval(pollInterval);
                    }
                  }
                }, 2000);

                resolve(); // Video uploaded successfully
              } else {
                const errorMsg = `Video upload failed with status ${xhr.status}`;
                console.error("[CreatePostModal] Video upload failed:", errorMsg);
                setUploadStatus("error");
                setError(errorMsg);
                reject(new Error(errorMsg));
              }
            });
            xhr.addEventListener("error", (e) => {
              const errorMsg = "Video upload failed. Please check your connection and try again.";
              console.error("[CreatePostModal] Video upload error:", e);
              setUploadStatus("error");
              setError(errorMsg);
              reject(new Error(errorMsg));
            });
            xhr.addEventListener("abort", () => {
              const errorMsg = "Video upload was cancelled.";
              setUploadStatus("error");
              setError(errorMsg);
              reject(new Error(errorMsg));
            });
            xhr.open("PUT", upload_url);
            xhr.setRequestHeader("Content-Type", videoFile.type);
            console.log("[CreatePostModal] Starting video upload to Mux...");
            xhr.send(videoFile);
          });

          console.log("[CreatePostModal] Video upload completed, post will be updated by webhook");
        } catch (err: any) {
          console.error("[CreatePostModal] Video upload error:", err);
          setUploadStatus("error");
          setError(err.message || "Failed to upload video. The post was created but video upload failed.");
          setIsLoading(false);
          return; // Don't close modal if video upload fails - let user see the error
        }
      }

      UISound.click();

      // Refresh wallet
      window.dispatchEvent(new Event("wallet-updated"));

      // Call onPostCreated callback with post data for optimistic update
      onPostCreated(result.post || {
        id: postId,
        title: title.trim(),
        post_type: mode,
        body: mode === "lab" ? body.trim() : null,
        tags: selectedTags,
        feedback_type: feedbackType,
        is_wip: isWip,
        mux_playback_id: muxPlaybackId || null,
        video_duration_seconds: videoDuration || null,
        reaction_count: 0,
        reply_count: 0,
        user_reaction: null,
        is_solved: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      // Close modal after a brief delay to show any final state
      setTimeout(() => {
        onClose();
      }, 100);
    } catch (err: any) {
      console.error("Error creating post:", err);
      // Show user-friendly error message
      let errorMessage = err.message || "Failed to create post";

      // Extract message from error detail if available
      if (err.message && err.message.includes("detail")) {
        try {
          const errorObj = JSON.parse(err.message);
          if (errorObj.detail?.message) {
            errorMessage = errorObj.detail.message;
          } else if (errorObj.detail) {
            errorMessage = typeof errorObj.detail === 'string' ? errorObj.detail : JSON.stringify(errorObj.detail);
          }
        } catch {
          // Keep original message if parsing fails
        }
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
            {/* Close Button */}
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
            <div className="mb-6 pr-8">
              <h2 className="text-2xl font-bold text-white mb-1">
                {mode === "stage" ? "🎬 Share Your Progress" : "🧠 Ask a Question"}
              </h2>
              <p className="text-sm text-white/50">
                {mode === "stage"
                  ? "Upload a video and inspire the community"
                  : "Get help from experienced dancers"}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-200 text-sm"
              >
                {error}

                {/* Show "Get Claves" button if error is about insufficient balance */}
                {(error.includes("Insufficient") || error.includes("claves")) && (
                  <div className="mt-3 flex justify-end">
                    <button
                      onClick={() => window.open("/pricing", "_blank")}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-md shadow-lg transition-colors flex items-center gap-1.5"
                    >
                      <span className="text-base">🥢</span> Get More Claves
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {/* Title Input */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-white/70 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={mode === "stage" ? "e.g., My first On2 combo!" : "e.g., How do I improve my spins?"}
                className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-amber-500/50"
                maxLength={200}
              />
            </div>

            {/* Video Upload (Stage only) */}
            {mode === "stage" && (
              <div className="mb-4">
                <label className="block text-sm font-semibold text-white/70 mb-2">
                  Video *
                </label>
                <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center">
                  {uploadStatus === "idle" && !videoFile && (
                    <>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="video/*"
                        onChange={handleVideoSelect}
                        className="hidden"
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                      >
                        Choose Video File
                      </button>
                      <p className="text-xs text-white/40 mt-2">
                        MP4, MOV, or WebM (max 500MB)
                      </p>
                      <p className="text-xs text-amber-400/60 mt-1">
                        Video will upload automatically when you submit the post
                      </p>
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
                            if (fileInputRef.current) {
                              fileInputRef.current.value = "";
                            }
                          }}
                          className="text-red-400 hover:text-red-300 text-xs"
                        >
                          Remove
                        </button>
                      </div>
                      <p className="text-xs text-blue-300/60 mt-1">
                        Video will upload when you submit the post
                      </p>
                    </div>
                  )}

                  {uploadStatus === "uploading" && videoFile && (
                    <div className="p-3 bg-blue-900/20 border border-blue-700/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-blue-400 font-medium truncate">{videoFile.name}</span>
                        <span className="text-blue-300 text-xs font-mono">{Math.round(uploadProgress)}%</span>
                      </div>
                      <div className="w-full bg-gray-800 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {uploadStatus === "processing" && videoFile && (
                    <div className="p-3 bg-yellow-900/20 border border-yellow-700/50 rounded-lg">
                      <div className="flex items-center gap-2 text-yellow-400 text-sm">
                        <div className="w-4 h-4 border-2 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin" />
                        <span>Processing video... This may take a few minutes.</span>
                      </div>
                    </div>
                  )}

                  {uploadStatus === "error" && videoFile && (
                    <div className="p-3 bg-red-900/20 border border-red-700/50 rounded-lg">
                      <p className="text-sm text-red-400 mb-2">Upload failed</p>
                      <button
                        onClick={() => {
                          setVideoFile(null);
                          setUploadStatus("idle");
                          setUploadProgress(0);
                          if (fileInputRef.current) {
                            fileInputRef.current.value = "";
                          }
                        }}
                        className="text-sm text-amber-400 hover:text-amber-300"
                      >
                        Try again
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Body Input (Lab only) */}
            {mode === "lab" && (
              <div className="mb-4">
                <label className="block text-sm font-semibold text-white/70 mb-2">
                  Question *
                </label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Describe your question in detail..."
                  rows={6}
                  className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-amber-500/50 resize-none"
                />
              </div>
            )}

            {/* Tags */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-white/70 mb-2">
                Tags ({selectedTags.length}/5)
              </label>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                {tags.map((tag) => (
                  <motion.button
                    key={tag.slug}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
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

            {/* Feedback Type (Stage only) */}
            {mode === "stage" && (
              <div className="mb-4">
                <label className="block text-sm font-semibold text-white/70 mb-2">
                  Feedback Type
                </label>
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setFeedbackType("hype")}
                    className={cn(
                      "flex-1 px-4 py-2 rounded-lg transition-colors",
                      feedbackType === "hype"
                        ? "bg-amber-500/30 text-amber-200 border border-amber-500/50"
                        : "bg-white/10 text-white/60 border border-white/10 hover:border-white/20"
                    )}
                  >
                    🔥 Hype Only
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setFeedbackType("coach")}
                    className={cn(
                      "flex-1 px-4 py-2 rounded-lg transition-colors",
                      feedbackType === "coach"
                        ? "bg-amber-500/30 text-amber-200 border border-amber-500/50"
                        : "bg-white/10 text-white/60 border border-white/10 hover:border-white/20"
                    )}
                  >
                    💬 Coaching Allowed
                  </motion.button>
                </div>
              </div>
            )}

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
                Mark as Work in Progress
              </label>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3">
              <MagicButton
                onClick={handleSubmit}
                isLoading={isLoading}
                fullWidth
                disabled={
                  !title.trim() ||
                  (mode === "lab" && !body.trim()) ||
                  (mode === "stage" && (uploadStatus === "uploading" || uploadStatus === "error"))
                }
              >
                {mode === "stage"
                  ? (uploadStatus === "processing" ? "🎬 Post (Video Processing...)" : "🎬 Share Video")
                  : "🧠 Post Question"}
              </MagicButton>
            </div>

            {/* Cost Info */}
            <p className="text-xs text-white/40 mt-4 text-center">
              {mode === "stage"
                ? "Costs 15 claves • Video slot required"
                : "Costs 5 claves"}
            </p>
          </GlassCard>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default CreatePostModal;
