import { useState, useEffect } from "react";
import { motion, Reorder } from "framer-motion";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api";
import { GlassCard } from "./ui/GlassCard";
import { FaLock, FaStar } from "react-icons/fa";

interface Badge {
  id: string;
  name: string;
  description: string;
  icon_url: string | null;
  category: string;
  requirement_type?: string;
  requirement_value?: number;
  is_earned?: boolean;
  earned_at: string | null;
  display_order?: number;
}

interface BadgeTrophyCaseProps {
  userId?: string;
  initialBadges?: Badge[];
  streakCount?: number;
  userStats?: {
    reactions_given: number;
    reactions_received: number;
    solutions_accepted: number;
  } | null;
}

export function BadgeTrophyCase({ userId, initialBadges, streakCount = 0, userStats }: BadgeTrophyCaseProps) {
  console.log("🏆 BadgeTrophyCase Rendered", { badgeCount: initialBadges?.length, streakCount, userStats });
  const [badges, setBadges] = useState<Badge[]>([]);
  const [featuredBadges, setFeaturedBadges] = useState<Badge[]>([]);
  const [collectionBadges, setCollectionBadges] = useState<Badge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load badges
  useEffect(() => {
    const fetchBadges = async () => {
      try {
        setIsLoading(true);
        setError(null);
        let fetchedBadges: Badge[] = [];

        if (userId) {
          fetchedBadges = await apiClient.getUserBadges(userId);
        } else if (initialBadges) {
          fetchedBadges = initialBadges;
        } else {
          fetchedBadges = await apiClient.getBadges();
        }

        // Sort by display_order if available, otherwise earn date
        // But backend doesn't send display_order in all endpoints yet 
        // (assume it flows through)
        // If display_order is present, use it.
        // Actually, let's treat the FIRST 5 as featured by default if no explicit order?
        // Or if backend returns sorted, we respect it.

        // Split into Featured and Collection
        // Logic: If display_order > 0, it's featured? 
        // Or simply: Top 5 of the list are featured.

        setBadges(fetchedBadges);
      } catch (err: any) {
        setError(err.message || "Failed to load badges");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBadges();
  }, [userId, initialBadges]);

  // Derived state for rendering
  useEffect(() => {
    if (!badges.length) return;

    // Separate Earned vs Unearned
    const earned = badges.filter((b) => b.is_earned);

    // Sort earned by display_order (ascending)
    // If display_order is missing/0, treat as "end of list" or specific large number
    // Currently backend returns them sorted by earn status then threshold.
    // If we have display_order logic, we should use it.
    // For now, let's allow user to drag top 5.

    // We assume the badges array order IS the display order.
    // So we just take first 5 as featured.

    setFeaturedBadges(earned.slice(0, 5));
    setCollectionBadges(earned.slice(5));

  }, [badges]);

  const handleReorder = async (newFeatured: Badge[]) => {
    setFeaturedBadges(newFeatured);

    // Update master list locally to reflect this change (put featured at top)
    const newMasterList = [...newFeatured, ...collectionBadges, ...badges.filter(b => !b.is_earned)];
    // Actually we shouldn't mix unearned in the order save if we only order earned.

    // Call API to save order
    // We need to send ALL earned badge IDs in correct order
    const orderedIds = [...newFeatured, ...collectionBadges].map(b => b.id);

    // Don't await UI
    if (!userId) { // Only allow reordering own badges
      try {
        await apiClient.updateBadgeOrder(orderedIds);
      } catch (e) {
        console.error("Failed to save badge order", e);
      }
    }
  };

  const toggleFeature = async (badge: Badge) => {
    if (userId) return; // Read only for others

    // If in Featured -> Move to Collection
    if (featuredBadges.find(b => b.id === badge.id)) {
      const newFeatured = featuredBadges.filter(b => b.id !== badge.id);
      const newCollection = [badge, ...collectionBadges]; // Add to top of collection

      setFeaturedBadges(newFeatured);
      setCollectionBadges(newCollection);

      // Save
      const orderedIds = [...newFeatured, ...newCollection].map(b => b.id);
      await apiClient.updateBadgeOrder(orderedIds);
    }
    // If in Collection -> Move to Featured (limit 5)
    else {
      if (featuredBadges.length >= 5) {
        // Swap with last featured? or just reject?
        // Let's Reject for now or just do nothing (maybe shake UI?)
        return;
      }
      const newFeatured = [...featuredBadges, badge];
      const newCollection = collectionBadges.filter(b => b.id !== badge.id);

      setFeaturedBadges(newFeatured);
      setCollectionBadges(newCollection);

      // Save
      const orderedIds = [...newFeatured, ...newCollection].map(b => b.id);
      await apiClient.updateBadgeOrder(orderedIds);
    }
  };

  const unearnedBadges = badges.filter((b) => !b.is_earned);
  const canEdit = !userId; // If userId is present, we are viewing someone else

  const getProgress = (badge: Badge) => {
    if (!badge.requirement_value || !badge.requirement_type) return 0;

    let current = 0;
    if (badge.requirement_type === 'streak') {
      current = streakCount;
    } else if (badge.requirement_type === 'reactions_given') {
      current = userStats?.reactions_given || 0;
    } else if (badge.requirement_type === 'reactions_received') {
      current = userStats?.reactions_received || 0;
    } else if (badge.requirement_type === 'solutions_accepted') {
      current = userStats?.solutions_accepted || 0;
    }

    const percent = Math.min(100, Math.round((current / badge.requirement_value) * 100));
    return { current, target: badge.requirement_value, percent };
  };

  const categoryColors: Record<string, string> = {
    course: "from-blue-500 to-cyan-500",
    community: "from-amber-500 to-orange-500",
    performance: "from-purple-500 to-pink-500",
  };

  if (isLoading) {
    return (
      <GlassCard className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">🏆 Trophy Case</h2>
          <p className="text-sm text-white/50">
            Showcase your achievements
          </p>
        </div>
      </div>

      {/* Featured Section (Draggable) */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wide flex items-center gap-2">
            <FaStar /> Featured ({featuredBadges.length}/5)
          </h3>
          {canEdit && <span className="text-xs text-white/40">Drag to reorder • Click to unfeature</span>}
        </div>

        {featuredBadges.length === 0 ? (
          <div className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center text-white/30 text-sm">
            Click a badge below to feature it here
          </div>
        ) : (
          <Reorder.Group
            axis="x"
            values={featuredBadges}
            onReorder={handleReorder}
            className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide"
          >
            {featuredBadges.map((badge) => (
              <Reorder.Item key={badge.id} value={badge} id={badge.id} className="cursor-grab active:cursor-grabbing shrink-0">
                <motion.div
                  whileHover={canEdit ? { scale: 1.05, y: -5 } : {}}
                  onClick={() => canEdit && toggleFeature(badge)}
                  className={cn(
                    "relative w-40 h-52 p-3 rounded-xl border-2 bg-gradient-to-br flex flex-col items-center justify-center text-center shadow-xl",
                    categoryColors[badge.category] || "from-gray-600 to-gray-700",
                    "border-amber-400"
                  )}
                >
                  <div className="text-6xl mb-4 drop-shadow-md">
                    {badge.icon_url ? (
                      <img src={badge.icon_url} alt={badge.name} className="w-28 h-28 object-contain" />
                    ) : "🏆"}
                  </div>
                  <h4 className="font-bold text-white text-sm leading-tight">
                    {badge.name}
                    {badge.id.includes('bronze') && " I"}
                    {badge.id.includes('silver') && " III"}
                    {badge.id.includes('gold') && " V"}
                    {badge.id.includes('diamond') && " X"}
                  </h4>
                  <div className="absolute top-2 right-2 text-amber-200 text-xs">
                    ★
                  </div>
                </motion.div>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        )}
      </div>

      {/* Collection Grid */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-white/70 mb-4 uppercase tracking-wide">
          Collection
        </h3>
        {collectionBadges.length === 0 && unearnedBadges.length === 0 ? (
          <p className="text-white/40 text-sm">No badges earned yet.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {collectionBadges.map((badge) => (
              <motion.div
                key={badge.id}
                layoutId={badge.id}
                whileHover={canEdit ? { scale: 1.02, rotate: 1 } : {}}
                onClick={() => canEdit && toggleFeature(badge)}
                className={cn(
                  "relative p-4 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 cursor-pointer transition-colors flex flex-col items-center text-center group",
                  featuredBadges.length < 5 ? "hover:border-amber-400/50" : ""
                )}
              >
                <div className="text-5xl mb-3 w-full flex justify-center">
                  {badge.icon_url ? <img src={badge.icon_url} className="w-24 h-24 object-contain" alt={badge.name} /> : "🏅"}
                </div>
                <h4 className="font-medium text-white text-xs">
                  {badge.name}
                  {badge.id.includes('bronze') && " I"}
                  {badge.id.includes('silver') && " III"}
                  {badge.id.includes('gold') && " V"}
                  {badge.id.includes('diamond') && " X"}
                </h4>
                <p className="text-[10px] text-white/50 mt-1 line-clamp-1">{badge.description}</p>

                {/* Add Trigger Hint */}
                {canEdit && featuredBadges.length < 5 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                    <span className="text-amber-400 text-xs font-bold">Feature +</span>
                  </div>
                )}
              </motion.div>
            ))}

            {/* Locked Badges */}
            {unearnedBadges.map((badge) => {
              const progress = getProgress(badge);
              return (
                <div
                  key={badge.id}
                  className="relative p-4 rounded-lg border border-white/5 bg-black/20 flex flex-col items-center text-center group"
                >
                  {/* Badge Icon Background (Dimmed & Blurred) */}
                  {/* Badge Icon Background (Dimmed & Blurred) */}
                  <div className="text-6xl mb-3 opacity-40 grayscale blur-[2px] w-full flex justify-center scale-110">
                    {badge.icon_url ? <img src={badge.icon_url} className="w-24 h-24 object-contain" alt={badge.name} /> : "🏆"}
                  </div>

                  {/* Lock Icon Overlay (Absolute Center) */}
                  <div className="absolute inset-0 flex items-center justify-center -translate-y-4">
                    <FaLock className="text-white/60 text-5xl shadow-black drop-shadow-xl" />
                  </div>

                  <h4 className="font-medium text-white/40 text-xs mb-2 opacity-50 relative z-10">
                    {badge.name}
                    {badge.id.includes('bronze') && " I"}
                    {badge.id.includes('silver') && " III"}
                    {badge.id.includes('gold') && " V"}
                    {badge.id.includes('diamond') && " X"}
                  </h4>

                  {/* Progress Bar */}
                  {progress ? (
                    <div className="w-full mt-auto relative z-10">
                      <div className="flex justify-between text-[9px] text-white/30 mb-1">
                        <span>{progress.current} / {progress.target}</span>
                        <span>{progress.percent}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-500/40 rounded-full transition-all duration-1000"
                          style={{ width: `${progress.percent}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="mt-auto relative z-10 px-2 py-1 rounded bg-black/40 text-[10px] text-white/30 border border-white/5 flex items-center gap-1 opacity-50">
                      <FaLock className="w-2 h-2" /> Locked
                    </div>
                  )}

                  {/* Hover to see requirement */}
                  <div className="absolute inset-0 hover:bg-black/90 transition-colors flex flex-col items-center justify-center opacity-0 hover:opacity-100 rounded-lg p-3 text-center z-20">
                    <FaLock className="text-amber-500 mb-1" />
                    <p className="text-[10px] text-white/90 font-medium mb-1">
                      {badge.requirement_type?.replace(/_/g, " ")}
                    </p>
                    <p className="text-[9px] text-white/60">
                      {badge.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </GlassCard>
  );
}
export default BadgeTrophyCase;
