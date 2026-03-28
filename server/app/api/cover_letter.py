from io import BytesIO
import re

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import StreamingResponse

from app.core.rate_limit import limiter
from app.models.database.user import User
from app.models.cover_letter import CoverLetterGenerateRequest, CoverLetterGenerateResponse
from app.services.cover_letter_service import generate_cover_letter
from app.services.cover_letter_store import get_cover_letter_store
from app.services.pdf_service import render_cover_letter_pdf
from app.utils.security import get_current_user
from app.utils.sanitization import _INJECTION_PATTERNS, MAX_WORDS


router = APIRouter()

_FILENAME_UNSAFE = re.compile(r"[^A-Za-z0-9._-]+")


def _raise_if_injection_detected(value: str) -> None:
    for pattern, message in _INJECTION_PATTERNS:
        if pattern.search(value):
            raise HTTPException(status_code=400, detail=message)


def _build_pdf_filename(job_title: str) -> str:
    safe_title = _FILENAME_UNSAFE.sub("-", job_title.strip()).strip("-")
    if not safe_title:
        safe_title = "cover-letter"
    return f"{safe_title.lower()}.pdf"


@router.post("/cover-letter/generate", response_model=CoverLetterGenerateResponse)
@limiter.limit("5/hour")
async def generate_cover_letter_endpoint(
    request: Request,
    payload: CoverLetterGenerateRequest,
    current_user: User = Depends(get_current_user),
):
    """
    Generate a tailored cover letter using AI.

    Applies text-security validation and content-size checks before generation.
    """
    del request

    if not payload.job_title:
        raise HTTPException(status_code=400, detail="Job title is required.")

    fields_to_scan = [
        payload.job_title,
        payload.hiring_manager_name,
        payload.email,
        payload.phone,
        payload.company,
        current_user.first_name,
        current_user.last_name,
        *payload.requirements,
    ]

    for value in fields_to_scan:
        if value:
            _raise_if_injection_detected(value)

    combined_text = " ".join(fields_to_scan)
    word_count = len(combined_text.split())
    if word_count > MAX_WORDS:
        raise HTTPException(
            status_code=400,
            detail=f"Input exceeds the {MAX_WORDS:,} word limit ({word_count:,} words). Please shorten it and try again.",
        )

    try:
        applicant_full_name = f"{current_user.first_name} {current_user.last_name}".strip()
        document = await generate_cover_letter(
            request_data=payload,
            applicant_full_name=applicant_full_name,
        )
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error
    except RuntimeError as error:
        raise HTTPException(
            status_code=502,
            detail="Cover letter generation is temporarily unavailable. Please try again shortly.",
        ) from error
    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while generating the cover letter: {str(error)}",
        ) from error

    store = get_cover_letter_store()
    store.save(document)

    return CoverLetterGenerateResponse(document_id=document.id, cover_letter=document.cover_letter)


@router.get("/cover-letter/{document_id}/export-pdf")
@limiter.limit("20/hour")
async def export_cover_letter_pdf_endpoint(
    request: Request,
    document_id: str,
):
    """
    Export an existing generated cover letter as a binary PDF file.
    """
    del request

    store = get_cover_letter_store()
    document = store.get(document_id)
    if document is None:
        raise HTTPException(
            status_code=404,
            detail="Cover letter document not found. Generate a new cover letter and try again.",
        )

    try:
        pdf_bytes = render_cover_letter_pdf(document)
    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Unable to export cover letter as PDF: {str(error)}",
        ) from error

    filename = _build_pdf_filename(document.job_title)
    return StreamingResponse(
        BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
