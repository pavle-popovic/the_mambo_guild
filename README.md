# The Mambo Inn - LMS Platform

A complete Learning Management System (LMS) platform for dance instruction with gamification features.

## 🎯 Overview

The Mambo Inn is a full-stack LMS platform designed for structured dance learning. It features:
- **Gamification**: XP system, levels, streaks, and achievements
- **Course Structure**: Worlds → Levels → Lessons hierarchy
- **Progress Tracking**: Lock/unlock system for sequential learning
- **Boss Battles**: Video submission and instructor feedback
- **Admin Dashboard**: Course management and submission grading

## 🏗️ Architecture

### Tech Stack

**Frontend:**
- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- React Context for state management
- Axios for API calls
- @mux/mux-player-react for video playback
- react-markdown for Markdown rendering

**Backend:**
- FastAPI (Python)
- SQLAlchemy (PostgreSQL)
- Redis (Caching & Leaderboards)
- JWT Authentication (1-week token expiration)
- Pydantic for validation
- Mux Python SDK for video processing
- Webhook support for Mux events

**Infrastructure:**
- Docker & Docker Compose (Recommended)
- PostgreSQL Database
- Redis Cache
- Mux Video API (Video upload, processing, and streaming)

## 📁 Project Structure

```
.
├── backend/              # FastAPI backend
│   ├── models/          # SQLAlchemy models
│   ├── schemas/         # Pydantic schemas
│   ├── routers/         # API route handlers
│   ├── services/        # Business logic
│   └── main.py         # FastAPI app entry point
├── frontend/            # Next.js frontend
│   ├── app/            # Next.js pages (App Router)
│   ├── components/     # React components
│   ├── contexts/       # React Context providers
│   └── lib/            # Utilities and API client
├── docker-compose.yml   # Docker orchestration (all services)
├── backend/
│   └── Dockerfile      # Backend container configuration
├── frontend/
│   └── Dockerfile      # Frontend container configuration
├── env.example         # Environment variables template
├── DOCKER_SETUP.md     # Docker setup guide
└── README.md           # This file
```

## 🚀 Quick Start

### Prerequisites

- **Docker & Docker Compose** (Recommended) - Everything runs in containers
- OR Node.js 18+ and Python 3.11+ for manual setup

### Option 1: Docker (Recommended) ⭐

The easiest way to run the entire application stack:

```bash
# 1. Copy environment file
cp env.example .env

# 2. Start all services (database, backend, frontend)
docker-compose up -d

# 3. Initialize database tables
docker-compose exec backend python database.py

# 4. Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

**That's it!** All services are now running in Docker containers with proper networking.

#### Docker Commands

```bash
# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Restart a specific service
docker-compose restart backend

# Execute commands in containers
docker-compose exec backend python create_admin.py
docker-compose exec backend sh  # Shell access
```

See [DOCKER_SETUP.md](./DOCKER_SETUP.md) for detailed Docker documentation.

### Option 2: Manual Setup (Development)

If you prefer to run services manually outside Docker:

#### 1. Start Database & Redis

```bash
docker-compose up -d postgres redis
```

#### 2. Setup Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

Backend will run on `http://localhost:8000`

#### 3. Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend will run on `http://localhost:3000`

## 📚 API Documentation

Once the backend is running, visit:
- API Docs: `http://localhost:8000/docs`
- Alternative Docs: `http://localhost:8000/redoc`

## 🧪 Testing

### Backend Tests

**With Docker:**
```bash
docker-compose exec backend python test_backend.py
docker-compose exec backend python test_backend_comprehensive.py
docker-compose exec backend python test_all_apis.py
```

**Manual Setup:**
```bash
cd backend
python test_backend.py              # Unit tests
python test_backend_comprehensive.py # API integration tests
python test_all_apis.py             # Full API test suite
```

### Frontend Tests

**With Docker:**
```bash
docker-compose exec frontend npm run build
```

**Manual Setup:**
```bash
cd frontend
npm run build  # Build test
node test_setup.js  # Setup verification
```

## 📝 Features

### User Features
- ✅ User Registration & Login (JWT with 1-week expiration)
- ✅ Course Browsing (Public)
- ✅ Lesson Progression with Week/Day sorting
- ✅ XP & Level System
- ✅ Streak Tracking
- ✅ Boss Battle Submissions
- ✅ Profile Dashboard
- ✅ Rich Content Lessons (Markdown, Videos, Quizzes)
- ✅ Video Playback via Mux (HLS streaming)

### Admin Features
- ✅ Admin Dashboard
- ✅ Course Builder with Drag-and-Drop UI
- ✅ Lesson Editor with Auto-Save (Real-time sync)
- ✅ Video Upload & Management (Mux Integration)
- ✅ Rich Content Creation (Markdown, Images, Quizzes)
- ✅ Submission Grading
- ✅ Student Management
- ✅ Settings Page

## 🔐 Authentication

The platform uses JWT (JSON Web Tokens) for authentication. Tokens are stored in localStorage on the frontend and sent with each API request.

## 📊 Database Schema

