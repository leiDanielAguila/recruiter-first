from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Request
from app.models.resume import ResumeAnalysisRequest, ResumeAnalysisResponse
from app.services.resume_service import analyze_resume
from app.core.rate_limit import limiter

router = APIRouter()


@router.post("/resume/analyze", response_model=ResumeAnalysisResponse)
@limiter.limit("5/hour")  # 10 requests per hour per IP
async def analyze_resume_endpoint(
    request: Request,
    resume: UploadFile = File(..., description="Resume PDF file"),
    job_description: str = Form(..., description="Job description text")
):
    """
    Analyze resume against job description
    
    Rate limit: 10 requests per hour per IP address
    
    Parameters:
        resume (UploadFile): PDF file of the resume
        job_description (str): Text description of the job posting
    
    Returns:
        ResumeAnalysisResponse: Analysis results with matching score and insights
    """
    if not resume.filename or not resume.filename.endswith('.pdf'):
        raise HTTPException(
            status_code=400,
            detail="Invalid file format. Please upload a PDF file."
        )
    
    if not job_description or len(job_description.strip()) == 0:
        raise HTTPException(
            status_code=400,
            detail="Job description cannot be empty."
        )
    
    try:
        result = await analyze_resume(resume, job_description)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while analyzing the resume: {str(e)}"
        )
