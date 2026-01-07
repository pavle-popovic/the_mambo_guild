"use client";

import { useEffect, useState } from "react";
import { FaCheckCircle, FaTrophy, FaStar } from "react-icons/fa";

interface SuccessNotificationProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue?: () => void; // Optional callback for immediate navigation
  xpGained: number;
  leveledUp: boolean;
  newLevel?: number;
}

export default function SuccessNotification({
  isOpen,
  onClose,
  onContinue,
  xpGained,
  leveledUp,
  newLevel,
}: SuccessNotificationProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      
      // Play success sound
      try {
        const audio = new Audio('/assets/success.wav');
        audio.volume = 0.6;
        // Play immediately when popup appears
        audio.play().catch((err) => {
          console.log("Could not play success sound:", err);
        });
      } catch (err) {
        console.log("Could not play success sound:", err);
      }

      // Auto-close after 2 seconds (reduced from 3)
      const timer = setTimeout(() => {
        setIsAnimating(false);
        setTimeout(() => {
          if (onContinue) {
            onContinue();
          } else {
            onClose();
          }
        }, 300); // Wait for fade-out animation
      }, 2000);

      return () => {
        clearTimeout(timer);
      };
    } else {
      setIsAnimating(false);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          isAnimating ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Success Card */}
      <div 
        className={`relative bg-gradient-to-br from-green-600 via-green-500 to-emerald-500 rounded-2xl p-8 shadow-2xl transform transition-all duration-500 pointer-events-auto ${
          isAnimating 
            ? "scale-100 opacity-100 translate-y-0" 
            : "scale-95 opacity-0 translate-y-4"
        }`}
        style={{
          minWidth: "400px",
          maxWidth: "500px",
        }}
      >
        {/* Animated Checkmark */}
        <div className="flex justify-center mb-6">
          <div className={`relative transition-all duration-500 ${
            isAnimating ? "scale-100 rotate-0" : "scale-0 rotate-180"
          }`}>
            <div className="absolute inset-0 bg-white/30 rounded-full animate-ping" />
            <div className="relative w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg">
              <FaCheckCircle className="text-5xl text-green-600" />
            </div>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-3xl font-bold text-white text-center mb-2">
          Lesson Completed!
        </h2>

        {/* XP Gained */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
            <FaStar className="text-yellow-300 text-xl animate-pulse" />
            <span className="text-2xl font-bold text-white">+{xpGained} XP</span>
          </div>
        </div>

        {/* Level Up Message */}
        {leveledUp && newLevel && (
          <div className={`mt-4 bg-yellow-500/90 backdrop-blur-sm rounded-xl p-4 border-2 border-yellow-300 shadow-lg transition-all duration-500 ${
            isAnimating ? "scale-100 opacity-100" : "scale-95 opacity-0"
          }`}>
            <div className="flex items-center justify-center gap-3">
              <FaTrophy className="text-3xl text-yellow-900 animate-bounce" />
              <div>
                <div className="text-lg font-bold text-yellow-900">Level Up!</div>
                <div className="text-sm text-yellow-800">You're now level {newLevel}</div>
              </div>
            </div>
          </div>
        )}

        {/* Close Button */}
        <button
          onClick={() => {
            setIsAnimating(false);
            // Navigate immediately when Continue is clicked
            if (onContinue) {
              onContinue();
            } else {
              onClose();
            }
          }}
          className="mt-6 w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-bold py-3 rounded-lg transition-all duration-200 border border-white/30"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

