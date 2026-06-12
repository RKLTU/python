"""
config.py
---------
Loads environment variables from the .env file using python-dotenv.

Why a separate config file?
- Keeps all configuration in one place.
- Easy to change settings without touching application code.
"""

import os
from dotenv import load_dotenv

# Load variables from the .env file in the backend/ directory
load_dotenv()

# Supabase credentials — found in Supabase dashboard → Settings → API
SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
SUPABASE_ANON_KEY: str = os.getenv("SUPABASE_ANON_KEY", "")

# The frontend URL that is allowed to call this backend (CORS)
FRONTEND_ORIGIN: str = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")