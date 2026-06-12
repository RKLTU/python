import json
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from fastapi import HTTPException
from .config import SUPABASE_URL, SUPABASE_ANON_KEY

REST_URL = f"{SUPABASE_URL}/rest/v1"


def _headers(access_token: str, prefer: str | None = None) -> dict[str, str]:
    headers = {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json",
        "Accept": "application/json",
    }

    if prefer:
        headers["Prefer"] = prefer

    return headers


def _parse_error(error: HTTPError) -> str:
    body = error.read().decode("utf-8", errors="replace")
    try:
        parsed = json.loads(body)
        return parsed.get("message") or parsed.get("error") or body
    except Exception:
        return body or error.reason


def _request(method: str, url: str, access_token: str, body: dict[str, Any] | None = None) -> Any:
    data = None
    prefer = None

    if body is not None:
        data = json.dumps(body).encode("utf-8")
        prefer = "return=representation"

    request = Request(
        url=url,
        data=data,
        method=method,
        headers=_headers(access_token, prefer=prefer),
    )

    try:
        with urlopen(request, timeout=20) as response:
            response_body = response.read().decode("utf-8")
            if not response_body:
                return None
            return json.loads(response_body)
    except HTTPError as e:
        raise HTTPException(status_code=e.code, detail=_parse_error(e))
    except URLError as e:
        raise HTTPException(status_code=502, detail=f"Could not connect to Supabase: {e.reason}")


def select_profile(user_id: str, access_token: str) -> list[dict[str, Any]]:
    query = urlencode({
        "id": f"eq.{user_id}",
        "select": "*",
    })
    return _request("GET", f"{REST_URL}/profiles?{query}", access_token) or []


def update_profile(user_id: str, access_token: str, updates: dict[str, Any]) -> list[dict[str, Any]]:
    query = urlencode({"id": f"eq.{user_id}"})
    return _request("PATCH", f"{REST_URL}/profiles?{query}", access_token, body=updates) or []