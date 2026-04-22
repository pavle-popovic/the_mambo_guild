"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { apiClient, type ShopItem } from "@/lib/api";
import { useTranslations } from "@/i18n/useTranslations";

/**
 * Confirmation dialog for a pending shop purchase.
 *
 * - Shows the item summary + price + projected balance.
 * - POSTs /api/shop/purchase on confirm.
 * - On success: dispatches `wallet-updated` (picked up by NavBar balance)
 *   and `shop-inventory-updated` (picked up by the inventory page), and
 *   calls `onSuccess` so the parent can refresh its state.
 * - On error: maps the backend `{code, message}` shape into human copy.
 */
export default function PurchaseModal({
  item,
  currentBalance,
  onClose,
  onSuccess,
}: {
  item: ShopItem | null;
  currentBalance: number;
  onClose: () => void;
  onSuccess: (newBalance: number) => void;
}) {
  const t = useTranslations("shop");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!item) return null;

  const projected = currentBalance - item.price_claves;

  const confirm = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.shopPurchase(item.sku);
      // Include new_balance so ClaveWallet can update optimistically
      // instead of waiting on a round-trip to /api/wallet.
      window.dispatchEvent(
        new CustomEvent("wallet-updated", { detail: { balance: res.new_balance } })
      );
      window.dispatchEvent(new CustomEvent("shop-inventory-updated"));
      onSuccess(res.new_balance);
    } catch (e: any) {
      // Backend returns { detail: { code, message } } for ShopErrors.
      const msg =
        e?.detail?.message ||
        e?.message ||
        t("purchase.genericError");
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, y: 10 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 10 }}
          className="w-full max-w-md rounded-2xl border border-white/10 bg-neutral-950 p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-white font-bold text-xl mb-1">{t("purchase.confirmTitle")}</h2>
          <p className="text-white/60 text-sm mb-5">{item.name}</p>

          <div className="space-y-2 border border-white/10 rounded-xl p-4 bg-white/5">
            <Row label={t("purchase.priceLabel")} value={`${item.price_claves} 🥢`} />
            <Row label={t("purchase.yourBalance")} value={`${currentBalance} 🥢`} />
            <div className="h-px bg-white/10 my-2" />
            <Row
              label={t("purchase.afterPurchase")}
              value={`${projected} 🥢`}
              highlight={projected < 0}
            />
          </div>

          {error && (
            <p className="mt-3 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-md px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex gap-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-full border border-white/15 text-white/80 hover:bg-white/5 transition"
              disabled={loading}
            >
              {t("actions.cancel")}
            </button>
            <button
              onClick={confirm}
              disabled={loading || projected < 0}
              className="flex-1 px-4 py-2 rounded-full bg-amber-400 text-black font-semibold hover:bg-amber-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? t("actions.purchasing") : t("actions.buyNow")}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function Row({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-white/60">{label}</span>
      <span className={highlight ? "text-red-400 font-semibold" : "text-white font-medium"}>
        {value}
      </span>
    </div>
  );
}
