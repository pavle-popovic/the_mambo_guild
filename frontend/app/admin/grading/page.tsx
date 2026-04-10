"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/AdminSidebar";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api";
import Image from "next/image";
import { FaCheck, FaTimes, FaVideo, FaPlayCircle } from "react-icons/fa";

interface Submission {
  id: string;
  status: string;
  feedback: string | null;
  submitted_at: string;
  user_id?: string;
  lesson_id?: string;
  video_url?: string;
}

export default function AdminGradingPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [grading, setGrading] = useState(false);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "admin")) {
      router.push("/login");
      return;
    }
    if (user) {
      loadSubmissions();
    }
  }, [user, authLoading, router]);

  const loadSubmissions = async () => {
    try {
      const data = await apiClient.getPendingSubmissions();
      setSubmissions(data);
      if (data.length > 0 && !selectedSubmission) {
        setSelectedSubmission(data[0]);
      }
    } catch (err: any) {
      console.error("Failed to load submissions:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGrade = async (status: "approved" | "rejected") => {
    if (!selectedSubmission) return;

    setGrading(true);
    try {
      await apiClient.gradeSubmission(selectedSubmission.id, {
        status,
        feedback_text: feedback || undefined,
      });
      await loadSubmissions();
      setFeedback("");
      if (submissions.length > 1) {
        const nextIndex = submissions.findIndex((s) => s.id === selectedSubmission.id) + 1;
        if (nextIndex < submissions.length) {
          setSelectedSubmission(submissions[nextIndex]);
        } else if (submissions.length > 0) {
          setSelectedSubmission(submissions[0]);
        } else {
          setSelectedSubmission(null);
        }
      } else {
        setSelectedSubmission(null);
      }
    } catch (err: any) {
      alert(err.message || "Failed to grade submission");
    } finally {
      setGrading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="h-screen bg-mambo-dark flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-mambo-dark">
      <AdminSidebar />

      <main className="flex-1 flex overflow-hidden ml-0 pt-14 lg:pt-0 lg:ml-64">
        <div className="w-80 border-r border-gray-800 bg-black flex flex-col">
          <div className="p-5 border-b border-gray-800">
            <h2 className="font-bold text-mambo-text">
              Pending Queue ({submissions.length})
            </h2>
          </div>
          <div className="overflow-y-auto flex-1">
            {submissions.map((submission) => (
              <div
                key={submission.id}
                onClick={() => setSelectedSubmission(submission)}
                className={`p-4 cursor-pointer transition ${
                  selectedSubmission?.id === submission.id
                    ? "bg-gray-800 border-l-4 border-mambo-blue"
                    : "hover:bg-gray-900 border-l-4 border-transparent"
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span
                    className={`font-bold text-sm ${
                      selectedSubmission?.id === submission.id
                        ? "text-mambo-text"
                        : "text-gray-400"
                    }`}
                  >
                    Submission #{submission.id.slice(0, 8)}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(submission.submitted_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="text-xs text-gray-300">Boss Battle</div>
              </div>
            ))}
            {submissions.length === 0 && (
              <div className="p-4 text-gray-500 text-sm text-center">
                No pending submissions
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col p-8 overflow-y-auto">
          {selectedSubmission ? (
            <>
              <header className="flex justify-between items-center mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-mambo-text">
                    Reviewing Submission
                  </h1>
                  <div className="text-sm text-gray-400">
                    Submission ID:{" "}
                    <span className="text-mambo-blue">{selectedSubmission.id}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="text-xs bg-gray-800 px-3 py-1 rounded text-gray-400">
                    Pending Review
                  </div>
                </div>
              </header>

              <div className="grid grid-cols-2 gap-8 h-full">
                <div className="bg-black rounded-xl overflow-hidden border border-gray-800 relative aspect-video">
                  {selectedSubmission.video_url ? (
                    <video
                      controls
                      className="w-full h-full"
                      src={selectedSubmission.video_url}
                    />
                  ) : (
                    <>
                      <Image
                        src="/assets/Mambo_image_1.png"
                        alt="Video thumbnail"
                        fill
                        className="object-cover opacity-60"
                      />
                      <button className="absolute inset-0 flex items-center justify-center">
                        <FaPlayCircle className="text-6xl text-white opacity-80 hover:opacity-100 hover:scale-110 transition" />
                      </button>
                    </>
                  )}
                </div>

                <div className="flex flex-col">
                  <div className="bg-mambo-panel border border-gray-800 rounded-xl p-6 flex-1 flex flex-col">
                    <h3 className="font-bold mb-4 text-mambo-text">Instructor Feedback</h3>

                    <div className="flex-1 mb-6">
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                        Written Feedback
                      </label>
                      <textarea
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        className="w-full h-full min-h-[200px] bg-black border border-gray-700 rounded-lg p-4 text-mambo-text-light focus:border-mambo-blue outline-none resize-none"
                        placeholder="Great job! Your timing is solid. Watch your left arm on the turn..."
                      />
                    </div>

                    <div className="mb-6">
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                        Or Record Video Reply
                      </label>
                      <button className="w-full py-3 border border-dashed border-gray-600 rounded-lg text-gray-400 hover:text-mambo-text hover:border-gray-400 transition flex items-center justify-center gap-2">
                        <FaVideo />
                        Record with Camera
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-auto">
                      <button
                        onClick={() => handleGrade("rejected")}
                        disabled={grading}
                        className="py-3 bg-red-900/30 text-red-500 border border-red-900 hover:bg-red-900/50 rounded-lg font-bold transition disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        <FaTimes />
                        Request Re-do
                      </button>
                      <button
                        onClick={() => handleGrade("approved")}
                        disabled={grading}
                        className="py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg font-bold transition shadow-lg shadow-green-900/20 disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        <FaCheck />
                        Approve & Unlock
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              Select a submission from the queue to review
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
