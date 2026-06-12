from typing import Optional
from fastapi import Header, HTTPException


def get_bearer_token(authorization: Optional[str] = Header(default=None)) -> str:
    if not authorization:
        raise HTTPException(
            status_code=401,
            detail="Missing Authorization header. Please log in again.",
        )

    scheme, _, token = authorization.partition(" ")

    if scheme.lower() != "bearer" or not token.strip():
        raise HTTPException(
            status_code=401,
            detail="Invalid Authorization header. Expected: Bearer <access_token>.",
        )

    return token.strip()