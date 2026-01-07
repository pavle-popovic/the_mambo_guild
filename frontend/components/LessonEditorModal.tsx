"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { FaTimes, FaVideo, FaPen, FaQuestionCircle, FaTrophy, FaPlus, FaTrash, FaCheck, FaClipboardList } from "react-icons/fa";
import MuxUploader from "./MuxUploader";

interface LessonEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    title: string;
    description?: string;
    video_url: string;
    xp_value: number;
    is_boss_battle: boolean;
    duration_minutes?: number | null;
    content_json?: any;
    mux_playback_id?: string | null;
    mux_asset_id?: string | null;
    thumbnail_url?: string | null;
    lesson_type?: string;
  }) => Promise<void>;
  lesson?: {
    id: string;
    title: string;
    description: string | null;
    video_url: string;
    xp_value: number;
    week_number: number | null;
    day_number: number | null;
    is_boss_battle: boolean;
    duration_minutes: number | null;
    content_json: any | null;
    mux_playback_id: string | null;
    mux_asset_id: string | null;
    thumbnail_url?: string | null;
    lesson_type?: string;
  } | null;
  onRefreshLesson?: () => Promise<void>; // Optional callback to refresh lesson data
}

interface QuizQuestion {
  id: string;
  question: string;
  options: Array<{ text: string; isCorrect: boolean }>;
}

