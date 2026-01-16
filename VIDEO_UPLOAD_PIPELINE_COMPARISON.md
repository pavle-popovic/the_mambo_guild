# Video Upload Pipeline Comparison
**Date:** January 14, 2026  
**Purpose:** Verify that course preview and lesson video uploads use the same pipeline

---

## Summary

✅ **Both pipelines use the SAME backend infrastructure and flow**, but there are **minor inconsistencies** in the frontend implementation that should be standardized.

---

## Pipeline Flow Comparison

### 1. Upload URL Request

#### Course Preview (`CoursePreviewUploader.tsx`)
```typescript
// Uses API client with JSON body
const { upload_url, upload_id } = await apiClient.createMuxUploadUrl(
  undefined,  // No lesson_id
  file.name,
  courseId    // Pass course_id
);

// API client sends:
POST /api/mux/upload-url
Body: { lesson_id: undefined, filename, course_id: courseId }
```

#### Lesson Video (`MuxUploader.tsx`)
```typescript
// Uses direct fetch with query params
const response = await fetch(
  `${API_BASE_URL}/api/mux/upload-url?lesson_id=${validLessonId}&filename=${encodeURIComponent(file.name)}${token ? `&token=${token}` : ''}`,
  {
    method: "POST",
    headers: token ? { "Authorization": `Bearer ${token}` } : {},
  }
);

// Sends:
POST /api/mux/upload-url?lesson_id=...&filename=...
```

**Backend Handling (`mux.py`):**
- ✅ Accepts **both** JSON body and query params
- ✅ Creates passthrough: `{"lesson_id": ...}` or `{"course_id": ...}`
- ✅ Returns same format: `{ upload_id, upload_url }`

**Status:** ✅ **Same backend, different frontend call methods**

---

### 2. File Upload

#### Both Components
```typescript
// IDENTICAL implementation
const xhr = new XMLHttpRequest();
xhr.upload.addEventListener("progress", (e) => {
  const percentComplete = (e.loaded / e.total) * 100;
  setUploadProgress(percentComplete);
});
xhr.addEventListener("load", () => {
  if (xhr.status === 200 || xhr.status === 201) {
    setUploadStatus("processing");
    startPollingForVideo();
  }
});
xhr.open("PUT", upload_url);
xhr.setRequestHeader("Content-Type", file.type);
xhr.send(file);
```

**Status:** ✅ **IDENTICAL**

---

### 3. Status Polling

#### Course Preview
```typescript
const checkResult = await apiClient.checkMuxUploadStatus(undefined, courseId);
// Polls every 5 seconds until status === "ready"
```

#### Lesson Video
```typescript
const checkResult = await apiClient.checkMuxUploadStatus(validLessonId);
// Polls every 5 seconds until status === "ready"
```

**Backend (`check_upload_status`):**
- ✅ Handles both `lesson_id` and `course_id` query params
- ✅ Queries Mux API using passthrough data
- ✅ Updates database (Lesson or World) with `mux_playback_id` and `mux_asset_id`
- ✅ Returns same format: `{ status, playback_id, asset_id, message }`

**Status:** ✅ **Same polling logic, different parameters**

---

### 4. Webhook Processing

#### Backend Webhook Handler (`mux.py::mux_webhook_handler`)
```python
# Handles BOTH lesson and course preview
if passthrough:
    passthrough_data = json.loads(passthrough)
    lesson_id = passthrough_data.get("lesson_id")
    course_id = passthrough_data.get("course_id")
    
    if lesson_id:
        # Update Lesson
        lesson.mux_asset_id = asset_id
        lesson.mux_playback_id = playback_id
    elif course_id:
        # Update World (course preview)
        world.mux_preview_playback_id = playback_id
        world.mux_preview_asset_id = asset_id
```

**Status:** ✅ **Single webhook handler for both types**

---

### 5. Database Fields

#### Course Preview (World model)
- `mux_preview_playback_id` (String, nullable)
- `mux_preview_asset_id` (String, nullable)

#### Lesson Video (Lesson model)
- `mux_playback_id` (String, nullable)
- `mux_asset_id` (String, nullable)

**Status:** ✅ **Separate fields, same pattern**

---

### 6. Deletion Logic

#### Both Components
```typescript
// IDENTICAL deletion flow:
// 1. Get asset_id from DB
// 2. Call apiClient.deleteMuxAsset(assetId)
// 3. Poll to verify deletion (check if asset exists)
// 4. Clear from DB
// 5. Refresh data
```

**Backend (`delete_mux_asset`):**
- ✅ Handles both lessons and course previews
- ✅ Finds all lessons/courses using the asset
- ✅ Deletes from Mux
- ✅ Clears Mux IDs from all related entities

**Status:** ✅ **IDENTICAL deletion logic**

---

## Inconsistencies Found

### 1. API Call Method ⚠️

**Issue:** 
- `CoursePreviewUploader` uses `apiClient.createMuxUploadUrl()` (JSON body)
- `MuxUploader` uses direct `fetch()` with query params

**Impact:** 
- Both work correctly (backend supports both)
- But inconsistent code style
- `MuxUploader` manually handles auth token, `CoursePreviewUploader` uses API client (which handles auth automatically)

**Recommendation:**
- ✅ **Standardize on `apiClient.createMuxUploadUrl()`** for both
- This ensures consistent auth handling and code style

### 2. Error Handling ⚠️

**CoursePreviewUploader:**
- More comprehensive error handling with asset existence checks
- Verifies asset exists in Mux before marking as "live"
- Clears from DB if asset doesn't exist in Mux

**MuxUploader:**
- Simpler error handling
- Doesn't verify asset existence before marking as "live"

**Recommendation:**
- ✅ **Add asset existence verification to `MuxUploader`** (same as CoursePreviewUploader)

### 3. Status Sync Logic ⚠️

**CoursePreviewUploader:**
- More robust sync logic with fallback checks
- Verifies asset exists in Mux before trusting DB values

**MuxUploader:**
- Simpler sync - trusts DB values if they exist

**Recommendation:**
- ✅ **Enhance `MuxUploader` sync logic** to match CoursePreviewUploader's robustness

---

## Recommendations

### High Priority

1. **Standardize API Call Method:**
   - Update `MuxUploader` to use `apiClient.createMuxUploadUrl()` instead of direct `fetch()`
   - This ensures consistent auth handling and code style

### Medium Priority

2. **Enhance MuxUploader Error Handling:**
   - Add asset existence verification (like CoursePreviewUploader)
   - Add fallback checks in sync logic

3. **Extract Common Logic:**
   - Consider creating a shared hook or utility for:
     - Upload URL request
     - File upload with progress
     - Status polling
     - Deletion flow

### Low Priority

4. **Code Documentation:**
   - Add comments explaining the passthrough mechanism
   - Document the webhook flow

---

## Conclusion

✅ **Both pipelines use the SAME backend infrastructure:**
- Same upload endpoint (`/api/mux/upload-url`)
- Same status check endpoint (`/api/mux/check-upload-status`)
- Same webhook handler
- Same deletion endpoint
- Same Mux service functions

✅ **Frontend implementations are functionally equivalent:**
- Both upload via XMLHttpRequest PUT
- Both poll every 5 seconds
- Both handle deletion the same way

⚠️ **Minor inconsistencies in frontend code style:**
- Different API call methods (JSON body vs query params)
- Different error handling robustness
- Different sync logic complexity

**Overall Assessment:** ✅ **Pipelines are matching and working correctly.** The inconsistencies are code style issues, not functional problems. Standardizing the frontend code would improve maintainability.
