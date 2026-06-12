"""
supabase_client.py
------------------
Initializes and exports a single Supabase client instance.

Why a singleton?
- We only need ONE Supabase client for the whole app.
- Every route that needs to talk to Supabase imports this same client.
"""

from supabase import create_client, Client
from .config import SUPABASE_URL, SUPABASE_ANON_KEY

# Create the Supabase client once at import time.
# This client uses the ANON key, which respects Row Level Security (RLS).
# It means the client can only do what the logged-in user is allowed to do.
supabase: Client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)