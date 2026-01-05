"use client";

import { useState, useRef } from "react";
import { FaUpload, FaTimes, FaImage } from "react-icons/fa";
import Image from "next/image";
import { apiClient } from "@/lib/api";

interface ImageUploaderProps {
  currentImageUrl?: string | null;
  onImageUploaded: (url: string) => void;
  onImageRemoved?: () => void;
  label?: string;
  className?: string;
}

export default function ImageUploader({
  currentImageUrl,
  onImageUploaded,
  onImageRemoved,
  label = "Thumbnail",
  className = "",
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
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
      const result = await apiClient.uploadImage(file);
      const fullUrl = result.url.startsWith("http")
        ? result.url
        : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}${result.url}`;
      
      setPreviewUrl(fullUrl);
      onImageUploaded(fullUrl);
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
    setPreviewUrl(null);
    if (onImageRemoved) {
      onImageRemoved();
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={className}>
      {label && (
        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
          {label}
        </label>
      )}
      
      <div className="space-y-3">
        {/* Preview */}
        {previewUrl && (
          <div className="relative w-full h-48 bg-gray-900 rounded-lg overflow-hidden border border-gray-700">
            <Image
              src={previewUrl}
              alt="Preview"
              fill
              className="object-cover"
              unoptimized={previewUrl.startsWith("http://localhost:8000")}
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-2 right-2 p-2 bg-red-600 hover:bg-red-700 text-white rounded-full transition"
              title="Remove image"
            >
              <FaTimes className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Upload Button */}
        {!previewUrl && (
          <button
            type="button"
            onClick={handleClick}
            disabled={uploading}
            className="w-full border-2 border-dashed border-gray-700 hover:border-mambo-blue rounded-lg p-8 text-center transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleFileSelect}
              className="hidden"
            />
            {uploading ? (
              <div className="flex flex-col items-center gap-2">
                <div className="animate-spin text-mambo-blue">⏳</div>
                <span className="text-sm text-gray-400">Uploading...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <FaUpload className="w-8 h-8 text-gray-500" />
                <span className="text-sm font-medium text-gray-400">
                  Click to upload {label.toLowerCase()}
                </span>
                <span className="text-xs text-gray-500">JPG, PNG, or WebP (max 5MB)</span>
              </div>
            )}
          </button>
        )}

        {/* Replace Button (when image exists) */}
        {previewUrl && !uploading && (
          <button
            type="button"
            onClick={handleClick}
            className="w-full bg-gray-800 hover:bg-gray-700 text-gray-300 py-2 px-4 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2"
          >
            <FaImage />
            Replace Image
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

