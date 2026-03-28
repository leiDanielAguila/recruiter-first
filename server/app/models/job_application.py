"""
Pydantic models for job application request and response validation.

This module defines the data schemas for job application operations
including creation, updates, and responses.
"""
from pydantic import BaseModel, Field, field_validator
from typing import List
from datetime import datetime
from uuid import UUID


MAX_REQUIREMENTS = 5


class JobApplicationBase(BaseModel):
    """Base schema with common job application fields"""
    job: str = Field(..., min_length=1, max_length=255, description="Job title")
    company: str = Field(..., min_length=1, max_length=255, description="Company name")
    date: str = Field(..., description="Application date in YYYY-MM-DD format")
    status: str = Field(..., description="Application status")
    description: str = Field(default="", description="Job description")
    hiring_manager_name: str = Field(default="", max_length=255, description="Hiring manager name")
    requirements: List[str] = Field(default_factory=list, description="List of job requirements")
    
    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        """Validate that status is one of the allowed values"""
        allowed_statuses = {"Applied", "Interviewing", "Offer", "Rejected", "Replied", "Withdrawn"}
        if v not in allowed_statuses:
            raise ValueError(f"Status must be one of: {', '.join(allowed_statuses)}")
        return v

    @field_validator("requirements")
    @classmethod
    def validate_requirements(cls, values: List[str]) -> List[str]:
        """Validate requirements count and normalize whitespace-only values"""
        cleaned_values = [value.strip() for value in values if value.strip()]
        if len(cleaned_values) > MAX_REQUIREMENTS:
            raise ValueError(f"A maximum of {MAX_REQUIREMENTS} requirements is allowed.")
        return cleaned_values


class JobApplicationCreate(JobApplicationBase):
    """
    Request schema for creating a new job application.
    Used when frontend sends POST request to create an application.
    """
    @field_validator("description")
    @classmethod
    def validate_required_description(cls, value: str) -> str:
        """Ensure description is provided for creation."""
        if not value.strip():
            raise ValueError("Job description is required.")
        return value


class JobApplicationUpdate(BaseModel):
    """
    Request schema for updating an existing job application.
    All fields are optional - only provided fields will be updated.
    """
    job: str | None = Field(None, min_length=1, max_length=255)
    company: str | None = Field(None, min_length=1, max_length=255)
    date: str | None = None
    status: str | None = None
    description: str | None = None
    hiring_manager_name: str | None = Field(None, max_length=255)
    requirements: List[str] | None = None
    
    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str | None) -> str | None:
        """Validate that status is one of the allowed values"""
        if v is None:
            return v
        allowed_statuses = {"Applied", "Interviewing", "Offer", "Rejected", "Replied", "Withdrawn"}
        if v not in allowed_statuses:
            raise ValueError(f"Status must be one of: {', '.join(allowed_statuses)}")
        return v

    @field_validator("requirements")
    @classmethod
    def validate_requirements(cls, values: List[str] | None) -> List[str] | None:
        """Validate optional requirements count and normalize whitespace-only values"""
        if values is None:
            return None
        cleaned_values = [value.strip() for value in values if value.strip()]
        if len(cleaned_values) > MAX_REQUIREMENTS:
            raise ValueError(f"A maximum of {MAX_REQUIREMENTS} requirements is allowed.")
        return cleaned_values

    @field_validator("description")
    @classmethod
    def validate_optional_description(cls, value: str | None) -> str | None:
        """Ensure provided update descriptions are not blank."""
        if value is None:
            return None
        if not value.strip():
            raise ValueError("Job description cannot be empty.")
        return value


class JobRequirementsResponse(BaseModel):
    """Response schema for AI-generated job requirements from a description."""
    requirements: List[str] = Field(default_factory=list, description="Generated job requirements")

    @field_validator("requirements")
    @classmethod
    def validate_requirements(cls, values: List[str]) -> List[str]:
        cleaned_values = [value.strip() for value in values if value.strip()]
        if len(cleaned_values) > MAX_REQUIREMENTS:
            raise ValueError(f"A maximum of {MAX_REQUIREMENTS} requirements is allowed.")
        return cleaned_values


class JobApplicationResponse(JobApplicationBase):
    """
    Response schema returned by the API when fetching job applications.
    Includes all job data plus database-generated fields (id, timestamps).
    Automatically converts SQLAlchemy models to JSON via from_attributes config.
    """
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime
    
    model_config = {"from_attributes": True}


class JobApplicationListResponse(BaseModel):
    """
    Response schema for list endpoint - returns multiple applications with total count.
    Used for pagination support in the frontend.
    """
    applications: List[JobApplicationResponse]
    total: int
