-- ============================================================
-- Nyurveda MVP — Supabase Backend Setup
-- Run this entire script in the Supabase SQL Editor.
-- ============================================================

-- =======================
-- 1. PROFILES TABLE
-- =======================
CREATE TABLE public."Profiles" (
    id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    first_name    TEXT,
    last_name     TEXT,
    email         TEXT,
    password      TEXT,       -- ⚠️ NOT used for auth. Supabase Auth handles authentication.
    date_of_birth DATE,
    gender        TEXT,
    lifestyle     TEXT
);

COMMENT ON TABLE  public."Profiles"            IS 'User profile information. Auth is handled entirely by Supabase Auth.';
COMMENT ON COLUMN public."Profiles".password   IS 'Placeholder only. DO NOT store real passwords here — Supabase Auth handles auth.';

-- =======================
-- 2. TRIGGER FUNCTION
-- =======================
-- When a new user signs up via Supabase Auth, a row is
-- automatically inserted into Profiles (id + email only).
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
    INSERT INTO public."Profiles" (id, email)
    VALUES (NEW.id, NEW.email);
    RETURN NEW;
END;
$$;

-- =======================
-- 3. TRIGGER
-- =======================
-- Fires after every INSERT on auth.users
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- =======================
-- 4. ROW LEVEL SECURITY
-- =======================
ALTER TABLE public."Profiles" ENABLE ROW LEVEL SECURITY;

-- Policy: Users can SELECT (view) only their own profile
CREATE POLICY "Users can view own profile"
    ON public."Profiles"
    FOR SELECT
    USING (auth.uid() = id);

-- Policy: Users can UPDATE only their own profile
CREATE POLICY "Users can update own profile"
    ON public."Profiles"
    FOR UPDATE
    USING (auth.uid() = id);