"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import GuildMasterAvatar, { TitleChip } from "@/components/ui/GuildMasterAvatar";
import {
  RARITY_BORDER_CLASS,
  RARITY_LABELS,
  RARITY_TEXT_CLASS,
  getBorderSpec,
  getTitleSpec,
  type CosmeticRarity,
} from "@/lib/cosmetics";
import { apiClient, type InventoryItem } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { useTranslations } from "@/i18n/useTranslations";

export default function InventoryPage() {
  const router = useRouter();
  const { user, loading: authLoading, refreshUser } = useAuth();
  const t = useTranslations("shop");
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [equipped, setEquipped] = useState<{ border: string | null; title: string | null }>({
    border: null,
    title: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null); // sku currently being (un)equipped

  useEffect(() => {
    if (!authLoading && !user) router.push("/login?next=/shop/inventory");
  }, [authLoading, user, router]);

  const fetchInventory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const inv = await apiClient.shopListInventory();
      setItems(inv);
      // Derive equipped state from items marked is_equipped.
      let border: string | null = null;
      let title: string | null = null;
      for (const it of inv) {
        if (!it.is_equipped) continue;
        if (it.kind === "border") border = it.sku;
        if (it.kind === "title") title = it.sku;
      }
      setEquipped({ border, title });
    } catch (e: any) {
      setError(e?.message || t("loadInventoryError"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (user) fetchInventory();
  }, [user, fetchInventory]);

  const handleEquip = async (sku: string, slot: "border" | "title", unequip: boolean) => {
    setBusy(sku);
    try {
      const res = await apiClient.shopEquip(unequip ? null : sku, slot);
      setEquipped({
        border: res.equipped_border_sku,
        title: res.equipped_title_sku,
      });
      // Refresh both the local inventory list AND the global AuthContext user
      // so NavBar / profile / any surface reading equipped_border_sku or
      // equipped_title_sku re-renders immediately.
      await Promise.all([fetchInventory(), refreshUser()]);
    } catch (e: any) {
      setError(e?.detail?.message || e?.message || t("equipError"));
    } finally {
      setBusy(null);
    }
  };

  const cosmetics = items.filter((i) => i.kind === "border" || i.kind === "title");
  const utilities = items.filter((i) => i.kind === "utility" || i.kind === "ticket");

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-black text-white">
        <NavBar user={user || undefined} />
        <div className="flex items-center justify-center min-h-[60vh] text-white/50">
          <div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <NavBar user={user || undefined} />

      <main className="max-w-6xl mx-auto px-4 pt-24 pb-16">
        <header className="mb-8 flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">{t("inventoryTitle")}</h1>
            <p className="text-white/60 mt-2">{t("inventorySubtitle")}</p>
          </div>
          <Link
            href="/shop"
            className="text-sm text-white/80 hover:text-amber-300 underline underline-offset-2"
          >
            {t("backToShop")}
          </Link>
        </header>

        {loading ? (
          <div className="text-center text-white/50 py-20">{t("loadingInventory")}</div>
        ) : error ? (
          <div className="text-center text-red-400 py-20">{error}</div>
        ) : items.length === 0 ? (
          <div className="text-center text-white/40 py-20">
            {t("emptyInventory")}{" "}
            <Link href="/shop" className="underline text-amber-300">
              {t("visitShop")}
            </Link>
            .
          </div>
        ) : (
          <>
            {cosmetics.length > 0 && (
              <section className="mb-10">
                <h2 className="text-xl font-semibold mb-4">{t("sections.cosmetics")}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {cosmetics.map((item) => (
                    <InventoryCard
                      key={item.sku}
                      item={item}
                      equipped={
                        item.kind === "border"
                          ? equipped.border === item.sku
                          : equipped.title === item.sku
                      }
                      busy={busy === item.sku}
                      onEquip={(unequip) =>
                        handleEquip(item.sku, item.kind as "border" | "title", unequip)
                      }
                      t={t}
                    />
                  ))}
                </div>
              </section>
            )}

            {utilities.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold mb-4">{t("sections.other")}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {utilities.map((item) => (
                    <div
                      key={item.sku}
                      className="rounded-2xl border border-white/10 bg-black/40 p-5"
                    >
                      <h3 className="font-semibold text-white">{item.name}</h3>
                      <p className="text-sm text-white/50 mt-1">{item.description}</p>
                      <p className="text-xs text-white/40 mt-3">
                        {t("ownedCount", { count: item.owned_count })}
                      </p>
                      {item.sku === "ticket_golden" && item.owned_count > 0 && (
                        <Link
                          href="/guild-master"
                          className="mt-3 inline-block text-sm text-amber-300 hover:text-amber-200 underline"
                        >
                          {t("actions.redeemTicket")}
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

function InventoryCard({
  item,
  equipped,
  busy,
  onEquip,
  t,
}: {
  item: InventoryItem;
  equipped: boolean;
  busy: boolean;
  onEquip: (unequip: boolean) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}) {
  const rarity: CosmeticRarity | null = item.rarity as CosmeticRarity | null;
  const rarityBorder = rarity ? RARITY_BORDER_CLASS[rarity] : "border-white/10";
  const rarityText = rarity ? RARITY_TEXT_CLASS[rarity] : "text-white/60";

  return (
    <div
      className={cn(
        "rounded-2xl border bg-black/40 p-5 flex flex-col gap-4",
        rarityBorder
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-white font-semibold truncate">{item.name}</h3>
          {rarity && (
            <div className={cn("text-xs uppercase tracking-wider", rarityText)}>
              {t(`rarity.${rarity}`)}
            </div>
          )}
        </div>
        {equipped && (
          <span className="shrink-0 rounded-full bg-emerald-500/20 border border-emerald-400/40 px-2 py-0.5 text-[10px] text-emerald-200 uppercase tracking-wider">
            {t("actions.equipped")}
          </span>
        )}
      </div>

      <div className="min-h-[72px] flex items-center justify-center bg-white/5 rounded-xl border border-white/5 p-3">
        {item.kind === "border" && (
          <GuildMasterAvatar
            avatarUrl={null}
            username="YOU"
            size="lg"
            showBadge={false}
            equippedBorderSku={getBorderSpec(item.sku)?.sku}
          />
        )}
        {item.kind === "title" && getTitleSpec(item.sku) && (
          <TitleChip
            label={getTitleSpec(item.sku)!.label}
            tone={getTitleSpec(item.sku)!.tone}
            className="!text-sm !py-1 !px-3"
          />
        )}
      </div>

      <button
        onClick={() => onEquip(equipped)}
        disabled={busy}
        className={cn(
          "px-4 py-1.5 rounded-full text-sm font-medium transition",
          equipped
            ? "bg-white/10 text-white hover:bg-white/15"
            : "bg-amber-400 text-black hover:bg-amber-300",
          busy && "opacity-50 cursor-wait"
        )}
      >
        {busy ? "..." : equipped ? t("actions.unequip") : t("actions.equip")}
      </button>
    </div>
  );
}
