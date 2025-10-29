import { useEffect, useState } from 'react';
import { fetchEmails, EmailListItem } from '../../lib/adminEmailApi';
import { Link } from 'react-router-dom';

export default function EmailLogs() {
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<EmailListItem[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 20;

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetchEmails({ page, pageSize, q, status });
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
        <h1 className="text-xl font-semibold">Email Logs</h1>
      </div>
      <form onSubmit={onSearch} className="flex gap-2 items-center">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search recipient or subject"
          className="border rounded px-3 py-2 text-sm w-full max-w-md"
        />
        <select className="border rounded px-2 py-2 text-sm" value={status} onChange={(e)=>setStatus(e.target.value)}>
          <option value="">All</option>
          <option value="sent">Sent</option>
          <option value="failed">Failed</option>
          <option value="pending">Pending</option>
        </select>
        <button className="bg-teal-600 hover:bg-teal-700 text-white rounded px-4 text-sm">Search</button>
      </form>
      <div className="bg-white border border-slate-200 rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="text-left px-3 py-2">Subject</th>
              <th className="text-left px-3 py-2">Recipient</th>
              <th className="text-left px-3 py-2">Status</th>
              <th className="text-left px-3 py-2">Sent At</th>
              <th className="text-left px-3 py-2">Created</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="px-3 py-3" colSpan={6}>Loading...</td></tr>
            ) : data.length === 0 ? (
              <tr><td className="px-3 py-3" colSpan={6}>No emails</td></tr>
            ) : data.map((e) => (
              <tr key={e.id} className="border-t">
                <td className="px-3 py-2">
                  <Link to={`/admin/email-logs/${e.id}`} className="text-teal-700 hover:underline">{e.subject}</Link>
                  {e.registration_id && (
                    <div className="text-xs text-slate-500">Reg: {e.registration_id}</div>
                  )}
                </td>
                <td className="px-3 py-2">{e.recipient_email}</td>
                <td className="px-3 py-2"><span className="rounded px-2 py-0.5 text-xs border">{e.status}</span></td>
                <td className="px-3 py-2">{e.sent_at ? new Date(e.sent_at).toLocaleString() : '—'}</td>
                <td className="px-3 py-2">{new Date(e.created_at).toLocaleString()}</td>
                <td className="px-3 py-2 text-right">
                  <Link to={`/admin/email-logs/${e.id}`} className="text-sm text-teal-700 hover:underline">View</Link>
                </td>
              </tr>
            ))}
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

