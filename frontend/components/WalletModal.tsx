"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api";
import { GlassCard } from "./ui/GlassCard";
import { MagicButton } from "./ui/MagicButton";

interface Transaction {
  id: string;
  amount: number;
  reason: string;
  created_at: string;
}

interface WalletData {
  current_claves: number;
  is_pro: boolean;
  recent_transactions: Transaction[];
  video_slots_used: number;
  video_slots_limit: number;
}

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const REASON_LABELS: Record<string, string> = {
  daily_login: "Daily Login Bonus",
  streak_bonus: "Streak Bonus! 🔥",
  reaction: "Reaction Given",
  comment: "Comment Posted",
  post_stage: "Video Posted",
  post_lab: "Question Posted",
  accepted_answer: "Answer Accepted! ⭐",
  fire_refund: "Fire Received! 🔥",
  level_up: "Level Up! 🎉",
  choreo_complete: "Choreo Complete",
  week_complete: "Week Complete",
  course_complete: "Course Complete! 🏆",
  new_user_bonus: "Welcome Bonus",
  referral_bonus: "Referral Bonus",
};

function formatReason(reason: string): string {
  // Handle dynamic reasons like "level_up_5"
  if (reason.startsWith("level_up_")) {
    const level = reason.replace("level_up_", "");
    return `Reached Level ${level}! 🎉`;
  }
  return REASON_LABELS[reason] || reason.replace(/_/g, " ");
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString();
}

export function WalletModal({ isOpen, onClose }: WalletModalProps) {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimResult, setClaimResult] = useState<string | null>(null);

  const fetchWallet = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await apiClient.getWallet();
      setWallet(data);
    } catch (err) {
      console.error("Failed to fetch wallet:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchWallet();
      setClaimResult(null);
    }
  }, [isOpen, fetchWallet]);

  const handleClaimDaily = async () => {
    try {
      setIsClaiming(true);
      const result = await apiClient.claimDailyClaves();
      setClaimResult(result.message);
      
      // Refresh wallet data
      await fetchWallet();
      
      // Dispatch event for navbar to update
      window.dispatchEvent(new Event("wallet-updated"));
    } catch (err: any) {
      setClaimResult(err.message || "Already claimed today!");
    } finally {
      setIsClaiming(false);
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
          className="w-full max-w-md"
        >
          <GlassCard className="p-6 relative" enableHover={false}>
            {/* Close Button - Positioned at top right corner */}
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
            <div className="text-center mb-6 pr-8">
              <h2 className="text-xl font-bold text-white">🎵 Clave Wallet</h2>
              <p className="text-sm text-white/50 mt-1">Your rhythm currency</p>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
              </div>
            ) : wallet ? (
              <>
                {/* Balance Display */}
                <div className="text-center mb-6">
                  <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30"
                  >
                    <span className="text-4xl">🥢</span>
                    <span className="text-4xl font-bold text-amber-100">
                      {wallet.current_claves.toLocaleString()}
                    </span>
                  </motion.div>
                  
                  {wallet.is_pro && (
                    <div className="mt-2">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold">
                        PRO
                      </span>
                    </div>
                  )}
                </div>

                {/* Video Slots */}
                <div className="mb-4 p-3 rounded-lg bg-white/5 border border-white/10">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/70">Video Slots</span>
                    <span className="text-white font-medium">
                      {wallet.video_slots_used} / {wallet.video_slots_limit}
                    </span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-white/10 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${(wallet.video_slots_used / wallet.video_slots_limit) * 100}%`,
                      }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      className="h-full bg-gradient-to-r from-amber-500 to-orange-500"
                    />
                  </div>
                </div>

                {/* Daily Claim Button */}
                <MagicButton
                  onClick={handleClaimDaily}
                  isLoading={isClaiming}
                  fullWidth
                  className="mb-4"
                >
                  🎁 Claim Daily Claves
                </MagicButton>

                {/* Claim Result */}
                {claimResult && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-3 rounded-lg bg-amber-500/20 border border-amber-500/30 text-center text-amber-100"
                  >
                    {claimResult}
                  </motion.div>
                )}

                {/* Transaction History */}
                <div>
                  <h3 className="text-sm font-semibold text-white/70 mb-3">
                    Recent Transactions
                  </h3>
                  
                  {wallet.recent_transactions.length === 0 ? (
                    <div className="text-center py-6 text-white/40">
                      <p>No transactions yet.</p>
                      <p className="text-sm mt-1">
                        Complete lessons to earn Claves!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                      {wallet.recent_transactions.map((tx, index) => (
                        <motion.div
                          key={tx.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-center justify-between p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white truncate">
                              {formatReason(tx.reason)}
                            </p>
                            <p className="text-xs text-white/40">
                              {formatDate(tx.created_at)}
                            </p>
                          </div>
                          <span
                            className={cn(
                              "font-semibold tabular-nums ml-2",
                              tx.amount > 0 ? "text-green-400" : "text-red-400"
                            )}
                          >
                            {tx.amount > 0 ? "+" : ""}
                            {tx.amount}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-white/40">
                Failed to load wallet. Please try again.
              </div>
            )}
          </GlassCard>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default WalletModal;
