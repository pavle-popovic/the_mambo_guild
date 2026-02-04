"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Snowflake, Gift, ShoppingBag, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { apiClient } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface StreakFreezeStoreProps {
  onPurchase?: () => void;
  className?: string;
}

interface FreezeStatus {
  weekly_freebie_available: boolean;
  inventory_freezes: number;
  claves_balance: number;
  can_afford_freeze: boolean;
  freeze_cost: number;
  next_weekly_reset: string | null;
  streak_count: number;
}

export default function StreakFreezeStore({ onPurchase, className }: StreakFreezeStoreProps) {
  const [status, setStatus] = useState<FreezeStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);

  const loadStatus = useCallback(async () => {
    try {
      const data = await apiClient.getFreezeStatus();
      setStatus(data);
    } catch (error: any) {
      console.error("Failed to load freeze status:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  const handleBuyFreeze = async () => {
    if (!status?.can_afford_freeze) {
      toast.error(`Not enough claves! You need ${status?.freeze_cost} 🥢`);
      return;
    }

    setIsPurchasing(true);
    try {
      const result = await apiClient.buyStreakFreeze();
      toast.success(result.message);
      
      // Update local state
      setStatus((prev) =>
        prev
          ? {
              ...prev,
              inventory_freezes: result.inventory_freezes,
              claves_balance: result.claves_balance ?? prev.claves_balance,
              can_afford_freeze: (result.claves_balance ?? prev.claves_balance) >= prev.freeze_cost,
            }
          : prev
      );

      onPurchase?.();
    } catch (error: any) {
      toast.error(error.message || "Failed to purchase freeze");
    } finally {
      setIsPurchasing(false);
    }
  };

  const formatResetDate = (dateStr: string | null) => {
    if (!dateStr) return "Monday";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
  };

  if (isLoading) {
    return (
      <div className={cn("bg-gray-900/80 rounded-xl p-6 border border-gray-800", className)}>
        <div className="flex items-center justify-center py-8">
          <Loader2 size={24} className="animate-spin text-mambo-blue" />
        </div>
      </div>
    );
  }

  if (!status) {
    return null;
  }

  return (
    <div className={cn("bg-gray-900/80 rounded-xl border border-gray-800 overflow-hidden", className)}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 p-4 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/20">
            <Snowflake size={24} className="text-blue-400" />
          </div>
          <div>
            <h3 className="font-bold text-white">Streak Freezes</h3>
            <p className="text-sm text-gray-400">Protect your streak when life gets busy</p>
          </div>
        </div>
      </div>

      {/* Status Cards */}
      <div className="p-4 space-y-3">
        {/* Weekly Freebie */}
        <div
          className={cn(
            "flex items-center justify-between p-3 rounded-lg border transition-all",
            status.weekly_freebie_available
              ? "bg-green-500/10 border-green-500/30"
              : "bg-gray-800/50 border-gray-700"
          )}
        >
          <div className="flex items-center gap-3">
            <Gift
              size={20}
              className={status.weekly_freebie_available ? "text-green-400" : "text-gray-500"}
            />
            <div>
              <div className="text-sm font-medium text-white">Weekly Freebie</div>
              <div className="text-xs text-gray-400">
                Resets {formatResetDate(status.next_weekly_reset)}
              </div>
            </div>
          </div>
          <div
            className={cn(
              "px-3 py-1 rounded-full text-xs font-bold",
              status.weekly_freebie_available
                ? "bg-green-500/20 text-green-300"
                : "bg-gray-700 text-gray-400"
            )}
          >
            {status.weekly_freebie_available ? "Available" : "Used"}
          </div>
        </div>

        {/* Inventory */}
        <div className="flex items-center justify-between p-3 rounded-lg border border-gray-700 bg-gray-800/50">
          <div className="flex items-center gap-3">
            <Snowflake size={20} className="text-blue-400" />
            <div>
              <div className="text-sm font-medium text-white">Inventory Freezes</div>
              <div className="text-xs text-gray-400">Purchased freezes in reserve</div>
            </div>
          </div>
          <div className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-sm font-bold">
            {status.inventory_freezes}
          </div>
        </div>

        {/* Current Streak */}
        <div className="flex items-center justify-between p-3 rounded-lg border border-amber-500/30 bg-amber-500/10">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔥</span>
            <div>
              <div className="text-sm font-medium text-white">Current Streak</div>
              <div className="text-xs text-gray-400">Keep it going!</div>
            </div>
          </div>
          <div className="text-xl font-bold text-amber-400">{status.streak_count} days</div>
        </div>
      </div>

      {/* Purchase Section */}
      <div className="p-4 border-t border-gray-800 bg-gray-800/30">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-sm font-medium text-white">Extra Streak Freeze</div>
            <div className="text-xs text-gray-400">Add to your inventory</div>
          </div>
          <div className="flex items-center gap-1 text-amber-400 font-bold">
            <span>{status.freeze_cost}</span>
            <span>🥢</span>
          </div>
        </div>

        <motion.button
          onClick={handleBuyFreeze}
          disabled={!status.can_afford_freeze || isPurchasing}
          className={cn(
            "w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-bold transition-all",
            status.can_afford_freeze
              ? "bg-gradient-to-r from-mambo-blue to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg"
              : "bg-gray-700 text-gray-400 cursor-not-allowed"
          )}
          whileHover={status.can_afford_freeze ? { scale: 1.02 } : {}}
          whileTap={status.can_afford_freeze ? { scale: 0.98 } : {}}
        >
          {isPurchasing ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <ShoppingBag size={18} />
          )}
          <span>Buy Freeze ({status.freeze_cost} 🥢)</span>
        </motion.button>

        {!status.can_afford_freeze && (
          <p className="text-center text-xs text-gray-500 mt-2">
            You have {status.claves_balance} 🥢. Earn more through daily claims and community activity!
          </p>
        )}
      </div>
    </div>
  );
}


/**
 * Streak Save Modal - Shows when streak is at risk
 */
interface StreakSaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  streakCount: number;
  clavesBalance: number;
  freezeCost: number;
  onRepair: () => Promise<void>;
}

