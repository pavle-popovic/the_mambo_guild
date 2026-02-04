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
from .payments import router as payments_router

# v4.0 Community Features
from .claves import router as claves_router
from .community import router as community_router
from .badges import router as badges_router

# AI Chat Feature
from .ai_chat import router as ai_chat_router

# Premium Features (Guild Master tier)
from .premium import router as premium_router

# Secure Downloads
from .downloads import router as downloads_router

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
api_router.include_router(payments_router, tags=["payments"])

# v4.0 Community Features
api_router.include_router(claves_router, prefix="/claves", tags=["claves"])
api_router.include_router(community_router, prefix="/community", tags=["community"])
api_router.include_router(badges_router, prefix="/badges", tags=["badges"])

# AI Chat Feature
api_router.include_router(ai_chat_router, prefix="/ai", tags=["ai"])

# Premium Features (Guild Master tier)
api_router.include_router(premium_router, tags=["premium"])

# Secure Downloads
api_router.include_router(downloads_router, tags=["downloads"])
