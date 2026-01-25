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

type DifficultyFilter = "all" | "beginner" | "intermediate" | "advanced" | "open";
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
    <div className="min-h-screen bg-transparent">
      <NavBar user={user || undefined} />

      <div className="relative min-h-screen">
        {/* Sticky Header Control Bar */}
        <div className="sticky top-0 z-40 w-full bg-black/60 backdrop-blur-xl border-b border-white/10 pt-24 pb-4 transition-all duration-300">
          <div className="max-w-[1600px] mx-auto px-6 flex flex-col md:flex-row items-center gap-10">
            {/* Title & Stats */}
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-serif font-bold text-mambo-gold tracking-tight">Explore Courses</h1>
              <div className="hidden md:flex items-center gap-2 text-sm text-gray-400 border-l border-white/10 pl-4">
                <span className="font-bold text-white">{filteredCourses.length}</span>
                <span>titles available</span>
              </div>
            </div>

            {/* Controls: Search + Filters */}
            <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 no-scrollbar">

              {/* Search Pill */}
              <div className="relative group min-w-[200px]">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-mambo-gold transition-colors text-sm" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/20 rounded-full pl-9 pr-8 py-2.5 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-mambo-gold/50 focus:bg-black/40 transition-all font-medium"
                />
                {searchQuery && (
                  <button onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                    <FaTimes className="text-xs" />
                  </button>
                )}
              </div>

              <div className="h-6 w-px bg-white/10 mx-1 hidden md:block" />

              {/* Type Filter Pills */}
              <div className="flex bg-black/30 rounded-full p-1 border border-white/10">
                {[{ v: 'all', l: 'All' }, { v: 'course', l: 'Courses' }, { v: 'choreo', l: 'Choreo' }, { v: 'topic', l: 'Topics' }].map(f => (
                  <button
                    key={f.v}
                    onClick={() => setTypeFilter(f.v as TypeFilter)}
                    className={`px-5 py-2 rounded-full text-sm font-bold transition-all border ${typeFilter === f.v ? 'bg-white/20 text-white border-white/40 shadow-sm' : 'text-gray-400 border-transparent hover:text-white hover:bg-white/5'}`}
                  >
                    {f.l}
                  </button>
                ))}
              </div>

              {/* Level Filter Dropdown Style Pill */}
              <div className="flex bg-black/30 rounded-full p-1 border border-white/10">
                {[{ v: 'all', l: 'All Levels' }, { v: 'beginner', l: 'Beg' }, { v: 'intermediate', l: 'Int' }, { v: 'advanced', l: 'Adv' }, { v: 'open', l: 'Open' }].map(f => (
                  <button
                    key={f.v}
                    onClick={() => setDifficultyFilter(f.v as DifficultyFilter)}
                    className={`px-5 py-2 rounded-full text-sm font-bold transition-all border ${difficultyFilter === f.v ? 'bg-[#fbbf24] text-black border-[#fbbf24] shadow-[0_0_15px_rgba(251,191,36,0.4)]' : 'text-gray-400 border-transparent hover:text-white hover:bg-white/5'}`}
                  >
                    {f.l}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid Content */}
        <div className="max-w-[1600px] mx-auto px-6 py-8">
          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin w-8 h-8 border-2 border-mambo-gold border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-gray-400">Loading library...</p>
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10">
              <p className="text-xl text-gray-300 font-serif mb-2">No courses found</p>
              <p className="text-gray-500 text-sm">Try adjusting your search or filters to find what you're looking for.</p>
              <button onClick={() => { setSearchQuery(''); setTypeFilter('all'); setDifficultyFilter('all'); }} className="mt-6 px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full text-sm font-bold transition-colors">
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
