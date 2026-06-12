"""
auth.py
-------
Authentication routes: signup and login.

KEY CONCEPT — Why auth.users and profiles are separate:
------------------------------------------------------
Supabase Auth manages a table called auth.users automatically.
This table stores sensitive authentication data (hashed passwords, email confirmations, etc.)
You should NEVER touch auth.users directly.

Instead, we have a separate "profiles" table for user information (name, birthday, etc.).
When a new user signs up, a DATABASE TRIGGER automatically creates a row in profiles.
This is handled by the PostgreSQL trigger "on_auth_user_created" → function "handle_new_user()".

So the flow is:
  1. User sends email + password to POST /auth/signup
  2. supabase.auth.sign_up() creates a record in auth.users
  3. The database trigger fires and inserts a row into profiles (id + email only)
  4. We return success — we do NOT manually insert into profiles
"""

from fastapi import APIRouter, HTTPException
from .models import SignupRequest, LoginRequest
from .supabase_client import supabase

# APIRouter groups related routes together.
# main.py will include this router with a prefix like /auth.
router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/signup")
def signup(data: SignupRequest):
    """
    POST /auth/signup
    -----------------
    Creates a new user account using Supabase Auth.

    What happens behind the scenes:
    1. Supabase Auth validates the email and password.
    2. A new row is created in auth.users.
    3. A database trigger automatically creates a matching row in profiles.
    4. We return the new user's ID and email.

    We do NOT insert into profiles manually — the trigger handles it.
    """

    # Call Supabase Auth to create the user
    try:
        response = supabase.auth.sign_up({
            "email": data.email,
            "password": data.password
        })
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    # Check if Supabase returned a user object
    if response.user is None:
        raise HTTPException(status_code=400, detail="Signup failed. Please try again.")

    # The database trigger already created the profile row.
    # We just return success info.
    return {
        "message": "User created successfully",
        "user_id": response.user.id,
        "email": response.user.email
    }


@router.post("/login")
def login(data: LoginRequest):
    """
    POST /auth/login
    ----------------
    Logs in an existing user using Supabase Auth.

    Supabase Auth checks:
    1. Does this email exist in auth.users?
    2. Does the password match the stored hash?

    If both pass, Supabase returns:
    - access_token (JWT) — the frontend sends this with future requests
    - refresh_token — used to get a new access_token when it expires
    - expires_in — how long the access_token is valid (in seconds)
    - user info (id, email)
    """

    # Call Supabase Auth to sign in
    try:
        response = supabase.auth.sign_in_with_password({
            "email": data.email,
            "password": data.password
        })
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # Check if login succeeded
    if response.user is None or response.session is None:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # Return tokens and user info to the frontend
    return {
        "access_token": response.session.access_token,
        "refresh_token": response.session.refresh_token,
        "expires_in": response.session.expires_in,
        "token_type": "bearer",
        "user": {
            "id": response.user.id,
            "email": response.user.email
        }
    }