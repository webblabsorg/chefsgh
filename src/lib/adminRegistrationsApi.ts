const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

export type RegistrationListItem = {
  id: string;
  membership_id: string;
  membership_status: string;
  membership_expiry: string | null;
  payment_status: string;
  payment_amount: number;
  created_at: string;
  first_name: string; middle_name?: string; last_name: string;
  email: string; phone_number: string;
  membership_type: string;
};

export async function fetchRegistrations(params: { page?: number; pageSize?: number; q?: string; status?: string } = {}) {
  const usp = new URLSearchParams();
  if (params.page) usp.set('page', String(params.page));
  if (params.pageSize) usp.set('pageSize', String(params.pageSize));
  if (params.q) usp.set('q', params.q);
  if (params.status) usp.set('status', params.status);
  const res = await fetch(`${API_BASE}/api/admin/registrations?${usp.toString()}`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to load registrations');
  return res.json() as Promise<{ data: RegistrationListItem[]; page: number; pageSize: number; total: number }>;
}

export async function fetchRegistration(id: string) {
  const res = await fetch(`${API_BASE}/api/admin/registrations/${id}`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to load registration');
  return res.json() as Promise<{ registration: any; payment: any | null }>;
}

export async function updateRegistration(id: string, payload: { membership_status?: string; membership_expiry?: string }) {
  const res = await fetch(`${API_BASE}/api/admin/registrations/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || 'Failed to update');
  }
  return res.json();
}

export async function resendRegistrationEmail(id: string) {
  const res = await fetch(`${API_BASE}/api/admin/registrations/${id}/resend-email`, {
    method: 'POST',
    credentials: 'include',
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || 'Failed to resend email');
  }
  return res.json();
}
