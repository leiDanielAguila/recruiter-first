"""
User database model for SQLAlchemy.

This module defines the User table structure with proper security
and indexing for authentication purposes.
"""
from sqlalchemy import Column, String, Boolean, DateTime, Index
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid
from app.core.database import Base


class User(Base):
    """
    User model for authentication and user management.
    
    Attributes:
        id: Unique identifier (UUID)
        email: User's email address (unique, indexed)
        first_name: User's first name
        last_name: User's last name
        hashed_password: Bcrypt hashed password
        is_active: Account status flag
        created_at: Account creation timestamp
        updated_at: Last modification timestamp
    """
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    __table_args__ = (
        Index('ix_users_email_active', 'email', 'is_active'),
    )
    
    def __repr__(self):
        return f"<User(id={self.id}, email={self.email}, name={self.first_name} {self.last_name})>"
