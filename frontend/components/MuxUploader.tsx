"use client";

import { useState, useRef, useEffect } from "react";
import { apiClient } from "@/lib/api";
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
  if (!lessonId || typeof lessonId !== 'string' || lessonId.trim() === "") {
    return null;
  }

  // At this point, lessonId is guaranteed to be a valid non-empty string
  const validLessonId = lessonId.trim();

  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "uploading" | "processing" | "live" | "error" | "deleting"
  >(currentPlaybackId ? "live" : "idle");
  const [uploadProgress, setUploadProgress] = useState(0);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const autoRefreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const statusRef = useRef(uploadStatus); // Track status in ref to avoid stale closures
  
  // Keep statusRef in sync with uploadStatus
  useEffect(() => {
    statusRef.current = uploadStatus;
  }, [uploadStatus]);
  
  // Sync with Mux and lesson data on mount and when lesson/playbackId changes
  useEffect(() => {
    const syncWithMux = async () => {
      try {
        // First check if lesson already has video in DB
        const lesson = await apiClient.getLesson(validLessonId);
        
        if (lesson.mux_playback_id && lesson.mux_asset_id) {
          // Video exists in DB - set as live
          console.log(`[MuxUploader] ✅ Video found in DB: playback_id=${lesson.mux_playback_id}`);
          setUploadStatus("live");
          // Preserve filename if we have it, otherwise use "Video"
          if (!selectedFileName) {
            // Try to get filename from lesson or keep as "Video"
            setSelectedFileName("Video");
          }
          // Call onUploadComplete to ensure parent component is updated
          if (onUploadComplete) {
            onUploadComplete(lesson.mux_playback_id, lesson.mux_asset_id);
          }
          return;
        }
        
        // If no video in DB, check Mux directly to sync
        console.log(`[MuxUploader] No video in DB, checking Mux for lesson ${validLessonId}...`);
        const checkResult = await apiClient.checkMuxUploadStatus(validLessonId);
        
        if (checkResult.status === "ready" && checkResult.playback_id && checkResult.asset_id) {
          // Video is ready in Mux but not in DB - sync it
          console.log(`[MuxUploader] ✅ Video found in Mux, syncing to DB...`);
          setUploadStatus("live");
          if (onUploadComplete) {
            onUploadComplete(checkResult.playback_id, checkResult.asset_id);
          }
          // Refresh lesson data
          if (onRefreshLesson) {
            await onRefreshLesson();
          }
        } else {
          // No video found - set idle
          console.log(`[MuxUploader] No video found in Mux or DB, setting status to idle`);
          setUploadStatus("idle");
        }
      } catch (error) {
        console.error("[MuxUploader] Error syncing with Mux:", error);
        // On error, check currentPlaybackId prop as fallback
        if (currentPlaybackId) {
          setUploadStatus("live");
        } else {
          setUploadStatus("idle");
        }
      }
    };
    
    // Only sync if not currently uploading/processing
    if (uploadStatus !== "uploading" && uploadStatus !== "processing") {
      syncWithMux();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [validLessonId, currentPlaybackId]); // Sync when lessonId or currentPlaybackId changes

  // Update status when currentPlaybackId changes (e.g., after refresh from parent)
  useEffect(() => {
    if (currentPlaybackId) {
      setUploadStatus("live");
    } else if (uploadStatus === "live" && !currentPlaybackId) {
      // Video was deleted - verify with DB
      apiClient.getLesson(validLessonId).then(lesson => {
        if (!lesson.mux_playback_id && !lesson.mux_asset_id) {
          setUploadStatus("idle");
        }
      }).catch(() => {
        setUploadStatus("idle");
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPlaybackId]);

  // Build API endpoint URL with validLessonId
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  
  // MuxUploader needs an endpoint that accepts POST and returns { url, uploadId }
  // We'll pass the endpoint with lesson_id in query params
  // The endpoint requires Bearer token auth - MuxUploader should send it via headers
  // If MuxUploader doesn't support custom headers, we fallback to query param token
  const getAuthToken = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("auth_token");
    }
    return null;
  };
  
  // Handle file selection from native file input
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("video/")) {
      alert("Please select a video file");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    setSelectedFileName(file.name);
    setUploadStatus("uploading");
    setUploadProgress(0);

    try {
      // Step 1: Get upload URL from our backend
      const token = getAuthToken();
      const response = await fetch(
        `${API_BASE_URL}/api/mux/upload-url?lesson_id=${validLessonId}&filename=${encodeURIComponent(file.name)}${token ? `&token=${token}` : ''}`,
        {
          method: "POST",
          headers: token ? {
            "Authorization": `Bearer ${token}`,
          } : {},
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to get upload URL: ${errorText}`);
      }

      const data = await response.json();
      const uploadUrl = data.url || data.upload_url;
      
      if (!uploadUrl) {
        throw new Error("No upload URL received from server");
      }

      console.log("[MuxUploader] Upload URL received, starting upload...");

      // Step 2: Upload file directly to Mux using PUT request
      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          setUploadProgress(percentComplete);
          console.log(`[MuxUploader] Upload progress: ${percentComplete.toFixed(1)}%`);
        }
      });

      // Handle upload completion
      xhr.addEventListener("load", () => {
        if (xhr.status === 200 || xhr.status === 201) {
          console.log("[MuxUploader] Upload complete! Waiting for processing...");
          setUploadStatus("processing");
          setUploadProgress(100);
          // Start polling for video availability after webhook processes it
          startPollingForVideo();
        } else {
          throw new Error(`Upload failed with status ${xhr.status}`);
        }
      });

      // Handle upload errors
      xhr.addEventListener("error", () => {
        console.error("[MuxUploader] Upload error:", xhr.statusText);
        setUploadStatus("error");
        setUploadProgress(0);
        setSelectedFileName(null);
        alert("Upload failed. Please check your connection and try again.");
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      });

      xhr.addEventListener("abort", () => {
        console.error("[MuxUploader] Upload aborted");
        setUploadStatus("error");
        setUploadProgress(0);
        setSelectedFileName(null);
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      });

      // Start the upload
      xhr.open("PUT", uploadUrl);
      xhr.setRequestHeader("Content-Type", file.type);
      xhr.send(file);

    } catch (error: any) {
      console.error("[MuxUploader] Error during upload:", error);
      setUploadStatus("error");
      setUploadProgress(0);
      alert(error?.message || "Failed to upload video. Please try again.");
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Handle upload success - MuxUploader provides uploadId in the event
  const handleUploadSuccess = (event: CustomEvent) => {
    console.log("[MuxUploader] Upload complete! Upload ID:", event.detail?.uploadId);
    console.log("[MuxUploader] Starting to poll for video availability...");
    setUploadStatus("processing");
    setUploadProgress(100);
    // Start polling for video availability after webhook processes it
    startPollingForVideo();
  };

  // Handle upload error
  const handleUploadError = (error: any) => {
    console.error("[MuxUploader] Upload error:", error);
    setUploadStatus("error");
    setUploadProgress(0);
    setSelectedFileName(null);
    alert("Upload failed. Please try again.");
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle upload progress
  const handleUploadProgress = (event: CustomEvent) => {
    if (event.detail && typeof event.detail === 'object') {
      const detail = event.detail as any;
      if (detail.percentComplete !== undefined) {
        setUploadProgress(detail.percentComplete);
        if (uploadStatus !== "uploading") {
          setUploadStatus("uploading");
        }
      }
    }
  };

  // Trigger file picker when button is clicked
  const handleUploadButtonClick = () => {
    fileInputRef.current?.click();
  };

  // Function that matches exactly what the "Check Status Now" button does
  const checkStatusFromMux = async () => {
    try {
      console.log("[MuxUploader] Checking status from Mux API...");
      // Use the exact same check as the button
      const checkResult = await apiClient.checkMuxUploadStatus(validLessonId);
      console.log("[MuxUploader] Check result:", checkResult);
      
      if (checkResult.status === "ready" && checkResult.playback_id && checkResult.asset_id) {
        // Video is ready!
        console.log("[MuxUploader] ✅ Video is ready! Syncing to Video Content...");
        statusRef.current = "live";
        setUploadStatus("live");
        onUploadComplete(checkResult.playback_id, checkResult.asset_id);
        if (onRefreshLesson) {
          await onRefreshLesson();
        }
        // Clear polling if running
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
        if (autoRefreshIntervalRef.current) {
          clearInterval(autoRefreshIntervalRef.current);
          autoRefreshIntervalRef.current = null;
        }
      } else {
        // Fallback: Check the lesson directly (same as button fallback)
        try {
          const lesson = await apiClient.getLesson(validLessonId);
          if (lesson.mux_playback_id && lesson.mux_asset_id) {
            console.log("[MuxUploader] ✅ Video found in lesson! Syncing to Video Content...");
            statusRef.current = "live";
            setUploadStatus("live");
            onUploadComplete(lesson.mux_playback_id, lesson.mux_asset_id);
            if (onRefreshLesson) {
              await onRefreshLesson();
            }
            // Clear polling if running
            if (pollIntervalRef.current) {
              clearInterval(pollIntervalRef.current);
              pollIntervalRef.current = null;
            }
            if (autoRefreshIntervalRef.current) {
              clearInterval(autoRefreshIntervalRef.current);
              autoRefreshIntervalRef.current = null;
            }
          } else {
            console.log("[MuxUploader] Video still processing...");
          }
        } catch (fallbackError) {
          console.error("[MuxUploader] Error in fallback check:", fallbackError);
        }
      }
    } catch (error: any) {
      console.error("[MuxUploader] Error checking status:", error);
    }
  };

  // Poll for video availability after upload completes - check Mux API every 5 seconds
  // Uses the exact same logic as the "Check Status Now" button
  const startPollingForVideo = async () => {
    console.log("[MuxUploader] Starting auto-check every 5 seconds (same as button)...");
    
    // Check immediately
    checkStatusFromMux();
    
    // Then check every 5 seconds
    pollIntervalRef.current = setInterval(async () => {
      // Check current status using ref (avoids stale closure)
      const currentStatus = statusRef.current;
      if (currentStatus !== "processing" && currentStatus !== "uploading") {
        // Status changed, stop polling
        console.log("[MuxUploader] Status changed to", currentStatus, "- stopping auto-check");
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
        return;
      }
      
      // Status is still processing, call the check function (same as button)
      console.log("[MuxUploader] Auto-check triggered (every 5 seconds) - calling checkStatusFromMux...");
      await checkStatusFromMux();
    }, 5000);
  };

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
      if (autoRefreshIntervalRef.current) {
        clearInterval(autoRefreshIntervalRef.current);
      }
    };
  }, []);

  const handleDeleteVideo = async () => {
    if (!confirm("Are you sure you want to delete this video? This action cannot be undone.")) {
      return;
    }

    try {
      // Get current lesson to find asset_id
      const lesson = await apiClient.getLesson(validLessonId);
      
      if (!lesson.mux_asset_id) {
        // No asset ID - just clear from DB
        console.log("[MuxUploader] No asset ID found, clearing from DB only");
        if (onDeleteVideo) {
          await onDeleteVideo();
        }
        setSelectedFileName(null);
        setUploadStatus("idle");
        setUploadProgress(0);
        return;
      }
      
      const assetIdToDelete = lesson.mux_asset_id;
      console.log(`[MuxUploader] Starting deletion of asset ${assetIdToDelete} from Mux...`);
      
      // Step 1: Set status to "deleting"
      setUploadStatus("deleting");
      
      // Step 2: Delete from Mux
      try {
        await apiClient.deleteMuxAsset(assetIdToDelete);
        console.log("[MuxUploader] Delete request sent to Mux API");
      } catch (deleteError: any) {
        // If 404, asset might already be deleted - continue anyway
        if (deleteError.message?.includes("404") || deleteError.message?.includes("Not Found")) {
          console.log("[MuxUploader] Asset not found in Mux (already deleted), continuing...");
        } else {
          throw deleteError;
        }
      }
      
      // Step 3: Poll Mux API to verify deletion (check if asset still exists)
      console.log("[MuxUploader] Verifying deletion from Mux...");
      let deletionVerified = false;
      let attempts = 0;
      const maxAttempts = 15; // Check for up to 15 seconds
      
      while (!deletionVerified && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second between checks
        
        try {
          // Check if asset still exists in Mux
          const assetCheck = await apiClient.checkMuxAssetExists(assetIdToDelete);
          
          if (!assetCheck.exists) {
            // Asset deleted from Mux!
            deletionVerified = true;
            console.log("[MuxUploader] ✅ Deletion verified - asset no longer exists in Mux");
            break;
          }
          
          console.log(`[MuxUploader] Asset still exists in Mux, waiting... (attempt ${attempts + 1}/${maxAttempts})`);
          attempts++;
        } catch (error) {
          // If error checking, assume deletion is proceeding
          console.log(`[MuxUploader] Error checking asset status, continuing... (attempt ${attempts + 1}/${maxAttempts})`);
          attempts++;
          if (attempts >= maxAttempts) {
            // After max attempts, assume deletion is complete
            deletionVerified = true;
            break;
          }
        }
      }
      
      if (!deletionVerified) {
        console.log("[MuxUploader] ⚠️ Deletion verification timeout - asset may still exist in Mux");
      }
      
      // Step 4: Clear from DB
      console.log("[MuxUploader] Clearing video from database...");
      if (onDeleteVideo) {
        await onDeleteVideo();
      }
      
      // Step 5: Refresh lesson data to ensure sync
      if (onRefreshLesson) {
        await onRefreshLesson();
      }
      
      // Step 6: Reset local state
      setSelectedFileName(null);
      setUploadStatus("idle");
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      
      console.log("[MuxUploader] ✅ Video deleted and removed from Video Content");
    } catch (error: any) {
      console.error("Error deleting video:", error);
      setUploadStatus("error");
      alert(error?.message || "Failed to delete video from Mux. Please try again.");
    }
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
            onClick={async () => {
              // Manual refresh - check lesson status and sync from Mux if needed
              try {
                console.log("[MuxUploader] Manual status check triggered...");
                // Check Mux API directly
                const checkResult = await apiClient.checkMuxUploadStatus(validLessonId);
                console.log("[MuxUploader] Check result:", checkResult);
                
                if (checkResult.status === "ready" && checkResult.playback_id && checkResult.asset_id) {
                  // Video is ready!
                  setUploadStatus("live");
                  onUploadComplete(checkResult.playback_id, checkResult.asset_id);
                  if (onRefreshLesson) {
                    await onRefreshLesson();
                  }
                  // Clear polling if running
                  if (pollIntervalRef.current) {
                    clearInterval(pollIntervalRef.current);
                    pollIntervalRef.current = null;
                  }
                  if (autoRefreshIntervalRef.current) {
                    clearInterval(autoRefreshIntervalRef.current);
                    autoRefreshIntervalRef.current = null;
                  }
                } else {
                  // Check the lesson directly as fallback
                  const lesson = await apiClient.getLesson(validLessonId);
                  if (lesson.mux_playback_id && lesson.mux_asset_id) {
                    setUploadStatus("live");
                    onUploadComplete(lesson.mux_playback_id, lesson.mux_asset_id);
                    if (onRefreshLesson) {
                      await onRefreshLesson();
                    }
                    // Clear polling if running
                    if (pollIntervalRef.current) {
                      clearInterval(pollIntervalRef.current);
                      pollIntervalRef.current = null;
                    }
                    if (autoRefreshIntervalRef.current) {
                      clearInterval(autoRefreshIntervalRef.current);
                      autoRefreshIntervalRef.current = null;
                    }
                  } else {
                    alert("Video is still processing. Please check again in a moment.");
                  }
                }
              } catch (error: any) {
                console.error("Error checking status:", error);
                alert("Error checking status: " + (error?.message || "Unknown error"));
              }
            }}
            className="text-xs text-yellow-300 hover:text-yellow-200 underline"
          >
            Check Status Now (Sync from Mux)
          </button>
        </div>
      )}
      
      {uploadStatus === "error" && (
        <div className="p-3 bg-red-900/20 border border-red-700/50 rounded-lg">
          <p className="text-sm text-red-400 font-medium mb-2">
            Upload Failed
          </p>
          <p className="text-xs text-red-300">
            Please try again. If the problem persists, check your connection and file format.
          </p>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        onChange={handleFileSelect}
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
                  {selectedFileName && (
                    <div className="text-gray-400 text-xs mt-1">{selectedFileName}</div>
                  )}
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
                <div className="text-white text-sm font-medium truncate">
                  {selectedFileName || "Video"}
                </div>
                <div className="text-green-400 text-xs mt-0.5">Ready</div>
              </div>
            </div>
            {onDeleteVideo && (
              <button
                onClick={handleDeleteVideo}
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