### Key Models
- **User**: Authentication and basic info
- **UserProfile**: XP, level, streak, avatar
- **World (Course)**: Course container
- **Level**: Course sub-section
- **Lesson**: Individual learning unit with rich content support
  - `week_number`, `day_number`: For sorting and organization
  - `content_json`: JSONB field for rich content (notes, quiz)
  - `mux_playback_id`, `mux_asset_id`: Video integration
- **UserProgress**: Lesson completion tracking
- **BossSubmission**: Video submission for boss battles
- **Subscription**: User subscription tiers

## 🎮 Gamification

- **XP System**: Earn XP by completing lessons
- **Level Formula**: `Level = floor(sqrt(XP / 100))`
- **Streak System**: Daily login streaks
- **Lock System**: Sequential lesson unlocking
- **Quest Log**: Sidebar tracking of progress and upcoming lessons

## 🎥 Video Features (Mux Integration)

The platform uses **Mux** for professional video hosting and streaming:

- **Video Upload**: Direct upload to Mux from admin lesson editor
- **Auto-Processing**: Videos are automatically transcoded and optimized
- **HLS Streaming**: Adaptive bitrate streaming for optimal playback
- **Status Tracking**: Real-time upload and processing status
- **Webhook Integration**: Automatic lesson updates when videos are ready
- **Video Management**: Delete videos with automatic cleanup

### Mux Setup

1. Get your Mux credentials from https://dashboard.mux.com
2. Add to `.env`:
   ```
   MUX_TOKEN_ID=your_token_id
   MUX_TOKEN_SECRET=your_token_secret
   MUX_WEBHOOK_SECRET=your_webhook_secret
   ```
3. Configure webhook in Mux dashboard pointing to: `https://your-domain.com/api/mux/webhook`
4. Webhook verifies signatures automatically for security

See `env.example` for all Mux-related environment variables.

## 🛠️ Development

### Environment Variables

#### Docker Setup (Recommended)

Create a `.env` file in the project root (copy from `env.example`):

```bash
cp env.example .env
```

The `.env` file supports all services. Key variables:
- `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` - Database credentials
- `SECRET_KEY` - JWT secret (change for production!)
- `JWT_EXPIRATION_DAYS=7` - JWT token expiration (default: 7 days)
- `REDIS_HOST`, `REDIS_PORT` - Redis configuration
- `NEXT_PUBLIC_API_URL` - Frontend API endpoint
- `CORS_ORIGINS` - Allowed CORS origins
- `MUX_TOKEN_ID`, `MUX_TOKEN_SECRET` - Mux API credentials
- `MUX_WEBHOOK_SECRET` - Mux webhook signature verification

**Note**: When using Docker, `DATABASE_URL` is automatically configured to use the `postgres` service name.

#### Manual Setup

**Backend** (`backend/.env`):
```
DATABASE_URL=postgresql://admin:admin@localhost:5432/themamboinn
SECRET_KEY=your-secret-key-here
REDIS_HOST=localhost
REDIS_PORT=6379
```

**Frontend** (`frontend/.env.local`):
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Docker vs Manual Setup

| Feature | Docker | Manual |
|---------|--------|--------|
| **Setup Time** | ⚡ ~2 minutes | ⏱️ ~10-15 minutes |
| **Database Connection** | ✅ Automatic (service names) | ⚠️ Requires localhost config |
| **Isolation** | ✅ Complete | ❌ Conflicts possible |
| **Reproducibility** | ✅ Same everywhere | ⚠️ Environment dependent |
| **Production Ready** | ✅ Yes | ❌ Requires additional setup |

## 📄 License

This project is proprietary.

## 👥 Contributors

- Initial development by Pavle Popovic

## 🎨 Admin Course Builder

The admin course builder provides a comprehensive interface for managing courses:

- **Course Management**: Create, edit, and delete courses
- **Lesson Editor**: 
  - Auto-save functionality (saves changes automatically after 2 seconds)
  - Rich content editor (Markdown support)
  - Video upload via Mux
  - Quiz creation
  - Week/Day organization
- **Real-time Sync**: Changes in the editor are automatically reflected in the student view
- **Preview**: Preview lessons before publishing

## 🔄 Recent Updates

### Auto-Save Feature
- Lessons auto-save after 2 seconds of inactivity
- No manual "Save" button needed for existing lessons
- Changes sync automatically to the database
- Optimized to prevent refresh loops and performance issues

### Video Integration (Mux)
- Professional video hosting and streaming
- Direct upload from admin interface
- Automatic processing and transcoding
- Real-time status updates
- Webhook-based synchronization

### Authentication Improvements
- Extended session timeout to 7 days
- Persistent login across sessions
- Automatic token refresh

### UI/UX Enhancements
- Music disabled on lesson pages for better video experience
- Improved lesson editor with better form management
- Enhanced markdown rendering in lesson content
- Responsive design improvements

## 🔗 Links

- Repository: https://github.com/pavle-popovic/the_mambo_inn
- API Documentation: http://localhost:8000/docs (when running)
- Docker Hub: Services built locally from Dockerfiles
