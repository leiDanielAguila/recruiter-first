from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import health, resume

app = FastAPI(
    title="Recruiter First API",
    description="API for resume and job description matching",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, tags=["Health"])
app.include_router(resume.router, prefix="/api/v1", tags=["Resume"])
