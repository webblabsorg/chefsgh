export interface AdminUser {
  id: string;
  email: string;
  username: string;
  full_name: string;
  role: string;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

export async function login(payload: { email?: string; username?: string; password: string }) {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || 'Login failed');
  }
  return res.json() as Promise<{ admin: AdminUser }>;
}

export async function getMe() {
  const res = await fetch(`${API_BASE}/api/auth/me`, {
    method: 'GET',
    credentials: 'include',
  });
  if (!res.ok) return null;
  const body = (await res.json()) as { admin: AdminUser };
  return body.admin;
}

export async function logout() {
  await fetch(`${API_BASE}/api/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });
}

export async function requestPasswordReset(email: string) {
  const res = await fetch(`${API_BASE}/api/auth/forgot`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) throw new Error('Failed to request password reset');
  return res.json();
}

export async function resetPassword(token: string, password: string) {
  const res = await fetch(`${API_BASE}/api/auth/reset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, password }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || 'Failed to reset password');
  }
  return res.json();
}
