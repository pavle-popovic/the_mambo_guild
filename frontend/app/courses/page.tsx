"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api";
import { StaggerContainer, Clickable } from "@/components/ui/motion";
import { FadeIn } from "@/components/ui/motion";
import CourseCard from "@/components/CourseCard";

interface Course {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  thumbnail_url: string | null;
  mux_preview_playback_id?: string | null;
  difficulty: string;
  progress_percentage: number;
  is_locked: boolean;
}

type FilterType = "all" | "beginner" | "intermediate" | "styling";

export default function CoursesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    filterCourses();
  }, [courses, activeFilter]);

  const loadCourses = async () => {
    try {
      // Load courses - works for both authenticated and unauthenticated users
      const data = await apiClient.getWorlds();
      console.log("Loaded courses:", data);
      setCourses(data);
      setError("");
      // Immediately filter the loaded courses
      if (activeFilter === "all") {
        setFilteredCourses(data);
      } else {
        const filtered = data.filter((course) => {
          const difficultyLower = course.difficulty?.toLowerCase() || "";
          switch (activeFilter) {
            case "beginner":
              return difficultyLower === "beginner" || difficultyLower.includes("beginner");
            case "intermediate":
              return difficultyLower === "intermediate" || difficultyLower.includes("intermediate");
            case "styling":
              return course.title.toLowerCase().includes("styling") || 
                     course.title.toLowerCase().includes("shines") ||
                     course.description?.toLowerCase().includes("styling") ||
                     course.description?.toLowerCase().includes("shines");
            default:
              return true;
          }
        });
        setFilteredCourses(filtered);
      }
    } catch (err: any) {
      console.error("Failed to load courses:", err);
      setCourses([]);
      setFilteredCourses([]);
      setError(err.message || "Failed to load courses. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const filterCourses = () => {
    if (activeFilter === "all") {
      setFilteredCourses(courses);
      return;
    }

    const filtered = courses.filter((course) => {
      const difficultyLower = course.difficulty?.toLowerCase() || "";
      switch (activeFilter) {
        case "beginner":
          return difficultyLower === "beginner" || difficultyLower.includes("beginner");
        case "intermediate":
          return difficultyLower === "intermediate" || difficultyLower.includes("intermediate");
        case "styling":
          return course.title.toLowerCase().includes("styling") || 
                 course.title.toLowerCase().includes("shines") ||
                 course.description?.toLowerCase().includes("styling") ||
                 course.description?.toLowerCase().includes("shines");
        default:
          return true;
      }
    });
    setFilteredCourses(filtered);
  };

  const handleCourseClick = (course: Course) => {
    // REFINED ACCESS CONTROL:
    // - Not logged in: Show login modal for ALL courses (including free)
    // - Logged in (Rookie/Free): Show subscribe modal for paid courses
    // - Logged in (Paid): Allow access to all courses
    
    if (!user) {
      // Not logged in - show login modal for ANY course
      // Modal is handled inside CourseCard component
      return;
    }
    
    if (course.is_locked) {
      // Logged in but course is locked (paid course, not subscribed)
      // Modal is handled inside CourseCard component
      return;
    }
    
    // User is logged in and has access - navigate to course
    router.push(`/courses/${course.id}`);
  };

  return (
    <div className="min-h-screen bg-mambo-dark">
      <NavBar user={user || undefined} />

      <FadeIn>
      <div className="bg-mambo-panel border-b border-gray-800 py-16 pt-24">
        <div className="max-w-7xl mx-auto px-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-mambo-text tracking-tight">Explore Courses</h1>
            <p className="text-gray-300 text-lg mb-10 max-w-2xl leading-relaxed">
            Follow the path. Master the foundation before you unlock the flair.
          </p>
          
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
              <Clickable>
            <button
              onClick={() => setActiveFilter("all")}
                  className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${
                activeFilter === "all"
                      ? "bg-gradient-to-r from-white to-gray-100 text-black shadow-lg"
                      : "bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 hover:border-gray-600"
              }`}
            >
              All Courses
            </button>
              </Clickable>
              <Clickable>
            <button
              onClick={() => setActiveFilter("beginner")}
                  className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${
                activeFilter === "beginner"
                      ? "bg-gradient-to-r from-white to-gray-100 text-black shadow-lg"
                      : "bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 hover:border-gray-600"
              }`}
            >
              Beginner
            </button>
              </Clickable>
              <Clickable>
            <button
              onClick={() => setActiveFilter("intermediate")}
                  className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${
                activeFilter === "intermediate"
                      ? "bg-gradient-to-r from-white to-gray-100 text-black shadow-lg"
                      : "bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 hover:border-gray-600"
              }`}
            >
              Intermediate
            </button>
              </Clickable>
              <Clickable>
            <button
              onClick={() => setActiveFilter("styling")}
                  className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${
                activeFilter === "styling"
                      ? "bg-gradient-to-r from-white to-gray-100 text-black shadow-lg"
                      : "bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 hover:border-gray-600"
              }`}
            >
              Styling & Shines
            </button>
              </Clickable>
            </div>
          </div>
        </div>
      </FadeIn>

      {loading ? (
        <div className="max-w-7xl mx-auto px-8 py-16 text-center text-gray-400">
          Loading courses...
        </div>
      ) : error ? (
        <div className="max-w-7xl mx-auto px-8 py-16 text-center">
          <div className="text-red-400 mb-4">{error}</div>
          <button
            onClick={loadCourses}
            className="px-6 py-2 bg-mambo-blue hover:bg-blue-600 text-white rounded-lg font-bold transition"
          >
            Retry
          </button>
        </div>
      ) : (
        <StaggerContainer className="max-w-7xl mx-auto px-8 py-16 grid md:grid-cols-3 gap-8">
          {filteredCourses.length === 0 ? (
            <div className="col-span-3 text-center text-gray-400 py-16">
              {courses.length === 0 
                ? "No courses available at the moment. Please check back later."
                : "No courses found for this filter. Try a different filter."}
            </div>
          ) : (
            filteredCourses.map((course, index) => (
              <CourseCard
                key={course.id}
                course={course}
                index={index}
                user={user}
                onCourseClick={handleCourseClick}
              />
            ))
          )}
        </StaggerContainer>
      )}

      <Footer />
    </div>
  );
}

