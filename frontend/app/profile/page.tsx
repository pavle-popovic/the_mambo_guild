"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { FaFire, FaBolt, FaMedal } from "react-icons/fa";

export default function ProfilePage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

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

  return (
    <div className="min-h-screen bg-mambo-dark">
      <NavBar user={user} />

      <div className="max-w-5xl mx-auto px-8 py-12 pt-28">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-10 mb-16">
          <div className="relative">
            {user.avatar_url ? (
              <Image
                src={user.avatar_url}
                alt={`${user.first_name} ${user.last_name}`}
                width={128}
                height={128}
                className="w-32 h-32 rounded-full border-4 border-mambo-panel shadow-2xl"
              />
            ) : (
              <div className="w-32 h-32 rounded-full border-4 border-mambo-panel shadow-2xl bg-mambo-blue flex items-center justify-center text-white text-4xl font-bold">
                {user.first_name[0].toUpperCase()}
              </div>
            )}
            <div className="absolute bottom-1 right-1 bg-mambo-gold text-black text-xs font-bold px-2 py-1 rounded-full border border-black">
              Lvl {user.level}
            </div>
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

