const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

export type EmailListItem = {
  id: string;
  registration_id: string | null;
  recipient_email: string;
  subject: string;
  status: 'pending' | 'sent' | 'failed';
  sent_at: string | null;
  created_at: string;
};

export async function fetchEmails(params: { page?: number; pageSize?: number; q?: string; status?: string } = {}) {
  const usp = new URLSearchParams();
  if (params.page) usp.set('page', String(params.page));
  if (params.pageSize) usp.set('pageSize', String(params.pageSize));
  if (params.q) usp.set('q', params.q);
  if (params.status) usp.set('status', params.status);
  const res = await fetch(`${API_BASE}/api/admin/email-notifications?${usp.toString()}`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to load emails');
  return res.json() as Promise<{ data: EmailListItem[]; page: number; pageSize: number; total: number }>;
}

export async function fetchEmail(id: string) {
  const res = await fetch(`${API_BASE}/api/admin/email-notifications/${id}`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to load email');
  return res.json() as Promise<{ email: any }>;
}

export async function resendEmail(id: string) {
  const res = await fetch(`${API_BASE}/api/admin/email-notifications/${id}/resend`, { method: 'POST', credentials: 'include' });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || 'Failed to resend');
  }
  return res.json();
}
