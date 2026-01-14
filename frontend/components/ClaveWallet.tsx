"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { UISound } from "@/hooks/useUISound";
import { apiClient } from "@/lib/api";

interface ClaveWalletProps {
  onOpenWallet?: () => void;
  className?: string;
}

/**
 * ClaveWallet - NavBar counter showing user's clave balance
 * Clicks to open wallet modal
 */
export function ClaveWallet({ onOpenWallet, className }: ClaveWalletProps) {
  const [balance, setBalance] = useState<number | null>(null);
  const [prevBalance, setPrevBalance] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [error, setError] = useState(false);

  // Fetch wallet balance
  const fetchBalance = useCallback(async () => {
    try {
      const wallet = await apiClient.getWallet();
      setPrevBalance(balance);
      setBalance(wallet.current_claves);
      setError(false);
      
      // Trigger animation if balance changed
      if (balance !== null && wallet.current_claves !== balance) {
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 600);
      }
    } catch (err) {
      console.error("Failed to fetch wallet:", err);
      setError(true);
    }
  }, [balance]);

  useEffect(() => {
    fetchBalance();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchBalance, 30000);
    return () => clearInterval(interval);
  }, [fetchBalance]);

  // Listen for wallet updates from other components
  useEffect(() => {
    const handler = () => fetchBalance();
    window.addEventListener("wallet-updated", handler);
    return () => window.removeEventListener("wallet-updated", handler);
  }, [fetchBalance]);

  const handleClick = () => {
    UISound.click();
    onOpenWallet?.();
  };

  const balanceChange = prevBalance !== null && balance !== null ? balance - prevBalance : 0;
  const isIncrease = balanceChange > 0;

  return (
    <motion.button
      onClick={handleClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 300, damping: 15 }}
      className={cn(
        "relative flex items-center gap-1.5 px-3 py-1.5 rounded-full",
        "bg-gradient-to-r from-amber-500/20 to-orange-500/20",
        "border border-amber-500/30",
        "hover:border-amber-500/50",
        "transition-colors duration-200",
        "cursor-pointer",
        className
      )}
      onHoverStart={() => UISound.hover()}
    >
      {/* Clave icon */}
      <span className="text-lg">🥢</span>
      
      {/* Balance */}
      <AnimatePresence mode="wait">
        <motion.span
          key={balance}
          initial={{ opacity: 0, y: isIncrease ? 10 : -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: isIncrease ? -10 : 10 }}
          transition={{ duration: 0.2 }}
          className={cn(
            "font-semibold text-sm tabular-nums",
            isAnimating && isIncrease && "text-green-400",
            isAnimating && !isIncrease && balanceChange !== 0 && "text-red-400",
            !isAnimating && "text-amber-100"
          )}
        >
          {balance !== null ? balance.toLocaleString() : "..."}
        </motion.span>
      </AnimatePresence>

      {/* Balance change indicator */}
      <AnimatePresence>
        {isAnimating && balanceChange !== 0 && (
          <motion.span
            initial={{ opacity: 0, y: 0, scale: 0.8 }}
            animate={{ opacity: 1, y: -20, scale: 1 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.5 }}
            className={cn(
              "absolute -top-1 right-0 text-xs font-bold",
              isIncrease ? "text-green-400" : "text-red-400"
            )}
          >
            {isIncrease ? "+" : ""}{balanceChange}
          </motion.span>
        )}
      </AnimatePresence>

      {/* Glow effect on hover */}
      <motion.div
        className="absolute inset-0 rounded-full opacity-0 pointer-events-none"
        whileHover={{
          opacity: 1,
          boxShadow: "0 0 20px rgba(255, 180, 0, 0.3)",
        }}
      />
    </motion.button>
  );
}

export default ClaveWallet;
