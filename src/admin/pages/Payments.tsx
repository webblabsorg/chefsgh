import { useEffect, useState } from 'react';
import { fetchPayments, PaymentListItem } from '../../lib/adminPaymentsApi';
import { Link } from 'react-router-dom';

export default function Payments() {
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PaymentListItem[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 20;

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetchPayments({ page, pageSize, q, status });
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
        <h1 className="text-xl font-semibold">Payments</h1>
      </div>
      <form onSubmit={onSearch} className="flex gap-2 items-center">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search reference or email"
          className="border rounded px-3 py-2 text-sm w-full max-w-md"
        />
        <select className="border rounded px-2 py-2 text-sm" value={status} onChange={(e)=>setStatus(e.target.value)}>
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="success">Success</option>
          <option value="failed">Failed</option>
          <option value="abandoned">Abandoned</option>
          <option value="reversed">Reversed</option>
        </select>
        <button className="bg-teal-600 hover:bg-teal-700 text-white rounded px-4 text-sm">Search</button>
      </form>
      <div className="bg-white border border-slate-200 rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="text-left px-3 py-2">Reference</th>
              <th className="text-left px-3 py-2">Customer</th>
              <th className="text-left px-3 py-2">Status</th>
              <th className="text-left px-3 py-2">Amount</th>
              <th className="text-left px-3 py-2">Paid At</th>
              <th className="text-left px-3 py-2">Gateway</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="px-3 py-3" colSpan={6}>Loading...</td></tr>
            ) : data.length === 0 ? (
              <tr><td className="px-3 py-3" colSpan={6}>No payments found</td></tr>
            ) : (
              data.map((p) => (
                <tr key={p.id} className="border-t hover:bg-slate-50">
                  <td className="px-3 py-2">
                    <Link to={`/admin/payments/${p.id}`} className="text-teal-700 hover:underline">{p.reference}</Link>
                  </td>
                  <td className="px-3 py-2">
                    <div>{p.customer_email}</div>
                  </td>
                  <td className="px-3 py-2"><span className="rounded px-2 py-0.5 text-xs border">{p.status}</span></td>
                  <td className="px-3 py-2">{p.currency} {Number(p.amount).toFixed(2)}</td>
                  <td className="px-3 py-2">{p.paid_at ? new Date(p.paid_at).toLocaleString() : '—'}</td>
                  <td className="px-3 py-2">{p.gateway}</td>
                </tr>
              ))
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

