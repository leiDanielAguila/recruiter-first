"""
Authentication Pydantic schemas for request/response validation.

This module defines data transfer objects for authentication endpoints
including signup, signin, and user responses.
"""
from pydantic import BaseModel, EmailStr, Field, field_validator
from datetime import datetime
from typing import Optional
import uuid


class SignUpRequest(BaseModel):
    """
    Request schema for user registration.
    
    Attributes:
        first_name: User's first name (2-100 characters)
        last_name: User's last name (2-100 characters)
        email: Valid email address
        password: Password (minimum 8 characters)
        confirm_password: Password confirmation
    """
    first_name: str = Field(..., min_length=2, max_length=100, description="User's first name")
    last_name: str = Field(..., min_length=2, max_length=100, description="User's last name")
    email: EmailStr = Field(..., description="Valid email address")
    password: str = Field(..., min_length=8, description="Password (minimum 8 characters)")
    confirm_password: str = Field(..., description="Password confirmation must match password")
    
    @field_validator('confirm_password')
    @classmethod
    def passwords_match(cls, v, info):
        if 'password' in info.data and v != info.data['password']:
            raise ValueError('Passwords do not match')
        return v
    
    @field_validator('first_name', 'last_name')
    @classmethod
    def name_validation(cls, v):
        if not v.strip():
            raise ValueError('Name cannot be empty or only whitespace')
        return v.strip()
    
    @field_validator('password')
    @classmethod
    def password_strength(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if not any(c.isupper() for c in v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not any(c.islower() for c in v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not any(c.isdigit() for c in v):
            raise ValueError('Password must contain at least one number')
        return v


class SignInRequest(BaseModel):
    """
    Request schema for user login.
    
    Attributes:
        email: User's email address
        password: User's password
    """
    email: EmailStr = Field(..., description="User's email address")
    password: str = Field(..., description="User's password")


class UserResponse(BaseModel):
    """
    Response schema for user data (without sensitive information).
    
    Attributes:
        id: User's unique identifier
        email: User's email address
        first_name: User's first name
        last_name: User's last name
        is_active: Account active status
        created_at: Account creation timestamp
    """
    id: uuid.UUID
    email: str
    first_name: str
    last_name: str
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    """
    Response schema for authentication tokens.
    
    Attributes:
        access_token: JWT access token
        token_type: Token type (always "bearer")
        user: User information
    """
    access_token: str = Field(..., description="JWT access token")
    token_type: str = Field(default="bearer", description="Token type")
    user: UserResponse = Field(..., description="User information")


class TokenData(BaseModel):
    """
    Internal schema for token payload data.
    
    Attributes:
        user_id: User's unique identifier extracted from token
    """
    user_id: Optional[str] = None
