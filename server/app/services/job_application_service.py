"""
Job application service layer for business logic.

This module handles CRUD operations for job applications with proper
error handling and database transaction management.
"""
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from fastapi import HTTPException, status
from uuid import UUID
from typing import List
from app.models.database.job_application import JobApplication
from app.models.job_application import (
    JobApplicationCreate,
    JobApplicationUpdate,
    MAX_REQUIREMENTS,
)
from app.services.resume_service import generate_job_requirements_from_description


def _normalize_requirement(value: str) -> str:
    return " ".join(value.split()).strip()


def _dedupe_requirements(values: List[str], max_items: int = MAX_REQUIREMENTS) -> List[str]:
    deduped: List[str] = []
    seen: set[str] = set()

    for value in values:
        normalized = _normalize_requirement(value)
        if not normalized:
            continue
        key = normalized.lower()
        if key in seen:
            continue
        seen.add(key)
        deduped.append(normalized)
        if len(deduped) >= max_items:
            break

    return deduped


def _merge_manual_and_ai_requirements(
    manual_requirements: List[str],
    ai_requirements: List[str],
    max_items: int = MAX_REQUIREMENTS,
) -> List[str]:
    merged = _dedupe_requirements(manual_requirements, max_items=max_items)
    if len(merged) >= max_items:
        return merged

    seen = {item.lower() for item in merged}
    for value in ai_requirements:
        normalized = _normalize_requirement(value)
        if not normalized:
            continue
        key = normalized.lower()
        if key in seen:
            continue
        seen.add(key)
        merged.append(normalized)
        if len(merged) >= max_items:
            break

    return merged


async def create_job_application(
    db: Session,
    user_id: UUID,
    application_data: JobApplicationCreate
) -> JobApplication:
    """
    Create a new job application for a user.
    
    Args:
        db: Database session
        user_id: UUID of the user creating the application
        application_data: Job application data
        
    Returns:
        Created JobApplication instance
        
    Raises:
        HTTPException: If database operation fails
    """
    description = application_data.description.strip()
    if not description:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Job description is required.",
        )

    manual_requirements = _dedupe_requirements(application_data.requirements)

    if len(manual_requirements) >= MAX_REQUIREMENTS:
        final_requirements = manual_requirements
    else:
        try:
            ai_response = await generate_job_requirements_from_description(
                description,
                max_requirements=MAX_REQUIREMENTS,
            )
        except ValueError as error:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(error),
            ) from error
        except RuntimeError as error:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Unable to generate job requirements at the moment. Please try again.",
            ) from error

        final_requirements = _merge_manual_and_ai_requirements(
            manual_requirements=manual_requirements,
            ai_requirements=ai_response.requirements,
            max_items=MAX_REQUIREMENTS,
        )

    try:
        db_application = JobApplication(
            user_id=user_id,
            job=application_data.job,
            company=application_data.company,
            date=application_data.date,
            status=application_data.status,
            description=description,
            hiring_manager_name=application_data.hiring_manager_name,
            requirements=final_requirements,
        )
        db.add(db_application)
        db.commit()
        db.refresh(db_application)
        return db_application
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create job application. Please try again."
        )


def get_user_job_applications(
    db: Session,
    user_id: UUID,
    skip: int = 0,
    limit: int = 100
) -> tuple[List[JobApplication], int]:
    """
    Retrieve all job applications for a specific user with pagination.
    
    Args:
        db: Database session
        user_id: UUID of the user
        skip: Number of records to skip (for pagination)
        limit: Maximum number of records to return
        
    Returns:
        Tuple of (list of applications, total count)
        
    Raises:
        HTTPException: If database operation fails
    """
    try:
        total = db.query(JobApplication).filter(
            JobApplication.user_id == user_id
        ).count()
        
        applications = db.query(JobApplication).filter(
            JobApplication.user_id == user_id
        ).order_by(
            JobApplication.date.desc(),
            JobApplication.created_at.desc()
        ).offset(skip).limit(limit).all()
        
        return applications, total
    except SQLAlchemyError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve job applications. Please try again."
        )


def get_job_application_by_id(
    db: Session,
    application_id: UUID,
    user_id: UUID
) -> JobApplication:
    """
    Retrieve a specific job application by ID.
    
    Args:
        db: Database session
        application_id: UUID of the application
        user_id: UUID of the user (for authorization)
        
    Returns:
        JobApplication instance
        
    Raises:
        HTTPException: If application not found or unauthorized
    """
    try:
        application = db.query(JobApplication).filter(
            JobApplication.id == application_id,
            JobApplication.user_id == user_id
        ).first()
        
        if not application:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Job application not found or you don't have permission to access it."
            )
        
        return application
    except HTTPException:
        raise
    except SQLAlchemyError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve job application. Please try again."
        )


def update_job_application(
    db: Session,
    application_id: UUID,
    user_id: UUID,
    update_data: JobApplicationUpdate
) -> JobApplication:
    """
    Update an existing job application.
    
    Args:
        db: Database session
        application_id: UUID of the application to update
        user_id: UUID of the user (for authorization)
        update_data: Fields to update
        
    Returns:
        Updated JobApplication instance
        
    Raises:
        HTTPException: If application not found or update fails
    """
    try:
        application = get_job_application_by_id(db, application_id, user_id)
        
        update_dict = update_data.model_dump(exclude_unset=True)
        
        for field, value in update_dict.items():
            setattr(application, field, value)
        
        db.commit()
        db.refresh(application)
        return application
    except HTTPException:
        raise
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update job application. Please try again."
        )


def delete_job_application(
    db: Session,
    application_id: UUID,
    user_id: UUID
) -> None:
    """
    Delete a job application.
    
    Args:
        db: Database session
        application_id: UUID of the application to delete
        user_id: UUID of the user (for authorization)
        
    Raises:
        HTTPException: If application not found or delete fails
    """
    try:
        application = get_job_application_by_id(db, application_id, user_id)
        db.delete(application)
        db.commit()
    except HTTPException:
        raise
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete job application. Please try again."
        )
