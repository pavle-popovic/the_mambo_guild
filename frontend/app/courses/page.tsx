"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api";
import { StaggerContainer, Clickable } from "@/components/ui/motion";
import { FadeIn } from "@/components/ui/motion";
import CourseCard from "@/components/CourseCard";
import { ReleaseScheduleButton } from "@/components/landing";
import { FaSearch, FaTimes } from "react-icons/fa";
import { ChevronDown } from "lucide-react";
import { useTranslations } from "@/i18n/useTranslations";

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
  const tCourses = useTranslations('courses');
  const tCommon = useTranslations('common');
  const [courses, setCourses] = useState<Course[]>([]);
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
  const [levelDropdownOpen, setLevelDropdownOpen] = useState(false);
  const typeDropdownRef = useRef<HTMLDivElement>(null);
  const levelDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(e.target as Node)) setTypeDropdownOpen(false);
      if (levelDropdownRef.current && !levelDropdownRef.current.contains(e.target as Node)) setLevelDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

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
        <div className="sticky top-0 z-40 w-full bg-black/60 backdrop-blur-xl border-b border-white/10 pt-20 sm:pt-24 pb-3 sm:pb-4 transition-all duration-300">
          <div className="max-w-[1600px] mx-auto px-3 sm:px-6">

            {/* Mobile: Search + filter dropdowns */}
            <div className="flex sm:hidden flex-col gap-2 w-full">
              {/* Release Calendar pill */}
              <div className="flex justify-center">
                <ReleaseScheduleButton />
              </div>
              {/* Search */}
              <div className="relative group">
                <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-mambo-gold transition-colors text-sm" />
                <input
                  type="text"
                  placeholder={tCourses('searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl pl-10 pr-8 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-mambo-gold/40 focus:bg-white/[0.06] transition-all"
                />
                {searchQuery && (
                  <button onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                    <FaTimes className="text-xs" />
                  </button>
                )}
              </div>

              {/* Filter dropdowns row */}
              <div className="flex gap-2">
                {/* Class Type dropdown */}
                <div className="relative flex-1" ref={typeDropdownRef}>
                  <button
                    onClick={() => { setTypeDropdownOpen(!typeDropdownOpen); setLevelDropdownOpen(false); }}
                    className={`w-full border rounded-xl pl-3 pt-5 pb-1.5 pr-7 text-left focus:outline-none transition-all relative ${
                      typeFilter !== 'all'
                        ? 'bg-purple-500/10 border-purple-500/40'
                        : 'bg-white/[0.04] border-white/10'
                    } ${typeDropdownOpen ? 'border-purple-400/60 bg-white/[0.08]' : ''}`}
                  >
                    <span className="absolute left-3 top-1.5 text-[9px] uppercase tracking-widest text-gray-500 font-semibold">Type</span>
                    <span className={`text-[11px] font-bold ${typeFilter !== 'all' ? 'text-purple-300' : 'text-white'}`}>
                      {({ all: 'All Classes', course: 'Courses', choreo: 'Choreos', topic: 'Topics' } as Record<string, string>)[typeFilter]}
                    </span>
                    <ChevronDown className={`absolute right-2 bottom-2.5 w-3 h-3 transition-transform ${typeDropdownOpen ? 'rotate-180' : ''} ${typeFilter !== 'all' ? 'text-purple-400' : 'text-gray-500'}`} />
                  </button>
                  {typeDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-gray-900/90 backdrop-blur-xl border border-white/15 rounded-xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
                      {([['all', 'All Classes'], ['course', 'Courses'], ['choreo', 'Choreos'], ['topic', 'Topics']] as const).map(([val, label]) => (
                        <button
                          key={val}
                          onClick={() => { setTypeFilter(val as TypeFilter); setTypeDropdownOpen(false); }}
                          className={`w-full px-3 py-2.5 text-left text-[12px] font-semibold transition-all ${
                            typeFilter === val
                              ? 'bg-purple-500/20 text-purple-300'
                              : 'text-gray-300 hover:bg-white/[0.08] hover:text-white active:bg-white/[0.12]'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Level dropdown */}
                <div className="relative flex-1" ref={levelDropdownRef}>
                  <button
                    onClick={() => { setLevelDropdownOpen(!levelDropdownOpen); setTypeDropdownOpen(false); }}
                    className={`w-full border rounded-xl pl-3 pt-5 pb-1.5 pr-7 text-left focus:outline-none transition-all relative ${
                      difficultyFilter !== 'all'
                        ? 'bg-amber-500/10 border-amber-500/40'
                        : 'bg-white/[0.04] border-white/10'
                    } ${levelDropdownOpen ? 'border-amber-400/60 bg-white/[0.08]' : ''}`}
                  >
                    <span className="absolute left-3 top-1.5 text-[9px] uppercase tracking-widest text-gray-500 font-semibold">Level</span>
                    <span className={`text-[11px] font-bold ${difficultyFilter !== 'all' ? 'text-amber-300' : 'text-white'}`}>
                      {({ all: 'All Levels', beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' } as Record<string, string>)[difficultyFilter]}
                    </span>
                    <ChevronDown className={`absolute right-2 bottom-2.5 w-3 h-3 transition-transform ${levelDropdownOpen ? 'rotate-180' : ''} ${difficultyFilter !== 'all' ? 'text-amber-400' : 'text-gray-500'}`} />
                  </button>
                  {levelDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-gray-900/90 backdrop-blur-xl border border-white/15 rounded-xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
                      {([['all', 'All Levels'], ['beginner', 'Beginner'], ['intermediate', 'Intermediate'], ['advanced', 'Advanced']] as const).map(([val, label]) => (
                        <button
                          key={val}
                          onClick={() => { setDifficultyFilter(val as DifficultyFilter); setLevelDropdownOpen(false); }}
                          className={`w-full px-3 py-2.5 text-left text-[12px] font-semibold transition-all ${
                            difficultyFilter === val
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'text-gray-300 hover:bg-white/[0.08] hover:text-white active:bg-white/[0.12]'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Desktop: Original pill layout + release calendar pinned right */}
            <div className="hidden sm:flex items-center gap-3 w-full">
              <div className="flex items-center gap-3 flex-1 min-w-0 overflow-x-auto no-scrollbar pb-0">
                {/* Search Pill */}
                <div className="relative group min-w-[200px]">
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-mambo-gold transition-colors text-sm" />
                  <input
                    type="text"
                    placeholder={tCourses('searchPlaceholder')}
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
                  {[{ v: 'all', l: tCourses('filterAll') }, { v: 'course', l: tCourses('filterCourses') }, { v: 'choreo', l: tCourses('filterChoreo') }, { v: 'topic', l: tCourses('filterTopics') }].map(f => (
                    <button
                      key={f.v}
                      onClick={() => setTypeFilter(f.v as TypeFilter)}
                      className={`px-5 py-2 rounded-full text-sm font-bold transition-all border whitespace-nowrap ${typeFilter === f.v ? 'border-purple-500 bg-purple-500/20 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.3)]' : 'text-gray-400 border-transparent hover:text-white hover:bg-white/5'}`}
                    >
                      {f.l}
                    </button>
                  ))}
                </div>

                {/* Level Filter Pills */}
                <div className="flex bg-black/30 rounded-full p-1 border border-white/10">
                  {[{ v: 'all', l: tCourses('difficultyAll') }, { v: 'beginner', l: tCourses('difficultyBeginner') }, { v: 'intermediate', l: tCourses('difficultyIntermediate') }, { v: 'advanced', l: tCourses('difficultyAdvanced') }].map(f => (
                    <button
                      key={f.v}
                      onClick={() => setDifficultyFilter(f.v as DifficultyFilter)}
                      className={`px-5 py-2 rounded-full text-sm font-bold transition-all border whitespace-nowrap ${difficultyFilter === f.v ? 'bg-[#fbbf24] text-black border-[#fbbf24] shadow-[0_0_15px_rgba(251,191,36,0.4)]' : 'text-gray-400 border-transparent hover:text-white hover:bg-white/5'}`}
                    >
                      {f.l}
                    </button>
                  ))}
                </div>
              </div>

              {/* Release Calendar — pinned right, outside scroll so popover isn't clipped */}
              <div className="flex-shrink-0">
                <ReleaseScheduleButton />
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid Content */}
        <div className="max-w-[1600px] mx-auto px-3 sm:px-6 py-3 sm:py-8">
          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin w-8 h-8 border-2 border-mambo-gold border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-gray-400">{tCommon('loading')}</p>
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10">
              <p className="text-xl text-gray-300 font-serif mb-2">{tCourses('noResults')}</p>
              <p className="text-gray-500 text-sm">{tCourses('noResults')}</p>
              <button onClick={() => { setSearchQuery(''); setTypeFilter('all'); setDifficultyFilter('all'); }} className="mt-6 px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full text-sm font-bold transition-colors">
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
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
