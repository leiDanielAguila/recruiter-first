"""
Job Application API routes.

This module defines endpoints for creating, retrieving, updating,
and deleting job applications with authentication.
"""
from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session
from uuid import UUID
from typing import cast
from app.core.database import get_db
from app.models.job_application import (
    JobApplicationCreate,
    JobApplicationUpdate,
    JobApplicationResponse,
    JobApplicationListResponse
)
from app.services import job_application_service
from app.utils.security import get_current_user
from app.models.database.user import User

router = APIRouter()


@router.post(
    "/job-applications",
    response_model=JobApplicationResponse,
    status_code=status.HTTP_201_CREATED
)
async def create_job_application(
    application_data: JobApplicationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new job application for the authenticated user.
    
    Args:
        application_data: Job application details
        db: Database session
        current_user: Authenticated user
        
    Returns:
        Created job application with generated ID and timestamps
    """
    user_id = cast(UUID, current_user.id)
    return await job_application_service.create_job_application(
        db=db,
        user_id=user_id,
        application_data=application_data
    )


@router.get(
    "/job-applications",
    response_model=JobApplicationListResponse
)
async def get_job_applications(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=100, description="Maximum number of records to return"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve all job applications for the authenticated user.
    
    Args:
        skip: Number of records to skip (for pagination)
        limit: Maximum number of records to return
        db: Database session
        current_user: Authenticated user
        
    Returns:
        List of job applications with total count
    """
    user_id = cast(UUID, current_user.id)
    applications, total = job_application_service.get_user_job_applications(
        db=db,
        user_id=user_id,
        skip=skip,
        limit=limit
    )
    response_applications = [
        JobApplicationResponse.model_validate(application)
        for application in applications
    ]
    return JobApplicationListResponse(applications=response_applications, total=total)


@router.get(
    "/job-applications/{application_id}",
    response_model=JobApplicationResponse
)
async def get_job_application(
    application_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve a specific job application by ID.
    
    Args:
        application_id: UUID of the job application
        db: Database session
        current_user: Authenticated user
        
    Returns:
        Job application details
        
    Raises:
        404: If application not found or user doesn't have access
    """
    user_id = cast(UUID, current_user.id)
    return job_application_service.get_job_application_by_id(
        db=db,
        application_id=application_id,
        user_id=user_id
    )


@router.patch(
    "/job-applications/{application_id}",
    response_model=JobApplicationResponse
)
async def update_job_application(
    application_id: UUID,
    update_data: JobApplicationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update an existing job application.
    
    Args:
        application_id: UUID of the job application
        update_data: Fields to update (only provided fields will be changed)
        db: Database session
        current_user: Authenticated user
        
    Returns:
        Updated job application
        
    Raises:
        404: If application not found or user doesn't have access
    """
    user_id = cast(UUID, current_user.id)
    return job_application_service.update_job_application(
        db=db,
        application_id=application_id,
        user_id=user_id,
        update_data=update_data
    )


@router.delete(
    "/job-applications/{application_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
async def delete_job_application(
    application_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a job application.
    
    Args:
        application_id: UUID of the job application
        db: Database session
        current_user: Authenticated user
        
    Raises:
        404: If application not found or user doesn't have access
    """
    user_id = cast(UUID, current_user.id)
    job_application_service.delete_job_application(
        db=db,
        application_id=application_id,
        user_id=user_id
    )
    return None
