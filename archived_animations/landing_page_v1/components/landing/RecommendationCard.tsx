"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { FaCheck, FaCrown } from "react-icons/fa";

interface TierInfo {
  name: string;
  tier: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  ctaLink: string;
  highlighted?: boolean;
}

interface RecommendationCardProps {
  tierInfo: TierInfo;
  reasoning: string;
}

export default function RecommendationCard({ tierInfo, reasoning }: RecommendationCardProps) {
  const isHighlighted = tierInfo.highlighted || tierInfo.tier === "advanced";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-full"
    >
      {/* Diego's reasoning */}
      <div className="mb-3 text-xs text-amber-200/70 italic leading-relaxed">
        "{reasoning}"
      </div>

      {/* Tier Card */}
      <div
        className={`relative rounded-lg overflow-hidden ${
          isHighlighted
            ? "bg-gradient-to-r from-amber-900/40 via-yellow-900/30 to-amber-900/40 border border-amber-500/40"
            : "bg-gradient-to-br from-stone-900/60 to-stone-800/40 border border-amber-700/30"
        }`}
      >
        {/* Highlighted badge */}
        {isHighlighted && (
          <div className="absolute top-0 right-0">
            <div className="flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-amber-500 to-orange-500 text-[9px] font-bold text-black rounded-bl-md">
              <FaCrown className="w-2 h-2" />
              POPULAR
            </div>
          </div>
        )}

        <div className="p-3">
          {/* Header */}
          <div className="flex items-baseline justify-between mb-2">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500/80">
                {tierInfo.name}
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold text-amber-100">
                  {tierInfo.price}
                </span>
                {tierInfo.period !== "Forever" && (
                  <span className="text-xs text-amber-200/50">{tierInfo.period}</span>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-[10px] text-amber-200/60 mb-2">{tierInfo.description}</p>

          {/* Features */}
          <ul className="space-y-1 mb-3">
            {tierInfo.features.slice(0, 3).map((feature, idx) => (
              <li key={idx} className="flex items-start gap-1.5 text-[10px] text-amber-100/80">
                <FaCheck className="w-2 h-2 mt-0.5 text-amber-500/70 shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
            {tierInfo.features.length > 3 && (
              <li className="text-[10px] text-amber-200/50 pl-3.5">
                +{tierInfo.features.length - 3} more features
              </li>
            )}
          </ul>

          {/* CTA Button */}
          <Link href={tierInfo.ctaLink}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full py-2 rounded text-xs font-bold transition-all duration-200 ${
                isHighlighted
                  ? "bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 text-black shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30"
                  : "bg-amber-900/50 text-amber-100 border border-amber-700/50 hover:bg-amber-800/50"
              }`}
            >
              {tierInfo.cta}
            </motion.button>
          </Link>
        </div>

        {/* Art Deco corner accents */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-amber-500/30" />
        <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-amber-500/30" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-amber-500/30" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-amber-500/30" />
      </div>
    </motion.div>
  );
}
