import { useEffect, useState } from 'react';
import { fetchRenewals, RenewalListItem } from '../../lib/adminRenewalsApi';
import { Link } from 'react-router-dom';

export default function Renewals() {
  const [status, setStatus] = useState<'due' | 'overdue'>('due');
  const [windowDays, setWindowDays] = useState(30);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<RenewalListItem[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 20;

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetchRenewals({ status, windowDays, page, pageSize, q });
      setData(res.data);
      setTotal(res.total);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, windowDays, page]);

  const onSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    await load();
  };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Renewals</h1>
      </div>
      <form onSubmit={onSearch} className="flex flex-wrap gap-2 items-center">
        <select className="border rounded px-2 py-2 text-sm" value={status} onChange={(e)=>{ setStatus(e.target.value as 'due'|'overdue'); setPage(1); }}>
          <option value="due">Due Soon</option>
          <option value="overdue">Overdue</option>
        </select>
        {status === 'due' && (
          <select className="border rounded px-2 py-2 text-sm" value={windowDays} onChange={(e)=>{ setWindowDays(Number(e.target.value)); setPage(1); }}>
            <option value={7}>Next 7 days</option>
            <option value={30}>Next 30 days</option>
            <option value={60}>Next 60 days</option>
          </select>
        )}
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search membership ID, name, email, phone"
          className="border rounded px-3 py-2 text-sm w-full max-w-md"
        />
        <button className="bg-teal-600 hover:bg-teal-700 text-white rounded px-4 text-sm">Search</button>
      </form>
      <div className="bg-white border border-slate-200 rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="text-left px-3 py-2">Member</th>
              <th className="text-left px-3 py-2">Membership ID</th>
              <th className="text-left px-3 py-2">Type</th>
              <th className="text-left px-3 py-2">Status</th>
              <th className="text-left px-3 py-2">Expiry</th>
              <th className="text-left px-3 py-2">Days</th>
              <th className="text-left px-3 py-2">Payment</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="px-3 py-3" colSpan={7}>Loading...</td></tr>
            ) : data.length === 0 ? (
              <tr><td className="px-3 py-3" colSpan={7}>No results</td></tr>
            ) : (
              data.map((r) => {
                const name = [r.first_name, r.middle_name, r.last_name].filter(Boolean).join(' ');
                return (
                  <tr key={r.id} className="border-t hover:bg-slate-50">
                    <td className="px-3 py-2">
                      <Link to={`/admin/registrations/${r.id}`} className="text-teal-700 hover:underline">{name}</Link>
                      <div className="text-xs text-slate-500">{r.email}</div>
                    </td>
                    <td className="px-3 py-2">{r.membership_id}</td>
                    <td className="px-3 py-2">{r.membership_type}</td>
                    <td className="px-3 py-2"><span className="rounded px-2 py-0.5 text-xs border">{r.membership_status}</span></td>
                    <td className="px-3 py-2">{r.membership_expiry ? new Date(r.membership_expiry).toLocaleDateString() : '—'}</td>
                    <td className="px-3 py-2">{status === 'overdue' ? '-' + Math.abs(r.days_remaining) : r.days_remaining}</td>
                    <td className="px-3 py-2">{r.payment_status === 'success' ? `GH₵${Number(r.payment_amount).toFixed(2)}` : r.payment_status}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-end gap-2 text-sm">
        <span>Page {page} of {totalPages}</span>
        <button disabled={page<=1} className="border rounded px-2 py-1 disabled:opacity-50" onClick={()=>setPage(1)}>First</button>
        <button disabled={page<=1} className="border rounded px-2 py-1 disabled:opacity-50" onClick={()=>setPage(page-1)}>Prev</button>
        <button disabled={page>=totalPages} className="border rounded px-2 py-1 disabled:opacity-50" onClick={()=>setPage(page+1)}>Next</button>
        <button disabled={page>=totalPages} className="border rounded px-2 py-1 disabled:opacity-50" onClick={()=>setPage(totalPages)}>Last</button>
      </div>
    </div>
  );
}

