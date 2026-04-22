# The Mambo Guild — Complete Codebase Functionality Reference

> **Last Updated**: April 22, 2026  
> **Status**: Platform is live in beta. Mux upload pipeline is wired end-to-end (lesson editor + VIP 1-on-1 coaching both use real Mux direct upload with status polling). Diego AI concierge is shipped and running on Gemini 2.0 Flash. **i18n is fully deployed across 14 locales** (en, es, pt, fr, de, it, ja, ko, zh, ru, pl, nl, ar, el) on landing, pricing, instructors, coaching, roundtable, community, profile, skill tree, and auth surfaces via a homegrown `useTranslations` hook (no `next-intl` runtime). Stripe is hardened for beta (7-day free trial on Advanced, live Guild Master seat cap, grandfather pricing lock-in, cancel-at-period-end, retention flow). Two-instructor landing (Pavle + Timothé Fournier) and release schedule roadmap are live. Global in-app **Bug Report Widget** (Section 36). **Claves economy is now a closed loop**: posting pays out (Section 37), and The Guild Shop (Section 38) sinks balances into coaching tickets, avatar-border + username-title cosmetics across four rarities, and permanent slot upgrades.

---

## Table of Contents

1. [Platform Overview](#1-platform-overview)
2. [Tech Stack & Infrastructure](#2-tech-stack--infrastructure)
3. [Authentication & User Management](#3-authentication--user-management)
4. [Course & Content Management System](#4-course--content-management-system)
5. [Video Pipeline (MUX Integration)](#5-video-pipeline-mux-integration)
6. [Image Pipeline (Cloudflare R2)](#6-image-pipeline-cloudflare-r2)
7. [Gamification Engine](#7-gamification-engine)
8. [Clave Economy (Virtual Currency)](#8-clave-economy-virtual-currency)
9. [Community Platform (The Stage & The Lab)](#9-community-platform-the-stage--the-lab)
10. [Badge & Achievement System](#10-badge--achievement-system)
11. [Streak System & Freeze Mechanics](#11-streak-system--freeze-mechanics)
12. [Leaderboard System](#12-leaderboard-system)
13. [Subscription & Payment System (Stripe)](#13-subscription--payment-system-stripe)
14. [Premium Features (Guild Master Tier)](#14-premium-features-guild-master-tier)
15. [AI Sales Concierge ("Diego" / "Tito P")](#15-ai-sales-concierge-diego--tito-p)
16. [Secure Downloads System](#16-secure-downloads-system)
17. [Notification System](#17-notification-system)
18. [Email Service (Resend)](#18-email-service-resend)
19. [Waitlist & Account Claim System](#19-waitlist--account-claim-system)
20. [Referral System](#20-referral-system)
21. [Admin Dashboard](#21-admin-dashboard)
22. [Skill Tree (Constellation Visualization)](#22-skill-tree-constellation-visualization)
23. [Landing Page & Marketing](#23-landing-page--marketing)
24. [Pro Video Controls (Lesson Player)](#24-pro-video-controls-lesson-player)
25. [DJ Booth / Mambo Mixer](#25-dj-booth--mambo-mixer)
26. [Salsa Rhythm Machine & Tutor](#26-salsa-rhythm-machine--tutor)
27. [Practice Mode](#27-practice-mode)
28. [Content Courses (Markdown-based)](#28-content-courses-markdown-based)
29. [Frontend Architecture & UI System](#29-frontend-architecture--ui-system)
30. [Backend Architecture & Services](#30-backend-architecture--services)
31. [Database Schema Overview](#31-database-schema-overview)
32. [Security Measures](#32-security-measures)
33. [Performance Optimizations](#33-performance-optimizations)
34. [Scripts & Utilities](#34-scripts--utilities)
35. [Global Translation Architecture (i18n)](#35-global-translation-architecture-i18n)
36. [Bug Report Widget (Global)](#36-bug-report-widget-global)
37. [Posting Rewards (Claves Payouts)](#37-posting-rewards-claves-payouts)
38. [The Guild Shop](#38-the-guild-shop)

---

## 1. Platform Overview

The Mambo Guild is **a gamified online salsa dance learning management system** built as a full-stack web application. It combines structured dance education with gamification mechanics inspired by video games — XP systems, badges, streaks, a virtual currency ("Claves"), skill trees, and community features.

**Target audience**: Salsa dancers from beginner to advanced, with a focus on Salsa On2 (New York Style Mambo).

**Core value proposition**: A structured learning path with modular segmentation (isolating footwork → styling → integration) powered by Learning Experience Design and Gamification principles.

---

## 2. Tech Stack & Infrastructure

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| Next.js | 15.1.5 | React framework with App Router |
| TypeScript | — | Type-safe development |
| Tailwind CSS | 4 | Utility-first styling with dark theme |
| Framer Motion | 12.23.26 | Animations and page transitions |
| @mux/mux-player-react | — | Video playback |
| @mux/mux-uploader-react | — | Video upload |
| react-markdown | — | Markdown content rendering (GFM) |
| Axios | — | HTTP client with request caching |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| FastAPI | 0.104.1 | Python web framework |
| SQLAlchemy | 2.0.23 | ORM (synchronous) |
| PostgreSQL | 15 | Primary database with JSONB, ARRAY support |
| Redis | 7 (Alpine) | Caching, rate limiting, OAuth state |
| mux-python | 5.1.0 | Video API integration |
| boto3 | 1.34.0 | Cloudflare R2 (S3-compatible) |
| Stripe | — | Payment processing |
| Resend | — | Transactional email |
| google-generativeai | — | AI concierge (Gemini 2.0 Flash) |

### Infrastructure
| Service | Purpose |
|---|---|
| Docker & Docker Compose | Container orchestration (4 services: postgres, redis, backend, frontend) |
| Cloudflare R2 | Object storage for images/archives (S3-compatible, zero egress) |
| Mux | Video hosting, streaming, transcoding |
| Stripe | Subscription billing |
| Resend | Transactional email delivery |
| Supabase PostgreSQL | Production database hosting (NANO compute) |

---

## 3. Authentication & User Management

### Registration (`POST /api/auth/register`)
- Email/password registration with **password confirmation validation**
- **Username (Gamertag)** — unique, 3–30 chars, case-insensitive uniqueness check
- First name, last name, dance level tag selection (Beginner/Novice/Intermediate/Advanced)
- Automatic creation of: User → UserProfile → Subscription (Rookie) → Starter clave bonus (15 🥢)
- Referral code auto-generation (8-char hex, collision-checked)
- Blocked disposable email domain detection (30+ domains)

### Login (`POST /api/auth/token`)
- Email/password login with **rate limiting** (5 per email/5 min, 20 per IP/5 min)
- **Timing-attack prevention**: dummy hash computed even for invalid emails
- JWT access tokens (30 min) + refresh tokens (7 days)
- **httpOnly cookies** with secure SameSite=Lax policies
- On login: streak updated, daily clave claim processed

### Token Refresh (`POST /api/auth/refresh`)
- Refresh token from httpOnly cookie (scoped to `/api/auth/refresh` path)
- New access + refresh tokens issued
- User existence re-validated

### Logout (`POST /api/auth/logout`)
- Clears authentication cookies

### Google OAuth (`GET /api/auth/login/google` → `GET /api/auth/callback/google`)
- Full OAuth2 flow with CSRF state protection (stored in Redis, 10 min TTL)
- Automatic account creation for new OAuth users
- **Account linking**: existing email users can link Google OAuth
- Profile picture sync from Google
- OAuth users get `is_verified=True` by default

### Password Reset Flow
- `POST /api/auth/forgot-password` — rate-limited, anti-enumeration (always returns success)
- Uses `itsdangerous.URLSafeTimedSerializer` for secure, time-limited tokens (60 min default)
- `POST /api/auth/reset-password` — validates token, updates password
- Special "Account Claim" mode for waitlist users (configurable via `ALLOW_ACCOUNT_CLAIM` env)

### User Roles
| Role | Access |
|---|---|
| `student` | Default role, standard user |
| `admin` | Full admin dashboard access, global permissions |
| `instructor` | Boss battle grading, coaching review |

### User Profile (`GET /api/auth/me`)
- Returns: id, name, username, XP, level, streak, tier, role, avatar, claves, badges, stats

### Public Profiles (`/u/[username]`)
- Public page showing stats, badges, and streak for any user
- Case-insensitive username lookup

### Username Management
- Users can edit their gamertag/username
- Validation: 3-30 characters, unique (case-insensitive)

### User Profile Modal
- Clickable user avatars across the app open a `UserProfileModal` with avatar, name, level, quick stats, and an **Instagram connect link** (`instagram_url` field on UserProfile)
- The owner-edit flow refreshes `instagram_url` in context immediately after save so the UI updates without a reload

### Mobile Profile (RPG Character Sheet)
- Redesigned portrait profile fits all key info on first screen: compact avatar header, level progress bar, 3x2 stats grid, community stats row, and featured badges
- **Tap-to-toggle badge showcase editing** directly on mobile (no separate edit page)
- Gear icon replaced with a sign-out icon at the top of mobile profile
- Featured badges section hidden on mobile, collection items use smaller tiles, "Continue learning" card pushed to the bottom
- Desktop profile layout is unchanged

### Subscription Management (Profile)
- Paid users see a hidden "Manage subscription" link at the bottom of the profile page
- Opens a 3-step retention modal: loss framing, price-lock warning, type-CANCEL confirmation
- Primary button at every step is "Keep my subscription"; cancel is always a dim secondary link
- Confirmed cancel hits `/api/payments/cancel-subscription` which **schedules cancellation at period end** (not immediate)
- While a cancel is scheduled, the billing section shows the end date and a Resume button calling `/api/payments/resume-subscription`

---

## 4. Course & Content Management System

### Hierarchy
```
World (Course) → Level (Module/Week) → Lesson
```

### World (Course) Model
| Field | Description |
|---|---|
| `title`, `description`, `slug` | Core metadata |
| `order_index` | Ordering |
| `is_free` | Free tier access flag |
| `difficulty` | Beginner / Intermediate / Advanced / Open |
| `course_type` | `course` (📚), `choreo` (💃), `topic` (💡) |
| `is_published` | Publishing control |
| `thumbnail_url` | Course thumbnail (R2) |
| `mux_preview_playback_id/asset_id` | Hover preview video |
| `total_duration_minutes` | Aggregate duration |
| `objectives` | JSONB array of 3 bullet-point objectives |

### Level (Module) Model
| Field | Description |
|---|---|
| `title`, `description` | Core metadata |
| `order_index` | Ordering within course |
| `x_position`, `y_position` | Coordinates for skill tree graph layout |
| `thumbnail_url` | Icon/thumbnail for skill node |
| `outcome` | e.g., "Unlock Stable Turns" |
| `duration_minutes`, `total_xp` | Module-level aggregates |
| `status` | `active`, `coming_soon`, `locked` |
| `mux_preview_playback_id` | Skill tree hover GIF preview |

### Level Edge Model (Skill Tree Dependencies)
- `from_level_id` → `to_level_id` within a `world_id`
- Represents prerequisite relationships for the constellation graph

### Lesson Model
| Field | Description |
|---|---|
| `title`, `description` | Core metadata |
| `video_url` | Legacy video URL |
| `mux_playback_id`, `mux_asset_id` | Mux video integration |
| `lesson_type` | `video` (video+notes), `quiz` (quiz only), `history` (notes only) |
| `xp_value` | XP reward (default 50) |
| `is_boss_battle` | Boss battle flag (requires video submission) |
| `week_number`, `day_number`, `order_index` | Hierarchical sorting |
| `content_json` | JSONB rich content (markdown notes, quizzes) |
| `thumbnail_url` | Lesson thumbnail (R2) |
| `duration_minutes` | Video duration |

### Content Types
- **Courses** (📚): Full structured learning paths with weeks/days
- **Choreographies** (💃): Standalone dance routines
- **Topics** (💡): Focused educational content (e.g., training science, history)

### Courses API
- `GET /api/courses` — list all published courses (public)
- `GET /api/courses/{slug}` — course detail with levels and lessons
- `GET /api/courses/{slug}/progress` — user's progress within a course
- `GET /api/courses/{slug}/skill-tree` — skill tree data for constellation view

### Course Discovery & Filtering
- **Search bar** with aesthetic warm amber glow
- **Type filters**: Courses / Choreographies / Topics with count badges
- **Difficulty filters**: Beginner / Intermediate / Advanced
- Dropdown filter UI used up through the `xl` breakpoint (desktop-width) so narrow laptops get the mobile-friendly picker instead of wrapping chips
- Portal-rendered popovers so the filter bar isn't clipped by card grid overflow
- **Type color coding** on course cards so Courses / Choreographies / Topics are visually distinct
- **Choreography click goes directly to the lesson**, skipping the skill-tree view (choreos are single-lesson)
- `course_type` filter normalizes both `choreo` and `choreography` so legacy content still matches

---

## 5. Video Pipeline (MUX Integration)

### Upload Flow (Admin Lesson Editor)
1. Frontend requests upload URL from `/api/mux/upload-url`
2. Backend creates Mux Direct Upload via `mux-python` SDK
3. Frontend uses `@mux/mux-uploader-react` for direct upload to Mux
4. Mux processes video and sends webhook to backend
5. Backend updates lesson with `mux_playback_id` and `mux_asset_id`
6. Frontend polls for completion status

### Webhook Handling (`POST /api/mux/webhook`, `/api/webhook`, `/api/webhooks`)
- Signature verification with `MUX_WEBHOOK_SECRET`
- Events handled:
  - `video.asset.ready` → Updates lesson/post with playback ID
  - `video.asset.errored` → Error logging
  - `video.upload.asset_created` → Links upload to asset

### Video Player
- `MuxVideoPlayer.tsx` — wrapper around `@mux/mux-player-react`
- Custom controls, autoplay, theming

### Video Types
| Context | Purpose |
|---|---|
| Lesson videos | Core educational content |
| Course preview videos | Hover preview on course cards |
| Level preview videos | Skill tree node hover GIF |
| Community Stage posts | User-uploaded dance videos |
| Community reply videos | Video answers/comments |
| Boss battle submissions | Student homework videos |
| Coaching submissions | 1-on-1 video analysis |

### Mux Service (`mux_service.py`)
- Create/delete assets
- Generate upload URLs
- Get download URLs (for secure downloads)
- Playback token generation
- Upload-status endpoint returns the **asset status** alongside the playback ID so the frontend poller can reliably detect completion instead of hanging
- Webhook signature verification uses the correct **hex** (not base64) decoding for the Mux signing secret

### Coaching Upload Integration
- Guild Master 1-on-1 coaching submissions use the real Mux direct-upload flow (file picker, size/duration validation, status polling) and the `MuxVideoPlayer` wrapper for playback, rather than a placeholder drop zone

---

## 6. Image Pipeline (Cloudflare R2)

### Upload Flow
1. Frontend requests presigned URL from `/api/uploads/presigned-url`
2. Backend generates S3 presigned PUT URL via `boto3` (Cloudflare R2 is S3-compatible)
3. Frontend uploads directly to R2 via PUT request
4. Backend returns public URL

### Image Types
| Type | Purpose |
|---|---|
| User avatars | Profile pictures |
| Course thumbnails | Course cards |
| Lesson thumbnails | Lesson cards |
| Level thumbnails | Skill tree nodes |
| Badge icons | Achievement badges |
| DJ Booth covers | Album art |
| Archive thumbnails | Recording thumbnails |

### Storage Service (`storage_service.py` / `r2_service.py`)
- `storage_service.py` — presigned URL generation for uploads
- `r2_service.py` — signed URL generation for private archives (time-limited access)

---

## 7. Gamification Engine

### XP System
- **XP per lesson**: Configurable (`xp_value`, default 50)
- XP awards for coaching social share consent (+50)
- XP stored in `UserProfile.xp`

### Level System
- Level stored in `UserProfile.level` (starts at 1)
- Level progression tied to accumulated XP

### Streak System
- Daily login tracking via `UserProfile.last_login_date`
- Streak count incrementing/resetting
- Streak freeze mechanics (see Section 11)

### Progress Tracking
- `UserProgress` model: per-user, per-lesson completion tracking
- Course completion detection: all lessons in course = 100%
- Beautiful course completion modal with trophy icon
- "Complete" badge on course cards at 100%

### Gamification Service (`gamification_service.py`)
- Streak update logic
- XP award processing

---

## 8. Clave Economy (Virtual Currency)

### Overview
"Claves" (🥢) are the in-app currency used for community actions and earned through engagement. Named after the clave rhythm instrument, central to salsa music.

### Earning Claves
| Action | Amount |
|---|---|
| New user starter pack | 20 |
| Daily login (free tier) | 1–3 (RNG) |
| Daily login (pro tier) | 4–8 (RNG) |
| Streak bonus (every 5 days, free) | 10 |
| Streak bonus (every 5 days, pro) | 20 |
| Stage video post (rewarded post) | 10 (see Section 37) |
| Lab question post (body ≥ 40 chars) | 3 (see Section 37) |
| Accepted answer in The Lab | 15 |
| Reaction refund (per reaction, capped at 5/video) | 1 |
| Referral bonus | 50 |
| Subscription bonus (Advanced, one-time) | 10 |
| Subscription bonus (Performer, one-time) | 20 |

### Spending Claves
Engagement is now free — reacting, commenting, and posting do not charge claves. Claves are earned and then sunk into:

| Action | Cost |
|---|---|
| Streak freeze repair | 10 |
| Buy inventory freeze | 10 |
| The Guild Shop (cosmetics, utility, Golden Tickets) | see Section 38 |

### Slot Limits
| Resource | Free | Pro |
|---|---|---|
| Video slots | 5 | 20 |
| Question slots | 10 | 50 |

Shop-purchased utility SKUs add **permanent bonus slots on top of these caps** (`+5 video` stacks up to 5 times → +25 total; `+10 lab` stacks up to 3 times → +30 total). See Section 38.

### Anti-Abuse
- **Self-reaction ban**: Users cannot react to their own posts.
- **Race-condition prevention**: both `spend_claves()` *and* `earn_claves()` take `SELECT ... FOR UPDATE` on the user's `user_profiles` row. Re-locking an already-locked row inside the same transaction is a Postgres no-op, so nested callers (e.g. `process_reaction_refund` → `earn_claves`) stay correct. This closes a lost-update class of bug where concurrent earn paths (multi-reaction, multi-tab posting, simultaneous daily-login + post-reward) would drift `profile.current_claves` below the ledger sum.
- **Post-reward serialization**: `posting_reward_service.award_post_reward` also takes the profile lock at the top of the function so check-then-earn sequences (cooldown + daily cap + idempotency) are atomic against concurrent posts from the same user. See Section 37.
- **Subscription-bonus idempotency**: `award_subscription_bonus` refuses to grant a second `subscription_bonus:{tier}` transaction for the same user, blocking downgrade → upgrade → downgrade farming cycles.
- Transaction log: every earning and spending event recorded in `clave_transactions` (namespaced `reason` strings: `daily_login`, `streak_bonus`, `accepted_answer`, `reaction_refund`, `reaction_refund_clawback`, `post_reward:{stage|lab}`, `post_reward_clawback:{stage|lab}`, `shop_purchase:{sku}`, `subscription_bonus:{tier}`, etc.) so balances can always be rebuilt from the ledger and filtered for audits.

### Wallet Modal
- Shows current balance
- Transaction history (last 20)
- Video slot usage display

---

## 9. Community Platform (The Stage & The Lab)

### The Stage (Video Posts)
- Instagram-style video sharing for dance progress
- Video upload via Mux direct upload
- Feedback type: **Hype** (reactions only) or **Coach** (comments enabled)
- **WIP banner**: "Work in Progress" indicator
- Tags for categorization (e.g., `on2`, `spinning`)

### The Lab (Q&A Posts)
- Stack Overflow-style technical Q&A
- Text-based questions with rich markdown
- **Solution marking**: Post author can accept an answer → awards 15 🥢
- Solved/unsolved status tracking

### Post Model
- `post_type`: `stage` or `lab`
- Content: title, body, video (Mux), tags, feedback_type
- Denormalized counts: `reaction_count`, `reply_count`
- Soft delete with `is_deleted` flag

### Reactions
- Three types: 🔥 Fire, 📏 Ruler (precision), 👏 Clap
- One reaction per user **per type** per post, so each emoji has its own independent unique constraint and 🔥, 📏, and 👏 counts increment separately on the same post
- Costs 1 🥢 to react
- Post owner gets reaction refund (up to 5 per video)

### Replies
- Text responses to posts
- Optional video replies via Mux
- Can be marked as accepted answer (Lab posts)

### Community Tags
- Predefined taxonomy: `slug`, `name`, `category` (technique, general, etc.)
- Usage count tracking

### Access Control
- **Teaser view** for non-pro users with "Join/Upgrade" CTAs
- Full access requires active Advanced or Performer subscription

### Post Operations
- Create, update, delete (with Mux asset cleanup)
- Admin: global delete/edit permissions
- Cascade deletion: replies deleted with posts

### Saved Posts
- Users can save posts for later via a dedicated `saved_posts` table
- CRUD endpoints under `/api/community`
- Saved tab in the community UI

### Community Moderation
- AI gatekeeper adds `moderation_status` to replies
- Admin moderation queue at `/admin/moderation` to flag / approve / ghost replies
- Backed by `moderation_service` on the backend

### Mobile Community (Instagram-style)
- Sticky mobile header with search bar, Stage/Lab pill toggle, and **glassmorphism Level filter dropdown**
- Stage videos render as a tight **3-column square thumbnail grid** (Instagram Explore style)
- Sidebar and widgets hidden on mobile
- Desktop layout unchanged, with a dedicated desktop search bar added alongside the existing filters
- Portrait mobile also gets a "Mine" toggle in the header to scope the feed to the user's own posts
- **Focus Area filter removed**; trending-tag clicks correctly populate the tag filter
- **My Posts level counts scoped** so the badge only reflects the user's own posts, not the global level count
- `?post=<id>` deep links are read from `window.location` (not `useSearchParams`) so modal open works reliably on first paint

---

## 10. Badge & Achievement System

### Badge Architecture
- **38 unique badges** with 3D metallic aesthetics
- **4 tiers**: Bronze, Silver, Gold, Diamond
- **3 categories**: Course, Community, Performance

### Badge Types
| Badge Family | Trigger | Tiers |
|---|---|---|
| **Firestarter** | Receiving 🔥 Fire reactions | Bronze (5) → Silver (25) → Gold (100) → Diamond (500) |
| **The Professor** | Getting accepted answers in The Lab | Bronze → Silver → Gold → Diamond |
| **Center Stage** | Posting video homework | Bronze → Silver → Gold → Diamond |
| **Unstoppable / Metronome** | Maintaining daily login streaks | Bronze (7) → Silver (30) → Gold (100) → Diamond (365) |
| **Curious Mind** | Various engagement milestones | Single tier |
| **Founder** | Waitlist/Beta tester status | Single tier |
| **Guild Master** | Performer subscription | Single tier |
| **Pro Member** | Advanced subscription | Single tier |

### Badge Service (`badge_service.py`)
- `get_all_badges_for_user()` — returns all badge definitions with earned/locked status
- `check_streak_badges()` — triggered on daily login
- `check_reaction_badges()` — triggered on receiving reactions
- `award_subscription_badge()` — triggered on subscription activation
- Retroactive badge awarding script available

### Trophy Case UI (`BadgeTrophyCase.tsx`)
- Visual display of earned/locked badges on profile
- Premium 3D rendered badge images
- Category filtering

---

## 11. Streak System & Freeze Mechanics

### Streak Tracking
- `UserProfile.streak_count` — current consecutive day count
- `UserProfile.last_login_date` — last activity date
- Streak increments on daily login
- Streak resets to 0 if a day is missed (unless freeze is used)

### Freeze Protection (Priority Order)
1. **Weekly Freebie**: 1 free freeze per week (resets every Monday)
2. **Inventory Freezes**: Purchased freezes stored in `inventory_freezes`
3. **Clave Purchase**: Pay 10 🥢 to repair a broken streak (user must confirm)

### Freeze Fields
| Field | Description |
|---|---|
| `weekly_free_freeze_used` | Boolean — weekly freebie consumed |
| `inventory_freezes` | Integer — purchased freeze count |
| `last_freeze_reset_date` | Date — tracks weekly reset day |

### Freeze Store UI (`StreakFreezeStore.tsx`)
- Buy freezes with claves
- Status display (freebie available, inventory count)
- Streak repair prompt when streak is at risk

---

## 12. Leaderboard System

### Categories
| Category | Scoring Formula |
|---|---|
| **Overall** | Posts×5 + Reactions Received×2 + Replies×3 + Solutions×15 |
| **Helpful** | Replies×3 + Solutions×10 |
| **Creative** | Posts×5 + Reactions Received×3 |
| **Active** | Posts×3 + Replies×2 + Reactions Given×1 |

### Periods
- **Weekly** (last 7 days)
- **Monthly** (last 30 days)
- **All-time**

### Features
- Top 10 display with rank, avatar, name, and score
- Per-user rank lookup
- Hall of Fame (all-time top 5)

---

## 13. Subscription & Payment System (Stripe)

### Tiers
| Tier | Price | Stripe Price ID | Access |
|---|---|---|---|
| **Guest List (Rookie)** | Free | — | 1 free course, limited community |
| **Full Access (Advanced)** | $39/mo USD | `price_1TKKp51a6FlufVwfYgvr192X` | Unlimited courses, full community |
| **Performer (Guild Master)** | $59/mo USD | `price_1TKKwC1a6FlufVwfVmE6uHml` | All Advanced + premium features |

### Checkout Flow
1. `POST /api/payments/create-checkout-session` — creates Stripe Checkout Session
2. User redirected to Stripe hosted checkout
3. Stripe webhook (`invoice.payment_succeeded`) updates subscription in DB
4. Automatic clave bonus + subscription badge awarded

### Subscription Management
- `POST /api/payments/update-subscription` — upgrade/downgrade with proration
- `POST /api/payments/cancel-subscription` — immediate cancellation
- Webhook: `customer.subscription.deleted` → status set to canceled

### Subscription Model
| Field | Description |
|---|---|
| `stripe_customer_id` | Stripe Customer ID |
| `stripe_subscription_id` | Stripe Subscription ID |
| `status` | active / past_due / canceled / incomplete / trialing |
| `tier` | rookie / advanced / performer |
| `current_period_end` | Billing period end date, read from the subscription **item** (Stripe 2025 API shape) |
| `cancel_at_period_end` | Scheduled-cancel flag, set by retention flow |
| `has_used_trial` | One-trial-per-user guard on `user_profiles` |

### 7-Day Free Trial
- Trial is offered on the **Advanced** tier only; Guild Master has no trial
- Auto-converts to paid after 7 days
- One trial per user (enforced via `user_profiles.has_used_trial`)
- Stripe pre-check refuses the trial if the email is already known to Stripe (defeats same-email re-signup loophole)
- All paid content gates on `ACTIVE` **or** `TRIALING` status; Guild Master perks stay `ACTIVE`-only (trialers excluded)
- Upgrading auto-clears `cancel_at_period_end`; a trialing user upgrading to Performer ends the trial immediately

### Live Guild Master Seat Counter
- `/pricing` page shows a live count of Guild Master seats taken against a 30-seat cap
- Checkout is blocked when the cap is reached
- Seat-cap check is serialized with a **Postgres advisory lock** so concurrent checkouts can't overfill the cap

### Grandfather Pricing
- "Founders' Price" lock-in badges on paid tiers, with line-through on the future price
  - Pro: $39 now, $49 after Aug 1 2026
  - Guild Master: $59 now, $99 after 30 seats
- Live countdown to the Pro price change, rendered below the pricing cards
- "Your $price locked in for life" feature row on each paid tier
- Trust bar: cancel anytime, price-locked-for-life, Stripe checkout

### Pricing UX
- `sonner` toasts replace browser `alert` / `confirm` for upgrade/downgrade/error messaging
- Downgrade uses a `ModalShell` confirmation pattern instead of a confirm toast
- Upgrade/downgrade **updates the card in place** with no navigation away from `/pricing`

### Stripe Hardening (Security Audit Pass)
- **Open-redirect prevention**: `success_url` / `cancel_url` must match the frontend host or checkout is rejected
- `customer.subscription.deleted` events filtered on both `sub_id` **and** `customer_id` so stale events can't flip the wrong user to ROOKIE
- `customer.subscription.updated` mirrors past_due / canceled / incomplete so failed renewals don't leave stale ACTIVE rows
- `metadata.user_id` validated against the DB before minting a subscription row; existing rows are updated rather than duplicated
- Existing Stripe customers reused by email (no duplicate customers)
- `invoice.payment_succeeded` no longer raises 5xx (prevents retries into an already-consumed idempotency slot)
- Tier resolution goes through `price.id` first, `lookup_key` as fallback, so a dashboard rename can't silently drop users to ROOKIE
- Stripe subscription `customer` verified against stored id before `Subscription.modify` (defense-in-depth)
- Clave welcome bonus guarded to once per user+tier (kills the upgrade/downgrade XP-farming cycle)
- Invoice `.data` attribute collision fixed; `current_period_end` read from the subscription **item**, not the subscription root

---

## 14. Premium Features (Guild Master Tier)

All premium features require **Performer (Guild Master)** subscription.

### 14a. The Roundtable (Live Calls)
- Weekly live Zoom calls for Guild Master members
- Admin schedules calls → users see upcoming/live status
- Status: `scheduled` → `live` → `completed`
- Past recordings available in "The Vault"
- Countdown timer on user-facing page

### 14b. Weekly Archives (Cloudflare R2)
- Archived recordings stored in Cloudflare R2
- YouTube unlisted URLs for playback
- Topic/tag filtering
- Time-limited signed URLs for security
- Admin CRUD management

### 14c. Weekly Meeting Config
- Persistent Zoom meeting link (single row, id=1)
- Admin editable URL + meeting notes
- **Dynamic weekly meeting schedule**: admin edits the day/time, and the Roundtable page reflects it on the user side in real time
- Displayed to Guild Master users

### 14d. 1-on-1 Video Coaching
- **1 submission per month** per Guild Master user on the subscription slot; a Golden Ticket purchased from The Guild Shop (Section 38) creates a parallel submission that does **not** consume the monthly slot.
- `coaching_submissions.source` column distinguishes `subscription` vs `golden_ticket`; the `(user_id, submission_month, submission_year, source)` unique constraint lets a Performer stack both in the same month.
- Golden Ticket redemption: `POST /api/premium/coaching/submit-ticket` finds the user's earliest unfulfilled `ShopPurchase` for `sku=ticket_golden`, creates the `CoachingSubmission` with `source='golden_ticket'`, and links it back via `shop_service.mark_fulfilled(purchase_id, submission_id)`. Admin queue surfaces the `source` so tickets get a small badge in the review UI.
- Upload dance video via **real Mux direct upload** (file picker, client-side size/duration validation, status polling); replaced the earlier placeholder drop zone
- Optional "specific question" (140 chars) — "What should I look at?"
- Marketing consent: `allow_social_share` (the +50 XP bonus was removed; the field is now pure marketing-consent signal)
- Status flow: `pending` → `in_review` → `completed` / `expired`
- Admin feedback: feedback video URL (Loom/external) + text notes
- Feedback playback uses the `MuxVideoPlayer` wrapper (so the student's video actually plays) and is **locked to a 16:9 container** so the composite reaction video doesn't get pillarboxed
- **Email notification** sent to student when feedback is ready
- **In-app notification** also fired (see Section 17)

### 14e. DJ Booth / Mambo Mixer
- Salsa tracks with **separated stems** (percussion, piano/bass, vocals/brass, full mix)
- Track metadata: title, artist, album, year, BPM, duration, cover art
- Full stem URLs available to Guild Master users
- Public preview endpoint (locked, metadata only)
- Admin CRUD management

### Guild Master Hub Page (`/guild-master`)
- Unified dashboard with tabs:
  - Live Calls / The Roundtable
  - Weekly Archives / The Vault
  - 1-on-1 Coaching
  - DJ Booth

---

## 15. AI Sales Concierge ("Diego")

### Architecture
- **Backend**: Google Gemini 2.0 Flash with Function Calling (Tools)
- **Frontend**: Pill-shaped collapsed chatbot with dark glass UI (`Mambobot.tsx`)
- **Persona**: "Diego" — 1920s Havana Head Concierge, charming and sophisticated

### Persona & Brand Voice
- **Name**: Diego (the Guild's Head Concierge)
- **Tone**: Warmly sophisticated, highly logical, empathetic, slightly scrappy, anti-elitist
- **Motto**: "Autonomy in practice. Science in technique. Serving over perfection."
- **Enemies**: Elitism, gatekeeping, paralyzing perfectionism
- **Core belief**: The person who makes the most mistakes, most publicly, improves fastest

### Conversation Strategy
1. **Qualify first** — ask 1–2 diagnostic questions before pitching (dance experience, current blockers, previous online learning attempts)
2. **Personalise** — tailor recommendation to user type (beginner / intermediate / advanced / skeptic / price-sensitive)
3. **Close with trial** — always end with "$1 for 7 days" as the zero-risk answer to all objections

### Tone Calibration by User Type
| User | Diego's approach |
|---|---|
| Complete beginners | Lead with science and structured path; reassure the Skill Tree was built for "don't know what I don't know" |
| Intermediate (1–4 yrs) | Ask specific frustrations; show Lab + Boss Battle accountability + Frame-by-Frame tool |
| Advanced | Skip basics; lead with Guild Master — 1-on-1 coaching, stem isolation, Roundtable community |
| Skeptics ("I learn in person") | Acknowledge it; pivot to motor learning science advantage of video; offer $1 trial |
| Price-sensitive | Frame math ($1.30/day); never discount; point to trial |

### Objection Handling (encoded)
| Objection | Response approach |
|---|---|
| "I learn better in person" | Validate partner dynamics; pivot to repetition volume, 25% speed, A/B loop advantage |
| "Too expensive" | $1.30/day framing; compare to one group class |
| "No time" | Modular 5–20 min lessons; weekly streak freeze built in |
| "Not ready yet" | "That feeling is the point" — Skill Tree tells you exactly where to start |
| "Tried online, didn't work" | Was it structured? Guild = roadmap + accountability + community |

### Capabilities (Tools)
1. **Conversational sales**: 1–2 diagnostic questions → personalised recommendation
2. **`recommend_membership(tier, reason, highlights)`**: Returns structured card data (base or vip) with personalised rationale
3. **`search_knowledge_base(query)`**: Searches structured knowledge base (future RAG integration)

### Knowledge Base Files
| File | Purpose |
|---|---|
| `frontend/lib/ai/diego-system-prompt.ts` | Complete Gemini system prompt (persona, pricing, features, strategy, tone calibration, tool definitions) |
| `frontend/lib/ai/diego-knowledge-base.json` | Structured JSON knowledge base (brand, pricing, curriculum, badges, Claves economy, community, FAQs, objection handling) |

### Technical Features
- **Streaming responses** via SSE (Server-Sent Events)
- **Rate limiting**: Sliding window via Redis (20 requests/60 seconds per client IP)
- **Input sanitization**: Pydantic validation, content length limits
- **Client identification**: SHA256 hash of IP + forwarded headers
- **Security**: API key server-side only, never exposed to client

### Endpoints
- `POST /api/ai/chat` — main chat endpoint (streaming/non-streaming)
- `GET /api/ai/status` — check AI availability
- `GET /api/ai/rate-limit` — check rate limit status

---

## 16. Secure Downloads System

### Architecture
- Daily download limit: **5 per user per day**
- Time-limited signed URLs (1 hour expiration)
- Backend proxy streaming with `Content-Disposition: attachment` header

### Endpoints
| Endpoint | Description |
|---|---|
| `GET /api/downloads/status` | Get today's download usage |
| `POST /api/downloads/lesson/{id}` | Generate download URL for lesson video |
| `POST /api/downloads/community/{id}` | Generate download URL for community post (owner only) |
| `GET /api/downloads/lesson/{id}/stream` | Stream download (most reliable, forces browser download) |
| `GET /api/downloads/community/{id}/stream` | Stream community video download |

### Security
- Authentication required for all endpoints
- Community downloads: only video owner can download
- Download count tracked per user per day
- URLs expire after 1 hour
- Anti-sharing: "Links are generated for your account only"

### Download Service (`download_service.py`)
- R2 signed URL generation as alternative to Mux downloads
- Daily limit checking and recording
- Fields: `downloads_today`, `last_download_date` on UserProfile

---

## 17. Notification System

### Notification Model
| Field | Description |
|---|---|
| `type` | `badge_earned`, `reaction_received`, `reply_received`, `answer_accepted`, `coaching_feedback_ready`, `roundtable_scheduled` |
| `title` | Notification title |
| `message` | Notification body |
| `reference_type` | `post`, `reply`, `badge`, `coaching`, `roundtable` |
| `reference_id` | ID of related entity |
| `is_read` | Read status flag |

### UI Component (`NotificationBell.tsx`)
- Bell icon in navbar with unread count badge
- Dropdown list of recent notifications
- Mark as read functionality
- **Click-through wiring**: clicking a notification navigates to the related entity (post, coaching submission, roundtable, badge)
- On mobile, the notification panel uses fixed full-width positioning so it doesn't overflow the viewport

### Notification Triggers
- Community: reaction received, reply received, accepted answer, badge earned (existing)
- **Coaching feedback ready**: fired when an admin marks a coaching submission complete (in addition to the existing Resend email)
- **Roundtable scheduled**: fired to all Guild Master users when the admin schedules or updates a live call

### Infra Fixes
- List route registered without a trailing slash to avoid Railway proxy 307 redirects (cookies were being dropped on the redirect)
- List response handling hardened to surface fetch errors instead of silently failing

---

## 18. Email Service (Resend)

### Email Types
| Email | Trigger |
|---|---|
| **Password Reset** | User clicks "Forgot Password" |
| **Coaching Feedback Ready** | Admin completes video review |
| **Waitlist Welcome** | New waitlist signup |
| **Announcement Email** | Admin sends custom announcement |
| **Waitlist Broadcast** | Mass email to waitlist users |
| **Beginner Challenge (Mambo Inn)** | Broadcast aimed at total beginners, sent above the open challenge in the broadcast cadence |
| **Open Challenge** | Broadcast inviting existing dancers to try the platform |
| **Bug Report** | User submits via in-app widget → `support@themamboguild.com` with screenshots + device metadata (Section 36) |

### Design
- Consistent branded HTML templates
- Georgia/serif typography, cream/paper background (#F9F7F1)
- Gold accent color (#D4AF37) for badges and CTAs
- Mobile-responsive with viewport meta tags

### Broadcast Script (`broadcast_waitlist.py`)
- Bulk email to waitlist users (up to 500)
- Filters out fake, test, and bounced emails
- Content includes free choreo links, educational sections (Science & History)

---

## 19. Waitlist & Account Claim System

### Waitlist Mode
- Configurable via `NEXT_PUBLIC_WAITLIST_MODE` env variable
- Full-site lockout behind "Founders Only" waitlist page
- Waitlist signup creates user with `auth_provider="waitlist"`

### Account Claim
- Enabled via `ALLOW_ACCOUNT_CLAIM=true` env variable
- Waitlist users can claim their account by resetting password
- Converts `auth_provider` from "waitlist" to "email"
- Preserves username and referral code

### Waitlist Data
- `waitlist_users.json` — stored list of waitlist signups
- Blocked email domain detection for anti-bot protection

---

## 20. Referral System

### Mechanics
- Every user gets a unique referral code (8-char hex)
- Referral link format: `{FRONTEND_URL}/waitlist?ref={code}`
- When referred user signs up: referrer gets 50 🥢 bonus
- Referral count tracked on `UserProfile.referral_count`
- **Beta Tester badge** unlocked at 3 referrals

### UI (`ReferralSection.tsx`)
- Copy-to-clipboard referral link
- Referral count display
- Badge unlock tracking

---

## 21. Admin Dashboard

### Pages
| Route | Functionality |
|---|---|
| `/admin` | Main dashboard with overview stats |
| `/admin/builder` | Course builder with drag-and-drop curriculum |
| `/admin/settings` | Platform settings (Platform / Email Broadcast / Weekly Meeting / **Release Schedule**) |
| `/admin/students` | View enrolled students, inline grant-claves + grant-XP controls |
| `/admin/grading` | Boss battle submission review |
| `/admin/coaching` | Coaching submission queue |
| `/admin/live` | Live call scheduling and management |
| `/admin/moderation` | Community moderation queue (flag / approve / ghost replies) |

### Mobile Admin
- `AdminSidebar` converts from a fixed `w-64` panel to a **slide-in drawer with hamburger** on mobile
- All admin pages use responsive `ml-0 lg:ml-64` margins so content doesn't overlap the drawer

### Course Builder (`admin_courses.py`)
- **World (Course) CRUD**: Create, update, delete, reorder courses
- **Level (Module) CRUD**: Create, update, delete, reorder modules within courses
- **Lesson CRUD**: Create, update, delete, reorder lessons within modules
- Content type selector (Course/Choreography/Topic)
- Rich lesson editor with auto-save, video upload, quiz creation
- Thumbnail and preview video management
- Skill tree graph node positioning (x/y coordinates)
- Edge management for skill tree dependencies

### Lesson Editor (`LessonEditorModal.tsx`)
- 48KB component — very feature-rich
- Rich markdown content editor
- Video upload with Mux integration
- Quiz creation (multiple choice with correct answers)
- Thumbnail upload
- Boss battle toggle
- XP value configuration
- Week/day/order numbering
- Auto-save with debounce

### Admin Capabilities
- View all students with real-time data
- Global delete/edit permissions on community posts
- Email announcements to individual students
- Boss battle grading (approve/reject with feedback)
- Coaching submission review with video feedback
- Live call management (schedule/cancel/mark live/complete)
- DJ Booth track management
- Weekly meeting config
- Weekly archive management
- **Grant claves** to students directly from the admin students page (in addition to grant-XP)
- **Auto-create new tables** on backend startup via `Base.metadata.create_all` so fresh beta tables (saved posts, release schedule, moderation_status) land on deploy without a manual migration step
- **Cascade-delete lesson dependents** when deleting a lesson so foreign-key NOT NULL constraints don't block removal
- Release Schedule editor (see below)

### Release Schedule Admin
- New Settings tab lets staff add, edit, delete, and reorder items on the launch roadmap
- Backed by a `release_schedule_items` table with CRUD endpoints under `/api/premium/admin/release-schedule`
- The landing roadmap and the `/courses` popover both read from this table (the frontend falls back to a hardcoded list when the API is empty, so the landing page never looks broken on first deploy)

---

## 22. Skill Tree (Constellation Visualization)

### Architecture
- **Backend**: Level positions (x,y) and LevelEdge dependency graph
- **Frontend**: Canvas-based constellation visualization

### Components
| Component | Description |
|---|---|
| `ConstellationGraph.tsx` | Main canvas graph renderer |
| `SkillNode.tsx` | Individual node (20KB — complex interactions) |
| `GoldEdge.tsx` | Animated gold edges (flickering, flowing, pulse effects) |
| `NodeTooltip.tsx` | Hover tooltip with Mux GIF preview |
| `ModuleModal.tsx` | Click-to-open module details |
| `AdminGraphBuilder.tsx` | Admin-only graph editor for node positioning |
| `LevelEditModal.tsx` | Admin modal for editing level/node properties |
| `LessonEditModal.tsx` | Admin modal for editing lesson within skill tree |

### Features
- Interactive 3D/Canvas visualization of learning path
- Animated gold connection edges between prerequisite nodes
- Hover tooltips with animated GIF previews from Mux
- Grey-out effect for logged-out users
- Mobile-first "Phone Frame" scanning animation
- Progress tracking overlaid on skill tree
- On topic worlds, the hover preview surfaces a **lesson TL;DR** snippet
- On touch, hover tooltip is bypassed and a tap fires the click directly (with `whileTap` scale feedback)
- Resize event dispatched after mount to force ReactFlow node rendering after soft navigation
- Skill tree no longer unmounts on auth re-fetch; centering is computed from the dagre bounds (no DOM timing) with `useNodesInitialized` + double-rAF for reliability

### Prerequisite Rules
- Prerequisites are now a **recommendation**, not a hard gate
- Subscribed users (or admins) can click any off-path node; a confirmation modal explains that modules build on each other and lets them **stay on path** or **skip anyway**
- Mastered nodes never prompt
- **Levels with any progress stay unlocked** across prereq graph changes (so editing edges in admin never strands a student mid-course)
- Subscription and admin remain the only hard access checks at the lesson level

### Zoom / Viewport Hardening
- `defaultViewport` computed dynamically from the dagre layout bounds instead of hardcoded
- `onInit` used (not `setTimeout`) for reliable initial centering
- `setCenter` pattern matched to the `SkillTreeTeaser` implementation (dropped `fitView`)
- **Lower default zoom on mobile** so more of the tree is visible on first paint
- Key-based remount for reliable fitView on soft nav

### Landing Page Integration (`SkillTreeTeaser.tsx` — 47KB)
- Live skill tree data from API with course toggle
- Gamification features preview (Track Progress, Earn XP, Unlock Badges)
- Full constellation graph embedded in landing page

---

## 23. Landing Page & Marketing

### Current Section Order
1. `NewHero.tsx`: hero block (see below)
2. `FounderAuthorityStrip.tsx`: founder authority strip directly under the hero
3. `TrendingModulesSection.tsx`: auto-spinning carousel of popular modules with hover previews
4. `HowItWorksSection.tsx`: 5-pillar "How It Works" conversion section with Guild UI captures
5. `SkillTreeTeaser.tsx`: interactive skill tree, renamed "Your Learning Path"
6. `ReleaseScheduleSection.tsx`: release roadmap with live countdown (see below)
7. `TestimonialsSection.tsx`: social proof (auto-scrolling on mobile)
8. `FAQSection.tsx`: 5 dancer-voiced Q&As with `FAQPage` JSON-LD (see GEO below)
9. `LandingPricingSection.tsx`: pricing cards with tier comparison, grandfather badges, live seat counter
10. Universal sticky trial bar (gold bar CTA, shown to all visitors) + `BugReportButton` (bottom-left)

### Hero (`NewHero.tsx`)
- H1 iterated through several rewrites; current positioning is around the **"World's #1 Online Salsa Platform"** concept with a **Level 0 to 100** structured-curriculum promise
- Badge "Built on Learning Experience Design"
- **2x European Champion** credential
- **Autoplaying silent cinematic trailer** served from R2 (not Mux) for fastest first paint; `preload=auto`, fades in only once actually playing, hard-reset recovery when playback stalls, forces playback on mount and on visibility change
- 4:3 video container, top-aligned with title one-line at `lg`
- Desktop: compact horizontal pill CTAs above the fold, bright amber primary CTA with glow ring
- Mobile portrait: **video-first**, CTAs below video, centered skill tree, gold sticky trial CTA
- **Landscape phone**: custom layout with zig-zag founder strip and larger video
- Social proof moved into the hero (1,000+ dancers proof signal)
- Trial CTA shown to **all visitors** (no longer gated on auth state)

### Meet Your Instructors (Landing + `/instructors`)
- Two-instructor roster with i18n across all 14 locales:
  - **Pavle Popović**: founder, 2x European Champion, Learning Experience Design certified
  - **Timothé Fournier**: profile added April 19, with `TimothePic.png` asset
- Copy and bios fully translated via the `instructors` namespace
- **Guild Ambassador application flow** on `/instructors`: amber-accented card opens `AmbassadorApplyModal.tsx`, a 5-field form (name, email, Instagram, location, message min 20 chars) that POSTs to `/api/support/ambassador-application`. The backend rate-limits 5/hr per-IP (via `utils.request.client_ip` with `TRUSTED_PROXY_HOPS`), HTML-escapes everything, and dispatches to `pavlepopovic@themamboguild.com` with `reply_to` set to the applicant so replies land in the applicant's inbox directly. Unauthenticated-friendly — pre-fills from `AuthContext` when available but does not require login. Fully i18n'd via the `ambassador` namespace.

### Founder Authority Strip
- New section under the hero with one-line founder headline and tightened bio
- Responsive: zig-zag layout on landscape phone, lighter treatment on portrait mobile
- Translation overflow protection so long locales don't break the layout

### How It Works (5-Pillar)
- Replaced earlier "Value Props" / "Maestro" blocks
- 5 pillars with Guild UI captures
- Copy tightened to "7-day free trial" (aligned with the Stripe flow)
- "500+ classes" bullet (bumped from 300+) to match FAQ copy

### Release Schedule Roadmap
- New `ReleaseScheduleSection.tsx` on landing
- **Horizontal rail** on desktop, **vertical spine** on mobile portrait, **snap carousel** on mobile landscape
- Live countdown to the next drop
- Data sourced from the admin-editable `release_schedule_items` table (see Section 21)
- Also surfaced on `/courses` as a hover popover on desktop and a bottom-sheet modal on mobile landscape (glass dropdown layout)

### FAQ Section
- `FAQSection.tsx`: 5 dancer-voiced Q&As
- **`FAQPage` JSON-LD** (XSS-escaped) for GEO + rich-result eligibility
- Accessible accordion with `aria-expanded` / `aria-controls`

### Pricing on Landing
- `LandingPricingSection.tsx` wired below testimonials (replacing a previously removed on-landing pricing block)
- Grandfather badges, live Guild Master seat counter, trust bar
- See Section 13 for the full Stripe/pricing mechanics

### Navigation & CTAs
- **Full brand name** in the navbar (simplified CTAs)
- **Universal sticky trial bar**: solid gold, eye-catching, visible on every page
- Bug report button moved to bottom-left so it doesn't collide with the sticky trial CTA
- Skill tree section has a **dropdown selector** for switching between courses
- Testimonials auto-scroll on mobile
- Navbar compacted on landscape phones to prevent link overlap; spaced on portrait so the logo doesn't crowd nav links

### Design / Typography
- **PalladiumMesh background**: dark monochrome mesh gradient with drifting circles (static circles on mobile instead of 5 infinite blur animations, for perf)
- **Typography unified to Inter** across all landing sections, with **Playfair** reserved for the hero H1 only
- Cinematic entrance, gold dust particles, glass/neon effects retained

### GEO / SEO Stack (`aa0ab72`)
- `metadataBase` + canonical, OpenGraph + Twitter Card metadata
- Dynamic `/opengraph-image` route rendering a branded 1200x630 card
- `/robots.txt` via `app/robots.ts` (public allowed, admin/api/private blocked)
- `/sitemap.xml` via `app/sitemap.ts` with priorities
- `/public/llms.txt` with cite-ready facts for AI crawlers
- `EducationalOrganization` + `Person` JSON-LD in the root layout (inherited by every page)
- `Course` + `VideoObject` + `BreadcrumbList` JSON-LD on landing (`LandingSchemas` component)
- Central site config at `lib/site.ts`; canonical `SITE_URL` is now **hardcoded** (no `NEXT_PUBLIC_SITE_URL` env dependency)

### Beta Access
- `/beta?key=...` route sets an httpOnly `BETA_ACCESS_KEY` cookie (60-day TTL) that bypasses the waitlist velvet rope
- Dual-track bypass: magic-link cookie **or** authenticated admin role
- Auth routes (`/login`, `/forgot-password`, `/reset-password`, `/register`, `/beta`) are exempt from the waitlist redirect so the account-claim flow works
- Rotate `BETA_ACCESS_KEY` on Vercel to revoke all beta access at once

---

## 24. Pro Video Controls (Lesson Player)

### Components
| Component | Description |
|---|---|
| `ABLooper.tsx` | A/B loop tool — set start/end points to drill a section |
| `FrameByFrame.tsx` | Frame-by-frame stepping for movement analysis |
| `SpeedControl.tsx` | Variable playback speed (0.25x to 2x) |
| `UpgradePrompt.tsx` | Prompt for free users to upgrade for pro controls |

### Player Styling & UX
- **Brass gold accent (#D4AF37)** replaces the Mux default red (prevents "red square" thumbnail on first play)
- **Green progress bar** (YouTube-like color styling)
- **Grey buffered bar**, forced via recursive shadow-DOM CSS injection to override Mux defaults inside every nested shadow root
- **A/B loop toggle in the sidebar** (not only in the overlay) so users can enable the loop without opening fullscreen
- **Fullscreen A/B overlay**: A/B toggle also available as a fullscreen overlay; on-state flips to dark background + bright gold text to contrast against the video
- **Glowing Prev / Next / Mark Complete buttons** with clearer visual affordance
- In-player lesson navigation (Prev/Next) with improved UX
- Duplicate top "Mark Complete" prompt was reverted

### Desktop 3-Panel Lesson Layout
- Redesigned desktop lesson viewer with a **3-panel flex layout** (video center, quest log + controls in side panels)
- Sidebars overlay the video's black bars instead of squeezing the video
- Controls moved to the correct panel

### Mobile / Landscape Lesson Page
- **Quest bar embedded as an overlay inside the video player** on mobile
- **Captions pushed above the mobile controls bar** (and moved below video on mobile portrait)
- Horizontal quest bar on lesson page, with quest bar video gap fixed
- **Rotate-for-fullscreen hint** above the mobile lesson controls
- **Landscape-phone shows the 3-panel desktop layout**; quest log + controls placed in video negative space; dots and outer controls hidden to maximize video area
- Glassmorphism custom dropdowns replace native selects (constellation path, filters)

### Practice Mode (`PracticeModeOverlay.tsx` — 14KB)
- Full-screen practice overlay mode
- Drill view count tracking (`useDrillViewCount.ts`)
- Integrated with all pro controls

### Download Button (`DownloadButton.tsx` — 14KB)
- Integrated download with daily limit tracking
- Progress indicator
- Tier-based access control

### Choreography Back Nav
- Back navigation from a choreography lesson returns to `/courses` rather than the skill tree (choreos are single-lesson so the skill tree isn't meaningful)

### Post Modal (Community Post Full-Screen)
- Respects `safe-area-inset-top` so header buttons clear the mobile URL bar

---

## 25. DJ Booth / Mambo Mixer

### Frontend (`DJBoothMixer.tsx` — 23KB)
- Multi-track audio player with individual stem controls
- Stems: Full Mix, Percussion (Congas/Timbales/Bongo), Piano/Bass, Vocals/Brass
- Per-stem volume sliders and mute buttons
- Track selection carousel
- Cover art display
- Guild Master only — preview mode for non-subscribers

### Backend
- `DJBoothTrack` model with separated stem URLs
- Admin CRUD operations
- Public preview endpoint (metadata only, no stem URLs)

---

## 26. Salsa Rhythm Machine & Tutor

### Salsa Rhythm Machine (`SalsaRhythmMachine.tsx` — 40KB)
- Interactive rhythm visualization tool
- Beat-by-beat breakdown of salsa music structure
- Instrument-specific timing display
- BPM control and playback

### Salsa Rhythm Tutor (`SalsaRhythmTutor.tsx` — 23KB)
- Educational rhythm training tool
- Interactive exercises for learning clave, tumbao, etc.
- Gamified timing challenges

---

## 27. Practice Mode

### Overview
- **PracticeModeOverlay**: Full-screen immersive practice mode for lessons
- **Drill View Count** (`useDrillViewCount.ts`): Tracks how many times a user has practiced a specific drill section
- **Pro Video Controls**: A/B loop, frame-by-frame, speed control
- **UI Sound Effects** (`useUISound.ts` — 12KB): Audio feedback for interactions

---

## 28. Content Courses (Markdown-based)

### Mambo History Course (`mambo_course/`)
- 20 modules (module_1.md through module_20.md)
- Based on Juliet McMains' book "Spinning Mambo into Salsa"
- Each module: Core Thesis, Historical Bullet Points, "Aha" Moment, 3-question MCQ quiz
- Multimedia: Curated YouTube video search queries

### Training Science Course (`training_science_course/`)
- 18 modules covering dance training science
- Cognitive science, motor learning, deliberate practice
- Source content: `TrainingScience.txt` (22KB reference document)

---

## 29. Frontend Architecture & UI System

### App Router Structure
| Route | Page |
|---|---|
| `/` | Landing page (public) |
| `/login` | Login page |
| `/register` | Registration page |
| `/forgot-password` | Password reset request |
| `/reset-password` | Password reset form |
| `/waitlist` | Waitlist signup page |
| `/courses` | Course discovery with filters |
| `/lesson/[id]` | Lesson player with video, notes, quiz |
| `/profile` | User profile with stats, badges, settings |
| `/u/[username]` | Public profile page |
| `/community` | Community feed (Stage & Lab) |
| `/pricing` | Pricing/subscription page |
| `/pro` | Pro features overview |
| `/admin/*` | Admin dashboard |
| `/studio/*` | Studio tools (coaching, DJ booth, roundtable) |
| `/guild-master` | Guild Master premium hub |
| `/instructors` | Instructor-facing page |
| `/auth/callback` | OAuth callback handling |

### UI Component Library
| Component | Description |
|---|---|
| `GlassCard.tsx` | Glassmorphism card with backdrop blur |
| `MagicButton.tsx` | Animated gradient button with glow effects |
| `motion.tsx` | Reusable Framer Motion wrappers (HoverCard, FadeIn, Clickable, StaggerContainer) |
| `MotionWrapper.tsx` | Page transition wrapper |
| `GuildMasterAvatar.tsx` | Animated avatar with guild master badge |
| `GuildMasterBadge.tsx` | Gold guild master badge indicator |
| `ProBadge.tsx` | Pro subscription badge |
| `StageCard.tsx` | Community stage post card |
| `StarryBackground.tsx` | Animated starry night background (9KB) |
| `PalladiumMesh.tsx` | Dark mesh gradient background |

### Navigation (`NavBar.tsx` — 16KB)
- Responsive navigation bar with mobile hamburger menu
- Sticky mobile bottom bar
- Full brand name in the navbar, simplified CTAs
- Logo, course links, community, profile
- Clave wallet display
- Notification bell
- **Language selector** exposed in the mobile header bar (globe icon hidden on mobile, shown on desktop)
- Auth state-aware (login/register vs profile/logout)
- Navigation progress bar (`NavigationProgress.tsx`)
- Compacted on landscape phones to prevent link overlap; spaced on portrait so the logo doesn't crowd nav links

### Responsive Architecture
- **Landscape-phone = desktop layout across the app**: the `md:` breakpoint is landscape-aware (navbar, footer, pricing, lesson viewer all get the desktop treatment when a phone is rotated)
- **Native-app portrait mobile redesign**: video-first hero, sticky trial CTA, centered skill tree, glassmorphism dropdowns replacing native selects, mobile-friendly filter dropdowns on the courses page
- Courses page filters are dropdowns on mobile, with portal-rendered popovers so they aren't clipped
- Comprehensive mobile UI refactor touched every top-level page (admin, community, courses, instructors, profile, lesson, skill tree)

### Layout Stability
- `StarryBackground` scoped to the landing page only (it was previously stacking above mobile content on other routes)
- Framer Motion page-transition wrapper removed; it was stranding mobile pages at `opacity: 0` after soft-nav
- API URL reads use `??` (not `||`) so an explicit empty-string `NEXT_PUBLIC_API_URL` doesn't get replaced

### Context & Hooks
| File | Purpose |
|---|---|
| `AuthContext.tsx` | Authentication state management, token handling |
| `useDrillViewCount.ts` | Track practice drill repetitions |
| `useGemini.ts` | AI chatbot Gemini integration hook |
| `useMuxVideoUpload.ts` | Mux video upload state management (22KB) |
| `useUISound.ts` | Sound effects for UI interactions (12KB) |

### API Client (`lib/api.ts` — 45KB)
- Comprehensive Axios-based API client
- **Request caching**: 30-second GET request cache
- **Token management**: Auto-attach Bearer tokens
- **Error handling**: Centralized error interceptors
- All endpoints typed and organized by domain

---

## 30. Backend Architecture & Services

### Service Layer
| Service | Purpose |
|---|---|
| `auth_service.py` | Password hashing, JWT creation/verification |
| `badge_service.py` (14KB) | Badge evaluation, awarding, retroactive checks |
| `clave_service.py` (14KB) | Virtual currency transactions, balance management |
| `download_service.py` (6KB) | Signed download URLs, daily limit enforcement |
| `email_service.py` (21KB) | All email templates and sending (via Resend) |
| `gamification_service.py` | Streak and XP management |
| `leaderboard_service.py` (6KB) | Scoring and ranking calculations |
| `mux_service.py` (10KB) | Mux API wrapper (uploads, assets, downloads) |
| `notification_service.py` | In-app notification creation |
| `post_service.py` (21KB) | Community post creation, reactions, replies |
| `r2_service.py` | Cloudflare R2 signed URL generation |
| `redis_service.py` (7KB) | Redis caching, OAuth state, rate limiting, feed cache |
| `storage_service.py` | S3/R2 presigned URL generation |
| `streak_service.py` (8KB) | Streak freeze mechanics |
| `stripe_service.py` | Stripe Checkout Session creation |

### Router Layer (18 routers)
| Router | Prefix | Endpoints |
|---|---|---|
| `auth.py` (37KB) | `/api/auth` | Register, login, refresh, logout, OAuth, password reset, waitlist |
| `courses.py` (19KB) | `/api/courses` | Course listing, detail, progress, skill tree |
| `admin_courses.py` (30KB) | `/api/admin` | Full CRUD for courses/levels/lessons |
| `admin.py` (22KB) | `/api/admin` | Student management, settings, announcements |
| `progress.py` | `/api/progress` | Lesson completion tracking |
| `submissions.py` | `/api/submissions` | Boss battle video submissions |
| `mux.py` (46KB) | `/api/mux` | Upload URLs, webhooks, asset management |
| `uploads.py` | `/api/uploads` | R2 presigned URL generation |
| `users.py` (10KB) | `/api/users` | Profile updates, username changes, public profiles |
| `payments.py` (16KB) | `/api/payments` | Stripe checkout, webhooks, subscription mgmt |
| `claves.py` (5KB) | `/api/claves` | Wallet, daily login, video slot status |
| `community.py` (17KB) | `/api/community` | Posts, reactions, replies, feed, leaderboard |
| `badges.py` | `/api/badges` | Badge listing and user badges |
| `notifications.py` | `/api/notifications` | Notification list, mark read, unread count |
| `ai_chat.py` (20KB) | `/api/ai` | AI concierge chat, status, rate limit |
| `premium.py` (33KB) | `/api/premium` | Live calls, coaching, DJ booth, archives, meeting |
| `downloads.py` (13KB) | `/api/downloads` | Secure video downloads |

### Middleware
- **CORS**: Configured origins, credentials, all methods
- **Session**: Starlette SessionMiddleware for OAuth state
- **Security Headers**: X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, Referrer-Policy, Permissions-Policy, HSTS (production)

---

## 31. Database Schema Overview

### Core Tables
```
users ─────────┬── user_profiles (1:1)
               ├── subscriptions (1:1)
               ├── user_progress (1:many)
               ├── boss_submissions (1:many)
               ├── comments (1:many)
               ├── clave_transactions (1:many)
               ├── posts (1:many)
               ├── post_replies (1:many)
               ├── post_reactions (1:many)
               ├── user_badges (1:many)
               ├── user_stats (1:1)
               ├── notifications (1:many)
               └── coaching_submissions (1:many)

worlds ────────┬── levels (1:many)
               └── level_edges (1:many)

levels ────────┬── lessons (1:many)
               ├── level_edges (outgoing/incoming)
               └── mux preview video

lessons ───────┬── user_progress (1:many)
               ├── boss_submissions (1:many)
               └── comments (1:many)

posts ─────────┬── post_replies (1:many, cascade delete)
               └── post_reactions (1:many, cascade delete)

badge_definitions ── user_badges (1:many)

live_calls ──── weekly_archives (optional link)
weekly_meeting_configs (singleton, id=1)
dj_booth_tracks
community_tags
```

### PostgreSQL Features Used
- UUID primary keys (`uuid4`)
- JSONB columns (lesson content, course objectives)
- ARRAY columns (post tags, archive topics)
- Enum columns with values_callable
- Check constraints (post_type, reaction_type)
- Unique constraints (user-lesson, user-badge, post-user reaction)
- Connection pooling with `pool_pre_ping`, `pool_recycle`
- SSL mode required for production (Supabase)

---

## 32. Security Measures

### Authentication
- bcrypt password hashing
- JWT with HS256 algorithm
- httpOnly cookies (SameSite=Lax)
- Refresh token scoped to `/api/auth/refresh` path
- OAuth CSRF state stored in Redis with expiration

### Rate Limiting
- Login: 5/email/5min, 20/IP/5min (via Redis)
- Password reset: 5/email/5min, 10/IP/5min
- AI chat: 20 requests/60 seconds per client

### Input Validation
- Pydantic schemas for all request bodies
- Email format validation
- Password strength requirements (confirmation field)
- Username length/format validation
- Blocked disposable email domains (30+ domains)

### API Security
- SECRET_KEY required in production (raises ValueError if missing)
- Docs/Redoc hidden in production
- Security headers middleware (nosniff, frame deny, XSS, referrer, permissions, HSTS)
- HTTPS enforcement in production
- Anti-timing-attack: dummy hash for invalid login attempts

### Data Protection
- Presigned URLs for client-side uploads (no file data through backend)
- Download URLs expire in 1 hour
- Download daily limit (5/day)
- Community video downloads restricted to owner only
- `SELECT FOR UPDATE` for race-condition prevention on every financial operation: `spend_claves`, `earn_claves`, shop item stock + `max_per_user` checks, shop purchase grants, cosmetic equip, and reaction-refund bookkeeping. Re-locking within a transaction is a no-op, so nested paths (e.g. `award_post_reward` → `earn_claves`, or `purchase` → `spend_claves` → `_apply_grants`) stay correct and avoid ABBA deadlocks.
- `posting_reward_service.award_post_reward` takes the author's profile lock at entry so multi-tab posting can't bypass the 10-minute cooldown or 30/day cap by firing requests before either committed.
- Postgres advisory lock serializes Guild Master seat-cap checks

### Stripe-Specific Security (April beta hardening)
- Checkout `success_url` / `cancel_url` host-matched against the frontend to prevent open-redirect phishing
- `customer.subscription.deleted` filtered on both `sub_id` and `customer_id`
- Trial abuse blocked by Stripe email pre-check
- See Section 13 for the full Stripe hardening list

### IP Handling
- All IP-based rate limiters (auth, bug report, ambassador application, analytics) route through `utils.request.client_ip`, a shared helper that resists `X-Forwarded-For` spoofing. Instead of naïvely taking the leftmost XFF entry — which is client-controlled and trivially cycled to get a fresh rate-limit bucket per request — the helper reads the entry at position `-TRUSTED_PROXY_HOPS` (the value the first trusted proxy added, which no client can forge). `TRUSTED_PROXY_HOPS` is configurable per environment: `0` for local dev (falls back to socket peer, XFF/X-Real-IP ignored), `1` for Railway-only, `2` for Cloudflare + Railway stacks.

---

## 33. Performance Optimizations

| Optimization | Description |
|---|---|
| Parallel API calls | Lesson page fetches all course lessons simultaneously (~200ms vs ~1000ms) |
| Request caching | API client caches GET requests for 30 seconds |
| Memoization | QuestLogSidebar uses `useMemo` for sorting/grouping |
| Connection pooling | SQLAlchemy pool with `pool_pre_ping`, `pool_recycle=300` |
| Denormalized counts | Post reaction/reply counts stored directly on Post model |
| Redis caching | Feed data, OAuth state, rate limit counters |
| Image optimization | Next.js Image component with remote patterns |
| Lazy loading | Code splitting and lazy component loading |
| Debounced auto-save | Lesson editor saves on typing pause |
| GPU acceleration | PalladiumMesh background uses GPU-accelerated transforms |

---

## 34. Scripts & Utilities

### Database & Migration Scripts
| Script | Purpose |
|---|---|
| `create_admin.py` | Create admin user account |
| `create_test_user.py` | Create test user for development |
| `seed_courses.py` / `seed_all_courses.py` | Seed course data |
| `reseed_all_courses.py` | Re-seed all courses (24KB) |
| `populate_mambo_skill_tree.py` | Populate skill tree graph (16KB) |
| `seed_graph_edges.py` | Seed skill tree edge dependencies (17KB) |
| `seed_badges_complete.py` | Seed all badge definitions (11KB) |
| `seed_v4_badges.py` / `seed_full_badges.py` | Badge seeding variants |
| `seed_founder_badge.py` | Seed founder badge |
| `seed_guild_master_badge.py` | Seed guild master badge |
| `seed_subscription_badges.py` | Seed subscription badges |
| `seed_curious_mind.py` | Seed curious mind badge |
| `add_course_type.py` | Migration: add course_type column |
| `migrate_add_lesson_fields.py` | Migration: add lesson fields |
| `migrate_add_mux_fields.py` | Migration: add MUX fields |
| `manual_migration.py` | Generic manual migration runner |

### User Management Scripts
| Script | Purpose |
|---|---|
| `backfill_usernames.py` | Backfill usernames for existing users |
| `inspect_users.py` | Inspect user data |
| `dump_users.py` | Dump user list |
| `fix_admin_password.py` | Fix admin password |
| `fix_test_user.py` | Fix test user data |
| `give_calves_to_admin.py` | Give claves to admin |
| `airdrop_claves.py` | Airdrop claves to users |

### Badge Management Scripts
| Script | Purpose |
|---|---|
| `audit_badges.py` | Audit badge data |
| `check_badges.py` / `check_badge_types.py` | Verify badge configuration |
| `diagnose_badges.py` | Debug badge issues |
| `retroactive_badges.py` | Award badges retroactively (6KB) |
| `fix_badge_images.py` | Fix badge image URLs |
| `fix_badges_dedupe.py` | Deduplicate badges |
| `fix_badges_final.py` | Final badge fixes |
| `normalize_badge_tiers.py` | Normalize tier values |
| `remove_badge_backgrounds.py` / `remove_all_badge_backgrounds.py` | Image processing |
| `copy_new_badges.py` | Copy new badge assets |
| `update_legacy_badges.py` | Update old badge format |

### Operational Scripts
| Script | Purpose |
|---|---|
| `broadcast_waitlist.py` (11KB) | Mass email to waitlist users |
| `update_tags.py` | Update community tags |
| `verify_economy_constants.py` | Verify clave economy settings |
| `verify_founder_logic.py` | Verify founder badge logic |
| `setup_admin_and_verify.py` | Full admin setup with verification (7KB) |
| `create_default_courses.py` | Create default course structure |

---

---

## 35. Global Translation Architecture (i18n)

### Overview
The platform is **fully translated across 14 locales** and shipped to production. i18n uses a **homegrown client provider** (no `next-intl` runtime dependency) so there is no server plugin required and no middleware changes. Locale is stored in a `NEXT_LOCALE` cookie, hydrated into a React context, and resolved via dot-path lookups by a single `useTranslations` hook.

### Supported Languages (14)
| Code | Language | Dir |
|---|---|---|
| `en` | English | LTR |
| `es` | Español | LTR |
| `pt` | Português (Brasil) | LTR |
| `fr` | Français | LTR |
| `de` | Deutsch | LTR |
| `it` | Italiano | LTR |
| `ja` | 日本語 | LTR |
| `ko` | 한국어 | LTR |
| `zh` | 中文（简体）| LTR |
| `ru` | Русский | LTR |
| `pl` | Polski | LTR |
| `nl` | Nederlands | LTR |
| `el` | Ελληνικά | LTR |
| `ar` | العربية | **RTL** |

### File Structure
```
frontend/
├── messages/
│   ├── en.json          ← base
│   ├── es.json, pt.json, fr.json, de.json, it.json
│   ├── ja.json, ko.json, zh.json
│   ├── ru.json, pl.json, nl.json
│   ├── el.json          ← Greek, added alongside the 14-locale rollout
│   └── ar.json          ← RTL
└── i18n/
    ├── config.ts          ← locale list, metadata, Mux BCP-47 map
    ├── useTranslations.ts ← single hook, dot-path resolution
    ├── client.tsx         ← LocaleProvider, useLocale(), useSetLocale()
    └── LocaleContext tree (loads the matching messages/*.json at provider mount)
```

### Translation Namespaces
Current namespaces include: `nav`, `auth`, `landing`, `hero`, `authorityStrip`, `trending`, `howItWorks`, `skillTree`, `releases`, `testimonials`, `pricing`, `faq`, `footer`, `instructors`, `coaching`, `roundtable`, `community`, `profile`, `player`, `common`, `errors`, plus the earlier namespaces (`dashboard`, `courses`, `lesson`, `lab`, `stage`, `claves`, `onboarding`, `chatbot`, `guildMaster`).

The `profile` namespace was extended from ~27 keys to a 137-key superset during the April rollout. Across `instructors`, `coaching`, `roundtable`, `community`, and the extended `profile`, ~361 new keys were translated into all 13 non-English locales.

### Translated Surfaces (live in prod)
- **Landing page**: hero, founder authority strip, trending modules, how it works, skill tree teaser, release schedule, testimonials, FAQ, pricing section, footer, sticky CTA (325 EN keys)
- **Pricing page** (`/pricing`): cards, sonner toasts, downgrade modal
- **Instructors** (`/instructors`): Pavle + Timothé profiles and bios
- **Guild Master**: coaching (`/studio/coaching`), roundtable (`/studio/roundtable`)
- **Community** (`/community`): feed, filters, `CreatePostModal`
- **Profile** (`/profile`): stats, edit flow, `BadgeTrophyCase`
- **Auth flows**: login, register, password reset
- **Navbar**, locale switcher, global error copy

### `useTranslations` Hook
- Single hook at `frontend/i18n/useTranslations.ts`
- Dot-path resolution (e.g. `t("pricing.downgrade.confirm")`)
- Returned `t()` is renamed to `tx` in components that compose countdown maps or array data, to avoid variable shadowing
- Module-level arrays (plans, testimonials, `FEATURES`, level labels) were moved **inside** components so the hook-returned `t()` is in scope when they're built

### Locale Switcher
- Mobile header bar exposes a language picker (the globe icon is hidden on mobile / removed from the mobile dropdown for a cleaner look)
- Desktop keeps the globe-icon dropdown
- Switching writes `NEXT_LOCALE=<code>` cookie, sets `document.lang` + `document.dir` instantly, and remounts the provider so all components re-render in the new locale

### Translation Overflow Hardening
- Long locale strings no longer break layout on the **founder authority strip** or the **courses filter bar** (wrapping / truncation rules applied where string length varies most)

### What's not yet wired
- `MuxPlayerWithCC` (closed-caption VTT track switching on locale change) is designed but awaits content-side VTT uploads per language
- Diego AI is shipped but responds primarily in English; per-locale AI responses are a future extension

---

## 36. Bug Report Widget (Global)

A lightweight in-app feedback widget mounted globally so users can report bugs from **any page** (authenticated or not) with an auto-captured screenshot, additional attached images, and full device/browser metadata. Reports are emailed to `support@themamboguild.com`.

### Goals
- **Zero-friction reporting**: one click → screenshot auto-captured → message + send
- **Work for logged-out visitors** too (landing, pricing, waitlist pages)
- **Zero performance impact** on pages where it's not used (lazy-loaded)
- **Rich debug context** so bugs are triageable without back-and-forth

### UX
- **Trigger**: fixed gold chip button, **top-right of every page** (80px from top to clear the navbar, respects iOS safe-area insets)
- **Modal**: center dialog on desktop, bottom-sheet on mobile (with safe-area bottom padding)
- **Auto-screenshot captured before modal opens** (the modal itself is excluded via `data-bug-report-ignore` attribute so it never appears in the screenshot)
- **Attachment options**: auto screenshot + drag/drop + clipboard paste + file picker (up to 5 images, 2 MB each)
- **Send button disabled while capturing** ("Capturing…" state with spinner) so reports cannot be submitted before the screenshot is ready
- **Success state**: 1.5s confirmation then modal auto-closes

### Screenshot Capture — `modern-screenshot`
Chose **`modern-screenshot@4.6.0`** over `html2canvas` because Tailwind v4's `oklch()` color functions, CSS custom properties, and modern gradients are not parseable by `html2canvas`. `modern-screenshot` uses DOM → SVG `<foreignObject>` serialization which natively handles all modern CSS.

**Loaded lazily from jsDelivr CDN** (zero bundle cost) with three fallback URLs (jsdelivr → unpkg → jsdelivr-latest). Pre-warmed on `requestIdleCallback` so the library + web worker blob are ready the instant the user clicks.

### Performance Optimizations
Capture time reduced from initial **~40 seconds → ~1-2 seconds** via the following techniques:
| Optimization | Gain |
|---|---|
| **`font: false`** — skip `@font-face` embedding | Biggest single speedup (50-80%); uses system font fallback |
| **Web Worker** (`workerUrl` as same-origin `Blob` URL, 4 workers desktop / 2 mobile) | 30-50% faster + main-thread stays responsive |
| **`fetchFn` cross-origin short-circuit** — returns 1×1 placeholder instantly for any non-same-origin resource URL | Eliminated ~30s of failed Mux/R2 image fetch waits |
| **Element filter** — skips `<video>`, `<iframe>`, `<canvas>`, `<object>`, `<embed>`, and cross-origin `<img>`/`<source>` | Prevents CORS-taint blackouts |
| **Pre-warm on idle** via `requestIdleCallback` | Eliminates CDN-load latency on click |
| **Mobile scale 0.75, quality 0.70, 2 workers** | Smaller payloads + lower CPU for older phones |
| **`drawImageInterval: 100`** (default kept) + **2.5s per-resource timeout** | Fail-fast on any missing asset |

### Blob-URL Worker Trick
Browsers block `new Worker(crossOriginUrl)` **even when CORS headers are set** (Workers have stricter origin rules than `<script>`). Fix: `fetch()` the worker script as text → wrap in `Blob` → `URL.createObjectURL()` → pass resulting `blob:` URL to `modern-screenshot`. Falls back gracefully to main-thread rendering if the blob can't be created.

### Device Metadata Collected (Client-Side)
- `navigator.userAgent`
- `navigator.platform`
- `navigator.language`
- `Intl.DateTimeFormat().resolvedOptions().timeZone`
- `window.screen.{width, height}`
- `window.innerWidth × innerHeight` (viewport)
- `window.devicePixelRatio`
- Current `window.location.href`
- Logged-in user ID + name (from `AuthContext`), if available

### Backend Endpoint — `POST /api/support/bug-report`
**Unauthenticated** (intentional — logged-out users must be able to report bugs on landing/pricing pages). Defined in `backend/routers/support.py`.

**Pydantic validation**: `message` (3-5000 chars), `page_url`, `user_agent`, `device` object, optional `reporter_email`/`reporter_name`, `screenshots` (list of base64 data URIs, max 5).

**Flow**:
1. **IP extraction** — respects `X-Forwarded-For` header (Railway/Cloudflare proxy aware)
2. **Rate limit check** via `redis_service.check_rate_limit()` — **5 reports per IP per hour**; fails open if Redis is down; returns HTTP 429 with friendly message if exceeded
3. **Screenshot upload** — validates each data URI with regex + base64 decode, enforces 2 MB hard cap per image, uploads to R2 under `bug-reports/{uuid}.{ext}` via `storage_service.s3_client.put_object`
4. **Email dispatch** via `email_service.send_bug_report_email()` — branded HTML with escaped user content, clickable screenshot thumbnails, device metadata table, client IP, `reply_to` set to reporter's email
5. Returns `{ status: "ok", screenshots_uploaded: N }`

### Security & Abuse Prevention
- **HTML escaping** of all user-provided content in the email template (via `html.escape`)
- **Data URI validation** via regex: only `image/(png|jpeg|jpg|webp)` accepted; base64 strictly validated
- **Hard size caps**: 2 MB decoded per image, 5 images max, 5000 char message limit
- **Redis rate limit**: 5/hour per IP (fixed window), fails open
- **Pydantic field length caps** on every string field
- **`X-Forwarded-For`** handling so one abuser behind a proxy doesn't share a bucket with everyone

### Storage Lifecycle
- Screenshots stored in R2 under `bug-reports/` prefix
- **R2 lifecycle rule**: auto-delete after **30 days** (configured via Cloudflare dashboard, not code)
- Rationale: if a bug hasn't been triaged within 30 days, the screenshot is unlikely to still be useful; keeps storage bounded at effectively zero cost

### Files
**Frontend**:
- `frontend/components/BugReportButton.tsx` — the entire widget (client component, ~380 lines); lazy-loads `modern-screenshot`, handles capture/modal/submit
- `frontend/app/layout.tsx` — mounts `<BugReportButton />` inside `AuthProvider` so it appears on every page and has access to user context
- `frontend/lib/api.ts` — `apiClient.submitBugReport()` method

**Backend**:
- `backend/routers/support.py` — `/bug-report` endpoint, IP extraction, rate limiting, screenshot upload, email dispatch
- `backend/services/email_service.py` — `send_bug_report_email()` with branded HTML template
- `backend/routers/__init__.py` — registers `support_router` under `/support`

### Known Limitations & Accepted Tradeoffs
- **Cross-origin images (Mux thumbnails, etc.) appear as blank areas** in screenshots — intentional, prevents CORS-taint and 30s fetch stalls. Text/layout/colors still render correctly which is sufficient for 90% of UI bugs.
- **System font rendering** in screenshots instead of Playfair/Inter — intentional (`font: false` is the biggest perf win). Acceptable tradeoff for a bug report.
- **Screenshots stored with unguessable UUID public URLs** — security through obscurity. Acceptable for current scale; upgrade to private prefix + signed URLs if/when scaling to EU users for GDPR.
- **No DB record of bug reports** — only live in the support inbox. Acceptable for solo founder / low volume; add a `bug_reports` table when volume or team size warrants it.
- **Library loaded from public CDN** — acceptable for current setup; when the frontend `package-lock.json` `EBADPLATFORM` issue is resolved, should be migrated to a bundled import with Subresource Integrity hash.

### Deployment Notes
- **No env vars required** — uses existing `RESEND_API_KEY`, `AWS_*` (R2), `REDIS_HOST/PORT`
- **No migrations required** — no new DB tables
- Railway auto-deploys backend on push; Vercel auto-deploys frontend
- Redis must be reachable (same as existing auth rate limits)

---

## 37. Posting Rewards — Claves Payouts for Content

Posting rewards close the earning half of the claves loop. Creating content pays out claves, with guardrails designed around *one abuser opening ten tabs* as the threat model rather than sophisticated sybil farming.

### Reward Shape

Implemented in `backend/services/posting_reward_service.py`. Called from `backend/routers/community.py` immediately after a post is created and committed.

| Trigger | Amount | Reason string | Eligibility |
|---|---|---|---|
| Stage post | **+10 🥢** | `post_reward:stage` | must have `mux_asset_id`; `video_duration_seconds` > 0 |
| Lab question | **+3 🥢** | `post_reward:lab` | `body` ≥ 40 chars (prevents `"a?"` farming) |
| Comments / reactions / other | 0 🥢 | — | engagement is free |

### Guardrails (tunables at top of `posting_reward_service.py`)

```python
REWARD_STAGE_POST    = 10
REWARD_LAB_QUESTION  = 3
DAILY_REWARD_CAP     = 30        # across all post_reward:* txns per user per day (UTC)
COOLDOWN_SECONDS     = 10 * 60   # 10 min between reward-earning posts
LAB_BODY_MIN_CHARS   = 40
CLAWBACK_WINDOW_HOURS = 72
REASON_PREFIX        = "post_reward:"
CLAWBACK_PREFIX      = "post_reward_clawback:"
```

- **Daily cap (30 🥢)** — computed by `SUM(amount)` over today's `clave_transactions` rows with `reason LIKE 'post_reward:%'`. If the full reward would exceed the cap, the reward is *trimmed to what's left* (the post that tips you over still gets a partial payout, instead of being blackholed).
- **Cooldown (10 min)** — `MAX(created_at)` query over same-user reward txns. Spamming 3 posts in a minute only rewards the first.
- **Idempotency** — `(user_id, reference_id=post_id, reason LIKE 'post_reward:%')` lookup before award. Republishing the same post or triggering the handler twice cannot double-pay.

### Concurrency Fix (Mar 2026)

The original implementation read `existing rewards today` without a row lock, so two simultaneous post-creates from different tabs both saw the same pre-award ledger state and both got rewarded — bypassing the daily cap by up to N×.

Fixed by taking a `SELECT ... FOR UPDATE` on the author's `user_profiles` row at the top of `award_post_reward`:

```python
profile_lock = (
    db.query(UserProfile)
    .filter(UserProfile.user_id == user_id)
    .with_for_update()
    .first()
)
```

Any concurrent `award_post_reward` or `earn_claves` / `spend_claves` call for the same user now serializes behind this lock. Inside the lock we re-check `_already_rewarded` / `_on_cooldown` / `_sum_today_rewards` against a consistent snapshot.

### Clawback

On soft-delete or moderation rejection, `clawback_post_reward(post_id, db)` runs:

1. Look up the original reward by `reference_id=post_id + reason LIKE 'post_reward:%'`.
2. If the reward is older than `CLAWBACK_WINDOW_HOURS` (72 h), skip — we don't retroactively wipe balances from ancient moderator actions.
3. Idempotency check: if a `post_reward_clawback:*` row already exists for this `reference_id`, no-op.
4. Insert a single negative-amount `ClaveTransaction` (reason `post_reward_clawback:{kind}`) and decrement `user_profiles.current_claves` directly — bypassing `spend_claves()` because the balance is *allowed to go negative* here. Future earnings backfill the debt; this is the simplest way to keep the ledger correct without racing against concurrent spends.

### Integration Points

- `backend/routers/community.py::create_post` — calls `award_post_reward(post.id, db)` after `db.commit()`, wraps in try/except so a reward failure never blocks post creation.
- `backend/routers/community.py::delete_post` — calls `clawback_post_reward` inside the same transaction as the soft-delete.
- `backend/routers/moderation.py` — moderation-reject path calls clawback.

### Explicitly Out of Scope (V1)

- **MOTW-specific post bonus** — collapsed to flat +10 for any stage post to avoid farming-by-category.
- **IP velocity / device fingerprinting** — separate infrastructure; the daily cap + cooldown + clawback handle the realistic abuse surface.
- **Nightly audit jobs** — if the ledger ever drifts from `user_profiles.current_claves`, we'll detect via end-of-day reconciliation. Not wired yet.

### Files

- `backend/services/posting_reward_service.py` — award / clawback logic
- `backend/routers/community.py` — wire-up after create/delete
- `backend/services/clave_service.py` — `earn_claves()` (now locks profile inside, see Section 32)

---

## 38. The Guild Shop

The spending half of the claves loop. A dedicated storefront at `/shop` turns accumulated balances into status goods and utility upgrades. Four tabs: **Tickets**, **Borders**, **Titles**, **Utility**, plus a fifth **Inventory** view for owned items and equip/unequip.

### Catalog Architecture

Single source of truth is `backend/scripts/shop_catalog.py` — a Python list of dicts with every SKU's price, rarity, stock rules, tier gate, and grant. Consumed by migration 021 (initial seed) and by any admin scripts that want to inspect/restore the catalog.

**Tables** (migration 020):

```sql
CREATE TABLE shop_items (
  sku              VARCHAR(64) PRIMARY KEY,
  kind             VARCHAR(20) NOT NULL,        -- 'ticket'|'border'|'title'|'utility'
  name             VARCHAR(120) NOT NULL,
  description      TEXT,
  price_claves     INTEGER NOT NULL CHECK (price_claves >= 0),
  rarity           VARCHAR(20),                 -- 'common'|'rare'|'epic'|'legendary'
  tier_required    VARCHAR(20),                 -- NULL | 'advanced' | 'performer'
  stock_total      INTEGER,                     -- NULL = unlimited
  stock_period     VARCHAR(20),                 -- NULL | 'monthly' | 'lifetime'
  max_per_user     INTEGER,                     -- NULL = unlimited
  grants           JSONB NOT NULL DEFAULT '{}',
  metadata         JSONB NOT NULL DEFAULT '{}',
  is_active        BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order       INTEGER NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE shop_purchases (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sku               VARCHAR(64) NOT NULL REFERENCES shop_items(sku),
  price_paid        INTEGER NOT NULL,
  clave_txn_id      UUID REFERENCES clave_transactions(id),
  status            VARCHAR(20) NOT NULL DEFAULT 'fulfilled',
  fulfillment_id    UUID,                       -- coaching_submissions.id for Golden Ticket
  stock_period_key  VARCHAR(20),                -- '2026-04' for monthly stock tracking
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  refunded_at       TIMESTAMPTZ
);
```

`user_profiles` also gains four columns: `equipped_border_sku`, `equipped_title_sku`, `bonus_video_slots INT DEFAULT 0`, `bonus_question_slots INT DEFAULT 0`.

### Item Kinds

#### Tickets — Golden Ticket (`ticket_golden`)
- **3000 🥢**, `tier_required='advanced'` (Advanced + Performer both qualify via `require_tier_at_least`)
- **Global stock: 10 per calendar month** — enforced via `stock_total=10 + stock_period='monthly'`. Denormalized `stock_period_key='YYYY-MM'` on `shop_purchases` makes the count query an index scan
- **No per-user cap** — any eligible user can buy as many as are left each month
- Purchase creates a `coaching_submissions` row with `source='golden_ticket'`; the existing admin coaching queue surfaces it side-by-side with subscription submissions with a small ticket badge
- The `(user_id, submission_month, submission_year, source)` composite unique constraint lets a Performer stack their free monthly submission *and* a ticket-purchased one in the same month

#### Borders (20 SKUs)
Permanent ownership; one equipped slot on `user_profiles`. Rendered via CSS class registry at `frontend/lib/cosmetics.ts` mapping SKU → `{ className, description }`. Actual CSS (conic-gradients, keyframe animations) lives in `globals.css`. `GuildMasterAvatar.tsx` accepts an `equippedBorderSku` prop and composes its existing PRO/Performer ring logic with the cosmetic border.

- **Common (6)** — 100 🥢 each: Amber Glow, Ivory Etch, Sunset, Mint Ice, Lavender Haze, Charcoal
- **Rare (6)** — 300 🥢 each: Neon Salsa, Copper Flame, Emerald Vein, Royal Blue, Midnight Velvet, Rose Gold
- **Epic (5)** — 800 🥢 each: Aurora, Obsidian Flame, Holographic, Platinum Spark, Ruby Pulse
- **Legendary (3)** — 2000 🥢 each: Disco Inferno, Crown Jewel, Eternal Clave

#### Titles (20 SKUs)
Same permanent / one-equipped model. SKU → `{ label, tone }` (tone controls gradient colors). Rendered under the username via `UsernameWithTitle.tsx`.

- **Common (6)** — 50 🥢 each: Beat Keeper, Floor Regular, On Count, The Learner, Rhythm Cat, Smooth Operator
- **Rare (6)** — 200 🥢 each: Iron Feet, Heart of Timing, The Lyrical, The Metronome, Shine King, Showstopper Apprentice
- **Epic (5)** — 500 🥢 each: Salsa Phenom, Guild Luminary, The Showstopper, Flame Dancer, The Phoenix
- **Legendary (3)** — 1500 🥢 each: Dance Immortal, The Maestro, Living Clave

#### Utility (2 SKUs)
- `utility_video_slots_5` — **1000 🥢**, `max_per_user=5`: +5 permanent stage video slots, stackable up to +25. Grant `{"bonus_video_slots": 5}` increments `user_profiles.bonus_video_slots`. `clave_service.get_video_slot_status` honors the bonus when computing the cap.
- `utility_question_slots_10` — **500 🥢**, `max_per_user=3`: +10 permanent Lab question slots, stackable up to +30. Same mechanism via `bonus_question_slots`.

### Purchase Flow — `POST /api/shop/purchase`

Implemented in `backend/services/shop_service.py::purchase`. Atomic because every guard lives inside one transaction with the item row locked:

1. `SELECT ... FOR UPDATE` on `shop_items WHERE sku=:sku AND is_active=TRUE` — serializes all concurrent buys of the same SKU
2. **Tier check** — `require_tier_at_least(user, item.tier_required)` via `tier_service.py`
3. **Stock check** — if `stock_total` set, `COUNT(*)` fulfilled `shop_purchases` for this SKU at the current `stock_period_key` (or all-time if `stock_period IS NULL`) must be `< stock_total`
4. **Per-user cap** — same-user count must be `< max_per_user` (borders/titles = 1 enforces single-ownership)
5. **Debit** — `clave_service.spend_claves(user_id, item.price_claves, reason=f"shop_purchase:{sku}", db=db)` — itself takes `FOR UPDATE` on the user's profile row; returns 402 if balance insufficient
6. **Grant** — write `shop_purchases` row (with `stock_period_key` if applicable, `clave_txn_id` linked); for Golden Ticket, immediately create a `coaching_submissions` row with `source='golden_ticket'` and set `shop_purchases.fulfillment_id` to the new submission's ID; for utility SKUs, bump the bonus counter on `user_profiles`
7. Commit. Return the purchase row + updated balance.

Concurrency: two users racing for the last Golden Ticket both block on step 1; whoever gets the row lock first passes step 3, the other sees `stock_total` reached and gets `409 OutOfStock`.

### Equip Flow — `POST /api/shop/equip`

1. Ownership check — `shop_purchases WHERE user_id=:me AND sku=:sku AND status='fulfilled'` must exist
2. Kind must match the target slot (border → `equipped_border_sku`; title → `equipped_title_sku`)
3. `UPDATE user_profiles SET equipped_*_sku = :sku WHERE user_id = :me` (row lock to serialize concurrent equips)
4. `POST /api/shop/unequip` with no body clears the slot

The frontend reads `equipped_border_sku` and `equipped_title_sku` from every user payload in feed responses and passes them to `<GuildMasterAvatar>` and `<UsernameWithTitle>` — purchased cosmetics appear on all posts/comments/avatars immediately.

### Frontend

- `frontend/app/shop/page.tsx` — 4-tab shop (Tickets / Borders / Titles / Utility)
- `frontend/app/shop/inventory/page.tsx` — owned items with equip/unequip
- `frontend/components/shop/ShopItemCard.tsx` — rarity-styled card
- `frontend/components/shop/PurchaseModal.tsx` — confirmation + balance preview
- `frontend/components/shop/BorderPreview.tsx`, `TitlePreview.tsx` — live previews
- `frontend/components/ui/UsernameWithTitle.tsx` — renders username + equipped title chip
- `frontend/components/ui/GuildMasterAvatar.tsx` — accepts `equippedBorderSku`, composes cosmetic border with existing ring
- `frontend/lib/cosmetics.ts` — SKU → visual metadata registry (single source of truth for frontend visuals)
- `frontend/lib/api.ts` — `apiClient.shop.listItems()`, `purchase(sku)`, `equip(sku)`, `listInventory()`
- `frontend/components/ClaveWallet.tsx` — dispatches `wallet-updated` after purchase so the NavBar balance flashes immediately

### Migrations

- **020** — create `shop_items`, `shop_purchases`, add `user_profiles` columns, add composite index on `clave_transactions(user_id, reason, created_at DESC)` for the daily-cap query
- **021** — seed all 40+ cosmetic SKUs + 2 utility SKUs + Golden Ticket from `shop_catalog.py` (idempotent: `INSERT ... ON CONFLICT (sku) DO UPDATE`)
- **022** — add `source VARCHAR(20) NOT NULL DEFAULT 'subscription'` to `coaching_submissions`, drop + recreate unique index as `(user_id, submission_month, submission_year, source)`
- **024** — cosmetic backfill / cleanup migration (minor adjustments)

Run order in prod: 020 → 022 → 021 → 024, then push backend + frontend.

### i18n

Keys under `shop.*` across all 14 locales: tab labels, purchase confirmation microcopy, rarity names, out-of-stock + tier-gate error messages. Border and title **names are locale-agnostic** (kept English across all locales) — too many SKUs to translate cleanly, and the names are effectively proper nouns. Descriptions under each are short and localized.

### Economics Sanity

Owning every cosmetic costs ~24,800 🥢. At a 30 🥢/day earning cap + daily login (4-8 🥢 for pro, 1-3 🥢 for free), a heavily active pro user earns ~35 🥢/day → ~2 years to own everything. Intentional — cosmetics are long-tail status goods, not disposable currency sinks.

### Explicitly Out of Scope (V1)

- **Shop rotation / limited-time drops** — schema supports `stock_period='weekly'` but V1 only uses `'monthly'` for the Golden Ticket. Rotating mystery boxes are a future play.
- **Badge-gated cosmetics** — no *"must hold Move Master III to buy border_disco_inferno"* at launch. Pure price + tier gating. Can add later via a `requires_badge_id` column.
- **User-facing refunds** — purchases are final in V1. Backend supports `status='refunded'` for manual admin overrides; no user-visible refund button.
- **Social proof** (*"X users own this"*) — nice-to-have for post-launch, wire in once the shop has traffic worth showing.

---

> **Note**: The Mux pipeline (direct upload → webhook → playback) is live end-to-end and is used in production for both lesson videos and VIP 1-on-1 coaching submissions. Per-language VTT captions are the next content-side workstream (see Section 35).
