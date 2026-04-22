"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  RARITY_BORDER_CLASS,
  RARITY_TEXT_CLASS,
  getBorderSpec,
  getTitleSpec,
  type CosmeticRarity,
} from "@/lib/cosmetics";
import GuildMasterAvatar, { TitleChip } from "@/components/ui/GuildMasterAvatar";
import type { ShopItem } from "@/lib/api";
import { useTranslations } from "@/i18n/useTranslations";

/**
 * Card for a single shop item. Renders:
 *   • rarity-coloured border ring
 *   • name + optional description
 *   • live preview for borders (mini avatar) and titles (mock chip)
 *   • price + CTA ("Buy" / "Owned" / "Locked")
 *
 * Stock, ownership, and tier state are supplied by the parent; this card
 * is a pure presentation layer and never hits the API.
 */
export default function ShopItemCard({
  item,
  owned,
  canAfford,
  meetsTier,
  onBuy,
}: {
  item: ShopItem;
  owned: boolean;
  canAfford: boolean;
  meetsTier: boolean;
  onBuy: (sku: string) => void;
}) {
  const t = useTranslations("shop");
  const rarity: CosmeticRarity | null = item.rarity as CosmeticRarity | null;
  const rarityBorder = rarity ? RARITY_BORDER_CLASS[rarity] : "border-white/10";
  const rarityText = rarity ? RARITY_TEXT_CLASS[rarity] : "text-white/60";
  const rarityLabel = rarity ? t(`rarity.${rarity}`) : "";

  const outOfStock = item.remaining_stock !== null && item.remaining_stock <= 0;
  const maxed =
    item.max_per_user !== null && owned && item.max_per_user === 1;

  const disabled = outOfStock || maxed || !canAfford || !meetsTier;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={cn(
        "rounded-2xl border bg-black/40 backdrop-blur-sm p-5 flex flex-col gap-4",
        rarityBorder
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-white font-semibold text-lg truncate">{item.name}</h3>
          {rarityLabel && (
            <div className={cn("text-xs uppercase tracking-wider", rarityText)}>
              {rarityLabel}
            </div>
          )}
        </div>
        {item.remaining_stock !== null && (
          <span className="shrink-0 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-white/70">
            {t("stockRemaining", { count: item.remaining_stock })}
          </span>
        )}
      </div>

      <div className="min-h-[84px] flex items-center justify-center bg-white/5 rounded-xl border border-white/5 p-3">
        <ItemPreview item={item} t={t} />
      </div>

      {item.description && (
        <p className="text-sm text-white/60 line-clamp-2">{item.description}</p>
      )}

      <div className="flex items-center justify-between mt-auto pt-2">
        <span className="text-amber-300 font-semibold">
          {item.price_claves} <span className="text-xs">🥢</span>
        </span>
        <button
          onClick={() => !disabled && onBuy(item.sku)}
          disabled={disabled}
          className={cn(
            "px-4 py-1.5 rounded-full text-sm font-medium transition",
            disabled
              ? "bg-white/5 text-white/40 cursor-not-allowed"
              : "bg-amber-400 text-black hover:bg-amber-300"
          )}
        >
          {maxed
            ? t("actions.owned")
            : outOfStock
            ? t("actions.soldOut")
            : !meetsTier
            ? t("actions.locked")
            : !canAfford
            ? t("actions.notEnough")
            : t("actions.buy")}
        </button>
      </div>
    </motion.div>
  );
}

function ItemPreview({
  item,
  t,
}: {
  item: ShopItem;
  t: (key: string, params?: Record<string, string | number>) => string;
}) {
  if (item.kind === "border") {
    const spec = getBorderSpec(item.sku);
    return (
      <GuildMasterAvatar
        avatarUrl={null}
        username="PREVIEW"
        size="lg"
        showBadge={false}
        equippedBorderSku={spec?.sku}
      />
    );
  }
  if (item.kind === "title") {
    const spec = getTitleSpec(item.sku);
    if (!spec) return <span className="text-white/40 text-xs">{t("preview.unavailable")}</span>;
    return <TitleChip label={spec.label} tone={spec.tone} className="!text-sm !py-1 !px-3" />;
  }
  if (item.kind === "ticket") {
    return (
      <div className="text-amber-300 text-3xl font-black tracking-tight">
        🎟️
        <span className="block text-xs text-white/60 font-normal mt-1">{t("preview.goldenTicket")}</span>
      </div>
    );
  }
  // utility
  return (
    <div className="text-white/80 text-center">
      <div className="text-2xl">🎁</div>
      <div className="text-xs text-white/50 mt-1">
        {item.grants?.bonus_video_slots
          ? t("preview.stageSlots", { count: item.grants.bonus_video_slots })
          : item.grants?.bonus_question_slots
          ? t("preview.labSlots", { count: item.grants.bonus_question_slots })
          : t("preview.utility")}
      </div>
    </div>
  );
}
