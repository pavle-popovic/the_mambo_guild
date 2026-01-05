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
├── dependencies.py          # FastAPI dependencies
├── database.py              # Database connection and session
├── config.py                # Environment configuration
└── main.py                  # FastAPI application entry point
```

## 🔌 API Endpoints

### Authentication (`/api/auth`)
- `POST /api/auth/register` - User registration
- `POST /api/auth/token` - Login (get JWT token)
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
```

## 🗄️ Database Models

### User & UserProfile
- User authentication and profile information
- XP, level, streak tracking
- Avatar URL for profile pictures
- Subscription tier

### World (Course)
- Course title, description, difficulty
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

- JWT tokens with 7-day expiration
- Password hashing with bcrypt
- Role-based access control (admin/user)
- Protected routes with dependency injection

## 📤 File Uploads

### Image Uploads (Cloudflare R2)
1. Client requests presigned URL from `/api/uploads/presigned-url`
2. Backend generates UUID filename and presigned PUT URL
3. Client uploads directly to R2 using presigned URL
4. Backend returns public URL for storage in database

### Video Uploads (Mux)
1. Client requests upload URL from `/api/mux/upload-url`
2. Backend creates Mux direct upload
3. Client uploads directly to Mux
4. Mux processes video and sends webhook
5. Backend updates lesson with Mux IDs

## 🔔 Webhooks

### Mux Webhook
- Endpoint: `POST /api/mux/webhook`
- Verifies webhook signature for security
- Updates lesson with `mux_playback_id` and `mux_asset_id` when video is ready
- Handles video deletion events

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

## 📝 API Documentation

Interactive API documentation available at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## 🔒 Security

- JWT token authentication
- Password hashing with bcrypt
- Webhook signature verification
- CORS configuration
- Input validation with Pydantic
- SQL injection prevention (SQLAlchemy ORM)

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
