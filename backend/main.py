from fastapi import FastAPI, Request, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from routers import api_router
from routers.mux import mux_webhook_handler
from config import settings
from models import get_db
from sqlalchemy.orm import Session
from typing import Optional

app = FastAPI(
    title="Salsa Lab API",
    description="Backend API for Salsa Lab",
    version="1.0.0"
)

# CORS middleware configuration - Industry standard: Explicit origins, credentials support
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Include routers
app.include_router(api_router, prefix="/api")

# Add webhook endpoint at /api/webhook for Mux (also available at /api/mux/webhook)
@app.post("/api/webhook")
async def mux_webhook_alias(
    request: Request,
    db: Session = Depends(get_db),
    mux_signature: Optional[str] = Header(None, alias="Mux-Signature")
):
    """
    Alias for Mux webhook endpoint.
    Mux webhooks can be configured to POST to /api/webhook or /api/mux/webhook
    """
    return await mux_webhook_handler(request, db, mux_signature)


@app.get("/")
async def root():
    return {"message": "Salsa Lab API", "status": "running"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

