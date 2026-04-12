"use client";

import { useState } from "react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

type Step = "closed" | "loss" | "price" | "confirm";

export default function SubscriptionManager() {
  const { user, refreshUser } = useAuth();
  const [step, setStep] = useState<Step>("closed");
  const [confirmInput, setConfirmInput] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!user) return null;

  const tier = (user.tier || "").toLowerCase();
  const isPaid = tier === "advanced" || tier === "performer";
  const isScheduledToCancel = user.subscription_cancel_at_period_end === true;
  const periodEnd = user.subscription_period_end
    ? new Date(user.subscription_period_end)
    : null;
  const periodEndLabel = periodEnd
    ? periodEnd.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })
    : null;

  if (!isPaid) return null;

  const planLabel = tier === "performer" ? "Guild Master" : "Pro";
  const planPrice = tier === "performer" ? "$59" : "$39";

  const close = () => {
    setStep("closed");
    setConfirmInput("");
  };

  const handleFinalCancel = async () => {
    setSubmitting(true);
    try {
      const res = await apiClient.cancelSubscription();
      if (res.success) {
        toast.success(res.message || "Subscription canceled.");
        await refreshUser();
        close();
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResume = async () => {
    setSubmitting(true);
    try {
      const res = await apiClient.resumeSubscription();
      if (res.success) {
        toast.success(res.message || "Subscription resumed.");
        await refreshUser();
      } else {
        toast.error("Could not resume subscription.");
      }
    } catch {
      toast.error("Could not resume subscription.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Billing footer — intentionally low-key at the very bottom of the profile */}
      <div className="mt-16 pt-8 border-t border-gray-900">
        <div className="text-[10px] uppercase tracking-widest text-gray-600 mb-2">
          Billing
        </div>
        {isScheduledToCancel ? (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-sm text-gray-400">
              Your <span className="text-amber-300 font-semibold">{planLabel}</span> plan is
              scheduled to end
              {periodEndLabel ? ` on ${periodEndLabel}` : ""}. You still have full access until
              then.
            </p>
            <button
              onClick={handleResume}
              disabled={submitting}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-bold text-sm hover:scale-[1.02] transition disabled:opacity-50"
            >
              {submitting ? "..." : "Resume subscription"}
            </button>
          </div>
        ) : (
          <button
            onClick={() => setStep("loss")}
            className="text-xs text-gray-600 hover:text-gray-400 underline underline-offset-4 transition"
          >
            Manage subscription
          </button>
        )}
      </div>

      {/* Step 1 — Loss framing */}
      {step === "loss" && (
        <ModalShell onClose={close}>
          <h2 className="text-2xl font-serif font-bold text-mambo-text mb-2">
            Before you go…
          </h2>
          <p className="text-gray-400 mb-5">
            Canceling <span className="text-amber-300 font-semibold">{planLabel}</span> means
            losing:
          </p>
          <ul className="space-y-3 mb-6">
            <LossItem>All Guild courses, choreos &amp; topics</LossItem>
            <LossItem>New bi-weekly choreographies as they drop</LossItem>
            <LossItem>Access to the Guild community</LossItem>
            <LossItem>Your weekly clave earnings boost</LossItem>
            <LossItem>Exclusive member badges you&apos;ve earned</LossItem>
            {tier === "performer" && (
              <LossItem>Monthly 1-on-1 video feedback from instructors</LossItem>
            )}
          </ul>
          <ModalButtons
            primary={{
              label: "Keep my subscription",
              onClick: close,
            }}
            secondary={{
              label: "I still want to cancel",
              onClick: () => setStep("price"),
            }}
          />
        </ModalShell>
      )}

      {/* Step 2 — Price-lock warning */}
      {step === "price" && (
        <ModalShell onClose={close}>
          <h2 className="text-2xl font-serif font-bold text-mambo-text mb-2">
            You&apos;re locked in at <span className="text-amber-300">{planPrice}/mo</span>
          </h2>
          <p className="text-gray-400 mb-5">
            This is the lowest price The Mambo Guild will ever offer.
          </p>
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 mb-6">
            <p className="text-sm text-amber-100/80 leading-relaxed">
              As we add more instructors, new choreographies, and expanded community features,
              pricing will go up. If you cancel today and rejoin next month — or next year — you
              will pay the new rate, not your founder rate. <span className="font-semibold text-amber-200">Your current price is guaranteed for as long as you stay subscribed.</span>
            </p>
          </div>
          <ModalButtons
            primary={{
              label: `Keep my ${planPrice}/mo rate`,
              onClick: close,
            }}
            secondary={{
              label: "I understand, continue",
              onClick: () => setStep("confirm"),
            }}
          />
        </ModalShell>
      )}

      {/* Step 3 — Type CANCEL */}
      {step === "confirm" && (
        <ModalShell onClose={close}>
          <h2 className="text-2xl font-serif font-bold text-mambo-text mb-2">
            Last step
          </h2>
          <p className="text-gray-400 mb-5">
            Type <span className="font-mono text-amber-300">CANCEL</span> below to confirm. Your
            access will continue until the end of your current billing period
            {periodEndLabel ? ` (${periodEndLabel})` : ""}.
          </p>
          <input
            type="text"
            value={confirmInput}
            onChange={(e) => setConfirmInput(e.target.value)}
            placeholder="Type CANCEL"
            className="w-full px-4 py-3 rounded-lg bg-mambo-panel border border-gray-800 text-mambo-text font-mono focus:outline-none focus:border-amber-500/50 mb-6"
            autoFocus
          />
          <ModalButtons
            primary={{
              label: "Never mind, keep it",
              onClick: close,
            }}
            secondary={{
              label: submitting ? "Canceling..." : "Cancel my subscription",
              onClick: handleFinalCancel,
              disabled: confirmInput.trim().toUpperCase() !== "CANCEL" || submitting,
            }}
          />
        </ModalShell>
      )}
    </>
  );
}

function LossItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3 text-sm text-gray-300">
      <span className="text-red-400 mt-0.5">✕</span>
      <span>{children}</span>
    </li>
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
        className="relative w-full max-w-md rounded-2xl bg-mambo-panel border border-gray-800 p-6 sm:p-8 shadow-2xl"
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

function ModalButtons({
  primary,
  secondary,
}: {
  primary: { label: string; onClick: () => void };
  secondary: { label: string; onClick: () => void; disabled?: boolean };
}) {
  return (
    <div className="flex flex-col gap-3">
      <button
        onClick={primary.onClick}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-bold shadow-lg shadow-amber-500/20 hover:scale-[1.02] transition"
      >
        {primary.label}
      </button>
      <button
        onClick={secondary.onClick}
        disabled={secondary.disabled}
        className="w-full py-2 text-xs text-gray-600 hover:text-gray-400 underline underline-offset-4 transition disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-gray-600"
      >
        {secondary.label}
      </button>
    </div>
  );
}
