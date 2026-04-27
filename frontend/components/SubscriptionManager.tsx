"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslations } from "@/i18n/useTranslations";
import { ADVANCED_PRICE_ID } from "@/lib/site";

// State-of-the-art subscription management.
// - Single-step cancel modal with equal-weight buttons (no "type CANCEL" gate,
//   no 3-step funnel) so the cancel path is at-least-as-easy-as-signup, in
//   line with FTC click-to-cancel and EU/UK consumer rules.
// - Status-driven hero: surfaces trialing / cancel-scheduled / past-due /
//   downgrade-scheduled inline so the user always sees what's happening.
// - Stripe Customer Portal handles card update / invoices / address — we
//   don't reimplement any of that.

type Modal = null | "cancel" | "downgrade";

export default function SubscriptionManager() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const t = useTranslations("profile.subscription");
  const [modal, setModal] = useState<Modal>(null);
  const [submitting, setSubmitting] = useState<null | string>(null);

  if (!user) return null;

  const tier = (user.tier || "").toLowerCase();
  const status = (user.subscription_status || "").toLowerCase();

  const isPerformer = tier === "performer";
  const isAdvanced = tier === "advanced";
  const isPaidTier = isPerformer || isAdvanced;
  const isScheduledToCancel = !!user.subscription_cancel_at_period_end;
  const isScheduledToDowngrade = !!user.subscription_scheduled_tier;
  const isTrialing = status === "trialing";
  const isPastDue = status === "past_due";

  // Render for: any paid tier, OR a past-due user (their tier was revoked
  // to ROOKIE by the past_due webhook but they still have billing state to
  // recover from). Free Rookies with no Stripe history see nothing.
  if (!isPaidTier && !isPastDue) return null;

  const periodEnd = user.subscription_period_end
    ? new Date(user.subscription_period_end)
    : null;
  const periodEndLabel = periodEnd
    ? periodEnd.toLocaleDateString(undefined, {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  // Plan label is translated via the brand-name keys; price stays a literal
  // because Stripe-billed amounts shouldn't drift between locales.
  const planLabel = isPerformer ? t("planPerformer") : t("planAdvanced");
  const planPrice = isPerformer ? "$59" : "$39";

  const close = () => setModal(null);

  const handleManageBilling = async () => {
    setSubmitting("portal");
    try {
      const returnUrl = `${window.location.origin}/profile`;
      const { url } = await apiClient.createPortalSession(returnUrl);
      window.location.href = url;
    } catch (err: any) {
      console.error("Portal session failed:", err);
      toast.error(err?.message || t("toastPortalError"));
      setSubmitting(null);
    }
  };

  const handleCancel = async () => {
    setSubmitting("cancel");
    try {
      const res = await apiClient.cancelSubscription();
      if (res.success) {
        toast.success(res.message || t("toastCancelSuccess"));
        await refreshUser();
        close();
      } else {
        toast.error(t("toastCancelError"));
      }
    } catch (err: any) {
      toast.error(err?.message || t("toastCancelError"));
    } finally {
      setSubmitting(null);
    }
  };

  const handleResume = async () => {
    setSubmitting("resume");
    try {
      const res = await apiClient.resumeSubscription();
      if (res.success) {
        toast.success(res.message || t("toastResumeSuccess"));
        await refreshUser();
      } else {
        toast.error(t("toastResumeError"));
      }
    } catch (err: any) {
      toast.error(err?.message || t("toastResumeError"));
    } finally {
      setSubmitting(null);
    }
  };

  const handleDowngrade = async () => {
    setSubmitting("downgrade");
    try {
      await apiClient.updateSubscription(ADVANCED_PRICE_ID);
      await refreshUser();
      toast.success(t("toastDowngradeSuccess"));
      close();
    } catch (err: any) {
      console.error("Downgrade failed:", err);
      toast.error(err?.message || t("toastDowngradeError"));
    } finally {
      setSubmitting(null);
    }
  };

  const handleKeepGuildMaster = async () => {
    setSubmitting("keepGuildMaster");
    try {
      const res = await apiClient.cancelScheduledDowngrade();
      if (res.success) {
        toast.success(t("toastDowngradeCanceled"));
        await refreshUser();
      } else {
        toast.error(t("toastDowngradeError"));
      }
    } catch (err: any) {
      toast.error(err?.message || t("toastDowngradeError"));
    } finally {
      setSubmitting(null);
    }
  };

  // ---- Past-due: show recovery card ONLY. No plan label (tier was revoked),
  // no cancel/resume controls — fixing billing is the only action that
  // makes sense here.
  if (isPastDue) {
    return (
      <section
        id="subscription"
        aria-labelledby="subscription-heading"
        className="scroll-mt-24"
      >
        <h2
          id="subscription-heading"
          className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3"
        >
          {t("heading")}
        </h2>
        <div className="rounded-2xl border border-red-500/40 bg-red-500/5 p-5 sm:p-6">
          <div className="flex items-start gap-3 mb-3">
            <span className="text-red-300 text-xl leading-none">⚠</span>
            <div>
              <p className="text-base font-semibold text-red-100">
                {t("pastDueTitle")}
              </p>
              <p className="text-sm text-red-200/80 mt-1">
                {t("pastDueBody")}
              </p>
            </div>
          </div>
          <button
            onClick={handleManageBilling}
            disabled={submitting === "portal"}
            className="px-4 py-2.5 rounded-lg bg-gradient-to-r from-mambo-gold via-yellow-500 to-orange-500 hover:from-yellow-400 hover:via-yellow-500 hover:to-orange-400 text-black font-bold text-sm shadow-lg shadow-amber-500/20 transition disabled:opacity-50"
          >
            {submitting === "portal" ? t("opening") : t("updatePayment")}
          </button>
        </div>
      </section>
    );
  }

  // ---- Active / trialing / scheduled-to-cancel / scheduled-to-downgrade
  return (
    <>
      <section
        id="subscription"
        aria-labelledby="subscription-heading"
        className="scroll-mt-24"
      >
        <h2
          id="subscription-heading"
          className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3"
        >
          {t("heading")}
        </h2>

        <div className="rounded-2xl border border-gray-800 bg-mambo-panel p-5 sm:p-6">
          {/* Plan badge + price */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span
              className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                isPerformer
                  ? "bg-mambo-gold/15 text-mambo-gold border border-mambo-gold/30"
                  : "bg-blue-500/15 text-blue-300 border border-blue-500/30"
              }`}
            >
              {planLabel}
            </span>
            <span className="text-2xl font-bold text-mambo-text leading-none">
              {planPrice}
              <span className="text-sm font-normal text-gray-500">{t("pricePerMonth")}</span>
            </span>
          </div>

          {/* Status banner — exactly one of these renders */}
          {isScheduledToCancel && periodEndLabel && (
            <div className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2.5">
              <p className="text-sm text-amber-100">
                {t("endsOn", { date: periodEndLabel })}
              </p>
            </div>
          )}
          {!isScheduledToCancel && isScheduledToDowngrade && periodEndLabel && (
            <div className="mb-4 rounded-lg border border-orange-500/30 bg-orange-500/10 px-3 py-2.5">
              <p className="text-sm text-orange-100">
                {t("downgradeScheduledOn", { date: periodEndLabel })}
              </p>
            </div>
          )}
          {!isScheduledToCancel && !isScheduledToDowngrade && isTrialing && periodEndLabel && (
            <div className="mb-4 rounded-lg border border-blue-500/30 bg-blue-500/10 px-3 py-2.5">
              <p className="text-sm text-blue-100">
                {t("trialingBanner", { price: planPrice, date: periodEndLabel })}
              </p>
            </div>
          )}
          {!isScheduledToCancel && !isScheduledToDowngrade && !isTrialing && periodEndLabel && (
            <p className="text-sm text-gray-400 mb-4">
              {t("renewsOn", { date: periodEndLabel })}
            </p>
          )}

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleManageBilling}
              disabled={submitting === "portal"}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-mambo-gold via-yellow-500 to-orange-500 hover:from-yellow-400 hover:via-yellow-500 hover:to-orange-400 text-black font-bold text-sm shadow-lg shadow-amber-500/20 transition disabled:opacity-50"
            >
              {submitting === "portal" ? t("opening") : t("manageBilling")}
            </button>

            {isAdvanced && !isScheduledToCancel && (
              <button
                onClick={() => router.push("/pricing")}
                className="px-4 py-2 rounded-lg border border-gray-700 bg-gray-900/60 text-mambo-text font-semibold text-sm hover:bg-gray-800 transition"
              >
                {t("upgradeToGuildMaster")}
              </button>
            )}

            {/* Performer: show "Switch to Pro" only when no downgrade/cancel is pending */}
            {isPerformer && !isScheduledToCancel && !isScheduledToDowngrade && (
              <button
                onClick={() => setModal("downgrade")}
                className="px-4 py-2 rounded-lg border border-gray-700 bg-gray-900/60 text-mambo-text font-semibold text-sm hover:bg-gray-800 transition"
              >
                {t("switchToPro")}
              </button>
            )}

            {/* Performer with pending downgrade: show "Keep Guild Master" CTA */}
            {isPerformer && isScheduledToDowngrade && !isScheduledToCancel && (
              <button
                onClick={handleKeepGuildMaster}
                disabled={submitting === "keepGuildMaster"}
                className="px-4 py-2 rounded-lg border border-mambo-gold/40 bg-mambo-gold/10 text-mambo-gold font-semibold text-sm hover:bg-mambo-gold/20 transition disabled:opacity-50"
              >
                {submitting === "keepGuildMaster" ? t("switching") : t("keepGuildMaster")}
              </button>
            )}

            {isScheduledToCancel ? (
              <button
                onClick={handleResume}
                disabled={submitting === "resume"}
                className="px-4 py-2 rounded-lg border border-amber-500/40 bg-amber-500/10 text-amber-200 font-semibold text-sm hover:bg-amber-500/20 transition disabled:opacity-50"
              >
                {submitting === "resume" ? t("resuming") : t("resumeSubscription")}
              </button>
            ) : (
              <button
                onClick={() => setModal("cancel")}
                className="px-4 py-2 rounded-lg border border-gray-700 text-gray-300 font-semibold text-sm hover:bg-gray-800/60 hover:text-mambo-text transition"
              >
                {t("cancelSubscription")}
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Cancel modal — single step, equal-weight buttons. */}
      {modal === "cancel" && (
        <ModalShell onClose={close} closeAria={t("modalClose")}>
          <h2 className="text-xl font-serif font-bold text-mambo-text mb-2">
            {t("cancelTitle", { plan: planLabel })}
          </h2>
          <p className="text-sm text-gray-400 mb-3">
            {periodEndLabel
              ? t("cancelBodyWithDate", { date: periodEndLabel })
              : t("cancelBodyNoDate")}
          </p>
          <p className="text-xs text-gray-500 mb-5">{t("cancelKeepPromise")}</p>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              onClick={close}
              className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-mambo-gold via-yellow-500 to-orange-500 hover:from-yellow-400 hover:via-yellow-500 hover:to-orange-400 text-black font-bold text-sm shadow-lg shadow-amber-500/20 transition"
            >
              {t("keepSubscription")}
            </button>
            <button
              onClick={handleCancel}
              disabled={submitting === "cancel"}
              className="flex-1 py-2.5 rounded-lg border border-gray-700 bg-gray-900/60 text-gray-200 font-semibold text-sm hover:bg-gray-800 hover:text-mambo-text transition disabled:opacity-50"
            >
              {submitting === "cancel" ? t("cancelling") : t("cancelSubscription")}
            </button>
          </div>
        </ModalShell>
      )}

      {/* Downgrade modal — Performer to Pro. Deferred: takes effect at period end, no refund. */}
      {modal === "downgrade" && (
        <ModalShell onClose={close} closeAria={t("modalClose")}>
          <h2 className="text-xl font-serif font-bold text-mambo-text mb-2">
            {t("downgradeTitle")}
          </h2>
          <p className="text-sm text-gray-400 mb-4">
            {periodEndLabel
              ? t("confirmDowngradeBody", { date: periodEndLabel })
              : t("downgradeBody")}
          </p>
          <ul className="space-y-2 mb-5 text-sm">
            <li className="flex items-start gap-2 text-gray-300">
              <span className="text-red-400 mt-0.5 leading-none">−</span>
              <span>{t("downgradeLose1")}</span>
            </li>
            <li className="flex items-start gap-2 text-gray-300">
              <span className="text-red-400 mt-0.5 leading-none">−</span>
              <span>{t("downgradeLose2")}</span>
            </li>
            <li className="flex items-start gap-2 text-gray-300">
              <span className="text-red-400 mt-0.5 leading-none">−</span>
              <span>{t("downgradeLose3")}</span>
            </li>
            <li className="flex items-start gap-2 text-gray-300">
              <span className="text-mambo-gold mt-0.5 leading-none">+</span>
              <span>{t("downgradeKeep1")}</span>
            </li>
          </ul>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              onClick={close}
              className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-mambo-gold via-yellow-500 to-orange-500 hover:from-yellow-400 hover:via-yellow-500 hover:to-orange-400 text-black font-bold text-sm shadow-lg shadow-amber-500/20 transition"
            >
              {t("stayOnGuildMaster")}
            </button>
            <button
              onClick={handleDowngrade}
              disabled={submitting === "downgrade"}
              className="flex-1 py-2.5 rounded-lg border border-gray-700 bg-gray-900/60 text-gray-200 font-semibold text-sm hover:bg-gray-800 hover:text-mambo-text transition disabled:opacity-50"
            >
              {submitting === "downgrade" ? t("switching") : t("switchToPro")}
            </button>
          </div>
        </ModalShell>
      )}
    </>
  );
}

function ModalShell({
  children,
  onClose,
  closeAria,
}: {
  children: React.ReactNode;
  onClose: () => void;
  closeAria: string;
}) {
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
          aria-label={closeAria}
        >
          ×
        </button>
        {children}
      </div>
    </div>
  );
}
