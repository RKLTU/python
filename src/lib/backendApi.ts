/**
 * backendApi.ts
 * -------------
 * Frontend helper functions that call the FastAPI backend.
 *
 * These functions use the native fetch() API — no extra libraries needed.
 * The backend runs on http://localhost:8000.
 *
 * Usage in a React component:
 *   import { signup, login, getProfile, updateProfile } from "@/lib/backendApi";
 */

const API_BASE = "http://localhost:8000";


// ============================================================
// TYPES
// ============================================================

/** Response from POST /auth/signup */
interface SignupResponse {
  message: string;
  user_id: string;
  email: string;
}

/** Response from POST /auth/login */
interface LoginResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  user: {
    id: string;
    email: string;
  };
}

/** Shape of a user profile (matches the profiles table) */
interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  date_of_birth: string | null;
  gender: string | null;
  lifestyle: string | null;
}

/** Fields that can be updated on a profile */
interface ProfileUpdate {
  first_name?: string;
  last_name?: string;
  date_of_birth?: string;
  gender?: string;
  lifestyle?: string;
}


// ============================================================
// HELPER: generic fetch wrapper
// ============================================================

/**
 * A small wrapper around fetch() that:
 * 1. Sets the Content-Type header.
 * 2. Parses the JSON response.
 * 3. Throws an error if the response is not OK.
 */
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    // The backend returns { "error": "message" } on errors
    throw new Error(data.error || data.detail || "Something went wrong");
  }

  return data as T;
}


// ============================================================
// AUTH FUNCTIONS
// ============================================================

/**
 * Sign up a new user.
 * Calls POST /auth/signup.
 *
 * The backend uses supabase.auth.sign_up() — it does NOT
 * create a profile row manually. The database trigger handles that.
 */
export async function signup(
  email: string,
  password: string
): Promise<SignupResponse> {
  return apiFetch<SignupResponse>("/auth/signup", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

/**
 * Log in an existing user.
 * Calls POST /auth/login.
 *
 * Returns access_token, refresh_token, and user info.
 * Store the access_token to use in authenticated requests.
 */
export async function login(
  email: string,
  password: string
): Promise<LoginResponse> {
  return apiFetch<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}


// ============================================================
// PROFILE FUNCTIONS
// ============================================================

/**
 * Get a user's profile by ID.
 * Calls GET /profile/{user_id}.
 */
export async function getProfile(userId: string): Promise<Profile> {
  return apiFetch<Profile>(`/profile/${userId}`);
}

/**
 * Update a user's profile.
 * Calls PUT /profile/{user_id}.
 *
 * Only the fields you pass will be updated.
 * Example: updateProfile("abc-123", { first_name: "Jane" })
 */
export async function updateProfile(
  userId: string,
  updates: ProfileUpdate
): Promise<Profile> {
  return apiFetch<Profile>(`/profile/${userId}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  });
}