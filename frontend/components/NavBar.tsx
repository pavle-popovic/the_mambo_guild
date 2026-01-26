"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { FaFire, FaBolt } from "react-icons/fa";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useEffect, useState, useCallback } from "react";
import { ClaveWallet } from "./ClaveWallet";
import { WalletModal } from "./WalletModal";
import { UISound } from "@/hooks/useUISound";

interface NavBarProps {
  user?: {
    first_name?: string;
    last_name?: string;
    username?: string | null;
    xp?: number;
    level?: number;
    streak_count?: number;
    avatar_url?: string | null;
  };
}

export default function NavBar({ user }: NavBarProps) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const isAuthenticated = !!user;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Palladium Era: Brass nav links with center-expanding underline
  const handleNavHover = useCallback(() => {
    UISound.hover();
  }, []);

  const NavLink = ({ href, children, activePaths }: { href: string; children: React.ReactNode; activePaths?: string[] }) => {
    const isActive = mounted && (pathname === href || activePaths?.some(path => pathname?.startsWith(path)));

    return (
      <Link href={href} className="relative group" onMouseEnter={handleNavHover}>
        <motion.span
          className={cn(
            "text-sm font-medium transition-colors duration-200",
            isActive ? "text-[#D4AF37]" : "text-gray-300"
          )}
          whileHover={{ color: "#D4AF37" }}
          transition={{ duration: 0.2 }}
        >
          {children}
        </motion.span>
        {/* Active indicator - Brass underline */}
        {mounted && isActive && (
          <motion.div
            className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-[#FCE205] via-[#D4AF37] to-[#B8860B] rounded-full"
            layoutId="navbar-indicator"
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          />
        )}
        {/* Hover underline - expands from center */}
        {mounted && !isActive && (
          <motion.div
            className="absolute -bottom-1 left-1/2 h-0.5 bg-gradient-to-r from-[#FCE205] via-[#D4AF37] to-[#B8860B] rounded-full origin-center"
            initial={{ width: 0, x: 0 }}
            whileHover={{ width: "100%", x: "-50%" }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          />
        )}
      </Link>
    );
  };

  const LogoWrapper = mounted ? motion.div : "div";
  const MotionDiv = mounted ? motion.div : "div";

  return (
    <>
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
                alt="The Mambo Guild"
                width={48}
                height={48}
                className="h-12 w-auto logo-img"
                style={{ mixBlendMode: "screen" }}
              />
              <span className="font-serif text-xl">
                <span className="text-gray-400">THE</span>{" "}
                <span className="text-[#d4af37] font-bold drop-shadow-[0_0_8px_rgba(212,175,55,0.5)]">MAMBO</span>{" "}
                <span className="text-gray-400">GUILD</span>
              </span>
            </Link>
          </LogoWrapper>

          <div className="hidden md:flex gap-10 items-center">
            <NavLink href="/">Home</NavLink>
            <NavLink href="/courses" activePaths={["/courses"]}>Courses</NavLink>
            <NavLink href="/community" activePaths={["/community"]}>Community</NavLink>
            <NavLink href="/pricing">Pricing</NavLink>
            <NavLink href="/instructors">Instructors</NavLink>
          </div>

          <div className="flex gap-4 items-center">
            {isAuthenticated ? (
              <>
                {/* Clave Wallet (v4.0) */}
                <ClaveWallet
                  onOpenWallet={() => setIsWalletOpen(true)}
                  className="hidden md:flex"
                />

                {/* XP Display - Palladium Era */}
                <MotionDiv
                  className="hidden md:flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm border border-[rgba(212,175,55,0.2)]"
                  {...(mounted ? {
                    whileHover: { scale: 1.05, borderColor: "rgba(212, 175, 55, 0.5)", boxShadow: "0 4px 20px rgba(212, 175, 55, 0.2)" },
                    transition: { type: "spring", stiffness: 400, damping: 17 }
                  } : {})}
                  onMouseEnter={handleNavHover}
                >
                  <FaBolt className="text-[#D4AF37]" />
                  <span className="font-bold text-mambo-text">{user.xp || 0} XP</span>
                </MotionDiv>

                {/* Streak Display - Electric Teal accent for active streaks */}
                {user.streak_count && user.streak_count > 0 && (
                  <MotionDiv
                    className="hidden md:flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm border border-[rgba(0,224,255,0.2)]"
                    {...(mounted ? {
                      whileHover: { scale: 1.05, borderColor: "rgba(0, 224, 255, 0.5)", boxShadow: "0 4px 20px rgba(0, 224, 255, 0.2)" },
                      transition: { type: "spring", stiffness: 400, damping: 17 }
                    } : {})}
                    onMouseEnter={handleNavHover}
                  >
                    <FaFire className="text-[#00E0FF]" />
                    <span className="font-bold text-mambo-text">{user.streak_count} Days</span>
                  </MotionDiv>
                )}

                {/* User Avatar - Palladium Era */}
                <MotionDiv
                  {...(mounted ? {
                    whileHover: { scale: 1.1 },
                    whileTap: { scale: 0.95 },
                    transition: { type: "spring", stiffness: 400, damping: 17 }
                  } : {})}
                  onMouseEnter={handleNavHover}
                >
                  <Link href="/profile" className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden ring-2 ring-transparent hover:ring-[rgba(212,175,55,0.5)] transition-all flex items-center justify-center">
                    {user.avatar_url ? (
                      <Image
                        src={user.avatar_url}
                        alt={user.username || `${user.first_name} ${user.last_name}`}
                        width={40}
                        height={40}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-[#FCE205] to-[#D4AF37] flex items-center justify-center text-black text-xs font-bold">
                        {(user.username?.[0] || user.first_name?.[0] || "U").toUpperCase()}
                      </div>
                    )}
                  </Link>
                </MotionDiv>
              </>
            ) : (
              <>
                <motion.div
                  onMouseEnter={handleNavHover}
                  whileHover={{ color: "#D4AF37" }}
                >
                  <Link
                    href="/login"
                    className="px-5 py-2 text-sm font-semibold text-gray-300 transition-colors"
                  >
                    Log In
                  </Link>
                </motion.div>
                <MotionDiv
                  {...(mounted ? {
                    whileHover: { scale: 1.05, boxShadow: "0 8px 30px rgba(212, 175, 55, 0.4)" },
                    whileTap: { scale: 0.95 },
                    transition: { type: "spring", stiffness: 400, damping: 17 }
                  } : {})}
                  onMouseEnter={handleNavHover}
                  onClick={() => UISound.click()}
                >
                  <Link
                    href="/register"
                    className="px-5 py-2 bg-[linear-gradient(135deg,#FCE205_0%,#D4AF37_100%)] text-black rounded-full text-sm font-bold shadow-lg shadow-[rgba(212,175,55,0.3)]"
                  >
                    Register
                  </Link>
                </MotionDiv>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Wallet Modal - Rendered outside nav to avoid stacking context issues */}
      <WalletModal isOpen={isWalletOpen} onClose={() => setIsWalletOpen(false)} />
    </>
  );
}

