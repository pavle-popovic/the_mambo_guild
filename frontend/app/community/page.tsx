"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api";
import { UISound } from "@/hooks/useUISound";
import { GlassCard, GlassPanel } from "@/components/ui/GlassCard";
import { MagicButton } from "@/components/ui/MagicButton";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/motion";
import { CreatePostModal } from "@/components/CreatePostModal";
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

  // Fetch posts
  const fetchPosts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await apiClient.getCommunityFeed({
        post_type: mode,
        tag: selectedTag || undefined,
        limit: 20,
      });
      setPosts(data);
    } catch (err: any) {
      setError(err.message || "Failed to load posts");
    } finally {
      setIsLoading(false);
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
    try {
      UISound.click();
      await apiClient.addReaction(postId, reactionType);
      // Refresh posts
      fetchPosts();
      // Update wallet
      window.dispatchEvent(new Event("wallet-updated"));
    } catch (err: any) {
      console.error("Failed to react:", err);
      alert(err.message || "Failed to add reaction");
    }
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
            <MagicButton onClick={fetchPosts} variant="secondary">
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
                  <StagePostCard post={post} onReaction={handleReaction} />
                ) : (
                  <LabPostCard post={post} onReaction={handleReaction} />
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
          onPostCreated={() => {
            fetchPosts();
            setIsCreateModalOpen(false);
          }}
        />
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
}: {
  post: Post;
  onReaction: (postId: string, type: "fire" | "ruler" | "clap") => void;
}) {
  return (
    <GlassCard className="overflow-hidden">
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
            count={post.reaction_count}
            active={post.user_reaction === "fire"}
            onClick={() => onReaction(post.id, "fire")}
          />
          <ReactionButton
            icon="📏"
            count={0}
            active={post.user_reaction === "ruler"}
            onClick={() => onReaction(post.id, "ruler")}
          />
          <ReactionButton
            icon="👏"
            count={0}
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
}: {
  post: Post;
  onReaction: (postId: string, type: "fire" | "ruler" | "clap") => void;
}) {
  return (
    <GlassCard className="p-4">
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
            <span>🔥 {post.reaction_count}</span>
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
