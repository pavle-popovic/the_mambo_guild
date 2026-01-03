# The Salsa Lab - Backend API

This is the backend service for The Salsa Lab, built with **FastAPI**, **SQLAlchemy**, and **PostgreSQL**.

## Technical Structure

- **Framework**: FastAPI (Python 3.11+)
- **Database**: PostgreSQL (Async via SQLAlchemy 2.0)
- **Authentication**: OAuth2 with Password Flow (JWT)
- **Storage**: AWS S3 (via boto3) for video uploads
- **Payments**: Stripe API integration

### Directory Structure

- `app/main.py`: Application entry point.
- `config.py`: Environment configuration (Pydantic Settings).
- `database.py`: Database connection and session management.
- `models/`: SQLAlchemy ORM models (User, Course, Progress, etc.).
- `schemas/`: Pydantic models for request/response validation.
- `routers/`: API route handlers organized by domain (Auth, Users, Courses, etc.).
- `services/`: Business logic and external integrations (S3, Stripe).
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
    Create a `.env` file in this directory with the following (example):
    ```env
    DATABASE_URL=postgresql+asyncpg://user:password@localhost/salsalab
    SECRET_KEY=your_secret_key
    ALGORITHM=HS256
    ACCESS_TOKEN_EXPIRE_MINUTES=30
    STRIPE_SECRET_KEY=sk_test_...
    AWS_ACCESS_KEY_ID=...
    AWS_SECRET_ACCESS_KEY=...
    AWS_BUCKET_NAME=...
    ```

4.  **Run the Server**:
    ```bash
    uvicorn main:app --reload
    ```

    The API will be available at `http://localhost:8000`.
    Interactive docs: `http://localhost:8000/docs`.