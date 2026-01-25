"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTrophy, FaCheckCircle } from "react-icons/fa";
import Link from "next/link";

interface CourseCompletionModalProps {
  isOpen: boolean;
  courseTitle: string;
  onClose: () => void;
  type?: 'module' | 'course';  // Default to 'course' for backward compatibility
  courseId?: string;  // For navigation back to skill tree
}

export default function CourseCompletionModal({
  isOpen,
  courseTitle,
  onClose,
  type = 'course',
  courseId,
}: CourseCompletionModalProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{ duration: 0.5, type: "spring" }}
            className="relative bg-gradient-to-br from-mambo-gold/20 via-mambo-blue/20 to-purple-600/20 backdrop-blur-xl border-2 border-mambo-gold/50 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl"
          >
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-mambo-gold via-mambo-blue to-purple-600"></div>
            
            <div className="text-center space-y-6">
              {/* Trophy Icon */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="flex justify-center"
              >
                <div className="relative">
                  <FaTrophy className="text-6xl text-mambo-gold drop-shadow-lg" />
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className="absolute -top-2 -right-2"
                  >
                    <FaCheckCircle className="text-3xl text-green-400" />
                  </motion.div>
                </div>
              </motion.div>

              {/* Title */}
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-3xl font-bold text-white mb-2"
              >
                {type === 'module' ? 'Module Complete! 🎉' : 'Course Complete! 🎉'}
              </motion.h2>

              {/* Course/Module Name */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-xl text-mambo-gold font-semibold mb-4"
              >
                {courseTitle}
              </motion.p>

              {/* Message */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-gray-300 text-lg leading-relaxed"
              >
                {type === 'module'
                  ? "Excellent work! You've completed all lessons in this module. Keep the momentum going!"
                  : "Congratulations! You've mastered every lesson in this course. Your dedication and hard work have paid off!"
                }
              </motion.p>

              {/* Action Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="pt-4"
              >
                <Link
                  href={type === 'module' && courseId ? `/courses/${courseId}` : '/courses'}
                  onClick={onClose}
                  className="inline-block w-full bg-gradient-to-r from-mambo-gold to-yellow-500 hover:from-yellow-500 hover:to-mambo-gold text-black font-bold py-4 px-8 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 transform"
                >
                  {type === 'module' ? 'Back to Skill Tree' : 'Back to Courses'}
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

