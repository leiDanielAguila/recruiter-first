from pydantic import BaseModel, Field
from typing import Optional, List


class ResumeAnalysisRequest(BaseModel):
    """Request model for resume analysis"""
    resume_file: str = Field(..., description="Base64 encoded PDF file")
    job_description: str = Field(..., description="Job description text")


class ResumeAnalysisResponse(BaseModel):
    """Response model for resume analysis"""
    match_score: float = Field(..., ge=0, le=100, description="Matching score between 0-100")
    summary: str = Field(..., description="Summary of the analysis")
    strengths: List[str] = Field(default_factory=list, description="Candidate strengths")
    gaps: List[str] = Field(default_factory=list, description="Skills or experience gaps")
    recommendations: Optional[List[str]] = Field(default_factory=list, description="Improvement recommendations")
