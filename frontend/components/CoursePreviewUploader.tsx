"use client";

import { useRef } from "react";
import { useMuxVideoUpload } from "@/hooks/useMuxVideoUpload";
import { FaUpload, FaSpinner, FaCheck, FaTrash, FaTimes } from "react-icons/fa";

interface CoursePreviewUploaderProps {
  courseId: string;
  currentPlaybackId?: string | null;
  onUploadComplete: (playbackId: string) => void;
  onRefreshCourse?: () => Promise<void>;
}

export default function CoursePreviewUploader({
  courseId,
  currentPlaybackId,
  onUploadComplete,
  onRefreshCourse,
}: CoursePreviewUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    uploadStatus,
    uploadProgress,
    handleFileSelect,
    handleDelete,
    checkStatus,
    resetError,
  } = useMuxVideoUpload({
    entityId: courseId,
    entityType: "course",
    currentPlaybackId,
    onUploadComplete: (playbackId, assetId) => {
      onUploadComplete(playbackId);
    },
    onRefresh: onRefreshCourse,
    onDelete: async () => {
      // Clear from DB
      const { apiClient } = await import("@/lib/api");
      await apiClient.updateCourse(courseId, {
        mux_preview_playback_id: undefined,
        mux_preview_asset_id: undefined,
      });
    },
  });

  const handleFileInputChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    await handleFileSelect(event);
  };

  const handleDeleteClick = async () => {
    await handleDelete();
    onUploadComplete("");
  };

  return (
    <div className="space-y-4">
      {uploadStatus === "deleting" && (
        <div className="flex items-center gap-2 p-3 bg-orange-900/20 border border-orange-700/50 rounded-lg text-orange-400 text-sm">
          <FaSpinner className="animate-spin" />
          <span>Deleting preview video from Mux...</span>
        </div>
      )}

      {uploadStatus === "live" && currentPlaybackId ? (
        <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FaCheck className="text-green-400" />
              <div>
                <p className="text-green-400 font-semibold">Preview Uploaded</p>
                <p className="text-xs text-gray-400">Playback ID: {currentPlaybackId.substring(0, 20)}...</p>
              </div>
            </div>
            <button
              onClick={handleDeleteClick}
              className="text-red-400 hover:text-red-300 transition p-2"
              title="Remove preview"
              disabled={uploadStatus === "deleting"}
            >
              <FaTrash />
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleFileInputChange}
              className="hidden"
              id={`preview-upload-${courseId}`}
              disabled={uploadStatus === "uploading" || uploadStatus === "processing" || uploadStatus === "deleting"}
            />
            <label
              htmlFor={`preview-upload-${courseId}`}
              className={`inline-flex items-center gap-2 px-4 py-2 bg-mambo-blue hover:bg-blue-600 text-white font-semibold rounded-lg transition cursor-pointer ${
                uploadStatus === "uploading" || uploadStatus === "processing" || uploadStatus === "deleting"
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              <FaUpload />
              {uploadStatus === "idle" ? "Upload Preview Video" : "Uploading..."}
            </label>
          </div>

          {uploadStatus === "uploading" && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <FaSpinner className="animate-spin" />
                <span>Uploading... {Math.round(uploadProgress)}%</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div
                  className="bg-mambo-blue h-2 rounded-full transition-all"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
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
                className="w-full mt-2 px-4 py-2 bg-yellow-900/30 hover:bg-yellow-900/50 border border-yellow-700/50 text-yellow-400 text-sm font-semibold rounded-lg transition"
              >
                Check Status Now
              </button>
            </div>
          )}

          {uploadStatus === "error" && (
            <div className="p-3 bg-red-900/20 border border-red-700/50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-red-400 text-sm">
                  <FaTimes />
                  <span>Upload failed. Please try again.</span>
                </div>
                <button onClick={resetError} className="text-red-400 hover:text-red-300 text-xs">
                  Dismiss
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
