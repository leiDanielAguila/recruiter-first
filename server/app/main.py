from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from app.core.rate_limit import limiter
from app.core.database import init_db
from app.api import health, resume, auth, job_application

app = FastAPI(
    title="Recruiter First API",
    description="API for resume and job description matching",
    version="1.0.0"
)

# Initialize database
@app.on_event("startup")
async def startup_event():
    """Initialize database tables on application startup"""
    init_db()

# Add rate limit exceeded handler
app.state.limiter = limiter
app.add_exception_handler(
    RateLimitExceeded,
    lambda request, exc: _rate_limit_exceeded_handler(request, exc)  # type: ignore
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # change later 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, tags=["Health"])
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(resume.router, prefix="/api/v1", tags=["Resume"])
app.include_router(job_application.router, prefix="/api/v1", tags=["Job Applications"])
