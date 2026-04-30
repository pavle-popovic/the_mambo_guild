"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import NavBar from "@/components/NavBar";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslations } from "@/i18n/useTranslations";

export default function RegisterPage() {
  const t = useTranslations("auth.register");
  // Pulls translated copy for backend-mirrored field errors so users on
  // non-English locales see the rule in their own language instead of the
  // raw English ValueError that Pydantic surfaces.
  const tErr = useTranslations("errors");
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setUsernameError("");
    setPasswordError("");
    setLoading(true);

    // Username validation must mirror backend (3-30 chars, [a-zA-Z0-9_] only).
    // Without this, the Pydantic ValueError comes back as a hard-coded English
    // string and surfaces verbatim to non-English users — confusing for anyone
    // browsing the site in es/it/de/etc. Catching it here lets us show the
    // already-translated `errors.usernameInvalid` copy in the user's locale.
    const username = formData.username;
    if (
      username.length < 3 ||
      username.length > 30 ||
      !/^[a-zA-Z0-9_]+$/.test(username)
    ) {
      setUsernameError(tErr("usernameInvalid"));
      setLoading(false);
      return;
    }

    // Client-side validation: passwords must match
    if (formData.password !== formData.confirmPassword) {
      setPasswordError(t("passwordMismatch"));
      setLoading(false);
      return;
    }

    // Password strength check — must mirror backend (length 8-72, letter + digit).
    // Without this, users get a 422 from Pydantic that returns a structured
    // detail array (not a plain string), which the API client surfaces as
    // gibberish — that's the "system accepted the password but login fails"
    // bug report.
    const pwd = formData.password;
    if (pwd.length < 8) {
      setPasswordError(t("passwordTooShort"));
      setLoading(false);
      return;
    }
    if (pwd.length > 72) {
      setPasswordError(t("passwordTooLong"));
      setLoading(false);
      return;
    }
    if (!/[a-zA-Z]/.test(pwd) || !/\d/.test(pwd)) {
      setPasswordError(t("passwordTooWeak"));
      setLoading(false);
      return;
    }

    try {
      await register({
        email: formData.email,
        username: formData.username,
        password: formData.password,
        confirm_password: formData.confirmPassword,
      });
      // Land on the post-signup verify-email screen so the user
      // immediately understands they have a verification email waiting.
      // Sending them straight to /courses (the old behavior) hid the
      // verification step entirely — they only discovered it later when
      // the trial CTA failed, which read as a bug. The new page offers
      // resend / "I already verified" / "browse free content" so they
      // always have a clear next action.
      router.push("/verify-email-sent");
    } catch (err: any) {
      setError(err.message || t("genericError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden">
      <NavBar />

      <div className="relative min-h-screen flex items-center justify-center pt-32 pb-16">

        <div className="relative z-10 w-full max-w-md bg-zinc-900/90 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl mx-4">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold mb-1 text-mambo-text">{t("title")}</h1>
            <p className="text-gray-400 text-sm">{t("subtitle")}</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-900/50 border border-red-500/50 rounded-lg text-red-200 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Handle / Username */}
            <div>
              <label className="block text-xs font-bold text-mambo-blue uppercase mb-1 drop-shadow-sm">
                {t("handleLabel")}
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => {
                  setFormData({ ...formData, username: e.target.value });
                  setUsernameError("");
                }}
                required
                minLength={3}
                maxLength={30}
                placeholder={t("handlePlaceholder")}
                className={`w-full bg-black/60 border rounded-lg p-3 text-white focus:ring-1 focus:outline-none transition shadow-inner ${usernameError ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-mambo-blue/50 focus:border-mambo-blue focus:ring-mambo-blue"}`}
              />
              {usernameError ? (
                <p className="text-xs text-red-400 mt-1">{usernameError}</p>
              ) : (
                <p className="text-[10px] text-gray-500 mt-1">{t("handleHelper")}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                {t("emailLabel")}
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
                className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-mambo-text-light focus:border-mambo-blue focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                {t("passwordLabel")}
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => {
                  setFormData({ ...formData, password: e.target.value });
                  setPasswordError("");
                }}
                required
                minLength={8}
                maxLength={72}
                className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-mambo-text-light focus:border-mambo-blue focus:outline-none transition"
              />
              <p className="text-xs text-gray-500 mt-1">{t("passwordHelper")}</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                {t("confirmPasswordLabel")}
              </label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => {
                  setFormData({ ...formData, confirmPassword: e.target.value });
                  setPasswordError("");
                }}
                required
                minLength={8}
                className={`w-full bg-black/50 border rounded-lg p-3 text-mambo-text-light focus:outline-none transition ${passwordError ? "border-red-500" : "border-white/10 focus:border-mambo-blue"
                  }`}
              />
              {passwordError && (
                <p className="text-xs text-red-400 mt-1">{passwordError}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-mambo-blue hover:bg-blue-600 text-white font-bold py-3 rounded-lg transition shadow-lg shadow-blue-600/20 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t("submitting") : t("submit")}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            {t("haveAccount")}{" "}
            <Link href="/login" className="text-mambo-text hover:underline">
              {t("loginLink")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

