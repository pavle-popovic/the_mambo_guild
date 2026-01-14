# Backend - The Mambo Inn LMS API

FastAPI backend application providing RESTful API for The Mambo Inn Learning Management System.

## 🚀 Tech Stack

- **FastAPI 0.104.1**: Modern, fast Python web framework
- **SQLAlchemy 2.0.23**: ORM for database operations
- **PostgreSQL**: Primary database with JSONB support
- **Redis 5.0.1**: Caching and session management
- **Pydantic**: Data validation and settings management
- **JWT**: Authentication tokens
- **mux-python 5.1.0**: Mux API integration
- **boto3 1.34.0**: AWS SDK for Cloudflare R2 (S3-compatible storage)

## 📦 Dependencies

See `requirements.txt` for complete dependency list. Key packages:

- `fastapi==0.104.1`
- `uvicorn[standard]==0.24.0`
- `sqlalchemy==2.0.23`
- `psycopg2-binary==2.9.9`
- `redis==5.0.1`
- `pyjwt==2.8.0`
- `passlib[bcrypt]==1.7.4`
- `python-jose[cryptography]==3.3.0`
- `mux-python==5.1.0`
- `boto3==1.34.0`
- `authlib==1.3.0` - OAuth2/OIDC client for Google authentication
- `httpx==0.27.0` - Async HTTP client for OAuth token exchange
- `resend==2.1.0` - Transactional email service for password reset
- `itsdangerous==2.1.2` - Secure token generation for password reset links
- `stripe==7.0.0` - Payment processing

## 🏗️ Project Structure

```
backend/
├── routers/                 # API route handlers
│   ├── auth.py             # Authentication endpoints
│   ├── courses.py           # Public course/lesson endpoints
│   ├── admin_courses.py     # Admin course management
│   ├── users.py             # User profile endpoints
│   ├── uploads.py           # Image upload presigned URLs
│   └── mux.py               # Mux webhook and upload endpoints
├── models/                  # SQLAlchemy database models
│   ├── user.py             # User and UserProfile models
│   └── course.py            # World, Level, Lesson models
├── schemas/                 # Pydantic validation schemas
│   ├── auth.py             # Auth-related schemas
│   ├── course.py            # Course/lesson schemas
│   └── gamification.py      # Gamification schemas
├── services/                # Business logic services
│   ├── storage_service.py   # R2/S3 storage service
│   └── mux_service.py       # Mux API service
├── scripts/                 # Utility and migration scripts
│   ├── create_admin.py     # Create admin user
│   ├── create_test_user.py # Create test user with subscription
│   ├── seed_courses.py     # Seed initial course data
│   ├── seed_direct.py      # Direct database seeding
│   └── migrate_*.py        # Database migration scripts
├── tests/                   # Test suite
│   ├── conftest.py         # Pytest configuration
│   ├── test_backend.py     # Backend unit tests
│   ├── test_all_apis.py    # Comprehensive API tests
│   └── test_*.py           # Additional test files
├── migrations/              # Database schema migrations
├── dependencies.py          # FastAPI dependencies
├── database.py              # Database connection and session
├── config.py                # Environment configuration
└── main.py                  # FastAPI application entry point
```

## 🔌 API Endpoints

### Authentication (`/api/auth`)
- `POST /api/auth/register` - User registration (with password confirmation)
- `POST /api/auth/token` - Login (get JWT token)
- `GET /api/auth/login/google` - Initiate Google OAuth login
- `GET /api/auth/callback/google` - Google OAuth callback handler
- `POST /api/auth/forgot-password` - Request password reset email
- `POST /api/auth/reset-password` - Reset password with token
- `GET /api/auth/me` - Get current user profile

### Courses (`/api/courses`)
- `GET /api/courses/worlds` - List all courses/worlds
- `GET /api/courses/worlds/{world_id}/lessons` - Get lessons for a course (sorted by week/day/order)
- `GET /api/courses/lessons/{lesson_id}` - Get lesson details with next/prev lesson IDs (based on proper ordering)
- `POST /api/courses/lessons/{lesson_id}/complete` - Complete a lesson

