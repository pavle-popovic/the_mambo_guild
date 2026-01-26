# The Mambo Inn - Learning Management System

A comprehensive, gamified learning management system built with Next.js, FastAPI, PostgreSQL, and Docker. Features video streaming with Mux, image uploads with Cloudflare R2, and a modern, engaging user interface.

## 🚀 Features

### Core Functionality
- **User Authentication & Authorization**: JWT-based auth with extended sessions (1 week)
  - Email/password registration with password confirmation
  - Google OAuth login
  - Secure password reset flow via email
  - OAuth account linking for existing users
- **Gamification**: XP system, levels, streaks, and leaderboards
- **Course Management**: Hierarchical course structure (Weeks → Days → Lessons)
  - **Content Types**: Courses, Choreographies, and Topics with distinct tagging
  - Search and filter by content type and difficulty level
- **Video Streaming**: Mux integration for high-quality video upload and playback
- **Rich Content**: Markdown support for lesson notes, quizzes, and interactive content
- **Image Management**: Direct upload to Cloudflare R2 for avatars, course thumbnails, and lesson thumbnails

### Admin Dashboard
- **Course Builder**: Drag-and-drop curriculum organization with Week/Day/Lesson hierarchy
- **Lesson Editor**: Rich content editor with auto-save, video upload, and markdown support
- **Student Management**: View all enrolled students with real-time data
- **Settings**: Platform configuration and management

### User Experience
- **Course Discovery**: Browse courses with progress tracking and smooth animations
  - **Search**: Find courses by name with aesthetic search bar
  - **Type Filters**: Filter by Courses, Choreographies, or Topics
  - **Difficulty Filters**: Filter by Beginner, Intermediate, or Advanced
- **Community Platform**: The Stage & The Lab dual-mode community
  - **The Stage**: Video posts for sharing progress and getting hype
  - **The Lab**: Q&A posts for technical questions and solutions
  - **Tag System**: Categorize posts with community tags
  - **Reactions**: Fire, Ruler, and Clap reactions
  - **Video Upload**: Direct Mux upload for Stage posts
- **Clave Economy**: Gamified currency system
  - **Daily Bonuses**: Login rewards with streak bonuses
  - **Wallet Modal**: Transaction history and balance display
  - **Cost System**: Reactions (1), Comments (2), Questions (5), Videos (15)
- **Lesson Player**: Immersive lesson viewing with video, markdown content, and quizzes
- **Progress Tracking**: Visual progress indicators and completion tracking
- **Success Animations**: Engaging completion notifications with audio feedback
- **Responsive Design**: Mobile-friendly interface with dark theme
- **Smooth Animations**: Page transitions, hover effects, and interactive elements powered by Framer Motion
- **Premium UI**: Glass/neon effects, gradient buttons, and polished typography
- **PalladiumMesh Background**: Subtle dark mesh gradient for vintage aesthetic

### Technical Features
- **Real-time Updates**: Auto-save functionality, live status updates
- **Direct Uploads**: Presigned URLs for secure, direct client-side uploads
- **Webhook Integration**: Mux webhooks for automatic video processing updates
- **Image Optimization**: Next.js Image component with remote pattern support
- **State Management**: Optimized React state management with minimal re-renders

## 🛠️ Tech Stack

### Frontend
- **Next.js 15.1.5**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS 4**: Utility-first styling with custom dark theme
- **Framer Motion 12.23.26**: Smooth animations and page transitions
- **React Icons**: Icon library
- **react-markdown**: Markdown rendering with GFM support
- **@mux/mux-player-react**: Official Mux video player
- **@mux/mux-uploader-react**: Official Mux video uploader
- **Axios**: HTTP client for API calls
- **clsx & tailwind-merge**: Utility functions for className management

### Backend
- **FastAPI 0.104.1**: Modern Python web framework
- **SQLAlchemy 2.0.23**: ORM for database operations
- **PostgreSQL**: Primary database with JSONB support
- **Redis 5.0.1**: Caching and session management
- **JWT**: Authentication tokens
- **mux-python 5.1.0**: Mux API integration
- **boto3 1.34.0**: AWS SDK for Cloudflare R2 (S3-compatible)

