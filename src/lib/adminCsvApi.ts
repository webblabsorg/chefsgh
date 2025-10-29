const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

export async function exportUsersCsv(params: { start?: string; end?: string } = {}) {
  const usp = new URLSearchParams();
  if (params.start) usp.set('start', params.start);
  if (params.end) usp.set('end', params.end);
  const res = await fetch(`${API_BASE}/api/admin/exports/users.csv?${usp.toString()}`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to export users');
  return res.blob();
}

export async function exportPaymentsCsv(params: { start?: string; end?: string } = {}) {
  const usp = new URLSearchParams();
  if (params.start) usp.set('start', params.start);
  if (params.end) usp.set('end', params.end);
  const res = await fetch(`${API_BASE}/api/admin/exports/payments.csv?${usp.toString()}`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to export payments');
  return res.blob();
}

export async function importUsersCsv(file: File, dryRun = true) {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${API_BASE}/api/admin/import/users?dryRun=${dryRun ? 'true' : 'false'}`, {
    method: 'POST',
    credentials: 'include',
    body: form,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || 'Failed to import users');
  }
  return res.json();
}

export async function importPaymentsCsv(file: File, dryRun = true) {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${API_BASE}/api/admin/import/payments?dryRun=${dryRun ? 'true' : 'false'}`, {
    method: 'POST',
    credentials: 'include',
    body: form,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || 'Failed to import payments');
  }
  return res.json();
}
