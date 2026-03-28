from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Request
from app.models.resume import ResumeAnalysisRequest, ResumeAnalysisResponse
from app.services.resume_service import analyze_resume, validate_job_description
from app.core.rate_limit import limiter
from app.utils.sanitization import _INJECTION_PATTERNS, MAX_PDF_BYTES, MAX_WORDS


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

    # Reject oversized PDFs before reading into memory
    if resume.size and resume.size > MAX_PDF_BYTES:
        raise HTTPException(
            status_code=400,
            detail=f"PDF file is too large ({resume.size / (1024 * 1024):.1f} MB). Maximum allowed size is 10 MB."
        )
    
    if not job_description or len(job_description.strip()) == 0:
        raise HTTPException(
            status_code=400,
            detail="Job description cannot be empty."
        )

    # Word count guard
    word_count = len(job_description.split())
    if word_count > MAX_WORDS:
        raise HTTPException(
            status_code=400,
            detail=f"Your job description exceeds the {MAX_WORDS:,} word limit ({word_count:,} words). Please shorten it and try again."
        )

    # Injection pattern guards
    for pattern, message in _INJECTION_PATTERNS:
        if pattern.search(job_description):
            raise HTTPException(status_code=400, detail=message)

    # AI classification — verify it looks like a real job description
    is_valid, reason = await validate_job_description(job_description)
    if not is_valid:
        raise HTTPException(
            status_code=400,
            detail=f"This doesn't look like a valid job description: {reason} Please enter a real job posting."
        )

    try:
        result = await analyze_resume(resume, job_description)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while analyzing the resume: {str(e)}"
        )
