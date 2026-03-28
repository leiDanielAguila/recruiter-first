from datetime import datetime
from pydantic import BaseModel, Field, AliasChoices, ConfigDict, field_validator


MIN_REQUIREMENTS = 3
MAX_REQUIREMENTS = 5


class CoverLetterGenerateRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    hiring_manager_name: str = Field(
        default="",
        max_length=255,
        validation_alias=AliasChoices("hiring_manager_name", "hiringManagerName"),
        description="Hiring manager name",
    )
    job_title: str = Field(
        ...,
        min_length=1,
        max_length=255,
        validation_alias=AliasChoices("job_title", "jobTitle"),
        description="Job title",
    )
    email: str = Field(..., min_length=3, max_length=255, description="Applicant email")
    phone: str = Field(..., min_length=3, max_length=50, description="Applicant phone number")
    requirements: list[str] = Field(
        default_factory=list,
        description="Core job requirements",
    )
    company: str = Field(default="", max_length=255, description="Target company")

    @field_validator("job_title", "hiring_manager_name", "company")
    @classmethod
    def normalize_text_fields(cls, value: str) -> str:
        return " ".join(value.split()).strip()

    @field_validator("email")
    @classmethod
    def validate_email(cls, value: str) -> str:
        candidate = value.strip()
        if "@" not in candidate:
            raise ValueError("Please include '@' in the email address.")
        return candidate

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, value: str) -> str:
        candidate = value.strip()
        if not candidate:
            raise ValueError("Phone number is required.")
        return candidate

    @field_validator("requirements")
    @classmethod
    def validate_requirements(cls, values: list[str]) -> list[str]:
        cleaned_values = [" ".join(value.split()).strip() for value in values if value.strip()]
        if len(cleaned_values) < MIN_REQUIREMENTS:
            raise ValueError(f"Please provide at least {MIN_REQUIREMENTS} core requirements.")
        if len(cleaned_values) > MAX_REQUIREMENTS:
            raise ValueError(f"A maximum of {MAX_REQUIREMENTS} requirements is allowed.")
        return cleaned_values


class CoverLetterDocument(BaseModel):
    id: str
    job_title: str
    hiring_manager_name: str
    email: str
    phone: str
    company: str
    requirements: list[str]
    cover_letter: str
    created_at: datetime


class CoverLetterGenerateResponse(BaseModel):
    document_id: str = Field(..., description="Generated cover letter document identifier")
    cover_letter: str = Field(..., description="Generated cover letter text")
