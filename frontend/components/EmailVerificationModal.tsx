"use client";

/**
 * Modal shown when an unverified user tries to claim their free trial.
 *
 * Two ways the modal opens:
 *   1. Backend returns 400 "email_verification_required" on
 *      /api/payments/create-checkout-session — caller catches the error
 *      and sets isOpen.
 *   2. Anywhere we want to proactively gate a free-trial CTA before the
 *      round-trip — check `user.is_verified === false` and open it.
 *
 * Two actions inside the modal:
 *   - "Resend email" → POST /api/auth/send-verification (rate-limited to 3
 *     per 10 min per email backend-side, so feel free to expose this).
 *   - "I already verified" → calls refreshUser; if the backend now reports
 *     is_verified=true the modal closes itself and runs onVerified() so the
 *     caller can continue the original action (start checkout, etc.).
 */

import { useState } from "react";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslations } from "@/i18n/useTranslations";

interface EmailVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Called when refresh reveals is_verified=true. Caller can resume work. */
  onVerified?: () => void;
}

export default function EmailVerificationModal({
  isOpen,
  onClose,
  onVerified,
}: EmailVerificationModalProps) {
  const t = useTranslations("auth.verifyEmail");
  const { user, refreshUser } = useAuth();
  const [resending, setResending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string>("");
  const [statusKind, setStatusKind] = useState<"success" | "error" | "">("");

  if (!isOpen) return null;

  const handleResend = async () => {
    setResending(true);
    setStatusMsg("");
    setStatusKind("");
    try {
      await apiClient.resendVerification();
      setStatusKind("success");
      setStatusMsg(t("resendSuccess"));
    } catch (err: any) {
      setStatusKind("error");
      setStatusMsg(err?.message || t("resendError"));
    } finally {
      setResending(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setStatusMsg("");
    setStatusKind("");
    try {
      await refreshUser();
      // Caller-supplied profile lives in context — re-read after refresh.
      // Use a microtask delay so React has flushed the new state.
      await new Promise((r) => setTimeout(r, 0));
      // We can't read the freshest user inside this closure (stale closure
      // problem). Instead, re-fetch the profile directly to make the decision
      // here; if verified, close + onVerified.
      const profile = await apiClient.getProfile();
      if (profile.is_verified) {
        onClose();
        onVerified?.();
      } else {
        setStatusKind("error");
        setStatusMsg(t("notYetVerified"));
      }
    } catch (err: any) {
      setStatusKind("error");
      setStatusMsg(err?.message || t("refreshError"));
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl bg-mambo-panel border border-gray-800 p-6 sm:p-7 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-600 hover:text-gray-300 text-xl leading-none"
          aria-label={t("close")}
        >
          ×
        </button>

        <div className="flex items-center gap-3 mb-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-mambo-gold/15 text-mambo-gold text-xl">
            ✉
          </span>
          <h2 className="text-xl font-serif font-bold text-mambo-text">
            {t("modalTitle")}
          </h2>
        </div>

        <p className="text-sm text-gray-300 mb-2">{t("modalBody")}</p>
        {user?.username && (
          <p className="text-sm text-mambo-text font-semibold mb-4 break-all">
            {/* The /me payload doesn't include the email itself for privacy
                in places where the profile is shown publicly. The hint here
                ("check the inbox you signed up with") is enough — the user
                always knows their own address. */}
            {t("checkInboxHint")}
          </p>
        )}

        {statusMsg && (
          <div
            className={`mb-4 rounded-lg px-3 py-2 text-sm ${
              statusKind === "success"
                ? "bg-green-500/10 text-green-300 border border-green-500/30"
                : "bg-red-500/10 text-red-300 border border-red-500/30"
            }`}
          >
            {statusMsg}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <button
            onClick={handleResend}
            disabled={resending}
            className="flex-1 py-3 px-4 rounded-lg border border-mambo-blue/50 text-mambo-text hover:bg-mambo-blue/10 font-bold text-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {resending ? t("resending") : t("resendButton")}
          </button>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex-1 py-3 px-4 rounded-lg bg-[linear-gradient(135deg,#FCE205_0%,#D4AF37_100%)] hover:brightness-110 text-black font-bold text-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {refreshing ? t("refreshing") : t("alreadyVerifiedButton")}
          </button>
        </div>
      </div>
    </div>
  );
}
