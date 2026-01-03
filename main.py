from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import api_router
from config import settings

app = FastAPI(
    title="Salsa Lab API",
    description="Backend API for Salsa Lab",
    version="1.0.0"
)

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(api_router, prefix="/api")


@app.get("/")
async def root():
    return {"message": "Salsa Lab API", "status": "running"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

