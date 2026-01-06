"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import NavBar from "@/components/NavBar";
import { useAuth } from "@/contexts/AuthContext";

const LEVEL_OPTIONS = [
  { value: "Beginner", label: "Total Beginner (Two Left Feet)" },
  { value: "Novice", label: "Novice (I know the basic step)" },
  { value: "Intermediate", label: "Intermediate (Social Dancer)" },
  { value: "Advanced", label: "Advanced (Performer)" },
];

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    currentLevelTag: "Beginner",
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
        password: formData.password,
        confirm_password: formData.confirmPassword,
        first_name: formData.firstName,
        last_name: formData.lastName,
        current_level_tag: formData.currentLevelTag,
      });
      router.push("/courses");
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-mambo-dark relative overflow-hidden">
      <NavBar />
      
      <div className="relative min-h-screen flex items-center justify-center pt-32 pb-16">
        <div className="absolute inset-0 z-0">
          <Image
            src="/assets/Mambo_image_1.png"
            alt="Background"
            fill
            className="object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
        </div>

        <div className="relative z-10 w-full max-w-md bg-zinc-900/90 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl mx-4">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold mb-1 text-mambo-text">Create Account</h1>
          <p className="text-gray-400 text-sm">Join 10,000+ dancers worldwide.</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-500/50 rounded-lg text-red-200 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                First Name
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                required
                className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-mambo-text-light focus:border-mambo-blue focus:outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                Last Name
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                required
                className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-mambo-text-light focus:border-mambo-blue focus:outline-none transition"
              />
            </div>
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
              Current Level
            </label>
            <select
              value={formData.currentLevelTag}
              onChange={(e) =>
                setFormData({ ...formData, currentLevelTag: e.target.value })
              }
              className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-mambo-text-light focus:border-mambo-blue focus:outline-none transition appearance-none"
            >
              {LEVEL_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
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
              className={`w-full bg-black/50 border rounded-lg p-3 text-mambo-text-light focus:outline-none transition ${
                passwordError ? "border-red-500" : "border-white/10 focus:border-mambo-blue"
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

