from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.v1.api import api_router
from app.core.config import settings
from app.core.exceptions import NotFoundException, DuplicateException, ValidationException
from app.models import *  # Import all models to ensure they are registered with SQLAlchemy


def create_application() -> FastAPI:
    app = FastAPI(
        title="Pharmacy Management API",
        description="API for managing drug master database with generic and brand name information",
        version="1.0.0",
        docs_url="/docs",
        redoc_url="/redoc",
    )
    
    # CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # Configure appropriately for production
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Include API router
    app.include_router(api_router, prefix="/api/v1")
    
    # Exception handlers
    @app.exception_handler(NotFoundException)
    async def not_found_handler(request, exc):
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"detail": str(exc)}
        )
    
    @app.exception_handler(DuplicateException)
    async def duplicate_handler(request, exc):
        return JSONResponse(
            status_code=status.HTTP_409_CONFLICT,
            content={"detail": str(exc)}
        )
    
    @app.exception_handler(ValidationException)
    async def validation_handler(request, exc):
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={"detail": str(exc)}
        )
    
    # Health check endpoint
    @app.get("/health", tags=["health"])
    def health_check():
        return {"status": "healthy", "version": "1.0.0"}
    
    # Root endpoint
    @app.get("/", tags=["root"])
    def root():
        return {
            "message": "Pharmacy Management API",
            "version": "1.0.0",
            "docs": "/docs"
        }
    
    return app


app = create_application()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG
    )
