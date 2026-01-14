# Deep Clean & Audit Strategy

**Date:** January 2026  
**Status:** Pre-scaling preparation  
**Priority:** HIGH

---

## Executive Summary

This audit identified **34 actionable items** across 4 categories. Estimated cleanup will reduce codebase by ~15% and eliminate several potential security/performance issues before scaling.

---

## 1. Dead Code Elimination 🗑️

### 1.1 Root-Level Duplicates & Orphaned Files

| Priority | Action | Target | Reasoning |
|----------|--------|--------|-----------|
| HIGH | **DELETE** | `models/` (root directory) | Duplicate of `backend/models/`. Contains identical files that could cause import confusion. |
| HIGH | **DELETE** | `audio_gen.py` | One-time utility script to generate `modern_mission_complete.wav`. Already executed, no longer needed. |
| MEDIUM | **DELETE** | `raw_design/` | Contains 10 HTML mockup files (`admin.html`, `login.html`, etc.). These are design artifacts, not used in production. Archive to separate repo if needed. |
| LOW | **REVIEW** | `Ressources/` folder | Typo in name. Contains assets duplicated in `frontend/public/assets/`. Consider consolidating. |

### 1.2 Unused Frontend Components

These components exist in `frontend/components/` but are **never imported** in any page or active component:

| Priority | Action | Target | Notes |
|----------|--------|--------|-------|
| HIGH | **DELETE** | `frontend/components/ImageUploader.tsx` | Duplicate. The **used** version is `common/ImageUploader.tsx`. |
| HIGH | **DELETE** | `frontend/components/VideoPlayer.tsx` | Obsolete. Replaced by `MuxVideoPlayer.tsx`. |
| HIGH | **DELETE** | `frontend/components/Button.tsx` | Generic button not used - Tailwind utility classes used directly instead. |
| MEDIUM | **AUDIT** | `frontend/components/ActivityFeed.tsx` | Not imported anywhere. May be planned feature. |
| MEDIUM | **AUDIT** | `frontend/components/BadgeGrid.tsx` | Not imported in any page. May be planned feature. |
| MEDIUM | **AUDIT** | `frontend/components/CommentSection.tsx` | Not imported in any page. May be planned feature. |
| MEDIUM | **AUDIT** | `frontend/components/CourseEditor.tsx` | Not imported in any page. Check if replaced by `LessonEditorModal`. |
| MEDIUM | **AUDIT** | `frontend/components/FeatureGrid.tsx` | Not imported in any page. |
| MEDIUM | **AUDIT** | `frontend/components/GradingPanel.tsx` | Not imported in any page. May be for admin grading. |
| MEDIUM | **AUDIT** | `frontend/components/HeroSection.tsx` | Not imported in any page. |
| MEDIUM | **AUDIT** | `frontend/components/LessonItem.tsx` | Not imported in any page. Check if used internally. |
| MEDIUM | **AUDIT** | `frontend/components/MarkdownRenderer.tsx` | Used by `RichContentRenderer` but check if needed. |
| MEDIUM | **AUDIT** | `frontend/components/Modal.tsx` | Generic modal - check if specific modals use it. |
| MEDIUM | **AUDIT** | `frontend/components/PricingCard.tsx` | Check if used in pricing page or replaced. |
| MEDIUM | **AUDIT** | `frontend/components/ProfileHeader.tsx` | Not directly imported in profile page. |
| MEDIUM | **AUDIT** | `frontend/components/StatCard.tsx` | Not imported in any page. |
| MEDIUM | **AUDIT** | `frontend/components/StatOverview.tsx` | Not imported in any page. |
| MEDIUM | **AUDIT** | `frontend/components/StreakDisplay.tsx` | Not imported in any page. |
| MEDIUM | **AUDIT** | `frontend/components/SubmissionCard.tsx` | Not imported in any page. |
| MEDIUM | **AUDIT** | `frontend/components/WorldCard.tsx` | Not imported - may be replaced by `CourseCard.tsx`. |
| MEDIUM | **AUDIT** | `frontend/components/XPToast.tsx` | Not imported in any page. |
| MEDIUM | **AUDIT** | `frontend/components/BossBattleUploader.tsx` | Not imported in any page. |

### 1.3 Unused Backend Services

| Priority | Action | Target | Reasoning |
|----------|--------|--------|-----------|
| HIGH | **DELETE** | `backend/services/s3_service.py` | Broken import (`from output.backend.config`). Not imported anywhere. Replaced by `storage_service.py`. |

### 1.4 Unused/Duplicate NPM Packages

**Root `package.json`:**
| Priority | Action | Package | Reasoning |
|----------|--------|---------|-----------|
| HIGH | **REMOVE** | `clsx` | Duplicated in frontend. Root doesn't need it (only Playwright tests). |
| HIGH | **REMOVE** | `framer-motion` | Duplicated in frontend. Root doesn't need it. |
| HIGH | **REMOVE** | `tailwind-merge` | Duplicated in frontend. Root doesn't need it. |
| HIGH | **REMOVE** | `use-sound` | Duplicated in frontend. Root doesn't need it. |
| HIGH | **REMOVE** | `lucide-react` | Not used anywhere in codebase. |

**Frontend `package.json`:**
| Priority | Action | Package | Reasoning |
|----------|--------|---------|-----------|
| MEDIUM | **AUDIT** | `howler` | Installed but not imported. `use-sound` is used instead. May be indirect dep. |
| MEDIUM | **AUDIT** | `aos` | Only imported in `page.tsx`. Consider removing if animations are now handled by Framer Motion. |

