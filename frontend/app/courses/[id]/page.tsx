"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import NavBar from "@/components/NavBar";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api";
import QuestLogSidebar from "@/components/QuestLogSidebar";

interface Lesson {
  id: string;
  title: string;
  xp_value: number;
  is_completed: boolean;
  is_locked: boolean;
  is_boss_battle: boolean;
  order_index: number;
}

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const courseId = params.id as string;

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [courseTitle, setCourseTitle] = useState("Loading...");
  const [courseProgress, setCourseProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadCourse();
  }, [courseId]);

  const loadCourse = async () => {
    try {
      setLoading(true);
      setError("");
      const courses = await apiClient.getWorlds();
      const course = courses.find((c) => c.id === courseId);
      
      if (!course) {
        setError("Course not found");
        return;
      }

      setCourseTitle(course.title);
      
      // Load lessons - works for both authenticated and unauthenticated users
      try {
        const courseLessons = await apiClient.getWorldLessons(courseId);
        setLessons(courseLessons);
        
        if (user) {
          const completed = courseLessons.filter((l) => l.is_completed).length;
          setCourseProgress((completed / courseLessons.length) * 100);
        } else {
          setCourseProgress(0);
        }
      } catch (lessonErr: any) {
        // If lessons can't be loaded, show empty list but don't show error
        console.error("Failed to load lessons:", lessonErr);
        setLessons([]);
        setCourseProgress(0);
      }
    } catch (err: any) {
      console.error("Failed to load course:", err);
      setError(err.message || "Failed to load course");
    } finally {
      setLoading(false);
    }
  };

  const handleLessonClick = (lessonId: string, isLocked: boolean) => {
    if (isLocked && user) {
      // If logged in and lesson is locked, don't allow access
      return;
    }
    
    if (!user) {
      // Prompt to login when clicking on a lesson
      if (confirm("Please log in to access this lesson. Would you like to log in now?")) {
        router.push(`/login?redirect=/lesson/${lessonId}`);
      }
    } else {
      router.push(`/lesson/${lessonId}`);
    }
  };

  const getFirstUnlockedLesson = () => {
    return lessons.find((l) => !l.is_locked && !l.is_completed) || lessons[0];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-mambo-dark flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-mambo-dark">
        <NavBar user={user ? { ...user, avatar_url: user.avatar_url || undefined } : undefined} />
        <div className="max-w-7xl mx-auto px-8 py-16">
          <div className="bg-red-900/20 border border-red-600/30 rounded-xl p-8 text-center">
            <p className="text-red-400 mb-6 text-lg">{error}</p>
            {!user && (
              <div className="flex gap-4 justify-center">
                <Link
                  href="/register"
                  className="px-6 py-3 bg-mambo-blue hover:bg-blue-600 text-white rounded-lg font-bold transition"
                >
                  Create Free Account
                </Link>
                <Link
                  href="/login"
                  className="px-6 py-3 border border-gray-600 hover:bg-gray-800 text-mambo-text rounded-lg font-bold transition"
                >
                  Log In
                </Link>
              </div>
            )}
            <Link
              href="/courses"
              className="inline-block mt-4 text-gray-400 hover:text-mambo-text transition"
            >
              ← Back to Courses
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const firstLesson = getFirstUnlockedLesson();

  return (
    <div className="min-h-screen bg-mambo-dark">
      <NavBar user={user ? { ...user, avatar_url: user.avatar_url || undefined } : undefined} />

      <div className="max-w-7xl mx-auto px-8 py-12">
        <Link
          href="/courses"
          className="text-gray-400 hover:text-mambo-text transition mb-6 inline-block"
        >
          ← Back to Courses
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 text-mambo-text">{courseTitle}</h1>
          {user && courseProgress > 0 && (
            <div className="flex items-center gap-3 text-sm">
              <div className="flex-1 bg-gray-800 h-2 rounded-full overflow-hidden max-w-md">
                <div
                  className="bg-green-500 h-full transition-all"
                  style={{ width: `${courseProgress}%` }}
                />
              </div>
              <span className="text-gray-400">
                {Math.round(courseProgress)}% Complete
              </span>
            </div>
          )}
        </div>

        {lessons.length === 0 ? (
          <div className="text-center text-gray-400 py-16">
            No lessons available in this course yet.
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {lessons.map((lesson) => (
              <div
                key={lesson.id}
                onClick={() => handleLessonClick(lesson.id, lesson.is_locked)}
                className={`bg-mambo-panel border rounded-xl p-6 transition ${
                  lesson.is_locked
                    ? "border-gray-800 opacity-60 cursor-not-allowed"
                    : "border-gray-800 hover:border-gray-600 cursor-pointer"
                }`}
              >
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    lesson.is_boss_battle
                      ? "bg-red-600 text-white"
                      : lesson.is_completed
                      ? "bg-green-500 text-black"
                      : lesson.is_locked
                      ? "bg-gray-800 text-gray-500 border border-gray-700"
                      : "bg-mambo-blue text-white"
                  }`}
                >
                  {lesson.is_boss_battle ? "⚔️" : lesson.order_index}
                </div>
                {lesson.is_locked && (
                  <svg
                    className="w-5 h-5 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                )}
              </div>
              <h3 className="font-bold text-lg mb-2 text-mambo-text">{lesson.title}</h3>
              <p className="text-sm text-gray-500 mb-4">
                {lesson.xp_value} XP {lesson.is_boss_battle && "• Boss Battle"}
              </p>
              {lesson.is_completed && (
                <div className="text-green-400 text-sm font-semibold">✓ Completed</div>
              )}
            </div>
          ))}
          </div>
        )}

        {user && firstLesson && !firstLesson.is_locked && (
          <div className="mt-8 text-center">
            <button
              onClick={() => router.push(`/lesson/${firstLesson.id}`)}
              className="px-8 py-4 bg-mambo-blue hover:bg-blue-600 text-white font-bold rounded-full transition shadow-lg shadow-blue-500/25"
            >
              {firstLesson.is_completed ? "Continue Learning" : "Start First Lesson"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

