const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

export type PaymentListItem = {
  id: string;
  reference: string;
  gateway: string;
  status: 'pending' | 'success' | 'failed' | 'abandoned' | 'reversed';
  amount: number;
  currency: string;
  channel: string | null;
  paid_at: string | null;
  customer_email: string;
  created_at: string;
};

export async function fetchPayments(params: { page?: number; pageSize?: number; q?: string; status?: string } = {}) {
  const usp = new URLSearchParams();
  if (params.page) usp.set('page', String(params.page));
  if (params.pageSize) usp.set('pageSize', String(params.pageSize));
  if (params.q) usp.set('q', params.q);
  if (params.status) usp.set('status', params.status);
  const res = await fetch(`${API_BASE}/api/admin/payments?${usp.toString()}`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to load payments');
  return res.json() as Promise<{ data: PaymentListItem[]; page: number; pageSize: number; total: number }>;
}

export async function fetchPayment(id: string) {
  const res = await fetch(`${API_BASE}/api/admin/payments/${id}`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to load payment');
  return res.json() as Promise<{ payment: any; registration: any | null }>;
}
