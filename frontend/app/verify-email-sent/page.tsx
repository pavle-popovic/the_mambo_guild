"use client";

/**
 * Post-signup landing page. The /register flow pushes here instead of
 * straight to /courses so the user immediately understands they have a
 * verification email waiting and what to do with it.
 *
 * The user IS logged in by this point (registration creates a session),
 * so they can choose to:
 *   - Verify now (click the link in the email they just got)
 *   - Resend the email if it didn't arrive
 *   - "I already verified" -> re-fetch /me, navigate to /pricing if
 *     is_verified flipped to true (covers users who clicked the link
 *     in another tab)
 *   - Browse free content first (skip verification for now; the trial
 *     CTA on /pricing will surface the verify-email modal later)
 *
 * OAuth signups skip this page entirely — they're auto-verified by the
 * provider and the OAuth callback redirects them straight to /courses.
 *
 * i18n: reuses the existing auth.verifyEmail namespace so we don't
 * duplicate strings across 16 locales.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import NavBar from "@/components/NavBar";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslations } from "@/i18n/useTranslations";

export default function VerifyEmailSentPage() {
  const t = useTranslations("auth.verifyEmail");
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [resending, setResending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [statusKind, setStatusKind] = useState<"success" | "error" | "">("");

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

  const handleAlreadyVerified = async () => {
    setRefreshing(true);
    setStatusMsg("");
    setStatusKind("");
    try {
      await refreshUser();
      // refreshUser writes into context; read the freshest profile via a
      // direct call so we make the routing decision without a stale-
      // closure problem. (Same pattern as EmailVerificationModal.)
      const profile = await apiClient.getProfile();
      if (profile.is_verified) {
        router.push("/pricing");
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
    <div className="min-h-screen bg-mambo-dark relative overflow-hidden">
      <NavBar />

      <div className="relative min-h-screen flex items-center justify-center pt-32 pb-16">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        >
          <source src="/assets/Background_video.mp4" type="video/mp4" />
        </video>

        <div className="relative z-10 w-full max-w-md bg-black/80 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl mx-4 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-mambo-gold/15 text-mambo-gold text-3xl">
            ✉
          </div>
          <h1 className="text-2xl font-bold text-mambo-text mb-2">
            {t("modalTitle")}
          </h1>
          <p className="text-sm text-gray-300 mb-1">{t("modalBody")}</p>
          <p className="text-xs text-gray-500 mb-6">{t("checkInboxHint")}</p>

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

          <div className="flex flex-col gap-3 mb-4">
            <button
              onClick={handleAlreadyVerified}
              disabled={refreshing}
              className="w-full py-3 px-4 rounded-lg bg-[linear-gradient(135deg,#FCE205_0%,#D4AF37_100%)] hover:brightness-110 text-black font-bold text-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {refreshing ? t("refreshing") : t("alreadyVerifiedButton")}
            </button>
            <button
              onClick={handleResend}
              disabled={resending}
              className="w-full py-3 px-4 rounded-lg border border-mambo-blue/50 text-mambo-text hover:bg-mambo-blue/10 font-bold text-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resending ? t("resending") : t("resendButton")}
            </button>
          </div>

          <Link
            href="/courses"
            className="text-sm text-gray-500 hover:text-mambo-text transition underline-offset-4 hover:underline"
          >
            {t("browseFreeCta")}
          </Link>
        </div>
      </div>
    </div>
  );
}