export default function LessonEditorModal({
  isOpen,
  onClose,
  onSave,
  lesson,
  onRefreshLesson,
}: LessonEditorModalProps) {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [xpValue, setXpValue] = useState(50);
  const [isBossBattle, setIsBossBattle] = useState(false);
  const [isFreePreview, setIsFreePreview] = useState(false);
  const [durationMinutes, setDurationMinutes] = useState<string>("");
  const [lessonNotes, setLessonNotes] = useState("");
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [muxPlaybackId, setMuxPlaybackId] = useState<string | null>(null);
  const [muxAssetId, setMuxAssetId] = useState<string | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [lessonType, setLessonType] = useState<string>("video"); // "video", "quiz", or "history"
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  
  // Track the lesson ID we initialized with to avoid resetting when same lesson updates
  const initializedLessonIdRef = useRef<string | null>(null);
  const previousIsOpenRef = useRef<boolean>(false);
  const hasInitializedThisSessionRef = useRef<boolean>(false);
  
  // Auto-save debounce timer
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedDataRef = useRef<string>(""); // Track last saved state as JSON string
  const isInitializingRef = useRef<boolean>(false); // Track if we're currently initializing form

  // Initialize upload status when lesson changes
  useEffect(() => {
    if (lesson?.mux_playback_id) {
      // Video exists - set status to "live" in MuxUploader
      // This is handled by MuxUploader's useEffect watching currentPlaybackId
    }
  }, [lesson?.mux_playback_id]);

  // Only initialize form when modal FIRST opens or when switching to a different lesson
  // NEVER reset when the same lesson updates after save (to preserve user's unsaved edits)
  useEffect(() => {
    const wasOpen = previousIsOpenRef.current;
    
    // Check if modal just opened (transition from closed to open)
    const modalJustOpened = isOpen && !wasOpen;
    
    // Check if modal just closed
    const modalJustClosed = !isOpen && wasOpen;
    
    // Update previous open state
    previousIsOpenRef.current = isOpen;
    
    if (modalJustClosed) {
      // Modal just closed - reset all refs for next time
      initializedLessonIdRef.current = null;
      hasInitializedThisSessionRef.current = false;
      return;
    }
    
    if (!isOpen) {
      // Modal is closed - do nothing
      return;
    }
    
    // Modal is open
    const currentLessonId = lesson?.id || "new";
    const previousLessonId = initializedLessonIdRef.current;
    
    // Only initialize if:
    // 1. Modal just opened (first time in this session) - always initialize
    // 2. Modal is open AND lesson ID actually changed (switching to different lesson)
    // NEVER initialize if modal is already open and lesson ID is the same (preserves user edits)
    const shouldInitialize = (modalJustOpened && !hasInitializedThisSessionRef.current) || 
      (previousLessonId !== null && previousLessonId !== currentLessonId);
    
    if (shouldInitialize) {
      if (lesson) {
        setTitle(lesson.title);
        setSlug(lesson.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"));
        setDescription(lesson.description || "");
        setVideoUrl(lesson.video_url || "");
        setXpValue(lesson.xp_value);
        setIsBossBattle(lesson.is_boss_battle);
        setDurationMinutes(lesson.duration_minutes?.toString() || "");
        setMuxPlaybackId(lesson.mux_playback_id);
        setMuxAssetId(lesson.mux_asset_id);
        setThumbnailUrl((lesson as any).thumbnail_url || null);
        setLessonType(lesson.lesson_type || "video"); // Initialize lesson type
        
        // Parse content_json for lesson notes and quiz
        if (lesson.content_json) {
          if (lesson.content_json.notes) {
            setLessonNotes(lesson.content_json.notes);
          } else {
            setLessonNotes("");
          }
          if (lesson.content_json.quiz && Array.isArray(lesson.content_json.quiz)) {
            setQuizQuestions(lesson.content_json.quiz);
          } else {
            setQuizQuestions([]);
          }
        } else {
          setLessonNotes("");
          setQuizQuestions([]);
        }
        
        // Mark as initializing to prevent auto-save during initialization
        isInitializingRef.current = true;
        
        // Initialize last saved data ref for auto-save comparison
        // Use a timeout to ensure all state is set first
        setTimeout(() => {
          const initialData = buildLessonData();
          lastSavedDataRef.current = JSON.stringify(initialData);
          // Wait a bit longer before allowing auto-save to ensure form is fully initialized
          setTimeout(() => {
            isInitializingRef.current = false;
          }, 500);
        }, 300);
      } else {
        // Reset form for new lesson
        setTitle("");
        setSlug("");
        setDescription("");
        setVideoUrl("");
        setXpValue(50);
        setIsBossBattle(false);
        setIsFreePreview(false);
        setDurationMinutes("");
        setLessonNotes("");
        setQuizQuestions([]);
        setMuxPlaybackId(null);
        setMuxAssetId(null);
        setLessonType("video"); // Default to video for new lessons
      }
      initializedLessonIdRef.current = currentLessonId;
      hasInitializedThisSessionRef.current = true;
      setError("");
    }
    
    // IMPORTANT: Never reset form when modal is already open and lesson prop updates
    // This preserves user's edits even when parent updates lesson after save
    // We only depend on isOpen, so lesson prop changes won't trigger this effect
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]); // Only depend on isOpen - lesson prop changes won't trigger reset

  // Auto-generate slug from title
  useEffect(() => {
    if (title && !lesson) {
      const autoSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setSlug(autoSlug);
    }
  }, [title, lesson]);

  // Auto-save effect - triggers when any form field changes
  useEffect(() => {
    // Only auto-save for existing lessons, not during initialization
    if (!lesson?.id || isInitializingRef.current) {
      return;
    }
    
    triggerAutoSave();
    
    // Cleanup timer on unmount or when dependencies change
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, description, videoUrl, xpValue, isBossBattle, durationMinutes, lessonNotes, quizQuestions, lesson?.id]);

  const addQuizQuestion = () => {
    setQuizQuestions([
      ...quizQuestions,
      {
        id: `q-${Date.now()}`,
        question: "",
        options: [
          { text: "", isCorrect: false },
          { text: "", isCorrect: false },
        ],
      },
    ]);
  };

  const updateQuizQuestion = (questionId: string, field: "question" | "options", value: any) => {
    setQuizQuestions(
      quizQuestions.map((q) =>
        q.id === questionId ? { ...q, [field]: value } : q
      )
    );
  };

  const deleteQuizQuestion = (questionId: string) => {
    setQuizQuestions(quizQuestions.filter((q) => q.id !== questionId));
  };

  const addQuizOption = (questionId: string) => {
    setQuizQuestions(
      quizQuestions.map((q) =>
        q.id === questionId
          ? { ...q, options: [...q.options, { text: "", isCorrect: false }] }
          : q
      )
    );
  };

  const removeQuizOption = (questionId: string, optionIndex: number) => {
    setQuizQuestions(
      quizQuestions.map((q) =>
        q.id === questionId
          ? { ...q, options: q.options.filter((_, i) => i !== optionIndex) }
          : q
      )
    );
  };

  // Build lesson data object (used by both auto-save and manual save)
  const buildLessonData = () => {
    // Build content_json based on lesson type
    const contentJson: any = {};
    
    // Video lessons: can have notes
    // History lessons: only notes
    // Quiz lessons: only quiz
    if (lessonType === "video" || lessonType === "history") {
      if (lessonNotes.trim()) {
        contentJson.notes = lessonNotes.trim();
      }
    }
    
    if (lessonType === "quiz" || lessonType === "video") {
      if (quizQuestions.length > 0) {
        contentJson.quiz = quizQuestions;
      }
    }

    // Only set placeholder URL if we truly have no video
    // Don't set placeholder if muxPlaybackId exists (will be set when webhook processes)
    // Video lessons can have video, quiz and history cannot
    let finalVideoUrl = videoUrl.trim();
    if (lessonType === "quiz" || lessonType === "history") {
      finalVideoUrl = ""; // No video for quiz or history lessons
    } else if (!finalVideoUrl && !muxPlaybackId) {
      finalVideoUrl = ""; // Empty string instead of placeholder to avoid network errors
    } else if (muxPlaybackId && !finalVideoUrl) {
      finalVideoUrl = ""; // Let mux_playback_id handle video display
    }

    return {
      title: title.trim(),
      description: description.trim() || undefined,
      video_url: finalVideoUrl,
      xp_value: xpValue,
      is_boss_battle: isBossBattle,
      duration_minutes: durationMinutes ? parseInt(durationMinutes) : null,
      content_json: Object.keys(contentJson).length > 0 ? contentJson : undefined,
      thumbnail_url: thumbnailUrl || null,
      lesson_type: lessonType,
      // DO NOT send mux_playback_id or mux_asset_id - webhook manages these
      delete_video: false, // Only set to true when explicitly deleting
    };
  };

  // Auto-save function (debounced) - optimized to prevent refresh loops
  const triggerAutoSave = () => {
    // Don't auto-save during initialization
    if (isInitializingRef.current) {
      return;
    }
    
    // Only auto-save if editing an existing lesson
    if (!lesson?.id || !title.trim()) {
      return;
    }

    // Clear existing timer
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    // Set new timer to save after 2 seconds of no changes (increased for better performance)
    autoSaveTimerRef.current = setTimeout(async () => {
      // Double-check we're not initializing or saving
      if (isInitializingRef.current || isSaving) {
        return;
      }
      
      const currentData = JSON.stringify(buildLessonData());
      
      // Only save if data has actually changed
      if (currentData === lastSavedDataRef.current) {
        return;
      }

      setError("");
      setIsSaving(true);

      try {
        const lessonData = buildLessonData();
        await onSave(lessonData);
        
        // Update last saved data
        lastSavedDataRef.current = currentData;
        
        // DO NOT call onRefreshLesson here - it causes refresh loops
        // The lesson page will get updates on next manual refresh or navigation
        // Auto-save should be silent and non-disruptive
        
      } catch (err: any) {
        setError(err.message || "Failed to auto-save lesson");
        console.error("Auto-save error:", err);
      } finally {
        setIsSaving(false);
      }
    }, 2000); // Wait 2 seconds after last change for better performance
  };

  // Auto-save effect - triggers when any form field changes
  // Use useMemo to memoize quiz questions string to avoid recreating on every render
  const quizQuestionsString = useMemo(() => JSON.stringify(quizQuestions), [quizQuestions]);
  
  useEffect(() => {
    // Only auto-save for existing lessons, not during initialization or while saving
    if (!lesson?.id || isInitializingRef.current || isSaving) {
      return;
    }
    
    // Check if data actually changed before triggering save
    const currentData = JSON.stringify(buildLessonData());
    if (currentData === lastSavedDataRef.current) {
      return; // No changes, skip auto-save
    }
    
    triggerAutoSave();
    
    // Cleanup timer on unmount or when dependencies change
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
        autoSaveTimerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, description, videoUrl, xpValue, isBossBattle, durationMinutes, lessonNotes, quizQuestionsString, lessonType, lesson?.id]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    if (!title.trim()) {
      setError("Lesson title is required");
      return;
    }

    // Clear any pending auto-save
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = null;
    }

    setError("");
    setIsSaving(true);

    try {
      const lessonData = buildLessonData();
      await onSave(lessonData);
      
      // Update last saved data
      lastSavedDataRef.current = JSON.stringify(lessonData);
      
      // Don't close the modal - let the user continue editing
      // onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save lesson");
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (!isSaving) {
      setError("");
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-mambo-dark w-full max-w-7xl max-h-[95vh] overflow-y-auto m-4 rounded-xl border border-gray-800 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800 flex-shrink-0">
          <div>
            <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">
              {lesson ? "Edit Lesson" : "Create New Lesson"}
            </div>
            <h2 className="text-2xl font-bold text-mambo-text">
              {lesson ? lesson.title : "New Lesson"}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            {lesson?.id && (
              <button
                type="button"
                onClick={() => {
                  // Open lesson preview in new tab
                  window.open(`/lesson/${lesson.id}`, '_blank');
                }}
                disabled={isSaving}
                className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg font-bold text-sm text-mambo-text-light border border-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Preview
              </button>
            )}
            {/* Only show "Create Lesson" button for new lessons - existing lessons auto-save */}
            {!lesson?.id && (
              <button
                onClick={handleSubmit}
                disabled={isSaving || !title.trim()}
                className="bg-mambo-blue hover:bg-blue-600 px-6 py-2 rounded-lg font-bold text-sm text-white shadow-lg shadow-blue-900/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? "Creating..." : "Create Lesson"}
              </button>
            )}
            {/* Show saving indicator for auto-save */}
            {lesson?.id && isSaving && (
              <div className="text-sm text-gray-400 flex items-center gap-2">
                <span className="animate-spin">⏳</span>
                <span>Saving...</span>
              </div>
            )}
            <button
              onClick={handleClose}
              disabled={isSaving}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaTimes />
            </button>
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto p-6 md:p-10">
            {error && (
              <div className="mb-6 bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Lesson Type Selector */}
                <div className="bg-mambo-panel border border-gray-800 rounded-xl p-6">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-3">
                    Lesson Type <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={lessonType}
                    onChange={(e) => setLessonType(e.target.value)}
                    disabled={isSaving}
                    className="w-full bg-black border border-gray-700 rounded-lg p-3 text-mambo-text-light focus:border-mambo-blue outline-none disabled:opacity-50"
                  >
                    <option value="video">Video Lesson (Video + Notes)</option>
                    <option value="quiz">Quiz (Quiz Only)</option>
                    <option value="history">History Lesson (Notes Only)</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-2">
                    {lessonType === "video" && "Video lessons include a video player and lesson notes."}
                    {lessonType === "quiz" && "Quiz lessons contain only quiz questions, no video or notes."}
                    {lessonType === "history" && "History lessons contain only lesson notes, no video."}
                  </p>
                </div>

                {/* Video Content - Only for video lessons */}
                {lessonType === "video" && (
                <div className="bg-mambo-panel border border-gray-800 rounded-xl p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg text-mambo-text">
                      <FaVideo className="inline text-mambo-blue mr-2" />
                      Video Content
                    </h3>
                    <span className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded">Powered by MUX</span>
                  </div>
                  
                  {lesson?.id && (
                    <div className="mb-4">
                      <MuxUploader
                        key={lesson.id} // Force re-render when lesson changes
                        lessonId={lesson.id}
                        currentPlaybackId={muxPlaybackId || undefined}
                        onUploadComplete={(playbackId, assetId) => {
                          // Update the state with new video info, but don't reset other fields
                          setMuxPlaybackId(playbackId);
                          setMuxAssetId(assetId);
                          // Note: The webhook will also update the lesson, but we keep our form state
                        }}
                        onRefreshLesson={async () => {
                          // Refresh lesson data from parent
                          if (onRefreshLesson) {
                            await onRefreshLesson();
                            // After refresh, update local state with latest lesson data
                            // But only if it's the same lesson (preserve user edits)
                            if (lesson?.id) {
                              try {
                                const { apiClient } = await import("@/lib/api");
                                const updatedLesson = await apiClient.getLesson(lesson.id);
                                // Always sync with latest data from DB
                                setMuxPlaybackId(updatedLesson.mux_playback_id || null);
                                setMuxAssetId(updatedLesson.mux_asset_id || null);
                              } catch (error) {
                                console.error("Error refreshing lesson data:", error);
                              }
                            }
                          }
                        }}
                        onDeleteVideo={async () => {
                          // Delete video by clearing Mux fields from DB
                          // Note: Mux deletion happens in MuxUploader component before this is called
                          if (!lesson?.id) return;
                          
                          try {
                            const { apiClient } = await import("@/lib/api");
                            // Update lesson to clear Mux fields using delete_video flag
                            await apiClient.updateLesson(lesson.id, {
                              delete_video: true, // Explicit flag to delete video
                              video_url: "", // Also clear fallback video URL
                            });
                            
                            // Clear local state
                            setMuxPlaybackId(null);
                            setMuxAssetId(null);
                            setVideoUrl("");
                            
                            // Refresh lesson data
                            if (onRefreshLesson) {
                              await onRefreshLesson();
                            }
                          } catch (error: any) {
                            console.error("Error deleting video from DB:", error);
                            throw error;
                          }
                        }}
                      />
                    </div>
                  )}

                  {!lesson?.id || !lesson.id.trim() ? (
                    <div className="border-2 border-dashed border-gray-700 rounded-xl p-10 flex flex-col items-center justify-center text-center bg-black/20 hover:bg-black/40 hover:border-mambo-blue transition cursor-pointer group">
                      <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition">
                        <FaVideo className="text-2xl text-mambo-blue" />
                      </div>
                      <h4 className="font-bold text-mambo-text">Video will be available after saving</h4>
                      <p className="text-sm text-gray-500 mt-1">Save the lesson first, then upload video</p>
                    </div>
                  ) : null}

                </div>
                )}

                {/* Lesson Notes - For video and history lessons */}
                {(lessonType === "video" || lessonType === "history") && (
                <div className="bg-mambo-panel border border-gray-800 rounded-xl p-6">
                  <h3 className="font-bold text-lg mb-4 text-mambo-text">
                    <FaPen className="inline text-mambo-blue mr-2" />
                    Lesson Notes
                  </h3>
                  
                  <div className="flex gap-2 mb-3 border-b border-gray-800 pb-3 overflow-x-auto">
                    <button type="button" className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded"><strong>B</strong></button>
                    <button type="button" className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded"><em>I</em></button>
                    <button type="button" className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded">H</button>
                    <div className="w-px bg-gray-700 h-6 mx-1 self-center"></div>
                    <button type="button" className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded">•</button>
                    <button type="button" className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded">🔗</button>
                    <button type="button" className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded">🖼️</button>
                  </div>

                  <textarea
                    value={lessonNotes}
                    onChange={(e) => setLessonNotes(e.target.value)}
                    placeholder="Write your lesson content here using Markdown..."
                    rows={12}
                    disabled={isSaving}
                    className="w-full h-64 bg-black/50 border border-gray-700 rounded-lg p-4 text-mambo-text-light focus:border-mambo-blue outline-none leading-relaxed resize-none disabled:opacity-50"
                  />
                  <p className="text-xs text-gray-500 mt-2">Supports Markdown formatting</p>
                </div>
                )}

                {/* Quiz Section - For video and quiz lessons */}
                {(lessonType === "video" || lessonType === "quiz") && (
                <div className="bg-mambo-panel border border-gray-800 rounded-xl p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-lg text-mambo-text">
                      <FaClipboardList className="inline text-mambo-blue mr-2" />
                      {lessonType === "quiz" ? "Quiz Questions" : "Knowledge Check"}
                    </h3>
                    <button
                      type="button"
                      onClick={addQuizQuestion}
                      disabled={isSaving}
                      className="text-xs bg-mambo-blue/10 text-mambo-blue border border-mambo-blue/30 px-3 py-1.5 rounded-lg hover:bg-mambo-blue hover:text-white transition font-bold disabled:opacity-50"
                    >
                      <FaPlus className="inline mr-1" />
                      Add Question
                    </button>
                  </div>

                  {quizQuestions.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-8">
                      {lessonType === "quiz" 
                        ? "No questions yet. Click 'Add Question' to create your quiz." 
                        : "No questions yet. Click 'Add Question' to create a knowledge check."}
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {quizQuestions.map((question, qIndex) => (
                        <div key={question.id} className="bg-black/40 border border-gray-700 rounded-lg p-4">
                          <div className="flex justify-between mb-3">
                            <span className="text-xs font-bold text-gray-500 uppercase">Question {qIndex + 1}</span>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => deleteQuizQuestion(question.id)}
                                disabled={isSaving}
                                className="text-gray-500 hover:text-red-500 disabled:opacity-50"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </div>
                          <input
                            type="text"
                            value={question.question}
                            onChange={(e) => updateQuizQuestion(question.id, "question", e.target.value)}
                            placeholder="Enter your question..."
                            disabled={isSaving}
                            className="w-full bg-transparent border-b border-gray-700 pb-2 text-white font-bold mb-4 focus:border-mambo-blue outline-none disabled:opacity-50"
                          />
                          
                          <div className="space-y-2">
                            {question.options.map((option, oIndex) => (
                              <div key={oIndex} className="flex items-center gap-3">
                                <input
                                  type="radio"
                                  name={`q-${question.id}`}
                                  checked={option.isCorrect}
                                  onChange={() => {
                                    const newOptions = question.options.map((opt, idx) => ({
                                      ...opt,
                                      isCorrect: idx === oIndex,
                                    }));
                                    updateQuizQuestion(question.id, "options", newOptions);
                                  }}
                                  disabled={isSaving}
                                  className="accent-gray-500 disabled:opacity-50"
                                />
                                <input
                                  type="text"
                                  value={option.text}
                                  onChange={(e) => {
                                    const newOptions = [...question.options];
                                    newOptions[oIndex] = { ...option, text: e.target.value };
                                    updateQuizQuestion(question.id, "options", newOptions);
                                  }}
                                  placeholder={`Option ${oIndex + 1}`}
                                  disabled={isSaving}
                                  className={`bg-transparent text-sm border-none w-full focus:ring-0 flex-1 ${
                                    option.isCorrect ? "text-green-400 font-bold" : "text-gray-400"
                                  } disabled:opacity-50`}
                                />
                                {option.isCorrect && (
                                  <FaCheck className="text-green-500 text-xs" />
                                )}
                                {question.options.length > 2 && (
                                  <button
                                    type="button"
                                    onClick={() => removeQuizOption(question.id, oIndex)}
                                    disabled={isSaving}
                                    className="text-gray-500 hover:text-red-500 text-xs disabled:opacity-50"
                                  >
                                    <FaTimes />
                                  </button>
                                )}
                              </div>
                            ))}
                            {question.options.length < 4 && (
                              <button
                                type="button"
                                onClick={() => addQuizOption(question.id)}
                                disabled={isSaving}
                                className="text-xs text-mambo-blue hover:text-blue-400 disabled:opacity-50"
                              >
                                <FaPlus className="inline mr-1" />
                                Add Option
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Settings */}
                <div className="bg-mambo-panel border border-gray-800 rounded-xl p-6">
                  <h3 className="font-bold text-lg mb-4 text-mambo-text">Settings</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                        Lesson Title <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g., The Basic Step"
                        required
                        disabled={isSaving}
                        className="w-full bg-black border border-gray-700 rounded-lg p-3 text-mambo-text-light focus:border-mambo-blue outline-none disabled:opacity-50"
                      />
                      <p className="text-xs text-gray-500 mt-1">Only required field - lesson can be video, markdown, or quiz</p>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Lesson Slug</label>
                      <input
                        type="text"
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        placeholder="basic-step-on2"
                        disabled={isSaving}
                        className="w-full bg-black border border-gray-700 rounded-lg p-3 text-gray-400 focus:border-mambo-blue outline-none text-sm font-mono disabled:opacity-50"
                      />
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-sm font-bold text-gray-300">Is Free Preview?</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isFreePreview}
                          onChange={(e) => setIsFreePreview(e.target.checked)}
                          disabled={isSaving}
                          className="sr-only peer disabled:opacity-50"
                        />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Gamification */}
                <div className="bg-mambo-panel border border-gray-800 rounded-xl p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-mambo-blue/20 to-transparent rounded-bl-full"></div>
                  <h3 className="font-bold text-lg mb-4 text-mambo-text flex items-center gap-2">
                    <FaTrophy className="text-yellow-500" />
                    Gamification
                  </h3>

                  <div className="space-y-5">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-2">XP Reward</label>
                      <div className="relative">
                        <input
                          type="number"
                          value={xpValue}
                          onChange={(e) => setXpValue(parseInt(e.target.value) || 0)}
                          min="0"
                          disabled={isSaving}
                          className="w-full bg-black border border-gray-700 rounded-lg p-3 pl-10 text-mambo-text-light focus:border-mambo-blue outline-none font-bold text-lg disabled:opacity-50"
                        />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-yellow-500 font-bold">XP</span>
                      </div>
                    </div>

                    <div className="border-t border-gray-800 pt-4">
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-3">Completion Criteria</label>
                      
                      <div className="space-y-3">
                        {/* Video completion - only for video lessons */}
                        {lessonType === "video" && (
                          <label className="flex items-start gap-3 cursor-pointer group">
                            <input
                              type="checkbox"
                              checked={true}
                              disabled={true}
                              className="mt-1 w-4 h-4 rounded border-gray-600 text-mambo-blue focus:ring-mambo-blue bg-gray-700"
                            />
                            <div className="text-sm">
                              <span className="block text-gray-200 font-medium group-hover:text-white">Watch 90% of Video</span>
                              <span className="block text-xs text-gray-500">Automated via MUX webhooks</span>
                            </div>
                          </label>
                        )}

                        {/* Quiz completion - for video and quiz lessons */}
                        {(lessonType === "video" || lessonType === "quiz") && (
                          <label className="flex items-start gap-3 cursor-pointer group">
                            <input
                              type="checkbox"
                              checked={quizQuestions.length > 0}
                              disabled={true}
                              className="mt-1 w-4 h-4 rounded border-gray-600 text-mambo-blue focus:ring-mambo-blue bg-gray-700"
                            />
                            <div className="text-sm">
                              <span className="block text-gray-200 font-medium group-hover:text-white">
                                {lessonType === "quiz" ? "Pass Quiz" : "Pass Knowledge Check"}
                              </span>
                              <span className="block text-xs text-gray-500">Must get 80% correct</span>
                            </div>
                          </label>
                        )}

                        {/* History lessons - no completion criteria */}
                        {lessonType === "history" && (
                          <label className="flex items-start gap-3 cursor-pointer group">
                            <input
                              type="checkbox"
                              checked={true}
                              disabled={true}
                              className="mt-1 w-4 h-4 rounded border-gray-600 text-mambo-blue focus:ring-mambo-blue bg-gray-700"
                            />
                            <div className="text-sm">
                              <span className="block text-gray-200 font-medium group-hover:text-white">Read Lesson Notes</span>
                              <span className="block text-xs text-gray-500">Complete by reading through the content</span>
                            </div>
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Boss Battle - Only for video lessons */}
                {lessonType === "video" && (
                <div className="bg-mambo-panel border border-gray-800 rounded-xl p-6">
                  <label className="flex items-center justify-between cursor-pointer group">
                    <div>
                      <span className="block text-sm font-bold text-gray-300 mb-1">Boss Battle</span>
                      <span className="block text-xs text-gray-500">Requires video submission</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={isBossBattle}
                      onChange={(e) => setIsBossBattle(e.target.checked)}
                      disabled={isSaving}
                      className="w-11 h-6 bg-gray-700 rounded-full appearance-none cursor-pointer checked:bg-red-600 disabled:opacity-50 relative transition-colors before:absolute before:top-0.5 before:left-0.5 before:w-5 before:h-5 before:bg-white before:rounded-full before:transition-transform checked:before:translate-x-5"
                    />
                  </label>
                </div>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
