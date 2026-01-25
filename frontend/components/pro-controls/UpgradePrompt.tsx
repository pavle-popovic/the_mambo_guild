"use client";

import { useRouter } from "next/navigation";
import { FaLock, FaCrown, FaStepForward, FaTachometerAlt, FaRedo } from "react-icons/fa";

interface UpgradePromptProps {
  onUpgrade?: () => void;
}

const PRO_FEATURES = [
  {
    icon: FaStepForward,
    name: "Precision Player",
    description: "Frame-by-frame stepping for detailed analysis",
  },
  {
    icon: FaTachometerAlt,
    name: "Smart Speed",
    description: "Pitch-corrected playback from 0.5x to 1.5x",
  },
  {
    icon: FaRedo,
    name: "AB Looper",
    description: "Set custom loop regions to practice sections",
  },
];

export default function UpgradePrompt({ onUpgrade }: UpgradePromptProps) {
  const router = useRouter();

  const handleUpgrade = () => {
    if (onUpgrade) {
      onUpgrade();
    } else {
      router.push("/pricing");
    }
  };

  return (
    <div className="bg-gray-900/90 backdrop-blur-sm border border-mambo-gold/30 rounded-xl p-6">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-mambo-gold/10 mb-3">
          <FaCrown className="text-mambo-gold text-xl" />
        </div>
        <h3 className="text-lg font-bold text-white mb-1">Unlock Pro Mastery Tools</h3>
        <p className="text-sm text-gray-400">
          Upgrade to Performer to access advanced video controls
        </p>
      </div>

      {/* Feature list */}
      <div className="space-y-3 mb-6">
        {PRO_FEATURES.map((feature) => (
          <div
            key={feature.name}
            className="flex items-start gap-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700/50"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-700/50 text-gray-400">
              <feature.icon className="text-sm" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">{feature.name}</span>
                <FaLock className="text-[10px] text-gray-500" />
              </div>
              <span className="text-xs text-gray-400">{feature.description}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Upgrade button */}
      <button
        onClick={handleUpgrade}
        className="w-full py-3 px-6 bg-gradient-to-r from-mambo-gold to-amber-500 text-black font-bold rounded-xl
          hover:from-amber-400 hover:to-mambo-gold transition-all duration-300
          shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_30px_rgba(212,175,55,0.5)]
          flex items-center justify-center gap-2"
      >
        <FaCrown />
        Upgrade to Performer
      </button>

      {/* Subtle hint */}
      <p className="text-center text-xs text-gray-500 mt-3">
        Join hundreds of dancers mastering their craft
      </p>
    </div>
  );
}
