const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

export type SummaryStats = {
  users: { today: number; week: number; month: number };
  registrations: { today: number; week: number; month: number };
  revenue: { today: number; week: number; month: number };
  activeMembers: number;
  renewals: { due7: number; due30: number; overdue: number };
};

export async function fetchSummary(): Promise<SummaryStats> {
  const res = await fetch(`${API_BASE}/api/admin/stats/summary`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to load stats');
  return res.json();
}

export async function fetchMembershipTypesBreakdown(period: 'week' | 'month') {
  const res = await fetch(`${API_BASE}/api/admin/stats/membership-types?period=${period}`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to load membership type breakdown');
  return res.json() as Promise<{ period: string; data: Array<{ name: string; slug: string; count: number }> }>;
}

export type RegistrationsTrendPoint = {
  date: string;
  registrations: number;
  revenue: number;
};

export async function fetchRegistrationsTrend(days = 30) {
  const res = await fetch(`${API_BASE}/api/admin/stats/registrations-trend?days=${days}`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to load registrations trend');
  return res.json() as Promise<{ days: number; data: RegistrationsTrendPoint[] }>;
}
