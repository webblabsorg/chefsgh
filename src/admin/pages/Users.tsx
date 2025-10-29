import { useEffect, useState } from 'react';
import { deleteUser, fetchUsers, UserListItem } from '../../lib/usersApi';
import { Link } from 'react-router-dom';

export default function Users() {
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<UserListItem[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 20;

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetchUsers({ page, pageSize, q });
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

  const onDelete = async (id: string) => {
    if (!confirm('Delete this user? This will fail if the user has registrations.')) return;
    try {
      await deleteUser(id);
      await load();
    } catch (err: any) {
      alert(err.message || 'Delete failed');
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Users</h1>
        <Link to="/admin/users/new" className="bg-teal-600 hover:bg-teal-700 text-white rounded px-3 py-2 text-sm">Add User</Link>
      </div>
      <form onSubmit={onSearch} className="flex gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name, email, phone"
          className="border rounded px-3 py-2 text-sm w-full max-w-md"
        />
        <button className="bg-teal-600 hover:bg-teal-700 text-white rounded px-4 text-sm">Search</button>
      </form>
      <div className="bg-white border border-slate-200 rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="text-left px-3 py-2">Name</th>
              <th className="text-left px-3 py-2">Email</th>
              <th className="text-left px-3 py-2">Phone</th>
              <th className="text-left px-3 py-2">Joined</th>
              <th className="text-left px-3 py-2">Status</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="px-3 py-3" colSpan={6}>Loading...</td></tr>
            ) : data.length === 0 ? (
              <tr><td className="px-3 py-3" colSpan={6}>No users found</td></tr>
            ) : (
              data.map((u) => (
                <tr key={u.id} className="border-t">
                  <td className="px-3 py-2">
                    <Link to={`/admin/users/${u.id}`} className="text-teal-700 hover:underline">
                      {u.first_name} {u.last_name}
                    </Link>
                  </td>
                  <td className="px-3 py-2">{u.email}</td>
                  <td className="px-3 py-2">{u.phone_number}</td>
                  <td className="px-3 py-2">{new Date(u.created_at).toLocaleDateString()}</td>
                  <td className="px-3 py-2">
                    {u.membership_status ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="rounded px-2 py-0.5 text-xs border">
                          {u.membership_status}
                        </span>
                        {u.membership_expiry && (
                          <span className="text-xs text-slate-600">exp: {new Date(u.membership_expiry).toLocaleDateString()}</span>
                        )}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-500">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button onClick={() => onDelete(u.id)} className="text-red-600 hover:underline text-xs">Delete</button>
                  </td>
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

