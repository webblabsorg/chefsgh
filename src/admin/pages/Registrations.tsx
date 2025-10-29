import { useEffect, useState } from 'react';
import { fetchRegistrations, RegistrationListItem } from '../../lib/adminRegistrationsApi';
import { Link } from 'react-router-dom';

export default function Registrations() {
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<RegistrationListItem[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 20;

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetchRegistrations({ page, pageSize, q, status });
      setData(res.data);
      setTotal(res.total);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const onSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    await load();
  };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Registrations</h1>
      </div>
      <form onSubmit={onSearch} className="flex gap-2 items-center">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search membership ID, name, email"
          className="border rounded px-3 py-2 text-sm w-full max-w-md"
        />
        <select className="border rounded px-2 py-2 text-sm" value={status} onChange={(e)=>setStatus(e.target.value)}>
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="suspended">Suspended</option>
          <option value="expired">Expired</option>
        </select>
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
              <th className="text-left px-3 py-2">Payment</th>
              <th className="text-left px-3 py-2">Created</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="px-3 py-3" colSpan={7}>Loading...</td></tr>
            ) : data.length === 0 ? (
              <tr><td className="px-3 py-3" colSpan={7}>No registrations found</td></tr>
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
                    <td className="px-3 py-2">
                      <span className="rounded px-2 py-0.5 text-xs border">{r.membership_status}</span>
                    </td>
                    <td className="px-3 py-2">{r.membership_expiry ? new Date(r.membership_expiry).toLocaleDateString() : '—'}</td>
                    <td className="px-3 py-2">
                      {r.payment_status === 'success' ? `GH₵${Number(r.payment_amount).toFixed(2)}` : r.payment_status}
                    </td>
                    <td className="px-3 py-2">{new Date(r.created_at).toLocaleDateString()}</td>
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

