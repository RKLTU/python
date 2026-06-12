"""
models.py
---------
Pydantic models define the SHAPE of data coming in and going out.

Why Pydantic?
- Automatic validation (e.g., email must be a valid email format).
- Automatic documentation in the Swagger UI at /docs.
- Type hints make code easier to read.

Think of these as "schemas" — they describe what JSON looks like.
"""

from pydantic import BaseModel, EmailStr
from typing import Optional


# ============================================================
# REQUEST MODELS — data the frontend SENDS to the backend
# ============================================================

class SignupRequest(BaseModel):
    """
    Data needed to create a new account.
    Sent to POST /auth/signup.
    """
    email: str
    password: str


class LoginRequest(BaseModel):
    """
    Data needed to log in.
    Sent to POST /auth/login.
    """
    email: str
    password: str


class ProfileUpdateRequest(BaseModel):
    """
    Data a user can update on their profile.
    Sent to PUT /profile/{user_id}.
    All fields are optional — user can update one or many.
    """
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    date_of_birth: Optional[str] = None   # Format: "YYYY-MM-DD"
    gender: Optional[str] = None
    lifestyle: Optional[str] = None


# ============================================================
# RESPONSE MODELS — data the backend SENDS BACK to the frontend
# ============================================================

class ProfileResponse(BaseModel):
    """
    The shape of a user profile returned by the API.
    Matches the 'profiles' table columns.
    """
    id: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    lifestyle: Optional[str] = None