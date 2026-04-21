"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Headphones, ArrowLeft } from "lucide-react";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import SalsaRhythmTutor from "@/components/SalsaRhythmTutor";

export default function DJBoothPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const isAdmin = user?.role?.toLowerCase() === "admin";

  // Redirect unauthenticated users to login, and non-admins away from the page entirely.
  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login?redirect=/studio/dj-booth");
      return;
    }
    if (!isAdmin) {
      router.replace("/studio");
    }
  }, [user, loading, isAdmin, router]);

  if (loading || !user || !isAdmin) {
    return (
      <div className="min-h-screen bg-mambo-dark flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-mambo-gold border-t-transparent rounded-full" />
      </div>
    );
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
