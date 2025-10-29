import { useEffect, useState } from 'react';
import {
  fetchMembershipTypesBreakdown,
  fetchSummary,
  fetchRegistrationsTrend,
  SummaryStats,
  RegistrationsTrendPoint,
} from '../../lib/adminApi';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ComposedChart,
  Line,
} from 'recharts';

export default function Dashboard() {
  const [summary, setSummary] = useState<SummaryStats | null>(null);
  const [breakdownWeek, setBreakdownWeek] = useState<Array<{ name: string; slug: string; count: number }>>([]);
  const [breakdownMonth, setBreakdownMonth] = useState<Array<{ name: string; slug: string; count: number }>>([]);
  const [trend, setTrend] = useState<RegistrationsTrendPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [s, w, m, t] = await Promise.all([
          fetchSummary(),
          fetchMembershipTypesBreakdown('week'),
          fetchMembershipTypesBreakdown('month'),
          fetchRegistrationsTrend(30),
        ]);
        if (!mounted) return;
        setSummary(s);
        setBreakdownWeek(w.data);
        setBreakdownMonth(m.data);
        setTrend(t.data);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <div className="text-slate-600">Loading stats...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {summary && (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
          <Kpi title="Users Today" value={summary.users.today} />
          <Kpi title="Users This Week" value={summary.users.week} />
          <Kpi title="Users This Month" value={summary.users.month} />
          <Kpi title="Active Members" value={summary.activeMembers} />
          <Kpi title="Registrations Today" value={summary.registrations.today} />
          <Kpi title="Registrations This Week" value={summary.registrations.week} />
          <Kpi title="Registrations This Month" value={summary.registrations.month} />
          <Kpi title="Revenue This Month" value={`GH₵${Number(summary.revenue.month).toFixed(2)}`} />
        </div>
      )}

      {summary && (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
          <div className="bg-white border border-slate-200 rounded p-4">
            <h3 className="font-semibold mb-2">Renewals</h3>
            <ul className="text-sm text-slate-700 space-y-1">
              <li>Due in 7 days: <b>{summary.renewals.due7}</b></li>
              <li>Due in 30 days: <b>{summary.renewals.due30}</b></li>
              <li>Overdue: <b>{summary.renewals.overdue}</b></li>
            </ul>
          </div>
          <div className="bg-white border border-slate-200 rounded p-4">
            <h3 className="font-semibold mb-2">Membership Types (This Week)</h3>
            {breakdownWeek.length === 0 ? (
              <div className="text-sm text-slate-500">No data</div>
            ) : (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={breakdownWeek} margin={{ top: 4, right: 8, bottom: 0, left: -12 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} height={48} angle={-10} textAnchor="end" />
                    <YAxis allowDecimals={false} width={28} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#0d9488" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
          <div className="bg-white border border-slate-200 rounded p-4">
            <h3 className="font-semibold mb-2">Membership Types (This Month)</h3>
            {breakdownMonth.length === 0 ? (
              <div className="text-sm text-slate-500">No data</div>
            ) : (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={breakdownMonth} margin={{ top: 4, right: 8, bottom: 0, left: -12 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} height={48} angle={-10} textAnchor="end" />
                    <YAxis allowDecimals={false} width={28} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#14b8a6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded p-4">
        <h3 className="font-semibold mb-2">Registrations & Revenue (Last 30 days)</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={trend} margin={{ top: 8, right: 16, left: -12, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis yAxisId="left" allowDecimals={false} width={36} />
              <YAxis yAxisId="right" orientation="right" width={36} tickFormatter={(v)=>`GH₵${Number(v).toFixed(0)}`} />
              <Tooltip formatter={(value:any, name:any)=> name==='revenue'?[`GH₵${Number(value).toFixed(2)}`,'Revenue']:[value,'Registrations']} />
              <Legend />
              <Bar yAxisId="left" dataKey="registrations" name="Registrations" fill="#0284c7" radius={[4,4,0,0]} />
              <Line yAxisId="right" type="monotone" dataKey="revenue" name="Revenue" stroke="#10b981" strokeWidth={2} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function Kpi({ title, value }: { title: string; value: number | string }) {
  return (
    <div className="bg-white border border-slate-200 rounded p-4">
      <div className="text-sm text-slate-600">{title}</div>
      <div className="text-2xl font-semibold mt-1">{value}</div>
    </div>
  );
}

