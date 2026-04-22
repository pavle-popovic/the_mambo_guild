"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import ShopItemCard from "@/components/shop/ShopItemCard";
import PurchaseModal from "@/components/shop/PurchaseModal";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient, type ShopItem } from "@/lib/api";

type TabKind = "ticket" | "border" | "title" | "utility";

const TABS: { key: TabKind; label: string; blurb: string }[] = [
  { key: "ticket",  label: "Tickets",  blurb: "Unlock 1-on-1 coaching reviews." },
  { key: "border",  label: "Borders",  blurb: "Avatar rings across every rarity." },
  { key: "title",   label: "Titles",   blurb: "Earned words under your name." },
  { key: "utility", label: "Utility",  blurb: "More stage + lab slots, permanent." },
];

/** Tier rank for gate comparison. Matches backend `tier_service._TIER_RANK`. */
const TIER_RANK: Record<string, number> = { rookie: 0, advanced: 1, performer: 2 };

export default function ShopPage() {
  const router = useRouter();
  const { user, loading: authLoading, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState<TabKind>("ticket");
  const [items, setItems] = useState<ShopItem[]>([]);
  const [inventory, setInventory] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [purchaseItem, setPurchaseItem] = useState<ShopItem | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Redirect unauthenticated users to login once auth has settled.
  useEffect(() => {
    if (!authLoading && !user) router.push("/login?next=/shop");
  }, [authLoading, user, router]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [allItems, inv] = await Promise.all([
        apiClient.shopListItems(),
        apiClient.shopListInventory(),
      ]);
      setItems(allItems);
      setInventory(new Set(inv.map((i) => i.sku)));
    } catch (e: any) {
      setError(e?.message || "Failed to load shop");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) fetchAll();
  }, [user, fetchAll]);

  const balance = user?.current_claves ?? 0;
  const userTier = user?.tier?.toLowerCase() ?? "rookie";
  const userRank = TIER_RANK[userTier] ?? 0;

  const visibleItems = useMemo(
    () => items.filter((it) => it.kind === activeTab),
    [items, activeTab]
  );

  // Short-circuit the render until auth settles. The useEffect above handles
  // the actual redirect; this just prevents flashing the shop to logged-out
  // visitors (and prevents leaking stale balance + inventory state).
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

  const handleBuy = (sku: string) => {
    const item = items.find((i) => i.sku === sku);
    if (item) setPurchaseItem(item);
  };

  const handleSuccess = async (_newBalance: number) => {
    setPurchaseItem(null);
    setToast("Purchase complete 🎉");
    // Refresh the user's clave balance + catalog stock + inventory in parallel.
    await Promise.all([refreshUser(), fetchAll()]);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <NavBar user={user || undefined} />

      <main className="max-w-6xl mx-auto px-4 pt-24 pb-16">
        <header className="mb-10 text-center">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight">The Guild Shop</h1>
          <p className="text-white/60 mt-3 max-w-2xl mx-auto">
            Spend your claves on coaching tickets, cosmetics, and slot upgrades.
            Every purchase is final.
          </p>
          <div className="mt-6 inline-flex items-center gap-6 bg-white/5 rounded-full px-6 py-2 border border-white/10">
            <span className="text-white/60 text-sm">Balance</span>
            <span className="text-amber-300 font-bold text-lg">
              {balance} <span className="text-xs">🥢</span>
            </span>
            <Link
              href="/shop/inventory"
              className="text-sm text-white/80 hover:text-amber-300 underline underline-offset-2"
            >
              View inventory →
            </Link>
          </div>
        </header>

        <nav className="flex gap-2 mb-6 overflow-x-auto no-scrollbar">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition border ${
                activeTab === t.key
                  ? "bg-amber-400 text-black border-amber-400"
                  : "bg-white/5 text-white/80 border-white/10 hover:bg-white/10"
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>

        <p className="text-white/50 text-sm mb-6">
          {TABS.find((t) => t.key === activeTab)?.blurb}
        </p>

        {loading ? (
          <div className="text-center text-white/50 py-20">Loading catalog...</div>
        ) : error ? (
          <div className="text-center text-red-400 py-20">{error}</div>
        ) : visibleItems.length === 0 ? (
          <div className="text-center text-white/40 py-20">
            Nothing here yet. Check back soon.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {visibleItems.map((item) => {
              const requiredRank = item.tier_required
                ? TIER_RANK[item.tier_required] ?? 0
                : 0;
              const meetsTier = userRank >= requiredRank;
              const owned = inventory.has(item.sku);
              return (
                <ShopItemCard
                  key={item.sku}
                  item={item}
                  owned={owned}
                  canAfford={balance >= item.price_claves}
                  meetsTier={meetsTier}
                  onBuy={handleBuy}
                />
              );
            })}
          </div>
        )}
      </main>

      <Footer />

      {purchaseItem && (
        <PurchaseModal
          item={purchaseItem}
          currentBalance={balance}
          onClose={() => setPurchaseItem(null)}
          onSuccess={handleSuccess}
        />
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-emerald-500/90 text-white px-4 py-2 rounded-full shadow-lg text-sm">
          {toast}
        </div>
      )}
    </div>
  );
}
