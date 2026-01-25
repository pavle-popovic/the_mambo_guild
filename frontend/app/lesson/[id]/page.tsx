"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api";
import QuestLogSidebar from "@/components/QuestLogSidebar";
import MuxVideoPlayer, { type MuxVideoPlayerHandle } from "@/components/MuxVideoPlayer";
import ProVideoControls from "@/components/ProVideoControls";
import SuccessNotification from "@/components/SuccessNotification";
import AuthPromptModal from "@/components/AuthPromptModal";
import QuizResultModal from "@/components/QuizResultModal";
import CourseCompletionModal from "@/components/CourseCompletionModal";
import PracticeModeOverlay from "@/components/PracticeModeOverlay";
import { useDrillViewCount } from "@/hooks/useDrillViewCount";
import { FaCheck, FaPlay, FaLock, FaBolt, FaArrowRight, FaClipboardList, FaCheckCircle } from "react-icons/fa";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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
  duration_minutes: number | null;
  lesson_type?: string;  // "video", "quiz", or "history"
}

interface WorldLesson {
  id: string;
  title: string;
  xp_value: number;
  is_completed: boolean;
  is_locked: boolean;
  is_boss_battle: boolean;
  order_index: number;
  week_number?: number | null;
  day_number?: number | null;
  duration_minutes?: number | null;
}

interface QuizQuestion {
  id?: string;
  question: string;
  options: Array<{ text: string; isCorrect: boolean }>;
}

