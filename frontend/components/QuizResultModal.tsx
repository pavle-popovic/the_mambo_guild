"use client";

import { motion } from "framer-motion";
import { FaCheckCircle, FaTimesCircle, FaRedo, FaArrowRight } from "react-icons/fa";

interface QuizResultModalProps {
  isOpen: boolean;
  isCorrect: boolean;
  onTryAgain: () => void;
  onContinue: () => void;
}

export default function QuizResultModal({
  isOpen,
  isCorrect,
  onTryAgain,
  onContinue,
}: QuizResultModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-mambo-panel border border-gray-700 rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden"
      >
        {/* Header */}
        <div
          className={`p-6 flex items-center justify-center ${
            isCorrect
              ? "bg-gradient-to-r from-green-600 to-emerald-600"
              : "bg-gradient-to-r from-red-600 to-orange-600"
          }`}
        >
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            {isCorrect ? (
              <FaCheckCircle className="text-white text-3xl" />
            ) : (
              <FaTimesCircle className="text-white text-3xl" />
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-8 text-center">
          <h2
            className={`text-2xl font-bold mb-4 ${
              isCorrect ? "text-green-400" : "text-red-400"
            }`}
          >
            {isCorrect
              ? "Congratulations, this is correct!"
              : "This is not quite right"}
          </h2>
          <p className="text-gray-300 mb-8">
            {isCorrect
              ? "Great job! You've mastered this concept. Ready to continue?"
              : "Don't worry, learning takes practice. Give it another try!"}
          </p>

          {/* Actions */}
          <div className="flex gap-4 justify-center">
            {isCorrect ? (
              <motion.button
                onClick={onContinue}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold rounded-full transition-all duration-300 shadow-lg shadow-green-500/50 flex items-center gap-2"
              >
                <span>Continue</span>
                <FaArrowRight />
              </motion.button>
            ) : (
              <motion.button
                onClick={onTryAgain}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 bg-gradient-to-r from-mambo-blue to-blue-600 hover:from-blue-500 hover:to-blue-500 text-white font-bold rounded-full transition-all duration-300 shadow-lg shadow-blue-500/50 flex items-center gap-2"
              >
                <FaRedo />
                <span>Try Again</span>
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

