"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api";

interface Course {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
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
      setCourses(data);
      setError("");
    } catch (err: any) {
      // Silently handle errors - show empty state instead
      console.error("Failed to load courses:", err);
      setCourses([]);
      setError("");
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
      const difficultyLower = course.difficulty.toLowerCase();
      switch (activeFilter) {
        case "beginner":
          return difficultyLower.includes("beginner") || difficultyLower === "beginner";
        case "intermediate":
          return difficultyLower.includes("intermediate") || difficultyLower === "intermediate";
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

  const handleCourseClick = (courseId: string, isLocked: boolean) => {
    if (isLocked) {
      return;
    }
    
    // Always navigate to course detail page - login prompt happens there when clicking lessons
    router.push(`/courses/${courseId}`);
  };

  return (
    <div className="min-h-screen bg-mambo-dark">
      <NavBar user={user || undefined} />

      <div className="bg-mambo-panel border-b border-gray-800 py-16 pt-24">
        <div className="max-w-7xl mx-auto px-8">
          <h1 className="text-4xl font-bold mb-6 text-mambo-text">Explore Courses</h1>
          <p className="text-gray-400 mb-10 max-w-2xl">
            Follow the path. Master the foundation before you unlock the flair.
          </p>
          
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setActiveFilter("all")}
              className={`px-4 py-2 rounded-full text-sm font-bold transition ${
                activeFilter === "all"
                  ? "bg-white text-black"
                  : "bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700"
              }`}
            >
              All Courses
            </button>
            <button
              onClick={() => setActiveFilter("beginner")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                activeFilter === "beginner"
                  ? "bg-white text-black"
                  : "bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700"
              }`}
            >
              Beginner
            </button>
            <button
              onClick={() => setActiveFilter("intermediate")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                activeFilter === "intermediate"
                  ? "bg-white text-black"
                  : "bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700"
              }`}
            >
              Intermediate
            </button>
            <button
              onClick={() => setActiveFilter("styling")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                activeFilter === "styling"
                  ? "bg-white text-black"
                  : "bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700"
              }`}
            >
              Styling & Shines
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="max-w-7xl mx-auto px-8 py-16 text-center text-gray-400">
          Loading courses...
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-8 py-16 grid md:grid-cols-3 gap-10">
          {filteredCourses.length === 0 ? (
            <div className="col-span-3 text-center text-gray-400 py-16">
              No courses found for this filter. Try a different filter.
            </div>
          ) : (
            filteredCourses.map((course, index) => (
              <div
                key={course.id}
                onClick={() => handleCourseClick(course.id, course.is_locked)}
                className={`bg-mambo-panel border border-gray-800 rounded-xl overflow-hidden transition ${
                  course.is_locked
                    ? "opacity-75 relative cursor-not-allowed"
                    : "hover:border-gray-600 group cursor-pointer"
                }`}
              >
                {course.is_locked && (
                  <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center z-10 backdrop-blur-[2px]">
                    <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center mb-3 border border-gray-600">
                      <svg
                        className="w-6 h-6 text-gray-400"
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
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-300">
                      Complete Previous Course
                    </span>
                  </div>
                )}

                {/* Image section with title superposed */}
                <div className="h-48 relative overflow-hidden bg-black">
                  <Image
                    src="/assets/Mambo_image_1.png"
                    alt={course.title}
                    fill
                    className={`object-cover group-hover:scale-105 transition duration-500 ${
                      course.is_locked ? "grayscale opacity-50" : ""
                    }`}
                  />
                  
                  {/* Dark overlay for better text readability */}
                  <div className="absolute inset-0 bg-black/30" />
                  
                  {/* Course badge at bottom-left */}
                  <div className="absolute bottom-3 left-3 bg-black/80 backdrop-blur px-2 py-1 rounded text-xs font-bold text-white z-10">
                    COURSE {index + 1}
                  </div>
                  
                  {/* Title superposed on image - centered, large and bold */}
                  <div className="absolute inset-0 flex items-center justify-center z-10">
                    <h3 className="font-bold text-2xl md:text-3xl lg:text-4xl text-white drop-shadow-2xl text-center px-4 leading-tight">
                      {course.title}
                    </h3>
                  </div>
                </div>

                {/* Content section - matches design exactly */}
                <div className="p-6 border-t border-white/10">
                  <div className="flex justify-between items-start mb-3">
                    <h3
                      className={`font-bold text-lg transition ${
                        course.is_locked
                          ? "text-gray-500"
                          : "group-hover:text-mambo-blue text-mambo-text"
                      }`}
                    >
                      {course.title}
                    </h3>
                    {!course.is_locked && (
                      <svg
                        className="w-6 h-6 text-mambo-blue shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mb-5 line-clamp-2">
                    {course.description || "Master the fundamentals and build your foundation."}
                  </p>

                  {!course.is_locked && (
                    <>
                      {user && course.progress_percentage > 0 && (
                        <div className="flex items-center gap-3 text-xs font-semibold text-gray-400 mb-3">
                          <div className="flex-1 bg-gray-800 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-green-500 h-full transition-all"
                              style={{ width: `${course.progress_percentage}%` }}
                            />
                          </div>
                          <span className="text-white">{Math.round(course.progress_percentage)}%</span>
                        </div>
                      )}
                      {user ? (
                        <div
                          className="w-full py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-bold text-mambo-text transition text-center"
                        >
                          {course.progress_percentage > 0 ? "Resume" : "Start"}
                        </div>
                      ) : (
                        <div
                          className="w-full py-2 bg-mambo-blue hover:bg-blue-600 rounded-lg text-sm font-bold text-white transition text-center cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.location.href = "/register";
                          }}
                        >
                          Get Started
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <Footer />
    </div>
  );
}

