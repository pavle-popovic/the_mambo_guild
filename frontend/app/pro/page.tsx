"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  Music,
  Video,
  Download,
  Snowflake,
  Crown,
  Lock,
  ArrowRight,
  Loader2,
  CheckCircle,
  Zap,
  Play,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ProBadgeLarge } from "@/components/ui/ProBadge";
import StreakFreezeStore from "@/components/StreakFreezeStore";
import Link from "next/link";

export default function ProDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"overview" | "downloads" | "freezes" | "mixer">("overview");
  const [downloadStatus, setDownloadStatus] = useState<{
    downloads_used: number;
    downloads_remaining: number;
    downloads_limit: number;
  } | null>(null);

  // Check if user is Pro (Advanced tier) or higher
  const isPro = user?.tier === "advanced" || user?.tier === "performer";
  const isGuildMaster = user?.tier === "performer";

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }
    if (!authLoading && user && !isPro) {
      router.push("/pricing");
      return;
    }
  }, [user, authLoading, router, isPro]);

  useEffect(() => {
    if (isPro) {
      loadDownloadStatus();
    }
  }, [isPro]);

  const loadDownloadStatus = async () => {
    try {
      const status = await apiClient.getDownloadStatus();
      setDownloadStatus(status);
    } catch (error) {
      console.error("Failed to load download status:", error);
    }
  };

  if (authLoading || !user || !isPro) {
    return (
      <div className="min-h-screen bg-mambo-dark flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mambo-dark">
      <NavBar user={user} />

      <div className="max-w-7xl mx-auto px-4 py-12 pt-28">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <ProBadgeLarge />
          <div>
            <h1 className="text-4xl font-bold text-white">Pro Dashboard</h1>
            <p className="text-gray-400">
              Welcome back, {user.first_name}! Explore your Pro benefits.
            </p>
          </div>
          {isGuildMaster && (
            <Link
              href="/guild-master"
              className="ml-auto flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-400/30 text-amber-300 hover:from-amber-500/30 hover:to-yellow-500/30 transition-all"
            >
              <Crown size={18} />
              <span className="font-semibold">Guild Master Hub</span>
              <ArrowRight size={16} />
            </Link>
          )}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700 mb-8 overflow-x-auto">
          {[
            { id: "overview", label: "Overview", icon: Star },
            { id: "downloads", label: "Downloads", icon: Download },
            { id: "freezes", label: "Streak Freezes", icon: Snowflake },
            { id: "mixer", label: "DJ Booth", icon: Music },
          ].map((tab) => (
            <button
              key={tab.id}
              className={cn(
                "px-6 py-3 text-sm font-semibold transition-colors whitespace-nowrap flex items-center gap-2",
                activeTab === tab.id
                  ? "text-blue-400 border-b-2 border-blue-400"
                  : "text-gray-400 hover:text-white"
              )}
              onClick={() => setActiveTab(tab.id as any)}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {/* Pro Benefits Cards */}
              <FeatureCard
                title="Video Controls"
                description="Speed control, frame-by-frame stepping, and A-B loop for perfect practice."
                icon={Play}
                status="unlocked"
                onClick={() => router.push("/courses")}
              />
              <FeatureCard
                title="Secure Downloads"
                description={`Download videos for offline practice. ${downloadStatus?.downloads_remaining ?? 5}/${downloadStatus?.downloads_limit ?? 5} remaining today.`}
                icon={Download}
                status="unlocked"
                onClick={() => setActiveTab("downloads")}
              />
              <FeatureCard
                title="Streak Freezes"
                description="Protect your streak when life gets busy with weekly freebies and inventory."
                icon={Snowflake}
                status="unlocked"
                onClick={() => setActiveTab("freezes")}
              />
              <FeatureCard
                title="DJ Booth Preview"
                description="Hear isolated salsa instruments. Full access with Guild Master."
                icon={Music}
                status={isGuildMaster ? "unlocked" : "preview"}
                onClick={() => setActiveTab("mixer")}
              />
              <FeatureCard
                title="20 Video Slots"
                description="Upload up to 20 videos to the community Stage (vs 5 for free)."
                icon={Video}
                status="unlocked"
              />
              <FeatureCard
                title="Priority Support"
                description="Get faster responses from our team when you need help."
                icon={Zap}
                status="unlocked"
              />
              
              {/* Guild Master Upsell */}
              {!isGuildMaster && (
                <motion.div
                  className="md:col-span-2 lg:col-span-3 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-400/30 rounded-xl p-6"
                  whileHover={{ scale: 1.01 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-lg bg-amber-500/20">
                        <Crown size={32} className="text-amber-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">
                          Upgrade to Guild Master
                        </h3>
                        <p className="text-gray-400">
                          Get weekly live calls, 1-on-1 video coaching, full DJ Booth access, and the exclusive crown badge!
                        </p>
                      </div>
                    </div>
                    <Link
                      href="/pricing"
                      className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-bold hover:from-amber-400 hover:to-yellow-400 transition-all"
                    >
                      Upgrade Now
                      <ArrowRight size={18} />
                    </Link>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {activeTab === "downloads" && (
            <motion.div
              key="downloads"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="max-w-2xl">
                <h2 className="text-2xl font-bold text-white mb-4">Secure Video Downloads</h2>
                <p className="text-gray-400 mb-6">
                  Download lesson videos for offline practice. All links are personalized 
                  to your account and expire after 1 hour to prevent unauthorized sharing.
                </p>

                {/* Download Status Card */}
                <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-300">Today's Downloads</span>
                    <span className="text-2xl font-bold text-white">
                      {downloadStatus?.downloads_used ?? 0} / {downloadStatus?.downloads_limit ?? 5}
                    </span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="h-3 bg-gray-800 rounded-full overflow-hidden mb-4">
                    <motion.div
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                      initial={{ width: 0 }}
                      animate={{
                        width: `${((downloadStatus?.downloads_used ?? 0) / (downloadStatus?.downloads_limit ?? 5)) * 100}%`,
                      }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>

                  <p className="text-sm text-gray-500">
                    {downloadStatus?.downloads_remaining ?? 5} downloads remaining. Resets at midnight.
                  </p>
                </div>

                {/* How to Download */}
                <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
                  <h3 className="font-bold text-white mb-4">How to Download</h3>
                  <ol className="space-y-3 text-gray-300">
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 text-sm font-bold flex items-center justify-center">1</span>
                      <span>Go to any lesson with a video</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 text-sm font-bold flex items-center justify-center">2</span>
                      <span>Click the "Download for Offline" button below the video</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 text-sm font-bold flex items-center justify-center">3</span>
                      <span>Confirm the download - your personalized link will start</span>
                    </li>
                  </ol>

                  <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                    <p className="text-sm text-amber-300">
                      ⚠️ Download links expire in 1 hour and are unique to your account. 
                      They cannot be shared with others.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "freezes" && (
            <motion.div
              key="freezes"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="max-w-2xl">
                <h2 className="text-2xl font-bold text-white mb-4">Streak Freeze System</h2>
                <p className="text-gray-400 mb-6">
                  Life happens! Protect your hard-earned streak with freezes. You get one 
                  free freeze per week, and can buy more with claves.
                </p>

                <StreakFreezeStore className="mb-6" />

                {/* How Freezes Work */}
                <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
                  <h3 className="font-bold text-white mb-4">How Freezes Work</h3>
                  <div className="space-y-4 text-gray-300">
                    <div className="flex items-start gap-3">
                      <CheckCircle size={20} className="text-green-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-white">Weekly Freebie</span>
                        <p className="text-sm text-gray-400">
                          Every Monday, you get 1 free freeze that auto-activates if you miss a day.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle size={20} className="text-blue-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-white">Inventory Freezes</span>
                        <p className="text-sm text-gray-400">
                          Purchase extra freezes for 10 claves each. They stay in your inventory until needed.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle size={20} className="text-purple-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-white">Emergency Repair</span>
                        <p className="text-sm text-gray-400">
                          No freezes left? You can repair a broken streak for 10 claves when prompted.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "mixer" && (
            <motion.div
              key="mixer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="max-w-4xl">
                <h2 className="text-2xl font-bold text-white mb-4">DJ Booth: Mambo Mixer</h2>
                <p className="text-gray-400 mb-6">
                  Isolate instruments in classic salsa tracks to practice your timing and musicality.
                </p>

                {isGuildMaster ? (
                  <div className="text-center py-8">
                    <CheckCircle size={48} className="text-green-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Full Access Unlocked!</h3>
                    <p className="text-gray-400 mb-6">
                      As a Guild Master, you have full access to the DJ Booth.
                    </p>
                    <Link
                      href="/guild-master"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-bold hover:from-amber-400 hover:to-yellow-400 transition-all"
                    >
                      <Music size={20} />
                      Open DJ Booth
                    </Link>
                  </div>
                ) : (
                  <div className="relative">
                    {/* Teaser/Preview */}
                    <div className="bg-gray-900 border border-gray-700 rounded-xl p-8 relative overflow-hidden">
                      {/* Blur overlay */}
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
                        <Lock size={48} className="text-gray-400 mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">Guild Master Feature</h3>
                        <p className="text-gray-400 mb-6 text-center max-w-md">
                          The full DJ Booth with stem isolation is exclusive to Guild Masters.
                        </p>
                        <Link
                          href="/pricing"
                          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-bold hover:from-amber-400 hover:to-yellow-400 transition-all"
                        >
                          <Crown size={20} />
                          Upgrade to Guild Master
                        </Link>
                      </div>

                      {/* Preview content (blurred) */}
                      <div className="opacity-50">
                        <div className="flex items-center gap-4 mb-6">
                          <div className="p-3 rounded-lg bg-purple-500/20">
                            <Music size={32} className="text-purple-400" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-white">Classic Salsa Track</h3>
                            <p className="text-gray-400 text-sm">Sample Artist</p>
                          </div>
                        </div>

                        {/* Fake mixer sliders */}
                        <div className="flex justify-around gap-4 h-48 mb-6">
                          {["Percussion", "Piano/Bass", "Vocals", "Master"].map((label) => (
                            <div key={label} className="flex flex-col items-center">
                              <div className="flex-1 w-12 bg-gray-800 rounded-lg relative">
                                <div
                                  className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-purple-500 to-blue-500 rounded-b-lg"
                                  style={{ height: `${Math.random() * 60 + 40}%` }}
                                />
                              </div>
                              <span className="text-xs text-gray-400 mt-2">{label}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* What you get */}
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
                        <h4 className="font-semibold text-white mb-2">🎵 Stem Isolation</h4>
                        <p className="text-sm text-gray-400">
                          Mute or solo percussion, piano, bass, or vocals independently.
                        </p>
                      </div>
                      <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
                        <h4 className="font-semibold text-white mb-2">🎚️ Volume Mixing</h4>
                        <p className="text-sm text-gray-400">
                          Adjust each instrument's volume to focus on specific elements.
                        </p>
                      </div>
                      <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
                        <h4 className="font-semibold text-white mb-2">📚 Track Library</h4>
                        <p className="text-sm text-gray-400">
                          Access classic salsa tracks with pre-separated stems.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Footer />
    </div>
  );
}

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  status: "unlocked" | "preview" | "locked";
  onClick?: () => void;
}

function FeatureCard({ title, description, icon: Icon, status, onClick }: FeatureCardProps) {
  return (
    <motion.div
      className={cn(
        "bg-gray-900 border rounded-xl p-6 cursor-pointer transition-all",
        status === "unlocked"
          ? "border-blue-500/30 hover:border-blue-500/50"
          : status === "preview"
          ? "border-purple-500/30 hover:border-purple-500/50"
          : "border-gray-700 hover:border-gray-600"
      )}
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className={cn(
            "p-3 rounded-lg",
            status === "unlocked"
              ? "bg-blue-500/20"
              : status === "preview"
              ? "bg-purple-500/20"
              : "bg-gray-800"
          )}
        >
          <Icon
            size={24}
            className={cn(
              status === "unlocked"
                ? "text-blue-400"
                : status === "preview"
                ? "text-purple-400"
                : "text-gray-500"
            )}
          />
        </div>
        
        {status === "unlocked" && (
          <span className="flex items-center gap-1 text-xs font-semibold text-green-400 bg-green-500/20 px-2 py-1 rounded-full">
            <CheckCircle size={12} />
            Unlocked
          </span>
        )}
        {status === "preview" && (
          <span className="flex items-center gap-1 text-xs font-semibold text-purple-400 bg-purple-500/20 px-2 py-1 rounded-full">
            Preview
          </span>
        )}
        {status === "locked" && (
          <span className="flex items-center gap-1 text-xs font-semibold text-gray-500 bg-gray-800 px-2 py-1 rounded-full">
            <Lock size={12} />
            Locked
          </span>
        )}
      </div>

      <h3 className="font-bold text-white mb-2">{title}</h3>
      <p className="text-sm text-gray-400">{description}</p>
    </motion.div>
  );
}
