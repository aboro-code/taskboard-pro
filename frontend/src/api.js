export async function loginWithGoogle(idToken) {
  const res = await fetch('/api/auth/google', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
  });
  // Expect { token, user }
  return res.json();
}

export async function signupWithEmail(email, password, name) {
  const res = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name }),
  });
  return res.json(); // Expect { token, user }
}

export async function signinWithEmail(email, password) {
  const res = await fetch('/api/auth/signin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return res.json(); // Expect { token, user }
}

export async function fetchWithAuth(url, jwtToken, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${jwtToken}`,
    },
  });
  return res.json();
}

// Usage example:
// const { token, user } = await loginWithGoogle(idToken);
// const projects = await fetchWithAuth('/api/projects', token);
