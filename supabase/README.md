# Nyurveda MVP — Supabase Backend Setup Guide

A minimal, backend-only system using **Supabase only** (Auth + Database + SQL Triggers + RLS).  
No external backend server. No Python. No Express. No FastAPI.

---

## Prerequisites

1. Create a free [Supabase](https://supabase.com/) account.
2. Create a new Supabase project (remember your database password).
3. Wait for the project to finish provisioning (~2 minutes).

---

## Setup Steps

### Step 1 — Open the SQL Editor

1. In your Supabase dashboard, click **SQL Editor** in the left sidebar.
2. Click **New query**.

### Step 2 — Run the Migration

1. Open the file `migrations/001_create_profiles_and_trigger.sql`.
2. Copy **all** of its contents.
3. Paste into the Supabase SQL Editor.
4. Click **Run** (or press `Ctrl+Enter`).

You should see **Success. No rows returned** for each statement.

> **Note:** If you get an error about the table already existing, the migration was already applied.  
> You can safely skip or drop the table first with `DROP TABLE IF EXISTS public."Profiles";`.

---

## What Was Created

| Object | Type | Description |
|---|---|---|
| `Profiles` | Table | Stores user profile data (linked to `auth.users`) |
| `handle_new_user()` | Function | Inserts a profile row when a new user signs up |
| `on_auth_user_created` | Trigger | Fires `handle_new_user()` after INSERT on `auth.users` |
| RLS on `Profiles` | Security | Users can only view/update their own profile |

---

## System Flow

```
┌─────────────────────────────┐
│   User signs up via          │
│   Supabase Auth              │
│   (email + password)         │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│   Supabase Auth creates      │
│   a row in auth.users        │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│   Trigger "on_auth_user_     │
│   created" fires             │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│   Function "handle_new_user" │
│   inserts into Profiles:     │
│     • id   = new user's UUID │
│     • email = new user's     │
│               email          │
│     • all other fields NULL  │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│   RLS Policies enforce:      │
│   • SELECT → own row only    │
│   • UPDATE → own row only    │
└─────────────────────────────┘
```

---

## Testing Steps

### Test 1 — Create a New User

1. Go to **Authentication** → **Users** in the Supabase dashboard.
2. Click **Add user** → **Create new user**.
3. Enter an email (e.g. `test@example.com`) and a password (e.g. `Test1234!`).
4. Click **Create user**.

### Test 2 — Verify User in `auth.users`

1. Go to **Table Editor** → `auth.users` (or run in SQL Editor):

```sql
SELECT id, email, created_at FROM auth.users;
```

You should see the newly created user.

### Test 3 — Verify Profile Was Auto-Created

Run this in the SQL Editor:

```sql
SELECT * FROM public."Profiles";
```

You should see a row with:
- `id` = the same UUID as in `auth.users`
- `email` = the same email
- All other fields = `NULL`

### Test 4 — Verify RLS Works

RLS blocks anonymous / unauthenticated queries by default. To verify:

```sql
-- This returns 0 rows when run as an unauthenticated user
-- because RLS blocks access (no auth.uid() match).
SELECT * FROM public."Profiles";
```

When you query as an authenticated user (e.g. from a client app with a valid JWT), they will see **only their own row**.

### Test 5 — Update Own Profile (as authenticated user)

From a client app with a valid Supabase session:

```javascript
// Example using supabase-js client
const { data, error } = await supabase
  .from('Profiles')
  .update({
    first_name: 'Jane',
    last_name: 'Doe',
    gender: 'female',
    lifestyle: 'active'
  })
  .eq('id', user.id)
  .select();
```

Only the authenticated user's own row can be updated.

---

## Final Outcome

| Requirement | Status |
|---|---|
| Supabase Auth (email/password signup & login) | ✅ |
| `Profiles` table with all columns | ✅ |
| Auto profile creation via trigger | ✅ |
| Trigger `on_auth_user_created` | ✅ |
| RLS: users view only their own profile | ✅ |
| RLS: users update only their own profile | ✅ |
| No external backend server | ✅ |

---

## File Structure

```
supabase/
├── migrations/
│   └── 001_create_profiles_and_trigger.sql   ← Run this in SQL Editor
└── README.md                                  ← You are here
```

---

## Notes

- The `password` column in `Profiles` is a **placeholder only**. Never store real passwords there. Supabase Auth handles authentication securely.
- The `handle_new_user()` function uses `SECURITY DEFINER` so it runs with the permissions of the function owner (the database superuser), bypassing RLS to insert the profile row.
- All other fields (`first_name`, `last_name`, `date_of_birth`, `gender`, `lifestyle`) start as `NULL` and are filled in by the user after signup via `UPDATE`.