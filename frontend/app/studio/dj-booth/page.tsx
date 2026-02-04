"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Headphones, Lock, Crown, ArrowLeft, Drum } from "lucide-react";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import SalsaRhythmMachine from "@/components/SalsaRhythmMachine";
import SalsaRhythmTutor from "@/components/SalsaRhythmTutor";

// Locked Page Component for non-Guild Masters
function LockedPage({ user }: { user: any }) {
  return (
    <div className="min-h-screen bg-mambo-dark">
      <NavBar user={user} />
      <main className="pt-32 pb-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-500/20 to-yellow-500/20 border border-amber-400/30 flex items-center justify-center mx-auto mb-6">
              <Lock size={40} className="text-amber-400" />
            </div>
            
            <h1 className="text-4xl font-bold text-white mb-4">
              The DJ Booth is for Guild Masters
            </h1>
            
            <p className="text-lg text-gray-400 mb-8 max-w-md mx-auto">
              Mix authentic salsa rhythms, control tempo, and practice with our comprehensive rhythm machine. Master your timing with isolated instruments.
            </p>

            <div className="space-y-4 text-left max-w-md mx-auto mb-8">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-800/50 border border-gray-700">
                <Drum size={20} className="text-cyan-400" />
                <span className="text-gray-300">9 instruments with multiple pattern variations</span>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-800/50 border border-gray-700">
                <Volume2 size={20} className="text-purple-400" />
                <span className="text-gray-300">Per-instrument volume, mute & solo controls</span>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-800/50 border border-gray-700">
                <Music size={20} className="text-pink-400" />
                <span className="text-gray-300">All authentic salsa rhythms (Son, Rumba, Timba, Guaguancó)</span>
              </div>
            </div>

            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-bold text-lg hover:from-amber-400 hover:to-yellow-400 transition-all shadow-lg shadow-amber-500/25"
            >
              <Crown size={20} />
              Upgrade to Guild Master
            </Link>

            <Link
              href="/studio"
              className="block mt-6 text-gray-400 hover:text-white transition-colors"
            >
              ← Back to Studio
            </Link>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function DJBoothPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const isGuildMaster = user?.tier?.toLowerCase() === "performer";

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login?redirect=/studio/dj-booth");
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

  // Show locked page for non-Guild Masters
  if (!isGuildMaster) {
    return <LockedPage user={user} />;
  }

  return (
    <div className="min-h-screen bg-mambo-dark">
      <NavBar user={user} />

      <main className="pt-32 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Back Link */}
          <Link
            href="/studio"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft size={16} />
            <span>Back to Studio</span>
          </Link>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                <Headphones size={28} className="text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white">The DJ Booth</h1>
                <p className="text-gray-400">Salsa Rhythm Machine - Mix authentic patterns</p>
              </div>
            </div>
          </motion.div>

          {/* Rhythm Tutor */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <SalsaRhythmTutor />
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
