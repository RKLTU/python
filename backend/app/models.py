from typing import Optional
from pydantic import BaseModel, EmailStr, Field


class SignupRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)


class ProfileUpdateRequest(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    lifestyle: Optional[str] = None
    concerns: Optional[str] = None
    has_health_problem: Optional[str] = None
    concern_description: Optional[str] = None


class ProfileResponse(BaseModel):
    id: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    lifestyle: Optional[str] = None
    concerns: Optional[str] = None
    has_health_problem: Optional[str] = None
    concern_description: Optional[str] = None