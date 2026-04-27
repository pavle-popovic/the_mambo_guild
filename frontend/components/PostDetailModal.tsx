"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaTrash, FaEdit, FaHeart, FaRegHeart, FaSave, FaBookmark, FaRegBookmark } from "react-icons/fa";
import MuxVideoPlayer from "./MuxVideoPlayer";
import { apiClient } from "@/lib/api";
import { useUISound } from "@/hooks/useUISound";
import { useAuth } from "@/contexts/AuthContext";
import { GlassCard, GlassPanel } from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils";
import GuildMasterAvatar, { GuildMasterUsername } from "@/components/ui/GuildMasterAvatar";
import { GuildMasterTag } from "@/components/ui/GuildMasterBadge";
import UserProfileModal from "@/components/UserProfileModal";
import { useTranslations } from "@/i18n/useTranslations";

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
  video_type?: "motw" | "original" | "guild" | null;
  is_solved: boolean;
  reaction_count: number;
  reply_count: number;
  user_reaction: "like" | null;
  is_saved?: boolean;
  user: {
    id: string;
    username?: string;
    first_name: string;
    last_name: string;
    avatar_url: string | null;
    is_pro: boolean;
    is_guild_master?: boolean;
    level: number;
    equipped_border_sku?: string | null;
    equipped_title_sku?: string | null;
  };
  replies?: Array<{
    id: string;
    user: {
      id: string;
      username?: string;
      first_name: string;
      last_name: string;
      avatar_url: string | null;
      is_pro: boolean;
      is_guild_master?: boolean;
      level: number;
      equipped_border_sku?: string | null;
      equipped_title_sku?: string | null;
    };
    content: string;
    mux_playback_id: string | null;
    is_accepted_answer: boolean;
    created_at: string;
    parent_reply_id?: string | null;
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
  onReaction?: (postId: string) => void;
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
  const t = useTranslations("community");
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
  const [profileModalUsername, setProfileModalUsername] = useState<string | null>(null);

  // Reply edit/delete state
  const [editingReplyId, setEditingReplyId] = useState<string | null>(null);
  const [editingReplyContent, setEditingReplyContent] = useState("");
  const [deletingReplyId, setDeletingReplyId] = useState<string | null>(null);

  // Nested-reply composer: which reply has its inline composer open + the
  // content being typed. Only one inline composer is open at a time so the
  // UI doesn't fill up with empty boxes if a user clicks Reply on several
  // siblings before writing anything.
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [nestedReplyContent, setNestedReplyContent] = useState("");
  const [isSubmittingNestedReply, setIsSubmittingNestedReply] = useState(false);

  // Optimistic state management
  const [optimisticReaction, setOptimisticReaction] = useState<{
    type: "like" | null;
    count: number;
  } | null>(null);
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
            user_reaction: optimisticReaction.type,
            reaction_count: optimisticReaction.count,
          });
        } else {
          setPost(postData as Post);
        }
      }
    } catch (err: any) {
      if (err.name !== 'AbortError' && !controller.signal.aborted) {
        setError(err.message || t("failedLoadPost"));
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
      alert(err.message || t("failedDeletePost"));
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleReaction = async () => {
    if (!post || !onReaction) return;
    UISoundClick();

    const prevReaction = post.user_reaction;
    const prevCount = post.reaction_count;

    const isTogglingOff = prevReaction === "like";
    const newReaction: "like" | null = isTogglingOff ? null : "like";
    const newCount = isTogglingOff ? Math.max(0, prevCount - 1) : prevCount + 1;

    setOptimisticReaction({ type: newReaction, count: newCount });
    setPost(prev => prev ? {
      ...prev,
      user_reaction: newReaction,
      reaction_count: newCount,
    } : null);

    try {
      if (isTogglingOff) {
        await apiClient.removeReaction(postId);
      } else {
        await onReaction(postId);
      }
      setTimeout(() => {
        setOptimisticReaction(null);
        loadPost({ forceRefresh: true, isBackground: true });
      }, 3000);
    } catch (err) {
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
      setError(t("titleRequired2"));
      return;
    }
    if (post.post_type === "lab" && !editBody.trim()) {
      setError(t("questionBodyRequired"));
      return;
    }
    if (editTags.length === 0) {
      setError(t("atLeastOneTag"));
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      await apiClient.updatePost(postId, {
        title: editTitle.trim(),
        // Stage notes are optional — send "" (not undefined) so a user can
        // clear the note. Lab questions enforce non-empty above.
        body: post.post_type === "lab" ? editBody.trim() : editBody,
        tags: editTags,
        is_wip: editIsWip,
        feedback_type: editFeedbackType,
      });
      UISoundClick();
      setIsEditing(false);
      await loadPost({ forceRefresh: true }); // Reload to show updated post
      onRefresh?.();
    } catch (err: any) {
      setError(err.message || t("failedUpdatePost"));
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
        username: (user as any).username || "",
        first_name: user.first_name || "You",
        last_name: user.last_name || "",
        avatar_url: user.avatar_url || null,
        is_pro: user.is_pro || false,
        level: user.level || 1,
      } : {
        id: currentUserId || "",
        username: "",
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
      setError(err.message || t("failedPostReply"));
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

  const handleSubmitNestedReply = async (parentReplyId: string) => {
    if (!nestedReplyContent.trim() || !post) return;
    setIsSubmittingNestedReply(true);
    setError(null);
    const replyText = nestedReplyContent.trim();

    const optimisticReply = {
      id: `temp-${Date.now()}`,
      content: replyText,
      parent_reply_id: parentReplyId,
      user: user ? {
        id: user.id,
        username: (user as any).username || "",
        first_name: user.first_name || "You",
        last_name: user.last_name || "",
        avatar_url: user.avatar_url || null,
        is_pro: user.is_pro || false,
        level: user.level || 1,
      } : {
        id: currentUserId || "",
        username: "",
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

    setPost(prev => prev ? {
      ...prev,
      replies: [...(prev.replies || []), optimisticReply],
      reply_count: (prev.reply_count || 0) + 1,
    } : null);

    setNestedReplyContent("");
    setReplyingToId(null);

    try {
      await apiClient.addReply(postId, replyText, undefined, undefined, parentReplyId);
      UISoundClick();
      // Reload to swap the optimistic temp- row for the real one + pick up
      // any badge/notification side-effects.
      setTimeout(async () => {
        try {
          const freshPost = await apiClient.getPost(postId, { forceRefresh: true });
          setPost(prev => {
            if (!prev) return freshPost as Post;
            const withoutTemp = prev.replies?.filter(r => !r.id.startsWith('temp-')) || [];
            const serverReplies = freshPost.replies || [];
            const existingIds = new Set(withoutTemp.map(r => r.id));
            const newReplies = serverReplies.filter((sr: any) => !existingIds.has(sr.id));
            return {
              ...(freshPost as Post),
              replies: [...withoutTemp, ...newReplies],
            };
          });
          onRefresh?.();
        } catch (err) {
          console.error("Failed to reload post after nested reply:", err);
        }
      }, 1500);
    } catch (err: any) {
      setError(err.message || t("failedPostReply"));
      // Revert optimistic state and restore the typed text so the user
      // can retry without losing their reply.
      setPost(prev => prev ? {
        ...prev,
        replies: prev.replies?.filter(r => r.id !== optimisticReply.id) || [],
        reply_count: Math.max(0, (prev.reply_count || 0) - 1),
      } : null);
      setNestedReplyContent(replyText);
      setReplyingToId(parentReplyId);
    } finally {
      setIsSubmittingNestedReply(false);
    }
  };

  const handleMarkSolution = async (replyId: string) => {
    try {
      await apiClient.markSolution(postId, replyId);
      UISoundClick();
      await loadPost({ forceRefresh: true });
      onRefresh?.();
    } catch (err: any) {
      setError(err.message || t("failedMarkSolution"));
    }
  };

  const handleUpdateReply = async (replyId: string) => {
    if (!editingReplyContent.trim()) return;
    try {
      await apiClient.updateReply(postId, replyId, editingReplyContent.trim());
      setEditingReplyId(null);
      setEditingReplyContent("");
      await loadPost({ forceRefresh: true });
    } catch (err: any) {
      setError(err.message || t("failedUpdateReply"));
    }
  };

  const handleDeleteReply = async (replyId: string) => {
    try {
      await apiClient.deleteReply(postId, replyId);
      setDeletingReplyId(null);
      await loadPost({ forceRefresh: true });
      onRefresh?.();
    } catch (err: any) {
      setError(err.message || t("failedDeleteReply"));
    }
  };

  const handleToggleSave = async () => {
    if (!post) return;
    try {
      if (post.is_saved) {
        await apiClient.unsavePost(postId);
        setPost((prev) => prev ? { ...prev, is_saved: false } : null);
      } else {
        await apiClient.savePost(postId);
        setPost((prev) => prev ? { ...prev, is_saved: true } : null);
      }
      UISoundClick();
    } catch (err) {
      console.error("Failed to toggle save:", err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl max-h-[95dvh] sm:max-h-[90vh] overflow-y-auto bg-gradient-to-br from-gray-900/95 to-black/95 rounded-xl sm:rounded-2xl border border-white/10 shadow-2xl">
        {/* Header */}
        <div
          className="sticky top-0 z-10 flex items-center justify-between px-3 sm:px-4 pb-3 sm:pb-4 bg-black/60 backdrop-blur-md border-b border-white/10"
          style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}
        >
          <h2 className="text-base sm:text-xl font-semibold text-white">{t("postDetails")}</h2>
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
                    title={t("editPost")}
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={handleDeleteClick}
                    disabled={isDeleting}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition"
                    title={t("deletePost")}
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
                  title={t("saveChanges")}
                >
                  <FaSave />
                </button>
                <button
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                  className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition disabled:opacity-50"
                  title={t("cancelEditing")}
                >
                  <FaTimes />
                </button>
              </>
            )}

            {post && !isEditing && (
              <button
                onClick={handleToggleSave}
                className={cn(
                  "p-2 rounded-lg transition",
                  post.is_saved
                    ? "text-amber-400 hover:text-amber-300 hover:bg-amber-500/20"
                    : "text-white/40 hover:text-white hover:bg-white/10"
                )}
                title={post.is_saved ? t("removeBookmark") : t("bookmarkPost")}
              >
                {post.is_saved ? <FaBookmark /> : <FaRegBookmark />}
              </button>
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
                  {t("retryBtn")}
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
                          className="relative cursor-pointer group rounded-lg overflow-hidden bg-black flex items-center justify-center"
                          style={{ maxHeight: "55vh" }}
                          onClick={() => setPlayerInitialized(true)}
                        >
                          <img
                            src={`https://image.mux.com/${post.mux_playback_id}/thumbnail.jpg?width=800&time=1`}
                            alt={post.title}
                            style={{ maxHeight: "55vh", maxWidth: "100%", objectFit: "contain", display: "block" }}
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
                            {t("tapToPlay")}
                          </div>
                        </div>
                      ) : (
                        // Full Mux player (only loads after user taps)
                        <div
                          className="relative rounded-lg overflow-hidden bg-black"
                          style={{ height: "55vh" }}
                        >
                          <MuxVideoPlayer
                            playbackId={post.mux_playback_id}
                            autoPlay={true}
                            containFit
                            maxResolution="720p"
                            preload="auto"
                            metadata={{
                              video_title: post.title,
                              video_id: post.id,
                            }}
                          />
                        </div>
                      )
                    ) : (
                      <div className="w-full aspect-video bg-black/30 rounded-lg flex items-center justify-center">
                        <div className="text-center text-white/40">
                          <span className="text-6xl mb-2 block">📺</span>
                          <p className="text-sm">{t("videoProcessing")}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* User Info */}
                <button
                  type="button"
                  onClick={() => post.user.username && setProfileModalUsername(post.user.username)}
                  className="flex items-center gap-3 mb-4 rounded-lg p-1 -m-1 text-left transition hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-mambo-gold/50"
                >
                  <GuildMasterAvatar
                    avatarUrl={post.user.avatar_url}
                    username={post.user.username}
                    isPro={post.user.is_pro}
                    isGuildMaster={post.user.is_guild_master}
                    size="lg"
                    equippedBorderSku={post.user.equipped_border_sku}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <GuildMasterUsername
                        username={post.user.username}
                        firstName={post.user.first_name}
                        lastName={post.user.last_name}
                        isPro={post.user.is_pro}
                        isGuildMaster={post.user.is_guild_master}
                        equippedTitleSku={post.user.equipped_title_sku}
                      />
                      {post.user.is_guild_master ? (
                        <GuildMasterTag />
                      ) : post.user.is_pro && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-amber-500/30 text-amber-200">
                          {t("proBadge")}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-white/50">{t("levelNumber", { level: post.user.level })}</span>
                  </div>
                </button>

                {/* Title */}
                {isEditing ? (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      {t("postTitleLabel")}
                    </label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                      placeholder={t("postTitlePlaceholder")}
                    />
                  </div>
                ) : (
                  <h1 className="text-2xl font-bold text-white mb-3">{post.title}</h1>
                )}

                {/* Tags */}
                {isEditing ? (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      {t("editTagsLabel", { count: editTags.length })}
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
                    {post.post_type === "stage" && post.video_type && (
                      <span className="text-xs px-2 py-1 rounded bg-amber-500/20 text-amber-100 border border-amber-400/30 font-semibold">
                        {post.video_type === "motw" && `🔥 ${t("videoTypeMotw")}`}
                        {post.video_type === "original" && `🎵 ${t("videoTypeOriginal")}`}
                        {post.video_type === "guild" && `👏 ${t("videoTypeGuild")}`}
                      </span>
                    )}
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-1 rounded bg-white/10 text-white/70"
                      >
                        #{tag}
                      </span>
                    ))}
                    {post.post_type === "lab" && (
                      <span
                        className={cn(
                          "text-xs px-2 py-1 rounded",
                          post.is_solved
                            ? "bg-green-500/30 text-green-200"
                            : "bg-gray-500/30 text-gray-200"
                        )}
                      >
                        {post.is_solved ? t("solvedTag") : t("unsolvedTag")}
                      </span>
                    )}
                  </div>
                )}

                {/* Body — Lab posts use it for the question text, stage posts
                    use it for the optional "What you worked on" note. The
                    composer captures this for both types but it was previously
                    rendered only for Lab; stage notes were silently invisible. */}
                {isEditing ? (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      {post.post_type === "lab" ? t("questionBodyLabel") : t("contextLabel")}
                    </label>
                    <textarea
                      value={editBody}
                      onChange={(e) => setEditBody(e.target.value)}
                      rows={post.post_type === "lab" ? 6 : 3}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none"
                      placeholder={post.post_type === "lab" ? t("questionBodyPlaceholder") : t("contextPlaceholder")}
                    />
                  </div>
                ) : post.body ? (
                  <div className="mb-6 p-4 bg-white/5 rounded-lg">
                    <p className="text-white/80 whitespace-pre-wrap">{post.body}</p>
                  </div>
                ) : null}

                {/* Edit Options */}
                {isEditing && (
                  <div className="mb-6 p-4 bg-white/5 rounded-lg space-y-3">
                    {post.post_type === "stage" && (
                      <div>
                        <label className="block text-sm font-medium text-white/70 mb-2">
                          {t("feedbackTypeLabel")}
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
                            {t("coachingAllowed")}
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
                            {t("hypeOnly")}
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
                    const displayReaction = optimisticReaction?.type ?? post.user_reaction;
                    const displayCount = optimisticReaction?.count ?? post.reaction_count;
                    const isLiked = displayReaction === "like";

                    return (
                      <motion.button
                        onClick={() => handleReaction()}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                        className={cn(
                          "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
                          isLiked
                            ? "bg-pink-500/25 text-pink-200 border border-pink-400/50"
                            : "bg-white/5 text-white/60 hover:bg-white/10 border border-transparent"
                        )}
                      >
                        {isLiked ? <FaHeart /> : <FaRegHeart />}
                        <span className="font-semibold">{displayCount}</span>
                      </motion.button>
                    );
                  })()}

                  {post.feedback_type === "hype" ? (
                    <span className="text-sm text-white/40 ml-auto">{t("hypeOnlyLabel")}</span>
                  ) : (
                    <span className="text-sm text-white/60 ml-auto">
                      {t("commentsCount", { count: post.reply_count })}
                    </span>
                  )}
                </div>

                {/* Reply Form (if not hype mode and not editing) */}
                {post.feedback_type !== "hype" && !isEditing && (
                  <div className="mt-6 pt-6 border-t border-white/10">
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {t("writeReply")}
                    </h3>
                    {/* The "tell them what they did well…" nudge is feedback
                        coaching framing — only fits Stage (practice video)
                        posts, not Lab discussions where users are just
                        chatting. User-reported issue. */}
                    {post.post_type === "stage" && (
                      <p className="mb-3 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-100/80 text-xs leading-relaxed">
                        {t("nudgeReply")}
                      </p>
                    )}
                    <div className="space-y-3">
                      <textarea
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder={t("replyPlaceholder")}
                        rows={4}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none"
                      />
                      <div className="flex items-center justify-end">
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
                              <span>{t("posting")}</span>
                            </>
                          ) : (
                            t("postReply")
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
                      {t("repliesCount", { count: post.reply_count })}
                    </h3>
                    {(() => {
                      // Build a parent → children index from the flat reply
                      // list. Orphan handling: if a reply's parent isn't in
                      // the visible list (parent was soft-deleted, or the
                      // server filtered it for moderation), promote the
                      // reply to top-level so it doesn't silently disappear
                      // from the thread.
                      const visibleIds = new Set((post.replies || []).map(r => r.id));
                      const repliesByParent = new Map<string | null, typeof post.replies>();
                      for (const r of post.replies) {
                        let key = (r.parent_reply_id ?? null) as string | null;
                        if (key && !visibleIds.has(key)) key = null;
                        if (!repliesByParent.has(key)) repliesByParent.set(key, []);
                        repliesByParent.get(key)!.push(r);
                      }
                      const topLevel = repliesByParent.get(null) || [];
                      const MAX_VISUAL_DEPTH = 3;
                      // Defensive recursion bound. Server flattens threads to
                      // 2 levels and the FK has no cycle, so we should never
                      // exceed depth 1 in practice — this fence catches any
                      // surprise bad data without taking down the modal.
                      const MAX_RECURSION_DEPTH = 8;
                      // The outer block already gates on feedback_type !== "hype",
                      // so any reply rendered here is in coach mode and can take
                      // a nested reply.
                      const allowReplies = true;

                      const renderReplyTree = (
                        reply: NonNullable<typeof post.replies>[number],
                        depth: number,
                        index: number,
                      ): React.ReactNode => {
                        if (depth > MAX_RECURSION_DEPTH) return null;
                        const isOptimistic = reply.id.startsWith("temp-");
                        const isReplyOwner = currentUserId && String(currentUserId) === String(reply.user.id);
                        const isAdmin = user?.role === "admin";
                        const canEditReply = (isReplyOwner || isAdmin) && !isOptimistic;
                        const children = repliesByParent.get(reply.id) || [];
                        const hasComposerOpen = replyingToId === reply.id;

                        return (
                          <div key={reply.id}>
                            <motion.div
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 20, height: 0 }}
                              transition={{ duration: 0.3, delay: index * 0.05 }}
                              layout
                            >
                              <GlassCard
                                className={cn(
                                  "p-4",
                                  isOptimistic && "opacity-70",
                                  reply.user.is_guild_master && "guild-master-comment"
                                )}
                              >
                                <div className="flex items-start gap-3">
                                  <button
                                    type="button"
                                    onClick={() => reply.user.username && setProfileModalUsername(reply.user.username)}
                                    className="rounded-full transition hover:ring-2 hover:ring-mambo-gold/50 focus:outline-none focus:ring-2 focus:ring-mambo-gold/50"
                                    aria-label={t("viewProfileAria", { username: reply.user.username || "user" })}
                                  >
                                    <GuildMasterAvatar
                                      avatarUrl={reply.user.avatar_url}
                                      username={reply.user.username}
                                      isPro={reply.user.is_pro}
                                      isGuildMaster={reply.user.is_guild_master}
                                      size="sm"
                                      equippedBorderSku={reply.user.equipped_border_sku}
                                    />
                                  </button>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                      <button
                                        type="button"
                                        onClick={() => reply.user.username && setProfileModalUsername(reply.user.username)}
                                        className="rounded transition hover:opacity-80 focus:outline-none"
                                      >
                                        <GuildMasterUsername
                                          username={reply.user.username}
                                          firstName={reply.user.first_name}
                                          lastName={reply.user.last_name}
                                          isPro={reply.user.is_pro}
                                          isGuildMaster={reply.user.is_guild_master}
                                          equippedTitleSku={reply.user.equipped_title_sku}
                                          className="text-sm"
                                        />
                                      </button>
                                      {isOptimistic && (
                                        <span className="text-xs px-1.5 py-0.5 rounded bg-amber-500/30 text-amber-200">
                                          {t("postingTag")}
                                        </span>
                                      )}
                                      {reply.is_accepted_answer && (
                                        <span className="text-xs px-1.5 py-0.5 rounded bg-green-500/30 text-green-200">
                                          {t("solutionTag")}
                                        </span>
                                      )}
                                      {!isOptimistic && currentUserId && String(currentUserId) === String(post.user.id) && post.post_type === "lab" && !reply.is_accepted_answer && (
                                        <button
                                          onClick={() => handleMarkSolution(reply.id)}
                                          className="text-xs px-2 py-1 rounded bg-green-500/20 hover:bg-green-500/30 text-green-200 transition"
                                          title={t("markSolutionTitle")}
                                        >
                                          {t("acceptBtn")}
                                        </button>
                                      )}

                                      {/* Reply Edit/Delete Buttons */}
                                      {canEditReply && (
                                        <div className="ml-auto flex items-center gap-1">
                                          <button
                                            onClick={() => {
                                              setEditingReplyId(reply.id);
                                              setEditingReplyContent(reply.content);
                                            }}
                                            className="p-1 rounded hover:bg-white/10 text-white/40 hover:text-white/70 transition"
                                            title={t("editReplyTitle")}
                                          >
                                            <FaEdit size={12} />
                                          </button>
                                          <button
                                            onClick={() => setDeletingReplyId(reply.id)}
                                            className="p-1 rounded hover:bg-red-500/20 text-white/40 hover:text-red-400 transition"
                                            title={t("deleteReplyTitle")}
                                          >
                                            <FaTrash size={12} />
                                          </button>
                                        </div>
                                      )}
                                    </div>

                                    {/* Inline Edit or Content */}
                                    {editingReplyId === reply.id ? (
                                      <div className="space-y-2">
                                        <textarea
                                          value={editingReplyContent}
                                          onChange={(e) => setEditingReplyContent(e.target.value)}
                                          className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white text-sm resize-none focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                                          rows={3}
                                        />
                                        <div className="flex gap-2">
                                          <button
                                            onClick={() => handleUpdateReply(reply.id)}
                                            className="px-3 py-1 rounded bg-[#D4AF37]/20 text-[#FCE205] text-xs font-bold hover:bg-[#D4AF37]/30 transition"
                                          >
                                            {t("saveBtn")}
                                          </button>
                                          <button
                                            onClick={() => { setEditingReplyId(null); setEditingReplyContent(""); }}
                                            className="px-3 py-1 rounded text-white/50 text-xs hover:text-white/70 transition"
                                          >
                                            {t("cancelBtn")}
                                          </button>
                                        </div>
                                      </div>
                                    ) : (
                                      <p className="text-white/80 text-sm whitespace-pre-wrap">
                                        {reply.content}
                                      </p>
                                    )}

                                    {reply.mux_playback_id && (
                                      <div className="mt-2">
                                        <MuxVideoPlayer
                                          playbackId={reply.mux_playback_id}
                                          maxResolution="720p"
                                          metadata={{
                                            video_title: t("replyVideoTitle", { title: post.title }),
                                            video_id: reply.id,
                                          }}
                                        />
                                      </div>
                                    )}

                                    {/* Reply-to-reply trigger. Hidden during inline edit
                                        and on the optimistic temp- row so users can't
                                        nest under a reply that hasn't landed yet.
                                        Pre-fills "@username " so a reply-to-reply
                                        keeps a clear addressee even after the backend
                                        flattens it onto the thread root (Instagram). */}
                                    {allowReplies && !isOptimistic && editingReplyId !== reply.id && !hasComposerOpen && (
                                      <button
                                        onClick={() => {
                                          setReplyingToId(reply.id);
                                          const handle = reply.user.username;
                                          setNestedReplyContent(handle ? `@${handle} ` : "");
                                        }}
                                        className="mt-2 text-xs text-white/50 hover:text-[#D4AF37] transition-colors font-medium"
                                      >
                                        {t("replyButton")}
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </GlassCard>
                            </motion.div>

                            {/* Inline composer — opens directly under the reply
                                being responded to. Reuses the existing copy. */}
                            {hasComposerOpen && (
                              <div className="mt-2 ml-3 sm:ml-6 border-l-2 border-[#D4AF37]/30 pl-3 sm:pl-4">
                                <p className="text-xs text-white/50 mb-2">
                                  {t("replyingTo", { username: reply.user.username || reply.user.first_name || "" })}
                                </p>
                                <textarea
                                  value={nestedReplyContent}
                                  onChange={(e) => setNestedReplyContent(e.target.value)}
                                  placeholder={t("replyPlaceholder")}
                                  rows={3}
                                  className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white text-sm resize-none focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                                  autoFocus
                                />
                                <div className="flex gap-2 mt-2">
                                  <button
                                    onClick={() => handleSubmitNestedReply(reply.id)}
                                    disabled={!nestedReplyContent.trim() || isSubmittingNestedReply}
                                    className="px-3 py-1 rounded bg-[#D4AF37]/20 text-[#FCE205] text-xs font-bold hover:bg-[#D4AF37]/30 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    {isSubmittingNestedReply ? t("postingTag") : t("postReply")}
                                  </button>
                                  <button
                                    onClick={() => { setReplyingToId(null); setNestedReplyContent(""); }}
                                    className="px-3 py-1 rounded text-white/50 text-xs hover:text-white/70 transition"
                                  >
                                    {t("cancelBtn")}
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* Children — indented one level (visual cap at
                                MAX_VISUAL_DEPTH so deep threads stay readable
                                on mobile; the tree structure is preserved). */}
                            {children.length > 0 && (
                              <div className={cn(
                                "mt-3 space-y-3",
                                depth < MAX_VISUAL_DEPTH && "ml-3 sm:ml-6 border-l-2 border-white/5 pl-3 sm:pl-4",
                              )}>
                                {children.map((child, childIndex) =>
                                  renderReplyTree(child, depth + 1, childIndex)
                                )}
                              </div>
                            )}
                          </div>
                        );
                      };

                      return (
                        <div className="space-y-4">
                          <AnimatePresence mode="popLayout">
                            {topLevel.map((reply, index) => renderReplyTree(reply, 0, index))}
                          </AnimatePresence>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* Reply Delete Confirmation */}
                {deletingReplyId && (
                  <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <GlassCard className="max-w-md w-full p-6 space-y-4">
                      <h3 className="text-xl font-bold text-white">{t("deleteReplyConfirmTitle")}</h3>
                      <p className="text-white/70">
                        {t("deleteReplyConfirmBody")}
                      </p>
                      <div className="flex justify-end gap-3 mt-6">
                        <button
                          onClick={() => setDeletingReplyId(null)}
                          className="px-4 py-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                        >
                          {t("cancelBtn")}
                        </button>
                        <button
                          onClick={() => handleDeleteReply(deletingReplyId)}
                          className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium transition-colors"
                        >
                          {t("deleteBtn")}
                        </button>
                      </div>
                    </GlassCard>
                  </div>
                )}
              </>
            ) : null}

          {/* Delete Confirmation Overlay */}
          {showDeleteConfirm && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
              <GlassCard className="max-w-md w-full p-6 space-y-4">
                <h3 className="text-xl font-bold text-white">{t("deletePostConfirmTitle")}</h3>
                <p className="text-white/70">
                  {t("deletePostConfirmBodyPre")} <span className="text-white font-semibold">"{post?.title}"</span>{t("deletePostConfirmBodyPost")}
                </p>
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-4 py-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    {t("cancelBtn")}
                  </button>
                  <button
                    onClick={executeDelete}
                    disabled={isDeleting}
                    className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium transition-colors"
                  >
                    {isDeleting ? t("deletingBtn") : t("deleteBtn")}
                  </button>
                </div>
              </GlassCard>
            </div>
          )}
        </div >
      </div >
      <UserProfileModal
        isOpen={profileModalUsername !== null}
        username={profileModalUsername}
        onClose={() => setProfileModalUsername(null)}
      />
    </div >
  );
}
