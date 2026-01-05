"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { FaFire, FaBolt, FaMedal } from "react-icons/fa";
import { apiClient } from "@/lib/api";

export default function ProfilePage() {
  const { user, loading, logout, refreshUser } = useAuth();
  const router = useRouter();
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-mambo-dark flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Calculate XP needed for next level
  const currentLevelXP = Math.pow(user.level, 2) * 100;
  const nextLevelXP = Math.pow(user.level + 1, 2) * 100;
  const xpProgress = ((user.xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;

  const handleAvatarUpload = async (url: string | null) => {
    setUploadingAvatar(true);
    try {
      await apiClient.updateProfile({ avatar_url: url || null });
      await refreshUser();
    } catch (error) {
      console.error("Failed to update avatar:", error);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleAvatarRemove = async () => {
    setUploadingAvatar(true);
    try {
      await apiClient.updateProfile({ avatar_url: null });
      await refreshUser();
    } catch (error) {
      console.error("Failed to remove avatar:", error);
    } finally {
      setUploadingAvatar(false);
    }
  };

  return (
    <div className="min-h-screen bg-mambo-dark">
      <NavBar user={user} />

      <div className="max-w-5xl mx-auto px-8 py-12 pt-28">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-10 mb-16">
          <div className="flex flex-col items-center gap-4">
            <div className="relative group cursor-pointer">
              {user.avatar_url ? (
                <div className="w-32 h-32 rounded-full shadow-2xl overflow-hidden transition-transform group-hover:scale-105">
                  <Image
                    src={user.avatar_url}
                    alt={`${user.first_name} ${user.last_name}`}
                    width={128}
                    height={128}
                    className="w-full h-full object-cover object-center"
                  />
                </div>
              ) : (
                <div className="w-32 h-32 rounded-full shadow-2xl bg-mambo-blue flex items-center justify-center text-white text-4xl font-bold transition-transform group-hover:scale-105">
                  {user.first_name[0].toUpperCase()}
                </div>
              )}
              {/* Level badge - green and visible */}
              <div className="absolute bottom-1 right-1 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full border-2 border-white shadow-lg z-10">
                Lvl {user.level}
              </div>
              {/* Hover overlay with upload functionality */}
              <div className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center z-20">
                <div className="text-white text-sm font-semibold mb-1">Replace profile picture</div>
                <div className="text-white/80 text-xs">JPG, PNG, WebP (5MB max)</div>
              </div>
              {/* Hidden file input */}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-30"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  
                  // Check file size (5MB max)
                  if (file.size > 5 * 1024 * 1024) {
                    alert("File size must be less than 5MB");
                    return;
                  }
                  
                  setUploadingAvatar(true);
                  try {
                    // Get presigned URL
                    const { upload_url, public_url } = await apiClient.getPresignedUploadUrl(
                      file.type,
                      "avatars"
                    );
                    
                    // Upload to R2
                    await fetch(upload_url, {
                      method: "PUT",
                      body: file,
                      headers: {
                        "Content-Type": file.type,
                      },
                    });
                    
                    // Update profile immediately
                    await apiClient.updateProfile({ avatar_url: public_url });
                    // Refresh user data to update the UI
                    await refreshUser();
                  } catch (error) {
                    console.error("Failed to upload avatar:", error);
                    alert("Failed to upload image. Please try again.");
                  } finally {
                    setUploadingAvatar(false);
                    // Reset input
                    e.target.value = "";
                  }
                }}
                disabled={uploadingAvatar}
              />
            </div>
            {/* Remove image button */}
            {user.avatar_url && (
              <button
                onClick={handleAvatarRemove}
                disabled={uploadingAvatar}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Remove Image
              </button>
            )}
          </div>

          <div className="text-center md:text-left flex-1">
            <div className="flex flex-col sm:flex-row items-center sm:items-start sm:justify-between gap-3 mb-2">
              <h1 className="text-3xl font-bold text-mambo-text">
                {user.first_name} {user.last_name}
              </h1>
              <button
                onClick={() => {
                  logout();
                  router.push("/");
                }}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-sm font-bold text-gray-300 transition shrink-0"
              >
                Log Out
              </button>
            </div>
            <p className="text-gray-400 mb-8">Mambo Engineer • Member since 2024</p>

            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <div className="bg-mambo-panel border border-gray-800 px-4 py-2 rounded-lg flex items-center gap-3">
                <FaFire className="text-orange-500" />
                <div>
                  <div className="text-xs text-gray-500 uppercase font-bold">Streak</div>
                  <div className="font-bold text-mambo-text">{user.streak_count} Days</div>
                </div>
              </div>
              <div className="bg-mambo-panel border border-gray-800 px-4 py-2 rounded-lg flex items-center gap-3">
                <FaBolt className="text-mambo-gold" />
                <div>
                  <div className="text-xs text-gray-500 uppercase font-bold">XP</div>
                  <div className="font-bold text-mambo-text">{user.xp.toLocaleString()}</div>
                </div>
              </div>
              <div className="bg-mambo-panel border border-gray-800 px-4 py-2 rounded-lg flex items-center gap-3">
                <FaMedal className="text-blue-500" />
                <div>
                  <div className="text-xs text-gray-500 uppercase font-bold">Tier</div>
                  <div className="font-bold text-mambo-text capitalize">{user.tier}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Level Progress */}
        <div className="bg-mambo-panel border border-gray-800 rounded-xl p-6 mb-8">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-bold text-mambo-text">Level Progress</h2>
            <span className="text-gray-400 text-sm">
              {user.xp.toLocaleString()} / {nextLevelXP.toLocaleString()} XP
            </span>
          </div>
          <div className="w-full bg-gray-800 h-3 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-mambo-blue to-purple-600 h-full transition-all"
              style={{ width: `${Math.min(xpProgress, 100)}%` }}
            />
          </div>
          <p className="text-gray-400 text-sm mt-2">
            {Math.max(0, nextLevelXP - user.xp).toLocaleString()} XP until Level {user.level + 1}
          </p>
        </div>

        {/* Continue Learning Section */}
        <div>
          <h2 className="text-xl font-bold mb-6 text-mambo-text">Continue Learning</h2>
          <Link
            href="/courses"
            className="block bg-mambo-panel border border-gray-800 rounded-xl p-6 hover:border-gray-600 transition"
          >
            <div className="flex gap-6 items-center">
              <div className="w-32 h-20 bg-gray-800 rounded-lg overflow-hidden shrink-0">
                <Image
                  src="/assets/Mambo_image_1.png"
                  alt="Course"
                  width={128}
                  height={80}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-mambo-text mb-1">
                  Continue Your Journey
                </h3>
                <p className="text-sm text-gray-500 mb-3">
                  Explore all available worlds and lessons
                </p>
                <div className="w-full bg-gray-800 h-1.5 rounded-full">
                  <div className="bg-mambo-blue h-full w-[45%]" />
                </div>
              </div>
              <div className="w-10 h-10 rounded-full bg-mambo-blue flex items-center justify-center text-white shrink-0">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                </svg>
              </div>
            </div>
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}