export default function LessonPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading, refreshUser } = useAuth();
  const lessonId = params.id as string;

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [levelLessons, setLevelLessons] = useState<WorldLesson[]>([]);
  const [levelTitle, setLevelTitle] = useState("Loading...");
  const [levelId, setLevelId] = useState<string | null>(null);
  const [worldId, setWorldId] = useState<string | null>(null);
  const [levelProgress, setLevelProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("description");
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<{ [questionId: string]: number }>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizPassed, setQuizPassed] = useState(false);
  const [showQuizResult, setShowQuizResult] = useState(false);
  const [quizIsCorrect, setQuizIsCorrect] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successData, setSuccessData] = useState<{
    xpGained: number;
    leveledUp: boolean;
    newLevel?: number;
  } | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);
  const [showCourseCompletion, setShowCourseCompletion] = useState(false);
  const [courseTitle, setCourseTitle] = useState("");
  const navigateToNextLessonRef = useRef<(() => void) | null>(null);
  const [dismissedPracticeMode, setDismissedPracticeMode] = useState(false);
  const videoPlayerRef = useRef<MuxVideoPlayerHandle>(null);
  const [videoDuration, setVideoDuration] = useState(0);

  // Drill view tracking for cost efficiency (shows download prompt after 3 views)
  const { viewCount, showPracticeMode, incrementView, markDownloaded, dismissForSession } =
    useDrillViewCount(lessonId);

  useEffect(() => {
    // Reset practice mode dismissal on lesson change
    setDismissedPracticeMode(false);

    // Wait for auth to finish loading before making any decisions
    if (authLoading) {
      return;
    }

    // After auth has loaded, check if user exists
    // If no user exists at this point, show login modal
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    // User exists, load the lesson
    loadLesson();
  }, [lessonId, user, authLoading, router]);

  const loadLesson = async () => {
    try {
      setLoading(true);

      // Fetch lesson data which now includes level_id and level_title
      const lessonData = await apiClient.getLesson(lessonId);

      setLesson({
        ...lessonData,
        duration_minutes: (lessonData as any).duration_minutes ?? null,
      });

      // If we have a level_id, fetch only lessons for this level
      if (lessonData.level_id) {
        setLevelId(lessonData.level_id);
        setLevelTitle(lessonData.level_title || "Module");

        // Fetch lessons for this specific level (not all world lessons)
        const levelLessonsData = await apiClient.getLevelLessons(lessonData.level_id);

        // Apply optimistic updates from sessionStorage
        const updatedLessons = levelLessonsData.map(l => {
          const isCompletedInStorage = sessionStorage.getItem(`lesson_completed_${l.id}`) === 'true';
          return isCompletedInStorage ? { ...l, is_completed: true } : l;
        });

        setLevelLessons(updatedLessons);

        // Calculate progress for this level only
        const totalLessons = updatedLessons.length;
        if (totalLessons > 0) {
          const completed = updatedLessons.filter((l) => l.is_completed).length;
          const progress = Math.min(100, Math.max(0, (completed / totalLessons) * 100));
          setLevelProgress(progress);
        } else {
          setLevelProgress(0);
        }

        // Check if the lesson is locked (subscription required)
        const currentLesson = updatedLessons.find((l) => l.id === lessonId);
        if (currentLesson?.is_locked && user) {
          setShowSubscribeModal(true);
          setLoading(false);
          return;
        }

        // Get course title from worlds (for course completion modal)
        const worldsData = await apiClient.getWorlds();
        for (const world of worldsData) {
          const levelLessons = await apiClient.getWorldLessons(world.id);
          if (levelLessons.find(l => l.id === lessonId)) {
            setWorldId(world.id);
            setCourseTitle(world.title);
            break;
          }
        }
      } else {
        // Fallback to old behavior if no level_id (for backwards compatibility)
        const worldsData = await apiClient.getWorlds();
        const lessonPromises = worldsData.map(world =>
          apiClient.getWorldLessons(world.id)
        );
        const allLessonsArrays = await Promise.all(lessonPromises);

        for (let i = 0; i < allLessonsArrays.length; i++) {
          const foundLesson = allLessonsArrays[i].find((l) => l.id === lessonId);
          if (foundLesson) {
            setLevelTitle(worldsData[i].title);
            setWorldId(worldsData[i].id);
            setCourseTitle(worldsData[i].title);

            const updatedLessons = allLessonsArrays[i].map(l => {
              const isCompletedInStorage = sessionStorage.getItem(`lesson_completed_${l.id}`) === 'true';
              return isCompletedInStorage ? { ...l, is_completed: true } : l;
            });

            setLevelLessons(updatedLessons);
            const totalLessons = updatedLessons.length;
            if (totalLessons > 0) {
              const completed = updatedLessons.filter((l) => l.is_completed).length;
              setLevelProgress((completed / totalLessons) * 100);
            }

            if (foundLesson.is_locked && user) {
              setShowSubscribeModal(true);
              setLoading(false);
              return;
            }
            break;
          }
        }
      }
    } catch (err: any) {
      // Don't set error if it's about lesson already completed - allow viewing completed lessons
      if (!err.message || !err.message.includes("already completed")) {
        setError(err.message || "Failed to load lesson");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!lesson) return;

    // Check if lesson is already completed
    const alreadyCompleted = currentLesson?.is_completed || false;

    setCompleting(true);
    try {
      const result = await apiClient.completeLesson(lessonId);
      await refreshUser();

      // Optimistically update the quest bar immediately
      const updatedLessons = levelLessons.map(l =>
        l.id === lessonId ? { ...l, is_completed: true } : l
      );

      // Check if course is fully completed (all lessons done)
      const totalLessons = updatedLessons.length;
      const completedLessons = updatedLessons.filter((l) => l.is_completed).length;
      const isCourseComplete = totalLessons > 0 && completedLessons === totalLessons;

      // Update progress - fix division by zero
      if (totalLessons > 0) {
        const progress = Math.min(100, Math.max(0, (completedLessons / totalLessons) * 100));
        setLevelProgress(progress);
      } else {
        setLevelProgress(0);
      }

      setLevelLessons(updatedLessons);

      // Store completion status in sessionStorage
      if (lessonId) {
        sessionStorage.setItem(`lesson_completed_${lessonId}`, 'true');
      }

      // Reload lesson data in background to sync with server
      loadLesson().catch(console.error);

      // Find next lesson within the SAME module (not using next_lesson_id which may point to different module)
      const sortedLevelLessons = [...updatedLessons].sort((a, b) => a.order_index - b.order_index);
      const currentIndex = sortedLevelLessons.findIndex(l => l.id === lessonId);
      const nextLessonInModule = currentIndex >= 0 && currentIndex < sortedLevelLessons.length - 1
        ? sortedLevelLessons[currentIndex + 1]
        : null;
      const nextLessonId = nextLessonInModule?.id || null;

      // If already completed, just navigate to next lesson without showing XP/completion animation
      if (alreadyCompleted) {
        // Use requestAnimationFrame to ensure DOM update is visible before navigation
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            if (nextLessonId) {
              router.push(`/lesson/${nextLessonId}`);
            }
          });
        });
        setCompleting(false);
        return;
      }

      // If module is complete (all lessons in this level done), navigate to skill tree
      // The skill tree will automatically center on the next frontier node
      if (isCourseComplete) {
        setCompleting(false);
        // Show a brief success message before navigating?
        setSuccessData({
          xpGained: result.xp_gained,
          leveledUp: result.leveled_up || false,
          newLevel: result.new_level,
        });

        // Navigate to skill tree immediately
        if (worldId) {
          router.push(`/courses/${worldId}`);
        } else {
          router.push("/courses");
        }
        return;
      }

      // Show success notification only if lesson was not already completed
      setSuccessData({
        xpGained: result.xp_gained,
        leveledUp: result.leveled_up || false,
        newLevel: result.new_level,
      });
      setShowSuccess(true);

      // Create navigation handler that updates quest bar and navigates
      const handleNavigate = () => {
        setShowSuccess(false);
        setSuccessData(null);

        // Navigate immediately (no delay)
        // Store scroll trigger for next page load
        if (nextLessonId) {
          sessionStorage.setItem('questbar_scroll_trigger', nextLessonId);
          router.push(`/lesson/${nextLessonId}`);
        }
      };

      // Store navigation handler for SuccessNotification
      navigateToNextLessonRef.current = handleNavigate;

      // Auto-navigate after notification timeout (but Continue button will navigate instantly)
      if (result.leveled_up || nextLessonId) {
        setTimeout(() => {
          if (nextLessonId) {
            handleNavigate();
          }
        }, 2300); // 2000ms notification + 300ms fade-out
      }
    } catch (err: any) {
      // If error is "already completed", just navigate to next lesson silently
      if (err?.message && (err.message.includes("already completed") || err.message.includes("Lesson already completed"))) {
        // Optimistically update quest bar even on error
        const updatedLessonsOnError = levelLessons.map(l =>
          l.id === lessonId ? { ...l, is_completed: true } : l
        );
        const completedOnError = updatedLessonsOnError.filter((l) => l.is_completed).length;
        setLevelProgress((completedOnError / updatedLessonsOnError.length) * 100);
        setLevelLessons(updatedLessonsOnError);

        // Find next lesson within the same module
        const sortedLessonsOnError = [...updatedLessonsOnError].sort((a, b) => a.order_index - b.order_index);
        const currentIdxOnError = sortedLessonsOnError.findIndex(l => l.id === lessonId);
        const nextLessonOnError = currentIdxOnError >= 0 && currentIdxOnError < sortedLessonsOnError.length - 1
          ? sortedLessonsOnError[currentIdxOnError + 1]
          : null;

        if (nextLessonOnError) {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              router.push(`/lesson/${nextLessonOnError.id}`);
            });
          });
        } else {
          // If no next lesson in module, just reload to show completed state
          await loadLesson();
        }
        setCompleting(false);
        return;
      }
      alert(err?.message || "Failed to complete lesson");
    } finally {
      setCompleting(false);
    }
  };

  const handleQuizAnswer = (questionId: string, optionIndex: number) => {
    if (quizSubmitted) return;
    setQuizAnswers({ ...quizAnswers, [questionId]: optionIndex });
  };

  const handleQuizSubmit = () => {
    setQuizSubmitted(true);
    // Calculate score
    const quiz = lesson?.content_json?.quiz || [];
    let correct = 0;
    quiz.forEach((q: QuizQuestion, qIndex: number) => {
      const questionId = q.id || `q-${qIndex}`;
      const selectedIndex = quizAnswers[questionId];
      if (selectedIndex !== undefined && q.options[selectedIndex]?.isCorrect) {
        correct++;
      }
    });
    const percentage = (correct / quiz.length) * 100;
    const passed = percentage >= 80;

    setQuizIsCorrect(passed);
    setShowQuizResult(true);

    if (passed) {
      setQuizPassed(true);
    }
  };

  const handleTryAgain = () => {
    setQuizSubmitted(false);
    setQuizAnswers({});
    setShowQuizResult(false);
    setQuizPassed(false);
  };

  const handleQuizContinue = async () => {
    setShowQuizResult(false);
    // Auto-complete the lesson
    if (!lesson) return;

    // Check if lesson is already completed
    const alreadyCompleted = currentLesson?.is_completed || false;

    setCompleting(true);
    try {
      const result = await apiClient.completeLesson(lesson.id);
      await refreshUser();

      // Optimistically update the quest bar immediately
      const updatedLessons = levelLessons.map(l =>
        l.id === lessonId ? { ...l, is_completed: true } : l
      );

      // Check if course is fully completed (all lessons done)
      const totalLessons = updatedLessons.length;
      const completedLessons = updatedLessons.filter((l) => l.is_completed).length;
      const isCourseComplete = totalLessons > 0 && completedLessons === totalLessons;

      // Update progress - fix division by zero
      if (totalLessons > 0) {
        const progress = Math.min(100, Math.max(0, (completedLessons / totalLessons) * 100));
        setLevelProgress(progress);
      } else {
        setLevelProgress(0);
      }

      setLevelLessons(updatedLessons);

      // Store completion status in sessionStorage
      if (lessonId) {
        sessionStorage.setItem(`lesson_completed_${lessonId}`, 'true');
      }

      // Reload lesson data in background to sync with server
      loadLesson().catch(console.error);

      // Find next lesson within the SAME module (not using next_lesson_id which may point to different module)
      const sortedQuizLessons = [...updatedLessons].sort((a, b) => a.order_index - b.order_index);
      const currentQuizIndex = sortedQuizLessons.findIndex(l => l.id === lessonId);
      const nextQuizLesson = currentQuizIndex >= 0 && currentQuizIndex < sortedQuizLessons.length - 1
        ? sortedQuizLessons[currentQuizIndex + 1]
        : null;
      const nextLessonId = nextQuizLesson?.id || null;

      // If already completed, just navigate to next lesson without showing XP/completion animation
      if (alreadyCompleted) {
        // Use requestAnimationFrame to ensure DOM update is visible before navigation
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            if (nextLessonId) {
              router.push(`/lesson/${nextLessonId}`);
            }
          });
        });
        setCompleting(false);
        return;
      }

      // If module is complete (all lessons in this level done), show course completion modal
      if (isCourseComplete) {
        setCompleting(false);
        setShowCourseCompletion(true);
        return;
      }

      // Show success notification only if lesson was not already completed
      setSuccessData({
        xpGained: result.xp_gained,
        leveledUp: result.leveled_up || false,
        newLevel: result.new_level,
      });
      setShowSuccess(true);

      // Create navigation handler that updates quest bar and navigates
      const handleNavigate = () => {
        setShowSuccess(false);
        setSuccessData(null);

        // Navigate immediately (no delay)
        // Store scroll trigger for next page load
        if (nextLessonId) {
          sessionStorage.setItem('questbar_scroll_trigger', nextLessonId);
          router.push(`/lesson/${nextLessonId}`);
        }
      };

      // Store navigation handler for SuccessNotification
      navigateToNextLessonRef.current = handleNavigate;

      // Auto-navigate after shorter timeout (2 seconds + animation)
      if (result.leveled_up || nextLessonId) {
        setTimeout(() => {
          if (nextLessonId) {
            handleNavigate();
          }
        }, 2300); // 2000ms notification + 300ms fade-out
      }
    } catch (err: any) {
      // If error is "already completed", just navigate to next lesson silently
      if (err?.message && (err.message.includes("already completed") || err.message.includes("Lesson already completed"))) {
        // Optimistically update quest bar even on error
        const updatedQuizLessonsOnError = levelLessons.map(l =>
          l.id === lessonId ? { ...l, is_completed: true } : l
        );
        const completedQuizOnError = updatedQuizLessonsOnError.filter((l) => l.is_completed).length;
        setLevelProgress((completedQuizOnError / updatedQuizLessonsOnError.length) * 100);
        setLevelLessons(updatedQuizLessonsOnError);

        // Find next lesson within the same module
        const sortedQuizOnError = [...updatedQuizLessonsOnError].sort((a, b) => a.order_index - b.order_index);
        const currentQuizIdxOnError = sortedQuizOnError.findIndex(l => l.id === lessonId);
        const nextQuizOnError = currentQuizIdxOnError >= 0 && currentQuizIdxOnError < sortedQuizOnError.length - 1
          ? sortedQuizOnError[currentQuizIdxOnError + 1]
          : null;

        if (nextQuizOnError) {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              router.push(`/lesson/${nextQuizOnError.id}`);
            });
          });
        } else {
          // If no next lesson in module, just reload to show completed state
          await loadLesson();
        }
        setCompleting(false);
        return;
      }
      console.error("Failed to complete lesson:", err);
      setError(err?.message || "Failed to complete lesson");
    } finally {
      setCompleting(false);
    }
  };

  // Show loading while auth is loading or lesson is loading
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-mambo-dark flex items-center justify-center">
        <div className="text-gray-400">Loading lesson...</div>
      </div>
    );
  }

  // Only show error screen if lesson truly doesn't exist (allow viewing completed lessons even if there's an error)
  if (!lesson) {
    return (
      <>
        {showSuccess && successData && (
          <SuccessNotification
            isOpen={showSuccess}
            onClose={() => {
              setShowSuccess(false);
              setSuccessData(null);
            }}
            onContinue={navigateToNextLessonRef.current || undefined}
            xpGained={successData.xpGained}
            leveledUp={successData.leveledUp}
            newLevel={successData.newLevel}
          />
        )}
        <div className="min-h-screen bg-mambo-dark flex items-center justify-center">
          <div className="text-red-400">{error || "Lesson not found"}</div>
        </div>
      </>
    );
  }

  const currentLesson = levelLessons.find((l) => l.id === lessonId);
  const isCompleted = currentLesson?.is_completed || false;
  const lessonType = lesson.lesson_type || "video"; // Default to "video" for backwards compatibility
  const hasQuiz = lesson.content_json?.quiz && Array.isArray(lesson.content_json.quiz) && lesson.content_json.quiz.length > 0;
  const lessonNotes = lesson.content_json?.notes || "";

  // Determine what to show based on lesson type
  const isVideoLesson = lessonType === "video";
  const isQuizLesson = lessonType === "quiz";
  const isHistoryLesson = lessonType === "history";

  // Determine lesson display number (week.day or order)
  const lessonNumber = lesson.week_number && lesson.day_number
    ? `${lesson.week_number}.${lesson.day_number}`
    : currentLesson?.order_index || "?";

  // Check if lesson has a real video (not placeholder)
  // Only show video player if we have a Mux playback ID or a valid non-placeholder video URL
  // AND it's a video lesson type
  const hasVideo = isVideoLesson && !!(
    (lesson.mux_playback_id && lesson.mux_playback_id.trim() !== "") ||
    (lesson.video_url &&
      lesson.video_url.trim() !== "" &&
      !lesson.video_url.includes("example") && // Filter out any URLs containing "example" (including "example.com", "https://example", etc.)
      !lesson.video_url.includes("placeholder") && // Filter out placeholder URLs
      !lesson.video_url.startsWith("mux://") && // Don't show placeholder mux URLs (mux:// without playback_id)
      lesson.video_url.startsWith("http")) // Must be a valid HTTP(S) URL
  );

  // Don't render lesson content if showing auth/subscribe modals
  if (showAuthModal || showSubscribeModal) {
    return (
      <>
        <AuthPromptModal
          isOpen={showAuthModal}
          onClose={() => {
            setShowAuthModal(false);
            router.push("/courses");
          }}
          type="login"
        />
        <AuthPromptModal
          isOpen={showSubscribeModal}
          onClose={() => {
            setShowSubscribeModal(false);
            router.push("/courses");
          }}
          type="subscribe"
          courseTitle={courseTitle}
        />
      </>
    );
  }

  return (
    <>
      {/* Module/Course Completion Modal */}
      <CourseCompletionModal
        isOpen={showCourseCompletion}
        courseTitle={levelTitle}  // Show module/level title
        type="module"  // This is module completion, not course completion
        courseId={worldId || undefined}
        onClose={() => {
          setShowCourseCompletion(false);
          if (worldId) {
            router.push(`/courses/${worldId}`);  // Navigate back to skill tree
          } else {
            router.push("/courses");
          }
        }}
      />

      {/* Quiz Result Modal */}
      <QuizResultModal
        isOpen={showQuizResult}
        isCorrect={quizIsCorrect}
        onTryAgain={handleTryAgain}
        onContinue={handleQuizContinue}
      />

      {/* Success Notification */}
      {showSuccess && successData && (
        <SuccessNotification
          isOpen={showSuccess}
          onClose={() => {
            setShowSuccess(false);
            setSuccessData(null);
          }}
          onContinue={navigateToNextLessonRef.current || undefined}
          xpGained={successData.xpGained}
          leveledUp={successData.leveledUp}
          newLevel={successData.newLevel}
        />
      )}

      <div className="h-screen flex flex-col overflow-hidden bg-mambo-dark text-mambo-cream font-sans">
        {/* Navigation Bar */}
        <nav className="border-b border-gray-800 bg-mambo-panel flex-none z-20">
          <div className="px-6 py-3 flex justify-between items-center">
            <div className="flex items-center gap-4">
              {worldId ? (
                <Link
                  href={`/courses/${worldId}`}
                  className="text-gray-400 hover:text-white transition flex items-center gap-2 text-sm font-bold"
                >
                  <FaPlay className="rotate-[-90deg]" /> Back to Skill Tree
                </Link>
              ) : (
                <Link
                  href="/courses"
                  className="text-gray-400 hover:text-white transition flex items-center gap-2 text-sm font-bold"
                >
                  <FaPlay className="rotate-[-90deg]" /> Courses
                </Link>
              )}
              <span className="text-gray-700 text-2xl font-light">|</span>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Current Quest</span>
                <h1 className="font-bold text-sm md:text-base text-white">
                  {levelTitle} <span className="text-gray-600 px-1">/</span>{" "}
                  <span className="text-mambo-gold">{lessonNumber} {lesson.title}</span>
                </h1>
              </div>
            </div>

            {user && (
              <div className="flex items-center gap-3">
                {/* Complete Lesson Button in Header */}
                {!isCompleted &&
                  !(isQuizLesson && !quizPassed) &&
                  !(isVideoLesson && hasQuiz && !quizPassed) && (
                    <button
                      onClick={handleComplete}
                      disabled={completing}
                      className="hidden sm:flex px-5 py-2 bg-green-600 hover:bg-green-500 text-white text-sm font-bold rounded-lg shadow-[0_0_15px_rgba(22,163,74,0.4)] items-center gap-2 transition transform active:scale-95 border border-green-400/30 group disabled:opacity-50"
                    >
                      <span>Complete Lesson</span>
                      <FaArrowRight className="group-hover:translate-x-1 transition" />
                    </button>
                  )}
                {isCompleted && (
                  <div className="hidden sm:flex px-4 py-2 bg-green-900/40 text-green-400 text-sm font-bold rounded-lg items-center gap-2 border border-green-500/30">
                    <FaCheckCircle />
                    Completed
                  </div>
                )}

                <div className="text-right hidden sm:block">
                  <div className="text-[10px] font-bold text-mambo-gold uppercase tracking-wider">XP Boost Active</div>
                  <div className="text-xs font-bold text-white">Level {user.level} • {user.xp.toLocaleString()} XP</div>
                </div>
                <Link href="/profile">
                  <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden border border-mambo-gold/50 relative flex items-center justify-center">
                    {user.avatar_url ? (
                      <Image
                        src={user.avatar_url}
                        alt={`${user.first_name} ${user.last_name}`}
                        width={40}
                        height={40}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-mambo-blue to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                        {user.first_name[0]?.toUpperCase() || "U"}
                      </div>
                    )}
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-mambo-panel"></div>
                  </div>
                </Link>
              </div>
            )}
          </div>
        </nav>

        <div className="flex flex-1 overflow-hidden">
          {/* Main Content */}
          <main className="flex-1 overflow-y-auto bg-black relative flex flex-col">
            {/* Video Player - Only show for video lessons with video */}
            {isVideoLesson && hasVideo && (
              <div className="relative">
                {/* Practice Mode Overlay - shows after 3 views to encourage download */}
                {showPracticeMode && !dismissedPracticeMode && lesson.mux_playback_id && (
                  <PracticeModeOverlay
                    playbackId={lesson.mux_playback_id}
                    onDismiss={() => {
                      dismissForSession();
                      setDismissedPracticeMode(true);
                    }}
                    onDownloadComplete={markDownloaded}
                  />
                )}

                {lesson.mux_playback_id ? (
                  <MuxVideoPlayer
                    ref={videoPlayerRef}
                    playbackId={lesson.mux_playback_id}
                    onEnded={() => setVideoPlaying(false)}
                    onPlay={incrementView}
                    onLoadedMetadata={(duration) => setVideoDuration(duration)}
                    autoPlay={videoPlaying}
                    durationMinutes={lesson.duration_minutes}
                    metadata={{
                      video_title: lesson.title,
                      video_id: lesson.id,
                    }}
                  />
                ) : lesson.video_url ? (
                  <div className="w-full bg-gray-900 relative group aspect-video max-h-[70vh]">
                    <video
                      controls
                      autoPlay={videoPlaying}
                      className="w-full h-full object-cover"
                      src={lesson.video_url}
                      onEnded={() => setVideoPlaying(false)}
                      onPlay={incrementView}
                      onClick={() => setVideoPlaying(!videoPlaying)}
                    />
                    {!videoPlaying && (
                      <button
                        onClick={() => setVideoPlaying(true)}
                        className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition z-10"
                      >
                        <div className="w-20 h-20 bg-mambo-blue/90 hover:bg-mambo-blue rounded-full flex items-center justify-center backdrop-blur-sm transition hover:scale-110 shadow-[0_0_30px_rgba(59,130,246,0.5)]">
                          <FaPlay className="text-2xl ml-1 text-white" />
                        </div>
                      </button>
                    )}
                  </div>
                ) : null}

                {/* Pro Video Controls - only for Mux videos */}
                {lesson.mux_playback_id && (
                  <div className="px-4 pb-4 bg-black">
                    <ProVideoControls
                      playerRef={videoPlayerRef}
                      isPerformer={user?.tier?.toLowerCase() === "performer"}
                      duration={videoDuration}
                      onUpgradeClick={() => router.push("/pricing")}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Lesson Content */}
            <div className="max-w-4xl mx-auto w-full px-6 py-8">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8">
                <div>
                  <h2 className="font-serif text-3xl font-bold mb-2 text-white">{lesson.title}</h2>
                  <div className="flex items-center gap-3">
                    <span className="bg-mambo-blue/10 text-mambo-blue text-xs font-bold px-2 py-1 rounded border border-mambo-blue/20">
                      {isVideoLesson ? "Video Lesson" : isQuizLesson ? "Quiz" : isHistoryLesson ? "History Lesson" : "Lesson"}
                    </span>
                    <span className="text-gray-500 text-sm">•</span>
                    <span className="text-mambo-gold text-sm font-bold flex items-center gap-1">
                      <FaBolt className="mr-1" /> {lesson.xp_value} XP
                    </span>
                    {lesson.duration_minutes && (
                      <>
                        <span className="text-gray-500 text-sm">•</span>
                        <span className="text-gray-400 text-sm">{lesson.duration_minutes} min</span>
                      </>
                    )}
                  </div>
                </div>

              </div>

              {/* Tabs - Only show for video lessons */}
              {isVideoLesson && (
                <div className="border-b border-gray-800 mb-6 flex gap-8">
                  <button
                    onClick={() => setActiveTab("description")}
                    className={`pb-3 border-b-2 font-bold text-sm transition ${activeTab === "description"
                      ? "border-mambo-blue text-white"
                      : "border-transparent text-gray-400 hover:text-white"
                      }`}
                  >
                    Description
                  </button>
                  <button
                    onClick={() => setActiveTab("discuss")}
                    className={`pb-3 border-b-2 font-bold text-sm transition ${activeTab === "discuss"
                      ? "border-mambo-blue text-white"
                      : "border-transparent text-gray-400 hover:text-white"
                      }`}
                  >
                    Discussion (0)
                  </button>
                </div>
              )}

              {/* Content based on lesson type */}
              {/* Video Lesson: Show video + notes in tabs */}
              {isVideoLesson && (
                <>
                  {activeTab === "description" && (
                    <div className="tab-content active prose prose-invert prose-sm max-w-none text-gray-300">
                      {lessonNotes ? (
                        <div className="prose prose-invert prose-lg max-w-none">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              // Custom styling for headings
                              h1: ({ ...props }) => <h1 className="text-3xl font-bold text-white mt-8 mb-4" {...props} />,
                              h2: ({ ...props }) => <h2 className="text-2xl font-bold text-white mt-6 mb-3" {...props} />,
                              h3: ({ ...props }) => <h3 className="text-xl font-bold text-white mt-6 mb-3" {...props} />,
                              h4: ({ ...props }) => <h4 className="text-lg font-bold text-white mt-4 mb-2" {...props} />,
                              // Custom styling for paragraphs
                              p: ({ ...props }) => <p className="text-gray-300 mb-4 leading-relaxed" {...props} />,
                              // Custom styling for lists
                              ul: ({ ...props }) => <ul className="list-disc list-inside space-y-2 text-gray-300 mb-4 pl-5" {...props} />,
                              ol: ({ ...props }) => <ol className="list-decimal list-inside space-y-2 text-gray-300 mb-4 pl-5" {...props} />,
                              li: ({ ...props }) => <li className="text-gray-300" {...props} />,
                              // Custom styling for links
                              a: ({ ...props }) => <a className="text-mambo-blue hover:text-blue-400 underline" target="_blank" rel="noopener noreferrer" {...props} />,
                              // Custom styling for code blocks
                              code: ({ className, inline, ...props }: any) => {
                                const isInline = inline !== undefined && inline;
                                return isInline ? (
                                  <code className="bg-gray-800 text-mambo-blue px-1 py-0.5 rounded text-sm font-mono" {...props} />
                                ) : (
                                  <code className="block bg-gray-900 text-gray-300 p-4 rounded-lg overflow-x-auto mb-4 font-mono text-sm" {...props} />
                                );
                              },
                              pre: ({ ...props }) => <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto mb-4" {...props} />,
                              // Custom styling for blockquotes
                              blockquote: ({ ...props }) => <blockquote className="border-l-4 border-mambo-blue pl-4 italic text-gray-400 my-4" {...props} />,
                              // Custom styling for strong/bold
                              strong: ({ ...props }) => <strong className="font-bold text-white" {...props} />,
                              // Custom styling for emphasis/italic
                              em: ({ ...props }) => <em className="italic text-gray-200" {...props} />,
                              // Custom styling for horizontal rules
                              hr: ({ ...props }) => <hr className="border-gray-700 my-6" {...props} />,
                            }}
                          >
                            {lessonNotes}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <p className="lead text-lg text-white">
                          {lesson.description || "Master the fundamentals of this lesson."}
                        </p>
                      )}
                    </div>
                  )}
                  {activeTab === "discuss" && (
                    <div className="tab-content active">
                      <p className="text-gray-400">Discussion coming soon...</p>
                    </div>
                  )}
                </>
              )}

              {/* Quiz Lesson: Show only quiz, no tabs, no video, no notes */}
              {isQuizLesson && (
                <div className="bg-mambo-panel border border-gray-800 rounded-xl p-8 text-center max-w-2xl mx-auto">
                  <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6 border border-gray-700">
                    <FaClipboardList className="text-3xl text-mambo-gold" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Prove Your Knowledge</h3>
                  <p className="text-gray-400 mb-8 text-sm">
                    Pass this quiz to earn your badge and unlock the next lesson.
                  </p>

                  {hasQuiz ? (
                    <>
                      {lesson.content_json.quiz.map((question: QuizQuestion, qIndex: number) => {
                        const questionId = question.id || `q-${qIndex}`;
                        const selectedAnswer = quizAnswers[questionId];

                        return (
                          <div
                            key={questionId}
                            className="text-left bg-black/40 border border-gray-700 rounded-xl p-6 mb-6 shadow-lg relative overflow-hidden"
                          >
                            <div className="absolute top-0 left-0 w-1 h-full bg-mambo-blue"></div>
                            <div className="text-xs font-bold text-mambo-blue mb-2 uppercase tracking-widest">
                              Question {qIndex + 1} of {lesson.content_json.quiz.length}
                            </div>
                            <h4 className="text-lg font-bold text-white mb-6">{question.question}</h4>

                            <div className="space-y-3">
                              {question.options.map((option, oIndex) => {
                                const isSelected = selectedAnswer === oIndex;
                                const isCorrect = option.isCorrect;
                                const showResult = quizSubmitted && isCorrect;

                                return (
                                  <label
                                    key={oIndex}
                                    className={`flex items-center p-4 rounded-lg border cursor-pointer transition-all duration-200 relative overflow-hidden ${showResult
                                      ? "border-mambo-gold bg-mambo-gold/10"
                                      : isSelected
                                        ? "border-green-500 bg-green-500/10"
                                        : "border-gray-700 hover:border-gray-600 hover:bg-gray-800/50 hover:scale-[1.02]"
                                      } ${quizSubmitted ? "cursor-not-allowed" : ""}`}
                                  >
                                    <div
                                      className={`w-5 h-5 rounded-full border mr-4 flex items-center justify-center shrink-0 transition-all ${showResult
                                        ? "border-2 border-mambo-gold"
                                        : isSelected
                                          ? "border-2 border-green-500"
                                          : "border border-gray-500"
                                        }`}
                                    >
                                      {showResult ? (
                                        <div className="w-2.5 h-2.5 rounded-full bg-mambo-gold"></div>
                                      ) : isSelected ? (
                                        <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                                      ) : null}
                                    </div>
                                    <span
                                      className={`font-medium flex-1 ${showResult
                                        ? "text-white font-bold"
                                        : isSelected
                                          ? "text-white"
                                          : "text-gray-300"
                                        }`}
                                    >
                                      {option.text}
                                    </span>
                                    {showResult && (
                                      <FaCheckCircle className="text-mambo-gold text-xl absolute right-4" />
                                    )}
                                    {!quizSubmitted && (
                                      <input
                                        type="radio"
                                        name={questionId}
                                        checked={isSelected}
                                        onChange={() => handleQuizAnswer(questionId, oIndex)}
                                        className="sr-only"
                                      />
                                    )}
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}

                      {!quizSubmitted && (
                        <button
                          onClick={handleQuizSubmit}
                          disabled={Object.keys(quizAnswers).length < lesson.content_json.quiz.length}
                          className="bg-white text-black font-bold px-8 py-3 rounded-full hover:bg-gray-200 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Submit Answer{lesson.content_json.quiz.length > 1 ? "s" : ""}
                        </button>
                      )}
                    </>
                  ) : (
                    <div className="text-gray-400 text-center py-8">
                      <p>This quiz lesson doesn't have any questions yet.</p>
                      <p className="text-sm mt-2">Please contact the instructor if you believe this is an error.</p>
                    </div>
                  )}
                </div>
              )}

              {/* History Lesson: Show only notes, no tabs, no video */}
              {isHistoryLesson && (
                <div className="prose prose-invert prose-sm max-w-none text-gray-300">
                  {lessonNotes ? (
                    <div className="prose prose-invert prose-lg max-w-none">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          h1: ({ ...props }) => <h1 className="text-3xl font-bold text-white mt-8 mb-4" {...props} />,
                          h2: ({ ...props }) => <h2 className="text-2xl font-bold text-white mt-6 mb-3" {...props} />,
                          h3: ({ ...props }) => <h3 className="text-xl font-bold text-white mt-6 mb-3" {...props} />,
                          h4: ({ ...props }) => <h4 className="text-lg font-bold text-white mt-4 mb-2" {...props} />,
                          p: ({ ...props }) => <p className="text-gray-300 mb-4 leading-relaxed" {...props} />,
                          ul: ({ ...props }) => <ul className="list-disc list-inside space-y-2 text-gray-300 mb-4 pl-5" {...props} />,
                          ol: ({ ...props }) => <ol className="list-decimal list-inside space-y-2 text-gray-300 mb-4 pl-5" {...props} />,
                          li: ({ ...props }) => <li className="text-gray-300" {...props} />,
                          a: ({ ...props }) => <a className="text-mambo-blue hover:text-blue-400 underline" target="_blank" rel="noopener noreferrer" {...props} />,
                          code: ({ className, inline, ...props }: any) => {
                            const isInline = inline !== undefined && inline;
                            return isInline ? (
                              <code className="bg-gray-800 text-mambo-blue px-1 py-0.5 rounded text-sm font-mono" {...props} />
                            ) : (
                              <code className="block bg-gray-900 text-gray-300 p-4 rounded-lg overflow-x-auto mb-4 font-mono text-sm" {...props} />
                            );
                          },
                          pre: ({ ...props }) => <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto mb-4" {...props} />,
                          blockquote: ({ ...props }) => <blockquote className="border-l-4 border-mambo-blue pl-4 italic text-gray-400 my-4" {...props} />,
                          strong: ({ ...props }) => <strong className="font-bold text-white" {...props} />,
                          em: ({ ...props }) => <em className="italic text-gray-200" {...props} />,
                          hr: ({ ...props }) => <hr className="border-gray-700 my-6" {...props} />,
                        }}
                      >
                        {lessonNotes}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p className="lead text-lg text-white">
                      {lesson.description || "Read through this history lesson."}
                    </p>
                  )}
                </div>
              )}

              {activeTab === "discuss" && (
                <div className="tab-content active">
                  <div className="bg-mambo-panel border border-gray-800 rounded-xl p-6">
                    <div className="flex gap-4 mb-8">
                      {user && (
                        <>
                          <div className="w-10 h-10 rounded-full bg-gray-700 border border-gray-600 overflow-hidden">
                            {user.avatar_url ? (
                              <Image
                                src={user.avatar_url}
                                alt={user.first_name}
                                width={40}
                                height={40}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-mambo-blue flex items-center justify-center text-white text-xs font-bold">
                                {user.first_name[0]?.toUpperCase() || "U"}
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <textarea
                              className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-mambo-blue outline-none text-sm min-h-[80px]"
                              placeholder={`Ask a question about ${lesson.title}...`}
                            />
                            <div className="flex justify-end mt-2">
                              <button className="text-xs font-bold bg-mambo-blue text-white px-4 py-2 rounded-lg hover:bg-blue-600">
                                Post Comment
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="text-center py-8 text-gray-500">
                      No comments yet. Be the first to start the discussion!
                    </div>
                  </div>
                </div>
              )}
            </div>
          </main>

          {/* Sidebar */}
          <QuestLogSidebar
            currentLessonId={lessonId}
            lessons={levelLessons}
            worldTitle={levelTitle}
            worldProgress={levelProgress}
          />
        </div>

        <style jsx>{`
        .tab-content {
          display: none;
          animation: fadeIn 0.3s ease;
        }
        .tab-content.active {
          display: block;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
      </div>
    </>
  );
}