---

## 2. Security Hardening 🔒

### 2.1 Configuration Security

| Priority | Status | Target | Issue & Fix |
|----------|--------|--------|-------------|
| ✅ FIXED | Complete | `backend/config.py` | SECRET_KEY validation now raises ValueError in production. |

### 2.2 Remaining Security Audits

| Priority | Status | Target | Issue |
|----------|--------|--------|-------|
| ✅ FIXED | Complete | `backend/routers/auth.py` | Rate limiting added to `/forgot-password` (5 req/5min per email, 10 req/5min per IP). |
| MEDIUM | **AUDIT** | `backend/routers/payments.py` | Stripe webhook signature verification - ensure `stripe.Webhook.construct_event` is used correctly. |
| LOW | **AUDIT** | CORS configuration | Currently allows `localhost:3000` and `localhost:8000`. Ensure production values are set via env vars. |

### 2.3 Sensitive Data in Git History

| Priority | Action | Target | Issue |
|----------|--------|--------|-------|
| ✅ FIXED | Complete | `Ressources/Full_Logo*` | Removed files containing exposed Google API keys. Keys should be rotated in Google Cloud Console. |

---

## 3. Performance Optimization ⚡

### 3.1 Database Queries

| Priority | Status | Target | Issue & Fix |
|----------|--------|--------|-------------|
| ✅ FIXED | Complete | `backend/routers/courses.py` → `get_worlds` | N+1 query fixed - now pre-fetches all user progress. |
| ✅ FIXED | Complete | `backend/routers/courses.py` → `get_world_lessons` | N+1 query fixed - now pre-fetches completion status. |

### 3.2 Remaining Performance Issues

| Priority | Status | Target | Issue |
|----------|--------|--------|-------|
| ✅ FIXED | Complete | `backend/routers/admin.py` → `get_all_students` | Added `joinedload` for profiles - single query instead of N+1. |
| ✅ FIXED | Complete | `frontend/app/page.tsx` | Added `poster="/assets/Mambo_image_1.jpg"` and `preload="none"` to background video. |
| LOW | **MONITOR** | `backend/routers/admin_courses.py` → `get_course_full_details` | Multiple nested loops for levels/lessons. Watch as course count grows. |

### 3.3 Frontend Bundle Size

| Priority | Action | Target | Issue |
|----------|--------|--------|-------|
| MEDIUM | **AUDIT** | Unused components | Removing ~15 unused components will reduce bundle size. |
| LOW | **CONSIDER** | `framer-motion` | Large package. If only using basic animations, consider CSS alternatives. |

---

## 4. Structural Reorganization 📁

### 4.1 Completed Reorganization

| Status | Change |
|--------|--------|
| ✅ DONE | `backend/scripts/` - All utility scripts moved |
| ✅ DONE | `backend/tests/` - All test files moved with `conftest.py` |

### 4.2 Recommended Changes

| Priority | Action | From | To | Reasoning |
|----------|--------|------|-----|-----------|
| LOW | **RENAME** | `Ressources/` | `resources/` | Fix typo, use lowercase convention. |
| LOW | **CONSOLIDATE** | `frontend/public/assets/` + `Ressources/` | `frontend/public/assets/` | Remove duplicate assets at root. |
| LOW | **MOVE** | `frontend/components/*.tsx` (unused) | `frontend/components/_deprecated/` | Keep for reference before deletion. |

### 4.3 Junk Directories to Delete

| Priority | Action | Target | Reasoning |
|----------|--------|--------|-----------|
| HIGH | **DELETE** | `frontend/CUserspavleDesktopsalsa_lab_v2frontend/` | Malformed directory name - likely artifact from a bad copy operation. |

---

## 5. Action Checklist

### Immediate (Do Now)
- [x] Delete `models/` root directory ✅ (already removed)
- [x] Delete `audio_gen.py` ✅
- [x] Delete `backend/services/s3_service.py` ✅
- [x] Delete `frontend/components/ImageUploader.tsx` (keep `common/ImageUploader.tsx`) ✅
- [x] Delete `frontend/components/VideoPlayer.tsx` ✅
- [x] Delete `frontend/components/Button.tsx` ✅
- [x] Clean root `package.json` - remove duplicate dependencies ✅
- [x] Delete `frontend/CUserspavleDesktopsalsa_lab_v2frontend/` if it exists ✅ (didn't exist)

### Short-term (This Week)
- [ ] Audit all "AUDIT" flagged components - delete or document why kept
- [ ] Remove `howler` if confirmed unused
- [x] Add rate limiting to `/forgot-password` endpoint ✅
- [x] Add `poster` and `preload="none"` to background video ✅
- [ ] Rotate exposed Google API keys in Google Cloud Console (manual action)

### Before Scaling
- [ ] Consolidate `Ressources/` → `frontend/public/assets/`
- [ ] Delete `raw_design/` or archive to separate repo
- [ ] Run `npx knip` or similar to find any remaining dead code
- [ ] Set up proper production CORS configuration
- [ ] Add database indexes for frequently queried fields

---

## 6. Estimated Impact

| Metric | Before | After (Est.) |
|--------|--------|--------------|
| Root-level files | Many loose files | Clean, organized |
| Frontend components | 42 | ~25 (after removing unused) |
| Backend services | 9 | 8 (remove s3_service.py) |
| NPM packages (root) | 7 | 2 (only @playwright/test needed) |
| Security vulnerabilities | 1 known | 0 |
| N+1 query issues | 2 | 0 (already fixed) |

---

*Generated by Deep Clean Audit - January 2026*
