"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { FaFire, FaBolt } from "react-icons/fa";
import { Star, Crown, Headphones, Video, Radio, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useEffect, useState, useCallback, useRef } from "react";
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
    tier?: string;
    role?: string;
  };
}

export default function NavBar({ user }: NavBarProps) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const studioDropdownRef = useRef<HTMLDivElement>(null);
  const isAuthenticated = !!user;
  const isGuildMaster = user?.tier?.toLowerCase() === "performer";

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (studioDropdownRef.current && !studioDropdownRef.current.contains(event.target as Node)) {
        setIsStudioOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
            "text-lg font-bold transition-colors duration-200",
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
        <div className="max-w-7xl mx-auto px-8 py-5 flex justify-between items-center relative">
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

          {/* Center: Navigation Links */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:flex gap-10 items-center">
            <NavLink href="/">Home</NavLink>
            <NavLink href="/courses" activePaths={["/courses"]}>Courses</NavLink>
            <NavLink href="/community" activePaths={["/community"]}>Community</NavLink>
            <NavLink href="/pricing">Pricing</NavLink>
            <NavLink href="/instructors">Instructors</NavLink>
          </div>

          <div className="flex gap-4 items-center">
            {isAuthenticated ? (
              <>
                {/* Clave Wallet (v4.0) - Only show on Community page */}
                {pathname === "/community" && (
                  <ClaveWallet
                    onOpenWallet={() => setIsWalletOpen(true)}
                    className="hidden md:flex"
                  />
                )}

                {/* Studio Dropdown - Available to all authenticated users */}
                <div className="relative hidden md:block" ref={studioDropdownRef}>
                  <button
                    onClick={() => {
                      setIsStudioOpen(!isStudioOpen);
                      UISound.click();
                    }}
                    onMouseEnter={handleNavHover}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all",
                      isGuildMaster
                        ? "bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-400/30 hover:from-amber-500/30 hover:to-yellow-500/30"
                        : "bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border border-purple-400/30 hover:from-purple-500/30 hover:to-indigo-500/30",
                      isStudioOpen && "ring-2 ring-white/20"
                    )}
                  >
                    {isGuildMaster ? (
                      <Crown size={14} className="text-amber-400" />
                    ) : (
                      <Star size={14} className="text-purple-400" />
                    )}
                    <span className={cn(
                      "text-xs font-bold",
                      isGuildMaster ? "text-amber-300" : "text-purple-300"
                    )}>
                      Studio
                    </span>
                    <ChevronDown 
                      size={12} 
                      className={cn(
                        "transition-transform duration-200",
                        isGuildMaster ? "text-amber-400" : "text-purple-400",
                        isStudioOpen && "rotate-180"
                      )} 
                    />
                  </button>

                  {/* Studio Dropdown Menu */}
                  <AnimatePresence>
                    {isStudioOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="absolute right-0 mt-2 w-64 rounded-xl bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 shadow-2xl shadow-black/50 overflow-hidden z-50"
                      >
                        <div className="p-2">
                          {/* DJ Booth */}
                          <Link
                            href="/studio/dj-booth"
                            onClick={() => setIsStudioOpen(false)}
                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors group"
                          >
                            <div className={cn(
                              "w-10 h-10 rounded-lg flex items-center justify-center",
                              isGuildMaster 
                                ? "bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-400/30"
                                : "bg-gray-800 border border-gray-700"
                            )}>
                              <Headphones size={18} className={isGuildMaster ? "text-cyan-400" : "text-gray-500"} />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-white">DJ Booth</span>
                                {!isGuildMaster && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold">LOCKED</span>
                                )}
                              </div>
                              <p className="text-xs text-gray-400">Practice tools & mixer</p>
                            </div>
                          </Link>

                          {/* Coaching Corner */}
                          <Link
                            href="/studio/coaching"
                            onClick={() => setIsStudioOpen(false)}
                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors group"
                          >
                            <div className={cn(
                              "w-10 h-10 rounded-lg flex items-center justify-center",
                              isGuildMaster 
                                ? "bg-gradient-to-br from-pink-500/20 to-rose-500/20 border border-pink-400/30"
                                : "bg-gray-800 border border-gray-700"
                            )}>
                              <Video size={18} className={isGuildMaster ? "text-pink-400" : "text-gray-500"} />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-white">Coaching Corner</span>
                                {!isGuildMaster && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold">LOCKED</span>
                                )}
                              </div>
                              <p className="text-xs text-gray-400">1-on-1 video feedback</p>
                            </div>
                          </Link>

                          {/* Roundtable */}
                          <Link
                            href="/studio/roundtable"
                            onClick={() => setIsStudioOpen(false)}
                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors group"
                          >
                            <div className={cn(
                              "w-10 h-10 rounded-lg flex items-center justify-center",
                              isGuildMaster 
                                ? "bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-400/30"
                                : "bg-gray-800 border border-gray-700"
                            )}>
                              <Radio size={18} className={isGuildMaster ? "text-red-400" : "text-gray-500"} />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-white">The Roundtable</span>
                                {!isGuildMaster && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold">LOCKED</span>
                                )}
                              </div>
                              <p className="text-xs text-gray-400">Live calls & archives</p>
                            </div>
                          </Link>
                        </div>

                        {/* Guild Master Status */}
                        <div className={cn(
                          "px-4 py-3 border-t",
                          isGuildMaster 
                            ? "border-amber-500/20 bg-gradient-to-r from-amber-500/10 to-transparent"
                            : "border-gray-700/50 bg-gray-800/50"
                        )}>
                          {isGuildMaster ? (
                            <div className="flex items-center gap-2">
                              <Crown size={14} className="text-amber-400" />
                              <span className="text-xs font-semibold text-amber-300">Guild Master Access</span>
                            </div>
                          ) : (
                            <Link 
                              href="/pricing"
                              onClick={() => setIsStudioOpen(false)}
                              className="flex items-center justify-between group"
                            >
                              <span className="text-xs text-gray-400">Unlock all features</span>
                              <span className="text-xs font-bold text-amber-400 group-hover:text-amber-300 transition-colors">
                                Upgrade →
                              </span>
                            </Link>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Admin Link */}
                {user.role?.toLowerCase() === "admin" && (
                  <Link
                    href="/admin"
                    className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/20 border border-red-400/30 hover:bg-red-500/30 transition-all"
                    onMouseEnter={handleNavHover}
                  >
                    <span className="text-xs font-bold text-red-300">Admin</span>
                  </Link>
                )}

                {/* Profile Avatar */}
                <MotionDiv
                  {...(mounted ? {
                    whileHover: { scale: 1.1 },
                    whileTap: { scale: 0.95 },
                    transition: { type: "spring", stiffness: 400, damping: 17 }
                  } : {})}
                  onMouseEnter={handleNavHover}
                >
                  <Link 
                    href="/profile" 
                    className={cn(
                      "w-10 h-10 rounded-full bg-gray-700 overflow-hidden transition-all flex items-center justify-center",
                      user.tier?.toLowerCase() === "performer" 
                        ? "ring-2 ring-amber-400/50 hover:ring-amber-400"
                        : user.tier?.toLowerCase() === "advanced"
                        ? "ring-2 ring-blue-400/50 hover:ring-blue-400"
                        : "ring-2 ring-transparent hover:ring-[rgba(212,175,55,0.5)]"
                    )}
                  >
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
                    className="px-6 py-2.5 text-base font-bold text-gray-300 transition-colors"
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
                    className="px-6 py-2.5 bg-[linear-gradient(135deg,#FCE205_0%,#D4AF37_100%)] text-black rounded-full text-base font-bold shadow-lg shadow-[rgba(212,175,55,0.3)]"
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

