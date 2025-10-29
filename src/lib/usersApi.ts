const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

export type UserListItem = {
  id: string;
  first_name: string; middle_name?: string; last_name: string;
  email: string; phone_number: string;
  profile_photo_url?: string | null;
  created_at: string;
  membership_status?: string | null;
  membership_expiry?: string | null;
};

export async function fetchUsers(params: { page?: number; pageSize?: number; q?: string } = {}) {
  const usp = new URLSearchParams();
  if (params.page) usp.set('page', String(params.page));
  if (params.pageSize) usp.set('pageSize', String(params.pageSize));
  if (params.q) usp.set('q', params.q);
  const res = await fetch(`${API_BASE}/api/users?${usp.toString()}`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to load users');
  return res.json() as Promise<{ data: UserListItem[]; page: number; pageSize: number; total: number }>;
}

export async function fetchUser(id: string) {
  const res = await fetch(`${API_BASE}/api/users/${id}`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to load user');
  return res.json() as Promise<{ user: any; registrations: any[] }>;
}

export async function deleteUser(id: string) {
  const res = await fetch(`${API_BASE}/api/users/${id}`, { method: 'DELETE', credentials: 'include' });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || 'Delete failed');
  }
  return res.json();
}

export type EmergencyContact = { name: string; relationship: string; phone: string };

export type CreateUserPayload = {
  first_name: string;
  middle_name?: string;
  last_name: string;
  email: string;
  phone_number: string;
  alternative_phone?: string;
  date_of_birth: string; // YYYY-MM-DD
  gender: 'male' | 'female' | 'prefer_not_to_say';
  nationality?: string;
  id_type: 'ghana_card' | 'passport' | 'voter_id' | 'driver_license';
  id_number: string;
  street_address: string;
  city: string;
  region: string;
  digital_address?: string;
  professional_info?: any;
  emergency_contact: EmergencyContact;
  profile_photo_url?: string | null;
};

export async function createUser(payload: CreateUserPayload) {
  const res = await fetch(`${API_BASE}/api/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || 'Failed to create user');
  }
  return res.json();
}

export type UpdateUserPayload = Partial<{
  first_name: string;
  middle_name?: string;
  last_name: string;
  email: string;
  phone_number: string;
  alternative_phone?: string;
  street_address: string;
  city: string;
  region: string;
  digital_address?: string;
  professional_info?: any;
  emergency_contact?: EmergencyContact;
  profile_photo_url?: string | null;
}>;

export async function updateUser(id: string, payload: UpdateUserPayload) {
  const res = await fetch(`${API_BASE}/api/users/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || 'Failed to update user');
  }
  return res.json();
}
