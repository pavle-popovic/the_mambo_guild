"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Video, Lock, Crown, ArrowLeft, Upload, MessageSquare, CheckCircle,
  Clock, Calendar, Sparkles
} from "lucide-react";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api";
import { cn } from "@/lib/utils";

interface CoachingStatus {
  can_submit: boolean;
  current_submission: {
    id: string;
    status: string;
    video_mux_playback_id: string;
    specific_question: string | null;
    submitted_at: string;
    feedback_video_mux_playback_id: string | null;
    coach_notes: string | null;
  } | null;
  next_credit_date: string | null;
  message: string;
}

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
              The Coaching Corner is for Guild Masters
            </h1>
            
            <p className="text-lg text-gray-400 mb-8 max-w-md mx-auto">
              Submit your dance videos for personalized feedback from our expert instructors. Get detailed analysis and actionable tips to improve.
            </p>

            <div className="space-y-4 text-left max-w-md mx-auto mb-8">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-800/50 border border-gray-700">
                <Upload size={20} className="text-pink-400" />
                <span className="text-gray-300">1 video submission per month</span>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-800/50 border border-gray-700">
                <MessageSquare size={20} className="text-cyan-400" />
                <span className="text-gray-300">Personalized video feedback</span>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-800/50 border border-gray-700">
                <Sparkles size={20} className="text-purple-400" />
                <span className="text-gray-300">Expert analysis & tips</span>
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

export default function CoachingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const isGuildMaster = user?.tier?.toLowerCase() === "performer";

  const [coachingStatus, setCoachingStatus] = useState<CoachingStatus | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login?redirect=/studio/coaching");
    }
  }, [user, loading, router]);

  // Fetch coaching status
  useEffect(() => {
    if (!user || !isGuildMaster) return;

    const fetchStatus = async () => {
      try {
        const status = await apiClient.getCoachingStatus();
        setCoachingStatus(status);
      } catch (error) {
        console.error("Failed to fetch coaching status:", error);
      } finally {
        setIsLoadingStatus(false);
      }
    };

    fetchStatus();
  }, [user, isGuildMaster]);

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return { color: "bg-amber-500/20 text-amber-400 border-amber-400/30", icon: Clock, text: "Pending Review" };
      case "in_review":
        return { color: "bg-blue-500/20 text-blue-400 border-blue-400/30", icon: Video, text: "In Review" };
      case "completed":
        return { color: "bg-green-500/20 text-green-400 border-green-400/30", icon: CheckCircle, text: "Feedback Ready" };
      default:
        return { color: "bg-gray-500/20 text-gray-400 border-gray-400/30", icon: Clock, text: status };
    }
  };

  return (
    <div className="min-h-screen bg-mambo-dark">
      <NavBar user={user} />

      <main className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
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
            className="mb-12"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
                <Video size={28} className="text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white">The Coaching Corner</h1>
                <p className="text-gray-400">1-on-1 video feedback from expert instructors</p>
              </div>
            </div>
          </motion.div>

          {isLoadingStatus ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin w-8 h-8 border-2 border-mambo-gold border-t-transparent rounded-full" />
            </div>
          ) : (
            <div className="space-y-8">
              {/* Current Status Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="rounded-2xl bg-gray-800/50 border border-gray-700 p-6"
              >
                <h2 className="text-xl font-bold text-white mb-4">Your Status</h2>
                
                {coachingStatus?.current_submission ? (
                  <div>
                    {/* Submission Status */}
                    <div className="flex items-center gap-3 mb-4">
                      {(() => {
                        const badge = getStatusBadge(coachingStatus.current_submission.status);
                        const Icon = badge.icon;
                        return (
                          <span className={cn("inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-semibold", badge.color)}>
                            <Icon size={14} />
                            {badge.text}
                          </span>
                        );
                      })()}
                    </div>

                    {/* Submission Details */}
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-2 text-gray-400">
                        <Calendar size={14} />
                        <span>Submitted: {new Date(coachingStatus.current_submission.submitted_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
                      </div>
                      
                      {coachingStatus.current_submission.specific_question && (
                        <div className="p-3 rounded-lg bg-gray-900/50 border border-gray-700">
                          <span className="text-gray-500 text-xs uppercase tracking-wide">Your Question:</span>
                          <p className="text-gray-300 mt-1">{coachingStatus.current_submission.specific_question}</p>
                        </div>
                      )}

                      {/* Feedback (if completed) */}
                      {coachingStatus.current_submission.status === "completed" && (
                        <div className="mt-6">
                          <Link
                            href={`/guild-master?tab=coaching`}
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold hover:from-green-400 hover:to-emerald-400 transition-all"
                          >
                            <Video size={18} />
                            Watch Feedback Video
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                ) : coachingStatus?.can_submit ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500/20 to-rose-500/20 border border-pink-400/30 flex items-center justify-center mx-auto mb-4">
                      <Upload size={28} className="text-pink-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">Ready to Submit!</h3>
                    <p className="text-gray-400 mb-6">You have 1 video review credit available this month.</p>
                    <Link
                      href="/guild-master?tab=coaching"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold hover:from-pink-400 hover:to-rose-400 transition-all"
                    >
                      <Upload size={18} />
                      Submit Your Video
                    </Link>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 rounded-full bg-gray-700/50 flex items-center justify-center mx-auto mb-4">
                      <Clock size={28} className="text-gray-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">Credit Used</h3>
                    <p className="text-gray-400 mb-2">{coachingStatus?.message}</p>
                    {coachingStatus?.next_credit_date && (
                      <p className="text-sm text-gray-500">
                        Next credit: {new Date(coachingStatus.next_credit_date).toLocaleDateString("en-US", { month: "long", day: "numeric" })}
                      </p>
                    )}
                  </div>
                )}
              </motion.div>

              {/* How It Works */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="rounded-2xl bg-gray-800/50 border border-gray-700 p-6"
              >
                <h2 className="text-xl font-bold text-white mb-6">How It Works</h2>
                
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-pink-500/20 border border-pink-400/30 flex items-center justify-center mx-auto mb-3">
                      <span className="text-lg font-bold text-pink-400">1</span>
                    </div>
                    <h3 className="font-semibold text-white mb-1">Upload Your Video</h3>
                    <p className="text-sm text-gray-400">Record yourself dancing (max 60 seconds) and upload with a specific question.</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center mx-auto mb-3">
                      <span className="text-lg font-bold text-cyan-400">2</span>
                    </div>
                    <h3 className="font-semibold text-white mb-1">Expert Review</h3>
                    <p className="text-sm text-gray-400">Our instructors analyze your technique and prepare personalized feedback.</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-green-500/20 border border-green-400/30 flex items-center justify-center mx-auto mb-3">
                      <span className="text-lg font-bold text-green-400">3</span>
                    </div>
                    <h3 className="font-semibold text-white mb-1">Watch & Improve</h3>
                    <p className="text-sm text-gray-400">Receive a detailed video response with tips and exercises to improve.</p>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