export function StreakSaveModal({
  isOpen,
  onClose,
  streakCount,
  clavesBalance,
  freezeCost,
  onRepair,
}: StreakSaveModalProps) {
  const [isRepairing, setIsRepairing] = useState(false);
  const canAfford = clavesBalance >= freezeCost;

  const handleRepair = async () => {
    setIsRepairing(true);
    try {
      await onRepair();
      onClose();
    } catch (error) {
      // Error handled by parent
    } finally {
      setIsRepairing(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-gray-900 border border-red-500/30 rounded-xl p-6 max-w-md mx-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Alert Icon */}
            <div className="flex justify-center mb-4">
              <motion.div
                className="p-4 rounded-full bg-red-500/20"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <AlertCircle size={48} className="text-red-400" />
              </motion.div>
            </div>

            {/* Content */}
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">Streak at Risk!</h3>
              <p className="text-gray-400">
                You missed a day! Your <span className="text-amber-400 font-bold">{streakCount} day streak</span> is about to be lost.
              </p>
            </div>

            {/* Repair Option */}
            <div className="bg-gray-800 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-300">Repair Cost</span>
                <span className="text-amber-400 font-bold">{freezeCost} 🥢</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Your Balance</span>
                <span className={cn("font-bold", canAfford ? "text-green-400" : "text-red-400")}>
                  {clavesBalance} 🥢
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium transition"
              >
                Let it Go 💔
              </button>
              <button
                onClick={handleRepair}
                disabled={!canAfford || isRepairing}
                className={cn(
                  "flex-1 px-4 py-3 rounded-lg font-bold transition flex items-center justify-center gap-2",
                  canAfford
                    ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white"
                    : "bg-gray-700 text-gray-400 cursor-not-allowed"
                )}
              >
                {isRepairing ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <CheckCircle size={18} />
                )}
                Repair Streak
              </button>
            </div>

            {!canAfford && (
              <p className="text-center text-xs text-red-400 mt-3">
                Not enough claves to repair. Earn more through daily claims!
              </p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}


/**
 * Weekly Freeze Notification - Shows when freeze reset happens
 */
interface WeeklyFreezeNotificationProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WeeklyFreezeNotification({ isOpen, onClose }: WeeklyFreezeNotificationProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-4 right-4 z-50 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-4 shadow-2xl max-w-sm"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-white/20">
              <Gift size={24} className="text-white" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-white">Weekly Refresh!</h4>
              <p className="text-sm text-green-100">
                You have 1 Free Streak Freeze available this week!
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition p-1"
            >
              ✕
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
