const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '')

function getStoredAccessToken() {
  try {
    const user = JSON.parse(localStorage.getItem('nyurveda_user') || '{}')
    return user.accessToken || user.access_token || ''
  } catch {
    return ''
  }
}

async function apiFetch(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`
  const accessToken = options.accessToken || getStoredAccessToken()

  const headers = {
    'Content-Type': 'application/json',
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    ...options.headers,
  }

  const response = await fetch(url, {
    ...options,
    headers,
  })

  const text = await response.text()
  let data = null

  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = { detail: text }
    }
  }

  if (!response.ok) {
    throw new Error(data?.detail || data?.error || 'Something went wrong')
  }

  return data
}

export async function signup(email, password) {
  return apiFetch('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export async function login(email, password) {
  return apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export async function getProfile(userId, accessToken) {
  return apiFetch(`/profile/${userId}`, { accessToken })
}

export async function updateProfile(userId, updates, accessToken) {
  return apiFetch(`/profile/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
    accessToken,
  })
}