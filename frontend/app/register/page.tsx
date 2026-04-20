"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import NavBar from "@/components/NavBar";
import { useAuth } from "@/contexts/AuthContext";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setPasswordError("");
    setLoading(true);

    // Client-side validation: passwords must match
    if (formData.password !== formData.confirmPassword) {
      setPasswordError("Passwords do not match");
      setLoading(false);
      return;
    }

    // Password strength check
    if (formData.password.length < 8) {
      setPasswordError("Password must be at least 8 characters long");
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
      router.push("/courses");
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
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
            <h1 className="text-2xl font-bold mb-1 text-mambo-text">Join The Stage</h1>
            <p className="text-gray-400 text-sm">Create your dancer profile.</p>
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
                Choose your Handle (Username)
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                required
                minLength={3}
                placeholder="e.g. MamboKing"
                className="w-full bg-black/60 border border-mambo-blue/50 rounded-lg p-3 text-white focus:border-mambo-blue focus:ring-1 focus:ring-mambo-blue focus:outline-none transition shadow-inner"
              />
              <p className="text-[10px] text-gray-500 mt-1">This is how you will appear in the community.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                Email
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
                Password
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
                className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-mambo-text-light focus:border-mambo-blue focus:outline-none transition"
              />
              <p className="text-xs text-gray-500 mt-1">Must be at least 8 characters</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                Confirm Password
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
              {loading ? "Creating account..." : "Start My Journey"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link href="/login" className="text-mambo-text hover:underline">
              Log in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

