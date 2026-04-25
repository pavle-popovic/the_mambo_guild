"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { FaFire, FaBolt } from "react-icons/fa";
import { Star, Crown, Headphones, Video, Radio, ChevronDown, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useEffect, useState, useCallback, useRef } from "react";
import { ClaveWallet } from "./ClaveWallet";
import { WalletModal } from "./WalletModal";
import NotificationBell from "./NotificationBell";
import LocaleSwitcher from "./LocaleSwitcher";
import { BorderFrame } from "./cosmetics/BorderFrame";
import { BORDER_FRAME_SPECS } from "@/lib/borderFrames";
import { useTranslations } from "@/i18n/useTranslations";
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
    equipped_border_sku?: string | null;
    equipped_title_sku?: string | null;
  };
}

export default function NavBar({ user }: NavBarProps) {
  const pathname = usePathname();
  const t = useTranslations('nav');
  const [mounted, setMounted] = useState(false);
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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

  // Close mobile/tablet menu on route change so it doesn't linger after navigation
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Close menu with Escape and when the viewport grows past xl (where centre nav reappears)
  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMobileMenuOpen(false);
    };
    const handleResize = () => {
      if (typeof window !== "undefined" && window.innerWidth >= 1280) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener("keydown", handleKey);
    window.addEventListener("resize", handleResize);
    return () => {
      document.removeEventListener("keydown", handleKey);
      window.removeEventListener("resize", handleResize);
    };
  }, [isMobileMenuOpen]);

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
            "text-sm lg:text-base font-bold transition-colors duration-200 whitespace-nowrap",
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
        <div className="max-w-[1440px] mx-auto px-3 sm:px-4 lg:px-8 py-2 sm:py-3 md:py-5 flex items-center gap-4 sm:gap-8 md:gap-10 lg:gap-14">
          <LogoWrapper
            {...(mounted ? {
              whileHover: { scale: 1.05 },
              transition: { type: "spring", stiffness: 400, damping: 17 }
            } : {})}
          >
            <Link href="/" className="text-xl font-bold tracking-tight flex items-center gap-3 shrink-0">
              <Image
                src="/assets/Logo.png"
                alt="The Mambo Guild"
                width={48}
                height={48}
                className="h-9 sm:h-12 w-auto logo-img"
                style={{ mixBlendMode: "screen" }}
              />
              <span className="font-serif text-sm sm:text-xl">
                <span className="text-gray-400">THE </span>
                <span className="text-[#d4af37] font-bold drop-shadow-[0_0_8px_rgba(212,175,55,0.5)]">MAMBO</span>{" "}
                <span className="text-gray-400">GUILD</span>
              </span>
            </Link>
          </LogoWrapper>

          {/* Center: Navigation Links — only on xl+ so the right-side cluster
              (Studio, Admin, Wallet, Notifications, Avatar) doesn't collide with
              the centre links between ~768–1150px. Below xl, nav links are
              reachable via the hamburger menu. (B3) */}
          <div className="flex-1 hidden xl:flex justify-center gap-6 lg:gap-10 items-center min-w-0 md:ml-8 lg:ml-16">
            <NavLink href="/">{t('home')}</NavLink>
            <NavLink href="/courses" activePaths={["/courses"]}>{t('courses')}</NavLink>
            <NavLink href="/community" activePaths={["/community"]}>{t('community')}</NavLink>
            <NavLink href="/pricing">{t('pricing')}</NavLink>
            <NavLink href="/instructors">{t('instructors')}</NavLink>
            <NavLink href="/blog" activePaths={["/blog", "/what-is-salsa-on2", "/salsa-on1-vs-on2"]}>{t('blog')}</NavLink>
          </div>

          {/* Mobile: Hamburger + minimal icons */}
          <div className="flex md:hidden items-center gap-2 ml-auto">
            <LocaleSwitcher compact hideIcon />
            {isAuthenticated && pathname === "/community" && (
              <ClaveWallet onOpenWallet={() => setIsWalletOpen(true)} />
            )}
            {isAuthenticated && <NotificationBell />}
            {isAuthenticated && (
              <div className="relative w-8 h-8">
                <Link
                  href="/profile"
                  className={cn(
                    "w-8 h-8 rounded-full bg-gray-700 overflow-hidden flex items-center justify-center",
                    "ring-2 ring-transparent"
                  )}
                >
                  {user?.avatar_url ? (
                    <Image src={user.avatar_url} alt="" width={32} height={32} className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-[#FCE205] to-[#D4AF37] flex items-center justify-center text-black text-xs font-bold">
                      {(user?.username?.[0] || user?.first_name?.[0] || "U").toUpperCase()}
                    </div>
                  )}
                </Link>
                {user?.equipped_border_sku && BORDER_FRAME_SPECS[user.equipped_border_sku] && (
                  <BorderFrame sku={user.equipped_border_sku} />
                )}
              </div>
            )}
            <button
              className="p-2 text-gray-300 hover:text-white transition-colors"
              onClick={() => { setIsMobileMenuOpen(!isMobileMenuOpen); UISound.click(); }}
              aria-label={t('toggleMenu')}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Tablet hamburger: between md and xl, the centre nav is hidden, so
              expose a hamburger that opens the existing mobile menu. (B3) */}
          <button
            className="hidden md:flex xl:hidden p-2 text-gray-300 hover:text-white transition-colors mr-1"
            onClick={() => { setIsMobileMenuOpen(!isMobileMenuOpen); UISound.click(); }}
            aria-label={t('toggleNavMenu')}
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          {/* Desktop right-side items */}
          <div className="hidden md:flex gap-2 lg:gap-3 items-center shrink-0">
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
                      {t('studio')}
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
                        className="absolute right-0 mt-2 w-56 sm:w-64 max-w-[calc(100vw-2rem)] rounded-xl bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 shadow-2xl shadow-black/50 overflow-hidden z-50"
                      >
                        <div className="p-2">
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
                                <span className="text-sm font-semibold text-white">{t('coachingShort')}</span>
                                {!isGuildMaster && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold">{t('lockedTag')}</span>
                                )}
                              </div>
                              <p className="text-xs text-gray-400">{t('coachingSubtitle')}</p>
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
                                <span className="text-sm font-semibold text-white">{t('roundtableShort')}</span>
                                {!isGuildMaster && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold">{t('lockedTag')}</span>
                                )}
                              </div>
                              <p className="text-xs text-gray-400">{t('roundtableSubtitle')}</p>
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
                              <span className="text-xs font-semibold text-amber-300">{t('guildMasterAccess')}</span>
                            </div>
                          ) : (
                            <Link
                              href="/pricing"
                              onClick={() => setIsStudioOpen(false)}
                              className="flex items-center justify-between group"
                            >
                              <span className="text-xs text-gray-400">{t('unlockAllFeatures')}</span>
                              <span className="text-xs font-bold text-amber-400 group-hover:text-amber-300 transition-colors">
                                {t('upgrade')} →
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
                    <span className="text-xs font-bold text-red-300">{t('admin')}</span>
                  </Link>
                )}

                {/* Notification Bell */}
                <NotificationBell />

                {/* Profile Avatar */}
                <MotionDiv
                  {...(mounted ? {
                    whileHover: { scale: 1.1 },
                    whileTap: { scale: 0.95 },
                    transition: { type: "spring", stiffness: 400, damping: 17 }
                  } : {})}
                  onMouseEnter={handleNavHover}
                  className="relative w-10 h-10"
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
                  {user.equipped_border_sku && BORDER_FRAME_SPECS[user.equipped_border_sku] && (
                    <BorderFrame sku={user.equipped_border_sku} />
                  )}
                </MotionDiv>

                {/* Language Switcher - far right */}
                <LocaleSwitcher compact />
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
                    {t('login')}
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
                    {t('signup')}
                  </Link>
                </MotionDiv>

                {/* Language Switcher - far right */}
                <LocaleSwitcher compact />
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu Panel */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="xl:hidden overflow-hidden border-t border-white/10 bg-black/95 backdrop-blur-xl"
            >
              <div className="flex flex-col px-4 py-4 gap-1">
                {/* Nav Links */}
                {[
                  { href: "/", label: t('home') },
                  { href: "/courses", label: t('courses') },
                  { href: "/community", label: t('community') },
                  { href: "/pricing", label: t('pricing') },
                  { href: "/instructors", label: "Instructors" },
                  { href: "/blog", label: "Blog" },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "px-4 py-3 rounded-lg text-base font-bold transition-colors",
                      pathname === item.href ? "text-[#D4AF37] bg-white/5" : "text-gray-300 hover:text-white hover:bg-white/5"
                    )}
                  >
                    {item.label}
                  </Link>
                ))}

                {/* Divider */}
                <div className="h-px bg-white/10 my-2" />

                {isAuthenticated ? (
                  <>
                    {/* Studio Links */}
                    <Link href="/studio/coaching" onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 font-semibold flex items-center gap-2">
                      <Video size={16} /> Coaching Corner
                      {!isGuildMaster && <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold">LOCKED</span>}
                    </Link>
                    <Link href="/studio/roundtable" onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 font-semibold flex items-center gap-2">
                      <Radio size={16} /> The Roundtable
                      {!isGuildMaster && <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold">LOCKED</span>}
                    </Link>

                    {user?.role?.toLowerCase() === "admin" && (
                      <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-3 rounded-lg text-red-300 hover:text-red-200 hover:bg-red-500/10 font-bold">
                        Admin
                      </Link>
                    )}


                  </>
                ) : (
                  <>
                    <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="mx-4 mt-2 py-3 bg-[linear-gradient(135deg,#FCE205_0%,#D4AF37_100%)] text-black rounded-full text-center font-bold shadow-lg shadow-[0_0_20px_rgba(252,226,5,0.4)] ring-2 ring-amber-400/50">
                      {t('login')}
                    </Link>

                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Wallet Modal - Rendered outside nav to avoid stacking context issues */}
      <WalletModal isOpen={isWalletOpen} onClose={() => setIsWalletOpen(false)} />
    </>
  );
}

