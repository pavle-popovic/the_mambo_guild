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
- Docker & Docker Compose
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
├── docker-compose.yml   # Database and Redis setup
└── README.md           # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Python 3.11+
- Docker & Docker Compose

### 1. Start Database

```bash
docker-compose up -d
```

### 2. Setup Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

Backend will run on `http://localhost:8000`

### 3. Setup Frontend

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

```bash
cd backend
python test_backend.py              # Unit tests
python test_backend_comprehensive.py # API integration tests
python test_all_apis.py             # Full API test suite
```

### Frontend Tests

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

Create `.env` files as needed:

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

## 📄 License

This project is proprietary.

## 👥 Contributors

- Initial development by Pavle Popovic

## 🔗 Links

- Repository: https://github.com/pavle-popovic/the_mambo_inn
- API Documentation: http://localhost:8000/docs (when running)
