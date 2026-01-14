# Cleanup Strategy: Deep Clean & Audit

This document outlines a ruthless audit and cleanup strategy for `The Mambo Inn` platform to prepare for scaling.

## 1. Dead Code Elimination
**Objective:** Remove unused files, dependencies, and configuration to reduce build size and cognitive load.

- [x] **[DELETE]** `backend/package.json` & `backend/package-lock.json`
  - *Reasoning:* The backend is Python-based. This file only contains `@mux/mux-player-react`, which is a frontend dependency and likely a mistake.
  - ✅ **COMPLETED** - Deleted on 2026-01-14
- [x] **[DELETE]** `backend/node_modules/` (if exists)
  - *Reasoning:* Artifact of the misplaced package.json.
  - ✅ **COMPLETED** - Deleted on 2026-01-14
- [ ] **[AUDIT]** Frontend Components (`frontend/components`)
  - *Action:* Run a manual check or use a tool like `knip` to identify unused components.
  - *Target:* Verify if components in `raw_design/` are still needed or if they should be archived/deleted.
- [ ] **[CLEANUP]** `backend/requirements.txt`
  - *Action:* Verify if `python-multipart` is actually used (it likely is for FastAPI form data), but ensure no other dev-dependencies are leaking into prod requirements.

## 2. Security Hardening
**Objective:** Eliminate hardcoded secrets and enforce secure defaults.

- [x] **[CRITICAL]** `backend/config.py`: Remove Default Secret Key
  - *Current:* `SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")`
  - *Fix:* In production, this MUST raise an error if not set.
  - ✅ **COMPLETED** - Now raises `ValueError` when `ENVIRONMENT=production` and `SECRET_KEY` is not set
- [ ] **[SECURITY]** Enforce Strict CORS
  - *Action:* Ensure `backend/config.py` `CORS_ORIGINS` defaults to strict values or fails safe, avoiding wildcard usage in production.
- [x] **[AUDIT]** OAuth State Management
  - *Status:* `backend/routers/auth.py` correctly uses `secrets.token_urlsafe` and verifies state. *No Code Action Needed*, but nice catch.

## 3. Performance Optimization
**Objective:** Fix N+1 queries and optimize asset loading.

- [x] **[FIX]** N+1 Query in `backend/routers/courses.py` -> `get_worlds`
  - *Issue:* The endpoint iterates through worlds and for *each* world, executes a separate query for `UserProgress` inside the loop.
  - *Fix:* Fetch all relevant `UserProgress` records for the user in a single query beforehand or use SQLAlchemy `joinedload`.
  - ✅ **COMPLETED** - Pre-fetches all user progress in single queries for both `get_worlds` and `get_world_lessons` endpoints
- [ ] **[OPTIMIZE]** Frontend Video Loading (`frontend/app/page.tsx`)
  - *Action:* The background video `/assets/Background_video.mp4` loads immediately. Ensure this file is compressed (H.264/AVC) and considered "lazy loading" or using a poster image if mobile data is a concern.

## 4. Structural Reorganization
**Objective:** Standardize folder structure for scalability.

- [x] **[MOVE]** Backend Scripts
  - *Action:* Create `backend/scripts/` and move all root-level utility scripts there.
  - *Files:* `backend/create_admin.py`, `backend/seed_courses.py`, `backend/fix_*.py`, etc.
  - ✅ **COMPLETED** - All scripts moved to `backend/scripts/` with updated imports
- [x] **[MOVE]** Backend Tests
  - *Action:* Create `backend/tests/` and move all `test_*.py` files there.
  - *Note:* Update imports in tests to ensure they can still find `app` (may need `sys.path` adjustment or `pytest` configuration).
  - ✅ **COMPLETED** - All tests moved to `backend/tests/` with `conftest.py` for path configuration
- [ ] **[RENAME]** typos
  - *Action:* Rename root folder `Ressources` to `Resources`.

## Executive Summary of Next Steps
1.  ✅ **Execute the "Move" commands** immediately to declutter the workspace.
2.  ✅ **Apply the Security Fix** to `config.py`.
3.  ✅ **Refactor `courses.py`** to fix the N+1 performance bottleneck.
4.  ✅ **Delete** the zombie `backend/package.json`.
