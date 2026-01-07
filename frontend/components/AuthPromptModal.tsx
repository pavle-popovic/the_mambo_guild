"use client";

import { FaTimes, FaSignInAlt, FaUserPlus, FaArrowLeft, FaLock, FaCreditCard } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

interface AuthPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "login" | "subscribe";
  courseTitle?: string;
}

export default function AuthPromptModal({
  isOpen,
  onClose,
  type,
  courseTitle,
}: AuthPromptModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleLogin = () => {
    router.push("/login");
  };

  const handleRegister = () => {
    router.push("/register");
  };

  const handleSubscribe = () => {
    router.push("/pricing");
  };

  const handleBackToCourses = () => {
    router.push("/courses");
    onClose();
  };

  if (type === "login") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
        <div className="bg-mambo-panel border border-gray-700 rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-mambo-blue to-purple-600 p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <FaLock className="text-white text-lg" />
              </div>
              <h2 className="text-xl font-bold text-white">Login Required</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition p-1 hover:bg-white/10 rounded-full"
            >
              <FaTimes className="text-lg" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <p className="text-mambo-text-light mb-6 text-center">
              Please log in to access this lesson. Would you like to log in now?
            </p>

            {/* Actions */}
            <div className="flex flex-col gap-3">
              <motion.button
                onClick={handleLogin}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-mambo-blue to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40 relative overflow-hidden group"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"
                />
                <FaSignInAlt className="relative z-10" />
                <span className="relative z-10">Log In</span>
              </motion.button>
              <motion.button
                onClick={handleRegister}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-gray-900/30 hover:shadow-xl hover:shadow-gray-900/40 relative overflow-hidden group"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"
                />
                <FaUserPlus className="relative z-10" />
                <span className="relative z-10">Register</span>
              </motion.button>
              <motion.button
                onClick={handleBackToCourses}
                whileHover={{ scale: 1.02, y: -2, borderColor: "rgba(156, 163, 175, 0.8)" }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-transparent border border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 hover:bg-gray-800/50 relative overflow-hidden group"
              >
                <motion.div
                  animate={{ x: [0, -4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
                  className="relative z-10"
                >
                  <FaArrowLeft />
                </motion.div>
                <span className="relative z-10">Back to Courses</span>
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Subscribe modal
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-mambo-panel border border-gray-700 rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <FaCreditCard className="text-white text-lg" />
            </div>
            <h2 className="text-xl font-bold text-white">Subscription Required</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition p-1 hover:bg-white/10 rounded-full"
          >
            <FaTimes className="text-lg" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-mambo-text-light mb-2 text-center">
            This course requires a subscription to access.
          </p>
          {courseTitle && (
            <p className="text-mambo-text font-semibold mb-6 text-center">
              {courseTitle}
            </p>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <motion.button
              onClick={handleSubscribe}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/40 relative overflow-hidden group"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"
              />
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                className="relative z-10"
              >
                <FaCreditCard />
              </motion.div>
              <span className="relative z-10">View Pricing & Subscribe</span>
            </motion.button>
            <motion.button
              onClick={handleBackToCourses}
              whileHover={{ scale: 1.02, y: -2, borderColor: "rgba(156, 163, 175, 0.8)" }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-transparent border border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 hover:bg-gray-800/50 relative overflow-hidden group"
            >
              <motion.div
                animate={{ x: [0, -4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
                className="relative z-10"
              >
                <FaArrowLeft />
              </motion.div>
              <span className="relative z-10">Back to Courses</span>
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}

