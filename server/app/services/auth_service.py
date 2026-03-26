"""
Authentication service containing business logic for user registration and login.

This module handles user creation, authentication, and token generation
while maintaining separation from route handlers.
"""
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status
from app.models.database.user import User
from app.models.auth import SignUpRequest, SignInRequest, UserResponse, TokenResponse
from app.utils.security import hash_password, verify_password, create_access_token


def create_user(db: Session, signup_data: SignUpRequest) -> User:
    """
    Create a new user account.
    
    Args:
        db: Database session
        signup_data: User registration data
    
    Returns:
        User: Created user object
    
    Raises:
        HTTPException: If email already exists or database error occurs
    """
    existing_user = db.query(User).filter(User.email == signup_data.email.lower()).first()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email address already exists. Please sign in or use a different email."
        )
    
    hashed_pwd = hash_password(signup_data.password)
    
    new_user = User(
        email=signup_data.email.lower(),
        first_name=signup_data.first_name,
        last_name=signup_data.last_name,
        hashed_password=hashed_pwd,
        is_active=True
    )
    
    try:
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return new_user
    
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Unable to create account. This email may already be in use."
        )
    
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while creating your account. Please try again later."
        )


def authenticate_user(db: Session, signin_data: SignInRequest) -> User:
    """
    Authenticate a user with email and password.
    
    Args:
        db: Database session
        signin_data: User login credentials
    
    Returns:
        User: Authenticated user object
    
    Raises:
        HTTPException: If credentials are invalid
    """
    user = db.query(User).filter(User.email == signin_data.email.lower()).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password. Please check your credentials and try again."
        )
    
    if not verify_password(signin_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password. Please check your credentials and try again."
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been deactivated. Please contact support for assistance."
        )
    
    return user


def generate_token_response(user: User) -> TokenResponse:
    """
    Generate JWT token response for authenticated user.
    
    Args:
        user: Authenticated user object
    
    Returns:
        TokenResponse: Token and user information
    """
    access_token = create_access_token(data={"sub": str(user.id)})
    
    user_response = UserResponse(
        id=user.id,
        email=user.email,
        first_name=user.first_name,
        last_name=user.last_name,
        is_active=user.is_active,
        created_at=user.created_at
    )
    
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=user_response
    )


def get_user_by_id(db: Session, user_id: str) -> User:
    """
    Retrieve user by ID.
    
    Args:
        db: Database session
        user_id: User's UUID
    
    Returns:
        User: User object
    
    Raises:
        HTTPException: If user not found
    """
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found."
        )
    
    return user
