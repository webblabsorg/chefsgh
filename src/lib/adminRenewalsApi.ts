const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

export type RenewalListItem = {
  id: string;
  membership_id: string;
  membership_status: string;
  membership_expiry: string;
  payment_status: string;
  payment_amount: number;
  created_at: string;
  first_name: string; middle_name?: string; last_name: string;
  email: string; phone_number: string;
  membership_type: string;
  days_remaining: number;
};

export async function fetchRenewals(params: { status?: 'due' | 'overdue'; windowDays?: number; page?: number; pageSize?: number; q?: string } = {}) {
  const usp = new URLSearchParams();
  if (params.status) usp.set('status', params.status);
  if (params.windowDays) usp.set('windowDays', String(params.windowDays));
  if (params.page) usp.set('page', String(params.page));
  if (params.pageSize) usp.set('pageSize', String(params.pageSize));
  if (params.q) usp.set('q', params.q);
  const res = await fetch(`${API_BASE}/api/admin/renewals?${usp.toString()}`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to load renewals');
  return res.json() as Promise<{ status: string; windowDays: number; data: RenewalListItem[]; page: number; pageSize: number; total: number }>;
}
