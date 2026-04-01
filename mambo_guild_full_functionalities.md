# The Mambo Guild — Complete Codebase Functionality Reference

> **Last Updated**: March 29, 2026  
> **Status**: Lessons not yet uploaded on MUX (planned for next week)

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
| New user starter pack | 15 |
| Daily login (free tier) | 1–3 (RNG) |
| Daily login (pro tier) | 4–8 (RNG) |
| Streak bonus (every 5 days, free) | 10 |
| Streak bonus (every 5 days, pro) | 20 |
| Accepted answer in The Lab | 15 |
| Reaction refund (per reaction, capped at 5/video) | 1 |
| Referral bonus | 50 |
| Subscription bonus (Advanced monthly) | 10 |
| Subscription bonus (Performer monthly) | 20 |

### Spending Claves
| Action | Cost |
|---|---|
| React to a post | 1 |
| Comment on a post | 2 |
| Post a question (The Lab) | 5 |
| Post a video (The Stage) | 15 |
| Streak freeze repair | 10 |
| Buy inventory freeze | 10 |

### Slot Limits
| Resource | Free | Pro |
|---|---|---|
| Video slots | 5 | 20 |
| Question slots | 10 | 50 |

### Anti-Abuse
- **Self-reaction ban**: Users cannot react to their own posts
- **Race condition prevention**: `SELECT FOR UPDATE` on balance operations
- Transaction log: all earnings/spending recorded in `ClaveTransaction` table

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
- One reaction per user per post (unique constraint)
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
| **Full Access (Advanced)** | €29/mo | `price_1SmeXA1a6FlufVwfOLg5SMcc` | Unlimited courses, full community |
| **Performer (Guild Master)** | €49/mo | `price_1SmeZa1a6FlufVwfrJCJrv94` | All Advanced + premium features |

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
| `current_period_end` | Billing period end date |

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
- Displayed to Guild Master users

### 14d. 1-on-1 Video Coaching
- **1 submission per month** per Guild Master user
- Upload dance video via Mux (max 100 seconds)
- Optional "specific question" (140 chars) — "What should I look at?"
- Marketing consent: `allow_social_share` (+50 XP)
- Status flow: `pending` → `in_review` → `completed` / `expired`
- Admin feedback: feedback video URL (Loom/external) + text notes
- **Email notification** sent to student when feedback is ready

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

## 15. AI Sales Concierge ("Diego" / "Tito P")

### Architecture
- **Backend**: Google Gemini 2.0 Flash with Function Calling (Tools)
- **Frontend**: Pill-shaped collapsed chatbot with dark glass UI
- **Persona**: "Diego" — 1920s Havana Head Concierge, charming and sophisticated

### Capabilities
1. **Conversational sales**: Asks 2-3 diagnostic questions about dance experience
2. **Membership recommendation**: `recommend_membership` tool returns structured card data for frontend
3. **Knowledge base search**: `search_knowledge_base` tool (placeholder — future RAG integration)

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
| `type` | `badge_earned`, `reaction_received`, `reply_received`, `answer_accepted` |
| `title` | Notification title |
| `message` | Notification body |
| `reference_type` | `post`, `reply`, `badge` |
| `reference_id` | ID of related entity |
| `is_read` | Read status flag |

### UI Component (`NotificationBell.tsx`)
- Bell icon in navbar with unread count badge
- Dropdown list of recent notifications
- Mark as read functionality

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
| `/admin/settings` | Platform settings |
| `/admin/students` | View enrolled students |
| `/admin/grading` | Boss battle submission review |
| `/admin/coaching` | Coaching submission queue |
| `/admin/live` | Live call scheduling and management |

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

### Landing Page Integration (`SkillTreeTeaser.tsx` — 47KB)
- Live skill tree data from API with course toggle
- Gamification features preview (Track Progress, Earn XP, Unlock Badges)
- Full constellation graph embedded in landing page

---

## 23. Landing Page & Marketing

### Sections (in order)
| Component | Description |
|---|---|
| `NewHero.tsx` | "Join The Guild" with bullet points, certified LXD badge, mobile video |
| `HeroScrollAnimation.tsx` | Progressive loading hero animation with "Enter" experience |
| `HeroOverlayEffects.tsx` | Visual effects and overlays |
| `TrendingModulesSection.tsx` | Auto-spinning carousel of popular modules with hover previews |
| `ValuePropsSection.tsx` | "Stop Stepping on Toes", "Unlock Fluidity", "Steal the Spotlight" |
| `MaestroSection.tsx` | "Meet the Maestro" cinematic video introduction |
| `CourseExplorerSection.tsx` | Netflix-style horizontal scrolling carousels |
| `SkillTreeTeaser.tsx` | Interactive skill tree with live data |
| `ConstellationSection.tsx` | Constellation graph section wrapper |
| `HowItWorksSection.tsx` | Step-by-step process explanation |
| `TestimonialsSection.tsx` | Social proof / testimonials |
| `LandingPricingSection.tsx` | Pricing cards with tier comparison |
| `Mambobot.tsx` | AI concierge chatbot interface |
| `LevelSelectionModal.tsx` | Dance level selection during signup |

### Design Elements
- **PalladiumMesh background**: Dark monochrome mesh gradient with drifting circles
- **Cinematic entrance**: Progressive loading animation
- **Gold dust particles**: Mobile hero effect
- **Glass/neon effects**: Premium dark theme aesthetics

---

## 24. Pro Video Controls (Lesson Player)

### Components
| Component | Description |
|---|---|
| `ABLooper.tsx` | A/B loop tool — set start/end points to drill a section |
| `FrameByFrame.tsx` | Frame-by-frame stepping for movement analysis |
| `SpeedControl.tsx` | Variable playback speed (0.25x to 2x) |
| `UpgradePrompt.tsx` | Prompt for free users to upgrade for pro controls |

### Practice Mode (`PracticeModeOverlay.tsx` — 14KB)
- Full-screen practice overlay mode
- Drill view count tracking (`useDrillViewCount.ts`)
- Integrated with all pro controls

### Download Button (`DownloadButton.tsx` — 14KB)
- Integrated download with daily limit tracking
- Progress indicator
- Tier-based access control

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
- Logo, course links, community, profile
- Clave wallet display
- Notification bell
- Auth state-aware (login/register vs profile/logout)
- Navigation progress bar (`NavigationProgress.tsx`)

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
- SELECT FOR UPDATE for race condition prevention on financial operations

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

> **Note**: The lessons/videos are not yet uploaded to MUX. The full MUX pipeline (upload → webhook → playback) is fully built and tested — it awaits content upload next week.
