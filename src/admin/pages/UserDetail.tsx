import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchUser } from '../../lib/usersApi';

export default function UserDetail() {
  const { id } = useParams();
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (!id) return;
        const res = await fetchUser(id);
        if (!mounted) return;
        setData(res);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [id]);

  if (loading) return <div className="text-slate-600">Loading...</div>;
  if (!data) return <div className="text-slate-600">Not found</div>;

  const { user, registrations } = data;
  const name = [user.first_name, user.middle_name, user.last_name].filter(Boolean).join(' ');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{name}</h1>
        <div className="flex items-center gap-3">
          <Link to={`/admin/users/${user.id}/edit`} className="text-sm text-teal-700 hover:underline">Edit</Link>
          <Link to="/admin/users" className="text-sm text-teal-700 hover:underline">Back to Users</Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[260px_1fr]">
        <div className="bg-white border border-slate-200 rounded p-4">
          {user.profile_photo_url ? (
            <img src={`/${user.profile_photo_url}`} alt={name} className="w-full rounded" />
          ) : (
            <div className="text-sm text-slate-500">No photo</div>
          )}
          <div className="text-sm mt-3">
            <div><b>Email:</b> {user.email}</div>
            <div><b>Phone:</b> {user.phone_number}</div>
            <div><b>Joined:</b> {new Date(user.created_at).toLocaleDateString()}</div>
            <div><b>Address:</b> {user.street_address}, {user.city}, {user.region}</div>
            {user.digital_address && <div><b>Digital Address:</b> {user.digital_address}</div>}
            <div><b>ID:</b> {user.id_type} — {user.id_number}</div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded p-4">
            <h3 className="font-semibold mb-2">Membership History</h3>
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="text-left px-3 py-2">Membership ID</th>
                  <th className="text-left px-3 py-2">Type</th>
                  <th className="text-left px-3 py-2">Status</th>
                  <th className="text-left px-3 py-2">Expiry</th>
                  <th className="text-left px-3 py-2">Payment</th>
                  <th className="text-left px-3 py-2">Registered</th>
                </tr>
              </thead>
              <tbody>
                {registrations.length === 0 ? (
                  <tr><td colSpan={6} className="px-3 py-3">No registrations</td></tr>
                ) : registrations.map((r: any) => (
                  <tr key={r.id} className="border-t">
                    <td className="px-3 py-2">{r.membership_id}</td>
                    <td className="px-3 py-2">{r.membership_type}</td>
                    <td className="px-3 py-2">{r.membership_status}</td>
                    <td className="px-3 py-2">{r.membership_expiry ? new Date(r.membership_expiry).toLocaleDateString() : '—'}</td>
                    <td className="px-3 py-2">{r.payment_status === 'success' ? `GH₵${Number(r.payment_amount).toFixed(2)}` : r.payment_status}</td>
                    <td className="px-3 py-2">{new Date(r.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
