"""
profile.py
----------
Profile routes: get and update user profiles.

These routes talk directly to the "profiles" table in Supabase.
The profiles table was set up with Row Level Security (RLS):
  - Users can only SELECT (read) their own row.
  - Users can only UPDATE their own row.

This means even if someone tries to access another user's profile,
Supabase RLS will block it automatically.
"""

from fastapi import APIRouter, HTTPException
from .models import ProfileUpdateRequest, ProfileResponse
from .supabase_client import supabase

# All routes here will be prefixed with /profile
router = APIRouter(prefix="/profile", tags=["Profile"])


@router.get("/{user_id}")
def get_profile(user_id: str):
    """
    GET /profile/{user_id}
    ----------------------
    Fetches a user's profile from the profiles table.

    The user_id in the URL must match the authenticated user's ID,
    because RLS only allows users to read their own profile.

    Returns the profile data as JSON.
    """

    # Query the profiles table for the row where id = user_id
    try:
        response = (
            supabase.table("profiles")
            .select("*")
            .eq("id", user_id)
            .execute()
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    # If no rows were returned, the profile doesn't exist
    if not response.data or len(response.data) == 0:
        raise HTTPException(status_code=404, detail="User not found")

    # Return the first (and only) matching profile
    profile = response.data[0]
    return profile


@router.put("/{user_id}")
def update_profile(user_id: str, data: ProfileUpdateRequest):
    """
    PUT /profile/{user_id}
    ----------------------
    Updates a user's profile in the profiles table.

    Only the fields the user sends will be updated.
    For example, if the user only sends {"first_name": "Jane"},
    only first_name changes — everything else stays the same.

    RLS ensures users can only update their own profile.
    """

    # Build a dict of only the fields that were actually sent
    # (exclude fields that are None / not provided)
    update_data = data.model_dump(exclude_none=True)

    # If the user didn't send any fields to update, return an error
    if not update_data:
        raise HTTPException(
            status_code=400,
            detail="No fields provided to update"
        )

    # Update the row in the profiles table where id = user_id
    try:
        response = (
            supabase.table("profiles")
            .update(update_data)
            .eq("id", user_id)
            .execute()
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    # If no rows were updated, the profile doesn't exist
    if not response.data or len(response.data) == 0:
        raise HTTPException(status_code=404, detail="User not found")

    # Return the updated profile
    return response.data[0]