### Infrastructure
- **Docker & Docker Compose**: Containerized development and deployment
- **Cloudflare R2**: Object storage for images
- **Mux**: Video hosting and streaming

## 📁 Project Structure

```
salsa_lab_v2/
├── frontend/                 # Next.js frontend application
│   ├── app/                  # Next.js App Router pages
│   │   ├── admin/           # Admin dashboard pages
│   │   ├── courses/         # Course listing and detail pages
│   │   ├── lesson/          # Lesson viewing page
│   │   ├── profile/         # User profile page
│   │   ├── pricing/         # Pricing/subscription page
│   │   └── community/       # Community feed (Stage & Lab)
│   ├── components/          # React components
│   │   ├── common/         # Reusable components (ImageUploader)
│   │   ├── ui/            # UI primitives (GlassCard, MagicButton, motion)
│   │   ├── MuxUploader.tsx # Video upload component
│   │   ├── MuxVideoPlayer.tsx # Video player component
│   │   ├── AuthPromptModal.tsx # Login/subscribe prompts
│   │   ├── SuccessNotification.tsx # Completion animations
│   │   ├── PalladiumMesh.tsx # Dark mesh gradient background
│   │   ├── ClaveWallet.tsx # Clave balance display
│   │   ├── WalletModal.tsx # Wallet details modal
│   │   ├── CreatePostModal.tsx # Community post creation
│   │   ├── BadgeTrophyCase.tsx # Badge display component
│   │   └── ReferralSection.tsx # Referral program UI
│   └── lib/                # Utilities and API client
├── backend/                 # FastAPI backend application
│   ├── routers/            # API route handlers
│   │   ├── auth.py         # Authentication endpoints
│   │   ├── courses.py      # Course/lesson endpoints
│   │   ├── admin_courses.py # Admin course management
│   │   ├── users.py        # User profile endpoints
│   │   ├── uploads.py      # Image upload presigned URLs
│   │   ├── mux.py          # Mux webhook and upload endpoints
│   │   ├── claves.py       # Clave economy endpoints
│   │   ├── community.py    # Community posts, reactions, replies
│   │   └── badges.py       # Badge system endpoints
│   ├── models/             # SQLAlchemy database models
│   ├── schemas/            # Pydantic validation schemas
│   ├── services/           # Business logic services
│   │   ├── storage_service.py # R2/S3 storage service
│   │   ├── mux_service.py  # Mux API service
│   │   ├── clave_service.py # Clave economy logic
│   │   ├── post_service.py # Community post logic
│   │   ├── badge_service.py # Badge system logic
│   │   └── redis_service.py # Redis caching (extended for clave/feed cache)
│   ├── scripts/            # Utility scripts
│   │   ├── create_admin.py # Create admin user
│   │   ├── seed_courses.py # Seed course data
│   │   └── migrate_*.py    # Database migrations
│   ├── tests/              # Test suite
│   │   ├── conftest.py     # Pytest configuration
│   │   └── test_*.py       # Test files
│   └── requirements.txt    # Python dependencies
└── docker-compose.yml      # Docker orchestration

```

## 🚀 Getting Started

### Prerequisites
- Docker and Docker Compose
- Git

### Environment Variables

Copy `env.example` to `.env` and fill in the required values:

```bash
# Database
DATABASE_URL=postgresql://user:password@db:5432/mambo_db

# JWT
SECRET_KEY=your-secret-key
JWT_ALGORITHM=HS256
JWT_EXPIRATION_DAYS=7

# Mux
MUX_TOKEN_ID=your-mux-token-id
MUX_TOKEN_SECRET=your-mux-token-secret
MUX_WEBHOOK_SECRET=your-webhook-secret

# Cloudflare R2 (S3-compatible)
AWS_ACCESS_KEY_ID=your-r2-access-key
AWS_SECRET_ACCESS_KEY=your-r2-secret-key
AWS_ENDPOINT_URL=https://your-account-id.r2.cloudflarestorage.com
AWS_BUCKET_NAME=your-bucket-name
R2_PUBLIC_DOMAIN=https://pub-xyz.r2.dev

# Redis
REDIS_URL=redis://redis:6379

# OAuth Configuration (Google)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Email Service Configuration (Resend)
RESEND_API_KEY=your-resend-api-key
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:8000

# OAuthlib for local development (set to 1 to allow HTTP for OAuth)
OAUTHLIB_INSECURE_TRANSPORT=1

# API
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd salsa_lab_v2
```

