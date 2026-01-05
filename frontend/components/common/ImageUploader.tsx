"use client";

import { useState, useRef } from "react";
import { FaUpload, FaTimes, FaImage } from "react-icons/fa";
import Image from "next/image";
import { apiClient } from "@/lib/api";

interface ImageUploaderProps {
  currentImageUrl?: string | null;
  onUploadComplete: (url: string | null) => void;
  onImageRemoved?: () => void;
  folder: "avatars" | "thumbnails";
  aspectRatio?: "square" | "video";
  label?: string;
  className?: string;
}

export default function ImageUploader({
  currentImageUrl,
  onUploadComplete,
  onImageRemoved,
  folder,
  aspectRatio = "square",
  label,
  className = "",
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setError("Please select a valid image file (JPG, PNG, or WebP)");
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB");
      return;
    }

    setError("");
    setUploading(true);

    try {
      // Step 1: Get presigned URL from backend
      const { upload_url, public_url } = await apiClient.getPresignedUploadUrl(
        file.type,
        folder
      );

      // Step 2: Upload file directly to R2 using PUT request
      let uploadResponse;
      try {
        uploadResponse = await fetch(upload_url, {
          method: "PUT",
          body: file,
          headers: {
            "Content-Type": file.type,
          },
        });
      } catch (fetchError: any) {
        // Handle CORS or network errors
        if (fetchError.message.includes("Failed to fetch") || fetchError.name === "TypeError") {
          throw new Error(
            "Upload failed: CORS error. Please ensure CORS is configured on your R2 bucket. " +
            "In Cloudflare Dashboard: R2 > Your Bucket > Settings > CORS, add: " +
            '{"AllowedOrigins":["*"],"AllowedMethods":["PUT","GET"],"AllowedHeaders":["*"],"MaxAgeSeconds":3600}'
          );
        }
        throw fetchError;
      }

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text().catch(() => uploadResponse.statusText);
        throw new Error(`Upload failed (${uploadResponse.status}): ${errorText}`);
      }

      // Step 3: File uploaded successfully, use the public URL
      onUploadComplete(public_url);
    } catch (err: any) {
      setError(err.message || "Failed to upload image");
      console.error("Upload error:", err);
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = () => {
    onUploadComplete(null); // Clear the URL
    if (onImageRemoved) {
      onImageRemoved();
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  // Determine aspect ratio class
  const aspectClass =
    aspectRatio === "video" ? "aspect-video" : "aspect-square";

  return (
    <div className={className}>
      {label && (
        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
          {label}
        </label>
      )}

      <div className="space-y-3">
        {/* Upload Button - No preview, just upload button */}
        <button
          type="button"
          onClick={handleClick}
          disabled={uploading}
          className="w-full border-2 border-dashed border-gray-700 hover:border-mambo-blue rounded-lg p-4 text-center transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleFileSelect}
            className="hidden"
          />
          {uploading ? (
            <div className="flex flex-col items-center gap-1.5">
              <div className="animate-spin text-mambo-blue text-lg">⏳</div>
              <span className="text-xs text-gray-400">Uploading...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1.5">
              <FaUpload className="w-5 h-5 text-gray-500" />
              <span className="text-xs font-medium text-gray-400">
                {currentImageUrl ? "Replace" : "Upload"} {label?.toLowerCase() || "image"}
              </span>
              <span className="text-xs text-gray-500">
                JPG, PNG, WebP (5MB max)
              </span>
            </div>
          )}
        </button>

        {/* Remove Button (when image exists) */}
        {currentImageUrl && !uploading && (
          <button
            type="button"
            onClick={handleRemove}
            className="w-full bg-red-900/30 hover:bg-red-900/50 text-red-400 py-1.5 px-3 rounded-lg text-xs font-medium transition flex items-center justify-center gap-1.5 border border-red-800"
          >
            <FaTimes className="w-3 h-3" />
            Remove Image
          </button>
        )}

        {/* Error Message */}
        {error && (
          <div className="text-sm text-red-400 bg-red-900/20 border border-red-800 rounded-lg p-2">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

