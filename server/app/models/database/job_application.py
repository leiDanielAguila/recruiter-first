"""
Job Application database model for SQLAlchemy.

This module defines the JobApplication table structure with a foreign key
relationship to the User table for tracking job applications per user.
"""
from sqlalchemy import Column, String, DateTime, Text, ForeignKey, Index, ARRAY
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from app.core.database import Base


class JobApplication(Base):
    """
    JobApplication model for tracking user job applications.
    
    Attributes:
        id: Unique identifier (UUID)
        user_id: Foreign key to users table
        job: Job title
        company: Company name
        date: Application date
        status: Application status (Applied, Interviewing, Offer, Rejected, Replied, Withdrawn)
        description: Job description text
        hiring_manager_name: Name of hiring manager
        requirements: List of job requirements
        created_at: Record creation timestamp
        updated_at: Last modification timestamp
    """
    __tablename__ = "job_applications"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    job = Column(String(255), nullable=False)
    company = Column(String(255), nullable=False)
    date = Column(String(50), nullable=False)
    status = Column(String(50), nullable=False)
    description = Column(Text, nullable=False, default="")
    hiring_manager_name = Column(String(255), nullable=False, default="")
    requirements = Column(ARRAY(Text), nullable=False, default=list)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    user = relationship("User", backref="job_applications")
    
    __table_args__ = (
        Index('ix_job_applications_user_id_date', 'user_id', 'date'),
        Index('ix_job_applications_user_id_status', 'user_id', 'status'),
    )
    
    def __repr__(self):
        return f"<JobApplication(id={self.id}, user_id={self.user_id}, job={self.job}, company={self.company})>"
