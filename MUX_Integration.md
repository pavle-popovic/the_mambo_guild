# Cost Efficiency & Offline Protocol Implementation Plan

## Objective
Reduce Mux streaming costs by 60%+ through:
1. **One-Stream Drill Logic** - Force offline download after 3 views of the same lesson
2. **Community Feed Data Saver** - Use GIF previews and tap-to-play architecture

---

## Part 1: One-Stream Drill Logic (Course Content)

### 1.1 Backend: Enable MP4 Downloads

**File: `backend/services/mux_service.py`** (lines 75-86)

Add `mp4_support` to asset settings for lesson uploads:

```python
asset_settings = {
    "playback_policies": ["public"],
    "mp4_support": "standard",  # NEW: Enable 720p/1080p MP4 downloads
    "test": test
}
```

**File: `backend/routers/mux.py`** (new endpoint ~line 310)

Add download URL endpoint:

```python
@router.get("/download-url/{playback_id}")
async def get_download_url(
    playback_id: str,
    resolution: str = Query("high"),  # "high" = 1080p, "medium" = 720p
    current_user: User = Depends(get_current_user)
):
    # Public playback URLs are static
    download_url = f"https://stream.mux.com/{playback_id}/{resolution}.mp4"
    return {"download_url": download_url, "resolution": resolution}
```

### 1.2 Frontend: Drill View Tracking

**New File: `frontend/hooks/useDrillViewCount.ts`**

localStorage schema:
```typescript
// Key: "mambo_drill_views"
{
  "lesson-uuid-1": { viewCount: 3, lastViewed: "2026-01-23T15:30:00Z" }
}
```

Hook implementation:
- `viewCount` - current view count for lesson
- `showPracticeMode` - true when viewCount >= 3
- `incrementView()` - called on video play start
- `markDownloaded()` - records download timestamp

### 1.3 Frontend: Practice Mode Overlay

**New File: `frontend/components/PracticeModeOverlay.tsx`**

Renders when `showPracticeMode` is true:
- Semi-transparent overlay covering video
- Message: "You've mastered this move! Download for offline practice."
- Download button (calls `/api/mux/download-url/{playbackId}`)
- "Watch Online Anyway" dismiss button (resets for this session)

### 1.4 Frontend: Lesson Page Integration

**File: `frontend/app/lesson/[id]/page.tsx`** (around line 713)

Integrate drill tracking:
```tsx
const { viewCount, showPracticeMode, incrementView } = useDrillViewCount(lesson.id);

// Wrap MuxVideoPlayer with conditional overlay
{showPracticeMode ? (
  <PracticeModeOverlay
    playbackId={lesson.mux_playback_id}
    onDismiss={() => setDismissedForSession(true)}
  />
) : (
  <MuxVideoPlayer
    playbackId={lesson.mux_playback_id}
    onPlay={incrementView}
  />
)}
```

---

## Part 2: Community Feed Data Saver

### 2.1 Backend: Resolution Cap for Community

**File: `backend/services/mux_service.py`**

Add `is_community` parameter to `create_direct_upload()`:

```python
def create_direct_upload(
    # ... existing params
    is_community: bool = False  # NEW
) -> Dict:
    asset_settings = {
        "playback_policies": ["public"],
        "test": test
    }

    if is_community:
        asset_settings["max_resolution_tier"] = "1080p"  # Cap community at 1080p (min supported tier)
    else:
        asset_settings["mp4_support"] = "standard"  # MP4 for lessons
```

**File: `backend/routers/mux.py`** (around line 266)

Pass `is_community=True` when `post_id` is provided in upload-url endpoint.

### 2.2 Frontend: GIF Previews in Feed

**File: `frontend/components/community/StageVideoCard.tsx`** (line 44-46)

Replace static thumbnail with animated GIF:

```typescript
// BEFORE (static image - no motion)
const thumbnailUrl = `https://image.mux.com/${playbackId}/thumbnail.jpg?time=1&width=400`;

// AFTER (animated GIF - shows first 4 seconds)
const previewUrl = `https://image.mux.com/${playbackId}/animated.gif?width=320&start=0&end=4&fps=15`;
```

Update Image component to handle GIF (use `unoptimized` prop for GIFs in Next.js).

### 2.3 Frontend: Tap-to-Play in Post Detail

**File: `frontend/components/PostDetailModal.tsx`** (lines 516-535)

Add lazy video initialization:

```tsx
const [playerInitialized, setPlayerInitialized] = useState(false);

// In render (around line 517):
{post.post_type === "stage" && (
  <div className="mb-6 relative">
    {!playerInitialized ? (
      // Thumbnail with play button
      <div
        className="relative aspect-video cursor-pointer group"
        onClick={() => setPlayerInitialized(true)}
      >
        <img
          src={`https://image.mux.com/${post.mux_playback_id}/thumbnail.jpg?width=800`}
          className="w-full h-full object-cover rounded-lg"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition">
          <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center">
            <FaPlay className="text-3xl text-black ml-1" />
          </div>
        </div>
      </div>
    ) : (
      <MuxVideoPlayer playbackId={post.mux_playback_id} autoPlay={true} />
    )}
  </div>
)}
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `backend/services/mux_service.py` | Add `mp4_support`, `max_resolution_tier`, `is_community` param |
| `backend/routers/mux.py` | Add download-url endpoint, pass is_community flag |
| `frontend/hooks/useDrillViewCount.ts` | **NEW** - localStorage view tracking hook |
| `frontend/components/PracticeModeOverlay.tsx` | **NEW** - Download prompt overlay |
| `frontend/app/lesson/[id]/page.tsx` | Integrate drill tracking and overlay |
| `frontend/components/community/StageVideoCard.tsx` | Use animated GIF instead of static thumbnail |
| `frontend/components/PostDetailModal.tsx` | Add tap-to-play lazy initialization |
| `frontend/lib/api.ts` | Add `getDownloadUrl()` method |

---

## Mux URL Reference

| Type | URL Pattern |
|------|-------------|
| Static thumbnail | `https://image.mux.com/{id}/thumbnail.jpg?time=1&width=400` |
| Animated GIF | `https://image.mux.com/{id}/animated.gif?width=320&start=0&end=4&fps=15` |
| MP4 Download (1080p) | `https://stream.mux.com/{id}/high.mp4` |
| MP4 Download (720p) | `https://stream.mux.com/{id}/medium.mp4` |

---

## Verification Plan

1. **Backend MP4 Support**
   - Upload a new test lesson video
   - Verify Mux webhook shows `mp4_support: standard`
   - Test download URL endpoint returns valid URL

2. **Drill View Tracking**
   - Play a lesson video 3 times
   - Verify localStorage stores count correctly
   - Verify overlay appears on 3rd play

3. **MP4 Download**
   - Click download button in overlay
   - Verify browser initiates download
   - Verify downloaded file plays correctly

4. **Community GIF Previews**
   - Load community feed
   - Verify Network tab shows `.gif` requests instead of Mux player initialization
   - Verify GIF animates on card

5. **Tap-to-Play**
   - Open post detail modal
   - Verify Mux player does NOT load until play button clicked
   - Verify video auto-plays after clicking

6. **Resolution Cap**
   - Upload new community video
   - Check Mux dashboard for `max_resolution_tier: 1080p`

---

## Backwards Compatibility

- **Existing lesson videos**: Won't have MP4 renditions (uploaded before `mp4_support`)
  - Download button should handle 404 gracefully with "Not available for this video" message
- **Existing community videos**: Will continue streaming at original quality
  - GIF previews work for all videos (Mux generates automatically)
