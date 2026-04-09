"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaShieldAlt, FaCheck, FaGhost, FaUser } from "react-icons/fa";
import AdminSidebar from "@/components/AdminSidebar";
import { apiClient } from "@/lib/api";

interface FlaggedReply {
  id: string;
  content: string;
  created_at: string;
  moderation_status: string;
  author: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url: string | null;
  };
  post: {
    id: string;
    title: string;
    post_type: string | null;
  };
}

export default function ModerationPage() {
  const [flaggedReplies, setFlaggedReplies] = useState<FlaggedReply[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadFlagged = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await apiClient.getFlaggedReplies();
      setFlaggedReplies(data.flagged_replies);
    } catch (err) {
      console.error("Failed to load flagged replies:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFlagged();
  }, [loadFlagged]);

  const handleApprove = async (replyId: string) => {
    setActionLoading(replyId);
    try {
      await apiClient.approveReply(replyId);
      setFlaggedReplies((prev) => prev.filter((r) => r.id !== replyId));
    } catch (err) {
      console.error("Failed to approve reply:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleGhost = async (replyId: string) => {
    setActionLoading(replyId);
    try {
      await apiClient.ghostReply(replyId);
      setFlaggedReplies((prev) => prev.filter((r) => r.id !== replyId));
    } catch (err) {
      console.error("Failed to ghost reply:", err);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <AdminSidebar moderationPendingCount={flaggedReplies.length} />

      <main className="ml-64 p-8">
        <div className="max-w-4xl">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <FaShieldAlt className="text-amber-400 text-2xl" />
            <h1 className="text-2xl font-bold">AI Gatekeeper Queue</h1>
            <span className="ml-2 bg-amber-500/20 text-amber-300 text-sm px-3 py-1 rounded-full font-medium">
              {flaggedReplies.length} pending
            </span>
          </div>

          <p className="text-white/50 mb-6 text-sm">
            These replies were flagged by the AI moderator for potentially violating our
            &quot;Attitude over Aptitude&quot; culture pillar. Review each one and decide
            whether to approve (make public) or ghost (permanently hide from everyone except the author).
          </p>

          {/* Content */}
          {isLoading ? (
            <div className="flex justify-center py-16">
              <div className="w-10 h-10 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
            </div>
          ) : flaggedReplies.length === 0 ? (
            <div className="text-center py-16 border border-white/10 rounded-xl bg-white/5">
              <FaShieldAlt className="mx-auto text-4xl text-green-500/50 mb-4" />
              <p className="text-white/60 text-lg">All clear!</p>
              <p className="text-white/40 text-sm mt-1">
                No flagged replies in the queue.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {flaggedReplies.map((reply) => (
                  <motion.div
                    key={reply.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    className="border border-white/10 rounded-xl bg-white/5 overflow-hidden"
                  >
                    {/* Reply header */}
                    <div className="px-5 py-3 border-b border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {reply.author.avatar_url ? (
                          <img
                            src={reply.author.avatar_url}
                            alt=""
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                            <FaUser className="text-white/40 text-xs" />
                          </div>
                        )}
                        <div>
                          <span className="text-sm font-medium text-white">
                            {reply.author.first_name} {reply.author.last_name}
                          </span>
                          <span className="text-white/30 mx-2">on</span>
                          <span className="text-sm text-amber-300/80">
                            {reply.post.title}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs text-white/30">
                        {new Date(reply.created_at).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    {/* Reply content */}
                    <div className="px-5 py-4">
                      <p className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap">
                        {reply.content}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="px-5 py-3 border-t border-white/5 flex items-center gap-3 justify-end">
                      <motion.button
                        onClick={() => handleApprove(reply.id)}
                        disabled={actionLoading === reply.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded-lg text-sm font-medium transition disabled:opacity-50"
                      >
                        <FaCheck className="text-xs" />
                        Approve
                      </motion.button>
                      <motion.button
                        onClick={() => handleGhost(reply.id)}
                        disabled={actionLoading === reply.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg text-sm font-medium transition disabled:opacity-50"
                      >
                        <FaGhost className="text-xs" />
                        Ghost
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
