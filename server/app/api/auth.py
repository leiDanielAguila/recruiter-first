"""
Authentication API routes.

This module defines endpoints for user registration, login, and
retrieving current user information.
"""
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.auth import SignUpRequest, SignInRequest, TokenResponse, UserResponse
from app.services import auth_service
from app.utils.security import get_current_user
from app.models.database.user import User

router = APIRouter()


@router.post("/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def signup(signup_data: SignUpRequest, db: Session = Depends(get_db)):
    """
    Register a new user account.
    
    Creates a new user with the provided information, hashes the password,
    and returns an authentication token.
    
    Args:
        signup_data: User registration information including first name, last name,
                     email, password, and password confirmation
        db: Database session (injected)
    
    Returns:
        TokenResponse: Authentication token and user information
    
    Raises:
        409 Conflict: If email already exists
        400 Bad Request: If validation fails (e.g., passwords don't match)
        500 Internal Server Error: If database error occurs
    """
    user = auth_service.create_user(db, signup_data)
    return auth_service.generate_token_response(user)


@router.post("/signin", response_model=TokenResponse)
async def signin(signin_data: SignInRequest, db: Session = Depends(get_db)):
    """
    Authenticate user and generate access token.
    
    Validates user credentials and returns an authentication token
    if credentials are correct.
    
    Args:
        signin_data: User login credentials (email and password)
        db: Database session (injected)
    
    Returns:
        TokenResponse: Authentication token and user information
    
    Raises:
        401 Unauthorized: If credentials are invalid
        403 Forbidden: If account is deactivated
    """
    user = auth_service.authenticate_user(db, signin_data)
    return auth_service.generate_token_response(user)


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """
    Get current authenticated user information.
    
    Returns information about the currently authenticated user based on
    the JWT token provided in the Authorization header.
    
    Args:
        current_user: Current authenticated user (injected from token)
    
    Returns:
        UserResponse: Current user information
    
    Raises:
        401 Unauthorized: If token is invalid or expired
        403 Forbidden: If account is deactivated
    """
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        first_name=current_user.first_name,
        last_name=current_user.last_name,
        is_active=current_user.is_active,
        created_at=current_user.created_at
    )
