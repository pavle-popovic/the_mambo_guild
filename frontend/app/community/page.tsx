"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api";
import { UISound } from "@/hooks/useUISound";
import { GlassCard, GlassPanel } from "@/components/ui/GlassCard";
import { MagicButton } from "@/components/ui/MagicButton";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/motion";
import { CreatePostModal } from "@/components/CreatePostModal";
import PostDetailModal from "@/components/PostDetailModal";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";

// Types
interface PostUser {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
  is_pro: boolean;
  level: number;
}

interface Post {
  id: string;
  user: PostUser;
  post_type: "stage" | "lab";
  title: string;
  body: string | null;
  mux_playback_id: string | null;
  video_duration_seconds: number | null;
  tags: string[];
  is_wip: boolean;
  feedback_type: "hype" | "coach";
  is_solved: boolean;
  reaction_count: number;
  reply_count: number;
  user_reaction: string | null;
  created_at: string;
  updated_at: string;
}

interface Tag {
  slug: string;
  name: string;
  category: string | null;
  usage_count: number;
}

type FeedMode = "stage" | "lab";

export default function CommunityPage() {
  const { user } = useAuth();
  const [mode, setMode] = useState<FeedMode>("stage");
  const [posts, setPosts] = useState<Post[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [openInEditMode, setOpenInEditMode] = useState(false);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Auto-dismiss success notification
  useEffect(() => {
    if (showSuccessNotification) {
      const timer = setTimeout(() => {
        setShowSuccessNotification(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessNotification]);

  // Fetch posts with AbortController
  const fetchPostsAbortRef = useRef<AbortController | null>(null);

  const fetchPosts = useCallback(async (options?: { forceRefresh?: boolean }) => {
    // Cancel previous request
    if (fetchPostsAbortRef.current) {
      fetchPostsAbortRef.current.abort();
    }

    const controller = new AbortController();
    fetchPostsAbortRef.current = controller;

    setIsLoading(true);
    setError(null);
    try {
      // Note: getCommunityFeed doesn't support signal yet, but we track abort state
      const data = await apiClient.getCommunityFeed({
        post_type: mode,
        tag: selectedTag || undefined,
        limit: 20,
        forceRefresh: options?.forceRefresh,
      });

      // Only update if request wasn't aborted
      if (!controller.signal.aborted) {
        setPosts(data as unknown as Post[]);
        return data;
      }
    } catch (err: any) {
      if (err.name !== 'AbortError' && !controller.signal.aborted) {
        setError(err.message || "Failed to load posts");
      }
    } finally {
      if (!controller.signal.aborted) {
        setIsLoading(false);
      }
    }
  }, [mode, selectedTag]);

  // Fetch tags
  useEffect(() => {
    apiClient.getCommunityTags().then(setTags).catch(console.error);
  }, []);

  // Fetch posts when mode or tag changes
  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Listen for video ready events to refresh feed
  useEffect(() => {
    const handleVideoReady = () => {
      console.log("[CommunityPage] Video ready event received, refreshing feed...");
      fetchPosts({ forceRefresh: true });
    };
    window.addEventListener("post-video-ready", handleVideoReady);
    return () => window.removeEventListener("post-video-ready", handleVideoReady);
  }, [fetchPosts]);

  const handleModeChange = (newMode: FeedMode) => {
    UISound.click();
    setMode(newMode);
    setSelectedTag(null);
  };

  const handleTagSelect = (tag: string | null) => {
    UISound.hover();
    setSelectedTag(tag);
  };

  const handleReaction = async (postId: string, reactionType: "fire" | "ruler" | "clap") => {
    // Store original state for potential revert
    const originalPosts = [...posts];

    try {
      UISound.click();

      // Optimistically update UI
      setPosts((prevPosts) =>
        prevPosts.map((p) => {
          if (p.id === postId) {
            const currentReaction = p.user_reaction;
            const isTogglingOff = currentReaction === reactionType;
            const isNewReaction = currentReaction === null;

            const newReaction = isTogglingOff ? null : reactionType;
            const newReactionCount = isTogglingOff
              ? p.reaction_count - 1
              : isNewReaction
                ? p.reaction_count + 1
                : p.reaction_count;

            return {
              ...p,
              user_reaction: newReaction,
              reaction_count: newReactionCount,
            };
          }
          return p;
        })
      );

      await apiClient.addReaction(postId, reactionType);
      // Update wallet
      window.dispatchEvent(new Event("wallet-updated"));
      // Background sync - don't block UI, just refresh quietly
      setTimeout(() => fetchPosts({ forceRefresh: true }), 1000);
    } catch (err: any) {
      console.error("Failed to react:", err);
      // Revert optimistic update on error
      setPosts(originalPosts);
      alert(err.message || "Failed to add reaction");
    }
  };

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);

  const confirmDelete = async () => {
    if (!postToDelete) return;

    try {
      await apiClient.deletePost(postToDelete);
      UISound.click();

      // Optimistically remove from feed
      setPosts(prev => prev.filter(p => p.id !== postToDelete));
      setSuccessMessage("Post deleted successfully");
      setShowSuccessNotification(true);

      // Background refresh to confirm
      setTimeout(() => fetchPosts(), 500);
    } catch (err: any) {
      alert(err.message || "Failed to delete post");
    } finally {
      setIsDeleteModalOpen(false);
      setPostToDelete(null);
    }
  };

  const handleDeleteClick = (postId: string) => {
    setPostToDelete(postId);
    setIsDeleteModalOpen(true);
  };



  return (
    <div className="min-h-screen bg-mambo-dark">
      <NavBar user={user || undefined} />

      <div className="max-w-4xl mx-auto px-8 py-12 pt-28">
        {/* Header */}
        <FadeIn>
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Community</h1>
            <p className="text-white/60">
              Share your progress, ask questions, and connect with fellow dancers
            </p>
          </div>
        </FadeIn>

        {/* Mode Toggle */}
        <FadeIn delay={0.1}>
          <div className="flex justify-center mb-6">
            <GlassCard className="p-1 inline-flex gap-1" enableHover={false}>
              <ModeButton
                active={mode === "stage"}
                onClick={() => handleModeChange("stage")}
                icon="📺"
                label="The Stage"
              />
              <ModeButton
                active={mode === "lab"}
                onClick={() => handleModeChange("lab")}
                icon="🧠"
                label="The Lab"
              />
            </GlassCard>
          </div>
        </FadeIn>

        {/* Tag Filter */}
        <FadeIn delay={0.15}>
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            <TagPill
              active={selectedTag === null}
              onClick={() => handleTagSelect(null)}
              label="All"
            />
            {tags.slice(0, 8).map((tag) => (
              <TagPill
                key={tag.slug}
                active={selectedTag === tag.slug}
                onClick={() => handleTagSelect(tag.slug)}
                label={tag.name}
              />
            ))}
          </div>
        </FadeIn>

        {/* Mode Description */}
        <FadeIn delay={0.2}>
          <GlassPanel className="p-4 mb-6">
            {mode === "stage" ? (
              <div className="text-center">
                <h2 className="text-lg font-semibold text-amber-200 mb-1">
                  📺 The Stage
                </h2>
                <p className="text-sm text-white/70">
                  Share your dance videos. Get hype, receive feedback, and inspire others!
                </p>
              </div>
            ) : (
              <div className="text-center">
                <h2 className="text-lg font-semibold text-amber-200 mb-1">
                  🧠 The Lab
                </h2>
                <p className="text-sm text-white/70">
                  Ask technical questions. Help others. Earn claves for accepted answers!
                </p>
              </div>
            )}
          </GlassPanel>
        </FadeIn>

        {/* Create Post Button */}
        <div className="flex justify-center mb-8">
          <MagicButton
            onClick={() => {
              UISound.click();
              setIsCreateModalOpen(true);
            }}
            leftIcon={mode === "stage" ? "🎬" : "❓"}
          >
            {mode === "stage" ? "Share Your Progress" : "Ask a Question"}
          </MagicButton>
        </div>

        {/* Posts Feed */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-10 h-10 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
          </div>
        ) : error ? (
          <GlassPanel className="p-8 text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <MagicButton onClick={() => fetchPosts({ forceRefresh: true })} variant="secondary">
              Try Again
            </MagicButton>
          </GlassPanel>
        ) : posts.length === 0 ? (
          <GlassPanel className="p-12 text-center">
            <div className="text-4xl mb-4">{mode === "stage" ? "📺" : "🧠"}</div>
            <h3 className="text-xl font-semibold text-white mb-2">
              No posts yet
            </h3>
            <p className="text-white/60 mb-6">
              Be the first to {mode === "stage" ? "share your progress" : "ask a question"}!
            </p>
            <MagicButton onClick={() => {
              UISound.click();
              setIsCreateModalOpen(true);
            }}>
              Create First Post
            </MagicButton>
          </GlassPanel>
        ) : (
          <StaggerContainer className="space-y-4">
            {posts.map((post) => (
              <StaggerItem key={post.id}>
                {mode === "stage" ? (
                  <StagePostCard
                    post={post}
                    onReaction={handleReaction}
                    onClick={() => {
                      UISound.click();
                      setSelectedPostId(post.id);
                    }}
                    isOwner={user?.id === post.user.id}
                    onEdit={() => {
                      setOpenInEditMode(true);
                      setSelectedPostId(post.id);
                    }}
                    onDelete={() => handleDeleteClick(post.id)}
                  />
                ) : (
                  <LabPostCard
                    post={post}
                    onReaction={handleReaction}
                    onClick={() => {
                      UISound.click();
                      setSelectedPostId(post.id);
                    }}
                    isOwner={user?.id === post.user.id}
                    onEdit={() => {
                      setOpenInEditMode(true);
                      setSelectedPostId(post.id);
                    }}
                    onDelete={() => handleDeleteClick(post.id)}
                  />
                )}
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}

        {/* Create Post Modal */}
        <CreatePostModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          mode={mode}
          onPostCreated={(newPostData) => {
            setSuccessMessage(mode === "stage" ? "Video posted successfully! 🎬" : "Question posted successfully! 💡");
            setShowSuccessNotification(true);
            setIsCreateModalOpen(false);

            // Create optimistic post with user data
            if (newPostData && user) {
              const optimisticPost = {
                ...newPostData,
                user: {
                  id: user.id,
                  first_name: user.first_name || "You",
                  last_name: user.last_name || "",
                  avatar_url: user.avatar_url || null,
                  is_pro: user.is_pro || false,
                  level: user.level || 1,
                },
              };

              // Add immediately to feed
              setPosts(prev => [optimisticPost, ...prev]);
            }

            // Background sync after delay to get server-confirmed data
            setTimeout(() => {
              fetchPosts({ forceRefresh: true }).then(freshPosts => {
                if (!freshPosts) return;

                // Replace optimistic posts with real data
                setPosts(prev => {
                  const withoutTemp = prev.filter(p => !p.id.startsWith('temp-'));
                  const freshIds = new Set(freshPosts.map(p => p.id));
                  // Keep fresh posts, add any that weren't in optimistic list
                  return [
                    ...freshPosts,
                    ...withoutTemp.filter(p => !freshIds.has(p.id))
                  ] as Post[];
                });
              });
            }, 2000);

            // If it's a stage post, poll for video updates (webhook may take a few seconds)
            if (mode === "stage") {
              let pollCount = 0;
              const maxPolls = 10; // Poll for up to 20 seconds (10 * 2s)
              const pollInterval = setInterval(() => {
                pollCount++;
                fetchPosts();
                if (pollCount >= maxPolls) {
                  clearInterval(pollInterval);
                }
              }, 2000);
            }
          }}
        />

        {/* Post Detail Modal */}
        {selectedPostId && (
          <PostDetailModal
            isOpen={!!selectedPostId}
            onClose={() => {
              setSelectedPostId(null);
              setOpenInEditMode(false);
            }}
            postId={selectedPostId || ""}
            currentUserId={user?.id}
            initialEditMode={openInEditMode}
            onPostDeleted={(deletedId) => {
              // Optimistically remove post from feed
              const idToRemove = deletedId || selectedPostId;
              setPosts((prevPosts) => prevPosts.filter((p) => p.id !== idToRemove));
              setSelectedPostId(null);
              // Background refresh
              setTimeout(() => fetchPosts(), 500);
            }}
            onReaction={handleReaction}
            onRefresh={() => {
              // Background refresh - don't block UI
              setTimeout(() => fetchPosts(), 500);
            }}
          />
        )}

        {/* Success Notification */}
        {showSuccessNotification && (
          <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right">
            <GlassCard className="p-4 bg-green-500/20 border-green-500/50">
              <div className="flex items-center gap-3">
                <div className="text-2xl">✅</div>
                <div>
                  <p className="text-white font-semibold">{successMessage}</p>
                </div>
                <button
                  onClick={() => setShowSuccessNotification(false)}
                  className="ml-4 text-white/60 hover:text-white"
                >
                  ×
                </button>
              </div>
            </GlassCard>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
            <GlassCard className="max-w-md w-full p-6 space-y-4">
              <h3 className="text-xl font-bold text-white">Delete Post?</h3>
              <p className="text-white/70">
                Are you sure you want to delete this post? This action cannot be undone and will remove all reactions and comments.
              </p>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setPostToDelete(null);
                  }}
                  className="px-4 py-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium transition-colors"
                >
                  Delete
                </button>
              </div>
            </GlassCard>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

// ============================================
// Sub-components
// ============================================

function ModeButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: string;
  label: string;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "px-4 py-2 rounded-lg font-medium transition-colors",
        active
          ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white"
          : "text-white/70 hover:text-white hover:bg-white/10"
      )}
    >
      <span className="mr-2">{icon}</span>
      {label}
    </motion.button>
  );
}

function TagPill({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(
        "px-3 py-1 rounded-full text-sm transition-colors",
        active
          ? "bg-amber-500/30 text-amber-200 border border-amber-500/50"
          : "bg-white/10 text-white/60 border border-white/10 hover:border-white/20"
      )}
    >
      {label}
    </motion.button>
  );
}

function StagePostCard({
  post,
  onReaction,
  onClick,
  isOwner,
  onEdit,
  onDelete,
}: {
  post: Post;
  onReaction: (postId: string, type: "fire" | "ruler" | "clap") => void;
  onClick?: () => void;
  isOwner?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  return (
    <GlassCard className="overflow-hidden cursor-pointer hover:scale-[1.01] transition-transform" onClick={onClick}>
      {/* Video Thumbnail */}
      <div className="relative aspect-video bg-black/30">
        {post.mux_playback_id ? (
          <img
            src={`https://image.mux.com/${post.mux_playback_id}/thumbnail.png?time=0`}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-white/40">
            <span className="text-4xl">📺</span>
          </div>
        )}

        {/* WIP Banner */}
        {post.is_wip && (
          <div className="absolute top-2 left-2 px-2 py-1 rounded bg-orange-500/80 text-white text-xs font-semibold">
            🚧 Work in Progress
          </div>
        )}

        {(() => {
          if (isOwner) console.log('Rendering StagePostCard owner actions for:', post.id);
          return isOwner;
        })() && (
            <div className="absolute top-2 right-2 flex items-center gap-1 z-10">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit?.();
                }}
                className="p-1.5 rounded-lg bg-black/40 hover:bg-black/60 text-white/80 hover:text-white backdrop-blur-sm transition-colors"
                title="Edit post"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.();
                }}
                className="p-1.5 rounded-lg bg-black/40 hover:bg-red-500/80 text-white/80 hover:text-white backdrop-blur-sm transition-colors"
                title="Delete post"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  <line x1="10" y1="11" x2="10" y2="17"></line>
                  <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
              </button>
            </div>
          )}

        {/* Duration */}
        {post.video_duration_seconds && (
          <div className="absolute bottom-2 right-2 px-2 py-1 rounded bg-black/60 text-white text-xs">
            {Math.floor(post.video_duration_seconds / 60)}:
            {String(post.video_duration_seconds % 60).padStart(2, "0")}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* User Info */}
        <div className="flex items-center gap-3 mb-3">
          <div
            className={cn(
              "w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-semibold",
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
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white truncate">
                {post.user.first_name} {post.user.last_name}
              </span>
              {post.user.is_pro && (
                <span className="text-xs px-1.5 py-0.5 rounded bg-amber-500/30 text-amber-200">
                  PRO
                </span>
              )}
            </div>
            <span className="text-xs text-white/50">
              Level {post.user.level}
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-white mb-2">{post.title}</h3>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-0.5 rounded bg-white/10 text-white/60"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Reactions */}
        <div className="flex items-center gap-4 pt-3 border-t border-white/10">
          <ReactionButton
            icon="🔥"
            count={(!post.user_reaction || post.user_reaction === "fire") ? post.reaction_count : 0}
            active={post.user_reaction === "fire"}
            onClick={() => onReaction(post.id, "fire")}
          />
          <ReactionButton
            icon="📏"
            count={post.user_reaction === "ruler" ? post.reaction_count : 0}
            active={post.user_reaction === "ruler"}
            onClick={() => onReaction(post.id, "ruler")}
          />
          <ReactionButton
            icon="👏"
            count={post.user_reaction === "clap" ? post.reaction_count : 0}
            active={post.user_reaction === "clap"}
            onClick={() => onReaction(post.id, "clap")}
          />

          <div className="flex-1" />

          {post.feedback_type === "hype" ? (
            <span className="text-xs text-white/40">Hype Only</span>
          ) : (
            <button className="text-sm text-white/60 hover:text-white">
              💬 {post.reply_count} comments
            </button>
          )}
        </div>
      </div>
    </GlassCard>
  );
}

function LabPostCard({
  post,
  onReaction,
  onClick,
  isOwner,
  onEdit,
  onDelete,
}: {
  post: Post;
  onReaction: (postId: string, type: "fire" | "ruler" | "clap") => void;
  onClick?: () => void;
  isOwner?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  return (
    <GlassCard className="p-4 cursor-pointer hover:scale-[1.01] transition-transform relative group" onClick={onClick}>
      {(() => {
        if (isOwner) console.log('Rendering LabPostCard owner actions for:', post.id);
        return isOwner;
      })() && (
          <div className="absolute top-2 right-2 flex items-center gap-1 z-10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.();
              }}
              className="p-1.5 rounded-lg bg-black/40 hover:bg-black/60 text-white/80 hover:text-white backdrop-blur-sm transition-colors"
              title="Edit post"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.();
              }}
              className="p-1.5 rounded-lg bg-black/40 hover:bg-red-500/80 text-white/80 hover:text-white backdrop-blur-sm transition-colors"
              title="Delete post"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
              </svg>
            </button>
          </div>
        )}
      <div className="flex gap-4">
        {/* Status indicator */}
        <div className="flex flex-col items-center gap-2 pt-1">
          <div
            className={cn(
              "w-3 h-3 rounded-full",
              post.is_solved ? "bg-green-500" : "bg-gray-500"
            )}
          />
          <span className="text-xs text-white/40">
            {post.is_solved ? "Solved" : "Open"}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <h3 className="text-lg font-semibold text-white mb-1 hover:text-amber-200 cursor-pointer">
            {post.title}
          </h3>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 mb-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-0.5 rounded bg-white/10 text-white/60"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* Meta */}
          <div className="flex items-center gap-4 text-sm text-white/50">
            <span className="flex items-center gap-1">
              <span
                className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-xs",
                  post.user.is_pro
                    ? "ring-1 ring-amber-400"
                    : "bg-white/10"
                )}
              >
                {post.user.first_name[0]}
              </span>
              {post.user.first_name}
            </span>
            <span>💬 {post.reply_count} answers</span>
            <div onClick={(e) => e.stopPropagation()} className="flex items-center gap-2">
              <ReactionButton
                icon="🔥"
                count={(!post.user_reaction || post.user_reaction === "fire") ? post.reaction_count : 0}
                active={post.user_reaction === "fire"}
                onClick={() => onReaction(post.id, "fire")}
              />
              <ReactionButton
                icon="📏"
                count={post.user_reaction === "ruler" ? post.reaction_count : 0}
                active={post.user_reaction === "ruler"}
                onClick={() => onReaction(post.id, "ruler")}
              />
              <ReactionButton
                icon="👏"
                count={post.user_reaction === "clap" ? post.reaction_count : 0}
                active={post.user_reaction === "clap"}
                onClick={() => onReaction(post.id, "clap")}
              />
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

function ReactionButton({
  icon,
  count,
  active,
  onClick,
}: {
  icon: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className={cn(
        "flex items-center gap-1 px-2 py-1 rounded-lg transition-colors",
        active
          ? "bg-amber-500/30 text-amber-200"
          : "text-white/60 hover:text-white hover:bg-white/10"
      )}
    >
      <span>{icon}</span>
      {count > 0 && <span className="text-sm">{count}</span>}
    </motion.button>
  );
}
