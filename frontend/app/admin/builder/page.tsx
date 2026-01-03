"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AdminSidebar from "@/components/AdminSidebar";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api";
import { FaArrowLeft, FaPen, FaTrash, FaPlus, FaGripVertical, FaSave } from "react-icons/fa";
import Image from "next/image";

interface Lesson {
  id: string;
  title: string;
  description: string | null;
  video_url: string;
  xp_value: number;
  order_index: number;
  is_boss_battle: boolean;
  duration_minutes: number | null;
}

interface Level {
  id: string;
  title: string;
  order_index: number;
  lessons: Lesson[];
}

interface CourseData {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  order_index: number;
  is_free: boolean;
  image_url: string | null;
  difficulty: string;
  is_published: boolean;
  levels: Level[];
}

export default function AdminBuilderPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get("id");
  
  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [worldTitle, setWorldTitle] = useState("");
  const [difficulty, setDifficulty] = useState("BEGINNER");
  const [description, setDescription] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [isFree, setIsFree] = useState(false);
  const [slug, setSlug] = useState("");

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "admin")) {
      router.push("/login");
      return;
    }
    if (user && courseId) {
      loadCourse();
    } else if (user && !courseId) {
      // New course mode
      setLoading(false);
    }
  }, [user, authLoading, router, courseId]);

  const loadCourse = async () => {
    if (!courseId) return;
    
    try {
      setLoading(true);
      const data = await apiClient.getCourseFullDetails(courseId);
      setCourseData(data);
      setWorldTitle(data.title);
      setDescription(data.description || "");
      setDifficulty(data.difficulty.toUpperCase());
      setIsPublished(data.is_published);
      setIsFree(data.is_free);
      setSlug(data.slug);
    } catch (err: any) {
      console.error("Failed to load course:", err);
      setError(err.message || "Failed to load course");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!courseId) {
      setError("Cannot save: No course ID");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await apiClient.updateCourse(courseId, {
        title: worldTitle,
        description: description || undefined,
        difficulty: difficulty,
        is_published: isPublished,
        is_free: isFree,
        slug: slug || undefined,
      });
      
      // Reload course data
      await loadCourse();
      alert("Course saved successfully!");
    } catch (err: any) {
      console.error("Failed to save course:", err);
      setError(err.message || "Failed to save course");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateLesson = async (levelId: string) => {
    const title = prompt("Enter lesson title:");
    if (!title) return;

    try {
      await apiClient.createLesson(levelId, {
        title,
        video_url: "https://example.com/video/new",
        order_index: courseData?.levels.find(l => l.id === levelId)?.lessons.length || 0,
        xp_value: 50,
        is_boss_battle: false,
      });
      await loadCourse();
    } catch (err: any) {
      console.error("Failed to create lesson:", err);
      alert(err.message || "Failed to create lesson");
    }
  };

  const handleUpdateLesson = async (lessonId: string, updates: Partial<Lesson>) => {
    try {
      await apiClient.updateLesson(lessonId, updates);
      await loadCourse();
    } catch (err: any) {
      console.error("Failed to update lesson:", err);
      alert(err.message || "Failed to update lesson");
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm("Are you sure you want to delete this lesson?")) return;

    try {
      await apiClient.deleteLesson(lessonId);
      await loadCourse();
    } catch (err: any) {
      console.error("Failed to delete lesson:", err);
      alert(err.message || "Failed to delete lesson");
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

  if (!courseId) {
    return (
      <div className="flex h-screen overflow-hidden bg-mambo-dark">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto p-10">
          <h1 className="text-3xl font-bold text-mambo-text mb-6">Course Builder</h1>
          <p className="text-gray-400 mb-6">Select a course to edit, or create a new one.</p>
          <div className="grid grid-cols-3 gap-4">
            {/* Course list would go here */}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-mambo-dark">
      <AdminSidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto p-10">
          <div className="flex justify-between items-center mb-10">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/admin")}
                className="text-gray-400 hover:text-mambo-text"
              >
                <FaArrowLeft />
              </button>
              <h1 className="text-3xl font-bold text-mambo-text">
                Editing: {worldTitle || "Loading..."}
              </h1>
              {isPublished && (
                <span className="bg-green-500/20 text-green-500 text-xs font-bold px-2 py-1 rounded">
                  PUBLISHED
                </span>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-mambo-blue hover:bg-blue-600 px-4 py-2 rounded-lg font-bold text-sm text-white disabled:opacity-50 flex items-center gap-2"
              >
                <FaSave /> {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-900/50 border border-red-500/50 rounded-lg text-red-200 text-sm">
              {error}
            </div>
          )}

          <div className="bg-mambo-panel border border-gray-800 rounded-xl p-6 mb-8">
            <h3 className="font-bold border-b border-gray-800 pb-4 mb-4 text-mambo-text">
              Course Settings
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                  Course Title
                </label>
                <input
                  type="text"
                  value={worldTitle}
                  onChange={(e) => setWorldTitle(e.target.value)}
                  className="w-full bg-black border border-gray-700 rounded-lg p-3 text-mambo-text-light focus:border-mambo-blue outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                  Difficulty
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full bg-black border border-gray-700 rounded-lg p-3 text-mambo-text-light focus:border-mambo-blue outline-none"
                >
                  <option value="BEGINNER">Beginner</option>
                  <option value="INTERMEDIATE">Intermediate</option>
                  <option value="ADVANCED">Advanced</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full bg-black border border-gray-700 rounded-lg p-3 text-mambo-text-light focus:border-mambo-blue outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                  Slug
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full bg-black border border-gray-700 rounded-lg p-3 text-mambo-text-light focus:border-mambo-blue outline-none"
                  placeholder="course-slug"
                />
              </div>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFree}
                    onChange={(e) => setIsFree(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-mambo-text-light">Free Course</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-mambo-text-light">Published</span>
                </label>
              </div>
            </div>
          </div>

          {/* Levels and Lessons */}
          {courseData && courseData.levels.map((level) => (
            <div key={level.id} className="bg-mambo-panel border border-gray-800 rounded-xl p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-mambo-text">{level.title}</h3>
                <button
                  onClick={() => handleCreateLesson(level.id)}
                  className="bg-mambo-blue hover:bg-blue-600 px-3 py-1 rounded-lg text-sm font-bold text-white flex items-center gap-2"
                >
                  <FaPlus /> Add Lesson
                </button>
              </div>

              <div className="space-y-3">
                {level.lessons.map((lesson) => (
                  <div
                    key={lesson.id}
                    className="bg-black border border-gray-700 rounded-lg p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <FaGripVertical className="text-gray-600 cursor-move" />
                      <div className="flex-1">
                        <input
                          type="text"
                          value={lesson.title}
                          onChange={(e) =>
                            handleUpdateLesson(lesson.id, { title: e.target.value })
                          }
                          className="bg-transparent border-none text-mambo-text-light font-bold w-full focus:outline-none"
                        />
                        <div className="text-xs text-gray-500 mt-1">
                          {lesson.xp_value} XP • {lesson.duration_minutes || "N/A"} min
                          {lesson.is_boss_battle && (
                            <span className="ml-2 text-red-400">BOSS BATTLE</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const newUrl = prompt("Enter video URL:", lesson.video_url);
                          if (newUrl) {
                            handleUpdateLesson(lesson.id, { video_url: newUrl });
                          }
                        }}
                        className="text-gray-400 hover:text-mambo-blue"
                      >
                        <FaPen />
                      </button>
                      <button
                        onClick={() => handleDeleteLesson(lesson.id)}
                        className="text-gray-400 hover:text-red-400"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
