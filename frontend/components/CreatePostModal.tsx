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
  onPostCreated: () => void;
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load tags on mount
  useEffect(() => {
    if (isOpen) {
      apiClient.getCommunityTags().then(setTags).catch(console.error);
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
      setError(null);
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

    setVideoFile(file);
    setUploadStatus("uploading");
    setUploadProgress(0);
    setError(null);

    try {
      // Get upload URL
      const { upload_url, upload_id } = await apiClient.createMuxUploadUrl(undefined, file.name);
      
      if (!upload_url || !upload_id) {
        throw new Error("No upload URL received from server");
      }

      // Upload to Mux
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
          // Video is uploaded, now processing
          // We can create the post immediately - webhook will update it when video is ready
          // Note: We'll need to extend webhook handler to support posts with upload_id
        } else {
          throw new Error(`Upload failed with status ${xhr.status}`);
        }
      });

      xhr.addEventListener("error", () => {
        setUploadStatus("error");
        setError("Upload failed. Please try again.");
        setVideoFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      });

      xhr.open("PUT", upload_url);
      xhr.setRequestHeader("Content-Type", file.type);
      xhr.send(file);
    } catch (err: any) {
      setUploadStatus("error");
      setError(err.message || "Failed to upload video");
      setVideoFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
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

    if (mode === "stage" && uploadStatus === "uploading") {
      setError("Please wait for video upload to complete");
      return;
    }
    
    // For Stage posts: if video was uploaded, we create post immediately
    // The webhook will update the post with mux_asset_id and mux_playback_id when ready
    // Note: We'll need to extend webhook handler to match upload_id to post_id

    setIsLoading(true);
    setError(null);

    try {
      await apiClient.createPost({
        post_type: mode,
        title: title.trim(),
        body: mode === "lab" ? body.trim() : null,
        tags: selectedTags,
        feedback_type: feedbackType,
        is_wip: isWip,
        mux_asset_id: muxAssetId || undefined,
        mux_playback_id: muxPlaybackId || undefined,
        video_duration_seconds: videoDuration || undefined,
      });

      UISound.click();
      onPostCreated();
      onClose();
      
      // Refresh wallet
      window.dispatchEvent(new Event("wallet-updated"));
    } catch (err: any) {
      setError(err.message || "Failed to create post");
    } finally {
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
                    </>
                  )}
                  
                  {uploadStatus === "uploading" && (
                    <div>
                      <div className="w-full bg-white/10 rounded-full h-2 mb-2">
                        <motion.div
                          className="bg-amber-500 h-2 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      <p className="text-sm text-white/60">
                        Uploading... {Math.round(uploadProgress)}%
                      </p>
                    </div>
                  )}
                  
                  {uploadStatus === "processing" && (
                    <div>
                      <div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mx-auto mb-2" />
                      <p className="text-sm text-white/60">
                        Processing video...
                      </p>
                    </div>
                  )}
                  
                  {uploadStatus === "error" && videoFile && (
                    <div>
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
                  
                  {videoFile && uploadStatus !== "error" && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white/70 truncate">{videoFile.name}</span>
                      {uploadStatus === "processing" && (
                        <span className="text-xs text-amber-400">Processing...</span>
                      )}
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