2. Set up environment variables:
```bash
cp env.example .env
# Edit .env with your values
```

3. Start the application:
```bash
docker-compose up -d
```

4. Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

### Initial Setup

1. **Database Migration**: The database schema is automatically created on first run.

2. **Mux Webhook Configuration**:
   - Go to your Mux dashboard → Settings → Webhooks
   - Add webhook URL: `https://your-domain.com/api/mux/webhook`
   - Set webhook secret to match `MUX_WEBHOOK_SECRET` in `.env`

3. **Cloudflare R2 CORS Configuration**:
   - Configure CORS on your R2 bucket to allow direct browser uploads
   - See `R2_CORS_SETUP.md` for detailed instructions

## 📚 Key Features Documentation

### Course Builder
The admin course builder allows creating courses with a hierarchical structure:
- **Content Types**: Tag content as Course (📚), Choreography (💃), or Topic (💡)
- **Weeks**: Top-level organization
- **Days**: Sub-organization within weeks
- **Lessons**: Individual learning units within days

Lessons support:
- Rich markdown content
- Video uploads via Mux
- Interactive quizzes
- Thumbnail images
- XP values and boss battles

### Video Upload Pipeline
1. Admin uploads video in lesson editor
2. Frontend requests presigned upload URL from backend
3. Video uploads directly to Mux via `@mux/mux-uploader-react`
4. Mux processes video and sends webhook to backend
5. Backend updates lesson with `mux_playback_id` and `mux_asset_id`
6. Frontend polls for completion and displays video when ready

### Image Upload Pipeline
1. User/admin selects image (avatar, course thumbnail, lesson thumbnail)
2. Frontend requests presigned URL from `/api/uploads/presigned-url`
3. Image uploads directly to Cloudflare R2 via PUT request
4. Backend returns public URL
5. Frontend updates UI immediately without page refresh

### Authentication Flow
- **Email/Password**: Traditional registration with password confirmation validation
- **Google OAuth**: One-click login with Google account
  - Automatic account creation for new users
  - Account linking for existing email users
  - Profile picture sync from Google
- **Password Reset**: Secure email-based password recovery
  - Time-limited reset tokens
  - Email delivery via Resend
- **Session Management**:
  - JWT tokens stored in localStorage
  - Extended session duration (7 days)
  - Automatic token refresh
  - Protected routes with auth checks
  - Role-based access control (admin/user)

## 🔧 Development

### Running in Development Mode

```bash
# Start all services
docker-compose up

# View logs
docker-compose logs -f frontend
docker-compose logs -f backend

# Rebuild after dependency changes
docker-compose build frontend
docker-compose build backend
```

### Adding New Dependencies

**Frontend:**
```bash
docker-compose exec frontend npm install <package>
```

**Backend:**
```bash
# Add to requirements.txt, then:
docker-compose build backend
docker-compose up -d backend
```

## 🧪 Testing

The application includes comprehensive error handling and validation:
- Frontend form validation
- Backend Pydantic schema validation
- Database constraint validation
- API error responses

## 🚀 Performance Optimizations

- **Parallel API Calls**: Lesson page fetches all course lessons simultaneously instead of sequentially (reduces load time from ~1000ms to ~200ms for 5 courses)
- **Request Caching**: API client caches GET requests for 30 seconds to reduce redundant API calls when navigating between pages
- **Memoization**: QuestLogSidebar uses `useMemo` to cache sorting and grouping calculations, preventing unnecessary recalculations on every render
- Next.js Image optimization
- Code splitting
- Lazy loading
- Debounced auto-save
- Efficient state updates
- Minimal re-renders

## 📝 Recent Updates

