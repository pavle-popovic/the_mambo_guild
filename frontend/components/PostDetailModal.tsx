"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { FaTimes, FaTrash, FaEdit, FaFire, FaRuler, FaSave } from "react-icons/fa";
import MuxVideoPlayer from "./MuxVideoPlayer";
import { apiClient } from "@/lib/api";
import { useUISound } from "@/hooks/useUISound";
import { useAuth } from "@/contexts/AuthContext";
import { GlassCard, GlassPanel } from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils";

interface Tag {
  slug: string;
  name: string;
  category: string | null;
  usage_count: number;
}

interface Post {
  id: string;
  title: string;
  body: string | null;
  post_type: "stage" | "lab";
  mux_playback_id: string | null;
  video_duration_seconds: number | null;
  tags: string[];
  is_wip: boolean;
  feedback_type: "coach" | "hype";
  is_solved: boolean;
  reaction_count: number;
  reply_count: number;
  user_reaction: "fire" | "ruler" | "clap" | null;
  user: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url: string | null;
    is_pro: boolean;
    level: number;
  };
  replies?: Array<{
    id: string;
    user: {
      id: string;
      first_name: string;
      last_name: string;
      avatar_url: string | null;
      is_pro: boolean;
      level: number;
    };
    content: string;
    mux_playback_id: string | null;
    is_accepted_answer: boolean;
    created_at: string;
  }>;
  created_at: string;
  updated_at: string;
}

interface PostDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  currentUserId?: string;
  onPostDeleted?: (postId: string) => void;
  onReaction?: (postId: string, type: "fire" | "ruler" | "clap") => void;
  onRefresh?: () => void;
  initialEditMode?: boolean;
}

