"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  getBorderSpec,
  getTitleSpec,
  TITLE_TONE_CLASS,
  type TitleTone,
} from "@/lib/cosmetics";
import GuildMasterBadge from "./GuildMasterBadge";

interface GuildMasterAvatarProps {
  avatarUrl: string | null;
  username?: string;
  // Accepted for legacy callers; not used for the displayed initials.
  firstName?: string;
  lastName?: string;
  isPro?: boolean;
  isGuildMaster?: boolean;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  showBadge?: boolean;
  className?: string;
  onClick?: () => void;
  /**
   * SKU of the equipped shop border (e.g. "border_aurora"). When set, its
   * CSS class is layered on top of the subscription ring (Guild Master /
   * PRO) via a wrapper div, so both effects remain visible.
   */
  equippedBorderSku?: string | null;
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
  username,
  isPro = false,
  isGuildMaster = false,
  size = "md",
  showBadge = true,
  className,
  onClick,
  equippedBorderSku,
}: GuildMasterAvatarProps) {
  const { container, text, badge, badgeOffset } = sizeMap[size];
  const displayName = username || "Anonymous";
  const initials = displayName.slice(0, 2).toUpperCase();

  // Guild Master gets animated gold ring, PRO gets amber ring
  const ringStyles = isGuildMaster
    ? "ring-2 ring-amber-400 ring-offset-1 ring-offset-black shadow-[0_0_15px_rgba(251,191,36,0.4)] guild-master-glow"
    : isPro
    ? "ring-2 ring-amber-400/70 ring-offset-1 ring-offset-black"
    : "";

  const border = getBorderSpec(equippedBorderSku ?? null);

  return (
    <div
      className={cn("relative inline-block", className)}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* Cosmetic border wrapper. When no border equipped, this div just
       * holds the avatar. When equipped, its class provides either a
       * box-shadow ring or a conic-gradient padding wrapper. */}
      <div
        className={cn(
          "rounded-full",
          border?.className,
          onClick && "cursor-pointer transition-transform hover:scale-105"
        )}
      >
        <div
          className={cn(
            container,
            "rounded-full overflow-hidden flex items-center justify-center",
            "bg-gradient-to-br from-amber-400 to-orange-500",
            "text-white font-semibold",
            text,
            ringStyles
          )}
        >
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={displayName}
              width={64}
              height={64}
              className="w-full h-full object-cover"
            />
          ) : (
            initials
          )}
        </div>
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
 * Username display with Guild Master crown inline.
 * Always displays the user's chosen handle (username). The first/last name
 * fields exist on the props for legacy compatibility but are intentionally
 * not rendered — community surfaces show usernames only.
 */
export function GuildMasterUsername({
  username,
  isPro = false,
  isGuildMaster = false,
  className,
  showLevel,
  level,
  equippedTitleSku,
}: {
  username?: string;
  // Accepted for legacy callers; not rendered.
  firstName?: string;
  lastName?: string;
  isPro?: boolean;
  isGuildMaster?: boolean;
  className?: string;
  showLevel?: boolean;
  level?: number;
  /** SKU of the equipped shop title; rendered as a chip next to the username. */
  equippedTitleSku?: string | null;
}) {
  const title = getTitleSpec(equippedTitleSku ?? null);
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <span className="font-semibold text-white">{username || "Anonymous"}</span>
      {isGuildMaster && <GuildMasterBadge size="sm" />}
      {title && (
        <TitleChip label={title.label} tone={title.tone} />
      )}
      {showLevel && level && (
        <span className="text-xs text-white/50">Lvl {level}</span>
      )}
    </span>
  );
}

/**
 * Small tone-coloured chip that renders an equipped title next to a
 * username. Exported so the shop preview / inventory pages can reuse it
 * without re-threading tone-class lookups.
 */
export function TitleChip({
  label,
  tone,
  className,
}: {
  label: string;
  tone: TitleTone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-[1px] text-[10px] font-medium tracking-wide uppercase",
        TITLE_TONE_CLASS[tone],
        className
      )}
    >
      {label}
    </span>
  );
}
