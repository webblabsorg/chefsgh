const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

export type MembershipType = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  price: number;
  benefits: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export async function fetchMembershipTypesAdmin(params: { includeInactive?: boolean } = {}) {
  const usp = new URLSearchParams();
  if (params.includeInactive !== undefined) usp.set('includeInactive', String(params.includeInactive));
  const res = await fetch(`${API_BASE}/api/admin/membership-types?${usp.toString()}`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to load membership types');
  return res.json() as Promise<{ data: MembershipType[] }>;
}

export async function createMembershipType(payload: Partial<MembershipType> & { name: string; slug: string; price: number }) {
  const res = await fetch(`${API_BASE}/api/admin/membership-types`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || 'Failed to create');
  }
  return res.json();
}

export async function updateMembershipType(id: string, payload: Partial<MembershipType>) {
  const res = await fetch(`${API_BASE}/api/admin/membership-types/${id}`, {
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

export async function deleteMembershipType(id: string) {
  const res = await fetch(`${API_BASE}/api/admin/membership-types/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || 'Failed to delete');
  }
  return res.json();
}
