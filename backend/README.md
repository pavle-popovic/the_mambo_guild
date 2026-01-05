# The Mambo Inn - Backend API

This is the backend service for The Mambo Inn LMS platform, built with **FastAPI**, **SQLAlchemy**, and **PostgreSQL**.

## Technical Structure

- **Framework**: FastAPI (Python 3.11+)
- **Database**: PostgreSQL (Async via SQLAlchemy 2.0)
- **Authentication**: OAuth2 with Password Flow (JWT, 7-day expiration)
- **Video Processing**: Mux Python SDK for video uploads and streaming
- **Payments**: Stripe API integration

### Directory Structure

- `app/main.py`: Application entry point.
- `config.py`: Environment configuration (Pydantic Settings).
- `database.py`: Database connection and session management.
- `models/`: SQLAlchemy ORM models (User, Course, Progress, etc.).
- `schemas/`: Pydantic models for request/response validation.
- `routers/`: API route handlers organized by domain (Auth, Users, Courses, Mux, etc.).
- `services/`: Business logic and external integrations (Mux, Stripe, Auth).
- `dependencies.py`: Dependency injection (e.g., `get_current_user`).

## How to Run Locally

1.  **Create a virtual environment**:
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    ```

2.  **Install dependencies**:
    ```bash
    pip install -r requirements.txt
    ```

3.  **Set up Environment Variables**:
    Create a `.env` file in the project root (see `env.example`):
    ```env
    DATABASE_URL=postgresql+asyncpg://user:password@localhost/themamboinn
    SECRET_KEY=your_secret_key
    JWT_EXPIRATION_DAYS=7
    MUX_TOKEN_ID=your_mux_token_id
    MUX_TOKEN_SECRET=your_mux_token_secret
    MUX_WEBHOOK_SECRET=your_webhook_secret
    STRIPE_SECRET_KEY=sk_test_...
    ```

4.  **Run the Server**:
    ```bash
    uvicorn main:app --reload
    ```

    The API will be available at `http://localhost:8000`.
    Interactive docs: `http://localhost:8000/docs`.

## Features

### Mux Video Integration
- Video upload URL generation
- Webhook handling for video processing events
- Video status checking and synchronization
- Asset deletion and cleanup

### Authentication
- JWT tokens with 7-day expiration
- User registration and login
- Admin role management
- Persistent sessions

### Course Management
- Course CRUD operations
- Level and lesson management
- Week/Day organization
- Rich content support (JSONB)

### API Endpoints
- `/api/auth/*` - Authentication
- `/api/courses/*` - Course browsing
- `/api/admin/courses/*` - Admin course management
- `/api/mux/*` - Video upload and management
- `/api/users/*` - User management
- `/api/progress/*` - Progress tracking

See API documentation at `http://localhost:8000/docs` for full endpoint details.