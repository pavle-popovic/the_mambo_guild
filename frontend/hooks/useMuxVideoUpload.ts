"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api";

export type UploadStatus = "idle" | "uploading" | "processing" | "live" | "error" | "deleting";

interface UseMuxVideoUploadOptions {
  entityId?: string; // lesson_id, course_id, level_id, or post_id
  entityType: "lesson" | "course" | "level" | "community";
  currentPlaybackId?: string | null;
  onUploadComplete: (playbackId: string, assetId: string) => void;
  onRefresh?: () => Promise<void>;
  onDelete?: () => Promise<void>;
}

interface UseMuxVideoUploadReturn {
  uploadStatus: UploadStatus;
  uploadProgress: number;
  handleFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  handleDelete: () => Promise<void>;
  checkStatus: () => Promise<void>;
  resetError: () => void;
}

export function useMuxVideoUpload({
  entityId,
  entityType,
  currentPlaybackId,
  onUploadComplete,
  onRefresh,
  onDelete,
}: UseMuxVideoUploadOptions): UseMuxVideoUploadReturn {
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>(
    currentPlaybackId ? "live" : "idle"
  );
  const [uploadProgress, setUploadProgress] = useState(0);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const statusRef = useRef(uploadStatus);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Keep statusRef in sync with uploadStatus
  useEffect(() => {
    statusRef.current = uploadStatus;
  }, [uploadStatus]);

  // Sync with Mux and entity data on mount and when entity/playbackId changes
  useEffect(() => {
    const syncWithMux = async () => {
      // Don't sync if currently uploading or processing
      if (uploadStatus === "uploading" || uploadStatus === "processing") {
        return;
      }

      try {
        let entity: any = null;
        let playbackId: string | null = null;
        let assetId: string | null = null;

        // Fetch entity data based on type
        if (entityType === "lesson") {
          entity = await apiClient.getLesson(entityId!);
          playbackId = entity.mux_playback_id;
          assetId = entity.mux_asset_id;
        } else if (entityType === "course") {
          entity = await apiClient.getCourseFullDetails(entityId!);
          playbackId = entity.mux_preview_playback_id;
          assetId = (entity as any).mux_preview_asset_id;
        } else if (entityType === "level") {
          // Level preview videos - fetch level details
          try {
            const response = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/api/admin/levels/${entityId}`,
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
              }
            );
            if (response.ok) {
              entity = await response.json();
              playbackId = entity.mux_preview_playback_id || null;
              assetId = entity.mux_preview_asset_id || null;
            }
          } catch (e) {
            console.log("[useMuxVideoUpload] Level not found");
          }
        } else if (entityType === "community") {
          // Community posts - check if post exists
          try {
            entity = await apiClient.getPost(entityId!);
            playbackId = entity.mux_playback_id || null;
            assetId = entity.mux_asset_id || null;
          } catch (e) {
            // Post might not exist yet (during creation)
            console.log("[useMuxVideoUpload] Post not found, will check Mux directly");
          }
        }

        // If entity has video in DB, verify it exists in Mux
        if (playbackId && assetId) {
          console.log(`[useMuxVideoUpload] ✅ Video found in DB: playback_id=${playbackId}`);

          try {
            const assetCheck = await apiClient.checkMuxAssetExists(assetId);
            if (assetCheck.exists) {
              // Video exists in Mux - set as live
              setUploadStatus("live");
              onUploadComplete(playbackId, assetId);
              return;
            } else {
              // Video doesn't exist in Mux - clear from DB
              console.log(`[useMuxVideoUpload] ⚠️ Video not found in Mux, clearing from DB...`);
              if (entityType === "lesson") {
                await apiClient.updateLesson(entityId!, {
                  mux_playback_id: undefined,
                  mux_asset_id: undefined,
                } as any);
              } else if (entityType === "course") {
                await apiClient.updateCourse(entityId!, {
                  mux_preview_playback_id: undefined,
                  mux_preview_asset_id: undefined,
                } as any);
              }
              setUploadStatus("idle");
              if (onRefresh) {
                await onRefresh();
              }
              return;
            }
          } catch (error) {
            console.error("[useMuxVideoUpload] Error checking asset in Mux:", error);
            // On error, assume it exists (don't clear)
            setUploadStatus("live");
            onUploadComplete(playbackId, assetId);
            return;
          }
        }

        // If no video in DB, check Mux directly to sync
        console.log(`[useMuxVideoUpload] No video in DB, checking Mux for ${entityType} ${entityId}...`);
        const checkResult = await apiClient.checkMuxUploadStatus(
          entityType === "lesson" ? entityId : undefined,
          entityType === "course" ? entityId : undefined,
          entityType === "community" ? entityId : undefined,
          entityType === "level" ? entityId : undefined
        );

        if (checkResult.status === "ready" && checkResult.playback_id && checkResult.asset_id) {
          // Video is ready in Mux but not in DB - sync it
          console.log(`[useMuxVideoUpload] ✅ Video found in Mux, syncing to DB...`);
          setUploadStatus("live");
          onUploadComplete(checkResult.playback_id, checkResult.asset_id);
          if (onRefresh) {
            await onRefresh();
          }
        } else {
          // No video found - set idle
          console.log(`[useMuxVideoUpload] No video found in Mux or DB, setting status to idle`);
          setUploadStatus("idle");
        }
      } catch (error) {
        console.error("[useMuxVideoUpload] Error syncing with Mux:", error);
        // On error, check currentPlaybackId prop as fallback
        if (currentPlaybackId) {
          setUploadStatus("live");
        } else {
          setUploadStatus("idle");
        }
      }
    };

    syncWithMux();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entityId, currentPlaybackId, entityType]);

  // Check status from Mux API
  const checkStatusFromMux = useCallback(async () => {
    try {
      console.log("[useMuxVideoUpload] Checking status from Mux API...");
      const checkResult = await apiClient.checkMuxUploadStatus(
        entityType === "lesson" ? entityId : undefined,
        entityType === "course" ? entityId : undefined,
        entityType === "community" ? entityId : undefined,
        entityType === "level" ? entityId : undefined
      );
      console.log("[useMuxVideoUpload] Check result:", checkResult);

      if (checkResult.status === "ready" && checkResult.playback_id && checkResult.asset_id) {
        // Video is ready!
        console.log("[useMuxVideoUpload] ✅ Video is ready!");
        statusRef.current = "live";
        setUploadStatus("live");
        onUploadComplete(checkResult.playback_id, checkResult.asset_id);
        if (onRefresh) {
          await onRefresh();
        }
        // Clear polling if running
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
      } else {
        // Fallback: Check the entity directly
        try {
          let entity: any = null;
          if (entityType === "lesson") {
            entity = await apiClient.getLesson(entityId!);
            if (entity.mux_playback_id && entity.mux_asset_id) {
              const assetCheck = await apiClient.checkMuxAssetExists(entity.mux_asset_id);
              if (assetCheck.exists) {
                console.log("[useMuxVideoUpload] ✅ Video found in entity!");
                statusRef.current = "live";
                setUploadStatus("live");
                onUploadComplete(entity.mux_playback_id, entity.mux_asset_id);
                if (onRefresh) {
                  await onRefresh();
                }
                if (pollIntervalRef.current) {
                  clearInterval(pollIntervalRef.current);
                  pollIntervalRef.current = null;
                }
                return;
              }
            }
          } else if (entityType === "course") {
            entity = await apiClient.getCourseFullDetails(entityId!);
            if (entity.mux_preview_playback_id && (entity as any).mux_preview_asset_id) {
              const assetCheck = await apiClient.checkMuxAssetExists((entity as any).mux_preview_asset_id);
              if (assetCheck.exists) {
                console.log("[useMuxVideoUpload] ✅ Video found in entity!");
                statusRef.current = "live";
                setUploadStatus("live");
                onUploadComplete(entity.mux_preview_playback_id, (entity as any).mux_preview_asset_id);
                if (onRefresh) {
                  await onRefresh();
                }
                if (pollIntervalRef.current) {
                  clearInterval(pollIntervalRef.current);
                  pollIntervalRef.current = null;
                }
                return;
              }
            }
          } else if (entityType === "level") {
            try {
              const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/admin/levels/${entityId}`,
                {
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                  },
                }
              );
              if (response.ok) {
                entity = await response.json();
                if (entity.mux_preview_playback_id && entity.mux_preview_asset_id) {
                  const assetCheck = await apiClient.checkMuxAssetExists(entity.mux_preview_asset_id);
                  if (assetCheck.exists) {
                    console.log("[useMuxVideoUpload] ✅ Video found in level entity!");
                    statusRef.current = "live";
                    setUploadStatus("live");
                    onUploadComplete(entity.mux_preview_playback_id, entity.mux_preview_asset_id);
                    if (onRefresh) {
                      await onRefresh();
                    }
                    if (pollIntervalRef.current) {
                      clearInterval(pollIntervalRef.current);
                      pollIntervalRef.current = null;
                    }
                    return;
                  }
                }
              }
            } catch (e) {
              console.log("[useMuxVideoUpload] Level not found in fallback check");
            }
          } else if (entityType === "community") {
            try {
              entity = await apiClient.getPost(entityId!);
              if (entity.mux_playback_id && entity.mux_asset_id) {
                const assetCheck = await apiClient.checkMuxAssetExists(entity.mux_asset_id);
                if (assetCheck.exists) {
                  console.log("[useMuxVideoUpload] ✅ Video found in entity!");
                  statusRef.current = "live";
                  setUploadStatus("live");
                  onUploadComplete(entity.mux_playback_id, entity.mux_asset_id);
                  if (onRefresh) {
                    await onRefresh();
                  }
                  if (pollIntervalRef.current) {
                    clearInterval(pollIntervalRef.current);
                    pollIntervalRef.current = null;
                  }
                  return;
                }
              }
            } catch (e) {
              console.log("[useMuxVideoUpload] Post not found in fallback check");
            }
          }
          console.log("[useMuxVideoUpload] Video still processing...");
        } catch (fallbackError) {
          console.error("[useMuxVideoUpload] Error in fallback check:", fallbackError);
        }
      }
    } catch (error: any) {
      console.error("[useMuxVideoUpload] Error checking status:", error);
    }
  }, [entityId, entityType, onUploadComplete, onRefresh]);

  // Poll for video availability after upload completes
  const startPollingForVideo = useCallback(() => {
    console.log("[useMuxVideoUpload] Starting auto-check every 5 seconds...");

    // Check immediately
    checkStatusFromMux();

    // Then check every 5 seconds
    pollIntervalRef.current = setInterval(async () => {
      const currentStatus = statusRef.current;
      if (currentStatus !== "processing" && currentStatus !== "uploading") {
        console.log("[useMuxVideoUpload] Status changed to", currentStatus, "- stopping auto-check");
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
        return;
      }

      console.log("[useMuxVideoUpload] Auto-check triggered (every 5 seconds)...");
      await checkStatusFromMux();
    }, 5000);
  }, [checkStatusFromMux]);

  // Handle file selection
  const handleFileSelect = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
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
          entityType === "lesson" ? entityId : undefined,
          file.name,
          entityType === "course" ? entityId : undefined,
          entityType === "community" ? entityId : undefined,
          entityType === "level" ? entityId : undefined
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
            console.log("[useMuxVideoUpload] Upload complete! Starting to poll for video availability...");
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
          console.error("[useMuxVideoUpload] Upload error:", xhr.statusText);
          setUploadStatus("error");
          setUploadProgress(0);
          alert("Upload failed. Please check your connection and try again.");
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        });

        xhr.addEventListener("abort", () => {
          console.error("[useMuxVideoUpload] Upload aborted");
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
        console.error("[useMuxVideoUpload] Error during upload:", error);
        setUploadStatus("error");
        setUploadProgress(0);
        alert(error?.message || "Failed to upload video. Please try again.");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    },
    [entityId, entityType, startPollingForVideo]
  );

  // Handle delete
  const handleDelete = useCallback(async () => {
    if (!currentPlaybackId) return;

    if (!confirm("Are you sure you want to delete this video? This action cannot be undone.")) {
      return;
    }

    try {
      // Get current entity to find asset_id
      let assetIdToDelete: string | null = null;

      if (entityType === "lesson") {
        const lesson = await apiClient.getLesson(entityId!);
        assetIdToDelete = lesson.mux_asset_id;
      } else if (entityType === "course") {
        const course = await apiClient.getCourseFullDetails(entityId!);
        assetIdToDelete = (course as any).mux_preview_asset_id;
      } else if (entityType === "level") {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/admin/levels/${entityId}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
          if (response.ok) {
            const level = await response.json();
            assetIdToDelete = level.mux_preview_asset_id || null;
          }
        } catch (e) {
          console.log("[useMuxVideoUpload] Level not found for deletion");
        }
      } else if (entityType === "community") {
        try {
          const post = await apiClient.getPost(entityId!);
          assetIdToDelete = (post as any).mux_asset_id || null;
        } catch (e) {
          console.log("[useMuxVideoUpload] Post not found for deletion");
        }
      }

      if (!assetIdToDelete) {
        // No asset ID - just clear from DB
        console.log("[useMuxVideoUpload] No asset ID found, clearing from DB only");
        if (onDelete) {
          await onDelete();
        }
        setUploadStatus("idle");
        setUploadProgress(0);
        return;
      }

      console.log(`[useMuxVideoUpload] Starting deletion of asset ${assetIdToDelete} from Mux...`);

      // Step 1: Set status to "deleting"
      setUploadStatus("deleting");

      // Step 2: Delete from Mux
      try {
        await apiClient.deleteMuxAsset(assetIdToDelete);
        console.log("[useMuxVideoUpload] Delete request sent to Mux API");
      } catch (deleteError: any) {
        // If 404, asset might already be deleted - continue anyway
        if (deleteError.message?.includes("404") || deleteError.message?.includes("Not Found")) {
          console.log("[useMuxVideoUpload] Asset not found in Mux (already deleted), continuing...");
        } else {
          throw deleteError;
        }
      }

      // Step 3: Poll Mux API to verify deletion (check if asset still exists)
      console.log("[useMuxVideoUpload] Verifying deletion from Mux...");
      let deletionVerified = false;
      let attempts = 0;
      const maxAttempts = 15; // Check for up to 15 seconds

      while (!deletionVerified && attempts < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second between checks

        try {
          // Check if asset still exists in Mux
          const assetCheck = await apiClient.checkMuxAssetExists(assetIdToDelete);

          if (!assetCheck.exists) {
            // Asset deleted from Mux!
            deletionVerified = true;
            console.log("[useMuxVideoUpload] ✅ Deletion verified - asset no longer exists in Mux");
            break;
          }

          console.log(
            `[useMuxVideoUpload] Asset still exists in Mux, waiting... (attempt ${attempts + 1}/${maxAttempts})`
          );
          attempts++;
        } catch (error) {
          // If error checking, assume deletion is proceeding
          console.log(
            `[useMuxVideoUpload] Error checking asset status, continuing... (attempt ${attempts + 1}/${maxAttempts})`
          );
          attempts++;
          if (attempts >= maxAttempts) {
            // After max attempts, assume deletion is complete
            deletionVerified = true;
            break;
          }
        }
      }

      if (!deletionVerified) {
        console.log("[useMuxVideoUpload] ⚠️ Deletion verification timeout - asset may still exist in Mux");
      }

      // Step 4: Clear from DB
      console.log("[useMuxVideoUpload] Clearing video from database...");
      if (onDelete) {
        await onDelete();
      }

      // Step 5: Refresh entity data to ensure sync
      if (onRefresh) {
        await onRefresh();
      }

      // Step 6: Reset local state
      setUploadStatus("idle");
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      console.log("[useMuxVideoUpload] ✅ Video deleted and removed");
    } catch (error: any) {
      console.error("[useMuxVideoUpload] Error deleting video:", error);
      setUploadStatus("error");
      alert(error?.message || "Failed to delete video from Mux. Please try again.");
    }
  }, [entityId, entityType, currentPlaybackId, onDelete, onRefresh]);

  // Check status manually
  const checkStatus = useCallback(async () => {
    await checkStatusFromMux();
  }, [checkStatusFromMux]);

  // Reset error state
  const resetError = useCallback(() => {
    if (uploadStatus === "error") {
      setUploadStatus("idle");
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [uploadStatus]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  return {
    uploadStatus,
    uploadProgress,
    handleFileSelect,
    handleDelete,
    checkStatus,
    resetError,
  };
}
