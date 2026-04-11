"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { FaFire, FaBolt, FaMedal, FaStar, FaCheck, FaSignOutAlt } from "react-icons/fa";
import { apiClient } from "@/lib/api";
import { BadgeTrophyCase } from "@/components/BadgeTrophyCase";
import { ReferralSection } from "@/components/ReferralSection";

interface Course {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  thumbnail_url?: string | null;
  difficulty: string;
  progress_percentage: number;
  is_locked: boolean;
}

interface Lesson {
  id: string;
  title: string;
  is_completed: boolean;
  is_locked: boolean;
  order_index: number;
  week_number: number | null;
  day_number: number | null;
}

export default function ProfilePage() {
  const { user, loading, logout, refreshUser } = useAuth();
  const router = useRouter();
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [activeCourses, setActiveCourses] = useState<Array<Course & { nextLessonId: string | null }>>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

  // Username Editing
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [updatingUsername, setUpdatingUsername] = useState(false);
  const [usernameError, setUsernameError] = useState("");

  const handleUpdateUsername = async () => {
    if (!newUsername || newUsername.length < 3) {
      setUsernameError("Username must be at least 3 characters");
      return;
    }

    setUpdatingUsername(true);
    setUsernameError("");

    try {
      await apiClient.updateProfile({ username: newUsername });
      await refreshUser();
      setIsEditingUsername(false);
    } catch (error: any) {
      console.error("Failed to update username:", error);
      if (error.message && error.message.includes("Detail:")) {
        setUsernameError(error.message);
      } else {
        setUsernameError(error.message || "Failed to update username. Try another one.");
      }
    } finally {
      setUpdatingUsername(false);
    }
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      loadActiveCourses();
    }
  }, [user]);

  const loadActiveCourses = async () => {
    try {
      setLoadingCourses(true);
      const allCourses = await apiClient.getWorlds();

      // Filter courses with progress > 0 (courses user is currently doing)
      const coursesWithProgress = allCourses.filter(course => course.progress_percentage > 0 && !course.is_locked);

      // For each course, find the next uncompleted lesson
      const coursesWithNextLesson = await Promise.all(
        coursesWithProgress.map(async (course) => {
          try {
            const lessons = await apiClient.getWorldLessons(course.id);
            const nextLesson = lessons.find(l => !l.is_completed && !l.is_locked);
            return {
              ...course,
              nextLessonId: nextLesson?.id || null
            };
          } catch (error) {
            console.error(`Failed to load lessons for course ${course.id}:`, error);
            return {
              ...course,
              nextLessonId: null
            };
          }
        })
      );

      setActiveCourses(coursesWithNextLesson);
    } catch (error) {
      console.error("Failed to load active courses:", error);
      setActiveCourses([]);
    } finally {
      setLoadingCourses(false);
    }
  };

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
      await apiClient.updateProfile({ avatar_url: url || undefined });
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
      await apiClient.updateProfile({ avatar_url: undefined });
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

      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-3 lg:py-12 pt-[72px] lg:pt-28">

        {/* ===== MOBILE CHARACTER SHEET (< lg) ===== */}
        <div className="lg:hidden space-y-3 mb-6">

          {/* 1. Character Header */}
          <div className="flex items-center gap-3 relative">
            {/* Avatar */}
            <div className="relative group cursor-pointer shrink-0">
              {user.avatar_url ? (
                <div className="w-12 h-12 rounded-full overflow-hidden shadow-lg">
                  <Image
                    src={user.avatar_url}
                    alt={user.username || `${user.first_name} ${user.last_name}`}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover object-center"
                  />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-full bg-mambo-blue flex items-center justify-center text-white text-lg font-bold">
                  {(user.username?.[0] || user.first_name[0]).toUpperCase()}
                </div>
              )}
              {/* Level badge */}
              <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-green-500 text-white text-[9px] font-bold rounded-full border-2 border-mambo-dark flex items-center justify-center z-10">
                {user.level}
              </div>
              {/* Camera overlay — always slightly visible on mobile */}
              <div className="absolute inset-0 rounded-full bg-black/40 opacity-50 flex items-center justify-center z-20">
                <svg className="w-3.5 h-3.5 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-30"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  if (file.size > 5 * 1024 * 1024) { alert("File size must be less than 5MB"); return; }
                  setUploadingAvatar(true);
                  try {
                    const { upload_url, public_url } = await apiClient.getPresignedUploadUrl(file.type, "avatars");
                    await fetch(upload_url, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
                    await apiClient.updateProfile({ avatar_url: public_url });
                    await refreshUser();
                  } catch (error) { console.error("Failed to upload avatar:", error); alert("Failed to upload image. Please try again."); }
                  finally { setUploadingAvatar(false); e.target.value = ""; }
                }}
                disabled={uploadingAvatar}
              />
            </div>

            {/* Identity */}
            <div className="flex-1 min-w-0">
              {isEditingUsername ? (
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="bg-black/40 border border-gray-600 rounded px-2 py-1 text-white text-sm font-bold flex-1 min-w-0 focus:ring-1 focus:ring-mambo-gold focus:border-transparent outline-none"
                    placeholder="Username"
                    autoFocus
                  />
                  <button onClick={handleUpdateUsername} disabled={updatingUsername} className="px-2 py-1 bg-green-600 text-white text-xs rounded font-bold disabled:opacity-50">
                    {updatingUsername ? "..." : "Save"}
                  </button>
                  <button onClick={() => { setIsEditingUsername(false); setNewUsername(user.username || ""); setUsernameError(""); }} className="px-2 py-1 bg-gray-700 text-white text-xs rounded">
                    X
                  </button>
                </div>
              ) : (
                <>
                  <div className="text-base font-bold text-mambo-text truncate">
                    {user.first_name} {user.last_name}
                  </div>
                  <button
                    onClick={() => { setNewUsername(user.username || ""); setIsEditingUsername(true); }}
                    className="text-xs text-gray-500 truncate block"
                  >
                    @{user.username || `${user.first_name}${user.last_name}`}
                  </button>
                </>
              )}
              {usernameError && <div className="text-red-500 text-[10px] mt-0.5">{usernameError}</div>}
              <div className="inline-flex items-center gap-1 mt-0.5 text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-full border border-mambo-gold/30 text-mambo-gold bg-mambo-gold/10">
                <FaMedal className="text-[8px]" />
                <span className="capitalize">{user.tier}</span>
              </div>
            </div>

            {/* Logout button */}
            <button
              onClick={() => { logout(); router.push("/"); }}
              className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-red-400 transition shrink-0"
              title="Log Out"
            >
              <FaSignOutAlt className="text-sm" />
            </button>
          </div>

          {/* 2. Level Progress Bar */}
          <div className="bg-mambo-panel border border-gray-800 rounded-lg p-3">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-sm font-bold text-mambo-gold">LVL {user.level}</span>
              <span className="text-xs text-gray-400">{user.xp.toLocaleString()} / {nextLevelXP.toLocaleString()} XP</span>
            </div>
            <div className="w-full bg-gray-800 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-mambo-blue to-mambo-purple h-full rounded-full transition-all"
                style={{ width: `${Math.min(xpProgress, 100)}%` }}
              />
            </div>
            <p className="text-[10px] text-gray-500 mt-1">
              {Math.max(0, nextLevelXP - user.xp).toLocaleString()} XP to Level {user.level + 1}
            </p>
          </div>

          {/* 3. Stats Grid 3x2 */}
          <div className="grid grid-cols-3 gap-1.5">
            <div className="bg-mambo-panel border border-gray-800/60 rounded-lg p-2 flex flex-col items-center text-center">
              <FaFire className="text-sm text-orange-500 mb-0.5" />
              <span className="text-[9px] text-gray-500 uppercase font-semibold tracking-wider">Streak</span>
              <span className="text-sm font-bold text-mambo-text">{user.streak_count}d</span>
            </div>
            <div className="bg-mambo-panel border border-gray-800/60 rounded-lg p-2 flex flex-col items-center text-center">
              <FaBolt className="text-sm text-mambo-gold mb-0.5" />
              <span className="text-[9px] text-gray-500 uppercase font-semibold tracking-wider">XP</span>
              <span className="text-sm font-bold text-mambo-text">{user.xp.toLocaleString()}</span>
            </div>
            <div className="bg-mambo-panel border border-gray-800/60 rounded-lg p-2 flex flex-col items-center text-center">
              <FaMedal className="text-sm text-blue-500 mb-0.5" />
              <span className="text-[9px] text-gray-500 uppercase font-semibold tracking-wider">Tier</span>
              <span className="text-sm font-bold text-mambo-text capitalize">{user.tier}</span>
            </div>
            <div className="bg-mambo-panel border border-gray-800/60 rounded-lg p-2 flex flex-col items-center text-center">
              <FaStar className="text-sm text-yellow-400 mb-0.5" />
              <span className="text-[9px] text-gray-500 uppercase font-semibold tracking-wider">Rep</span>
              <span className="text-sm font-bold text-mambo-text">{user.reputation}</span>
            </div>
            <div className="bg-mambo-panel border border-gray-800/60 rounded-lg p-2 flex flex-col items-center text-center">
              <span className="text-sm mb-0.5">🥢</span>
              <span className="text-[9px] text-gray-500 uppercase font-semibold tracking-wider">Claves</span>
              <span className="text-sm font-bold text-mambo-text">{user.current_claves}</span>
            </div>
            <div className="bg-mambo-panel border border-gray-800/60 rounded-lg p-2 flex flex-col items-center text-center">
              <FaCheck className="text-sm text-green-500 mb-0.5" />
              <span className="text-[9px] text-gray-500 uppercase font-semibold tracking-wider">Solved</span>
              <span className="text-sm font-bold text-mambo-text">{user.stats?.solutions_accepted ?? 0}</span>
            </div>
          </div>

          {/* 4. Community Stats Row */}
          {user.stats && (
            <div className="flex gap-2">
              <div className="flex-1 bg-mambo-panel/50 border border-gray-800/40 rounded-lg px-3 py-2 flex items-center justify-between">
                <span className="text-[10px] text-gray-500">Reactions Given</span>
                <span className="text-sm font-bold text-white">{user.stats.reactions_given}</span>
              </div>
              <div className="flex-1 bg-mambo-panel/50 border border-gray-800/40 rounded-lg px-3 py-2 flex items-center justify-between">
                <span className="text-[10px] text-gray-500">Reactions Received</span>
                <span className="text-sm font-bold text-white">{user.stats.reactions_received}</span>
              </div>
            </div>
          )}

        </div>

        {/* ===== DESKTOP LAYOUT (existing, unchanged) ===== */}
        <div className="hidden lg:block">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-5 sm:gap-10 mb-8 sm:mb-16">
            <div className="flex flex-col items-center gap-4">
              <div className="relative group cursor-pointer">
                {user.avatar_url ? (
                  <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full shadow-2xl overflow-hidden transition-transform group-hover:scale-105">
                    <Image
                      src={user.avatar_url}
                      alt={user.username || `${user.first_name} ${user.last_name}`}
                      width={128}
                      height={128}
                      className="w-full h-full object-cover object-center"
                    />
                  </div>
                ) : (
                  <div className="w-32 h-32 rounded-full shadow-2xl bg-mambo-blue flex items-center justify-center text-white text-4xl font-bold transition-transform group-hover:scale-105">
                    {(user.username?.[0] || user.first_name[0]).toUpperCase()}
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
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Remove Image
                </button>
              )}
            </div>

            <div className="text-center md:text-left flex-1">
              <div className="flex flex-col sm:flex-row items-center sm:items-start sm:justify-between gap-3 mb-2">
                {isEditingUsername ? (
                  <div className="flex items-center gap-2">
                    <div className="flex flex-col gap-1">
                      <input
                        type="text"
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        className="bg-black/40 border border-gray-600 rounded-lg px-3 py-1 text-white text-xl font-bold w-full max-w-xs focus:ring-2 focus:ring-mambo-gold focus:border-transparent outline-none"
                        placeholder="Enter new username"
                        autoFocus
                      />
                      <span className="text-xs text-gray-500">3-30 chars, letters/numbers only</span>
                    </div>
                    <button
                      onClick={handleUpdateUsername}
                      disabled={updatingUsername}
                      className="p-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition disabled:opacity-50"
                    >
                      {updatingUsername ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        "Save"
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingUsername(false);
                        setNewUsername(user.username || "");
                        setUsernameError("");
                      }}
                      disabled={updatingUsername}
                      className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 group/username">
                    <h1 className="text-xl sm:text-3xl font-bold text-mambo-text break-all">
                      @{user.username || `${user.first_name}${user.last_name}`}
                    </h1>
                    <button
                      onClick={() => {
                        setNewUsername(user.username || "");
                        setIsEditingUsername(true);
                      }}
                      className="opacity-0 group-hover/username:opacity-100 p-1.5 text-gray-400 hover:text-white transition-all transform hover:scale-110"
                      title="Edit Username"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                  </div>
                )}
                {usernameError && <div className="text-red-500 text-sm mt-1 mb-2">{usernameError}</div>}

                <div className="flex gap-2 mt-2 sm:mt-0">
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
              </div>
              <p className="text-gray-400 mb-8">Mambo Engineer • Member since 2024</p>

              <div className="flex flex-wrap justify-center md:justify-start gap-2 sm:gap-4">
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
                {/* Gamification Stats */}
                <div className="bg-mambo-panel border border-gray-800 px-4 py-2 rounded-lg flex items-center gap-3">
                  <FaStar className="text-yellow-400" />
                  <div>
                    <div className="text-xs text-gray-500 uppercase font-bold">Reputation</div>
                    <div className="font-bold text-mambo-text">{user.reputation}</div>
                  </div>
                </div>
                <div className="bg-mambo-panel border border-gray-800 px-4 py-2 rounded-lg flex items-center gap-3">
                  <span className="text-lg">🥢</span>
                  <div>
                    <div className="text-xs text-gray-500 uppercase font-bold">Claves</div>
                    <div className="font-bold text-mambo-text">{user.current_claves}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Stats Row */}
          {user.stats && (
            <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6 sm:mb-8">
              <div className="bg-mambo-panel border border-gray-800 p-2.5 sm:p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-0.5">
                <span className="text-gray-400 text-[11px] sm:text-sm font-medium">Reactions Given</span>
                <span className="text-white font-bold text-lg">{user.stats.reactions_given}</span>
              </div>
              <div className="bg-mambo-panel border border-gray-800 p-2.5 sm:p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-0.5">
                <span className="text-gray-400 text-[11px] sm:text-sm font-medium">Reactions Received</span>
                <span className="text-white font-bold text-lg">{user.stats.reactions_received}</span>
              </div>
              <div className="bg-mambo-panel border border-gray-800 p-2.5 sm:p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-0.5">
                <span className="text-gray-400 text-[11px] sm:text-sm font-medium">Solutions Accepted</span>
                <span className="text-white font-bold text-lg">{user.stats.solutions_accepted}</span>
              </div>
            </div>
          )}

          {/* Level Progress */}
          <div className="bg-mambo-panel border border-gray-800 rounded-xl p-4 sm:p-6 mb-6 sm:mb-8">
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
        </div>

        {/* Shared sections — on mobile: badges first, referrals, then continue learning (at bottom) */}
        {/* On desktop: continue learning, badges, referrals (original order) */}
        <div className="flex flex-col">
          {/* Badge Trophy Case — order 1 on mobile, order 1 on desktop (same) */}
          <div className="mt-5 sm:mt-8 order-1 lg:order-2">
            <BadgeTrophyCase
              initialBadges={user.badges}
              streakCount={user.streak_count}
              userStats={user.stats}
            />
          </div>

          {/* Referral Section */}
          <div className="mt-5 sm:mt-8 order-2 lg:order-3">
            <ReferralSection />
          </div>

          {/* Continue Learning Section — last on mobile, first on desktop */}
          <div className="order-3 lg:order-1">
            <h2 className="text-xl font-bold mb-6 text-mambo-text">Continue Learning</h2>

            {loadingCourses ? (
              <div className="text-center text-gray-400 py-8">Loading your courses...</div>
            ) : activeCourses.length === 0 ? (
              <Link
                href="/courses"
                className="block bg-mambo-panel border border-gray-800 rounded-xl p-6 hover:border-gray-600 transition group"
              >
                <div className="flex gap-6 items-center">
                  <div className="w-32 h-20 bg-gray-800 rounded-lg overflow-hidden shrink-0">
                    <Image
                      src="/assets/Mambo_image_1.png"
                      alt="Course"
                      width={128}
                      height={80}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-mambo-text mb-1">
                      Start Your Journey
                    </h3>
                    <p className="text-sm text-gray-500 mb-3">
                      Explore all available worlds and lessons
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-mambo-blue flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                    </svg>
                  </div>
                </div>
              </Link>
            ) : (
              <div className="space-y-4">
                {activeCourses.map((course) => (
                  <Link
                    key={course.id}
                    href={course.nextLessonId ? `/lesson/${course.nextLessonId}` : `/courses/${course.id}`}
                    className="block bg-mambo-panel border border-gray-800 rounded-xl p-4 sm:p-6 hover:border-blue-500/60 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300 group"
                  >
                    <div className="flex flex-row gap-4 sm:gap-6 items-center">
                      <div className="w-24 sm:w-32 h-16 sm:h-20 bg-gray-800 rounded-lg overflow-hidden shrink-0 relative">
                        {course.thumbnail_url || course.image_url ? (
                          <Image
                            src={course.thumbnail_url || course.image_url || ""}
                            alt={course.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <Image
                            src="/assets/Mambo_image_1.png"
                            alt={course.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            style={{ objectPosition: 'center 15%' }}
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg text-mambo-text mb-1 group-hover:text-mambo-blue transition-colors">
                          {course.title}
                        </h3>
                        {course.description && (
                          <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                            {course.description}
                          </p>
                        )}
                        <div className="flex items-center gap-3">
                          <div className="flex-1 bg-gray-800 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-mambo-blue to-purple-600 h-full transition-all duration-500"
                              style={{ width: `${Math.min(course.progress_percentage, 100)}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-gray-400 whitespace-nowrap">
                            {Math.round(course.progress_percentage)}%
                          </span>
                        </div>
                      </div>
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-mambo-blue to-purple-600 flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform shadow-lg shadow-blue-500/30">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

