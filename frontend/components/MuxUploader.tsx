"use client";

import { useRef } from "react";
import { useMuxVideoUpload } from "@/hooks/useMuxVideoUpload";
import { FaCheck, FaSpinner, FaTrash, FaUpload } from "react-icons/fa";

interface MuxUploaderProps {
  lessonId: string | undefined; // Allow undefined to handle edge cases
  onUploadComplete: (playbackId: string, assetId: string) => void;
  currentPlaybackId?: string | null;
  onRefreshLesson?: () => Promise<void>; // Optional callback to refresh lesson data
  onDeleteVideo?: () => Promise<void>; // Optional callback to delete video
}

export default function MuxUploader({
  lessonId,
  onUploadComplete,
  currentPlaybackId,
  onRefreshLesson,
  onDeleteVideo,
}: MuxUploaderProps) {
  // Validate lessonId FIRST - before any other logic
  // This prevents the error where lessonId.trim() is called on undefined
  if (!lessonId || typeof lessonId !== "string" || lessonId.trim() === "") {
    return null;
  }

  // At this point, lessonId is guaranteed to be a valid non-empty string
  const validLessonId = lessonId.trim();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const {
    uploadStatus,
    uploadProgress,
    handleFileSelect,
    handleDelete,
    checkStatus,
    resetError,
  } = useMuxVideoUpload({
    entityId: validLessonId,
    entityType: "lesson",
    currentPlaybackId,
    onUploadComplete,
    onRefresh: onRefreshLesson,
    onDelete: async () => {
      // Clear from DB
      const { apiClient } = await import("@/lib/api");
      await apiClient.updateLesson(validLessonId, {
        mux_playback_id: undefined,
        mux_asset_id: undefined,
        delete_video: true,
      });
      if (onDeleteVideo) {
        await onDeleteVideo();
      }
    },
  });

  const handleFileInputChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    await handleFileSelect(event);
  };

  const handleUploadButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-3">
      {/* Note: MuxUploader component shows its own upload progress UI */}

      {uploadStatus === "deleting" && (
        <div className="flex items-center gap-2 p-3 bg-orange-900/20 border border-orange-700/50 rounded-lg text-orange-400 text-sm">
          <FaSpinner className="animate-spin" />
          <span>Deleting video from Mux...</span>
        </div>
      )}

      {uploadStatus === "processing" && (
        <div className="space-y-2 p-3 bg-yellow-900/20 border border-yellow-700/50 rounded-lg">
          <div className="flex items-center gap-2 text-yellow-400 text-sm">
            <FaSpinner className="animate-spin" />
            <span>Processing video... This may take a few minutes.</span>
          </div>
          <button
            onClick={checkStatus}
            className="text-xs text-yellow-300 hover:text-yellow-200 underline"
          >
            Check Status Now (Sync from Mux)
          </button>
        </div>
      )}

      {uploadStatus === "error" && (
        <div className="p-3 bg-red-900/20 border border-red-700/50 rounded-lg">
          <p className="text-sm text-red-400 font-medium mb-2">Upload Failed</p>
          <p className="text-xs text-red-300">
            Please try again. If the problem persists, check your connection and file format.
          </p>
          <button
            onClick={resetError}
            className="mt-2 text-xs text-red-400 hover:text-red-300 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Upload Interface */}
      <div className="space-y-3">
        {/* Upload Status - Uploading */}
        {uploadStatus === "uploading" && (
          <div className="space-y-2 p-3 bg-blue-900/20 border border-blue-700/50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-blue-400 text-sm font-medium">
                <FaSpinner className="animate-spin" />
                <div>
                  <div>Uploading...</div>
                </div>
              </div>
              <span className="text-blue-300 text-xs font-mono">{Math.round(uploadProgress)}%</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Upload Button - Show when idle */}
        {uploadStatus === "idle" && (
          <button
            type="button"
            onClick={handleUploadButtonClick}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-mambo-blue hover:bg-blue-600 text-white font-bold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaUpload />
            Upload Video File
          </button>
        )}

        {/* Video Status Display - Live - Show as row below upload button (hide when deleting) */}
        {uploadStatus === "live" && currentPlaybackId && uploadStatus !== "deleting" && (
          <div className="flex items-center justify-between p-3 bg-gray-800/50 border border-gray-700 rounded-lg">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <FaCheck className="text-green-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-white text-sm font-medium truncate">Video</div>
                <div className="text-green-400 text-xs mt-0.5">Ready</div>
              </div>
            </div>
            {onDeleteVideo && (
              <button
                onClick={handleDelete}
                className="text-red-400 hover:text-red-300 hover:bg-red-900/30 px-3 py-1.5 rounded transition flex-shrink-0 flex items-center gap-2 text-sm"
                title="Delete video"
              >
                <FaTrash />
                <span>Delete</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
