"use client";

import { useState, useRef } from "react";
import { useMuxVideoUpload } from "@/hooks/useMuxVideoUpload";
import { FaVideo, FaCheck, FaSpinner, FaTrash, FaPlay, FaUpload, FaTimes, FaImage } from "react-icons/fa";
import ImageUploader from "@/components/common/ImageUploader";

interface LevelPreviewUploaderProps {
  levelId: string;
  currentPlaybackId?: string | null;
  currentAssetId?: string | null;
  currentThumbnailUrl?: string | null;
  onUploadComplete: () => void;
}

export default function LevelPreviewUploader({
  levelId,
  currentPlaybackId,
  currentAssetId,
  currentThumbnailUrl,
  onUploadComplete,
}: LevelPreviewUploaderProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState(currentThumbnailUrl || "");
  const [isDeletingThumbnail, setIsDeletingThumbnail] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    uploadStatus,
    uploadProgress,
    handleFileSelect,
    handleDelete,
    checkStatus,
    resetError,
  } = useMuxVideoUpload({
    entityId: levelId,
    entityType: "level",
    currentPlaybackId: currentPlaybackId,
    onUploadComplete: (playbackId, assetId) => {
      onUploadComplete();
    },
    onDelete: async () => {
      // Clear from level in database
      try {
        await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/levels/${levelId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({
              mux_preview_playback_id: null,
              mux_preview_asset_id: null,
            }),
          }
        );
        onUploadComplete();
      } catch (err) {
        console.error("Error clearing preview video from level:", err);
      }
    },
  });

  // Generate preview URLs
  const previewGifUrl = currentPlaybackId
    ? `https://image.mux.com/${currentPlaybackId}/animated.gif?start=0&end=3&width=400&fps=15`
    : null;
  const staticThumbnail = currentThumbnailUrl || (currentPlaybackId
    ? `https://image.mux.com/${currentPlaybackId}/thumbnail.jpg?width=400&time=1`
    : null);
  const displayUrl = isHovered && previewGifUrl ? previewGifUrl : staticThumbnail;

  const handleFileInputChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    await handleFileSelect(event);
  };

  const handleDeleteClick = async () => {
    await handleDelete();
  };

  // Handle thumbnail upload from ImageUploader (Cloudflare)
  const handleThumbnailUpload = async (url: string | null) => {
    setThumbnailUrl(url || "");
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/levels/${levelId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            thumbnail_url: url,
          }),
        }
      );
      onUploadComplete();
    } catch (err) {
      console.error("Error saving thumbnail:", err);
    }
  };

  // Handle thumbnail deletion
  const handleThumbnailDelete = async () => {
    setIsDeletingThumbnail(true);
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/levels/${levelId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            thumbnail_url: null,
          }),
        }
      );
      setThumbnailUrl("");
      onUploadComplete();
    } catch (err) {
      console.error("Error deleting thumbnail:", err);
    } finally {
      setIsDeletingThumbnail(false);
    }
  };

  const isDeleting = uploadStatus === "deleting";

  return (
    <div className="space-y-4 border-t border-yellow-900/30 pt-4 mt-4">
      {/* Thumbnail Upload Section - Using Cloudflare ImageUploader */}
      <div>
        <h4 className="text-sm font-bold text-gray-400 mb-2 flex items-center gap-2">
          <FaImage className="text-mambo-gold" />
          Module Thumbnail
        </h4>
        <p className="text-xs text-gray-500 mb-3">
          Static image shown when no preview video or as fallback
        </p>

        {/* Current thumbnail preview */}
        {thumbnailUrl && (
          <div className="mb-3 relative rounded-lg overflow-hidden border border-gray-700">
            <img
              src={thumbnailUrl}
              alt="Module thumbnail"
              className="w-full h-24 object-cover"
            />
            <button
              onClick={handleThumbnailDelete}
              disabled={isDeletingThumbnail}
              className="absolute top-2 right-2 bg-red-900/80 hover:bg-red-800 text-red-300 p-1.5 rounded-full transition"
              title="Remove thumbnail"
            >
              {isDeletingThumbnail ? (
                <FaSpinner className="animate-spin w-3 h-3" />
              ) : (
                <FaTrash className="w-3 h-3" />
              )}
            </button>
          </div>
        )}

        {/* Upload new thumbnail using Cloudflare */}
        <ImageUploader
          currentImageUrl={thumbnailUrl || null}
          onUploadComplete={handleThumbnailUpload}
          folder="thumbnails"
          aspectRatio="video"
          label={thumbnailUrl ? "Replace thumbnail" : "Upload thumbnail"}
        />
      </div>

      {/* Preview Video Section */}
      <div>
        <h4 className="text-sm font-bold text-gray-400 mb-2 flex items-center gap-2">
          <FaVideo className="text-mambo-gold" />
          Preview Video (Hover GIF)
        </h4>
        <p className="text-xs text-gray-500 mb-3">
          First 3 seconds play as animated GIF when hovering over this node
        </p>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          onChange={handleFileInputChange}
          className="hidden"
          disabled={uploadStatus === "uploading" || uploadStatus === "processing" || isDeleting}
        />

        {/* Deleting state */}
        {uploadStatus === "deleting" && (
          <div className="p-3 bg-orange-900/20 border border-orange-700/50 rounded-lg mb-3">
            <div className="flex items-center gap-2 text-orange-400 text-sm">
              <FaSpinner className="animate-spin" />
              <span>Deleting video from Mux...</span>
            </div>
          </div>
        )}

        {/* Show preview when video exists */}
        {uploadStatus === "live" && currentPlaybackId && !isDeleting ? (
          <div className="space-y-3">
            <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-3">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <FaCheck className="text-green-400" />
                  <div>
                    <p className="text-green-400 font-semibold text-sm">Preview Uploaded</p>
                    <p className="text-xs text-gray-500">ID: {currentPlaybackId.substring(0, 16)}...</p>
                  </div>
                </div>
                <button
                  onClick={handleDeleteClick}
                  className="text-red-400 hover:text-red-300 transition p-2"
                  title="Remove preview"
                  disabled={isDeleting}
                >
                  <FaTrash />
                </button>
              </div>

              {/* Preview with hover animation */}
              <div
                className="relative rounded-lg overflow-hidden border border-green-700/50 cursor-pointer"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                <img
                  src={displayUrl || ""}
                  alt="Preview video"
                  className="w-full h-28 object-cover"
                />
                <div className="absolute top-2 right-2 bg-black/60 rounded-full px-2 py-0.5 text-[10px] text-white/80 flex items-center gap-1">
                  <FaPlay className="text-[8px]" />
                  {isHovered ? "Playing" : "Hover"}
                </div>
              </div>
            </div>
          </div>
        ) : uploadStatus === "uploading" ? (
          <div className="space-y-2 p-3 bg-blue-900/20 border border-blue-700/50 rounded-lg">
            <div className="flex items-center gap-2 text-blue-400 text-sm">
              <FaSpinner className="animate-spin" />
              <span>Uploading... {Math.round(uploadProgress)}%</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        ) : uploadStatus === "processing" ? (
          <div className="space-y-2 p-3 bg-yellow-900/20 border border-yellow-700/50 rounded-lg">
            <div className="flex items-center gap-2 text-yellow-400 text-sm">
              <FaSpinner className="animate-spin" />
              <span>Processing video...</span>
            </div>
            <button
              onClick={checkStatus}
              className="w-full mt-2 px-3 py-2 bg-yellow-900/30 hover:bg-yellow-900/50 border border-yellow-700/50 text-yellow-400 text-sm font-semibold rounded-lg transition"
            >
              Check Status Now
            </button>
          </div>
        ) : uploadStatus === "error" ? (
          <div className="p-3 bg-red-900/20 border border-red-700/50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-red-400 text-sm">
                <FaTimes />
                <span>Upload failed</span>
              </div>
              <button onClick={resetError} className="text-red-400 hover:text-red-300 text-xs">
                Dismiss
              </button>
            </div>
          </div>
        ) : !isDeleting ? (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-mambo-gold/20 hover:bg-mambo-gold/30 text-mambo-gold border border-mambo-gold/50 rounded-lg font-semibold text-sm transition"
          >
            <FaUpload />
            Upload Preview Video
          </button>
        ) : null}
      </div>
    </div>
  );
}
