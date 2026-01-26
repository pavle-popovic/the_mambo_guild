"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface DrillViewData {
  viewCount: number;
  lastViewed: string;
  downloadedAt?: string;
}

interface DrillViewStore {
  [lessonId: string]: DrillViewData;
}

const STORAGE_KEY = "mambo_drill_views";
const VIEWS_THRESHOLD = 1000000000; // Effectively disabled for now
const DEBOUNCE_MS = 5000; // Minimum 5 seconds between view counts

/**
 * Hook for tracking lesson video view counts.
 * Prompts users to download for offline practice after 3 views.
 */
export function useDrillViewCount(lessonId: string) {
  const [viewCount, setViewCount] = useState(0);
  const [showPracticeMode, setShowPracticeMode] = useState(false);
  const [dismissedForSession, setDismissedForSession] = useState(false);
  const lastIncrementRef = useRef<number>(0);

  // Load view count from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined" || !lessonId) return;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data: DrillViewStore = JSON.parse(stored);
        const lessonData = data[lessonId];
        if (lessonData) {
          setViewCount(lessonData.viewCount);
          // Show practice mode if threshold reached and not already downloaded
          setShowPracticeMode(
            lessonData.viewCount >= VIEWS_THRESHOLD && !lessonData.downloadedAt
          );
        }
      }
    } catch (e) {
      console.error("Error loading drill view data:", e);
    }
  }, [lessonId]);

  // Increment view count when video starts playing (debounced to prevent duplicate counts)
  const incrementView = useCallback(() => {
    if (typeof window === "undefined" || !lessonId) return;

    // Debounce: prevent counting multiple times in quick succession
    const now = Date.now();
    if (now - lastIncrementRef.current < DEBOUNCE_MS) {
      console.log("[DrillView] Debounced - too soon since last count");
      return;
    }
    lastIncrementRef.current = now;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const data: DrillViewStore = stored ? JSON.parse(stored) : {};

      const currentData = data[lessonId] || { viewCount: 0, lastViewed: "" };
      const newCount = currentData.viewCount + 1;

      data[lessonId] = {
        ...currentData,
        viewCount: newCount,
        lastViewed: new Date().toISOString(),
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      setViewCount(newCount);

      console.log(`[DrillView] View count incremented: ${newCount} for lesson ${lessonId}`);

      // Show practice mode overlay after threshold (if not downloaded yet)
      if (newCount >= VIEWS_THRESHOLD && !currentData.downloadedAt) {
        console.log(`[DrillView] Threshold reached (${VIEWS_THRESHOLD}), showing practice mode overlay`);
        setShowPracticeMode(true);
      }
    } catch (e) {
      console.error("Error updating drill view count:", e);
    }
  }, [lessonId]);

  // Mark lesson as downloaded (hides practice mode overlay permanently)
  const markDownloaded = useCallback(() => {
    if (typeof window === "undefined" || !lessonId) return;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const data: DrillViewStore = stored ? JSON.parse(stored) : {};

      data[lessonId] = {
        ...data[lessonId],
        downloadedAt: new Date().toISOString(),
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      setShowPracticeMode(false);
    } catch (e) {
      console.error("Error marking as downloaded:", e);
    }
  }, [lessonId]);

  // Dismiss overlay for this session only
  const dismissForSession = useCallback(() => {
    setDismissedForSession(true);
    setShowPracticeMode(false);
  }, []);

  // Reset dismissed state when lesson changes
  useEffect(() => {
    setDismissedForSession(false);
  }, [lessonId]);

  return {
    viewCount,
    showPracticeMode: showPracticeMode && !dismissedForSession,
    incrementView,
    markDownloaded,
    dismissForSession,
    isAboveThreshold: viewCount >= VIEWS_THRESHOLD,
  };
}

export default useDrillViewCount;
