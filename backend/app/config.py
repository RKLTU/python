import os
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL: str = os.getenv("SUPABASE_URL", "").strip().rstrip("/")
SUPABASE_ANON_KEY: str = os.getenv("SUPABASE_ANON_KEY", "").strip()

_raw_frontend_origins = os.getenv(
    "FRONTEND_ORIGINS",
    os.getenv("FRONTEND_ORIGIN", "http://localhost:5173"),
)

FRONTEND_ORIGINS: list[str] = [
    origin.strip().rstrip("/")
    for origin in _raw_frontend_origins.split(",")
    if origin.strip()
]

if not SUPABASE_URL:
    raise RuntimeError("Missing SUPABASE_URL environment variable")

if not SUPABASE_ANON_KEY:
    raise RuntimeError("Missing SUPABASE_ANON_KEY environment variable")