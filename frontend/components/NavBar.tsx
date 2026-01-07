"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { FaFire, FaBolt } from "react-icons/fa";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

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
  const [mounted, setMounted] = useState(false);
  const isAuthenticated = !!user;

  useEffect(() => {
    setMounted(true);
  }, []);

  const NavLink = ({ href, children, activePaths }: { href: string; children: React.ReactNode; activePaths?: string[] }) => {
    const isActive = mounted && (pathname === href || activePaths?.some(path => pathname?.startsWith(path)));
    
    return (
      <Link href={href} className="relative group">
        <span className={cn(
          "text-sm font-medium transition-colors duration-300",
          isActive ? "text-mambo-text" : "text-gray-300 hover:text-mambo-text"
        )}>
          {children}
        </span>
        {mounted && isActive && (
          <motion.div
            className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-mambo-blue via-blue-400 to-purple-500 rounded-full"
            layoutId="navbar-indicator"
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
          />
        )}
        {mounted && (
          <motion.div
            className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-mambo-blue/50 via-blue-400/50 to-purple-500/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ scaleX: isActive ? 1 : 0 }}
            whileHover={{ scaleX: 1 }}
          />
        )}
      </Link>
    );
  };

  const LogoWrapper = mounted ? motion.div : "div";
  const MotionDiv = mounted ? motion.div : "div";

  return (
    <nav className="fixed w-full z-50 glass-nav transition-all duration-300" suppressHydrationWarning>
      <div className="max-w-7xl mx-auto px-8 py-5 flex justify-between items-center">
        <LogoWrapper
          {...(mounted ? {
            whileHover: { scale: 1.05 },
            transition: { type: "spring", stiffness: 400, damping: 17 }
          } : {})}
        >
        <Link href="/" className="text-xl font-bold tracking-tight flex items-center gap-3">
          <Image
            src="/assets/Logo.png"
            alt="The Mambo Inn"
            width={48}
            height={48}
            className="h-12 w-auto logo-img"
            style={{ mixBlendMode: "screen" }}
          />
          <span className="font-serif text-xl">
            <span className="text-gray-400">THE</span>{" "}
            <span className="text-[#d4af37] font-bold drop-shadow-[0_0_8px_rgba(212,175,55,0.5)]">MAMBO</span>{" "}
            <span className="text-gray-400">INN</span>
          </span>
        </Link>
        </LogoWrapper>

        <div className="hidden md:flex gap-10 items-center">
          <NavLink href="/">Home</NavLink>
          <NavLink href="/courses" activePaths={["/courses"]}>Courses</NavLink>
          <NavLink href="/pricing">Pricing</NavLink>
          <NavLink href="/instructors">Instructors</NavLink>
        </div>

        <div className="flex gap-4 items-center">
          {isAuthenticated ? (
            <>
              {/* XP Display */}
              <MotionDiv 
                className="hidden md:flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-mambo-panel/50 backdrop-blur-sm border border-mambo-blue/20"
                {...(mounted ? {
                  whileHover: { scale: 1.05, borderColor: "rgba(59, 130, 246, 0.4)" },
                  transition: { type: "spring", stiffness: 400, damping: 17 }
                } : {})}
              >
                <FaBolt className="text-mambo-gold" />
                <span className="font-bold text-mambo-text">{user.xp || 0} XP</span>
              </MotionDiv>

              {/* Streak Display */}
              {user.streak_count && user.streak_count > 0 && (
                <MotionDiv 
                  className="hidden md:flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-mambo-panel/50 backdrop-blur-sm border border-orange-500/20"
                  {...(mounted ? {
                    whileHover: { scale: 1.05, borderColor: "rgba(249, 115, 22, 0.4)" },
                    transition: { type: "spring", stiffness: 400, damping: 17 }
                  } : {})}
                >
                  <FaFire className="text-orange-500" />
                  <span className="font-bold text-mambo-text">{user.streak_count} Days</span>
                </MotionDiv>
              )}

              {/* User Avatar */}
              <MotionDiv {...(mounted ? { whileHover: { scale: 1.1 }, whileTap: { scale: 0.95 } } : {})}>
                <Link href="/profile" className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden ring-2 ring-transparent hover:ring-mambo-blue/50 transition-all flex items-center justify-center">
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
                    {(user.first_name?.[0] || "U").toUpperCase()}
                  </div>
                )}
              </Link>
              </MotionDiv>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="px-5 py-2 text-sm font-semibold hover:text-mambo-text text-gray-300 transition-colors"
              >
                Log In
              </Link>
              <MotionDiv {...(mounted ? { whileHover: { scale: 1.05 }, whileTap: { scale: 0.95 } } : {})}>
              <Link
                href="/register"
                  className="px-5 py-2 bg-gradient-to-r from-white to-gray-100 text-black rounded-full text-sm font-bold hover:from-gray-100 hover:to-gray-200 transition-all shadow-lg shadow-white/10"
              >
                Register
              </Link>
              </MotionDiv>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

