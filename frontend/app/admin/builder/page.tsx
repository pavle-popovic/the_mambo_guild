"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AdminSidebar from "@/components/AdminSidebar";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api";
import { FaArrowLeft, FaPen, FaTrash, FaPlus, FaGripVertical, FaSave, FaEdit, FaTimes } from "react-icons/fa";
import Image from "next/image";
import LessonContentEditor from "@/components/LessonContentEditor";
import MuxUploader from "@/components/MuxUploader";
import CreateCourseModal from "@/components/CreateCourseModal";
import LessonEditorModal from "@/components/LessonEditorModal";

interface Lesson {
  id: string;
  title: string;
  description: string | null;
  video_url: string;
  xp_value: number;
  order_index: number;
  is_boss_battle: boolean;
  duration_minutes: number | null;
  week_number: number | null;
  day_number: number | null;
  content_json: any | null;
  mux_playback_id: string | null;
  mux_asset_id: string | null;
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
  const [editingContentFor, setEditingContentFor] = useState<string | null>(null);
  const [courses, setCourses] = useState<Array<{ id: string; title: string; difficulty: string; description: string | null }>>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [creatingLessonForLevel, setCreatingLessonForLevel] = useState<string | null>(null);

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
      // Load courses list
      loadCourses();
    }
  }, [user, authLoading, router, courseId]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const coursesList = await apiClient.getAdminCourses();
      setCourses(coursesList);
    } catch (err: any) {
      console.error("Failed to load courses:", err);
      setError(err.message || "Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

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

  const handleCreateLesson = async (levelId?: string) => {
    // If no levelId provided or course has no levels, create a default level first
    let targetLevelId = levelId;
    
    if (!targetLevelId && courseData) {
      if (courseData.levels.length === 0) {
        // Create a default level
        try {
          const newLevel = await apiClient.createLevel(courseData.id, {
            title: "Level 1",
            order_index: 0,
          });
          targetLevelId = newLevel.id;
          // Reload course to get the new level
          await loadCourse();
        } catch (err: any) {
          console.error("Failed to create level:", err);
          const errorMessage = err?.message || err?.detail || (typeof err === 'string' ? err : JSON.stringify(err)) || "Failed to create level";
          alert(errorMessage);
          return;
        }
      } else {
        targetLevelId = courseData.levels[0].id;
      }
    }

    if (!targetLevelId) {
      alert("Cannot create lesson: No level available");
      return;
    }

    setEditingLesson(null);
    setCreatingLessonForLevel(targetLevelId);
    setShowLessonModal(true);
  };

  const handleEditLesson = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setCreatingLessonForLevel(null);
    setShowLessonModal(true);
  };

  const handleSaveLesson = async (data: {
    title: string;
    description?: string;
    video_url: string;
    xp_value: number;
    week_number: number | null;
    day_number: number | null;
    is_boss_battle: boolean;
    duration_minutes?: number | null;
    content_json?: any;
    delete_video?: boolean; // Flag to explicitly delete video (clears Mux IDs)
  }) => {
    try {
      if (editingLesson) {
        // Update existing lesson
        // Do NOT send mux_playback_id or mux_asset_id - webhook manages these
        const { mux_playback_id, mux_asset_id, ...lessonData } = data as any;
        await apiClient.updateLesson(editingLesson.id, {
          ...lessonData,
        });
      } else if (creatingLessonForLevel) {
        // Create new lesson
        const level = courseData?.levels.find(l => l.id === creatingLessonForLevel);
        if (!level) {
          throw new Error("Level not found. Please try again.");
        }
        // Do NOT send mux_playback_id or mux_asset_id for new lessons
        const { mux_playback_id, mux_asset_id, delete_video, ...lessonData } = data as any;
        await apiClient.createLesson(creatingLessonForLevel, {
          ...lessonData,
          order_index: level.lessons.length || 0,
        });
      } else {
        throw new Error("No level selected for lesson creation");
      }
      // Reload course data to get the latest lesson info
      await loadCourse();
      
      // Don't update editingLesson prop after save - this would reset the form
      // The modal preserves user's current edits, and they can continue editing
      // Only update if creating a new lesson (to switch from "new" to "existing" mode)
      if (creatingLessonForLevel && courseData) {
        // For new lessons, find the newly created lesson
        const updatedLevel = courseData.levels.find(l => l.id === creatingLessonForLevel);
        if (updatedLevel && updatedLevel.lessons.length > 0) {
          // Get the last lesson (should be the one we just created based on order_index)
          // Sort by order_index to be safe, then get the last one
          const sortedLessons = [...updatedLevel.lessons].sort((a, b) => b.order_index - a.order_index);
          const newLesson = sortedLessons[0];
          if (newLesson) {
            setEditingLesson(newLesson);
            setCreatingLessonForLevel(null); // Clear the creating state since lesson now exists
          }
        }
      }
      
      // Don't update editingLesson for existing lessons - this prevents form reset
      // Don't close the modal automatically - let user decide when to close
      // This allows user to continue editing, upload videos, etc.
    } catch (err: any) {
      console.error("Failed to save lesson:", err);
      throw err;
    }
  };

  const renderLessonItem = (lesson: Lesson) => {
    // Get thumbnail from video URL or Mux playback ID
    const thumbnailUrl = lesson.mux_playback_id 
      ? `https://image.mux.com/${lesson.mux_playback_id}/thumbnail.png`
      : lesson.video_url; // Fallback to video URL

    return (
      <div className="bg-mambo-panel border border-gray-800 p-4 rounded-lg flex items-center gap-4 group cursor-move hover:border-gray-600 transition">
        <FaGripVertical className="text-gray-600 group-hover:text-gray-400" />
        <div className="w-16 h-10 bg-gray-800 rounded overflow-hidden flex-shrink-0">
          {thumbnailUrl ? (
            <img 
              src={thumbnailUrl} 
              alt={lesson.title}
              className="w-full h-full object-cover opacity-50"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='40'%3E%3Crect fill='%23333' width='64' height='40'/%3E%3C/svg%3E";
              }}
            />
          ) : (
            <div className="w-full h-full bg-gray-700" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-sm text-mambo-text truncate">{lesson.title}</div>
          <div className="text-xs text-gray-500">
            Video • {lesson.xp_value} XP
            {lesson.duration_minutes && ` • ${lesson.duration_minutes} min`}
            {lesson.is_boss_battle && <span className="ml-2 text-red-400">• BOSS BATTLE</span>}
          </div>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEditLesson(lesson);
            }}
            className="p-2 hover:text-mambo-text text-gray-500 transition"
            title="Edit lesson"
          >
            <FaPen />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setEditingContentFor(lesson.id);
            }}
            className="p-2 hover:text-blue-400 text-gray-500 transition"
            title="Edit rich content"
          >
            <FaEdit />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteLesson(lesson.id);
            }}
            className="p-2 hover:text-red-500 text-gray-500 transition"
            title="Delete lesson"
          >
            <FaTrash />
          </button>
        </div>
      </div>
    );
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

  const handleCreateCourse = async (data: {
    title: string;
    slug: string;
    description?: string;
    difficulty: string;
    order_index: number;
    is_free: boolean;
    is_published: boolean;
    image_url?: string;
  }) => {
    const newCourse = await apiClient.createCourse(data);
    // Reload courses and redirect to edit the new course
    await loadCourses();
    router.push(`/admin/builder?id=${newCourse.id}`);
  };

  const handleDeleteCourse = async (courseId: string, courseTitle: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the course selection
    
    if (!confirm(`Are you sure you want to delete "${courseTitle}"?\n\nThis will permanently delete the course, all its levels, and all lessons. This action cannot be undone.`)) {
      return;
    }

    try {
      await apiClient.deleteCourse(courseId);
      // Reload courses list
      await loadCourses();
      alert("Course deleted successfully!");
    } catch (err: any) {
      console.error("Failed to delete course:", err);
      alert(err.message || "Failed to delete course");
    }
  };

  if (!courseId) {
    return (
      <div className="flex h-screen overflow-hidden bg-mambo-dark">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto p-10">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-mambo-text mb-2">Course Builder</h1>
              <p className="text-gray-400">Select a course to edit, or create a new one.</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 bg-mambo-blue hover:bg-blue-600 px-6 py-3 rounded-lg text-white font-bold transition"
            >
              <FaPlus />
              Create New Course
            </button>
          </div>

          {loading ? (
            <div className="text-gray-400">Loading courses...</div>
          ) : courses.length === 0 ? (
            <div className="text-gray-400 text-center py-12">
              <p className="mb-4">No courses yet. Create your first course to get started!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="bg-mambo-panel border border-gray-700 rounded-lg p-6 hover:border-mambo-blue transition relative group"
                >
                  <button
                    onClick={() => router.push(`/admin/builder?id=${course.id}`)}
                    className="w-full text-left"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold text-mambo-text pr-8">{course.title}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        course.difficulty === "Beginner" ? "bg-green-900 text-green-300" :
                        course.difficulty === "Intermediate" ? "bg-yellow-900 text-yellow-300" :
                        "bg-red-900 text-red-300"
                      }`}>
                        {course.difficulty}
                      </span>
                    </div>
                    {course.description && (
                      <p className="text-gray-400 text-sm line-clamp-2">{course.description}</p>
                    )}
                  </button>
                  <button
                    onClick={(e) => handleDeleteCourse(course.id, course.title, e)}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-400 hover:bg-red-900/20 rounded transition opacity-0 group-hover:opacity-100"
                    title="Delete course"
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
            </div>
          )}
        </main>

        {/* Create Course Modal */}
        <CreateCourseModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateCourse}
          defaultOrderIndex={courses.length + 1}
        />
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

          {/* Curriculum Section */}
          <div className="flex justify-between items-end mb-4">
            <h3 className="font-bold text-xl text-mambo-text">Curriculum</h3>
            {courseData && (
              <button
                onClick={() => handleCreateLesson()}
                className="text-mambo-blue hover:text-blue-400 text-sm font-bold flex items-center gap-2 transition"
              >
                <FaPlus />
                Add New Lesson
              </button>
            )}
          </div>

          <div className="space-y-3">
            {/* Render all lessons from all levels in a flat list */}
            {courseData && courseData.levels.flatMap(level => level.lessons).length > 0 ? (
              courseData.levels.flatMap(level => 
                level.lessons.map(lesson => (
                  <div key={lesson.id}>
                    {renderLessonItem(lesson)}
                  </div>
                ))
              )
            ) : (
              <div className="border-2 border-dashed border-gray-800 rounded-lg p-8 flex flex-col items-center justify-center text-gray-500 hover:border-mambo-blue hover:text-mambo-blue hover:bg-gray-900 transition cursor-pointer"
                onClick={() => courseData && handleCreateLesson()}
              >
                <FaPlus className="text-3xl mb-3" />
                <span className="font-bold text-sm">Click to add a new lesson</span>
                <span className="text-xs mt-1">Start building your curriculum</span>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Content Editor Modal */}
      {editingContentFor && courseData && (() => {
        const lesson = courseData.levels
          .flatMap(l => l.lessons)
          .find(l => l.id === editingContentFor);
        
        if (!lesson) return null;

        return (
          <LessonContentEditor
            contentJson={lesson.content_json}
            onSave={async (content) => {
              try {
                await handleUpdateLesson(editingContentFor, { content_json: content });
                setEditingContentFor(null);
              } catch (err: any) {
                console.error("Failed to save content:", err);
                alert(err.message || "Failed to save content");
              }
            }}
            onClose={() => setEditingContentFor(null)}
          />
        );
      })()}

      {/* Create Course Modal */}
      <CreateCourseModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateCourse}
        defaultOrderIndex={courses.length + 1}
      />

      {/* Lesson Editor Modal */}
      <LessonEditorModal
        isOpen={showLessonModal}
        onClose={() => {
          setShowLessonModal(false);
          setEditingLesson(null);
          setCreatingLessonForLevel(null);
        }}
        onSave={handleSaveLesson}
        lesson={editingLesson}
        onRefreshLesson={loadCourse}
      />
    </div>
  );
}
