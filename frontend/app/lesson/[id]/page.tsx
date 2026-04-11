"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api";
import QuestLogSidebar from "@/components/QuestLogSidebar";
import MuxVideoPlayer, { type MuxVideoPlayerHandle } from "@/components/MuxVideoPlayer";
import VideoControls from "@/components/ProVideoControls";
import DownloadButton from "@/components/DownloadButton";
import SuccessNotification from "@/components/SuccessNotification";
import AuthPromptModal from "@/components/AuthPromptModal";
import QuizResultModal from "@/components/QuizResultModal";
import CourseCompletionModal from "@/components/CourseCompletionModal";
import { FaBolt, FaPlay, FaPause, FaCheck, FaLock, FaArrowRight, FaCheckCircle, FaChevronLeft, FaSkull } from "react-icons/fa";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import RichContentRenderer from "@/components/RichContentRenderer";
import LocaleSwitcher from "@/components/LocaleSwitcher";
import { useTranslations } from "@/i18n/useTranslations";
import { useLocale } from "@/i18n/client";

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
  const tLesson = useTranslations('lesson');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const lessonId = params.id as string;

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [levelLessons, setLevelLessons] = useState<WorldLesson[]>([]);
  const [levelTitle, setLevelTitle] = useState("Loading...");
  const [levelId, setLevelId] = useState<string | null>(null);
  const [worldId, setWorldId] = useState<string | null>(null);
  const [levelProgress, setLevelProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false); // Controls the overlay play button state

  // Sidebar State
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("description");
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
  const videoPlayerRef = useRef<MuxVideoPlayerHandle>(null);
  const [videoDuration, setVideoDuration] = useState(0);
  const [captionText, setCaptionText] = useState("");

  useEffect(() => {
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

      // Show success notification for completing lesson
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

        if (nextLessonId) {
          // Navigate to next lesson in module
          sessionStorage.setItem('questbar_scroll_trigger', nextLessonId);
          router.push(`/lesson/${nextLessonId}`);
        } else if (isCourseComplete) {
          // Module complete — go back to skill tree
          router.push(worldId ? `/courses/${worldId}` : "/courses");
        }
      };

      // Store navigation handler for SuccessNotification
      navigateToNextLessonRef.current = handleNavigate;
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
    // Calculate score - support both formats
    const quiz = lesson?.content_json?.quiz || lesson?.content_json?.questions || [];
    let correct = 0;
    quiz.forEach((q: any, qIndex: number) => {
      const questionId = q.id || `q-${qIndex}`;
      const selectedIndex = quizAnswers[questionId];
      if (selectedIndex === undefined) return;

      if (q.options?.[selectedIndex]?.isCorrect) {
        // Admin editor format: options = [{text, isCorrect}]
        correct++;
      } else if (q.answer) {
        // Script-generated format: answer = "B", options = ["A) ...", "B) ...", "C) ..."]
        const answerLetter = q.answer.trim().toUpperCase();
        const selectedLetter = String.fromCharCode(65 + selectedIndex); // 0->A, 1->B, 2->C
        if (selectedLetter === answerLetter) correct++;
      }
    });
    const percentage = quiz.length > 0 ? (correct / quiz.length) * 100 : 0;
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
        <div className="text-gray-400">{tCommon('loading')}</div>
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
  // Support both admin editor format (content_json.quiz) and script-generated format (content_json.questions)
  // Check for locale-specific translations first
  const translations = lesson.content_json?.translations || {};
  const localeContent = locale !== 'en' ? translations[locale] : null;
  const quizData = localeContent?.quiz || localeContent?.questions || lesson.content_json?.quiz || lesson.content_json?.questions || [];
  const hasQuiz = Array.isArray(quizData) && quizData.length > 0;
  // Support both formats: {notes: "..."} and {type: "markdown", content: "..."}
  const lessonNotes = localeContent?.content || localeContent?.notes || lesson.content_json?.notes || lesson.content_json?.content || "";

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

      <div className="h-[100dvh] flex overflow-hidden bg-mambo-dark text-mambo-cream font-sans">

          {/* LEFT SIDEBAR: Quest Log (Desktop only) */}
          <aside className="hidden lg:flex flex-col h-full w-[280px] bg-black border-r border-white/10 z-30 flex-shrink-0 lesson-sidebar">
            {/* Navigation: back + language */}
            <div className="flex items-center justify-between px-3 py-2.5 border-b border-white/10 flex-shrink-0">
              <Link
                href={worldId ? `/courses/${worldId}` : '/courses'}
                className="flex items-center gap-1.5 text-gray-400 hover:text-white transition text-sm font-bold"
              >
                <FaChevronLeft size={12} /> {tCommon('back')}
              </Link>
              <LocaleSwitcher compact />
            </div>
            {/* Quest Log content */}
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
              <QuestLogSidebar
                currentLessonId={lessonId}
                lessons={levelLessons}
                worldTitle={levelTitle}
                worldProgress={levelProgress}
              />
            </div>
          </aside>

          {/* CENTER COLUMN: Main Content & Video */}
          <main className="flex-1 min-h-0 bg-black relative flex flex-col">
            {/* Minimal nav for non-video lessons */}
            {!isVideoLesson && (
              <nav className="border-b border-gray-800 bg-mambo-panel flex-none flex items-center justify-between px-4 py-3">
                <Link href={worldId ? `/courses/${worldId}` : '/courses'} className="text-gray-400 hover:text-white transition flex items-center gap-2 text-sm font-bold">
                  <FaChevronLeft size={12} /> {tCommon('back')}
                </Link>
                <div className="flex items-center gap-3">
                  <LocaleSwitcher compact />
                {user && !isCompleted && !(isQuizLesson && !quizPassed) && (
                  <button onClick={handleComplete} disabled={completing} className="flex px-4 py-2 bg-green-600 hover:bg-green-500 text-white text-sm font-bold rounded-lg items-center gap-2 transition disabled:opacity-50">
                    {tLesson('markComplete')} <FaArrowRight />
                  </button>
                )}
                {isCompleted && <div className="flex px-4 py-2 bg-green-900/40 text-green-400 text-sm font-bold rounded-lg items-center gap-2 border border-green-500/30"><FaCheckCircle /> {tLesson('completed')}</div>}
                </div>
              </nav>
            )}

            {/* Video Player - Only show for video lessons with video */}
            {isVideoLesson && hasVideo && (
              <div className="w-full bg-black relative flex-1 min-h-0 flex flex-col">

                {/* Back arrow + language moved to left sidebar on desktop */}

                {/* MOBILE QUEST BAR — sits above video as flex child, never covers it */}
                {levelLessons.length > 0 && (
                  <div className="lg:hidden flex-shrink-0 bg-black z-20 relative">
                    {/* Nav row: back + title + language */}
                    <div className="flex items-center justify-between px-3 pt-2 pb-1">
                      <Link
                        href={worldId ? `/courses/${worldId}` : '/courses'}
                        className="flex items-center gap-1.5 text-gray-400 hover:text-white transition"
                      >
                        <FaChevronLeft size={11} />
                        <span className="text-xs font-bold truncate max-w-[140px]">{levelTitle}</span>
                        <span className="text-[11px] font-bold text-mambo-gold ml-1">{Math.round(levelProgress)}%</span>
                      </Link>
                      <div className="flex items-center gap-2">
                        <LocaleSwitcher compact />
                        {user && !isCompleted && !(isQuizLesson && !quizPassed) && !(isVideoLesson && hasQuiz && !quizPassed) && (
                          <button
                            onClick={handleComplete}
                            disabled={completing}
                            className="flex items-center gap-1 px-2.5 py-1 bg-green-600 hover:bg-green-500 text-white text-[10px] font-bold rounded-full transition disabled:opacity-50"
                          >
                            <FaCheck className="text-[8px]" /> {tLesson('markComplete')}
                          </button>
                        )}
                        {isCompleted && (
                          <div className="flex items-center gap-1 px-2.5 py-1 bg-green-900/40 text-green-400 text-[10px] font-bold rounded-full border border-green-500/30">
                            <FaCheckCircle className="text-[8px]" /> {tLesson('completed')}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Top divider */}
                    <div className="h-[1px] bg-white/20" />

                    {/* Progress + lesson dots */}
                    <div className="px-3 py-2">
                      {/* Progress bar */}
                      <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden mb-2">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(100, Math.max(0, levelProgress))}%`,
                            minWidth: levelProgress > 0 ? '2px' : '0px',
                            background: 'linear-gradient(to right, #10b981, #059669)',
                            boxShadow: '0 0 8px rgba(16, 185, 129, 0.5)',
                          }}
                        />
                      </div>

                      {/* Horizontal lesson indicators */}
                      <div className="flex gap-3 overflow-x-auto no-scrollbar py-0.5">
                        {[...levelLessons].sort((a, b) => {
                          const wA = a.week_number ?? 0, wB = b.week_number ?? 0;
                          if (wA !== wB) return wA - wB;
                          const dA = a.day_number ?? 0, dB = b.day_number ?? 0;
                          if (dA !== dB) return dA - dB;
                          return a.order_index - b.order_index;
                        }).map((l) => {
                          const isActive = l.id === lessonId;
                          const isDone = l.is_completed;
                          const isLocked = l.is_locked;
                          const isBoss = l.is_boss_battle;
                          return (
                            <Link
                              key={l.id}
                              href={isLocked ? '#' : `/lesson/${l.id}`}
                              onClick={(e) => { if (isLocked) e.preventDefault(); }}
                              className={`flex-shrink-0 flex items-center justify-center rounded-full transition-all ${
                                isBoss
                                  ? `w-7 h-7 ${isActive ? 'bg-red-600 border-2 border-red-400' : isDone ? 'bg-red-800 opacity-60' : 'bg-red-900/50 border border-red-500/30'}`
                                  : isActive
                                    ? 'w-7 h-7 bg-mambo-blue border-2 border-blue-400 shadow-md shadow-blue-500/30'
                                    : isDone
                                      ? 'w-7 h-7 bg-green-600'
                                      : isLocked
                                        ? 'w-7 h-7 bg-gray-800 border border-gray-600'
                                        : 'w-7 h-7 bg-gray-700 border border-gray-500 hover:bg-gray-600'
                              }`}
                              title={l.title}
                            >
                              {isBoss ? (
                                <FaSkull className="text-[9px] text-red-200" />
                              ) : isActive ? (
                                <FaPlay className="text-[8px] text-white ml-px" />
                              ) : isDone ? (
                                <FaCheck className="text-[8px] text-white" />
                              ) : isLocked ? (
                                <FaLock className="text-[7px] text-gray-500" />
                              ) : (
                                <span className="text-[9px] font-bold text-gray-300">{l.order_index}</span>
                              )}
                            </Link>
                          );
                        })}
                      </div>
                    </div>

                    {/* Bottom divider */}
                    <div className="h-[1px] bg-white/20" />
                  </div>
                )}

                {lesson.mux_playback_id ? (
                  <>
                    <div className="w-full aspect-video lg:aspect-auto lg:flex-1 lg:min-h-0">
                      <MuxVideoPlayer
                        ref={videoPlayerRef}
                        playbackId={lesson.mux_playback_id}
                        onEnded={() => setVideoPlaying(false)}
                        onLoadedMetadata={(duration) => setVideoDuration(duration)}
                        onCaptionChange={setCaptionText}
                        autoPlay={videoPlaying}
                        durationMinutes={lesson.duration_minutes}
                        metadata={{
                          video_title: lesson.title,
                          video_id: lesson.id,
                        }}
                      />
                    </div>
                    {/* External caption display — below video on mobile, hidden on desktop (internal overlay used) */}
                    {captionText && (
                      <div className="lg:hidden flex-shrink-0 bg-black px-4 py-2 flex justify-center">
                        <span
                          className="text-white text-sm font-medium text-center leading-relaxed"
                          style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}
                        >
                          {captionText}
                        </span>
                      </div>
                    )}
                  </>

                ) : lesson.video_url ? (
                  <div className="w-full bg-gray-900 relative group aspect-video max-h-[75vh]">
                    <video
                      controls
                      autoPlay={videoPlaying}
                      className="w-full h-full object-contain"
                      src={lesson.video_url}
                      onEnded={() => setVideoPlaying(false)}
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
              </div>
            )}

            {/* Content for non-video lessons only */}
            {!isVideoLesson && (
              <div className="flex-1 min-h-0 overflow-y-auto">
              <div className="max-w-5xl mx-auto w-full px-3 sm:px-6 py-4 sm:py-8">
                {isQuizLesson && hasQuiz && (
                  <div className="max-w-2xl mx-auto">
                    <h3 className="text-xl font-bold text-white mb-4 text-center">{tLesson('quiz')}</h3>
                    <div className="space-y-4">
                      {quizData.map((q: any, qIndex: number) => {
                        const questionId = q.id || `q-${qIndex}`;
                        const selectedIndex = quizAnswers[questionId];
                        // Determine correct option index for both formats
                        const isScriptFormat = typeof q.answer === "string";
                        const correctIndex = isScriptFormat
                          ? q.answer.trim().toUpperCase().charCodeAt(0) - 65 // "B" -> 1
                          : q.options?.findIndex((o: any) => o.isCorrect) ?? -1;
                        const isCorrectAnswer = quizSubmitted && selectedIndex === correctIndex;
                        const isWrongAnswer = quizSubmitted && selectedIndex !== undefined && selectedIndex !== correctIndex;

                        return (
                          <div
                            key={questionId}
                            className={`bg-mambo-panel border rounded-xl p-4 ${
                              isCorrectAnswer ? "border-green-500 bg-green-500/10" :
                              isWrongAnswer ? "border-red-500 bg-red-500/10" :
                              "border-gray-800"
                            }`}
                          >
                            <h4 className="font-bold text-white mb-3 text-sm">
                              {qIndex + 1}. {q.question}
                            </h4>
                            <div className="space-y-1.5">
                              {(q.options || []).map((option: any, oIndex: number) => {
                                const isSelected = selectedIndex === oIndex;
                                const isCorrectOption = oIndex === correctIndex;
                                const optionText = typeof option === "string" ? option : option.text;

                                return (
                                  <button
                                    key={oIndex}
                                    onClick={() => handleQuizAnswer(questionId, oIndex)}
                                    disabled={quizSubmitted}
                                    className={`w-full text-left p-2.5 rounded-lg border text-sm transition ${
                                      isSelected
                                        ? quizSubmitted
                                          ? isCorrectOption
                                            ? "bg-green-600/20 border-green-500 text-green-300"
                                            : "bg-red-600/20 border-red-500 text-red-300"
                                          : "bg-blue-600/20 border-blue-500 text-blue-300"
                                        : quizSubmitted && isCorrectOption
                                          ? "bg-green-600/10 border-green-500/50 text-green-400"
                                          : "bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600"
                                    } ${quizSubmitted ? "cursor-default" : "cursor-pointer"}`}
                                  >
                                    <div className="flex items-center gap-3">
                                      {quizSubmitted && isSelected && (
                                        isCorrectOption
                                          ? <FaCheck className="text-green-400 flex-shrink-0" />
                                          : <span className="text-red-400 flex-shrink-0">✗</span>
                                      )}
                                      {quizSubmitted && isCorrectOption && !isSelected && (
                                        <FaCheck className="text-green-400 flex-shrink-0" />
                                      )}
                                      <span>{optionText}</span>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {!quizSubmitted ? (
                      <button
                        onClick={handleQuizSubmit}
                        disabled={Object.keys(quizAnswers).length !== quizData.length}
                        className="mt-6 w-full py-3 bg-mambo-blue hover:bg-blue-600 text-white font-bold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {tCommon('submit')}
                      </button>
                    ) : null}
                  </div>
                )}
                {isQuizLesson && !hasQuiz && (
                  <div className="bg-mambo-panel border border-gray-800 rounded-xl p-8 text-center max-w-2xl mx-auto">
                    <h3 className="text-xl font-bold text-white mb-2">Prove Your Knowledge</h3>
                    <p className="text-gray-400">No quiz questions available yet.</p>
                  </div>
                )}
                {isHistoryLesson && (
                  <div className="max-w-3xl mx-auto">
                    {lessonNotes ? (
                      <div className="summary-notes-content">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{lessonNotes}</ReactMarkdown>
                      </div>
                    ) : lesson.content_json?.blocks ? (
                      <RichContentRenderer contentJson={lesson.content_json} />
                    ) : lesson.description ? (
                      <div className="prose prose-invert prose-lg max-w-none text-gray-300">
                        <p>{lesson.description}</p>
                      </div>
                    ) : (
                      <div className="bg-mambo-panel border border-gray-800 rounded-xl p-8 text-center">
                        <p className="text-gray-400">No content available yet.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
              </div>
            )}
          </main>

          {/* RIGHT SIDEBAR: Mark Complete + Video Controls (Desktop only) */}
          <aside className="hidden lg:flex flex-col h-full w-[280px] bg-black border-l border-white/10 z-30 flex-shrink-0 lesson-sidebar">
            {/* Mark Complete button */}
            <div className="flex-shrink-0 p-3 flex justify-center">
              {user && !isCompleted && !(isQuizLesson && !quizPassed) && !(isVideoLesson && hasQuiz && !quizPassed) && (
                <button
                  onClick={handleComplete}
                  disabled={completing}
                  className="flex w-full px-4 py-2.5 bg-green-600 hover:bg-green-500 text-white text-sm font-bold rounded-lg shadow-[0_0_15px_rgba(22,163,74,0.4)] items-center justify-center gap-2 transition active:scale-95 border border-green-400/30 disabled:opacity-50 whitespace-nowrap"
                >
                  <span>{tLesson('markComplete')}</span>
                  <FaArrowRight />
                </button>
              )}
              {isCompleted && (
                <div className="flex w-full px-4 py-2.5 bg-green-900/60 text-green-400 text-sm font-bold rounded-lg items-center justify-center gap-2 border border-green-500/30">
                  <FaCheckCircle /> {tLesson('completed')}
                </div>
              )}
            </div>
            {/* Video Controls */}
            {isVideoLesson && lesson.mux_playback_id && (
              <div className="flex-shrink-0 p-3 border-t border-white/10 bg-zinc-900/40 backdrop-blur-md">
                <VideoControls
                  playerRef={videoPlayerRef}
                  duration={videoDuration}
                  variant="sidebar"
                />
              </div>
            )}
            <div className="flex-1" />
          </aside>

        {/* MOBILE STICKY CONTROLS */}
        {isVideoLesson && lesson.mux_playback_id && (
          <div className="lg:hidden fixed bottom-0 left-0 w-full z-50">
            <VideoControls
              playerRef={videoPlayerRef}
              duration={videoDuration}
              variant="mobile"
            />
          </div>
        )}

      </div>
    </>
  );
}
