"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { apiClient } from "@/lib/api";
import { GlassCard } from "./ui/GlassCard";
import { MagicButton } from "./ui/MagicButton";
import { UISound } from "@/hooks/useUISound";
import { useTranslations } from "@/i18n/useTranslations";

export function ReferralSection() {
  const t = useTranslations("profile");
  const [referralCount, setReferralCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Count referral transactions from wallet
    const fetchReferralStats = async () => {
      try {
        const wallet = await apiClient.getWallet();
        const referralTransactions = wallet.recent_transactions.filter(
          (tx) => tx.reason === "referral_bonus"
        );
        setReferralCount(referralTransactions.length);
      } catch (err) {
        console.error("Failed to load referral stats:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReferralStats();
  }, []);

  // Generate referral link (placeholder - would use actual referral_code from backend)
  const referralLink = typeof window !== "undefined" 
    ? `${window.location.origin}/register?ref=${btoa("user_ref_placeholder").slice(0, 8)}`
    : "";

  const handleCopyLink = () => {
    if (referralLink) {
      navigator.clipboard.writeText(referralLink);
      UISound.click();
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-white mb-1">{t("referralTitle")}</h2>
          <p className="text-sm text-white/50">
            {t("referralSubtitle")}
          </p>
        </div>
        {referralCount !== null && (
          <div className="text-right">
            <div className="text-2xl font-bold text-amber-400">{referralCount}</div>
            <div className="text-xs text-white/40">{t("referralCountLabel")}</div>
          </div>
        )}
      </div>

      {/* Referral Link */}
      <div className="mb-4 p-4 rounded-lg bg-white/5 border border-white/10">
        <label className="block text-sm font-semibold text-white/70 mb-2">
          {t("yourReferralLink")}
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={referralLink}
            readOnly
            className="flex-1 px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm"
          />
          <MagicButton
            onClick={handleCopyLink}
            variant="secondary"
            size="sm"
          >
            {copied ? t("copiedBtn") : t("copyBtn")}
          </MagicButton>
        </div>
      </div>

      {/* Info */}
      <div className="text-xs text-white/50 space-y-1">
        <p>{t("referralInfo1")}</p>
        <p>{t("referralInfo2")}</p>
        <p className="text-amber-400/70 mt-2">
          {t("referralComingSoon")}
        </p>
      </div>
    </GlassCard>
  );
}

export default ReferralSection;
