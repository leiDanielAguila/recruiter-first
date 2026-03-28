import json
import os
from datetime import datetime, timezone
from uuid import uuid4

from dotenv import load_dotenv
from google import genai
from google.genai import types

from app.models.cover_letter import CoverLetterDocument, CoverLetterGenerateRequest


load_dotenv()

client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")


def _resolve_hiring_manager_name(request_data: CoverLetterGenerateRequest) -> str:
    if request_data.hiring_manager_name:
        return request_data.hiring_manager_name
    if request_data.company:
        return f"{request_data.company} Hiring Team"
    return "Hiring Team"


def _normalize_cover_letter_text(value: str) -> str:
    lines = [line.rstrip() for line in value.replace("\r\n", "\n").split("\n")]
    trimmed_lines: list[str] = []

    previous_blank = False
    for line in lines:
        is_blank = len(line.strip()) == 0
        if is_blank and previous_blank:
            continue
        trimmed_lines.append(line)
        previous_blank = is_blank

    return "\n".join(trimmed_lines).strip()


async def generate_cover_letter(request_data: CoverLetterGenerateRequest) -> CoverLetterDocument:
    hiring_manager_name = _resolve_hiring_manager_name(request_data)

    prompt = (
        "You are an expert in cover letter generation. "
        "Write a concise, compelling, and professional cover letter tailored to the role.\n\n"
        "Requirements:\n"
        "- Keep tone polished and specific to the role\n"
        "- Mention relevant strengths mapped to the listed requirements\n"
        "- Use clear structure with greeting, body, and closing\n"
        "- Do not fabricate credentials, achievements, or specific employers\n"
        "- Output only the cover letter body text\n\n"
        f"JOB TITLE: {request_data.job_title}\n"
        f"HIRING MANAGER: {hiring_manager_name}\n"
        f"COMPANY: {request_data.company or 'Not provided'}\n"
        f"APPLICANT EMAIL: {request_data.email}\n"
        f"APPLICANT PHONE: {request_data.phone}\n"
        f"CORE REQUIREMENTS: {json.dumps(request_data.requirements)}"
    )

    try:
        response = await client.aio.models.generate_content(
            model=GEMINI_MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=0.5,
            ),
        )

        generated_text = _normalize_cover_letter_text(response.text or "")
        if not generated_text:
            raise ValueError("Empty response from AI cover letter generator.")

        return CoverLetterDocument(
            id=str(uuid4()),
            job_title=request_data.job_title,
            hiring_manager_name=hiring_manager_name,
            email=request_data.email,
            phone=request_data.phone,
            company=request_data.company,
            requirements=request_data.requirements,
            cover_letter=generated_text,
            created_at=datetime.now(timezone.utc),
        )
    except ValueError:
        raise
    except Exception as error:
        raise RuntimeError("Failed to generate cover letter.") from error
