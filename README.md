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
- **Lesson Player**: Immersive lesson viewing with video, markdown content, and quizzes
- **Progress Tracking**: Visual progress indicators and completion tracking
- **Success Animations**: Engaging completion notifications with audio feedback
- **Responsive Design**: Mobile-friendly interface with dark theme
- **Smooth Animations**: Page transitions, hover effects, and interactive elements powered by Framer Motion
- **Premium UI**: Glass/neon effects, gradient buttons, and polished typography

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
│   │   └── pricing/         # Pricing/subscription page
│   ├── components/          # React components
│   │   ├── common/         # Reusable components (ImageUploader)
│   │   ├── MuxUploader.tsx # Video upload component
│   │   ├── MuxVideoPlayer.tsx # Video player component
│   │   ├── AuthPromptModal.tsx # Login/subscribe prompts
│   │   └── SuccessNotification.tsx # Completion animations
│   └── lib/                # Utilities and API client
├── backend/                 # FastAPI backend application
│   ├── routers/            # API route handlers
│   │   ├── auth.py         # Authentication endpoints
│   │   ├── courses.py      # Course/lesson endpoints
│   │   ├── admin_courses.py # Admin course management
│   │   ├── users.py        # User profile endpoints
│   │   ├── uploads.py      # Image upload presigned URLs
│   │   └── mux.py          # Mux webhook and upload endpoints
│   ├── models/             # SQLAlchemy database models
│   ├── schemas/            # Pydantic validation schemas
│   ├── services/           # Business logic services
│   │   ├── storage_service.py # R2/S3 storage service
│   │   └── mux_service.py  # Mux API service
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
