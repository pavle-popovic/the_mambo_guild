"use client";

import { useRef, useState } from "react";
import { useMuxVideoUpload } from "@/hooks/useMuxVideoUpload";
import { FaCheck, FaSpinner, FaTrash, FaUpload } from "react-icons/fa";

interface MuxUploaderProps {
  lessonId: string | undefined; // Allow undefined for new lessons
  onUploadComplete: (playbackId: string, assetId: string) => void;
  currentPlaybackId?: string | null;
  onRefreshLesson?: () => Promise<void>; // Optional callback to refresh lesson data
  onDeleteVideo?: () => Promise<void>; // Optional callback to delete video
}

// Simple uploader component for NEW lessons (no lessonId)
function NewLessonMuxUploader({
  onUploadComplete,
  currentPlaybackId,
  onDeleteVideo,
}: Omit<MuxUploaderProps, 'lessonId' | 'onRefreshLesson'>) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'processing' | 'live' | 'error' | 'deleting'>(
    currentPlaybackId ? 'live' : 'idle'
  );
  const [uploadProgress, setUploadProgress] = useState(0);
  const [pendingAssetId, setPendingAssetId] = useState<string | null>(null);

  const handleFileInputChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadStatus('uploading');
    setUploadProgress(0);

    try {
      // Get upload URL without attaching to a specific lesson
      const token = localStorage.getItem('auth_token');
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/mux/upload-url`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({}), // No lesson_id for new lessons
        }
      );

      if (!res.ok) throw new Error('Failed to get upload URL');

      const { upload_url, upload_id } = await res.json();

      // Upload to Mux
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', upload_url, true);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          setUploadProgress(Math.round((e.loaded / e.total) * 100));
        }
      };

      xhr.onload = async () => {
        if (xhr.status === 200) {
          setUploadStatus('processing');

          // Poll for asset info using the new endpoint
          const pollInterval = setInterval(async () => {
            try {
              const statusRes = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/mux/upload-status/${upload_id}`,
                {
                  headers: token ? { Authorization: `Bearer ${token}` } : {},
                }
              );

              if (statusRes.ok) {
                const data = await statusRes.json();
                console.log('[NewLessonMuxUploader] Poll status:', data);

                // Check if asset is ready with playback_id
                if (data.status === 'ready' && data.playback_id && data.asset_id) {
                  clearInterval(pollInterval);
                  setPendingAssetId(data.asset_id);
                  setUploadStatus('live');
                  onUploadComplete(data.playback_id, data.asset_id);
                } else if (data.status === 'errored') {
                  clearInterval(pollInterval);
                  setUploadStatus('error');
                }
                // Continue polling if status is "waiting" or "asset_created"
              }
            } catch (err) {
              console.error('Error polling status:', err);
            }
          }, 3000);

          // Stop polling after 5 minutes
          setTimeout(() => {
            clearInterval(pollInterval);
            // If still processing after 5 minutes, show a message
            if (uploadStatus === 'processing') {
              console.warn('[NewLessonMuxUploader] Polling timeout - video may still be processing');
            }
          }, 300000);
        } else {
          setUploadStatus('error');
        }
      };

      xhr.onerror = () => setUploadStatus('error');
      xhr.send(file);

    } catch (err) {
      console.error('Upload error:', err);
      setUploadStatus('error');
    }
  };

  const handleDelete = async () => {
    if (onDeleteVideo) {
      setUploadStatus('deleting');
      try {
        await onDeleteVideo();
        setUploadStatus('idle');
        setPendingAssetId(null);
      } catch (err) {
        console.error('Delete error:', err);
        setUploadStatus('live');
      }
    }
  };

  const isDeleting = uploadStatus === 'deleting';

  return (
    <div className="space-y-3">
      {uploadStatus === 'deleting' && (
        <div className="flex items-center gap-2 p-3 bg-orange-900/20 border border-orange-700/50 rounded-lg text-orange-400 text-sm">
          <FaSpinner className="animate-spin" />
          <span>Deleting video...</span>
        </div>
      )}

      {uploadStatus === 'processing' && (
        <div className="space-y-2 p-3 bg-yellow-900/20 border border-yellow-700/50 rounded-lg">
          <div className="flex items-center gap-2 text-yellow-400 text-sm">
            <FaSpinner className="animate-spin" />
            <span>Processing video... This may take a few minutes.</span>
          </div>
          <p className="text-xs text-yellow-300/70">
            Mux is encoding your video. The page will update automatically when ready.
          </p>
        </div>
      )}

      {uploadStatus === 'error' && (
        <div className="p-3 bg-red-900/20 border border-red-700/50 rounded-lg">
          <p className="text-sm text-red-400 font-medium mb-2">Upload Failed</p>
          <button
            onClick={() => setUploadStatus('idle')}
            className="text-xs text-red-400 hover:text-red-300 underline"
          >
            Try Again
          </button>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        onChange={handleFileInputChange}
        className="hidden"
      />

      <div className="space-y-3">
        {uploadStatus === 'uploading' && (
          <div className="space-y-2 p-3 bg-blue-900/20 border border-blue-700/50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-blue-400 text-sm font-medium">
                <FaSpinner className="animate-spin" />
                <span>Uploading...</span>
              </div>
              <span className="text-blue-300 text-xs font-mono">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {uploadStatus === 'idle' && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-mambo-blue hover:bg-blue-600 text-white font-bold rounded-lg transition"
          >
            <FaUpload />
            Upload Video File
          </button>
        )}

        {uploadStatus === 'live' && currentPlaybackId && !isDeleting && (
          <div className="flex items-center justify-between p-4 bg-green-900/30 border border-green-700/50 rounded-lg">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                <FaCheck className="text-green-400 text-lg" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-green-400 text-sm font-bold">Video Detected</div>
                <div className="text-green-300/70 text-xs mt-0.5">Ready to play</div>
              </div>
            </div>
            {onDeleteVideo && (
              <button
                onClick={handleDelete}
                className="text-red-400 hover:text-red-300 hover:bg-red-900/30 px-3 py-2 rounded-lg transition flex-shrink-0 flex items-center gap-2 text-sm font-medium border border-red-700/50 cursor-pointer"
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

export default function MuxUploader({
  lessonId,
  onUploadComplete,
  currentPlaybackId,
  onRefreshLesson,
  onDeleteVideo,
}: MuxUploaderProps) {
  // For NEW lessons (no lessonId), use simplified uploader
  if (!lessonId || typeof lessonId !== "string" || lessonId.trim() === "") {
    return (
      <NewLessonMuxUploader
        onUploadComplete={onUploadComplete}
        currentPlaybackId={currentPlaybackId}
        onDeleteVideo={onDeleteVideo}
      />
    );
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
      } as any);
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

  const isDeleting = uploadStatus === "deleting";

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
        {uploadStatus === "live" && currentPlaybackId && !isDeleting && (
          <div className="flex items-center justify-between p-4 bg-green-900/30 border border-green-700/50 rounded-lg">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                <FaCheck className="text-green-400 text-lg" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-green-400 text-sm font-bold">Video Detected</div>
                <div className="text-green-300/70 text-xs mt-0.5">Ready to play</div>
              </div>
            </div>
            {onDeleteVideo && (
              <button
                onClick={handleDelete}
                className="text-red-400 hover:text-red-300 hover:bg-red-900/30 px-3 py-2 rounded-lg transition flex-shrink-0 flex items-center gap-2 text-sm font-medium border border-red-700/50 cursor-pointer"
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