### Latest Features
- ✅ **Gamertag & Public Profile v1.0** (January 2026)
  - **Gamertag Identity**: Transitioned from Real Names to unique Usernames (Gamertags) for privacy and "Video Game" vibe
  - **Public Profiles**: New `/u/[username]` pages to share stats, badges, and streaks with the world
  - **Username Editing**: Built-in tool for users to change their handle (3-30 chars, specific validation)
  - **Backend Support**: New public endpoints and case-insensitive uniqueness checks
- ✅ **Gamification Badges System** (January 2026)
  - **32 Unique Badges**: Custom 3D-rendered badges for Community, Lab, and Streak achievements
  - **Trophy Case**: Visual display of earned/locked badges on User Profile
  - **Database Seed**: Automated seed script for badge definitions
  - **Categories**:
    - **Firestarter**: Receiving "Fire" reactions (Bronze/Silver/Gold/Diamond)
    - **The Professor**: Solving questions in The Lab
    - **Center Stage**: Posting video homework
    - **Unstoppable**: Maintenance of daily login streaks
- ✅ **Conversion Optimization & Visual Overhaul** (January 2026)
  - **Cinematic Entrance**: Progressive loading hero animation with "Enter" experience
  - **"Meet the Maestro"**: Cinematic video introduction section
  - **"Levels" System**: Value proposition cards with "Stop Stepping on Toes", "Unlock Fluidity", "Steal the Spotlight"
  - **Course Explorer**: Netflix-style horizontal scrolling carousels for "Trending Now" and "Start from Scratch"
  - **Pricing Refinement**: Renamed tiers (Guest List, Full Access, Performer) with visual emphasis on "Full Access"
  - **Mambobot 2.0**: Complete Art Deco/Steampunk aesthetic overhaul with brass/amber UI and functional AI chat
  - **Visual Polish**: Font legibility fixes, consistent spacing, and refined animations
- ✅ **PalladiumMesh Background** (January 2026)
  - Dark monochrome mesh gradient background component
  - Subtle drifting blurred circles (90% black, 10% mesh elements)
  - Global background with Framer Motion animations
  - Performance optimized with GPU acceleration
- ✅ **Community Features v4.0** (January 2026)
  - **Clave Economy**: Currency system with wallet, transactions, and daily bonuses
  - **The Stage & The Lab**: Dual-mode community feed (video posts vs Q&A)
  - **Create Post Modal**: Full-featured post creation with video upload, tags, and feedback types
  - **Badge Trophy Case**: Profile page badge display with earned/locked states
  - **Referral System**: Referral link generation and tracking (UI ready)
  - **Video Slot Management**: Base (5 slots) and Pro (20 slots) limits
  - **Post Reactions**: Fire, Ruler, and Clap reactions with clave costs
  - **Solution Marking**: Lab Q&A with accepted answer awards
- ✅ **Community Features v5.0** (January 2026)
  - **Restricted Access**: "Teaser" view for non-pro users on Community page
  - **Teaser UI**: Premium marketing component with "Join/Upgrade" CTAs
  - **Clave Economy Overhaul**:
    - **Subscription Bonuses**: Automatic monthly rewards (Advanced: +10, Performer: +20)
    - **Engagement Rewards**: Enhanced Daily Login (Base: 2-5, Pro: 5-10) and Streak bonuses
    - **Community Rewards**: "Accepted Answer" (+10) and reaction refunds
    - **Rebalancing**: Removed course completion clave rewards to focus on community engagement
  - **Rules**: Self-reaction ban implemented for fair play
- ✅ **Content Type System** (January 2026)
  - Three distinct content types: Courses (📚), Choreographies (💃), and Topics (💡)
  - Content type selector in admin course builder
  - Type-specific badges on course cards with color coding
  - Search bar with aesthetic design and warm amber glow
  - Type filters on courses page with count badges
  - Full database support with `course_type` column
- ✅ **Codebase Cleanup & Reorganization** (January 2026)
  - Backend scripts moved to `backend/scripts/` directory
  - Tests moved to `backend/tests/` directory with pytest configuration
  - Deleted dead code (node_modules, package.json from Python backend)
  - Security hardening: SECRET_KEY validation in production
  - Performance optimization: Fixed N+1 queries in courses API
