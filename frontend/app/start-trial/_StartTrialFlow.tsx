"use client";

/**
 * Direct-to-Stripe trial-start flow. Replaces the /pricing detour for
 * tier-specific "Start Free Trial" CTAs (only Advanced offers a trial).
 *
 * Branches the user can hit on mount:
 *   1. !user                         -> /login?redirect=/start-trial
 *   2. tier !== "rookie"             -> /pricing  (already paid; comparison view)
 *   3. has_used_trial                -> /pricing  ("Subscribe for $39" CTA, no surprise)
 *   4. trial-eligible, verified      -> Stripe Checkout (1 redirect, max conversion)
 *   5. trial-eligible, unverified    -> full-page verify-email screen with
 *                                       resend + "I already verified" buttons,
 *                                       auto-resumes checkout on confirm
 *
 * Backend is unchanged. /api/payments/create-checkout-session still owns
 * every safety gate (auth, has_used_trial, prior Stripe sub, card
 * fingerprint, disposable email, deliverable domain, recent INCOMPLETE
 * cooldown, advisory lock). This component only sequences the UX around
 * those gates.
 */

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import NavBar from "@/components/NavBar";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api";
import { ADVANCED_PRICE_ID } from "@/lib/site";
import { useTranslations } from "@/i18n/useTranslations";

type Phase = "loading" | "verifyEmail" | "error";

export default function StartTrialFlow() {
  const t = useTranslations("startTrial");
  const tVerify = useTranslations("auth.verifyEmail");
  const router = useRouter();
  const { user, refreshUser, loading: authLoading } = useAuth();
  const [phase, setPhase] = useState<Phase>("loading");
  const [resending, setResending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [statusKind, setStatusKind] = useState<"success" | "error" | "">("");
  const [statusMsg, setStatusMsg] = useState("");
  // Guards against React 18 StrictMode double-mounting the initial effect
  // and against any other race that could double-fire createCheckoutSession.
  const startedRef = useRef(false);

  const fireCheckout = async () => {
    setPhase("loading");
    try {
      const successUrl = `${window.location.origin}/pricing?success=true&tier=advanced`;
      const cancelUrl = `${window.location.origin}/pricing?canceled=true`;
      const { url, analytics_event_id } = await apiClient.createCheckoutSession(
        ADVANCED_PRICE_ID,
        successUrl,
        cancelUrl,
      );
      try {
        const { echoServerEvent } = await import("@/lib/analytics");
        echoServerEvent("InitiateCheckout", analytics_event_id ?? null, {
          value: 39,
          currency: "USD",
          content_name: "advanced",
        });
      } catch {
        // Tracking must never block checkout.
      }
      window.location.href = url;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      if (
        msg.includes("Could not validate credentials") ||
        msg.includes("Authentication required") ||
        msg.includes("401") ||
        msg.includes("Unauthorized")
      ) {
        router.push("/login?redirect=/start-trial");
        return;
      }
      if (msg.includes("email_verification_required")) {
        setPhase("verifyEmail");
        return;
      }
      setErrorMsg(msg || t("errorBody"));
      setPhase("error");
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (startedRef.current) return;
    startedRef.current = true;

    if (!user) {
      router.push("/login?redirect=/start-trial");
      return;
    }
    const tier = (user.tier || "").toLowerCase();
    if (tier !== "rookie") {
      router.push("/pricing");
      return;
    }
    if (user.has_used_trial) {
      router.push("/pricing");
      return;
    }
    void fireCheckout();
    // fireCheckout is stable for the life of this component; guarded by
    // startedRef so we don't need it in deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user, router]);

  const handleResend = async () => {
    setResending(true);
    setStatusMsg("");
    setStatusKind("");
    try {
      await apiClient.resendVerification();
      setStatusKind("success");
      setStatusMsg(tVerify("resendSuccess"));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : tVerify("resendError");
      setStatusKind("error");
      setStatusMsg(msg);
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
      // Re-fetch the profile directly to dodge the stale-closure problem on
      // `user` inside this render — refreshUser updates context state, but
      // we need the freshest is_verified value to decide whether to resume.
      const profile = await apiClient.getProfile();
      if (profile.is_verified) {
        await fireCheckout();
      } else {
        setStatusKind("error");
        setStatusMsg(tVerify("notYetVerified"));
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : tVerify("refreshError");
      setStatusKind("error");
      setStatusMsg(msg);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="min-h-screen bg-mambo-dark">
      <NavBar user={user || undefined} />
      <div className="flex items-center justify-center px-4 py-16 sm:py-24 pt-24 sm:pt-32">
        {phase === "loading" && (
          <div className="text-center max-w-md">
            <div
              className="mx-auto mb-6 h-12 w-12 rounded-full border-2 border-mambo-gold/40 border-t-mambo-gold animate-spin"
              role="status"
              aria-label={t("loadingTitle")}
            />
            <h1 className="text-2xl font-serif font-bold text-mambo-text mb-2">
              {t("loadingTitle")}
            </h1>
            <p className="text-sm text-gray-400">{t("loadingSubtitle")}</p>
          </div>
        )}

        {phase === "verifyEmail" && (
          <div className="w-full max-w-md text-center">
            <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-mambo-gold/15 text-mambo-gold text-2xl">
              ✉
            </span>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-mambo-text mb-3">
              {tVerify("modalTitle")}
            </h1>
            <p className="text-sm text-gray-300 mb-2">{tVerify("modalBody")}</p>
            <p className="text-sm text-mambo-text font-semibold mb-6">
              {tVerify("checkInboxHint")}
            </p>

            {statusMsg && (
              <div
                className={`mb-4 rounded-lg px-3 py-2 text-sm ${
                  statusKind === "success"
                    ? "bg-green-500/10 text-green-300 border border-green-500/30"
                    : "bg-red-500/10 text-red-300 border border-red-500/30"
                }`}
                role="status"
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
                {resending ? tVerify("resending") : tVerify("resendButton")}
              </button>
              <button
                onClick={handleAlreadyVerified}
                disabled={refreshing}
                className="flex-1 py-3 px-4 rounded-lg bg-[linear-gradient(135deg,#FCE205_0%,#D4AF37_100%)] hover:brightness-110 text-black font-bold text-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {refreshing ? tVerify("refreshing") : tVerify("alreadyVerifiedButton")}
              </button>
            </div>

            <Link
              href="/pricing"
              className="mt-6 inline-block text-xs text-gray-500 hover:text-gray-300 underline-offset-4 hover:underline"
            >
              {t("viewPricing")}
            </Link>
          </div>
        )}

        {phase === "error" && (
          <div className="w-full max-w-md text-center">
            <h1 className="text-2xl font-serif font-bold text-mambo-text mb-3">
              {t("errorTitle")}
            </h1>
            <p className="text-sm text-gray-300 mb-6">{errorMsg || t("errorBody")}</p>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                onClick={() => {
                  void fireCheckout();
                }}
                className="flex-1 py-3 px-4 rounded-lg border border-mambo-blue/50 text-mambo-text hover:bg-mambo-blue/10 font-bold text-sm transition"
              >
                {t("tryAgain")}
              </button>
              <Link
                href="/pricing"
                className="flex-1 py-3 px-4 rounded-lg bg-[linear-gradient(135deg,#FCE205_0%,#D4AF37_100%)] hover:brightness-110 text-black font-bold text-sm transition text-center"
              >
                {t("viewPricing")}
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
