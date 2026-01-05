"use client";

import { FaTimes, FaSignInAlt, FaUserPlus, FaArrowLeft, FaLock, FaCreditCard } from "react-icons/fa";
import { useRouter } from "next/navigation";

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
              <button
                onClick={handleLogin}
                className="w-full bg-mambo-blue hover:bg-mambo-blue/90 text-white font-semibold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2"
              >
                <FaSignInAlt />
                Log In
              </button>
              <button
                onClick={handleRegister}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2"
              >
                <FaUserPlus />
                Register
              </button>
              <button
                onClick={handleBackToCourses}
                className="w-full bg-transparent border border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white font-semibold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2"
              >
                <FaArrowLeft />
                Back to Courses
              </button>
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
            <button
              onClick={handleSubscribe}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2"
            >
              <FaCreditCard />
              View Pricing & Subscribe
            </button>
            <button
              onClick={handleBackToCourses}
              className="w-full bg-transparent border border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white font-semibold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2"
            >
              <FaArrowLeft />
              Back to Courses
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