### Admin (`/api/admin`)
- `GET /api/admin/courses` - List all courses (admin)
- `POST /api/admin/courses` - Create new course
- `GET /api/admin/courses/{course_id}` - Get course with full details
- `PATCH /api/admin/courses/{course_id}` - Update course
- `DELETE /api/admin/courses/{course_id}` - Delete course
- `POST /api/admin/courses/{course_id}/lessons` - Create lesson
- `PATCH /api/admin/lessons/{lesson_id}` - Update lesson
- `DELETE /api/admin/lessons/{lesson_id}` - Delete lesson

### Users (`/api/users`)
- `GET /api/users/me` - Get user profile
- `PATCH /api/users/me` - Update user profile (avatar_url)

### Uploads (`/api/uploads`)
- `POST /api/uploads/presigned-url` - Get presigned URL for R2 upload
  - Body: `{ "file_type": "image/png", "folder": "avatars" | "thumbnails" }`
  - Response: `{ "upload_url": "...", "public_url": "..." }`

### Mux (`/api/mux`)
- `POST /api/mux/upload-url` - Get Mux upload URL
- `POST /api/mux/check-upload-status` - Check video processing status
- `DELETE /api/mux/asset/{asset_id}` - Delete Mux asset
- `POST /api/mux/webhook` - Mux webhook endpoint (video processing updates)

## 🔧 Configuration

### Environment Variables

Required in `.env`:
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

# Cloudflare R2
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
PASSWORD_RESET_EXPIRE_MINUTES=60

# OAuthlib for local development (set to 1 to allow HTTP for OAuth)
OAUTHLIB_INSECURE_TRANSPORT=1
```

## 🗄️ Database Models

### User & UserProfile
- User authentication and profile information
- **Authentication fields**:
  - `auth_provider`: "email" or "google" (default: "email")
  - `social_id`: OAuth provider's unique user ID (nullable)
  - `is_verified`: Email verification status (default: false)
  - `hashed_password`: Nullable for OAuth users
- XP, level, streak tracking
- Avatar URL for profile pictures (can sync from Google)
- Subscription tier

### World (Course)
- Course title, description, difficulty
- **Content type**: `course`, `choreo`, or `topic` (default: `course`)
- Thumbnail URL
- Progress tracking

### Level
- Organization within courses
- Currently used for grouping lessons

### Lesson
- Title, description, content
- Week and day numbers for hierarchical organization
- Order index for sorting within days
- Video content (Mux playback ID and asset ID)
- Thumbnail URL
- Rich content (JSONB): notes (markdown), quizzes
- XP value and boss battle flag
- Lessons sorted by: week_number → day_number → order_index

## 🔐 Authentication

### Email/Password Authentication
- JWT tokens with 7-day expiration
- Password hashing with bcrypt
- Password confirmation validation on registration
- Minimum password length: 8 characters
- Role-based access control (admin/user)
- Protected routes with dependency injection

### OAuth Authentication (Google)
- OAuth 2.0 flow using Authlib
- CSRF protection with Redis state tokens
- Automatic user creation for new OAuth users
- Account linking for existing email users
- Profile picture sync from Google
- Email verification automatically set to true for OAuth users

### Password Reset
- Secure token generation using `itsdangerous`
- Time-limited reset tokens (configurable expiration)
- Email delivery via Resend service
- Password confirmation required on reset
- Token validation and expiration checking

### OAuth Flow
1. User clicks "Sign in with Google"
2. Backend generates CSRF state token and stores in Redis
3. User redirected to Google consent screen
4. Google redirects back to `/api/auth/callback/google` with code
5. Backend verifies state token, exchanges code for access token
6. Backend fetches user info from Google
7. Backend creates/logs in user and returns JWT
8. Frontend receives JWT via redirect URL and stores in localStorage

## 📤 File Uploads

### Image Uploads (Cloudflare R2)
1. Client requests presigned URL from `/api/uploads/presigned-url`
2. Backend generates UUID filename and presigned PUT URL
3. Client uploads directly to R2 using presigned URL
4. Backend returns public URL for storage in database

### Video Uploads (Mux)
1. Client requests upload URL from `/api/mux/upload-url`
   - Supports both lesson videos and course preview videos
   - Pass `lesson_id` for lesson videos or `course_id` for course previews
2. Backend creates Mux direct upload with passthrough metadata
3. Client uploads directly to Mux
4. Mux processes video and sends webhook
5. Backend updates lesson/course with Mux IDs (`mux_playback_id`, `mux_asset_id`, `mux_preview_playback_id`, `mux_preview_asset_id`)

### Course Preview Videos
- Course preview videos are stored in the `World` model with `mux_preview_playback_id` and `mux_preview_asset_id`
- Same upload pipeline as lesson videos
- Webhook handler automatically updates course preview IDs when video is ready
- Delete endpoint handles both lesson videos and course previews

## 🔔 Webhooks

### Mux Webhook
- Endpoint: `POST /api/mux/webhook`
- Verifies webhook signature for security
- Updates lesson with `mux_playback_id` and `mux_asset_id` when video is ready
- Updates course with `mux_preview_playback_id` and `mux_preview_asset_id` when preview video is ready
- Handles video deletion events
- Supports both lesson videos and course preview videos via passthrough metadata

## 🧪 Development

### Running Locally

```bash
# Install dependencies
pip install -r requirements.txt

