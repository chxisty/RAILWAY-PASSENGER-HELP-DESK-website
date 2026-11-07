from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.endpoints import router as api_router
from app.api.auth_endpoints import router as auth_router
from app.retrieval.engine import retrieval_engine

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Ensure index is warmed up
    retrieval_engine.load_dataset()
    yield
    # Shutdown logic if needed

app = FastAPI(
    title="Railway Passenger Help Desk API",
    description="Intelligent, Grounded Retrieval-Augmented Help Desk System for Railway Passengers.",
    version=settings.VERSION,
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for local dev & assessment testing
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Router
app.include_router(api_router, prefix="/api")
app.include_router(auth_router, prefix="/api/auth", tags=["Authentication"])
app.include_router(api_router, prefix="")  # Exposes /health directly at root as well

@app.get("/")
def root():
    return {
        "service": "Railway Passenger Help Desk API",
        "version": settings.VERSION,
        "status": "online",
        "docs_url": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=True)

