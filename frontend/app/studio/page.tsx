"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Headphones, Video, Radio, Crown, Lock, ArrowRight } from "lucide-react";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const STUDIO_SECTIONS = [
  {
    id: "dj-booth",
    title: "The DJ Booth",
    subtitle: "Practice Tools & Mixer",
    description: "Isolate instruments, slow down tracks, and practice with the Mambo Mixer. Perfect your timing with our curated salsa collection.",
    icon: Headphones,
    href: "/studio/dj-booth",
    gradient: "from-cyan-500 to-blue-600",
    bgGradient: "from-cyan-500/10 to-blue-600/10",
    borderColor: "border-cyan-400/30",
    iconColor: "text-cyan-400",
  },
  {
    id: "coaching",
    title: "The Coaching Corner",
    subtitle: "1-on-1 Video Feedback",
    description: "Submit your dance videos for personalized feedback from our expert instructors. Get detailed analysis and actionable tips.",
    icon: Video,
    href: "/studio/coaching",
    gradient: "from-pink-500 to-rose-600",
    bgGradient: "from-pink-500/10 to-rose-600/10",
    borderColor: "border-pink-400/30",
    iconColor: "text-pink-400",
  },
  {
    id: "roundtable",
    title: "The Roundtable",
    subtitle: "Live Calls & Archives",
    description: "Join our weekly live sessions for Q&A, deep dives into musicality, and community discussions. Access the full archive anytime.",
    icon: Radio,
    href: "/studio/roundtable",
    gradient: "from-red-500 to-orange-600",
    bgGradient: "from-red-500/10 to-orange-600/10",
    borderColor: "border-red-400/30",
    iconColor: "text-red-400",
  },
];

export default function StudioPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const isGuildMaster = user?.tier?.toLowerCase() === "performer";

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login?redirect=/studio");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-mambo-dark flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-mambo-gold border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-mambo-dark">
      <NavBar user={user} />

      <main className="pt-32 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border border-purple-400/30 mb-6">
              {isGuildMaster ? (
                <>
                  <Crown size={16} className="text-amber-400" />
                  <span className="text-sm font-semibold text-amber-300">Guild Master Access</span>
                </>
              ) : (
                <>
                  <Lock size={16} className="text-purple-400" />
                  <span className="text-sm font-semibold text-purple-300">Limited Access</span>
                </>
              )}
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
              The <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">Studio</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Your private training ground. Practice tools, coaching, and live sessions — all in one place.
            </p>
          </motion.div>

          {/* Studio Sections Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            {STUDIO_SECTIONS.map((section, index) => {
              const Icon = section.icon;
              const isLocked = !isGuildMaster;

              return (
                <motion.div
                  key={section.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Link href={section.href}>
                    <div
                      className={cn(
                        "relative group h-full rounded-2xl p-6 border transition-all duration-300",
                        isLocked 
                          ? "bg-gray-900/50 border-gray-700/50 hover:border-gray-600" 
                          : `bg-gradient-to-br ${section.bgGradient} ${section.borderColor} hover:border-opacity-60`
                      )}
                    >
                      {/* Locked Overlay */}
                      {isLocked && (
                        <div className="absolute inset-0 rounded-2xl bg-black/40 backdrop-blur-[1px] flex items-center justify-center z-10">
                          <div className="text-center">
                            <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-400/30 flex items-center justify-center mx-auto mb-3">
                              <Lock size={20} className="text-amber-400" />
                            </div>
                            <p className="text-sm font-semibold text-amber-300">Guild Master Only</p>
                          </div>
                        </div>
                      )}

                      {/* Icon */}
                      <div className={cn(
                        "w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110",
                        isLocked 
                          ? "bg-gray-800 border border-gray-700" 
                          : `bg-gradient-to-br ${section.gradient}`
                      )}>
                        <Icon size={28} className={isLocked ? "text-gray-500" : "text-white"} />
                      </div>

                      {/* Content */}
                      <h2 className={cn(
                        "text-2xl font-bold mb-1",
                        isLocked ? "text-gray-400" : "text-white"
                      )}>
                        {section.title}
                      </h2>
                      <p className={cn(
                        "text-sm font-medium mb-3",
                        isLocked ? "text-gray-500" : section.iconColor
                      )}>
                        {section.subtitle}
                      </p>
                      <p className={cn(
                        "text-sm leading-relaxed mb-4",
                        isLocked ? "text-gray-500" : "text-gray-400"
                      )}>
                        {section.description}
                      </p>

                      {/* CTA */}
                      <div className={cn(
                        "flex items-center gap-2 text-sm font-semibold transition-colors",
                        isLocked 
                          ? "text-gray-500" 
                          : `${section.iconColor} group-hover:gap-3`
                      )}>
                        <span>{isLocked ? "Unlock Access" : "Enter"}</span>
                        <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>

          {/* Upgrade CTA for non-Guild Masters */}
          {!isGuildMaster && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-12 text-center"
            >
              <div className="inline-block p-8 rounded-2xl bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border border-amber-400/30">
                <Crown size={40} className="text-amber-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">Become a Guild Master</h3>
                <p className="text-gray-400 mb-6 max-w-md">
                  Unlock the full Studio experience with personalized coaching, live calls, and advanced practice tools.
                </p>
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-bold hover:from-amber-400 hover:to-yellow-400 transition-all shadow-lg shadow-amber-500/25"
                >
                  <Crown size={18} />
                  Upgrade Now
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
