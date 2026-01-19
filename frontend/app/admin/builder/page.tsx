"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AdminSidebar from "@/components/AdminSidebar";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api";
import { FaArrowLeft, FaPen, FaTrash, FaPlus, FaGripVertical, FaSave, FaEdit, FaTimes, FaMinus } from "react-icons/fa";
import Image from "next/image";
import LessonContentEditor from "@/components/LessonContentEditor";
import MuxUploader from "@/components/MuxUploader";
import CreateCourseModal from "@/components/CreateCourseModal";
import LessonEditorModal from "@/components/LessonEditorModal";
import ImageUploader from "@/components/common/ImageUploader";
import CoursePreviewUploader from "@/components/CoursePreviewUploader";

interface Lesson {
  id: string;
  title: string;
  description: string | null;
  video_url: string;
  xp_value: number;
  order_index: number;
  is_boss_battle: boolean;
  duration_minutes?: number | null;
  week_number?: number | null;
  day_number?: number | null;
  content_json?: any | null;
  mux_playback_id?: string | null;
  mux_asset_id?: string | null;
  thumbnail_url?: string | null;
  lesson_type?: string;
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
  thumbnail_url?: string | null;
  difficulty: string;
  is_published: boolean;
  levels: Level[];
  course_type?: string;
}

function AdminBuilderPageContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get("id");
  
  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [editingContentFor, setEditingContentFor] = useState<string | null>(null);
  const [courses, setCourses] = useState<Array<{ id: string; title: string; difficulty: string; description: string | null; thumbnail_url?: string | null }>>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [creatingLessonForLevel, setCreatingLessonForLevel] = useState<string | null>(null);
  const [creatingLessonWeek, setCreatingLessonWeek] = useState<number | undefined>(undefined);
  const [creatingLessonDay, setCreatingLessonDay] = useState<number | undefined>(undefined);

  // Form state
  const [worldTitle, setWorldTitle] = useState("");
  const [difficulty, setDifficulty] = useState("BEGINNER");
  const [courseType, setCourseType] = useState("course");
  const [description, setDescription] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [isFree, setIsFree] = useState(false);
  const [slug, setSlug] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>("");
  const [previewMuxPlaybackId, setPreviewMuxPlaybackId] = useState<string | null>(null);

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
      setCourseData(data as CourseData);
      setWorldTitle(data.title);
      setDescription(data.description || "");
      setDifficulty(data.difficulty.toUpperCase());
      setCourseType((data as any).course_type || "course");
      setIsPublished(data.is_published);
      setIsFree(data.is_free);
      setSlug(data.slug);
      setThumbnailUrl(data.thumbnail_url || null);
      setPreviewMuxPlaybackId((data as any).mux_preview_playback_id || null);
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
        course_type: courseType,
        is_published: isPublished,
        is_free: isFree,
        slug: slug || undefined,
        thumbnail_url: thumbnailUrl || undefined,
        mux_preview_playback_id: previewMuxPlaybackId || undefined,
      } as any);
      
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

  const handleCreateLesson = async (levelId?: string, weekNumber?: number, dayNumber?: number) => {
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
    setCreatingLessonWeek(weekNumber);
    setCreatingLessonDay(dayNumber);
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
    is_boss_battle: boolean;
    duration_minutes?: number | null;
    content_json?: any;
    delete_video?: boolean; // Flag to explicitly delete video (clears Mux IDs)
    lesson_type?: string;
  }) => {
    try {
      if (editingLesson) {
        // Update existing lesson - preserve week/day from existing lesson
        // Do NOT send mux_playback_id or mux_asset_id - webhook manages these
        const { mux_playback_id, mux_asset_id, ...lessonData } = data as any;
        await apiClient.updateLesson(editingLesson.id, {
          ...lessonData,
        });
      } else if (creatingLessonForLevel) {
        // Create new lesson - use week/day from context
        const level = courseData?.levels.find(l => l.id === creatingLessonForLevel);
        if (!level) {
          throw new Error("Level not found. Please try again.");
        }
        // Do NOT send mux_playback_id or mux_asset_id for new lessons
        const { mux_playback_id, mux_asset_id, delete_video, ...lessonData } = data as any;
        await apiClient.createLesson(creatingLessonForLevel, {
          ...lessonData,
          week_number: creatingLessonWeek !== undefined ? creatingLessonWeek : null,
          day_number: creatingLessonDay !== undefined ? creatingLessonDay : null,
          order_index: level.lessons.length || 0,
        });
      } else {
        throw new Error("No level selected for lesson creation");
      }
      // Reload course data to get the latest lesson info
      await loadCourse();
      
      // For new lessons, close the modal and return to course builder
      if (creatingLessonForLevel) {
        setShowLessonModal(false);
        setEditingLesson(null);
        setCreatingLessonForLevel(null);
        setCreatingLessonWeek(undefined);
        setCreatingLessonDay(undefined);
      }
      // For existing lessons, don't close the modal - user can continue editing
    } catch (err: any) {
      console.error("Failed to save lesson:", err);
      throw err;
    }
  };

  const renderLessonItem = (lesson: Lesson) => {
    // Get thumbnail: Use thumbnail_url if available, otherwise fallback to Mux thumbnail
    const thumbnailUrl = (lesson as any).thumbnail_url 
      ? (lesson as any).thumbnail_url
      : lesson.mux_playback_id 
        ? `https://image.mux.com/${lesson.mux_playback_id}/thumbnail.png`
        : null; // No thumbnail available

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
      await apiClient.updateLesson(lessonId, updates as any);
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
      const errorMessage = err.message || "Failed to delete lesson";
      alert(`Error: ${errorMessage}\n\nPlease check:\n1. Backend is running (http://localhost:8000)\n2. You are logged in as admin\n3. Network connection is working`);
    }
  };

  const handleAddWeek = () => {
    if (!courseData) return;
    
    // Find the highest week number
    const allLessons = courseData.levels.flatMap(level => level.lessons);
    const maxWeek = allLessons
      .filter(l => l.week_number !== null && l.week_number !== undefined)
      .reduce((max, l) => Math.max(max, l.week_number || 0), 0);
    
    const newWeek = maxWeek + 1;
    // Automatically add Day 1 for the new week
    handleAddDay(newWeek);
  };

  const handleDeleteWeek = async (week: number) => {
    if (!confirm(`Are you sure you want to delete Week ${week}? This will delete all lessons in this week.`)) return;
    
    if (!courseData) return;
    
    try {
      const allLessons = courseData.levels.flatMap(level => level.lessons);
      const weekLessons = allLessons.filter(l => l.week_number === week);
      
      // Delete all lessons in this week
      for (const lesson of weekLessons) {
        await apiClient.deleteLesson(lesson.id);
      }
      
      await loadCourse();
    } catch (err: any) {
      console.error("Failed to delete week:", err);
      alert(err.message || "Failed to delete week");
    }
  };

  const handleAddDay = async (week: number) => {
    if (!courseData) return;
    
    // Find the highest day number for this week
    const allLessons = courseData.levels.flatMap(level => level.lessons);
    const weekLessons = allLessons.filter(l => l.week_number === week);
    const maxDay = weekLessons
      .filter(l => l.day_number !== null && l.day_number !== undefined)
      .reduce((max, l) => Math.max(max, l.day_number || 0), 0);
    
    const newDay = maxDay + 1;
    // Open lesson creation modal with the new week/day context
    await handleCreateLesson(undefined, week, newDay);
  };

  const handleDeleteDay = async (week: number, day: number) => {
    if (!confirm(`Are you sure you want to delete Day ${day} of Week ${week}? This will delete all lessons in this day.`)) return;
    
    if (!courseData) return;
    
    try {
      const allLessons = courseData.levels.flatMap(level => level.lessons);
      const dayLessons = allLessons.filter(l => l.week_number === week && l.day_number === day);
      
      // Delete all lessons in this day
      for (const lesson of dayLessons) {
        await apiClient.deleteLesson(lesson.id);
      }
      
      await loadCourse();
    } catch (err: any) {
      console.error("Failed to delete day:", err);
      alert(err.message || "Failed to delete day");
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
                  onClick={() => router.push(`/admin/builder?id=${course.id}`)}
                  className="bg-mambo-panel border border-gray-700 rounded-lg overflow-hidden hover:border-mambo-blue transition relative group cursor-pointer"
                >
                  {/* Thumbnail background */}
                  <div className="h-32 relative overflow-hidden bg-black">
                    {course.thumbnail_url ? (
                      <Image
                        src={course.thumbnail_url}
                        alt={course.title}
                        fill
                        className="object-cover group-hover:scale-105 transition duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900" />
                    )}
                    {/* Dark overlay for better text readability */}
                    <div className="absolute inset-0 bg-black/40" />
                    
                    {/* Upload button - smaller, positioned at top-right */}
                    <div
                      className="absolute top-2 right-2 z-10"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="w-20">
                        <ImageUploader
                          currentImageUrl={course.thumbnail_url}
                          onUploadComplete={async (url) => {
                            try {
                              await apiClient.updateCourse(course.id, {
                                thumbnail_url: url || undefined,
                              });
                              // Update the course in the current courses state without reloading
                              setCourses(prevCourses => 
                                prevCourses.map(c => 
                                  c.id === course.id 
                                    ? { ...c, thumbnail_url: url || null }
                                    : c
                                )
                              );
                            } catch (error) {
                              console.error("Failed to update thumbnail:", error);
                            }
                          }}
                          folder="thumbnails"
                          aspectRatio="video"
                          label=""
                          className="text-xs"
                        />
                      </div>
                    </div>

                    {/* Delete button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCourse(course.id, course.title, e);
                      }}
                      className="absolute top-2 left-2 p-2 text-gray-400 hover:text-red-400 hover:bg-red-900/20 rounded transition opacity-0 group-hover:opacity-100 z-10"
                      title="Delete course"
                    >
                      <FaTrash />
                    </button>

                    {/* Course info overlay */}
                    <div className="absolute bottom-2 left-3 right-3">
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-bold text-base text-white group-hover:text-mambo-blue transition truncate">
                          {course.title}
                        </h3>
                        <span className={`px-2 py-1 rounded text-xs font-bold shrink-0 ${
                          course.difficulty === "Beginner" ? "bg-green-900 text-green-300" :
                          course.difficulty === "Intermediate" ? "bg-yellow-900 text-yellow-300" :
                          "bg-red-900 text-red-300"
                        }`}>
                          {course.difficulty}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  {course.description && (
                    <div className="p-4">
                      <p className="text-gray-400 text-sm line-clamp-2">{course.description}</p>
                    </div>
                  )}
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
                onClick={() => router.push("/admin/builder")}
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
                  Content Type
                </label>
                <div className="flex gap-2">
                  {[
                    { value: "course", label: "Course", icon: "📚" },
                    { value: "choreo", label: "Choreo", icon: "💃" },
                    { value: "topic", label: "Topic", icon: "💡" },
                  ].map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setCourseType(type.value)}
                      className={`flex-1 p-3 rounded-lg border-2 transition-all text-center ${
                        courseType === type.value
                          ? "border-amber-500 bg-amber-500/10 text-amber-400"
                          : "border-gray-700 bg-black text-gray-400 hover:border-gray-600"
                      }`}
                    >
                      <div className="text-xl mb-0.5">{type.icon}</div>
                      <div className="text-xs font-bold">{type.label}</div>
                    </button>
                  ))}
                </div>
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

          {/* Course Preview Video Section */}
          <div className="bg-mambo-panel border border-gray-800 rounded-xl p-6 mb-8">
            <h3 className="font-bold border-b border-gray-800 pb-4 mb-4 text-mambo-text">
              Course Preview Video
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              Upload a preview video that will play when users hover over the course card on the courses page.
            </p>
            <div className="space-y-4">
              {courseId && (
                <CoursePreviewUploader
                  courseId={courseId}
                  currentPlaybackId={previewMuxPlaybackId}
                  onUploadComplete={async (playbackId) => {
                    setPreviewMuxPlaybackId(playbackId);
                    // Reload course to get updated preview ID
                    await loadCourse();
                  }}
                  onRefreshCourse={loadCourse}
                />
              )}
            </div>
          </div>

          {/* Curriculum Section */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-xl text-mambo-text">Curriculum</h3>
              {courseData && (
                <button
                  onClick={handleAddWeek}
                  className="text-mambo-blue hover:text-blue-400 text-sm font-bold flex items-center gap-2 transition"
                >
                  <FaPlus />
                  Add Week
                </button>
              )}
            </div>

            {courseData && (() => {
              // Group lessons by week and day
              const weekGroups: { [week: number]: { [day: number]: Lesson[] } } = {};
              const ungroupedLessons: Lesson[] = [];
              
              const allLessons = courseData.levels.flatMap(level => level.lessons);
              
              allLessons.forEach((lesson) => {
                if (lesson.week_number !== null && lesson.week_number !== undefined &&
                    lesson.day_number !== null && lesson.day_number !== undefined) {
                  const week = lesson.week_number;
                  const day = lesson.day_number;
                  
                  if (!weekGroups[week]) {
                    weekGroups[week] = {};
                  }
                  if (!weekGroups[week][day]) {
                    weekGroups[week][day] = [];
                  }
                  weekGroups[week][day].push(lesson);
                } else {
                  ungroupedLessons.push(lesson);
                }
              });
              
              // Sort lessons within each day group by order_index
              Object.keys(weekGroups).forEach(week => {
                Object.keys(weekGroups[parseInt(week)]).forEach(day => {
                  weekGroups[parseInt(week)][parseInt(day)].sort((a, b) => a.order_index - b.order_index);
                });
              });
              
              // Sort weeks and days
              const sortedWeeks = Object.keys(weekGroups)
                .map(Number)
                .sort((a, b) => a - b);

              return (
                <div className="space-y-12">
                  {/* Grouped Lessons by Week/Day */}
                  {sortedWeeks.length > 0 ? (
                    sortedWeeks.map((week) => {
                      const days = Object.keys(weekGroups[week])
                        .map(Number)
                        .sort((a, b) => a - b);
                      
                      return (
                        <div key={week} className="space-y-8">
                          {/* Week Header */}
                          <div className="flex items-center justify-between border-l-4 border-mambo-blue pl-4">
                            <h1 className="text-3xl font-bold text-mambo-text">
                              Week {week}
                            </h1>
                            <button
                              onClick={() => handleDeleteWeek(week)}
                              className="text-red-400 hover:text-red-300 text-sm flex items-center gap-2 transition"
                            >
                              <FaMinus />
                              Remove Week
                            </button>
                          </div>
                          
                          {/* Days within this week */}
                          <div className="space-y-8 pl-8">
                            {days.map((day) => {
                              const dayLessons = weekGroups[week][day];
                              return (
                                <div key={day} className="space-y-4">
                                  {/* Day Header */}
                                  <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3 flex-1">
                                      <h2 className="text-xl font-semibold text-gray-300">
                                        Day {day}
                                      </h2>
                                      <div className="flex-1 h-px bg-gray-800" />
                                      <span className="text-sm text-gray-500">
                                        {dayLessons.length} {dayLessons.length === 1 ? 'lesson' : 'lessons'}
                                      </span>
                                    </div>
                                    <button
                                      onClick={() => handleDeleteDay(week, day)}
                                      className="text-red-400 hover:text-red-300 text-sm flex items-center gap-2 transition"
                                    >
                                      <FaMinus />
                                      Remove Day
                </button>
              </div>

                                  {/* Lessons for this day */}
                                  <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6 pl-4">
                                    {dayLessons.map((lesson) => {
                                      // Get thumbnail: Use thumbnail_url if available, otherwise fallback to Mux thumbnail
                                      const thumbnailUrl = lesson.thumbnail_url
                                        ? lesson.thumbnail_url
                                        : lesson.mux_playback_id
                                        ? `https://image.mux.com/${lesson.mux_playback_id}/thumbnail.png`
                                        : null;

                                      return (
                  <div
                    key={lesson.id}
                                        onClick={() => handleEditLesson(lesson)}
                                        className="relative bg-mambo-panel border border-gray-800 rounded-xl overflow-hidden transition hover:border-mambo-blue/50 hover:shadow-lg hover:shadow-mambo-blue/10 group cursor-pointer aspect-video min-h-[140px] w-full"
                                      >
                                        {/* Thumbnail background - full card */}
                                        <div className="absolute inset-0 bg-black">
                                          {lesson.thumbnail_url ? (
                                            <Image
                                              src={lesson.thumbnail_url}
                                              alt={lesson.title}
                                              fill
                                              className="object-cover"
                                            />
                                          ) : lesson.mux_playback_id ? (
                                            <Image
                                              src={`https://image.mux.com/${lesson.mux_playback_id}/thumbnail.png`}
                                              alt={lesson.title}
                                              fill
                                              className="object-cover"
                                            />
                                          ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900" />
                                          )}
                                          {/* Dark overlay for better text readability */}
                                          <div className="absolute inset-0 bg-black/50" />
                                          
                                          {/* Upload thumbnail button - smaller, positioned at top-right */}
                                          <div
                                            className="absolute top-1 right-1 z-20"
                                            onClick={(e) => e.stopPropagation()}
                                          >
                                            <div className="w-16">
                                              <ImageUploader
                                                currentImageUrl={lesson.thumbnail_url}
                                                onUploadComplete={async (url) => {
                                                  try {
                                                    await apiClient.updateLesson(lesson.id, {
                                                      thumbnail_url: url || undefined,
                                                    });
                                                    // Update the lesson in the current courseData state without reloading
                                                    if (courseData) {
                                                      const updatedCourseData = { ...courseData };
                                                      updatedCourseData.levels = updatedCourseData.levels.map(level => ({
                                                        ...level,
                                                        lessons: level.lessons.map(l => 
                                                          l.id === lesson.id 
                                                            ? { ...l, thumbnail_url: url || null }
                                                            : l
                                                        )
                                                      }));
                                                      setCourseData(updatedCourseData);
                                                    }
                                                  } catch (error) {
                                                    console.error("Failed to update thumbnail:", error);
                                                  }
                                                }}
                                                folder="thumbnails"
                                                aspectRatio="video"
                                                label=""
                                                className="text-xs"
                                              />
                                            </div>
                                          </div>

                                          {/* Delete button */}
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleDeleteLesson(lesson.id);
                                            }}
                                            className="absolute top-1 left-1 p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-900/20 rounded transition opacity-0 group-hover:opacity-100 z-20"
                                            title="Delete lesson"
                                          >
                                            <FaTrash className="text-xs" />
                                          </button>

                                          {/* Boss battle indicator */}
                          {lesson.is_boss_battle && (
                                            <div className="absolute top-1 left-10 z-20">
                                              <span className="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded">⚔️ Boss</span>
                                            </div>
                                          )}
                                        </div>

                                        {/* Lesson info - overlaid on thumbnail */}
                                        <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
                                          <h3 className="font-bold text-sm mb-1 text-white line-clamp-2 drop-shadow-lg">{lesson.title}</h3>
                                          <p className="text-xs text-gray-200 drop-shadow-lg">
                                            {lesson.xp_value} XP
                                          </p>
                                        </div>
                                      </div>
                                    );
                                    })}
                                    {/* Add Lesson Button for this day */}
                                    <button
                                      onClick={() => handleCreateLesson(undefined, week, day)}
                                      className="bg-mambo-panel border-2 border-dashed border-gray-700 rounded-xl p-5 transition hover:border-mambo-blue hover:bg-gray-800/50 flex flex-col items-center justify-center text-gray-400 hover:text-mambo-blue min-h-[140px]"
                                    >
                                      <FaPlus className="text-2xl mb-2" />
                                      <span className="text-sm font-bold">Add Lesson</span>
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                            {/* Add Day Button for this week */}
                            <button
                              onClick={() => handleAddDay(week)}
                              className="ml-4 text-mambo-blue hover:text-blue-400 text-sm font-bold flex items-center gap-2 transition"
                            >
                              <FaPlus />
                              Add Day
                            </button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="border-2 border-dashed border-gray-800 rounded-lg p-8 flex flex-col items-center justify-center text-gray-500">
                      <FaPlus className="text-3xl mb-3" />
                      <span className="font-bold text-sm">Click "Add Week" to start building your curriculum</span>
                    </div>
                  )}

                  {/* Ungrouped Lessons */}
                  {ungroupedLessons.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <h2 className="text-xl font-semibold text-gray-500">Other Lessons</h2>
                        <div className="flex-1 h-px bg-gray-800" />
                      </div>
                      <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {ungroupedLessons.map((lesson) => (
                          <div
                            key={lesson.id}
                            className="bg-mambo-panel border border-gray-800 rounded-xl p-5 transition hover:border-mambo-blue/50 hover:shadow-lg hover:shadow-mambo-blue/10 group"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                                  lesson.is_boss_battle
                                    ? "bg-red-600 text-white"
                                    : "bg-mambo-blue text-white"
                                }`}
                              >
                                {lesson.is_boss_battle ? "⚔️" : lesson.order_index}
                    </div>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditLesson(lesson);
                                  }}
                                  className="p-1.5 hover:text-mambo-blue text-gray-500 transition"
                                  title="Edit lesson"
                                >
                                  <FaPen className="text-xs" />
                                </button>
                      <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingContentFor(lesson.id);
                                  }}
                                  className="p-1.5 hover:text-blue-400 text-gray-500 transition"
                                  title="Edit content"
                                >
                                  <FaEdit className="text-xs" />
                      </button>
                      <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteLesson(lesson.id);
                                  }}
                                  className="p-1.5 hover:text-red-500 text-gray-500 transition"
                                  title="Delete lesson"
                                >
                                  <FaTrash className="text-xs" />
                      </button>
                    </div>
                            </div>
                            <h3 className="font-bold text-base mb-2 text-mambo-text line-clamp-2">{lesson.title}</h3>
                            <p className="text-xs text-gray-500 mb-3">
                              {lesson.xp_value} XP {lesson.is_boss_battle && "• Boss Battle"}
                            </p>
                  </div>
                ))}
              </div>
            </div>
                  )}
                </div>
              );
            })()}
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
          setCreatingLessonWeek(undefined);
          setCreatingLessonDay(undefined);
        }}
        onSave={handleSaveLesson}
        lesson={editingLesson ? {
          ...editingLesson,
          week_number: editingLesson.week_number ?? null,
          day_number: editingLesson.day_number ?? null,
          duration_minutes: editingLesson.duration_minutes ?? null,
          content_json: editingLesson.content_json ?? null,
          mux_playback_id: editingLesson.mux_playback_id ?? null,
          mux_asset_id: editingLesson.mux_asset_id ?? null,
        } : null}
        onRefreshLesson={loadCourse}
      />
    </div>
  );
}

export default function AdminBuilderPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-mambo-dark flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-mambo-blue border-t-transparent rounded-full" /></div>}>
      <AdminBuilderPageContent />
    </Suspense>
  );
}
