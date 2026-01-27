from fastapi import APIRouter
from app.models.health import HealthCheckResponse, WelcomeResponse

router = APIRouter()


@router.get("/", response_model=WelcomeResponse)
async def root():
    """
    Root endpoint providing API introduction and available endpoints
    
    Returns:
        WelcomeResponse: API information including name, version, description, and available endpoints
    """
    return WelcomeResponse(
        name="Recruiter First API",
        version="1.0.0",
        description="AI-powered resume analysis API that matches resumes against job descriptions to provide insights, match scores, and recommendations.",
        endpoints=[
            "GET /health - Health check endpoint",
            "GET /docs - Interactive API documentation",
            "POST /api/v1/resume/analyze - Analyze resume against job description"
        ]
    )


@router.get("/health", response_model=HealthCheckResponse)
async def health_check():
    """
    Health check endpoint to verify API status
    
    Returns:
        HealthCheckResponse: {"status": "healthy", "message": "Service is running"}
    """
    return HealthCheckResponse(
        status="healthy",
        message="Service is running"
    )
