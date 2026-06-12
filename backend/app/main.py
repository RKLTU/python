"""
main.py
-------
The entry point for the FastAPI application.

This file:
1. Creates the FastAPI app instance.
2. Sets up CORS (so the React frontend can call this backend).
3. Includes the auth and profile routers.
4. Defines the /health endpoint.
5. Starts the server when run directly.

WHAT IS FASTAPI?
- FastAPI is a modern Python web framework for building APIs.
- It automatically generates interactive API docs at /docs (Swagger UI).
- It uses Python type hints for validation and documentation.

WHAT IS CORS?
- CORS stands for Cross-Origin Resource Sharing.
- Browsers block requests from one domain (localhost:5173) to another (localhost:8000)
  unless the server explicitly allows it.
- We configure CORS to allow our React frontend to talk to this backend.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import FRONTEND_ORIGIN
from .auth import router as auth_router
from .profile import router as profile_router

# ============================================================
# CREATE THE FASTAPI APP
# ============================================================
# The title appears in the auto-generated docs at /docs
app = FastAPI(
    title="Nyurveda Backend",
    description="A minimal FastAPI backend for learning backend development with Supabase.",
    version="1.0.0"
)

# ============================================================
# CORS MIDDLEWARE
# ============================================================
# Allow the React frontend (running on localhost:5173) to call this backend.
# Without this, the browser will block the requests.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_ORIGIN],   # Which frontend URLs can call this API
    allow_credentials=True,            # Allow cookies/auth headers
    allow_methods=["*"],               # Allow all HTTP methods (GET, POST, PUT, etc.)
    allow_headers=["*"],               # Allow all headers (including Authorization)
)

# ============================================================
# INCLUDE ROUTERS
# ============================================================
# This registers the auth routes (/auth/signup, /auth/login)
# and profile routes (/profile/{user_id}) with the app.
app.include_router(auth_router)
app.include_router(profile_router)


# ============================================================
# HEALTH CHECK ENDPOINT
# ============================================================
@app.get("/health", tags=["Health"])
def health_check():
    """
    GET /health
    -----------
    A simple endpoint to check if the backend is running.
    Returns {"status": "ok"} if the server is up.

    This is commonly used by:
    - Load balancers to check if the server is healthy.
    - Monitoring tools to track uptime.
    - Developers to quickly verify the server is running.
    """
    return {"status": "ok"}


# ============================================================
# RUN THE SERVER
# ============================================================
# This block only runs when you execute: python main.py
# In production, you'd use: uvicorn app.main:app --host 0.0.0.0 --port 8000
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)