"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { FaStar } from "react-icons/fa";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

export default function ReviewSubmitModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { user } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!open) return;
    const fullName = user ? `${user.first_name} ${user.last_name}`.trim() : "";
    setName(fullName);
    setEmail("");
    setRole("");
    setMessage("");
    setRating(5);
    setHoverRating(0);
    setError(null);
    setSubmitted(false);
  }, [open, user]);

  if (!open) return null;

  const canSubmit =
    name.trim().length >= 2 &&
    /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim()) &&
    message.trim().length >= 20 &&
    rating >= 1 &&
    rating <= 5 &&
    !submitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      await apiClient.submitReview({
        name: name.trim(),
        email: email.trim(),
        rating,
        role: role.trim() || null,
        message: message.trim(),
        page_url: typeof window !== "undefined" ? window.location.href : "",
      });
      setSubmitted(true);
    } catch (err: any) {
      setError(
        err?.detail ||
          err?.message ||
          "Something went wrong sending your review. Please try again or email support@themamboguild.com directly."
      );
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
                Thank you for the review!
              </h2>
              <p className="text-sm text-white/70 mb-6">
                Your review just landed in Pavle&apos;s inbox. He reads every single one and will reply to ask before publishing it on the site.
              </p>
              <button
                onClick={onClose}
                className="px-6 py-2 rounded-full bg-amber-400 text-black font-semibold hover:bg-amber-300 transition"
              >
                Close
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-white font-bold text-xl mb-1">
                Share your experience
              </h2>
              <p className="text-white/60 text-sm mb-5">
                Tell us how The Mambo Guild has shaped your dance journey. Your review goes straight to Pavle.
              </p>

              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1.5">
                    Your rating
                  </label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const filled = (hoverRating || rating) >= star;
                      return (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="p-1 transition-transform hover:scale-110"
                          aria-label={`${star} star${star > 1 ? "s" : ""}`}
                        >
                          <FaStar
                            className={`w-7 h-7 transition-colors ${
                              filled ? "text-amber-400" : "text-white/20"
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1">
                    Your name
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
                    Your email
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

                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1">
                    Your dance background <span className="text-white/40 font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    maxLength={200}
                    placeholder="e.g. 3 years On2, instructor, beginner..."
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1">
                    Your review
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    maxLength={4000}
                    rows={5}
                    required
                    placeholder="What did you love? What changed for you?"
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none resize-none"
                  />
                  <p className="mt-1 text-[11px] text-white/40">
                    {message.trim().length} / 20 characters minimum
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
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!canSubmit}
                    className="flex-1 px-4 py-2 rounded-full bg-amber-400 text-black font-semibold hover:bg-amber-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    {submitting ? "Sending..." : "Send review"}
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
