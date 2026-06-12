# Nyurveda — FastAPI Backend

A minimal FastAPI backend for learning backend development with Supabase.

This backend connects to your existing Supabase project (Auth + PostgreSQL).
It does NOT replace Supabase — it sits alongside it and provides a Python API layer.

---

## Architecture

```
React Frontend (localhost:5173)
        │
        │  HTTP requests (fetch)
        ▼
FastAPI Backend (localhost:8000)
        │
        │  Supabase Python SDK
        ▼
Supabase (cloud)
  ├── auth.users   → managed by Supabase Auth
  └── profiles     → managed by database trigger + this backend
```

---

## Setup

### 1. Create a virtual environment

```bash
cd backend
python -m venv .venv
```

### 2. Activate the virtual environment

**Windows:**
```bash
.venv\Scripts\activate
```

**macOS / Linux:**
```bash
source .venv/bin/activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Create your .env file

```bash
cp .env.example .env
```

Then edit `.env` and fill in your Supabase credentials:

```
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
FRONTEND_ORIGIN=http://localhost:5173
```

Find these values in: **Supabase Dashboard → Settings → API**

### 5. Run the server

```bash
uvicorn app.main:app --reload --port 8000
```

You should see:

```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
```

### 6. Open API docs

Visit [http://localhost:8000/docs](http://localhost:8000/docs) to see the interactive Swagger UI.

---

## API Endpoints

### GET /health

Check if the server is running.

**curl:**
```bash
curl http://localhost:8000/health
```

**Response:**
```json
{"status": "ok"}
```

---

### POST /auth/signup

Create a new user account.

**curl:**
```bash
curl -X POST http://localhost:8000/auth/signup ^
  -H "Content-Type: application/json" ^
  -d "{\"email\": \"john@example.com\", \"password\": \"Password123\"}"
```

**Linux/macOS:**
```bash
curl -X POST http://localhost:8000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email": "john@example.com", "password": "Password123"}'
```

**Response:**
```json
{
  "message": "User created successfully",
  "user_id": "abc-123-...",
  "email": "john@example.com"
}
```

> Note: The database trigger automatically creates a row in the profiles table.
> You do NOT need to create it manually.

---

### POST /auth/login

Log in and receive access tokens.

**curl:**
```bash
curl -X POST http://localhost:8000/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\": \"john@example.com\", \"password\": \"Password123\"}"
```

**Linux/macOS:**
```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "john@example.com", "password": "Password123"}'
```

**Response:**
```json
{
  "access_token": "eyJhbGci...",
  "refresh_token": "abc123...",
  "expires_in": 3600,
  "token_type": "bearer",
  "user": {
    "id": "abc-123-...",
    "email": "john@example.com"
  }
}
```

---

### GET /profile/{user_id}

Fetch a user's profile.

**curl:**
```bash
curl http://localhost:8000/profile/USER_ID_HERE
```

**Response:**
```json
{
  "id": "abc-123-...",
  "first_name": null,
  "last_name": null,
  "email": "john@example.com",
  "date_of_birth": null,
  "gender": null,
  "lifestyle": null
}
```

---

### PUT /profile/{user_id}

Update a user's profile.

**curl:**
```bash
curl -X PUT http://localhost:8000/profile/USER_ID_HERE ^
  -H "Content-Type: application/json" ^
  -d "{\"first_name\": \"John\", \"last_name\": \"Doe\", \"date_of_birth\": \"2001-01-01\", \"gender\": \"Male\", \"lifestyle\": \"Active\"}"
```

**Linux/macOS:**
```bash
curl -X PUT http://localhost:8000/profile/USER_ID_HERE \
  -H "Content-Type: application/json" \
  -d '{"first_name": "John", "last_name": "Doe", "date_of_birth": "2001-01-01", "gender": "Male", "lifestyle": "Active"}'
```

**Response:**
```json
{
  "id": "abc-123-...",
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "date_of_birth": "2001-01-01",
  "gender": "Male",
  "lifestyle": "Active"
}
```

---

## File Structure

```
backend/
├── app/
│   ├── main.py              ← Entry point (FastAPI app, CORS, routes)
│   ├── config.py            ← Loads .env variables
│   ├── models.py            ← Pydantic models (request/response schemas)
│   ├── supabase_client.py   ← Supabase client singleton
│   ├── auth.py              ← /auth/signup and /auth/login routes
│   └── profile.py           ← /profile/{user_id} routes
├── requirements.txt         ← Python dependencies
├── .env.example             ← Template for environment variables
└── README.md                ← You are here
```

---

## How the Trigger Works (No Manual Profile Creation)

```
1. User calls POST /auth/signup
2. supabase.auth.sign_up() creates a row in auth.users
3. PostgreSQL trigger "on_auth_user_created" fires automatically
4. Function "handle_new_user()" inserts (id, email) into profiles
5. Profile row exists — no Python code needed for this step
```

The trigger was set up in the SQL migration: `supabase/migrations/001_create_profiles_and_trigger.sql`

---

## Common Errors

| Error | Cause | Fix |
|---|---|---|
| `Missing SUPABASE_URL` | `.env` file not created or empty | Copy `.env.example` to `.env` and fill in values |
| `Invalid credentials` | Wrong email or password | Check the login details |
| `User not found` | Profile doesn't exist in profiles table | Ensure the signup trigger was created correctly |
| CORS error in browser | Frontend origin not allowed | Check `FRONTEND_ORIGIN` in `.env` |