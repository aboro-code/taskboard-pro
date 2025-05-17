const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

// Function to login using Google OAuth
export async function loginWithGoogle(idToken) {
  const res = await fetch(`${API_BASE_URL}/api/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
  });
  return res.json();
}

// Function to sign up with email, password, and name
export async function signupWithEmail(email, password, name) {
  const res = await fetch(`${API_BASE_URL}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name }),
  });
  return res.json();
}

// Function to sign in with email and password
export async function signinWithEmail(email, password) {
  const res = await fetch(`${API_BASE_URL}/api/auth/signin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

// Function to fetch data with JWT token for authentication
export async function fetchWithAuth(url, jwtToken, options = {}) {
  const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
  const res = await fetch(fullUrl, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${jwtToken}`,
    },
  });
  return res.json();
}
