# API Testing Guide

## Prerequisites

1. **Start Docker containers:**
   ```bash
   docker-compose up -d
   ```

2. **Wait for PostgreSQL to initialize** (about 10-15 seconds)

3. **Initialize the database:**
   ```bash
   cd backend
   python database.py
   ```

4. **Start the FastAPI server:**
   ```bash
   cd backend
   uvicorn main:app --reload
   ```

5. **In another terminal, run the API tests:**
   ```bash
   cd backend
   python test_all_apis.py
   ```

## API Endpoints

### Authentication Endpoints

#### 1. Register User
```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "first_name": "John",
  "last_name": "Doe",
  "current_level_tag": "Beginner"
}

Response: {
  "access_token": "eyJ...",
  "token_type": "bearer"
}
```

#### 2. Login
```bash
POST /api/auth/token
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response: {
  "access_token": "eyJ...",
  "token_type": "bearer"
}
```

#### 3. Get Current User Profile
```bash
GET /api/auth/me
Authorization: Bearer <token>

Response: {
  "id": "uuid",
  "first_name": "John",
  "last_name": "Doe",
  "xp": 0,
  "level": 1,
  "streak_count": 0,
  "tier": "rookie",
  "avatar_url": null
}
```

### Course Endpoints

#### 4. Get All Worlds
```bash
GET /api/courses/worlds
Authorization: Bearer <token>

Response: [
  {
    "id": "uuid",
    "title": "World 1: The Foundation",
    "description": "...",
    "image_url": "...",
    "difficulty": "Beginner",
    "progress_percentage": 0.0,
    "is_locked": false
  }
]
```

#### 5. Get World Lessons
```bash
GET /api/courses/worlds/{world_id}/lessons
Authorization: Bearer <token>

Response: [
  {
    "id": "uuid",
    "title": "Lesson 1.1",
    "description": "...",
    "video_url": "...",
    "xp_value": 50,
    "is_completed": false,
    "is_locked": false,
    "is_boss_battle": false,
    "order_index": 1
  }
]
```

#### 6. Get Lesson Details
```bash
GET /api/courses/lessons/{lesson_id}
Authorization: Bearer <token>

Response: {
  "id": "uuid",
  "title": "Lesson 1.1",
  "description": "...",
  "video_url": "...",
  "xp_value": 50,
  "next_lesson_id": "uuid",
  "prev_lesson_id": null,
  "comments": []
}
```

### Progress Endpoints

#### 7. Complete Lesson
```bash
POST /api/progress/lessons/{lesson_id}/complete
Authorization: Bearer <token>

Response: {
  "xp_gained": 50,
  "new_total_xp": 50,
  "leveled_up": false,
  "new_level": 1
}
```

### Submission Endpoints

#### 8. Submit Boss Battle
```bash
POST /api/submissions/submit
Authorization: Bearer <token>
Content-Type: application/json

{
  "lesson_id": "uuid",
  "video_url": "https://example.com/video.mp4"
}

Response: {
  "id": "uuid",
  "status": "pending",
  "feedback": null,
  "submitted_at": "2024-01-01T00:00:00"
}
```

#### 9. Get My Submissions
```bash
GET /api/submissions/my-submissions
Authorization: Bearer <token>

Response: [
  {
    "id": "uuid",
    "status": "pending",
    "feedback": null,
    "submitted_at": "2024-01-01T00:00:00"
  }
]
```

### Admin Endpoints

#### 10. Get Pending Submissions (Admin Only)
```bash
GET /api/admin/submissions
Authorization: Bearer <admin_token>

Response: [
  {
    "id": "uuid",
    "status": "pending",
    "feedback": null,
    "submitted_at": "2024-01-01T00:00:00"
  }
]
```

#### 11. Grade Submission (Admin Only)
```bash
POST /api/admin/submissions/{submission_id}/grade
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "status": "approved",
  "feedback_text": "Great work!",
  "feedback_video_url": null
}

Response: {
  "message": "Submission graded successfully"
}
```

#### 12. Get Admin Stats (Admin Only)
```bash
GET /api/admin/stats
Authorization: Bearer <admin_token>

Response: {
  "total_users": 10,
  "total_submissions": 5,
  "pending_submissions": 2
}
```

## Testing with cURL

### Example: Register and Login
```bash
# Register
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123",
    "first_name": "Test",
    "last_name": "User",
    "current_level_tag": "Beginner"
  }'

# Login
curl -X POST http://localhost:8000/api/auth/token \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123"
  }'

# Get Profile (replace TOKEN with actual token)
curl -X GET http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer TOKEN"
```

## Testing with Python requests

See `test_all_apis.py` for a comprehensive automated test suite.

## Expected Test Results

When all APIs are working correctly, you should see:

- ✅ Health Check
- ✅ User Registration
- ✅ User Login
- ✅ Get Profile
- ✅ Get Worlds (may return empty if no data)
- ✅ Get World Lessons (may return empty if no data)
- ✅ Complete Lesson (may skip if no lessons available)
- ✅ Submit Boss Battle (may skip if not a boss battle)
- ✅ Get My Submissions

## Troubleshooting

### Database Connection Issues

If you see "password authentication failed":
1. Make sure docker-compose is running: `docker-compose ps`
2. Wait 10-15 seconds after starting containers
3. Try resetting: `docker-compose down -v && docker-compose up -d`
4. Check logs: `docker-compose logs postgres`

### Server Not Running

If tests show "Server not running":
1. Start the server: `cd backend && uvicorn main:app --reload`
2. Wait for "Application startup complete" message
3. Run tests again

### Empty Results

If endpoints return empty arrays:
- This is normal if no data has been seeded
- Use the admin endpoints or seed script to add test data

