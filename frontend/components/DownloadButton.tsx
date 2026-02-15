"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Loader2, AlertTriangle, CheckCircle } from "lucide-react";
import { apiClient } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface DownloadButtonProps {
  lessonId: string;
  lessonTitle?: string;
  className?: string;
  variant?: "default" | "compact";
}

export default function DownloadButton({
  lessonId,
  lessonTitle = "video",
  className,
  variant = "default",
}: DownloadButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState<{
    remaining: number;
    limit: number;
  } | null>(null);

  const handleDownload = async (e?: React.MouseEvent) => {
    // Prevent any default navigation
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    // First check status to show remaining downloads
    if (!downloadStatus) {
      try {
        const status = await apiClient.getDownloadStatus();
        setDownloadStatus({
          remaining: status.downloads_remaining,
          limit: status.downloads_limit,
        });
        
        if (status.downloads_remaining <= 0) {
          toast.error("Daily download limit reached. Try again tomorrow!");
          return;
        }
        
        // Show warning for first download
        setShowWarning(true);
      } catch (error: any) {
        toast.error(error.message || "Failed to check download status");
      }
      return;
    }

    // Already showed warning, proceed with download
    setIsLoading(true);
    setShowWarning(false);

    try {
      // Get download status first to show remaining downloads
      const statusResponse = await apiClient.getDownloadStatus();
      setDownloadStatus({
        ...downloadStatus,
        remaining: statusResponse.downloads_remaining,
      });

      // Use the streaming endpoint which forces download via Content-Disposition header
      // This is the state-of-the-art approach - server handles everything with proper headers
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const streamUrl = `${apiUrl}/api/downloads/lesson/${lessonId}/stream`;
      
      // Fetch the stream with authentication via httpOnly cookies
      // The backend sends Content-Disposition: attachment header, forcing download
      const response = await fetch(streamUrl, {
        method: "GET",
        headers: {
          "Accept": "video/mp4, */*",
        },
        credentials: "include",
      });
      
      if (!response.ok) {
        // Try to get error message from response
        let errorMessage = `Download failed: ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorMessage;
        } catch {
          // If JSON parsing fails, use status text
        }
        throw new Error(errorMessage);
      }
      
      // Check if response is actually a video
      const contentType = response.headers.get("Content-Type");
      if (!contentType || !contentType.includes("video")) {
        throw new Error("Invalid response: expected video file");
      }
      
      // Get the blob from the stream
      // This will download the entire file into memory, then trigger download
      const blob = await response.blob();
      
      // Verify blob is valid
      if (!blob || blob.size === 0) {
        throw new Error("Downloaded file is empty");
      }
      
      // Extract filename from Content-Disposition header if available
      const contentDisposition = response.headers.get("Content-Disposition");
      let filename = `${lessonTitle.replace(/\s+/g, "_")}.mp4`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, "").trim();
        }
      }
      
      // Create download link and trigger download
      // This forces the browser to download instead of navigating
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      link.style.display = "none"; // Hide the link
      document.body.appendChild(link);
      
      // Trigger download
      link.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
      }, 100);
      
      // Update remaining count from response headers if available
      // (Backend records the download, so we can refresh status)
      try {
        const updatedStatus = await apiClient.getDownloadStatus();
        setDownloadStatus({
          ...downloadStatus,
          remaining: updatedStatus.downloads_remaining,
        });
      } catch (e) {
        // Ignore status update errors
      }

      // Show success message
      const remainingAfter = downloadStatus?.remaining ? downloadStatus.remaining - 1 : 0;
      toast.success(
        <div className="flex flex-col gap-1">
          <span className="font-semibold">Download Started! ✓</span>
          <span className="text-sm text-gray-400">
            The video file is downloading to your device. Check your Downloads folder.
          </span>
          {remainingAfter > 0 && (
            <span className="text-xs text-gray-500 mt-1">
              {remainingAfter} downloads remaining today
            </span>
          )}
        </div>,
        { duration: 5000 }
      );
    } catch (error: any) {
      console.error("Download error:", error);
      
      // Prevent any navigation - make sure we never navigate to URLs
      if (error.message?.includes("429") || error.message?.includes("limit")) {
        toast.error("Daily download limit reached (5/day). Try again tomorrow!");
      } else if (error.message?.includes("Failed to fetch") || error.message?.includes("NetworkError")) {
        toast.error("Network error. Please check your connection and try again.");
      } else if (error.message?.includes("CORS")) {
        toast.error("Download failed due to security restrictions. Please contact support.");
      } else {
        toast.error(error.message || "Failed to start download. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const cancelDownload = () => {
    setShowWarning(false);
    setDownloadStatus(null);
  };

  if (variant === "compact") {
    return (
      <>
        <button
          onClick={handleDownload}
          disabled={isLoading}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all",
            "bg-gray-800 hover:bg-gray-700 text-white",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            className
          )}
          title="Download for offline practice"
        >
          {isLoading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Download size={16} />
          )}
          Download
        </button>

        {/* Warning Modal */}
        <AnimatePresence>
          {showWarning && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
              onClick={cancelDownload}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-md mx-4"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex-shrink-0 p-2 rounded-lg bg-amber-500/10">
                    <AlertTriangle size={24} className="text-amber-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white mb-1">Secure Download</h3>
                    <p className="text-sm text-gray-400">
                      Download links are generated exclusively for your account and expire in 1 hour.
                    </p>
                  </div>
                </div>

                {downloadStatus && (
                  <div className="bg-gray-800 rounded-lg p-3 mb-4 text-sm">
                    <div className="flex justify-between text-gray-300">
                      <span>Downloads remaining today:</span>
                      <span className="font-bold text-white">
                        {downloadStatus.remaining}/{downloadStatus.limit}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={cancelDownload}
                    className="flex-1 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDownload}
                    disabled={isLoading}
                    className="flex-1 px-4 py-2 rounded-lg bg-mambo-blue hover:bg-blue-600 text-white font-medium transition flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Download size={16} />
                    )}
                    Download
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  }

  // Default variant with more details
  return (
    <>
      <motion.button
        onClick={handleDownload}
        disabled={isLoading}
        className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all",
          "bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800",
          "border border-gray-700 hover:border-gray-600",
          "text-white shadow-lg",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          className
        )}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {isLoading ? (
          <Loader2 size={20} className="animate-spin" />
        ) : (
          <Download size={20} />
        )}
        <div className="text-left">
          <div>Download for Offline</div>
          {downloadStatus && (
            <div className="text-xs text-gray-400">
              {downloadStatus.remaining}/{downloadStatus.limit} today
            </div>
          )}
        </div>
      </motion.button>

      {/* Warning Modal (same as above) */}
      <AnimatePresence>
        {showWarning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
            onClick={cancelDownload}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-md mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-shrink-0 p-2 rounded-lg bg-amber-500/10">
                  <AlertTriangle size={24} className="text-amber-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white mb-1">Secure Download</h3>
                  <p className="text-sm text-gray-400">
                    Download links are generated exclusively for your account and expire in 1 hour.
                  </p>
                </div>
              </div>

              {downloadStatus && (
                <div className="bg-gray-800 rounded-lg p-3 mb-4 text-sm">
                  <div className="flex justify-between text-gray-300">
                    <span>Downloads remaining today:</span>
                    <span className="font-bold text-white">
                      {downloadStatus.remaining}/{downloadStatus.limit}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={cancelDownload}
                  className="flex-1 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDownload}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 rounded-lg bg-mambo-blue hover:bg-blue-600 text-white font-medium transition flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Download size={16} />
                  )}
                  Download Now
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
