"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { FaFire, FaBolt } from "react-icons/fa";

interface NavBarProps {
  user?: {
    first_name?: string;
    last_name?: string;
    xp?: number;
    level?: number;
    streak_count?: number;
    avatar_url?: string | null;
  };
}

export default function NavBar({ user }: NavBarProps) {
  const pathname = usePathname();
  const isAuthenticated = !!user;

  return (
    <nav className="fixed w-full z-50 glass-nav transition-all duration-300">
      <div className="max-w-7xl mx-auto px-8 py-5 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold tracking-tight">
          <span className="text-mambo-text">THE MAMBO INN</span>
        </Link>

        <div className="hidden md:flex gap-10 text-sm font-medium text-gray-300">
          <Link
            href="/"
            className={`hover:text-mambo-text transition ${
              pathname === "/" ? "text-mambo-text" : ""
            }`}
          >
            Home
          </Link>
          <Link
            href="/courses"
            className={`hover:text-mambo-text transition ${
              pathname === "/courses" || pathname?.startsWith("/courses/") ? "text-mambo-text" : ""
            }`}
          >
            Courses
          </Link>
          <Link
            href="/pricing"
            className={`hover:text-mambo-text transition ${
              pathname === "/pricing" ? "text-mambo-text" : ""
            }`}
          >
            Pricing
          </Link>
          <Link
            href="/instructors"
            className={`hover:text-mambo-text transition ${
              pathname === "/instructors" ? "text-mambo-text" : ""
            }`}
          >
            Instructors
          </Link>
        </div>

        <div className="flex gap-4 items-center">
          {isAuthenticated ? (
            <>
              {/* XP Display */}
              <div className="hidden md:flex items-center gap-2 text-xs">
                <FaBolt className="text-mambo-gold" />
                <span className="font-bold text-mambo-text">{user.xp || 0} XP</span>
              </div>

              {/* Streak Display */}
              {user.streak_count && user.streak_count > 0 && (
                <div className="hidden md:flex items-center gap-2 text-xs">
                  <FaFire className="text-orange-500" />
                  <span className="font-bold text-mambo-text">{user.streak_count} Days</span>
                </div>
              )}

              {/* User Avatar */}
              <Link href="/profile" className="w-8 h-8 rounded-full bg-gray-700 overflow-hidden">
                {user.avatar_url ? (
                  <Image
                    src={user.avatar_url}
                    alt={`${user.first_name} ${user.last_name}`}
                    width={32}
                    height={32}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-mambo-blue flex items-center justify-center text-white text-xs font-bold">
                    {(user.first_name?.[0] || "U").toUpperCase()}
                  </div>
                )}
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="px-5 py-2 text-sm font-semibold hover:text-mambo-text text-gray-300"
              >
                Log In
              </Link>
              <Link
                href="/register"
                className="px-5 py-2 bg-white text-black rounded-full text-sm font-bold hover:bg-gray-200 transition"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

