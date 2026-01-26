"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaDownload, FaPlay, FaCheckCircle, FaWifi, FaBolt, FaCrown } from "react-icons/fa";
import { HiSparkles } from "react-icons/hi2";
import { apiClient } from "@/lib/api";

interface PracticeModeOverlayProps {
  playbackId: string;
  onDismiss: () => void;
  onDownloadComplete?: () => void;
}

export default function PracticeModeOverlay({
  playbackId,
  onDismiss,
  onDownloadComplete,
}: PracticeModeOverlayProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [downloadComplete, setDownloadComplete] = useState(false);
  const [selectedOption, setSelectedOption] = useState<"download" | "stream">("download");

  const handleDownload = async () => {
    setIsDownloading(true);
    setDownloadError(null);

    try {
      // Check if MP4 is available via backend (no CORS issues)
      const result = await apiClient.checkDownloadAvailable(playbackId, "high");

      if (!result.available || !result.download_url) {
        setDownloadError("LEGACY_VIDEO");
        return;
      }

      // MP4 is available - trigger download
      const link = document.createElement("a");
      link.href = result.download_url;
      link.download = `salsa-lesson-${playbackId.slice(0, 8)}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setDownloadComplete(true);
      onDownloadComplete?.();

      // Auto-dismiss after successful download
      setTimeout(() => {
        onDismiss();
      }, 2500);
    } catch (err: any) {
      // Handle errors
      if (err.message?.includes("404") || err.message?.includes("not exist")) {
        setDownloadError("LEGACY_VIDEO");
      } else {
        setDownloadError(err.message || "Failed to start download");
      }
    } finally {
      setIsDownloading(false);
    }
  };

  const handleContinue = () => {
    if (selectedOption === "download") {
      handleDownload();
    } else {
      onDismiss();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-20 flex items-center justify-center bg-black/90 backdrop-blur-md"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="max-w-lg w-full mx-4 overflow-hidden"
      >
        <AnimatePresence mode="wait">
          {downloadComplete ? (
            // Success state
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="p-8 bg-gradient-to-br from-green-900/90 to-black rounded-3xl border border-green-500/30 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.1 }}
                className="w-20 h-20 mx-auto mb-5 rounded-full bg-green-500/20 flex items-center justify-center"
              >
                <FaCheckCircle className="text-4xl text-green-400" />
              </motion.div>
              <h3 className="text-2xl font-bold text-white mb-2">Download Started!</h3>
              <p className="text-green-200/80">
                Check your downloads folder. Practice anywhere, anytime — no internet needed!
              </p>
            </motion.div>
          ) : downloadError === "LEGACY_VIDEO" ? (
            // MP4 not available - likely plan limitation or legacy video
            <motion.div
              key="legacy"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="p-8 bg-gradient-to-br from-gray-900 to-black rounded-3xl border border-mambo-gold/20"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <span className="text-3xl">🎬</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Downloads Coming Soon!
                </h3>
                <p className="text-gray-400 text-sm">
                  HD offline downloads will be available in a future update. For now, enjoy streaming!
                </p>
              </div>
              <button
                onClick={onDismiss}
                className="w-full py-3 px-4 bg-gradient-to-r from-mambo-gold to-amber-500 text-black font-bold rounded-xl transition hover:brightness-110"
              >
                Continue Streaming
              </button>
            </motion.div>
          ) : downloadError ? (
            // Generic error state
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="p-8 bg-gradient-to-br from-red-900/50 to-black rounded-3xl border border-red-500/30 text-center"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
                <span className="text-3xl">⚠️</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Download Failed</h3>
              <p className="text-gray-400 text-sm mb-4">{downloadError}</p>
              <button
                onClick={onDismiss}
                className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg transition"
              >
                Continue Streaming
              </button>
            </motion.div>
          ) : (
            // Default selection state
            <motion.div
              key="selection"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-gradient-to-br from-gray-900 via-gray-900 to-black rounded-3xl border border-mambo-gold/30 shadow-2xl shadow-mambo-gold/10 overflow-hidden"
            >
              {/* Header */}
              <div className="p-6 pb-4 text-center border-b border-white/5">
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className="inline-flex items-center gap-2 px-4 py-1.5 bg-mambo-gold/20 rounded-full mb-4"
                >
                  <HiSparkles className="text-mambo-gold" />
                  <span className="text-mambo-gold text-sm font-semibold">Great Progress!</span>
                </motion.div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  Ready to Practice Offline?
                </h3>
                <p className="text-gray-400 text-sm max-w-sm mx-auto">
                  You've watched this lesson multiple times. Download it for the best practice experience.
                </p>
              </div>

              {/* Options */}
              <div className="p-5 space-y-3">
                {/* Download Option - Recommended (GREEN) */}
                <motion.button
                  onClick={() => setSelectedOption("download")}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className={`w-full p-4 rounded-2xl border-2 transition-all relative overflow-hidden text-left ${
                    selectedOption === "download"
                      ? "border-green-500 bg-green-500/10"
                      : "border-white/10 bg-white/5 hover:border-green-500/50"
                  }`}
                >
                  {/* Recommended badge */}
                  <div className="absolute top-3 right-3">
                    <span className="px-2 py-0.5 bg-green-500 text-white text-[10px] font-bold rounded-full uppercase">
                      Recommended
                    </span>
                  </div>

                  <div className="flex items-start gap-4">
                    {/* Radio indicator - filled when selected */}
                    <div className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                      selectedOption === "download"
                        ? "border-green-500 bg-green-500"
                        : "border-white/30"
                    }`}>
                      {selectedOption === "download" && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                        >
                          <FaCheckCircle className="text-white text-xs" />
                        </motion.div>
                      )}
                    </div>

                    <div className="flex-1 pr-16">
                      <div className="flex items-center gap-2 mb-1">
                        <FaDownload className={selectedOption === "download" ? "text-green-400" : "text-gray-400"} />
                        <span className="font-bold text-white">Download HD Video</span>
                      </div>
                      <p className="text-gray-400 text-sm mb-3">
                        Save to your device for uninterrupted practice
                      </p>

                      {/* Benefits */}
                      <div className="flex flex-wrap gap-3">
                        <div className="flex items-center gap-1.5 text-xs text-gray-300">
                          <FaCrown className="text-green-400" />
                          <span>1080p HD</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-300">
                          <FaWifi className="text-green-400" />
                          <span>No WiFi needed</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-300">
                          <FaBolt className="text-green-400" />
                          <span>Zero buffering</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.button>

                {/* Stream Option (RED/Warning - always red) */}
                <motion.button
                  onClick={() => setSelectedOption("stream")}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className={`w-full p-4 rounded-2xl border-2 transition-all text-left border-red-500/50 bg-red-500/5 ${
                    selectedOption === "stream"
                      ? "border-red-500 bg-red-500/15"
                      : "hover:border-red-500/70 hover:bg-red-500/10"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Radio indicator */}
                    <div className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                      selectedOption === "stream"
                        ? "border-red-500 bg-red-500"
                        : "border-red-500/50"
                    }`}>
                      {selectedOption === "stream" && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-2 h-2 rounded-full bg-white"
                        />
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <FaPlay className="text-red-400 text-sm" />
                        <span className="font-medium text-red-300">
                          Continue Streaming
                        </span>
                      </div>
                      <p className="text-sm text-red-400/70">
                        Watch online at 720p quality (uses data, may buffer)
                      </p>
                    </div>
                  </div>
                </motion.button>
              </div>

              {/* Action Button */}
              <div className="p-5 pt-2">
                <motion.button
                  onClick={handleContinue}
                  disabled={isDownloading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full py-4 px-6 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all disabled:opacity-50 ${
                    selectedOption === "download"
                      ? "bg-gradient-to-r from-green-600 via-green-500 to-green-600 text-white shadow-lg shadow-green-500/30"
                      : "bg-gradient-to-r from-red-600/80 to-red-700/80 text-white hover:from-red-600 hover:to-red-700"
                  }`}
                >
                  {isDownloading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Preparing Download...</span>
                    </>
                  ) : selectedOption === "download" ? (
                    <>
                      <FaDownload />
                      <span>Download Now</span>
                    </>
                  ) : (
                    <>
                      <FaPlay />
                      <span>Continue Streaming</span>
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
