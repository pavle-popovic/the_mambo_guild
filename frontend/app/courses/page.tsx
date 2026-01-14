"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api";
import { StaggerContainer, Clickable } from "@/components/ui/motion";
import { FadeIn } from "@/components/ui/motion";
import CourseCard from "@/components/CourseCard";
import { FaSearch, FaTimes } from "react-icons/fa";

interface Course {
  id: string;
  title: string;
  description: string | null;
  image_url?: string | null;
  thumbnail_url?: string | null;
  mux_preview_playback_id?: string | null;
  difficulty: string;
  progress_percentage: number;
  is_locked: boolean;
  course_type?: string; // "course" | "choreo" | "topic"
}

type DifficultyFilter = "all" | "beginner" | "intermediate" | "advanced";
type TypeFilter = "all" | "course" | "choreo" | "topic";

export default function CoursesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadCourses();
  }, []);

  // Filter courses by type, difficulty, and search query
  const filteredCourses = useMemo(() => {
    if (!courses || courses.length === 0) {
      return [];
    }

    return courses.filter((course) => {
      if (!course) return false;

      // Type filter
      if (typeFilter !== "all") {
        const courseType = (course.course_type || "course").toLowerCase();
        if (courseType !== typeFilter) return false;
      }

      // Difficulty filter
      if (difficultyFilter !== "all") {
        const difficulty = String(course.difficulty || "").toLowerCase().trim();
        if (difficulty !== difficultyFilter) return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const title = (course.title || "").toLowerCase();
        const description = (course.description || "").toLowerCase();
        if (!title.includes(query) && !description.includes(query)) {
          return false;
        }
      }

      return true;
    });
  }, [courses, typeFilter, difficultyFilter, searchQuery]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getWorlds();
      setCourses(Array.isArray(data) ? data : []);
      setError("");
    } catch (err: any) {
      console.error("Failed to load courses:", err);
      setCourses([]);
      setError(err.message || "Failed to load courses. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCourseClick = (course: Course) => {
    if (!user) return;
    if (course.is_locked) return;
    router.push(`/courses/${course.id}`);
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  // Count courses by type for badges
  const typeCounts = useMemo(() => {
    const counts = { all: courses.length, course: 0, choreo: 0, topic: 0 };
    courses.forEach((c) => {
      const type = (c.course_type || "course").toLowerCase() as keyof typeof counts;
      if (type in counts) counts[type]++;
    });
    return counts;
  }, [courses]);

  return (
    <div className="min-h-screen bg-mambo-dark">
      <NavBar user={user || undefined} />

      <FadeIn>
        <div className="bg-mambo-panel border-b border-gray-800 py-16 pt-24">
          <div className="max-w-7xl mx-auto px-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-mambo-text tracking-tight">
              Explore Courses
            </h1>
            <p className="text-gray-300 text-lg mb-10 max-w-2xl leading-relaxed">
              Follow the path. Master the foundation before you unlock the flair.
            </p>

            {/* Search Bar - Aesthetic Design */}
            <div className="relative max-w-xl mb-8">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-300" />
                <div className="relative flex items-center">
                  <FaSearch className="absolute left-5 text-gray-400 group-focus-within:text-amber-400 transition-colors" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by course name..."
                    className="w-full bg-black/50 border border-gray-700 rounded-full pl-12 pr-12 py-4 text-mambo-text-light placeholder-gray-500 focus:border-amber-500/50 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all duration-300"
                  />
                  {searchQuery && (
                    <button
                      onClick={clearSearch}
                      className="absolute right-5 text-gray-400 hover:text-white transition-colors"
                    >
                      <FaTimes />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Type Filters - Courses / Choreos / Topics */}
            <div className="flex flex-wrap gap-3 mb-6">
              <span className="text-sm font-bold text-gray-500 uppercase tracking-wider self-center mr-2">
                Type:
              </span>
              {[
                { value: "all", label: "All", icon: "🎯" },
                { value: "course", label: "Courses", icon: "📚" },
                { value: "choreo", label: "Choreos", icon: "💃" },
                { value: "topic", label: "Topics", icon: "💡" },
              ].map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setTypeFilter(filter.value as TypeFilter)}
                  className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 flex items-center gap-2 ${
                    typeFilter === filter.value
                      ? "bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-lg shadow-amber-500/20"
                      : "bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 hover:border-amber-500/30"
                  }`}
                >
                  <span>{filter.icon}</span>
                  {filter.label}
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    typeFilter === filter.value
                      ? "bg-black/20"
                      : "bg-gray-700"
                  }`}>
                    {typeCounts[filter.value as keyof typeof typeCounts]}
                  </span>
                </button>
              ))}
            </div>

            {/* Difficulty Filters */}
            <div className="flex flex-wrap gap-3">
              <span className="text-sm font-bold text-gray-500 uppercase tracking-wider self-center mr-2">
                Level:
              </span>
              {[
                { value: "all", label: "All Levels" },
                { value: "beginner", label: "Beginner" },
                { value: "intermediate", label: "Intermediate" },
                { value: "advanced", label: "Advanced" },
              ].map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setDifficultyFilter(filter.value as DifficultyFilter)}
                  className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${
                    difficultyFilter === filter.value
                      ? "bg-gradient-to-r from-white to-gray-100 text-black shadow-lg"
                      : "bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 hover:border-gray-600"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
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
        <div className="max-w-7xl mx-auto px-8 py-16">
          {/* Results count */}
          {searchQuery && (
            <p className="text-gray-400 mb-6">
              {filteredCourses.length} result{filteredCourses.length !== 1 ? "s" : ""} for "{searchQuery}"
            </p>
          )}

          {filteredCourses.length === 0 ? (
            <div className="text-center text-gray-400 py-16">
              {courses.length === 0 
                ? "No courses available at the moment. Please check back later."
                : searchQuery
                ? `No courses found matching "${searchQuery}". Try a different search.`
                : "No courses found for these filters. Try a different combination."}
            </div>
          ) : (
            <StaggerContainer 
              key={`${typeFilter}-${difficultyFilter}-${searchQuery}-${filteredCourses.length}`}
              className="grid md:grid-cols-3 gap-8"
            >
              {filteredCourses.map((course, index) => (
                <CourseCard
                  key={course.id}
                  course={{
                    ...course,
                    image_url: course.image_url ?? null,
                    thumbnail_url: course.thumbnail_url ?? null,
                    course_type: course.course_type || "course",
                  }}
                  index={index}
                  user={user}
                  onCourseClick={handleCourseClick}
                />
              ))}
            </StaggerContainer>
          )}
        </div>
      )}

      <Footer />
    </div>
  );
}
