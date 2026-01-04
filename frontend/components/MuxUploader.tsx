"use client";

import { useState, useRef } from "react";
import { apiClient } from "@/lib/api";
import { FaUpload, FaCheck, FaSpinner } from "react-icons/fa";

interface MuxUploaderProps {
  lessonId: string;
  onUploadComplete: (playbackId: string, assetId: string) => void;
  currentPlaybackId?: string | null;
}

export default function MuxUploader({
  lessonId,
  onUploadComplete,
  currentPlaybackId,
}: MuxUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "uploading" | "processing" | "complete" | "error"
  >("idle");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("video/")) {
      alert("Please select a video file");
      return;
    }

    setUploading(true);
    setUploadStatus("uploading");
    setUploadProgress(0);

    try {
      // Step 1: Get upload URL from backend
      const { upload_id, upload_url } = await apiClient.createMuxUploadUrl(
        lessonId,
        file.name
      );

      // Step 2: Upload file directly to Mux
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100;
          setUploadProgress(percentComplete);
        }
      });

      xhr.addEventListener("load", () => {
        if (xhr.status === 200 || xhr.status === 201) {
          setUploadStatus("processing");
          setUploadProgress(100);
          setUploading(false);
          // Note: In production, you should poll the Mux API for asset status
          // or wait for the webhook to fire. For now, we'll notify that processing is happening.
          // The webhook will automatically update the lesson with playback_id and asset_id
          alert(
            "Upload complete! Video is being processed by Mux. It will be available shortly (the webhook will update the lesson automatically)."
          );
          // In a production setup, you might want to poll the Mux API here
          // to get the playback_id immediately, or wait for the webhook
        } else {
          setUploadStatus("error");
          setUploading(false);
          alert("Upload failed. Please try again.");
        }
      });

      xhr.addEventListener("error", () => {
        setUploadStatus("error");
        setUploading(false);
        alert("Upload failed. Please try again.");
      });

      xhr.open("PUT", upload_url);
      xhr.setRequestHeader("Content-Type", file.type);
      xhr.send(file);
    } catch (error: any) {
      console.error("Upload error:", error);
      setUploadStatus("error");
      setUploading(false);
      alert(error.message || "Failed to start upload");
    }
  };

  return (
    <div className="space-y-3">
      {currentPlaybackId ? (
        <div className="flex items-center gap-2 text-green-400 text-sm">
          <FaCheck />
          <span>Video uploaded (Mux ID: {currentPlaybackId})</span>
        </div>
      ) : null}

      <div className="flex items-center gap-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 bg-mambo-blue hover:bg-blue-600 px-4 py-2 rounded-lg text-white text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? (
            <>
              <FaSpinner className="animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <FaUpload />
              {currentPlaybackId ? "Replace Video" : "Upload Video to Mux"}
            </>
          )}
        </button>
      </div>

      {uploading && (
        <div className="w-full bg-gray-800 rounded-full h-2">
          <div
            className="bg-mambo-blue h-2 rounded-full transition-all"
            style={{ width: `${uploadProgress}%` }}
          />
        </div>
      )}

      {uploadStatus === "processing" && (
        <p className="text-sm text-gray-400">
          Video is being processed by Mux. This may take a few minutes...
        </p>
      )}
    </div>
  );
}