export default function PostDetailModal({
  isOpen,
  onClose,
  postId,
  currentUserId,
  onPostDeleted,
  onReaction,
  onRefresh,
  initialEditMode,
}: PostDetailModalProps) {
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [tags, setTags] = useState<Tag[]>([]);
  const [replyContent, setReplyContent] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [playerInitialized, setPlayerInitialized] = useState(false);

  // Optimistic state management
  const [optimisticReaction, setOptimisticReaction] = useState<{ type: string | null, count: number } | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Edit form state
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");
  const [editTags, setEditTags] = useState<string[]>([]);
  const [editIsWip, setEditIsWip] = useState(false);
  const [editFeedbackType, setEditFeedbackType] = useState<"hype" | "coach">("coach");

  const { playClick: UISoundClick } = useUISound();
  const { user } = useAuth();

  useEffect(() => {
    if (isOpen && postId) {
      // Reset optimistic state when opening modal
      setOptimisticReaction(null);
      setPlayerInitialized(false); // Reset tap-to-play state
      loadPost({ skipIfOptimistic: false });
      apiClient.getCommunityTags().then(setTags).catch(console.error);

      // Auto-enter edit mode if requested
      if (initialEditMode) {
        setIsEditing(true);
      } else {
        setIsEditing(false); // Ensure reset
      }
    }

    // Cleanup: abort any pending requests when modal closes
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [isOpen, postId]);

  // Initialize edit form when entering edit mode
  useEffect(() => {
    if (isEditing && post) {
      setEditTitle(post.title);
      setEditBody(post.body || "");
      setEditTags([...post.tags]);
      setEditIsWip(post.is_wip);
      setEditFeedbackType(post.feedback_type);
    }
  }, [isEditing, post]);

  const loadPost = async (options?: { skipIfOptimistic?: boolean; forceRefresh?: boolean; isBackground?: boolean }) => {
    // Skip if we have a recent optimistic update
    if (options?.skipIfOptimistic && optimisticReaction) {
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    setError(null);
    try {
      const postData = await apiClient.getPost(postId, {
        signal: controller.signal,
        forceRefresh: options?.forceRefresh
      });
      // Only update if request wasn't aborted
      if (!controller.signal.aborted) {
        // Merge with optimistic state if it exists
        if (optimisticReaction) {
          setPost({
            ...(postData as Post),
            user_reaction: optimisticReaction.type as Post['user_reaction'],
            reaction_count: optimisticReaction.count,
          });
        } else {
          setPost(postData as Post);
        }
      }
    } catch (err: any) {
      if (err.name !== 'AbortError' && !controller.signal.aborted) {
        setError(err.message || "Failed to load post");
      }
    } finally {
      if (!controller.signal.aborted) {
        setIsLoading(false);
      }
    }
  };

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDeleteClick = () => {
    UISoundClick();
    setShowDeleteConfirm(true);
  };

  const executeDelete = async () => {
    if (!post) return;

    setIsDeleting(true);
    try {
      await apiClient.deletePost(postId);
      UISoundClick();
      onPostDeleted?.(postId);
      onClose();
    } catch (err: any) {
      alert(err.message || "Failed to delete post");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleReaction = async (type: "fire" | "ruler" | "clap") => {
    if (!post || !onReaction) return;
    UISoundClick();

    // Store current state for potential revert
    const prevReaction = post.user_reaction;
    const prevCount = post.reaction_count;

    // Calculate new state
    const isTogglingOff = prevReaction === type;
    const newReaction = isTogglingOff ? null : type;
    const newCount = isTogglingOff
      ? prevCount - 1  // Removing reaction
      : prevReaction === null
        ? prevCount + 1  // New reaction
        : prevCount;  // Changing type doesn't change count

    // Set optimistic state (separate from post state)
    setOptimisticReaction({ type: newReaction, count: newCount });

    // Update post state optimistically using functional update
    setPost(prev => prev ? {
      ...prev,
      user_reaction: newReaction,
      reaction_count: newCount,
    } : null);

    // Call API
    try {
      await onReaction(postId, type);
      // Clear optimistic flag after success - server will confirm
      // Wait longer to allow server processing
      setTimeout(() => {
        setOptimisticReaction(null);
        // Reload to get server-confirmed state
        loadPost({ forceRefresh: true, isBackground: true });
      }, 3000);
    } catch (err) {
      // Revert immediately on error
      setPost(prev => prev ? {
        ...prev,
        user_reaction: prevReaction,
        reaction_count: prevCount,
      } : null);
      setOptimisticReaction(null);
    }
  };

  const handleEdit = () => {
    UISoundClick();
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    UISoundClick();
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!post) return;

    // Validate
    if (!editTitle.trim()) {
      setError("Title is required");
      return;
    }
    if (post.post_type === "lab" && !editBody.trim()) {
      setError("Question body is required for Lab posts");
      return;
    }
    if (editTags.length === 0) {
      setError("At least one tag is required");
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      await apiClient.updatePost(postId, {
        title: editTitle.trim(),
        body: post.post_type === "lab" ? editBody.trim() : undefined,
        tags: editTags,
        is_wip: editIsWip,
        feedback_type: editFeedbackType,
      });
      UISoundClick();
      setIsEditing(false);
      await loadPost({ forceRefresh: true }); // Reload to show updated post
      onRefresh?.();
    } catch (err: any) {
      setError(err.message || "Failed to update post");
    } finally {
      setIsSaving(false);
    }
  };

  const handleTagToggle = (tagSlug: string) => {
    setEditTags((prev) =>
      prev.includes(tagSlug)
        ? prev.filter((t) => t !== tagSlug)
        : [...prev, tagSlug].slice(0, 5) // Max 5 tags
    );
  };

  const handleSubmitReply = async () => {
    if (!replyContent.trim() || !post) return;

    setIsSubmittingReply(true);
    setError(null);
    const replyText = replyContent.trim();
    setReplyContent(""); // Clear immediately for better UX

    // Create optimistic reply with current user data
    const optimisticReply = {
      id: `temp-${Date.now()}`,
      content: replyText,
      user: user ? {
        id: user.id,
        first_name: user.first_name || "You",
        last_name: user.last_name || "",
        avatar_url: user.avatar_url || null,
        is_pro: user.is_pro || false,
        level: user.level || 1,
      } : {
        id: currentUserId || "",
        first_name: "You",
        last_name: "",
        avatar_url: null,
        is_pro: false,
        level: 1,
      },
      is_accepted_answer: false,
      created_at: new Date().toISOString(),
      mux_playback_id: null,
    };

    // Update post immediately with optimistic reply using functional update
    setPost(prev => prev ? {
      ...prev,
      replies: [...(prev.replies || []), optimisticReply],
      reply_count: (prev.reply_count || 0) + 1,
    } : null);

    try {
      await apiClient.addReply(postId, replyText);
      UISoundClick();

      // Wait for server to process, then reload and merge
      setTimeout(async () => {
        try {
          const freshPost = await apiClient.getPost(postId, { forceRefresh: true });
          // Merge: remove temp reply, add server replies
          setPost(prev => {
            if (!prev) return freshPost as Post;
            const withoutTemp = prev.replies?.filter(r => !r.id.startsWith('temp-')) || [];
            const serverReplies = freshPost.replies || [];
            // Combine, avoiding duplicates by ID
            const existingIds = new Set(withoutTemp.map(r => r.id));
            const newReplies = serverReplies.filter((sr: any) => !existingIds.has(sr.id));
            return {
              ...(freshPost as Post),
              replies: [...withoutTemp, ...newReplies].sort((a, b) => {
                // Sort by accepted answer first, then by date
                if (a.is_accepted_answer && !b.is_accepted_answer) return -1;
                if (!a.is_accepted_answer && b.is_accepted_answer) return 1;
                return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
              }),
            };
          });
          onRefresh?.();
        } catch (err) {
          console.error("Failed to reload post after reply:", err);
        }
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Failed to post reply");
      // Revert optimistic update on error
      setPost(prev => prev ? {
        ...prev,
        replies: prev.replies?.filter(r => r.id !== optimisticReply.id) || [],
        reply_count: (prev.reply_count || 0) - 1,
      } : null);
      setReplyContent(replyText); // Restore text on error
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleMarkSolution = async (replyId: string) => {
    try {
      await apiClient.markSolution(postId, replyId);
      UISoundClick();
      await loadPost({ forceRefresh: true });
      onRefresh?.();
    } catch (err: any) {
      setError(err.message || "Failed to mark solution");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-gray-900/95 to-black/95 rounded-2xl border border-white/10 shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 bg-black/60 backdrop-blur-md border-b border-white/10">
          <h2 className="text-xl font-semibold text-white">Post Details</h2>
          <div className="flex items-center gap-2">
            {(() => {
              // Proper null checks and normalized comparison
              const isOwner = !!(
                post &&
                user?.id &&
                post.user?.id &&
                String(user.id).trim().toLowerCase() === String(post.user.id).trim().toLowerCase()
              );

              // Allow admins to edit any post
              const isAdmin = user?.role === 'admin';
              const canEdit = isOwner || isAdmin;

              // Debug logging (remove in production)
              if (post) {
                console.log("[PostDetailModal] Edit button check:", {
                  canEdit,
                  isOwner,
                  isAdmin,
                  currentUserId: user?.id,
                  postUserId: post.user?.id,
                  userRole: user?.role
                });
              }

              return canEdit && !isEditing;
            })() && (
                <>
                  <button
                    onClick={handleEdit}
                    className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded-lg transition"
                    title="Edit post"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={handleDeleteClick}
                    disabled={isDeleting}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition"
                    title="Delete post"
                  >
                    <FaTrash />
                  </button>
                </>
              )}

            {isEditing && (
              <>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="p-2 text-green-400 hover:text-green-300 hover:bg-green-500/20 rounded-lg transition disabled:opacity-50"
                  title="Save changes"
                >
                  <FaSave />
                </button>
                <button
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                  className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition disabled:opacity-50"
                  title="Cancel editing"
                >
                  <FaTimes />
                </button>
              </>
            )}

            <button
              onClick={() => {
                UISoundClick();
                onClose();
              }}
              className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition"
            >
              <FaTimes />
            </button>
          </div>
        </div>

        {/* Content */}
        < div className="p-6" >
          {
            isLoading ? (
              <div className="flex justify-center py-12" >
                <div className="w-10 h-10 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
              </div>
            ) : error ? (
              <GlassPanel className="p-8 text-center">
                <p className="text-red-400 mb-4">{error}</p>
                <button
                  onClick={() => loadPost({ forceRefresh: true })}
                  className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 rounded-lg transition"
                >
                  Retry
                </button>
              </GlassPanel>
            ) : post ? (
              <>
                {/* Video Player (for Stage posts) - Tap-to-Play for cost efficiency */}
                {post.post_type === "stage" && (
                  <div className="mb-6">
                    {post.mux_playback_id ? (
                      !playerInitialized ? (
                        // Thumbnail with play button (tap-to-play)
                        <div
                          className="relative aspect-video cursor-pointer group rounded-lg overflow-hidden"
                          onClick={() => setPlayerInitialized(true)}
                        >
                          <img
                            src={`https://image.mux.com/${post.mux_playback_id}/thumbnail.jpg?width=800&time=1`}
                            alt={post.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition">
                            <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                              <svg
                                className="w-8 h-8 text-black ml-1"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            </div>
                          </div>
                          <div className="absolute bottom-3 left-3 px-2 py-1 bg-black/60 rounded text-xs text-white/80">
                            Tap to play
                          </div>
                        </div>
                      ) : (
                        // Full Mux player (only loads after user taps)
                        <MuxVideoPlayer
                          playbackId={post.mux_playback_id}
                          autoPlay={true}
                          metadata={{
                            video_title: post.title,
                            video_id: post.id,
                          }}
                        />
                      )
                    ) : (
                      <div className="w-full aspect-video bg-black/30 rounded-lg flex items-center justify-center">
                        <div className="text-center text-white/40">
                          <span className="text-6xl mb-2 block">📺</span>
                          <p className="text-sm">Video processing...</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* User Info */}
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-semibold",
                      post.user.is_pro && "ring-2 ring-amber-400"
                    )}
                  >
                    {post.user.avatar_url ? (
                      <img
                        src={post.user.avatar_url}
                        alt={post.user.first_name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      post.user.first_name[0]
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">
                        {post.user.first_name} {post.user.last_name}
                      </span>
                      {post.user.is_pro && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-amber-500/30 text-amber-200">
                          PRO
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-white/50">Level {post.user.level}</span>
                  </div>
                </div>

                {/* Title */}
                {isEditing ? (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                      placeholder="Enter post title"
                    />
                  </div>
                ) : (
                  <h1 className="text-2xl font-bold text-white mb-3">{post.title}</h1>
                )}

                {/* Tags */}
                {isEditing ? (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      Tags ({editTags.length}/5) *
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <button
                          key={tag.slug}
                          onClick={() => handleTagToggle(tag.slug)}
                          className={cn(
                            "text-xs px-3 py-1.5 rounded transition",
                            editTags.includes(tag.slug)
                              ? "bg-amber-500/30 text-amber-200 border border-amber-500/50"
                              : "bg-white/10 text-white/60 hover:bg-white/20 border border-white/20"
                          )}
                        >
                          {tag.name}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-1 rounded bg-white/10 text-white/70"
                      >
                        #{tag}
                      </span>
                    ))}
                    {post.is_wip && (
                      <span className="text-xs px-2 py-1 rounded bg-orange-500/30 text-orange-200">
                        🚧 Work in Progress
                      </span>
                    )}
                    {post.post_type === "lab" && (
                      <span
                        className={cn(
                          "text-xs px-2 py-1 rounded",
                          post.is_solved
                            ? "bg-green-500/30 text-green-200"
                            : "bg-gray-500/30 text-gray-200"
                        )}
                      >
                        {post.is_solved ? "✅ Solved" : "❓ Unsolved"}
                      </span>
                    )}
                  </div>
                )}

                {/* Body (for Lab posts) */}
                {post.post_type === "lab" && (
                  isEditing ? (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-white/70 mb-2">
                        Question Body *
                      </label>
                      <textarea
                        value={editBody}
                        onChange={(e) => setEditBody(e.target.value)}
                        rows={6}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none"
                        placeholder="Enter your question..."
                      />
                    </div>
                  ) : post.body ? (
                    <div className="mb-6 p-4 bg-white/5 rounded-lg">
                      <p className="text-white/80 whitespace-pre-wrap">{post.body}</p>
                    </div>
                  ) : null
                )}

                {/* Edit Options */}
                {isEditing && (
                  <div className="mb-6 p-4 bg-white/5 rounded-lg space-y-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editIsWip}
                        onChange={(e) => setEditIsWip(e.target.checked)}
                        className="w-4 h-4 rounded bg-white/10 border-white/20 text-amber-500 focus:ring-amber-500/50"
                      />
                      <span className="text-sm text-white/80">Mark as Work in Progress</span>
                    </label>
                    {post.post_type === "stage" && (
                      <div>
                        <label className="block text-sm font-medium text-white/70 mb-2">
                          Feedback Type
                        </label>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditFeedbackType("coach")}
                            className={cn(
                              "flex-1 px-4 py-2 rounded-lg transition",
                              editFeedbackType === "coach"
                                ? "bg-blue-500/30 text-blue-200 border border-blue-500/50"
                                : "bg-white/10 text-white/60 hover:bg-white/20 border border-white/20"
                            )}
                          >
                            💬 Coaching Allowed
                          </button>
                          <button
                            onClick={() => setEditFeedbackType("hype")}
                            className={cn(
                              "flex-1 px-4 py-2 rounded-lg transition",
                              editFeedbackType === "hype"
                                ? "bg-orange-500/30 text-orange-200 border border-orange-500/50"
                                : "bg-white/10 text-white/60 hover:bg-white/20 border border-white/20"
                            )}
                          >
                            🔥 Hype Only
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
                    <p className="text-red-200 text-sm">{error}</p>
                  </div>
                )}

                {/* Reactions */}
                <div className="flex items-center gap-4 py-4 border-t border-white/10">
                  {(() => {
                    // Use optimistic state if available, otherwise use post state
                    const displayReaction = optimisticReaction?.type ?? post.user_reaction;
                    const displayCount = optimisticReaction?.count ?? post.reaction_count;

                    return (
                      <>
                        <motion.button
                          onClick={() => handleReaction("fire")}
                          whileHover={{ scale: 1.15, rotate: 5 }}
                          whileTap={{ scale: 0.85 }}
                          transition={{ type: "spring", stiffness: 400, damping: 17 }}
                          className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
                            displayReaction === "fire"
                              ? "bg-orange-500/30 text-orange-200 border border-orange-500/50"
                              : "bg-white/5 text-white/60 hover:bg-white/10 border border-transparent"
                          )}
                        >
                          <FaFire />
                          <span className="font-semibold">{!displayReaction || displayReaction === "fire" ? displayCount : 0}</span>
                        </motion.button>
                        <motion.button
                          onClick={() => handleReaction("ruler")}
                          whileHover={{ scale: 1.15, rotate: -5 }}
                          whileTap={{ scale: 0.85 }}
                          transition={{ type: "spring", stiffness: 400, damping: 17 }}
                          className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
                            displayReaction === "ruler"
                              ? "bg-blue-500/30 text-blue-200 border border-blue-500/50"
                              : "bg-white/5 text-white/60 hover:bg-white/10 border border-transparent"
                          )}
                        >
                          <FaRuler />
                          <span className="font-semibold">{displayReaction === "ruler" ? displayCount : 0}</span>
                        </motion.button>
                        <motion.button
                          onClick={() => handleReaction("clap")}
                          whileHover={{ scale: 1.15, rotate: 5 }}
                          whileTap={{ scale: 0.85 }}
                          transition={{ type: "spring", stiffness: 400, damping: 17 }}
                          className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
                            displayReaction === "clap"
                              ? "bg-green-500/30 text-green-200 border border-green-500/50"
                              : "bg-white/5 text-white/60 hover:bg-white/10 border border-transparent"
                          )}
                        >
                          <span>👏</span>
                          <span className="font-semibold">{displayReaction === "clap" ? displayCount : 0}</span>
                        </motion.button>
                      </>
                    );
                  })()}

                  {post.feedback_type === "hype" ? (
                    <span className="text-sm text-white/40 ml-auto">Hype Only</span>
                  ) : (
                    <span className="text-sm text-white/60 ml-auto">
                      💬 {post.reply_count} comments
                    </span>
                  )}
                </div>

                {/* Reply Form (if not hype mode and not editing) */}
                {post.feedback_type !== "hype" && !isEditing && (
                  <div className="mt-6 pt-6 border-t border-white/10">
                    <h3 className="text-lg font-semibold text-white mb-4">
                      💬 Write a Reply
                    </h3>
                    <div className="space-y-3">
                      <textarea
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder="Write your reply or question..."
                        rows={4}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none"
                      />
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white/50">
                          Cost: 2 🥢 claves
                        </span>
                        <motion.button
                          onClick={handleSubmitReply}
                          disabled={!replyContent.trim() || isSubmittingReply}
                          whileHover={replyContent.trim() && !isSubmittingReply ? { scale: 1.05 } : {}}
                          whileTap={replyContent.trim() && !isSubmittingReply ? { scale: 0.95 } : {}}
                          transition={{ type: "spring", stiffness: 400, damping: 17 }}
                          className={cn(
                            "px-4 py-2 rounded-lg transition-colors flex items-center gap-2",
                            replyContent.trim() && !isSubmittingReply
                              ? "bg-amber-500/30 hover:bg-amber-500/40 text-amber-200"
                              : "bg-white/10 text-white/40 cursor-not-allowed"
                          )}
                        >
                          {isSubmittingReply ? (
                            <>
                              <div className="w-4 h-4 border-2 border-amber-200/30 border-t-amber-200 rounded-full animate-spin" />
                              <span>Posting...</span>
                            </>
                          ) : (
                            "Post Reply"
                          )}
                        </motion.button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Replies Section (if not hype mode) */}
                {post.feedback_type !== "hype" && post.replies && post.replies.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-white/10">
                    <h3 className="text-lg font-semibold text-white mb-4">
                      Replies ({post.reply_count})
                    </h3>
                    <div className="space-y-4">
                      {post.replies.map((reply) => {
                        const isOptimistic = reply.id.startsWith("temp-");
                        return (
                          <GlassCard key={reply.id} className={cn("p-4", isOptimistic && "opacity-70")}>
                            <div className="flex items-start gap-3">
                              <div
                                className={cn(
                                  "w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-xs font-semibold",
                                  reply.user.is_pro && "ring-2 ring-amber-400"
                                )}
                              >
                                {reply.user.avatar_url ? (
                                  <img
                                    src={reply.user.avatar_url}
                                    alt={reply.user.first_name}
                                    className="w-full h-full rounded-full object-cover"
                                  />
                                ) : (
                                  reply.user.first_name[0]
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-semibold text-white text-sm">
                                    {reply.user.first_name} {reply.user.last_name}
                                  </span>
                                  {isOptimistic && (
                                    <span className="text-xs px-1.5 py-0.5 rounded bg-amber-500/30 text-amber-200">
                                      Posting...
                                    </span>
                                  )}
                                  {reply.is_accepted_answer && (
                                    <span className="text-xs px-1.5 py-0.5 rounded bg-green-500/30 text-green-200">
                                      ✅ Solution
                                    </span>
                                  )}
                                  {!isOptimistic && currentUserId && String(currentUserId) === String(post.user.id) && post.post_type === "lab" && !reply.is_accepted_answer && (
                                    <button
                                      onClick={() => handleMarkSolution(reply.id)}
                                      className="text-xs px-2 py-1 rounded bg-green-500/20 hover:bg-green-500/30 text-green-200 transition"
                                      title="Mark as solution"
                                    >
                                      ✓ Accept
                                    </button>
                                  )}
                                </div>
                                <p className="text-white/80 text-sm whitespace-pre-wrap">
                                  {reply.content}
                                </p>
                                {reply.mux_playback_id && (
                                  <div className="mt-2">
                                    <MuxVideoPlayer
                                      playbackId={reply.mux_playback_id}
                                      metadata={{
                                        video_title: `Reply to ${post.title}`,
                                        video_id: reply.id,
                                      }}
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          </GlassCard>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            ) : null}

          {/* Delete Confirmation Overlay */}
          {showDeleteConfirm && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
              <GlassCard className="max-w-md w-full p-6 space-y-4">
                <h3 className="text-xl font-bold text-white">Delete Post?</h3>
                <p className="text-white/70">
                  Are you sure you want to delete <span className="text-white font-semibold">"{post?.title}"</span>? This action cannot be undone and will remove all reactions and comments.
                </p>
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-4 py-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={executeDelete}
                    disabled={isDeleting}
                    className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium transition-colors"
                  >
                    {isDeleting ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </GlassCard>
            </div>
          )}
        </div >
      </div >
    </div >
  );
}
