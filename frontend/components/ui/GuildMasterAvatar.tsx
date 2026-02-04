"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import GuildMasterBadge from "./GuildMasterBadge";

interface GuildMasterAvatarProps {
  avatarUrl: string | null;
  firstName: string;
  lastName?: string;
  isPro?: boolean;
  isGuildMaster?: boolean;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  showBadge?: boolean;
  className?: string;
  onClick?: () => void;
}

const sizeMap = {
  xs: { container: "w-6 h-6", text: "text-[10px]", badge: "w-3 h-3", badgeOffset: "-bottom-0.5 -right-0.5" },
  sm: { container: "w-8 h-8", text: "text-xs", badge: "w-3.5 h-3.5", badgeOffset: "-bottom-0.5 -right-0.5" },
  md: { container: "w-10 h-10", text: "text-sm", badge: "w-4 h-4", badgeOffset: "-bottom-1 -right-1" },
  lg: { container: "w-12 h-12", text: "text-base", badge: "w-4 h-4", badgeOffset: "-bottom-1 -right-1" },
  xl: { container: "w-16 h-16", text: "text-xl", badge: "w-5 h-5", badgeOffset: "-bottom-1 -right-1" },
};

/**
 * Avatar component with Guild Master styling.
 * Guild Master users get an animated golden ring around their avatar.
 * Non-premium PRO users get a standard amber ring.
 */
export default function GuildMasterAvatar({
  avatarUrl,
  firstName,
  lastName,
  isPro = false,
  isGuildMaster = false,
  size = "md",
  showBadge = true,
  className,
  onClick,
}: GuildMasterAvatarProps) {
  const { container, text, badge, badgeOffset } = sizeMap[size];
  const initials = `${firstName[0]}${lastName?.[0] || ""}`.toUpperCase();

  // Guild Master gets animated gold ring, PRO gets amber ring
  const ringStyles = isGuildMaster
    ? "ring-2 ring-amber-400 ring-offset-1 ring-offset-black shadow-[0_0_15px_rgba(251,191,36,0.4)] guild-master-glow"
    : isPro
    ? "ring-2 ring-amber-400/70 ring-offset-1 ring-offset-black"
    : "";

  return (
    <div
      className={cn("relative inline-block", className)}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* Avatar with ring */}
      <div
        className={cn(
          container,
          "rounded-full overflow-hidden flex items-center justify-center",
          "bg-gradient-to-br from-amber-400 to-orange-500",
          "text-white font-semibold",
          text,
          ringStyles,
          onClick && "cursor-pointer transition-transform hover:scale-105"
        )}
      >
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={`${firstName}${lastName ? ` ${lastName}` : ""}`}
            width={64}
            height={64}
            className="w-full h-full object-cover"
          />
        ) : (
          initials
        )}
      </div>

      {/* Guild Master badge overlay */}
      {isGuildMaster && showBadge && (
        <div
          className={cn(
            "absolute flex items-center justify-center",
            "rounded-full bg-black/80 border border-amber-400/50",
            badge,
            badgeOffset
          )}
        >
          <GuildMasterBadge size="sm" animate={false} showTooltip={false} className="scale-75" />
        </div>
      )}
    </div>
  );
}

/**
 * Username display with Guild Master crown inline
 */
export function GuildMasterUsername({
  firstName,
  lastName,
  isPro = false,
  isGuildMaster = false,
  className,
  showLevel,
  level,
}: {
  firstName: string;
  lastName?: string;
  isPro?: boolean;
  isGuildMaster?: boolean;
  className?: string;
  showLevel?: boolean;
  level?: number;
}) {
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <span className="font-semibold text-white">
        {firstName} {lastName}
      </span>
      {isGuildMaster && <GuildMasterBadge size="sm" />}
      {showLevel && level && (
        <span className="text-xs text-white/50">Lvl {level}</span>
      )}
    </span>
  );
}
