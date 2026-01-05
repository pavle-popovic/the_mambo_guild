from fastapi import APIRouter

api_router = APIRouter()

# Import routers
from .auth import router as auth_router
from .courses import router as courses_router
from .progress import router as progress_router
from .submissions import router as submissions_router
from .admin import router as admin_router
from .admin_courses import router as admin_courses_router
from .mux import router as mux_router
from .uploads import router as uploads_router
from .users import router as users_router

# Register routers
api_router.include_router(auth_router, prefix="/auth", tags=["auth"])
api_router.include_router(courses_router, prefix="/courses", tags=["courses"])
api_router.include_router(progress_router, prefix="/progress", tags=["progress"])
api_router.include_router(submissions_router, prefix="/submissions", tags=["submissions"])
api_router.include_router(admin_router, prefix="/admin", tags=["admin"])
api_router.include_router(admin_courses_router, prefix="/admin", tags=["admin"])
api_router.include_router(mux_router, prefix="/mux", tags=["mux"])
api_router.include_router(uploads_router, prefix="/uploads", tags=["uploads"])
api_router.include_router(users_router, tags=["users"])