# Run development server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Database Migrations

The database schema is automatically created on first run. For manual migrations:

```python
# Create tables
from database import Base, engine
Base.metadata.create_all(bind=engine)
```

**OAuth Migration**: Run the migration script to add OAuth columns:
```bash
docker-compose exec backend python migrations/add_oauth_columns.py
docker-compose exec backend python migrations/make_password_nullable.py
```

## 📝 API Documentation

Interactive API documentation available at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## 🔒 Security

- JWT token authentication
- Password hashing with bcrypt
- OAuth state token verification (CSRF protection)
- Password reset token expiration and validation
- Webhook signature verification
- CORS configuration
- Input validation with Pydantic
- SQL injection prevention (SQLAlchemy ORM)
- Email enumeration prevention in password reset
- Secure token generation with `itsdangerous`

## 🚀 Performance

- Database connection pooling
- Redis caching
- Efficient queries with SQLAlchemy
- Async/await for I/O operations
- Presigned URLs for direct client uploads (reduces server load)

## 📊 Error Handling

- Comprehensive error responses
- Pydantic validation errors
- Database constraint errors
- HTTP exception handling
- Detailed error messages for debugging

## 📝 Recent Updates

### Latest Features
- ✅ **Content Type System** (January 2026)
  - Added `course_type` column to `worlds` table (course, choreo, topic)
  - Create/Update/Get course endpoints now support `course_type` field
  - Migration script: `scripts/add_course_type.py`
  - Default type is "course" for backwards compatibility
- ✅ **Codebase Cleanup & Reorganization** (January 2026)
  - Scripts moved to `backend/scripts/` directory
  - Tests moved to `backend/tests/` directory with pytest configuration
  - Deleted dead code (node_modules, package.json from Python backend)
  - **Security Fix**: SECRET_KEY now raises `ValueError` in production if not set
  - **Performance Fix**: Eliminated N+1 queries in `get_worlds` and `get_world_lessons` endpoints
- ✅ **Course Completion Detection**: Backend support for course completion tracking
  - Progress calculation returns accurate completion percentages
  - Course completion determined by all lessons being completed
  - Progress endpoint handles edge cases (zero lessons, division by zero)
  - Consistent progress tracking across all API endpoints
  - Progress clamped to 0-100% range for accurate frontend display
- ✅ **Course Preview Videos**: Full support for course preview video uploads and management
  - Added `mux_preview_playback_id` and `mux_preview_asset_id` to `World` model
  - Mux webhook handler updates course preview IDs automatically
  - Delete endpoint handles both lesson videos and course previews
  - Asset existence checking for sync verification
- ✅ **Stripe Payment Integration**: Complete payment processing system
  - Checkout session creation with specific price IDs
  - Webhook handling for subscription activation
  - Tier-based access control (Rookie/Advanced/Performer)
- ✅ **Enhanced Mux Integration**: Improved video upload and management
  - Support for both lesson videos and course previews in upload endpoint
  - Passthrough metadata for entity type identification
  - Asset deletion with database sync
  - Asset existence verification endpoint
