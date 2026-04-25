"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { ADVANCED_PRICE_ID } from "@/lib/site";

// State-of-the-art subscription management.
// - Single-step cancel modal with equal-weight buttons (no "type CANCEL" gate,
//   no 3-step funnel) so the cancel path is at-least-as-easy-as-signup, in
//   line with FTC click-to-cancel and EU/UK consumer rules.
// - Status-driven hero: surfaces trialing / cancel-scheduled / past-due
//   inline so the user always sees what's happening before they act.
// - Stripe Customer Portal handles card update / invoices / address — we
//   don't reimplement any of that.

type Modal = null | "cancel" | "downgrade";

const PERFORMER_LABEL = "Guild Master";
const ADVANCED_LABEL = "Pro";

export default function SubscriptionManager() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const [modal, setModal] = useState<Modal>(null);
  const [submitting, setSubmitting] = useState<null | string>(null);

  if (!user) return null;

  const tier = (user.tier || "").toLowerCase();
  const status = (user.subscription_status || "").toLowerCase();

  const isPerformer = tier === "performer";
  const isAdvanced = tier === "advanced";
  const isPaidTier = isPerformer || isAdvanced;
  const isScheduledToCancel = !!user.subscription_cancel_at_period_end;
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

  const planLabel = isPerformer ? PERFORMER_LABEL : ADVANCED_LABEL;
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
      toast.error(err?.message || "Could not open the billing portal.");
      setSubmitting(null);
    }
  };

  const handleCancel = async () => {
    setSubmitting("cancel");
    try {
      const res = await apiClient.cancelSubscription();
      if (res.success) {
        toast.success(res.message || "Subscription scheduled to end.");
        await refreshUser();
        close();
      } else {
        toast.error("Could not cancel. Try again.");
      }
    } catch (err: any) {
      toast.error(err?.message || "Could not cancel. Try again.");
    } finally {
      setSubmitting(null);
    }
  };

  const handleResume = async () => {
    setSubmitting("resume");
    try {
      const res = await apiClient.resumeSubscription();
      if (res.success) {
        toast.success(res.message || "Subscription resumed.");
        await refreshUser();
      } else {
        toast.error("Could not resume.");
      }
    } catch (err: any) {
      toast.error(err?.message || "Could not resume.");
    } finally {
      setSubmitting(null);
    }
  };

  const handleDowngrade = async () => {
    setSubmitting("downgrade");
    try {
      await apiClient.updateSubscription(ADVANCED_PRICE_ID);
      await refreshUser();
      toast.success("Switched to Pro.");
      close();
    } catch (err: any) {
      console.error("Downgrade failed:", err);
      toast.error(err?.message || "Could not switch plans.");
    } finally {
      setSubmitting(null);
    }
  };

  // ---- Past-due: show recovery card ONLY. No plan label (tier was revoked),
  // no cancel/resume controls — fixing billing is the only action that
  // makes sense here.
  if (isPastDue) {
    return (
      <section id="subscription" aria-labelledby="subscription-heading" className="scroll-mt-24">
        <h2
          id="subscription-heading"
          className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3"
        >
          Subscription
        </h2>
        <div className="rounded-2xl border border-red-500/40 bg-red-500/5 p-5 sm:p-6">
          <div className="flex items-start gap-3 mb-3">
            <span className="text-red-300 text-xl leading-none">⚠</span>
            <div>
              <p className="text-base font-semibold text-red-100">
                Your last renewal payment failed.
              </p>
              <p className="text-sm text-red-200/80 mt-1">
                Premium access has been paused. Update your card and the
                subscription will resume automatically.
              </p>
            </div>
          </div>
          <button
            onClick={handleManageBilling}
            disabled={submitting === "portal"}
            className="px-4 py-2.5 rounded-lg bg-gradient-to-r from-mambo-gold via-yellow-500 to-orange-500 hover:from-yellow-400 hover:via-yellow-500 hover:to-orange-400 text-black font-bold text-sm shadow-lg shadow-amber-500/20 transition disabled:opacity-50"
          >
            {submitting === "portal" ? "Opening..." : "Update payment method"}
          </button>
        </div>
      </section>
    );
  }

  // ---- Active / trialing / scheduled-to-cancel
  return (
    <>
      <section id="subscription" aria-labelledby="subscription-heading" className="scroll-mt-24">
        <h2
          id="subscription-heading"
          className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3"
        >
          Subscription
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
              <span className="text-sm font-normal text-gray-500">/mo</span>
            </span>
          </div>

          {/* Status banner — exactly one of these renders */}
          {isScheduledToCancel && periodEndLabel && (
            <div className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2.5">
              <p className="text-sm text-amber-100">
                Your subscription ends on{" "}
                <span className="font-semibold text-amber-50">
                  {periodEndLabel}
                </span>
                . You'll keep full access until then.
              </p>
            </div>
          )}
          {!isScheduledToCancel && isTrialing && periodEndLabel && (
            <div className="mb-4 rounded-lg border border-blue-500/30 bg-blue-500/10 px-3 py-2.5">
              <p className="text-sm text-blue-100">
                Free trial active. First charge of{" "}
                <span className="font-semibold text-blue-50">{planPrice}</span>{" "}
                on{" "}
                <span className="font-semibold text-blue-50">
                  {periodEndLabel}
                </span>
                .
              </p>
            </div>
          )}
          {!isScheduledToCancel && !isTrialing && periodEndLabel && (
            <p className="text-sm text-gray-400 mb-4">
              Renews on{" "}
              <span className="text-gray-200 font-semibold">
                {periodEndLabel}
              </span>
              .
            </p>
          )}

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleManageBilling}
              disabled={submitting === "portal"}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-mambo-gold via-yellow-500 to-orange-500 hover:from-yellow-400 hover:via-yellow-500 hover:to-orange-400 text-black font-bold text-sm shadow-lg shadow-amber-500/20 transition disabled:opacity-50"
            >
              {submitting === "portal" ? "Opening..." : "Manage billing"}
            </button>

            {isAdvanced && !isScheduledToCancel && (
              <button
                onClick={() => router.push("/pricing")}
                className="px-4 py-2 rounded-lg border border-gray-700 bg-gray-900/60 text-mambo-text font-semibold text-sm hover:bg-gray-800 transition"
              >
                Upgrade to Guild Master
              </button>
            )}

            {isPerformer && !isScheduledToCancel && (
              <button
                onClick={() => setModal("downgrade")}
                className="px-4 py-2 rounded-lg border border-gray-700 bg-gray-900/60 text-mambo-text font-semibold text-sm hover:bg-gray-800 transition"
              >
                Switch to Pro
              </button>
            )}

            {isScheduledToCancel ? (
              <button
                onClick={handleResume}
                disabled={submitting === "resume"}
                className="px-4 py-2 rounded-lg border border-amber-500/40 bg-amber-500/10 text-amber-200 font-semibold text-sm hover:bg-amber-500/20 transition disabled:opacity-50"
              >
                {submitting === "resume" ? "Resuming..." : "Resume subscription"}
              </button>
            ) : (
              <button
                onClick={() => setModal("cancel")}
                className="px-4 py-2 rounded-lg border border-gray-700 text-gray-300 font-semibold text-sm hover:bg-gray-800/60 hover:text-mambo-text transition"
              >
                Cancel subscription
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Cancel modal — single step, equal-weight buttons. */}
      {modal === "cancel" && (
        <ModalShell onClose={close}>
          <h2 className="text-xl font-serif font-bold text-mambo-text mb-2">
            Cancel your {planLabel} subscription?
          </h2>
          <p className="text-sm text-gray-400 mb-3">
            {periodEndLabel ? (
              <>
                You'll keep full access until{" "}
                <span className="text-mambo-text font-semibold">
                  {periodEndLabel}
                </span>
                , then drop to the free Rookie tier.
              </>
            ) : (
              "You'll lose premium access at the end of your current billing period."
            )}
          </p>
          <p className="text-xs text-gray-500 mb-5">
            Your XP, badges, streaks and progress stay with you. You can
            resubscribe any time.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              onClick={close}
              className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-mambo-gold to-orange-500 text-black font-bold text-sm hover:scale-[1.02] transition"
            >
              Keep my subscription
            </button>
            <button
              onClick={handleCancel}
              disabled={submitting === "cancel"}
              className="flex-1 py-2.5 rounded-lg border border-gray-700 bg-gray-900/60 text-gray-200 font-semibold text-sm hover:bg-gray-800 hover:text-mambo-text transition disabled:opacity-50"
            >
              {submitting === "cancel"
                ? "Cancelling..."
                : "Cancel subscription"}
            </button>
          </div>
        </ModalShell>
      )}

      {/* Downgrade modal — Performer → Pro. */}
      {modal === "downgrade" && (
        <ModalShell onClose={close}>
          <h2 className="text-xl font-serif font-bold text-mambo-text mb-2">
            Switch from Guild Master to Pro?
          </h2>
          <p className="text-sm text-gray-400 mb-4">
            You'll keep full Guild Master access for the rest of this billing
            cycle, then move to Pro at $39/mo.
          </p>
          <ul className="space-y-2 mb-5 text-sm">
            <li className="flex items-start gap-2 text-gray-300">
              <span className="text-red-400 mt-0.5 leading-none">−</span>
              <span>Lose 1-on-1 video coaching</span>
            </li>
            <li className="flex items-start gap-2 text-gray-300">
              <span className="text-red-400 mt-0.5 leading-none">−</span>
              <span>Lose Roundtable Zoom calls</span>
            </li>
            <li className="flex items-start gap-2 text-gray-300">
              <span className="text-red-400 mt-0.5 leading-none">−</span>
              <span>Free up your Guild Master seat (capped at 30)</span>
            </li>
            <li className="flex items-start gap-2 text-gray-300">
              <span className="text-mambo-gold mt-0.5 leading-none">+</span>
              <span>Keep all Pro features and full course access</span>
            </li>
          </ul>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              onClick={close}
              className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-mambo-gold to-orange-500 text-black font-bold text-sm hover:scale-[1.02] transition"
            >
              Stay on Guild Master
            </button>
            <button
              onClick={handleDowngrade}
              disabled={submitting === "downgrade"}
              className="flex-1 py-2.5 rounded-lg border border-gray-700 bg-gray-900/60 text-gray-200 font-semibold text-sm hover:bg-gray-800 hover:text-mambo-text transition disabled:opacity-50"
            >
              {submitting === "downgrade" ? "Switching..." : "Switch to Pro"}
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
}: {
  children: React.ReactNode;
  onClose: () => void;
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
          aria-label="Close"
        >
          ×
        </button>
        {children}
      </div>
    </div>
  );
}
