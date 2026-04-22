"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api";
import { useTranslations } from "@/i18n/useTranslations";
import { useAuth } from "@/contexts/AuthContext";

/**
 * "Apply to become a Guild Ambassador" modal, triggered from the
 * instructors page. Posts to /api/support/ambassador-application,
 * which forwards the payload to pavlepopovic@themamboguild.com.
 *
 * Unauthenticated-friendly: the form pre-fills from the logged-in
 * user when available but doesn't require auth to submit.
 */
export default function AmbassadorApplyModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const t = useTranslations("ambassador");
  const { user } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [instagram, setInstagram] = useState("");
  const [location, setLocation] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!open) return;
    // Pre-fill from logged-in user on open
    const fullName = user ? `${user.first_name} ${user.last_name}`.trim() : "";
    setName(fullName);
    setEmail("");
    setInstagram(user?.instagram_url ?? "");
    setLocation("");
    setMessage("");
    setError(null);
    setSubmitted(false);
  }, [open, user]);

  if (!open) return null;

  const canSubmit =
    name.trim().length >= 2 &&
    /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim()) &&
    message.trim().length >= 20 &&
    !submitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      await apiClient.submitAmbassadorApplication({
        name: name.trim(),
        email: email.trim(),
        instagram_url: instagram.trim() || null,
        location: location.trim() || null,
        message: message.trim(),
        page_url: typeof window !== "undefined" ? window.location.href : "",
      });
      setSubmitted(true);
    } catch (err: any) {
      setError(err?.detail || err?.message || t("genericError"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, y: 10 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 10 }}
          className="w-full max-w-lg rounded-2xl border border-white/10 bg-neutral-950 p-6 max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {submitted ? (
            <div className="text-center py-4">
              <div className="text-4xl mb-3">🎉</div>
              <h2 className="text-xl font-bold text-white mb-2">
                {t("successTitle")}
              </h2>
              <p className="text-sm text-white/70 mb-6">{t("successBody")}</p>
              <button
                onClick={onClose}
                className="px-6 py-2 rounded-full bg-amber-400 text-black font-semibold hover:bg-amber-300 transition"
              >
                {t("close")}
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-white font-bold text-xl mb-1">{t("title")}</h2>
              <p className="text-white/60 text-sm mb-5">{t("subtitle")}</p>

              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1">
                    {t("nameLabel")}
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={120}
                    required
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1">
                    {t("emailLabel")}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    maxLength={320}
                    required
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-white/70 mb-1">
                      {t("instagramLabel")}
                    </label>
                    <input
                      type="text"
                      value={instagram}
                      onChange={(e) => setInstagram(e.target.value)}
                      maxLength={300}
                      placeholder={t("instagramPlaceholder")}
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-white/70 mb-1">
                      {t("locationLabel")}
                    </label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      maxLength={200}
                      placeholder={t("locationPlaceholder")}
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1">
                    {t("messageLabel")}
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    maxLength={4000}
                    rows={5}
                    required
                    placeholder={t("messagePlaceholder")}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none resize-none"
                  />
                  <p className="mt-1 text-[11px] text-white/40">
                    {t("messageHint", { count: message.trim().length })}
                  </p>
                </div>

                {error && (
                  <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-md px-3 py-2">
                    {error}
                  </p>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={submitting}
                    className="flex-1 px-4 py-2 rounded-full border border-white/15 text-white/80 hover:bg-white/5 transition disabled:opacity-50"
                  >
                    {t("cancel")}
                  </button>
                  <button
                    type="submit"
                    disabled={!canSubmit}
                    className="flex-1 px-4 py-2 rounded-full bg-amber-400 text-black font-semibold hover:bg-amber-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    {submitting ? t("sending") : t("submit")}
                  </button>
                </div>
              </form>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
