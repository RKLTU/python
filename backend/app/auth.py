from fastapi import APIRouter, HTTPException
from .models import SignupRequest, LoginRequest
from .supabase_client import supabase

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/signup")
def signup(data: SignupRequest):
    try:
        response = supabase.auth.sign_up({
            "email": str(data.email),
            "password": data.password,
        })
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    if response.user is None:
        raise HTTPException(status_code=400, detail="Signup failed. Please try again.")

    result = {
        "message": "User created successfully",
        "user_id": response.user.id,
        "email": response.user.email,
    }

    if response.session is not None:
        result.update({
            "access_token": response.session.access_token,
            "refresh_token": response.session.refresh_token,
            "expires_in": response.session.expires_in,
            "token_type": "bearer",
        })
    else:
        result["message"] = "User created. Please confirm your email, then log in."

    return result


@router.post("/login")
def login(data: LoginRequest):
    try:
        response = supabase.auth.sign_in_with_password({
            "email": str(data.email),
            "password": data.password,
        })
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if response.user is None or response.session is None:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    return {
        "access_token": response.session.access_token,
        "refresh_token": response.session.refresh_token,
        "expires_in": response.session.expires_in,
        "token_type": "bearer",
        "user": {
            "id": response.user.id,
            "email": response.user.email,
        },
    }