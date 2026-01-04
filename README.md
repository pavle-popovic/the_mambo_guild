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

**Backend:**
- FastAPI (Python)
- SQLAlchemy (PostgreSQL)
- Redis (Caching & Leaderboards)
- JWT Authentication
- Pydantic for validation

**Infrastructure:**
- Docker & Docker Compose (Recommended)
- PostgreSQL Database
- Redis Cache

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
- ✅ User Registration & Login
- ✅ Course Browsing (Public)
- ✅ Lesson Progression
- ✅ XP & Level System
- ✅ Streak Tracking
- ✅ Boss Battle Submissions
- ✅ Profile Dashboard

### Admin Features
- ✅ Admin Dashboard
- ✅ Submission Grading
- ✅ Course Builder
- ✅ User Management

## 🔐 Authentication

The platform uses JWT (JSON Web Tokens) for authentication. Tokens are stored in localStorage on the frontend and sent with each API request.

## 📊 Database Schema

### Key Models
- **User**: Authentication and basic info
- **UserProfile**: XP, level, streak, avatar
- **World**: Course container
- **Level**: World sub-section
- **Lesson**: Individual learning unit
- **UserProgress**: Lesson completion tracking
- **BossSubmission**: Video submission for boss battles
- **Subscription**: User subscription tiers

## 🎮 Gamification

- **XP System**: Earn XP by completing lessons
- **Level Formula**: `Level = floor(sqrt(XP / 100))`
- **Streak System**: Daily login streaks
- **Lock System**: Sequential lesson unlocking

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
- `REDIS_HOST`, `REDIS_PORT` - Redis configuration
- `NEXT_PUBLIC_API_URL` - Frontend API endpoint
- `CORS_ORIGINS` - Allowed CORS origins

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

## 📚 Additional Documentation

- **[DOCKER_SETUP.md](./DOCKER_SETUP.md)** - Complete Docker setup and usage guide
- **[DOCKER_IMPLEMENTATION_SUMMARY.md](./DOCKER_IMPLEMENTATION_SUMMARY.md)** - Docker implementation details
- **[API_TESTING_GUIDE.md](./API_TESTING_GUIDE.md)** - API testing instructions

## 🔗 Links

- Repository: https://github.com/pavle-popovic/the_mambo_inn
- API Documentation: http://localhost:8000/docs (when running)
- Docker Hub: Services built locally from Dockerfiles
