from fastapi import APIRouter, Depends, HTTPException
from .auth_token import get_bearer_token
from .models import ProfileUpdateRequest
from .supabase_rest import select_profile, update_profile as supabase_update_profile

router = APIRouter(prefix="/profile", tags=["Profile"])


@router.get("/{user_id}")
def get_profile(user_id: str, access_token: str = Depends(get_bearer_token)):
    profiles = select_profile(user_id, access_token)

    if not profiles:
        raise HTTPException(status_code=404, detail="User not found or access denied")

    return profiles[0]


@router.put("/{user_id}")
def update_profile(
    user_id: str,
    data: ProfileUpdateRequest,
    access_token: str = Depends(get_bearer_token),
):
    update_data = data.model_dump(exclude_none=True)

    if not update_data:
        raise HTTPException(status_code=400, detail="No fields provided to update")

    profiles = supabase_update_profile(user_id, access_token, update_data)

    if not profiles:
        raise HTTPException(status_code=404, detail="User not found or access denied")

    return profiles[0]