- ✅ **Post Deletion & Cleanup** (January 2026)
  - **Mux Integration**: Automated video asset deletion when posts are removed
  - **Cascade Deletion**: Fixed database constraints to properly remove replies with posts
  - **Admin Powers**: Global delete/edit permissions for admin users
  - **Ghost Post Fix**: Improved state management to prevent UI sync issues after deletion
- ✅ **Course Completion System**: Complete course celebration and tracking
  - Beautiful course completion modal with congratulations message and trophy icon
  - Automatic detection when all lessons in a course are completed
  - Course marked as completed when all lessons are done
  - Direct link back to courses page from completion modal
  - "Complete" badge displayed on course cards when progress reaches 100%
- ✅ **Progress Bar Improvements**: Fixed calculation and visual display
  - Green gradient progress bar in quest sidebar (emerald-500 to emerald-600)
  - Handles zero lessons case gracefully
  - Progress clamped to 0-100% range
  - Accurate progress tracking using worldProgress prop
  - Visual progress bar now properly displays filled portion
- ✅ **Quest Bar Enhancements**: Improved user experience
  - Auto-scrolls to current lesson on page load and after completion
  - Current lesson positioned at top of quest bar
  - Smooth scrolling with retry logic for reliability
- ✅ **Course Preview Videos**: Upload preview videos for courses that play on hover
  - Admin can upload preview videos via course builder
  - Smooth hover preview with automatic playback
  - Seamless transitions between thumbnail and video
  - Full Mux integration with asset management
  - Delete functionality with Mux sync
- ✅ **Enhanced Course Cards**: Improved hover experience
  - Smooth fade transitions between thumbnail and preview video
  - Video restarts on each hover for consistent experience
  - Hidden controls for clean preview playback
  - Error handling with graceful fallback to thumbnails
- ✅ **Stripe Payment Integration**: Complete payment system
  - Checkout session creation with specific price IDs
  - Webhook handling for subscription activation
  - Tier-based access control (Rookie/Advanced/Performer)
  - Pricing page with Euro currency support
- ✅ **Enhanced Authentication System**: Google OAuth login, password reset flow, and password confirmation validation
- ✅ **OAuth Integration**: Seamless Google sign-in with automatic account creation and profile sync
- ✅ **Password Reset**: Secure email-based password recovery with time-limited tokens
- ✅ **Performance Optimizations**: Parallel API calls, request caching, and memoization for faster load times
- ✅ **Premium UI Transformation**: Complete visual overhaul with Framer Motion animations
- ✅ **Motion System**: Reusable animation components (HoverCard, FadeIn, Clickable, StaggerContainer)
- ✅ **Page Transitions**: Smooth fade transitions between pages with hydration-safe implementation
- ✅ **Gamified Interactivity**: Glass/neon button effects, hover animations, and interactive cards
- ✅ **Enhanced Typography**: Editorial-style headings with improved spacing and readability
- ✅ **QuestLogSidebar Enhancement**: Week/Day hierarchical organization matching course builder
- ✅ **Lesson Ordering**: Consistent ordering across course builder, lesson pages, and navigation (Week → Day → Order Index)
- ✅ **Hydration Error Fixes**: Server-side rendering compatibility with client-side animations
- ✅ **Profile picture upload** with hover overlay
- ✅ **Course and lesson thumbnail management**
- ✅ **Beautiful auth/subscribe prompt modals**
- ✅ **"Become A Member" messaging** for locked courses
- ✅ **Auto-save in lesson editor**
- ✅ **Success animations** with audio feedback
- ✅ **Extended session duration** (1 week)
- ✅ **Full Mux integration** with official SDKs
- ✅ **Cloudflare R2 image upload pipeline**
- ✅ **Hierarchical curriculum builder** (Week/Day/Lesson)
- ✅ **Background music control** (disabled on lesson/admin pages)

## 🤝 Contributing

This is a private project. For questions or issues, please contact the development team.

## 📄 License

Proprietary - All rights reserved
