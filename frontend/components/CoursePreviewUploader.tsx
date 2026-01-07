"use client";

import { useState, useRef, useEffect } from "react";
import { apiClient } from "@/lib/api";
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
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "processing" | "live" | "error" | "deleting">(
    currentPlaybackId ? "live" : "idle"
  );
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const statusRef = useRef(uploadStatus); // Track status in ref to avoid stale closures
  
  // Keep statusRef in sync with uploadStatus
  useEffect(() => {
    statusRef.current = uploadStatus;
  }, [uploadStatus]);

  // Sync with Mux and course data on mount and when course/playbackId changes (same as MuxUploader)
  useEffect(() => {
    const syncWithMux = async () => {
      try {
        // First check if course already has preview video in DB
        const course = await apiClient.getCourseFullDetails(courseId);
        
        if (course.mux_preview_playback_id && (course as any).mux_preview_asset_id) {
          // Video exists in DB - verify it exists in Mux
          console.log(`[CoursePreviewUploader] ✅ Preview found in DB: playback_id=${course.mux_preview_playback_id}`);
          
          // Verify video actually exists in Mux
          if ((course as any).mux_preview_asset_id) {
            try {
              const assetCheck = await apiClient.checkMuxAssetExists((course as any).mux_preview_asset_id);
              if (assetCheck.exists) {
                // Video exists in Mux - set as live
                setUploadStatus("live");
                if (onUploadComplete) {
                  onUploadComplete(course.mux_preview_playback_id);
                }
                return;
              } else {
                // Video doesn't exist in Mux - clear from DB
                console.log(`[CoursePreviewUploader] ⚠️ Video not found in Mux, clearing from DB...`);
                await apiClient.updateCourse(courseId, {
                  mux_preview_playback_id: undefined,
                  mux_preview_asset_id: undefined,
                });
                setUploadStatus("idle");
                if (onUploadComplete) {
                  onUploadComplete("");
                }
                if (onRefreshCourse) {
                  await onRefreshCourse();
                }
                return;
              }
            } catch (error) {
              console.error("[CoursePreviewUploader] Error checking asset in Mux:", error);
              // On error, assume it exists (don't clear)
              setUploadStatus("live");
              if (onUploadComplete) {
                onUploadComplete(course.mux_preview_playback_id);
              }
              return;
            }
          } else {
            // No asset_id - just set as live based on playback_id
            setUploadStatus("live");
            if (onUploadComplete) {
              onUploadComplete(course.mux_preview_playback_id);
            }
            return;
          }
        }
        
        // If no video in DB, check Mux directly to sync
        console.log(`[CoursePreviewUploader] No preview in DB, checking Mux for course ${courseId}...`);
        const checkResult = await apiClient.checkMuxUploadStatus(undefined, courseId);
        
        if (checkResult.status === "ready" && checkResult.playback_id && checkResult.asset_id) {
          // Video is ready in Mux but not in DB - sync it
          console.log(`[CoursePreviewUploader] ✅ Preview found in Mux, syncing to DB...`);
          setUploadStatus("live");
          if (onUploadComplete) {
            onUploadComplete(checkResult.playback_id);
          }
          // Refresh course data
          if (onRefreshCourse) {
            await onRefreshCourse();
          }
        } else {
          // No video found - set idle
          console.log(`[CoursePreviewUploader] No preview found in Mux or DB, setting status to idle`);
          setUploadStatus("idle");
        }
      } catch (error) {
        console.error("[CoursePreviewUploader] Error syncing with Mux:", error);
        // On error, check currentPlaybackId prop as fallback
        if (currentPlaybackId) {
          setUploadStatus("live");
        } else {
          setUploadStatus("idle");
        }
      }
    };

    // Only sync if not currently uploading or processing
    if (uploadStatus !== "uploading" && uploadStatus !== "processing") {
      syncWithMux();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, currentPlaybackId]);

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

    setUploadStatus("uploading");
    setUploadProgress(0);

    try {
      // Create Mux upload URL using API client
      const { upload_url, upload_id } = await apiClient.createMuxUploadUrl(
        undefined,  // No lesson_id for course preview
        file.name,
        courseId    // Pass course_id for course preview
      );
      
      if (!upload_url || !upload_id) {
        throw new Error("No upload URL received from server");
      }

      // Upload file directly to Mux using PUT request
      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          setUploadProgress(percentComplete);
        }
      });

      // Handle upload completion
      xhr.addEventListener("load", () => {
        if (xhr.status === 200 || xhr.status === 201) {
          console.log("[CoursePreviewUploader] Upload complete! Starting to poll for video availability...");
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
        console.error("[CoursePreviewUploader] Upload error:", xhr.statusText);
        setUploadStatus("error");
        setUploadProgress(0);
        alert("Upload failed. Please check your connection and try again.");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      });

      xhr.addEventListener("abort", () => {
        console.error("[CoursePreviewUploader] Upload aborted");
        setUploadStatus("error");
        setUploadProgress(0);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      });

      // Start the upload
      xhr.open("PUT", upload_url);
      xhr.setRequestHeader("Content-Type", file.type);
      xhr.send(file);

    } catch (error: any) {
      console.error("[CoursePreviewUploader] Error during upload:", error);
      setUploadStatus("error");
      setUploadProgress(0);
      alert(error?.message || "Failed to upload video. Please try again.");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Function that checks status from Mux API (same pattern as MuxUploader)
  const checkStatusFromMux = async () => {
    try {
      console.log("[CoursePreviewUploader] Checking status from Mux API...");
      const checkResult = await apiClient.checkMuxUploadStatus(undefined, courseId);
      console.log("[CoursePreviewUploader] Check result:", checkResult);
      
      if (checkResult.status === "ready" && checkResult.playback_id && checkResult.asset_id) {
        // Video is ready!
        console.log("[CoursePreviewUploader] ✅ Video is ready! Syncing to Course Preview...");
        statusRef.current = "live";
        setUploadStatus("live");
        onUploadComplete(checkResult.playback_id);
        if (onRefreshCourse) {
          await onRefreshCourse();
        }
        // Clear polling if running
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
      } else {
        // Fallback: Check the course directly
        try {
          const course = await apiClient.getCourseFullDetails(courseId);
          if (course.mux_preview_playback_id && (course as any).mux_preview_asset_id) {
            // Verify it exists in Mux
            try {
              const assetCheck = await apiClient.checkMuxAssetExists((course as any).mux_preview_asset_id);
              if (assetCheck.exists) {
                console.log("[CoursePreviewUploader] ✅ Video found in course and Mux! Syncing to Course Preview...");
                statusRef.current = "live";
                setUploadStatus("live");
                onUploadComplete(course.mux_preview_playback_id);
                if (onRefreshCourse) {
                  await onRefreshCourse();
                }
                // Clear polling if running
                if (pollIntervalRef.current) {
                  clearInterval(pollIntervalRef.current);
                  pollIntervalRef.current = null;
                }
              } else {
                console.log("[CoursePreviewUploader] Video not found in Mux, clearing from DB...");
                await apiClient.updateCourse(courseId, {
                  mux_preview_playback_id: undefined,
                  mux_preview_asset_id: undefined,
                });
                setUploadStatus("idle");
                if (onRefreshCourse) {
                  await onRefreshCourse();
                }
              }
            } catch (error) {
              console.error("[CoursePreviewUploader] Error checking asset:", error);
            }
          } else {
            console.log("[CoursePreviewUploader] Video still processing...");
          }
        } catch (fallbackError) {
          console.error("[CoursePreviewUploader] Error in fallback check:", fallbackError);
        }
      }
    } catch (error: any) {
      console.error("[CoursePreviewUploader] Error checking status:", error);
    }
  };

  // Poll for video availability after upload completes - check Mux API every 5 seconds
  const startPollingForVideo = async () => {
    console.log("[CoursePreviewUploader] Starting auto-check every 5 seconds...");
    
    // Check immediately
    checkStatusFromMux();
    
    // Then check every 5 seconds
    pollIntervalRef.current = setInterval(async () => {
      const currentStatus = statusRef.current;
      if (currentStatus !== "processing" && currentStatus !== "uploading") {
        console.log("[CoursePreviewUploader] Status changed to", currentStatus, "- stopping auto-check");
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
        return;
      }
      
      console.log("[CoursePreviewUploader] Auto-check triggered (every 5 seconds)...");
      await checkStatusFromMux();
    }, 5000);
  };

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  const handleDelete = async () => {
    if (!currentPlaybackId) return;
    
    if (!confirm("Are you sure you want to delete this preview video? This action cannot be undone.")) {
      return;
    }
    
    try {
      // Get current course to find asset_id
      const course = await apiClient.getCourseFullDetails(courseId);
      
      if (!(course as any).mux_preview_asset_id) {
        // No asset ID - just clear from DB
        console.log("[CoursePreviewUploader] No asset ID found, clearing from DB only");
        await apiClient.updateCourse(courseId, {
          mux_preview_playback_id: undefined,
          mux_preview_asset_id: undefined,
        });
        setUploadStatus("idle");
        onUploadComplete("");
        if (onRefreshCourse) {
          await onRefreshCourse();
        }
        return;
      }
      
      const assetIdToDelete = (course as any).mux_preview_asset_id;
      console.log(`[CoursePreviewUploader] Starting deletion of asset ${assetIdToDelete} from Mux...`);
      
      // Step 1: Set status to "deleting"
      setUploadStatus("deleting");
      
      // Step 2: Delete from Mux
      try {
        await apiClient.deleteMuxAsset(assetIdToDelete);
        console.log("[CoursePreviewUploader] Delete request sent to Mux API");
      } catch (deleteError: any) {
        // If 404, asset might already be deleted - continue anyway
        if (deleteError.message?.includes("404") || deleteError.message?.includes("Not Found")) {
          console.log("[CoursePreviewUploader] Asset not found in Mux (already deleted), continuing...");
        } else {
          throw deleteError;
        }
      }
      
      // Step 3: Poll Mux API to verify deletion (check if asset still exists)
      console.log("[CoursePreviewUploader] Verifying deletion from Mux...");
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
            console.log("[CoursePreviewUploader] ✅ Deletion verified - asset no longer exists in Mux");
            break;
          }
          
          console.log(`[CoursePreviewUploader] Asset still exists in Mux, waiting... (attempt ${attempts + 1}/${maxAttempts})`);
          attempts++;
        } catch (error) {
          // If error checking, assume deletion is proceeding
          console.log(`[CoursePreviewUploader] Error checking asset status, continuing... (attempt ${attempts + 1}/${maxAttempts})`);
          attempts++;
          if (attempts >= maxAttempts) {
            // After max attempts, assume deletion is complete
            deletionVerified = true;
            break;
          }
        }
      }
      
      if (!deletionVerified) {
        console.log("[CoursePreviewUploader] ⚠️ Deletion verification timeout - asset may still exist in Mux");
      }
      
      // Step 4: Clear from DB
      console.log("[CoursePreviewUploader] Clearing preview from database...");
      await apiClient.updateCourse(courseId, {
        mux_preview_playback_id: undefined,
        mux_preview_asset_id: undefined,
      });
      
      // Step 5: Refresh course data to ensure sync
      if (onRefreshCourse) {
        await onRefreshCourse();
      }
      
      // Step 6: Reset local state
      setUploadStatus("idle");
      setUploadProgress(0);
      onUploadComplete("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      
      console.log("[CoursePreviewUploader] ✅ Preview video deleted and removed from Course Preview");
    } catch (error: any) {
      console.error("[CoursePreviewUploader] Error deleting preview:", error);
      setUploadStatus("error");
      alert(error?.message || "Failed to delete preview from Mux. Please try again.");
    }
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
              onClick={handleDelete}
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
              onChange={handleFileSelect}
              className="hidden"
              id={`preview-upload-${courseId}`}
              disabled={uploadStatus === "uploading" || uploadStatus === "processing" || uploadStatus === "deleting"}
            />
            <label
              htmlFor={`preview-upload-${courseId}`}
              className={`inline-flex items-center gap-2 px-4 py-2 bg-mambo-blue hover:bg-blue-600 text-white font-semibold rounded-lg transition cursor-pointer ${
                uploadStatus === "uploading" || uploadStatus === "processing" || uploadStatus === "deleting" ? "opacity-50 cursor-not-allowed" : ""
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
                onClick={async () => {
                  try {
                    console.log("[CoursePreviewUploader] Manual status check triggered...");
                    const checkResult = await apiClient.checkMuxUploadStatus(undefined, courseId);
                    console.log("[CoursePreviewUploader] Check result:", checkResult);
                    
                    if (checkResult.status === "ready" && checkResult.playback_id && checkResult.asset_id) {
                      setUploadStatus("live");
                      onUploadComplete(checkResult.playback_id);
                      if (onRefreshCourse) {
                        await onRefreshCourse();
                      }
                      if (pollIntervalRef.current) {
                        clearInterval(pollIntervalRef.current);
                        pollIntervalRef.current = null;
                      }
                    } else {
                      const course = await apiClient.getCourseFullDetails(courseId);
                      if (course.mux_preview_playback_id && (course as any).mux_preview_asset_id) {
                        // Verify it exists
                        const assetCheck = await apiClient.checkMuxAssetExists((course as any).mux_preview_asset_id);
                        if (assetCheck.exists) {
                          setUploadStatus("live");
                          onUploadComplete(course.mux_preview_playback_id);
                          if (onRefreshCourse) {
                            await onRefreshCourse();
                          }
                          if (pollIntervalRef.current) {
                            clearInterval(pollIntervalRef.current);
                            pollIntervalRef.current = null;
                          }
                        } else {
                          alert("Video is still processing. Please check again in a moment.");
                        }
                      } else {
                        alert("Video is still processing. Please check again in a moment.");
                      }
                    }
                  } catch (error: any) {
                    console.error("[CoursePreviewUploader] Error checking status:", error);
                    alert("Failed to check status. Please try again.");
                  }
                }}
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
                <button
                  onClick={() => {
                    setUploadStatus("idle");
                    setUploadProgress(0);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = "";
                    }
                  }}
                  className="text-red-400 hover:text-red-300 text-xs"
                >
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
