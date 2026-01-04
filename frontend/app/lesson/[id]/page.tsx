"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api";
import QuestLogSidebar from "@/components/QuestLogSidebar";
import RichContentRenderer from "@/components/RichContentRenderer";
import VideoPlayer from "@/components/VideoPlayer";
import MuxVideoPlayer from "@/components/MuxVideoPlayer";
import { FaCheck, FaPlay, FaLock } from "react-icons/fa";

interface Lesson {
  id: string;
  title: string;
  description: string | null;
  video_url: string;
  xp_value: number;
  next_lesson_id: string | null;
  prev_lesson_id: string | null;
  week_number: number | null;
  day_number: number | null;
  content_json: any | null;
  mux_playback_id: string | null;
  mux_asset_id: string | null;
}

interface WorldLesson {
  id: string;
  title: string;
  xp_value: number;
  is_completed: boolean;
  is_locked: boolean;
  is_boss_battle: boolean;
  order_index: number;
}

export default function LessonPage() {
  const params = useParams();
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const lessonId = params.id as string;

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [worldLessons, setWorldLessons] = useState<WorldLesson[]>([]);
  const [worldTitle, setWorldTitle] = useState("Loading...");
  const [worldProgress, setWorldProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("description");
  const [videoPlaying, setVideoPlaying] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    loadLesson();
  }, [lessonId, user, router]);

  const loadLesson = async () => {
    try {
      setLoading(true);
      const [lessonData, worldsData] = await Promise.all([
        apiClient.getLesson(lessonId),
        apiClient.getWorlds(),
      ]);

      setLesson(lessonData);

      // Find the world this lesson belongs to and get its lessons
      for (const world of worldsData) {
        const lessons = await apiClient.getWorldLessons(world.id);
        const foundLesson = lessons.find((l) => l.id === lessonId);
        if (foundLesson) {
          setWorldTitle(world.title);
          setWorldLessons(lessons);
          const completed = lessons.filter((l) => l.is_completed).length;
          setWorldProgress((completed / lessons.length) * 100);
          break;
        }
      }
    } catch (err: any) {
      setError(err.message || "Failed to load lesson");
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!lesson) return;

    setCompleting(true);
    try {
      const result = await apiClient.completeLesson(lessonId);
      await refreshUser();
      
      // Show success message
      alert(
        `Lesson completed! +${result.xp_gained} XP${
          result.leveled_up ? ` - Level Up! You're now level ${result.new_level}` : ""
        }`
      );

      // Reload lesson data
      await loadLesson();

      // Navigate to next lesson if available
      if (result.leveled_up || lesson.next_lesson_id) {
        setTimeout(() => {
          if (lesson.next_lesson_id) {
            router.push(`/lesson/${lesson.next_lesson_id}`);
          }
        }, 2000);
      }
    } catch (err: any) {
      alert(err.message || "Failed to complete lesson");
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-mambo-dark flex items-center justify-center">
        <div className="text-gray-400">Loading lesson...</div>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="min-h-screen bg-mambo-dark flex items-center justify-center">
        <div className="text-red-400">{error || "Lesson not found"}</div>
      </div>
    );
  }

  const currentLesson = worldLessons.find((l) => l.id === lessonId);
  const isCompleted = currentLesson?.is_completed || false;

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-mambo-dark">
      <nav className="border-b border-gray-800 bg-mambo-panel flex-none z-20">
        <div className="px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link
              href="/courses"
              className="text-gray-400 hover:text-mambo-text transition"
            >
              ← Back to Map
            </Link>
            <span className="text-gray-600">|</span>
            <h1 className="font-bold text-sm md:text-base text-mambo-text">
              {worldTitle} / <span className="text-mambo-blue">{lesson.title}</span>
            </h1>
          </div>
          {user && (
            <div className="flex items-center gap-3">
              <div className="hidden md:block text-xs font-bold text-mambo-gold uppercase tracking-wider">
                {user.xp} XP • Level {user.level}
              </div>
              <Link href="/profile">
                <div className="w-8 h-8 rounded-full bg-gray-700 overflow-hidden">
                  {user.avatar_url ? (
                    <Image
                      src={user.avatar_url}
                      alt={`${user.first_name} ${user.last_name}`}
                      width={32}
                      height={32}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-mambo-blue flex items-center justify-center text-white text-xs font-bold">
                      {user.first_name[0].toUpperCase()}
                    </div>
                  )}
                </div>
              </Link>
            </div>
          )}
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 overflow-y-auto bg-black relative flex flex-col">
          {/* Video Player - Use Mux if available, otherwise fallback to video_url */}
          {lesson.mux_playback_id ? (
            <div className="w-full aspect-video">
              <MuxVideoPlayer 
                playbackId={lesson.mux_playback_id} 
                onEnded={() => setVideoPlaying(false)} 
                autoPlay={true}
              />
            </div>
          ) : lesson.video_url ? (
            <div className="w-full aspect-video bg-gray-900 relative group">
              {!videoPlaying ? (
                <>
                  <Image
                    src="/assets/Mambo_image_1.png"
                    alt="Video thumbnail"
                    fill
                    className="object-cover opacity-50"
                  />
                  <button
                    onClick={() => setVideoPlaying(true)}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <div className="w-20 h-20 bg-mambo-blue/90 hover:bg-mambo-blue rounded-full flex items-center justify-center backdrop-blur-sm transition hover:scale-110 shadow-lg shadow-blue-500/50">
                      <FaPlay className="text-2xl ml-1 text-white" />
                    </div>
                  </button>
                </>
              ) : (
                <video
                  controls
                  autoPlay
                  className="w-full h-full"
                  src={lesson.video_url}
                />
              )}
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-800">
                <div className="h-full bg-mambo-blue w-1/3 relative">
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow" />
                </div>
              </div>
            </div>
          ) : null}

          <div className="max-w-4xl mx-auto w-full px-8 py-10">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-2xl font-bold mb-2 text-mambo-text">{lesson.title}</h2>
                {lesson.week_number && lesson.day_number && (
                  <p className="text-blue-400 text-sm mb-2 font-medium">
                    Week {lesson.week_number} • Day {lesson.day_number}
                  </p>
                )}
                <p className="text-gray-400 text-sm">
                  {lesson.description || "Master the fundamentals"}
                </p>
              </div>
              {!isCompleted && (
                <button
                  onClick={handleComplete}
                  disabled={completing}
                  className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg shadow-lg shadow-green-900/20 flex items-center gap-2 transition transform active:scale-95 disabled:opacity-50"
                >
                  <FaCheck />
                  {completing
                    ? "Completing..."
                    : `Complete & Claim ${lesson.xp_value} XP`}
                </button>
              )}
              {isCompleted && (
                <div className="px-6 py-3 bg-green-600/50 text-green-200 font-bold rounded-lg flex items-center gap-2">
                  <FaCheck />
                  Completed
                </div>
              )}
            </div>

            {/* Rich Content */}
            {lesson.content_json && lesson.content_json.blocks && lesson.content_json.blocks.length > 0 ? (
              <div className="mb-8">
                <RichContentRenderer contentJson={lesson.content_json} />
              </div>
            ) : (
              <>
                <div className="border-b border-gray-800 mb-8">
                  <div className="flex gap-8">
                    <button
                      onClick={() => setActiveTab("description")}
                      className={`pb-3 border-b-2 font-bold text-sm transition ${
                        activeTab === "description"
                          ? "border-mambo-text text-mambo-text"
                          : "border-transparent text-gray-400 hover:text-mambo-text"
                      }`}
                    >
                      Description
                    </button>
                    <button
                      onClick={() => setActiveTab("discussion")}
                      className={`pb-3 border-b-2 font-bold text-sm transition ${
                        activeTab === "discussion"
                          ? "border-mambo-text text-mambo-text"
                          : "border-transparent text-gray-400 hover:text-mambo-text"
                      }`}
                    >
                      Discussion
                    </button>
                  </div>
                </div>

                {activeTab === "description" && (
                  <div className="prose prose-invert prose-sm text-gray-300">
                    <p>{lesson.description || "No description available."}</p>
                  </div>
                )}

                {activeTab === "discussion" && (
                  <div className="text-gray-400">
                    Discussion feature coming soon!
                  </div>
                )}
              </>
            )}
          </div>
        </main>

        <QuestLogSidebar
          currentLessonId={lessonId}
          lessons={worldLessons}
          worldTitle={worldTitle}
          worldProgress={worldProgress}
        />
      </div>
    </div>
  );
}

