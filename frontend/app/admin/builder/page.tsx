"use client";

import { useEffect, useState, Suspense, useCallback } from "react";
import AdminGraphBuilder from "@/components/skill-tree/AdminGraphBuilder";
import ConstellationGraph from "@/components/skill-tree/ConstellationGraph";
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
import LevelPreviewUploader from "@/components/LevelPreviewUploader";

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
  thumbnail_url?: string | null;
  mux_preview_playback_id?: string | null;
  mux_preview_asset_id?: string | null;
  // Module metadata
  description?: string | null;
  outcome?: string | null;
  duration_minutes?: number;
  total_xp?: number;
  status?: string;  // active, coming_soon, locked
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
  // Course metadata
  total_duration_minutes?: number;
  objectives?: string[];
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
  const [viewMode, setViewMode] = useState<'graph' | 'list' | 'code'>('graph'); // View toggle - default to graph
  const [graphLevels, setGraphLevels] = useState<any[]>([]);
  const [graphEdges, setGraphEdges] = useState<any[]>([]);
  const [selectedLevelId, setSelectedLevelId] = useState<string | null>(null); // For lesson editor
  const [mermaidCode, setMermaidCode] = useState<string>(""); // For mermaid code view
  const [graphDataLoaded, setGraphDataLoaded] = useState(false); // Track if graph data has been loaded
  const [showCreateModuleModal, setShowCreateModuleModal] = useState(false); // For creating new modules
  const [newModuleTitle, setNewModuleTitle] = useState(""); // New module title
  const [newModulePrerequisites, setNewModulePrerequisites] = useState<string[]>([]); // Selected prerequisite module IDs

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
  // Course metadata state
  const [totalDuration, setTotalDuration] = useState<number>(0);
  const [objectives, setObjectives] = useState<string[]>([]);

  // Define loadGraphData BEFORE useEffects that use it
  const loadGraphData = async () => {
    if (!courseId) return;
    if (graphDataLoaded) {
      return; // Already loaded, skip
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/courses/worlds/${courseId}/skill-tree`,
        {
          credentials: "include" as RequestCredentials,
        }
      );

      if (!response.ok) throw new Error("Failed to load graph data");

      const data = await response.json();
      setGraphLevels(data.levels || []);
      setGraphEdges(data.edges || []);
      setGraphDataLoaded(true);
    } catch (err) {
      console.error("Failed to load graph data:", err);
    }
  };

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
      // Course metadata
      setTotalDuration((data as any).total_duration_minutes || 0);
      setObjectives((data as any).objectives || []);

      // Don't load graph data here - let the useEffect handle it
    } catch (err: any) {
      console.error("Failed to load course:", err);
      setError(err.message || "Failed to load course");
    } finally {
      setLoading(false);
    }
  };

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

  useEffect(() => {
    // Only load graph data if we're in graph view, have course data, and haven't loaded yet
    if (viewMode === 'graph' && courseId && courseData && !graphDataLoaded) {
      console.log('[Admin Builder] useEffect triggering loadGraphData');
      loadGraphData();
    }
  }, [viewMode, courseId, courseData, graphDataLoaded]); // Removed loadGraphData from dependencies


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
        // Course metadata
        total_duration_minutes: totalDuration || undefined,
        objectives: objectives.length > 0 ? objectives : undefined,
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

  // Handle creating a new module (level)
  const handleCreateModule = async () => {
    if (!courseId || !newModuleTitle.trim()) {
      alert("Module title is required");
      return;
    }

    try {
      // Create the new level
      const newLevel = await apiClient.createLevel(courseId, {
        title: newModuleTitle.trim(),
        order_index: graphLevels.length,
      });

      // If prerequisites were selected, create edges
      if (newModulePrerequisites.length > 0) {
        for (const prereqId of newModulePrerequisites) {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/admin/worlds/${courseId}/edges`,
            {
              method: "POST",
              credentials: "include" as RequestCredentials,
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                from_level_id: prereqId,
                to_level_id: newLevel.id,
              }),
            }
          );
          if (!res.ok) {
            console.error("Failed to create edge:", await res.text());
          }
        }
      }

      // Reset form and close modal
      setNewModuleTitle("");
      setNewModulePrerequisites([]);
      setShowCreateModuleModal(false);

      // Refresh graph data
      setGraphDataLoaded(false);
      await loadGraphData();
      await loadCourse();

      alert("Module created successfully!");
    } catch (err: any) {
      console.error("Failed to create module:", err);
      alert(err.message || "Failed to create module");
    }
  };

  // Handle deleting a module (level)
  const handleDeleteModule = async (levelId: string, levelTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${levelTitle}"?\n\nThis will delete all lessons in this module and remove all graph connections.`)) {
      return;
    }

    try {
      await apiClient.deleteLevel(levelId);

      // Close the sidebar
      setSelectedLevelId(null);

      // Refresh data
      setGraphDataLoaded(false);
      await loadGraphData();
      await loadCourse();

      alert("Module deleted successfully!");
    } catch (err: any) {
      console.error("Failed to delete module:", err);
      alert(err.message || "Failed to delete module");
    }
  };

  // Removed excessive logging that was causing console spam

  if (authLoading) {
    return (
      <div className="h-screen bg-mambo-dark flex items-center justify-center">
        <div className="text-gray-400">Checking authentication...</div>
      </div>
    );
  }

  if (loading && !courseData) {
    return (
      <div className="h-screen bg-mambo-dark flex items-center justify-center">
        <div className="text-gray-400">Loading course data...</div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return null;
  }

  // Diagnostic check
  // Course Selection Mode (No ID provided)
  if (!courseId) {
    return (
      <div className="min-h-screen bg-mambo-dark relative">
        <AdminSidebar />
        <div className="pt-8 px-8 pb-8 ml-64">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-2">Select a Course</h1>
            <p className="text-gray-400 mb-8">Choose a course to edit or add lessons to.</p>

            {loading ? (
              <div className="text-center py-20">
                <div className="animate-spin w-10 h-10 border-4 border-mambo-gold/30 border-t-mambo-gold rounded-full mx-auto mb-4" />
                <div className="text-gray-400">Loading courses...</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Create New Course Card */}
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="h-full min-h-[200px] border-2 border-dashed border-gray-700 rounded-xl flex flex-col items-center justify-center text-gray-500 hover:text-white hover:border-mambo-gold hover:bg-white/5 transition-all group"
                >
                  <div className="w-16 h-16 rounded-full bg-gray-800 group-hover:bg-mambo-gold/20 flex items-center justify-center mb-4 transition-colors">
                    <FaPlus className="text-2xl group-hover:text-mambo-gold transition-colors" />
                  </div>
                  <span className="font-bold text-lg">Create New Course</span>
                </button>

                {/* Existing Courses */}
                {courses.map(course => (
                  <div
                    key={course.id}
                    onClick={() => router.push(`/admin/builder?id=${course.id}`)}
                    className="bg-mambo-panel border border-white/10 rounded-xl overflow-hidden cursor-pointer hover:border-mambo-gold/50 hover:shadow-xl hover:scale-[1.02] transition-all group"
                  >
                    <div className="h-40 bg-gray-800 relative">
                      {course.thumbnail_url ? (
                        <Image
                          src={course.thumbnail_url}
                          alt={course.title}
                          fill
                          className="object-cover group-hover:opacity-100 transition-opacity"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-black text-gray-600">
                          <span className="text-4xl">📚</span>
                        </div>
                      )}
                      <div className="absolute top-2 right-2">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${course.difficulty === 'BEGINNER' ? 'bg-green-500/20 text-green-400' :
                          course.difficulty === 'INTERMEDIATE' ? 'bg-yellow-500/20 text-yellow-400' :
                            course.difficulty === 'ADVANCED' ? 'bg-red-500/20 text-red-400' :
                              'bg-purple-500/20 text-purple-400'
                          }`}>
                          {course.difficulty}
                        </span>
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="font-bold text-white text-lg mb-2 line-clamp-1">{course.title}</h3>
                      <p className="text-gray-400 text-sm line-clamp-2 h-10 mb-4">
                        {course.description || "No description provided."}
                      </p>
                      <div className="flex items-center text-mambo-gold font-bold text-sm group-hover:translate-x-1 transition-transform">
                        Edit Course <FaArrowLeft className="ml-2 rotate-180" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Create Course Modal */}
        <CreateCourseModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onCreate={async (data) => {
            const newCourse = await apiClient.createCourse(data);
            await loadCourses();
            router.push(`/admin/builder?id=${newCourse.id}`);
          }}
          defaultOrderIndex={courses.length + 1}
        />
      </div>
    );
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
        <main className="flex-1 overflow-y-auto p-10 ml-64">
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
                        <span className={`px-2 py-1 rounded text-xs font-bold shrink-0 ${course.difficulty === "Beginner" ? "bg-green-900 text-green-300" :
                          course.difficulty === "Intermediate" ? "bg-yellow-900 text-yellow-300" :
                            course.difficulty === "Advanced" ? "bg-red-900 text-red-300" :
                              "bg-purple-900 text-purple-300"
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

  // Main course editing view
  return (
    <div className="flex h-screen overflow-hidden bg-mambo-dark relative">

      <AdminSidebar />

      {/* ml-64 offsets for the fixed AdminSidebar (w-64 = 256px) */}
      <main className="flex-1 overflow-y-auto relative ml-64">
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
                      className={`flex-1 p-3 rounded-lg border-2 transition-all text-center ${courseType === type.value
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
                  <option value="OPEN">Open (All Levels)</option>
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

              {/* Course Metadata Section */}
              <div className="col-span-2 pt-4 border-t border-gray-800">
                <h4 className="text-sm font-bold text-mambo-gold uppercase mb-4">Course Metadata</h4>
                <div className="grid grid-cols-1 gap-4">
                  {/* Total Duration */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                      Total Duration (minutes)
                    </label>
                    <input
                      type="number"
                      value={totalDuration}
                      onChange={(e) => setTotalDuration(parseInt(e.target.value) || 0)}
                      className="w-full bg-black border border-gray-700 rounded-lg p-3 text-mambo-text-light focus:border-mambo-blue outline-none"
                      placeholder="Auto-calculated if 0"
                    />
                    <p className="text-xs text-gray-500 mt-1">Leave at 0 to auto-calculate from lessons</p>
                  </div>

                  {/* Course Objectives */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                      Course Objectives (3 bullet points)
                    </label>
                    <div className="space-y-2">
                      {[0, 1, 2].map((idx) => (
                        <input
                          key={idx}
                          type="text"
                          value={objectives[idx] || ''}
                          onChange={(e) => {
                            const newObjectives = [...objectives];
                            newObjectives[idx] = e.target.value;
                            // Remove trailing empty strings
                            while (newObjectives.length > 0 && newObjectives[newObjectives.length - 1] === '') {
                              newObjectives.pop();
                            }
                            setObjectives(newObjectives);
                          }}
                          className="w-full bg-black border border-gray-700 rounded-lg p-3 text-mambo-text-light focus:border-mambo-blue outline-none"
                          placeholder={`Objective ${idx + 1}...`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Displayed on course card when hovering</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Course Thumbnail Section */}
          <div className="bg-mambo-panel border border-gray-800 rounded-xl p-6 mb-8">
            <h3 className="font-bold border-b border-gray-800 pb-4 mb-4 text-mambo-text">
              Course Thumbnail
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              Static image displayed on the course card. This is shown when no preview video is playing.
            </p>
            <div className="space-y-4">
              {/* Current thumbnail preview */}
              {thumbnailUrl && (
                <div className="relative rounded-lg overflow-hidden border border-gray-700 aspect-video">
                  <img
                    src={thumbnailUrl}
                    alt="Course thumbnail"
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={async () => {
                      setThumbnailUrl(null);
                      if (courseId) {
                        await apiClient.updateCourse(courseId, { thumbnail_url: "" });
                        await loadCourse();
                      }
                    }}
                    className="absolute top-2 right-2 bg-red-900/80 hover:bg-red-800 text-red-300 p-2 rounded-full transition"
                    title="Remove thumbnail"
                  >
                    <FaTrash className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Upload new thumbnail using Cloudflare */}
              <ImageUploader
                currentImageUrl={thumbnailUrl}
                onUploadComplete={async (url) => {
                  setThumbnailUrl(url);
                  if (courseId && url) {
                    await apiClient.updateCourse(courseId, { thumbnail_url: url });
                    await loadCourse();
                  }
                }}
                folder="thumbnails"
                aspectRatio="video"
                label={thumbnailUrl ? "Replace thumbnail" : "Upload thumbnail"}
              />
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

          {/* Danger Zone - Delete Course */}
          <div className="bg-red-950/30 border border-red-800/50 rounded-xl p-6 mb-8">
            <h3 className="font-bold border-b border-red-800/30 pb-4 mb-4 text-red-400">
              Danger Zone
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              Once you delete a course, there is no going back. This will permanently delete the course, all its modules, and all its lessons.
            </p>
            <button
              onClick={async () => {
                if (window.confirm(`Are you sure you want to delete "${worldTitle}"? This action cannot be undone.`)) {
                  if (window.confirm(`FINAL WARNING: All modules and lessons will be permanently deleted. Type "DELETE" to confirm.`)) {
                    const confirmText = window.prompt('Type "DELETE" to confirm:');
                    if (confirmText === "DELETE" && courseId) {
                      try {
                        await apiClient.deleteCourse(courseId);
                        alert("Course deleted successfully");
                        router.push("/admin");
                      } catch (err: any) {
                        alert(err.message || "Failed to delete course");
                      }
                    } else {
                      alert("Deletion cancelled - confirmation text did not match.");
                    }
                  }
                }
              }}
              className="flex items-center gap-2 px-4 py-3 bg-red-900/50 hover:bg-red-900/70 text-red-300 border border-red-700/50 rounded-lg font-bold transition"
            >
              <FaTrash />
              Delete This Course
            </button>
          </div>

          {/* Curriculum Section */}
          <div className="mb-8">
            {/* View Mode Toggle */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex bg-mambo-dark border border-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('graph')}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${viewMode === 'graph'
                    ? 'bg-mambo-blue text-white'
                    : 'text-gray-400 hover:text-mambo-text'
                    }`}
                >
                  🌐 Graph View
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${viewMode === 'list'
                    ? 'bg-mambo-blue text-white'
                    : 'text-gray-400 hover:text-mambo-text'
                    }`}
                >
                  📋 List View
                </button>
                <button
                  onClick={() => setViewMode('code')}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${viewMode === 'code'
                    ? 'bg-mambo-blue text-white'
                    : 'text-gray-400 hover:text-mambo-text'
                    }`}
                >
                  💻 Graph Code
                </button>
              </div>
            </div>

            {/* Graph View - Uses same component as course page */}
            {viewMode === 'graph' && courseData && graphLevels.length > 0 && (
              <div className="relative bg-black rounded-xl border border-gray-800" style={{ height: '70vh' }}>
                <div style={{ height: '100%', width: '100%', position: 'relative' }}>
                  <ConstellationGraph
                    levels={graphLevels}
                    edges={graphEdges}
                    courseId={courseId!}
                    isAdminMode={true}
                    onNodeClick={(levelId) => {
                      // Open lesson editor for this level
                      setSelectedLevelId(levelId);
                    }}
                  />
                </div>
                {/* Admin Controls Overlay - Hide when sidebar is open */}
                {!selectedLevelId && (
                  <div className="absolute top-4 left-4 z-20 flex gap-2 pointer-events-auto">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Force refresh graph data
                        setGraphDataLoaded(false);
                        setTimeout(() => loadGraphData(), 100);
                      }}
                      className="bg-mambo-blue hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold shadow-lg transition"
                    >
                      🔄 Refresh Graph
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Open create module modal
                        setShowCreateModuleModal(true);
                      }}
                      className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-semibold shadow-lg transition flex items-center gap-2"
                    >
                      <FaPlus /> Add Module
                    </button>
                  </div>
                )}
              </div>
            )}

            {viewMode === 'graph' && courseData && graphLevels.length === 0 && !graphDataLoaded && (
              <div className="bg-mambo-panel border border-gray-800 rounded-xl p-12 text-center">
                <p className="text-gray-400 mb-4">Loading skill tree...</p>
                <p className="text-sm text-gray-500 mb-4">Check the browser console for logs</p>
                <button
                  onClick={() => {
                    console.log('[Admin Builder] Manual refresh triggered');
                    setGraphDataLoaded(false);
                    loadGraphData();
                  }}
                  className="bg-mambo-blue hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold transition"
                >
                  Retry Loading
                </button>
              </div>
            )}

            {viewMode === 'graph' && courseData && graphLevels.length === 0 && graphDataLoaded && (
              <div className="bg-mambo-panel border border-gray-800 rounded-xl p-12 text-center">
                <p className="text-gray-400 mb-4">No skill tree data found.</p>
                <p className="text-sm text-gray-500 mb-4">The course may not have any levels yet.</p>
              </div>
            )}

            {/* List View */}
            {viewMode === 'list' && (
              <>
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
                                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${lesson.is_boss_battle
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
              </>
            )}

            {/* Mermaid Code View */}
            {viewMode === 'code' && courseData && (
              <div className="bg-mambo-panel border border-gray-800 rounded-xl p-6">
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-white mb-2">Graph Code (Mermaid)</h3>
                  <p className="text-sm text-gray-400 mb-4">
                    Use Mermaid syntax to define the skill tree graph structure. Changes will be reflected when you save.
                  </p>
                </div>

                <textarea
                  value={mermaidCode}
                  onChange={(e) => setMermaidCode(e.target.value)}
                  placeholder={`graph TD\n    A[Basic Timing] --> B[Basic Steps 1]\n    A --> C[Taps 1]\n    B --> D[Turns 1]\n    C --> D`}
                  className="w-full h-96 bg-black border border-gray-700 rounded-lg p-4 font-mono text-sm text-gray-300 focus:border-mambo-blue focus:outline-none resize-none"
                />

                <div className="mt-4 flex gap-3">
                  <button
                    onClick={async () => {
                      // TODO: Parse Mermaid code and update graph
                      alert("Mermaid parsing not implemented yet. This will parse the code and update the graph structure.");
                    }}
                    className="bg-mambo-blue hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold transition"
                  >
                    💾 Save Graph Structure
                  </button>
                  <button
                    onClick={() => {
                      // Load current graph as Mermaid code
                      const code = graphLevels.map(l => `    ${l.id}[${l.title}]`).join('\n');
                      const edges = graphEdges.map(e => `    ${e.from_level_id} --> ${e.to_level_id}`).join('\n');
                      setMermaidCode(`graph TD\n${code}\n${edges}`);
                    }}
                    className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold transition"
                  >
                    📥 Load Current Graph
                  </button>
                </div>

                <div className="mt-6 bg-black/30 border border-gray-700 rounded-lg p-4">
                  <h4 className="text-sm font-bold text-white mb-2">Mermaid Syntax Help:</h4>
                  <pre className="text-xs text-gray-400 font-mono">
                    {`graph TD
    A[Node Title] --> B[Another Node]
    A --> C[Third Node]
    B --> D[Fourth Node]
    C --> D

    D --> E[Boss Node]`}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Level Lesson Editor Sidebar */}
      {selectedLevelId && courseData && (() => {
        const level = courseData.levels.find(l => l.id === selectedLevelId);
        if (!level) return null;

        const lessons = level.lessons.sort((a, b) => a.order_index - b.order_index);

        return (
          <div className="fixed inset-y-0 right-0 w-[480px] bg-gradient-to-b from-mambo-dark to-black border-l border-yellow-900/30 shadow-2xl z-50 overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-mambo-dark/95 backdrop-blur-sm border-b border-yellow-900/30 p-6 z-10">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-mambo-gold mb-1">{level.title}</h3>
                  <p className="text-sm text-gray-400">{lessons.length} lesson{lessons.length !== 1 ? 's' : ''}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDeleteModule(level.id, level.title)}
                    className="text-gray-400 hover:text-red-400 transition p-2 hover:bg-red-900/20 rounded-lg"
                    title="Delete module"
                  >
                    <FaTrash className="text-sm" />
                  </button>
                  <button
                    onClick={() => setSelectedLevelId(null)}
                    className="text-gray-400 hover:text-white transition p-2 hover:bg-white/10 rounded-lg"
                  >
                    <FaTimes className="text-lg" />
                  </button>
                </div>
              </div>
              <button
                onClick={() => {
                  setCreatingLessonForLevel(selectedLevelId);
                  setShowLessonModal(true);
                }}
                className="w-full bg-gradient-to-r from-mambo-blue to-blue-600 hover:from-blue-600 hover:to-mambo-blue text-white px-4 py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              >
                <FaPlus /> Add New Lesson
              </button>
            </div>

            {/* Lessons List - Now appears first */}
            <div className="p-6 space-y-4">
              {lessons.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No lessons yet</p>
                  <p className="text-sm">Click "Add New Lesson" to get started</p>
                </div>
              ) : (
                lessons.map((lesson, index) => {
                  const lessonType = lesson.lesson_type?.toUpperCase() || 'VIDEO';
                  const typeColor = lessonType === 'QUIZ' ? 'bg-purple-600' : lessonType === 'HISTORY' ? 'bg-blue-600' : 'bg-green-600';
                  const duration = lesson.duration_minutes ? `${lesson.duration_minutes} min` : '';
                  const hasVideo = !!lesson.mux_playback_id;
                  const isVideoLesson = lessonType === 'VIDEO';

                  return (
                    <div
                      key={lesson.id}
                      className={`bg-gradient-to-br from-black/60 to-black/40 border rounded-xl p-4 transition-all group hover:shadow-lg hover:shadow-mambo-gold/10 ${isVideoLesson && hasVideo ? 'border-green-700/50 hover:border-green-600/70' : 'border-gray-700 hover:border-mambo-gold/50'}`}
                    >
                      {/* Lesson Number Badge */}
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 rounded-full bg-mambo-gold/20 border-2 border-mambo-gold/50 flex items-center justify-center">
                            <span className="text-lg font-bold text-mambo-gold">#{index + 1}</span>
                          </div>
                        </div>

                        {/* Lesson Content */}
                        <div className="flex-1 min-w-0">
                          {/* Title and Badges Row */}
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h4 className="text-base font-bold text-white line-clamp-2 flex-1">{lesson.title}</h4>
                          </div>

                          {/* Metadata Row */}
                          <div className="flex flex-wrap items-center gap-2 mb-3">
                            <span className={`text-xs ${typeColor} text-white px-2 py-1 rounded font-bold`}>
                              {lessonType}
                            </span>
                            {/* Video status indicator */}
                            {isVideoLesson && (
                              hasVideo ? (
                                <span className="text-xs bg-green-900/50 text-green-400 px-2 py-1 rounded font-bold">
                                  ✓ Video
                                </span>
                              ) : (
                                <span className="text-xs bg-gray-800 text-gray-500 px-2 py-1 rounded font-bold">
                                  No Video
                                </span>
                              )
                            )}
                            {lesson.is_boss_battle && (
                              <span className="text-xs bg-red-600 text-white px-2 py-1 rounded font-bold">
                                BOSS
                              </span>
                            )}
                            <span className="text-xs text-gray-400">
                              {lesson.xp_value} XP
                            </span>
                            {duration && (
                              <span className="text-xs text-gray-400">
                                • {duration}
                              </span>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingLesson(lesson);
                                setShowLessonModal(true);
                              }}
                              className="flex-1 bg-mambo-blue/20 hover:bg-mambo-blue/30 text-mambo-blue border border-mambo-blue/50 px-3 py-2 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                            >
                              <FaEdit /> Edit
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm(`Delete "${lesson.title}"?`)) {
                                  handleDeleteLesson(lesson.id);
                                }
                              }}
                              className="bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-600/50 px-3 py-2 rounded-lg font-semibold text-sm transition-all"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Module Settings - Now appears after lessons */}
            <div className="p-6 pt-0">
              <div className="bg-black/40 border border-gray-700 rounded-xl p-4 space-y-4">
                <h4 className="text-sm font-bold text-mambo-gold uppercase tracking-wider">Module Details</h4>

                {/* Outcome */}
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Outcome (what users unlock)</label>
                  <input
                    type="text"
                    value={level.outcome || ''}
                    onChange={(e) => {
                      const newLevel = { ...level, outcome: e.target.value };
                      setCourseData(prev => prev ? {
                        ...prev,
                        levels: prev.levels.map(l => l.id === level.id ? newLevel : l)
                      } : null);
                    }}
                    placeholder="e.g., Unlock Stable Turns"
                    className="w-full bg-black/60 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-mambo-gold outline-none"
                  />
                </div>

                {/* Duration & Total XP Row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Duration (min)</label>
                    <input
                      type="number"
                      value={level.duration_minutes || 0}
                      onChange={(e) => {
                        const newLevel = { ...level, duration_minutes: parseInt(e.target.value) || 0 };
                        setCourseData(prev => prev ? {
                          ...prev,
                          levels: prev.levels.map(l => l.id === level.id ? newLevel : l)
                        } : null);
                      }}
                      className="w-full bg-black/60 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-mambo-gold outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Total XP</label>
                    <input
                      type="number"
                      value={level.total_xp || 0}
                      onChange={(e) => {
                        const newLevel = { ...level, total_xp: parseInt(e.target.value) || 0 };
                        setCourseData(prev => prev ? {
                          ...prev,
                          levels: prev.levels.map(l => l.id === level.id ? newLevel : l)
                        } : null);
                      }}
                      placeholder="Auto-calculated if 0"
                      className="w-full bg-black/60 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-mambo-gold outline-none"
                    />
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Status</label>
                  <select
                    value={level.status || 'active'}
                    onChange={(e) => {
                      const newLevel = { ...level, status: e.target.value };
                      setCourseData(prev => prev ? {
                        ...prev,
                        levels: prev.levels.map(l => l.id === level.id ? newLevel : l)
                      } : null);
                    }}
                    className="w-full bg-black/60 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-mambo-gold outline-none"
                  >
                    <option value="active">Active</option>
                    <option value="coming_soon">Coming Soon</option>
                    <option value="locked">Locked</option>
                  </select>
                </div>

                {/* Prerequisites Editor */}
                <div>
                  <label className="block text-xs text-gray-400 mb-2">Prerequisites</label>

                  {/* Current Prerequisites */}
                  <div className="space-y-2 mb-3">
                    {graphEdges
                      .filter(edge => edge.to_level_id === level.id)
                      .map(edge => {
                        const prereqLevel = graphLevels.find(l => l.id === edge.from_level_id);
                        return prereqLevel ? (
                          <div key={edge.id || edge.from_level_id} className="flex items-center justify-between bg-gray-800/50 rounded-lg px-3 py-2">
                            <span className="text-sm text-white">{prereqLevel.title}</span>
                            <button
                              onClick={async () => {
                                if (!confirm(`Remove "${prereqLevel.title}" as a prerequisite?`)) return;
                                try {
                                  const res = await fetch(
                                    `${process.env.NEXT_PUBLIC_API_URL}/api/admin/edges/${edge.id}`,
                                    {
                                      method: "DELETE",
                                      credentials: "include" as RequestCredentials,
                                    }
                                  );
                                  if (!res.ok) {
                                    const data = await res.json();
                                    throw new Error(data.detail || "Failed to delete");
                                  }
                                  // Refresh graph
                                  setGraphDataLoaded(false);
                                  await loadGraphData();
                                } catch (err: any) {
                                  alert(err.message || "Failed to remove prerequisite");
                                }
                              }}
                              className="text-red-400 hover:text-red-300 p-1 hover:bg-red-900/30 rounded transition"
                            >
                              <FaTimes className="text-xs" />
                            </button>
                          </div>
                        ) : null;
                      })}
                    {graphEdges.filter(edge => edge.to_level_id === level.id).length === 0 && (
                      <p className="text-xs text-gray-500 italic">No prerequisites (root module)</p>
                    )}
                  </div>

                  {/* Add Prerequisite Dropdown */}
                  <select
                    onChange={async (e) => {
                      const prereqId = e.target.value;
                      if (!prereqId) return;

                      try {
                        const res = await fetch(
                          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/worlds/${courseId}/edges`,
                          {
                            method: "POST",
                            credentials: "include" as RequestCredentials,
                            headers: {
                              "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                              from_level_id: prereqId,
                              to_level_id: level.id,
                            }),
                          }
                        );
                        if (!res.ok) {
                          const data = await res.json();
                          throw new Error(data.detail || "Failed to add prerequisite");
                        }
                        // Refresh graph
                        setGraphDataLoaded(false);
                        await loadGraphData();
                        // Reset dropdown
                        e.target.value = "";
                      } catch (err: any) {
                        alert(err.message || "Failed to add prerequisite");
                      }
                    }}
                    className="w-full bg-black/60 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-mambo-gold outline-none"
                  >
                    <option value="">+ Add prerequisite...</option>
                    {graphLevels
                      .filter(l =>
                        l.id !== level.id && // Can't be prerequisite of itself
                        !graphEdges.some(e => e.from_level_id === l.id && e.to_level_id === level.id) // Not already a prerequisite
                      )
                      .map(l => (
                        <option key={l.id} value={l.id}>{l.title}</option>
                      ))}
                  </select>
                </div>

                {/* Save Button */}
                <button
                  onClick={async () => {
                    try {
                      await apiClient.updateLevel(level.id, {
                        outcome: level.outcome || null,
                        duration_minutes: level.duration_minutes || 0,
                        total_xp: level.total_xp || 0,
                        status: level.status || 'active',
                      });
                      alert('Module metadata saved!');
                    } catch (err: any) {
                      alert(err.message || 'Failed to save');
                    }
                  }}
                  className="w-full bg-mambo-gold/20 hover:bg-mambo-gold/30 text-mambo-gold border border-mambo-gold/50 px-4 py-2 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2"
                >
                  <FaSave /> Save Module Details
                </button>

                {/* Stats Display */}
                <div className="pt-2 border-t border-gray-700/50 flex justify-between text-xs text-gray-500">
                  <span>{lessons.length} lessons</span>
                  <span>{level.duration_minutes || '—'} min</span>
                  <span>{level.total_xp || '—'} XP</span>
                </div>
              </div>

              {/* Level Preview Video Upload */}
              <LevelPreviewUploader
                levelId={level.id}
                currentPlaybackId={level.mux_preview_playback_id}
                currentAssetId={level.mux_preview_asset_id}
                currentThumbnailUrl={level.thumbnail_url}
                onUploadComplete={() => loadCourse()}
              />
            </div>
          </div>
        );
      })()}

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

      {/* Create Module Modal */}
      {showCreateModuleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowCreateModuleModal(false)}
          />

          {/* Modal */}
          <div className="relative bg-mambo-dark border border-gray-800 rounded-xl w-full max-w-lg m-4 p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-mambo-text">Create New Module</h2>
              <button
                onClick={() => setShowCreateModuleModal(false)}
                className="text-gray-400 hover:text-white p-2 hover:bg-gray-800 rounded transition"
              >
                <FaTimes />
              </button>
            </div>

            <div className="space-y-6">
              {/* Module Title */}
              <div>
                <label className="block text-sm font-bold text-gray-400 mb-2">
                  Module Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={newModuleTitle}
                  onChange={(e) => setNewModuleTitle(e.target.value)}
                  placeholder="e.g., Basic Timing"
                  className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-mambo-blue outline-none"
                />
              </div>

              {/* Prerequisites Selection */}
              <div>
                <label className="block text-sm font-bold text-gray-400 mb-2">
                  Prerequisites (optional)
                </label>
                <p className="text-xs text-gray-500 mb-3">
                  Select modules that must be completed before this one becomes available.
                </p>
                <div className="max-h-48 overflow-y-auto bg-black/50 border border-gray-700 rounded-lg p-2 space-y-1">
                  {graphLevels.length === 0 ? (
                    <p className="text-gray-500 text-sm p-2">No existing modules. This will be the root module.</p>
                  ) : (
                    graphLevels.map((level) => (
                      <label
                        key={level.id}
                        className="flex items-center gap-3 p-2 hover:bg-gray-800 rounded cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={newModulePrerequisites.includes(level.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewModulePrerequisites([...newModulePrerequisites, level.id]);
                            } else {
                              setNewModulePrerequisites(newModulePrerequisites.filter(id => id !== level.id));
                            }
                          }}
                          className="w-4 h-4 accent-mambo-blue"
                        />
                        <span className="text-white">{level.title}</span>
                      </label>
                    ))
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-800">
                <button
                  onClick={() => {
                    setShowCreateModuleModal(false);
                    setNewModuleTitle("");
                    setNewModulePrerequisites([]);
                  }}
                  className="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg font-bold transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateModule}
                  disabled={!newModuleTitle.trim()}
                  className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg font-bold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <FaPlus /> Create Module
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
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
