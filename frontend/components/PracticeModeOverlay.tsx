"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FaDownload, FaPlay, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
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

  const handleDownload = async () => {
    setIsDownloading(true);
    setDownloadError(null);

    try {
      const { download_url } = await apiClient.getDownloadUrl(playbackId, "high");

      // Create a temporary anchor to trigger download
      const link = document.createElement("a");
      link.href = download_url;
      link.download = `lesson-${playbackId}.mp4`;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setDownloadComplete(true);
      onDownloadComplete?.();

      // Auto-dismiss after successful download
      setTimeout(() => {
        onDismiss();
      }, 2000);
    } catch (err: any) {
      // Handle 404 (MP4 not available for older videos)
      if (err.message?.includes("404") || err.message?.includes("Not Found")) {
        setDownloadError(
          "Download not available for this video. It may have been uploaded before MP4 support was enabled."
        );
      } else {
        setDownloadError(err.message || "Failed to start download");
      }
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-20 flex items-center justify-center bg-black/80 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="max-w-md w-full mx-4 p-6 bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-mambo-gold/30 shadow-2xl"
      >
        {downloadComplete ? (
          // Success state
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
              <FaCheckCircle className="text-3xl text-green-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Download Started!</h3>
            <p className="text-gray-400 text-sm">
              Check your downloads folder. Practice anytime, anywhere!
            </p>
          </div>
        ) : downloadError ? (
          // Error state
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-orange-500/20 flex items-center justify-center">
              <FaExclamationTriangle className="text-3xl text-orange-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Download Unavailable</h3>
            <p className="text-gray-400 text-sm mb-4">{downloadError}</p>
            <button
              onClick={onDismiss}
              className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg transition"
            >
              Continue Watching
            </button>
          </div>
        ) : (
          // Default state
          <>
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-mambo-gold/20 flex items-center justify-center">
                <span className="text-3xl">🎯</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                You've Mastered This Move!
              </h3>
              <p className="text-gray-400 text-sm">
                Download this video for offline practice. Save data and practice anytime!
              </p>
            </div>

            <div className="space-y-3">
              <motion.button
                onClick={handleDownload}
                disabled={isDownloading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 px-4 bg-gradient-to-r from-mambo-gold to-amber-500 hover:from-amber-500 hover:to-mambo-gold text-black font-bold rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                {isDownloading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    <span>Preparing Download...</span>
                  </>
                ) : (
                  <>
                    <FaDownload />
                    <span>Download for Offline</span>
                  </>
                )}
              </motion.button>

              <button
                onClick={onDismiss}
                className="w-full py-3 px-4 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl flex items-center justify-center gap-2 transition"
              >
                <FaPlay className="text-sm" />
                <span>Watch Online Anyway</span>
              </button>
            </div>

            <p className="text-center text-xs text-gray-500 mt-4">
              Downloads include HD quality video (1080p)
            </p>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
