from fastapi import UploadFile
from app.models.resume import ResumeAnalysisResponse
from app.services.pdf_service import extract_text_from_pdf
import os
import json
from dotenv import load_dotenv
from google import genai
from google.genai import types


load_dotenv()

# Singleton client — created once at import time, reused across all requests
client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")


async def validate_job_description(text: str) -> tuple[bool, str]:
    """
    Calls Gemini asynchronously to classify whether the text is a legitimate job description.

    Parameters:
        text (str): The job description input to classify

    Returns:
        tuple[bool, str]: (is_valid, reason) — True if the text looks like a real
        job posting, False otherwise with a human-readable reason.

    Example return: (False, "The text appears to be a general question, not a job description.")
    """
    prompt = (
        "Classify whether the following text is a legitimate job description.\n\n"
        "A legitimate job description typically describes a role or position at a company, "
        "including required skills, qualifications, responsibilities, or employment terms.\n\n"
        f"TEXT:\n{text}\n\n"
        'Respond only in JSON: {"is_valid": true/false, "reason": "<brief reason>"}'
    )

    response = await client.aio.models.generate_content(
        model=GEMINI_MODEL,
        contents=prompt,
        config=types.GenerateContentConfig(
            temperature=0.1,
            response_mime_type="application/json",
            response_schema={
                "type": "object",
                "properties": {
                    "is_valid": {"type": "boolean"},
                    "reason": {"type": "string"},
                },
                "required": ["is_valid", "reason"],
            },
        ),
    )

    data = json.loads(response.text or "{}")
    return data.get("is_valid", False), data.get("reason", "Unable to classify input.")


async def analyze_resume(resume: UploadFile, job_description: str) -> ResumeAnalysisResponse:
    """
    Analyzes resume against job description using Google Generative AI.

    Parameters:
        resume (UploadFile): PDF file containing the resume
        job_description (str): Job description to match against

    Returns:
        ResumeAnalysisResponse: Analysis results including match score, strengths, gaps
    """

    resume_text = await extract_text_from_pdf(resume)

    prompt = f"""You are an expert recruiter and HR professional. Analyze the following resume against the job description and provide a detailed assessment.

RESUME:
{resume_text}

JOB DESCRIPTION:
{job_description}

Analyze the candidate's fit for this role and provide your response in the following JSON format:
{{
    "match_score": <number between 0-100>,
    "summary": "<brief summary of the candidate's overall fit>",
    "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
    "gaps": ["<gap 1>", "<gap 2>"],
    "recommendations": ["<recommendation 1>", "<recommendation 2>"]
}}

Consider:
- Technical skills match
- Experience level alignment
- Educational background
- Soft skills and achievements
- Industry experience

Provide ONLY the JSON response, no additional text."""

    try:
        response = await client.aio.models.generate_content(
            model=GEMINI_MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=0.7,
                response_mime_type="application/json",
                response_schema={
                    "type": "object",
                    "properties": {
                        "match_score": {"type": "number"},
                        "summary": {"type": "string"},
                        "strengths": {
                            "type": "array",
                            "items": {"type": "string"}
                        },
                        "gaps": {
                            "type": "array",
                            "items": {"type": "string"}
                        },
                        "recommendations": {
                            "type": "array",
                            "items": {"type": "string"}
                        }
                    },
                    "required": ["match_score", "summary", "strengths", "gaps", "recommendations"]
                }
            )
        )

        response_text = response.text or ""
        if not response_text:
            raise ValueError("Empty response from LLM: response.text is None or empty")

        analysis_data = json.loads(response_text)

        return ResumeAnalysisResponse(
            match_score=float(analysis_data.get("match_score", 0)),
            summary=analysis_data.get("summary", ""),
            strengths=analysis_data.get("strengths", []),
            gaps=analysis_data.get("gaps", []),
            recommendations=analysis_data.get("recommendations", [])
        )

    except json.JSONDecodeError as e:
        return ResumeAnalysisResponse(
            match_score=0.0,
            summary=f"Error parsing LLM response: {str(e)}",
            strengths=[],
            gaps=[],
            recommendations=[]
        )
    except Exception as e:
        return ResumeAnalysisResponse(
            match_score=0.0,
            summary=f"Error during analysis: {str(e)}",
            strengths=[],
            gaps=[],
            recommendations=[]
        )
    
