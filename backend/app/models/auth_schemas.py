import re
from typing import Optional
from pydantic import BaseModel, Field, field_validator

EMAIL_REGEX = re.compile(r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$')

def validate_email_str(value: str) -> str:
    cleaned = value.strip()
    if not EMAIL_REGEX.match(cleaned):
        raise ValueError("Invalid email format. Please provide a valid email address.")
    return cleaned.lower()

class UserRegisterRequest(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100, description="Full name of user")
    email: str = Field(..., min_length=5, max_length=255, description="Valid unique email address")
    password: str = Field(..., min_length=8, max_length=128, description="Password (at least 8 chars)")
    confirm_password: Optional[str] = Field(default=None, description="Confirm password matching password")
    phone: Optional[str] = Field(default=None, max_length=20, description="Optional contact number")

    @field_validator('email')
    @classmethod
    def check_email(cls, v: str) -> str:
        return validate_email_str(v)

class UserLoginRequest(BaseModel):
    email_or_username: str = Field(..., min_length=3, description="Email address or username")
    password: str = Field(..., min_length=1, description="Account password")
    remember_me: bool = Field(default=False, description="Extend session duration to 7 days")

class ForgotPasswordRequest(BaseModel):
    email: str = Field(..., min_length=5, max_length=255, description="Registered account email")

    @field_validator('email')
    @classmethod
    def check_email(cls, v: str) -> str:
        return validate_email_str(v)

class ResetPasswordRequest(BaseModel):
    token: str = Field(..., min_length=10, description="Cryptographic reset token")
    new_password: str = Field(..., min_length=8, max_length=128, description="New account password")
    confirm_password: Optional[str] = Field(default=None, description="Confirm new password")

class UpdateProfileRequest(BaseModel):
    full_name: Optional[str] = Field(default=None, min_length=2, max_length=100)
    phone: Optional[str] = Field(default=None, max_length=20)

class ChangePasswordRequest(BaseModel):
    old_password: str = Field(..., min_length=1)
    new_password: str = Field(..., min_length=8, max_length=128)
    confirm_password: Optional[str] = Field(default=None)

class UserResponse(BaseModel):
    id: str
    full_name: str
    email: str
    phone: Optional[str] = None
    created_at: str

class AuthResponse(BaseModel):
    user: UserResponse
    token: str
    token_type: str = "Bearer"
    expires_in_hours: int

class MessageResponse(BaseModel):
    status: str = "success"
    message: str
    token: Optional[str] = None
    expires_in_minutes: Optional[int] = None
