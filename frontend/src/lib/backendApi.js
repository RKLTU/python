/**
 * backendApi.js
 * -------------
 * Frontend helper functions that call the FastAPI backend at http://localhost:8000.
 * Uses the native fetch() API — no extra libraries needed.
 */

// Use environment variable for API URL, fallback to localhost for development
// In Vercel, set VITE_API_URL environment variable to your backend URL
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

/**
 * Generic fetch wrapper that handles JSON parsing and errors.
 */
async function apiFetch(endpoint, options = {}) {
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
    throw new Error(data.detail || data.error || "Something went wrong");
  }

  return data;
}

// ============================================================
// AUTH
// ============================================================

/**
 * Sign up a new user via the backend.
 * Backend calls Supabase Auth REST API.
 * Database trigger auto-creates the profile row.
 */
export async function signup(email, password) {
  return apiFetch("/auth/signup", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

/**
 * Log in an existing user via the backend.
 * Returns access_token, refresh_token, and user info.
 */
export async function login(email, password) {
  return apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

// ============================================================
// PROFILE
// ============================================================

/**
 * Get a user's profile by ID.
 */
export async function getProfile(userId) {
  return apiFetch(`/profile/${userId}`);
}

/**
 * Update a user's profile.
 * Only the fields you pass will be updated.
 * Example: updateProfile("abc-123", { first_name: "Jane", gender: "Female" })
 */
export async function updateProfile(userId, updates) {
  return apiFetch(`/profile/${userId}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  });
}