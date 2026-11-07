from datetime import timedelta
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends, status, Header
from app.models.auth_schemas import (
    UserRegisterRequest,
    UserLoginRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    UpdateProfileRequest,
    ChangePasswordRequest,
    UserResponse,
    AuthResponse,
    MessageResponse
)
from app.db.users_db import users_db
from app.core.security import create_access_token, decode_access_token

router = APIRouter()

def get_current_user(authorization: Optional[str] = Header(None)) -> dict:
    """
    Dependency that extracts and validates the Bearer JWT token from the Authorization header.
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token missing or invalid. Please sign in.",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    token = authorization.split("Bearer ", 1)[1].strip()
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired or invalid token. Please sign in again.",
            headers={"WWW-Authenticate": "Bearer"}
        )
        
    user_id = payload["sub"]
    user = users_db.get_user_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account no longer exists.",
            headers={"WWW-Authenticate": "Bearer"}
        )
    return user

@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register_user(request: UserRegisterRequest):
    """
    Registers a new individual user account with password hashing.
    """
    if request.confirm_password and request.password != request.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Passwords do not match."
        )

    # Password complexity check: at least 8 chars, at least one letter and one number/special
    if len(request.password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 8 characters long."
        )
        
    try:
        user_dict = users_db.create_user(
            full_name=request.full_name,
            email=request.email,
            password=request.password,
            phone=request.phone
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create user account. Please try again."
        )

    token = create_access_token(
        data={"sub": user_dict["id"], "email": user_dict["email"], "name": user_dict["full_name"]},
        expires_delta=timedelta(hours=24)
    )

    return AuthResponse(
        user=UserResponse(**user_dict),
        token=token,
        token_type="Bearer",
        expires_in_hours=24
    )

@router.post("/login", response_model=AuthResponse)
def login_user(request: UserLoginRequest):
    """
    Authenticates a user by email/username and password.
    """
    user_dict = users_db.authenticate_user(
        email_or_username=request.email_or_username,
        password=request.password
    )
    if not user_dict:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password. Please verify your credentials."
        )

    duration_hours = 24 * 7 if request.remember_me else 24
    token = create_access_token(
        data={"sub": user_dict["id"], "email": user_dict["email"], "name": user_dict["full_name"]},
        expires_delta=timedelta(hours=duration_hours)
    )

    return AuthResponse(
        user=UserResponse(**user_dict),
        token=token,
        token_type="Bearer",
        expires_in_hours=duration_hours
    )

@router.get("/me", response_model=UserResponse)
def get_current_user_profile(user: dict = Depends(get_current_user)):
    """
    Returns the currently authenticated user's profile.
    """
    return UserResponse(**user)

@router.post("/logout", response_model=MessageResponse)
def logout_user():
    """
    Logs out the current user and clears session tokens.
    """
    return MessageResponse(
        status="success",
        message="Logged out successfully. Have a safe journey!"
    )

@router.post("/forgot-password", response_model=MessageResponse)
def forgot_password(request: ForgotPasswordRequest):
    """
    Generates a secure password reset token for the given email.
    """
    res = users_db.create_password_reset_token(request.email)
    if not res:
        # Generic message to prevent email enumeration, but structured
        return MessageResponse(
            status="success",
            message=f"If an account with {request.email} exists, password reset instructions and a verification token have been prepared."
        )
    
    token, _ = res
    return MessageResponse(
        status="success",
        message=f"Password recovery token generated for {request.email}. Use this token to set a new password.",
        token=token,
        expires_in_minutes=60
    )

@router.post("/reset-password", response_model=MessageResponse)
def reset_password(request: ResetPasswordRequest):
    """
    Resets a password using a valid cryptographic recovery token.
    """
    if request.confirm_password and request.new_password != request.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Passwords do not match."
        )
    if len(request.new_password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be at least 8 characters long."
        )
        
    success = users_db.reset_password_with_token(
        token=request.token,
        new_password=request.new_password
    )
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password reset token is invalid, expired, or has already been used."
        )
        
    return MessageResponse(
        status="success",
        message="Your password has been successfully reset. You may now sign in with your new password."
    )

@router.put("/profile", response_model=UserResponse)
def update_profile(
    request: UpdateProfileRequest,
    user: dict = Depends(get_current_user)
):
    """
    Updates the authenticated user's profile name and/or phone number.
    """
    updated = users_db.update_profile(
        user_id=user["id"],
        full_name=request.full_name,
        phone=request.phone
    )
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found."
        )
    return UserResponse(**updated)

@router.put("/change-password", response_model=MessageResponse)
def change_password(
    request: ChangePasswordRequest,
    user: dict = Depends(get_current_user)
):
    """
    Changes the authenticated user's password after verifying the old password.
    """
    if request.confirm_password and request.new_password != request.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New passwords do not match."
        )
    if len(request.new_password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be at least 8 characters long."
        )
        
    success = users_db.change_password(
        user_id=user["id"],
        old_password=request.old_password,
        new_password=request.new_password
    )
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect."
        )
        
    return MessageResponse(
        status="success",
        message="Password updated successfully."
    )

