# Mambo Guild — Codebase Audit Report

> **Audited**: 2026-03-29  
> **Severity Legend**: 🔴 Critical · 🟠 High · 🟡 Medium · 🔵 Low · ⚪ Info

---

## Table of Contents
1. [Incomplete / Non-Working Functionalities](#1-incomplete--non-working-functionalities)
2. [Security Vulnerabilities](#2-security-vulnerabilities)
3. [Logic Bugs](#3-logic-bugs)
4. [Performance Concerns](#4-performance-concerns)
5. [Code Quality Issues](#5-code-quality-issues)
6. [Recommended Priority Fixes](#6-recommended-priority-fixes)

---

## 1. Incomplete / Non-Working Functionalities

### 🔴 1.1 — Lesson Comments Not Implemented
**File**: [courses.py](file:///c:/Users/pavle/Desktop/salsa_lab_v2/backend/routers/courses.py#L216)
```python
comments=[],  # TODO: Implement comments
```
The lesson detail response always returns an empty `comments` array. The `Comment` model may exist but no comment creation/retrieval endpoints are wired up for lessons. Users cannot discuss lessons.

---

### 🟠 1.2 — AI Knowledge Base is a Placeholder (No RAG)
**File**: [ai_chat.py](file:///c:/Users/pavle/Desktop/salsa_lab_v2/backend/routers/ai_chat.py#L253-L258)
```python
def execute_search_knowledge_base(query: str) -> dict:
    """Currently a placeholder - will be connected to Vector DB/RAG later."""
    # Placeholder response - will be replaced with actual RAG implementation
```
The `search_knowledge_base` Gemini function-call tool returns hardcoded placeholder results. Diego (AI concierge) can't actually retrieve real course data, FAQs, or platform knowledge. This means any "let me check for you" answer from the bot is fabricated.

---

### 🟠 1.3 — MUX Videos Not Yet Uploaded
All lesson content has empty `mux_playback_id` and `mux_asset_id` fields. The entire upload → webhook → playback pipeline is built but untested with real production data. **Expected resolution**: next week.

**Residual risk**: The webhook endpoints are registered at 3 different paths (`/api/mux/webhook`, `/api/webhook`, `/api/webhooks`) — need to verify which Mux is actually configured to call.

---

### 🟠 1.4 — Boss Battle Grading Has No Mux Integration
**File**: [submissions.py](file:///c:/Users/pavle/Desktop/salsa_lab_v2/backend/routers/submissions.py#L44)
```python
video_url=submission_data.video_url,
```
Boss battle submissions use a raw `video_url` string instead of the Mux upload pipeline used everywhere else. Students can't upload videos via the Mux uploader for boss battles — they must paste a URL. No video validation, no streaming, no download integration.

---

### 🟡 1.5 — Duplicate Level/World Query in Lesson Detail
**File**: [courses.py](file:///c:/Users/pavle/Desktop/salsa_lab_v2/backend/routers/courses.py#L152-L175)
The same `level` and `world` queries are executed **twice** in the `get_lesson` endpoint — once for access control (line 152-153) and again for navigation (line 174-175). This isn't a bug but is wasted work.

---

### 🟡 1.6 — Streak Badges Not Triggered on Login
**File**: [gamification_service.py](file:///c:/Users/pavle/Desktop/salsa_lab_v2/backend/services/gamification_service.py#L15-L86)
The `update_streak()` function updates the streak count but **never calls** `badge_service.check_streak_badges()`. Users can maintain a 365-day streak and never get the Metronome badge unless they manually trigger the `/badges/check` endpoint. The import and function exist in badge_service but the call is missing from the streak update flow.

---

### 🔵 1.7 — Broadcast Script Has Unfilled Placeholder
**File**: [broadcast_waitlist.py](file:///c:/Users/pavle/Desktop/salsa_lab_v2/backend/scripts/broadcast_waitlist.py#L48)
```python
# TODO: Replace [INSERT URL HERE] with the actual combo URL before sending
```

---

### 🔵 1.8 — Admin Course Builder Uses Placeholder Video URLs
**File**: [admin_courses.py](file:///c:/Users/pavle/Desktop/salsa_lab_v2/backend/routers/admin_courses.py#L354)
```python
video_url=lesson_data.video_url or "https://example.com/video/placeholder",
```
When creating lessons without a video URL, it defaults to a non-functional `example.com` placeholder. This will show as a broken video for any lesson created via the builder before uploading.

---

## 2. Security Vulnerabilities

### 🔴 2.1 — Internal Error Messages Leaked to Clients
**Files**: [payments.py](file:///c:/Users/pavle/Desktop/salsa_lab_v2/backend/routers/payments.py#L105), [uploads.py](file:///c:/Users/pavle/Desktop/salsa_lab_v2/backend/routers/uploads.py#L56), [premium.py](file:///c:/Users/pavle/Desktop/salsa_lab_v2/backend/routers/premium.py#L842), [mux.py](file:///c:/Users/pavle/Desktop/salsa_lab_v2/backend/routers/mux.py#L505)
```python
# payments.py:105
detail=f"An unexpected error occurred: {e}"

# uploads.py:56
detail=f"Failed to generate presigned URL: {str(e)}"

# premium.py:842
detail=f"Failed to generate signed URL: {str(e)}"

# mux.py:505, 717, 777
detail=f"Error checking asset: {str(e)}"
message=f"Error checking status: {str(e)}"
```
**Impact**: Python exception messages often contain internal paths, credential fragments, database connection strings, or stack trace information. In production, these should return generic messages and log the details server-side only.

**Fix**: Replace all `f"...{str(e)}"` in HTTP error responses with generic messages. Use `logger.error()` for the actual details.

---

### 🟠 2.2 — Naive `datetime.fromtimestamp()` in Stripe Webhook (Timezone Bug)
**File**: [payments.py](file:///c:/Users/pavle/Desktop/salsa_lab_v2/backend/routers/payments.py#L170-L194)
```python
db_subscription.current_period_end = datetime.fromtimestamp(
    stripe_subscription.current_period_end
)
```
`datetime.fromtimestamp()` uses the **server's local timezone** (not UTC). Stripe timestamps are Unix epoch (UTC). If the server is in CET/CEST, subscriptions will have incorrect `current_period_end` values, potentially allowing or denying access incorrectly.

**Fix**: Use `datetime.fromtimestamp(ts, tz=timezone.utc)` — found at 3 locations.

---

### 🟠 2.3 — SQL Injection Risk in Search
**File**: [post_service.py](file:///c:/Users/pavle/Desktop/salsa_lab_v2/backend/services/post_service.py#L606)
```python
Post.title.ilike(f"%{query}%")
```
While SQLAlchemy parameterizes ILIKE patterns, the `%` wildcard characters are **not escaped** in the user input. A user could submit `%` as a search query to match all posts, or craft patterns like `%admin%` to probe titles. This is a low-risk information disclosure, but the wildcard escaping should be applied.

---

### 🟠 2.4 — Token Passed in Query Parameter
**File**: [mux.py](file:///c:/Users/pavle/Desktop/salsa_lab_v2/backend/routers/mux.py#L27-L54)
```python
token_query: Optional[str] = Query(None, alias="token"),
```
JWT tokens are accepted as URL query parameters (`?token=eyJ...`) for MuxUploader compatibility. URL query parameters are:
- Logged in server access logs (nginx/Apache) in cleartext
- Visible in browser history
- May be cached by proxies/CDNs
- Sent in Referer headers

**Mitigation**: This only applies to admin endpoints, limiting exposure, but should be documented as a known trade-off.

---

### 🟡 2.5 — `download-available` Endpoint is Unauthenticated
**File**: [mux.py](file:///c:/Users/pavle/Desktop/salsa_lab_v2/backend/routers/mux.py#L406-L461)
The `/api/mux/download-available/{playback_id}` endpoint has no authentication requirement. Anyone with a playback ID can probe whether MP4 downloads exist. While Mux playback URLs are technically public, this endpoint could be used to enumerate valid playback IDs.

---

### 🟡 2.6 — Deprecated `datetime.utcnow()` Usage
**Files**: [leaderboard_service.py](file:///c:/Users/pavle/Desktop/salsa_lab_v2/backend/services/leaderboard_service.py#L36), various scripts
```python
return datetime.utcnow() - timedelta(days=days)
```
`datetime.utcnow()` is deprecated since Python 3.12 and returns a **naive** datetime (no timezone info). This is used in leaderboard date calculations, which can cause incorrect period boundaries at midnight UTC transitions.

**Fix**: Use `datetime.now(timezone.utc)`.

---

### 🟡 2.7 — Stripe Webhook Signature Verification Appears Present But...
**File**: [payments.py](file:///c:/Users/pavle/Desktop/salsa_lab_v2/backend/routers/payments.py#L134-L137)
```python
raise HTTPException(..., detail=f"Invalid payload: {e}")
raise HTTPException(..., detail=f"Invalid signature: {e}")
```
The signature error details are leaked to the caller, which could help an attacker understand why forged webhooks are being rejected. Return a generic `400 Bad Request` instead.

---

### 🔵 2.8 — No Token Revocation / Blacklisting
**File**: [auth_service.py](file:///c:/Users/pavle/Desktop/salsa_lab_v2/backend/services/auth_service.py)
When a user logs out, the cookies are cleared but the JWT access token (30 min TTL) and refresh token (7 days TTL) **remain valid** until they expire. There is no server-side token blacklist (e.g., in Redis). A stolen token can be used even after "logout."

**Impact**: Low — 30-minute window for access tokens, but 7-day window for refresh tokens.

---

## 3. Logic Bugs

### 🔴 3.1 — `award_xp` Commits Inside the Service (Breaks Transaction Boundaries)
**File**: [gamification_service.py](file:///c:/Users/pavle/Desktop/salsa_lab_v2/backend/services/gamification_service.py#L116)
```python
def award_xp(user_id, xp_amount, db):
    ...
    db.commit()  # ← Commits INSIDE the service
```
Then in [progress.py](file:///c:/Users/pavle/Desktop/salsa_lab_v2/backend/routers/progress.py#L53-L58):
```python
xp_result = award_xp(str(current_user.id), lesson.xp_value, db)
update_streak(str(current_user.id), db)
db.commit()  # ← Second commit
```
The `award_xp` service commits **independently**, so if the subsequent `update_streak` fails, the XP is already committed but the streak is lost. This breaks atomicity — both operations should be in one transaction, with the router owning the single `db.commit()`.

---

### 🟠 3.2 — Accepted Answer Awards Both 10🥢 and 15🥢 (Inconsistency)
**File**: [community.py](file:///c:/Users/pavle/Desktop/salsa_lab_v2/backend/routers/community.py#L359) says "+15 🥢" in the notification:
```python
message=f"Your answer was marked as the solution! (+15 🥢)",
```
But [post_service.py](file:///c:/Users/pavle/Desktop/salsa_lab_v2/backend/services/post_service.py#L449) says "10 🥢":
```python
return {"success": True, "message": "Solution marked! Helper awarded 10 🥢"}
```
The actual award value depends on `clave_service.award_accepted_answer()` — need to verify which constant it uses. The user-facing messages are contradictory.

---

### 🟠 3.3 — Self-Reaction Check Happens AFTER Existing Reaction Check
**File**: [post_service.py](file:///c:/Users/pavle/Desktop/salsa_lab_v2/backend/services/post_service.py#L264-L280)
```python
existing = db.query(PostReaction).filter(...).first()
if existing:
    # Change reaction type (no charge)
    ...
    return {"success": True}

# Self-reaction check happens AFTER
if str(post.user_id) == user_id:
    return {"success": False, "message": "You cannot react to your own posts"}
```
If a user somehow has an existing reaction on their own post (from a bug or DB manipulation), they can **freely change the reaction type** without the self-reaction check ever being triggered. The self-reaction check should be the **first** check.

---

### 🟡 3.4 — Reaction Removal Doesn't Reverse Owner Refund
When a reaction is removed via `remove_reaction()`, the post's `reaction_count` decreases, but the **refund** that was previously awarded to the post owner (via `process_reaction_refund`) is **not clawed back**. A user could theoretically react → trigger refund → remove reaction → react again → trigger another refund, exploiting this for infinite claves.

**Impact**: Limited by "5 refunds per post" cap, but the exploit window exists.

---

### 🟡 3.5 — `active_now` Counter is Fake
**File**: [community.py](file:///c:/Users/pavle/Desktop/salsa_lab_v2/backend/routers/community.py#L39-L40)
```python
base_active = max(5, int(total_users * 0.02))
active_now = max(3, base_active + random.randint(-3, 5))
```
The "active now" counter in community stats is **randomly generated**, not based on actual session data. This is social proof fabrication. While common in early-stage startups, it should be clearly documented and eventually replaced with real presence tracking (e.g., Redis set of recent activity timestamps).

---

### 🟡 3.6 — Soft-Deleted Posts Still Indexed in Tag Counts
When a post is soft-deleted (`is_deleted = True`), the tag `usage_count` is **not decremented**. Over time, tag counts will become inflated and inaccurate. The `delete_post()` function only sets `is_deleted = True` without adjusting tag counts.

---

### 🔵 3.7 — Level Formula Produces Level 0 for XP 1–99
**File**: [gamification_service.py](file:///c:/Users/pavle/Desktop/salsa_lab_v2/backend/services/gamification_service.py#L8-L12)
```python
def calculate_level(xp):
    if xp <= 0: return 1
    return int(math.floor(math.sqrt(xp / 100)))
```
For XP values 1-99: `floor(sqrt(50/100)) = floor(0.707) = 0`. Users who complete one lesson (50 XP) will display as **Level 0**, which is confusing. The function should be `max(1, floor(sqrt(xp/100)))`.

---

## 4. Performance Concerns

### 🟠 4.1 — N+1 Query in Feed Responses
**File**: [post_service.py](file:///c:/Users/pavle/Desktop/salsa_lab_v2/backend/services/post_service.py#L48-L61)
```python
def _format_post_response(post, current_user_id, db):
    user = db.query(User).filter(User.id == post.user_id).first()  # 1 query per post
    reaction = db.query(PostReaction).filter(...).first()  # 1 query per post
```
For a feed of 20 posts, this executes **40+ additional queries** (1 user lookup + 1 reaction check per post). Use `joinedload` or batch prefetch:
```python
posts = query.options(
    joinedload(Post.user).joinedload(User.profile),
    joinedload(Post.reactions)
).all()
```

---

### 🟠 4.2 — Badge Stats Execute 7+ Separate Queries
**File**: [badge_service.py](file:///c:/Users/pavle/Desktop/salsa_lab_v2/backend/services/badge_service.py#L166-L224)
`get_user_stats()` runs **7 separate count queries** against the database (one per stat type). For the profile page, this is called on every load. These could be consolidated into a single query with conditional aggregation.

---

### 🟡 4.3 — `get_user_badges` Issues N+1 for Badge Definitions
**File**: [badge_service.py](file:///c:/Users/pavle/Desktop/salsa_lab_v2/backend/services/badge_service.py#L262-L285)
```python
for ub in user_badges:
    bd = db.query(BadgeDefinition).filter(BadgeDefinition.id == ub.badge_id).first()
```
Each earned badge triggers a separate query for its definition. Use a join or batch fetch.

---

### 🟡 4.4 — Mux Asset Lookup Scans All Recent Assets
**File**: [mux.py](file:///c:/Users/pavle/Desktop/salsa_lab_v2/backend/routers/mux.py#L679-L691)
```python
assets_response = assets_api.list_assets(limit=50)
for asset in assets_response.data:
    # Linear scan through 50 assets
```
The `check-upload-status` endpoint for courses, levels, and posts fetches up to 50 recent Mux assets and linearly scans for the matching passthrough data. If the asset is older, it won't be found. A better approach is to store the `upload_id` on the entity and query Mux directly by upload ID.

---

### 🟡 4.5 — World Lessons Endpoint Loads All Levels Eagerly
**File**: [courses.py](file:///c:/Users/pavle/Desktop/salsa_lab_v2/backend/routers/courses.py#L297-L361)
`get_world_lessons()` iterates through `world.levels` which triggers lazy loading of all levels and their lessons. For a large course, this could be slow. Use explicit eager loading with `joinedload`.

---

## 5. Code Quality Issues

### 🟡 5.1 — Debug `print()` Statements in Production Code
**Files**: [payments.py](file:///c:/Users/pavle/Desktop/salsa_lab_v2/backend/routers/payments.py) (5 instances), [community.py](file:///c:/Users/pavle/Desktop/salsa_lab_v2/backend/routers/community.py#L136) (1 instance)
```python
print(f"[COMMUNITY] Creating post - User: {current_user.email}...")
print(f"Warning: Could not find user_id...")
```
These print user emails and internal state to stdout. Replace with `logger.info()` / `logger.warning()` and ensure PII is not logged at INFO level.

---

### 🟡 5.2 — Broad `except Exception as e` Handlers (30+ instances)
Throughout the routers, there are 30+ bare `except Exception as e` handlers. Many simply re-raise as HTTPException, but some silently swallow errors. These should catch specific exceptions (e.g., `StripeError`, `ApiException`, `SQLAlchemyError`) to avoid masking programming bugs.

---

### 🟡 5.3 — Inconsistent Role Check Patterns
Some files compare roles correctly:
```python
current_user.role == UserRole.ADMIN
```
Others use dual checks:
```python
is_admin = (current_user.role == UserRole.ADMIN) or (str(current_user.role) == "admin")
```
This suggests there were bugs with the enum comparison at some point. The `str()` fallback should be removed after confirming the enum works correctly.

---

### 🔵 5.4 — No Input Sanitization on Community Tags
Tags from user input are validated against existing `CommunityTag` records, which is good. But the search query in `search_posts()` accepts arbitrary strings for ILIKE matching without length limits beyond the basic `min_length=2` constraint.

---

### 🔵 5.5 — Multiple Webhook Endpoint Registrations  
**File**: [main.py](file:///c:/Users/pavle/Desktop/salsa_lab_v2/backend/main.py)
MUX webhooks appear to be registered at multiple paths. Verify which path is actually configured in the Mux dashboard and remove unused endpoints to reduce the attack surface.

---

## 6. Recommended Priority Fixes

### Tier 1 — Fix Before Launch (Critical / Security)

| # | Issue | Severity | Effort |
|---|-------|----------|--------|
| 2.1 | Stop leaking exception details to clients | 🔴 | 1–2 hours |
| 2.2 | Fix `datetime.fromtimestamp()` → UTC in payments | 🟠 | 30 min |
| 3.1 | Move `db.commit()` out of `award_xp` service | 🔴 | 30 min |
| 3.7 | Fix Level 0 bug with `max(1, ...)` | 🔵 | 5 min |
| 1.6 | Wire up streak badge checks in `update_streak()` | 🟡 | 15 min |
| 3.3 | Move self-reaction check before existing reaction check | 🟠 | 10 min |

### Tier 2 — Fix Before Scale (Performance / Logic)

| # | Issue | Severity | Effort |
|---|-------|----------|--------|
| 4.1 | Fix N+1 query in community feed | 🟠 | 2–3 hours |
| 4.2 | Consolidate badge stat queries | 🟠 | 1–2 hours |
| 4.3 | Fix N+1 in `get_user_badges` | 🟡 | 30 min |
| 3.4 | Add reaction-remove clave clawback logic | 🟡 | 1–2 hours |
| 3.6 | Decrement tag counts on post soft-delete | 🟡 | 30 min |
| 3.2 | Fix inconsistent clave award message (10 vs 15) | 🟠 | 15 min |

### Tier 3 — Fix When Ready (Features / Tech Debt)

| # | Issue | Severity | Effort |
|---|-------|----------|--------|
| 1.1 | Implement lesson comments | 🔴 | 4–8 hours |
| 1.2 | Build actual RAG knowledge base for AI | 🟠 | 8–16 hours |
| 1.4 | Integrate Mux uploader for boss battles | 🟠 | 2–4 hours |
| 5.1 | Replace `print()` with `logger` | 🟡 | 1 hour |
| 5.2 | Narrow broad exception handlers | 🟡 | 2–3 hours |
| 5.3 | Standardize role check patterns | 🟡 | 1 hour |
| 2.8 | Implement token revocation with Redis blacklist | 🔵 | 2–4 hours |
| 3.5 | Replace fake "active now" with real presence | 🟡 | 2–4 hours |
