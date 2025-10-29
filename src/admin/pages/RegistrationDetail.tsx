import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchRegistration, resendRegistrationEmail, updateRegistration } from '../../lib/adminRegistrationsApi';

export default function RegistrationDetail() {
  const { id } = useParams();
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await fetchRegistration(id);
      setData(res);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [id]);

  const onApprove = async () => {
    if (!id) return;
    setSaving(true);
    setError(null);
    try {
      await updateRegistration(id, { membership_status: 'active' });
      await load();
    } catch (e: any) {
      setError(e.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const onReject = async () => {
    if (!id) return;
    setSaving(true);
    setError(null);
    try {
      await updateRegistration(id, { membership_status: 'inactive' });
      await load();
    } catch (e: any) {
      setError(e.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const onResend = async () => {
    if (!id) return;
    setSaving(true);
    setError(null);
    try {
      await resendRegistrationEmail(id);
      alert('Email resent');
    } catch (e: any) {
      setError(e.message || 'Resend failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-slate-600">Loading...</div>;
  if (!data) return <div className="text-slate-600">Not found</div>;

  const { registration, payment } = data;
  const name = [registration.first_name, registration.middle_name, registration.last_name].filter(Boolean).join(' ');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{registration.membership_id}</h1>
        <div className="flex items-center gap-3">
          <button disabled={saving} onClick={onApprove} className="bg-teal-600 hover:bg-teal-700 text-white rounded px-3 py-2 text-sm disabled:opacity-50">Approve</button>
          <button disabled={saving} onClick={onReject} className="border border-red-500 text-red-600 hover:bg-red-50 rounded px-3 py-2 text-sm disabled:opacity-50">Reject</button>
          <button disabled={saving} onClick={onResend} className="border text-slate-700 hover:bg-slate-50 rounded px-3 py-2 text-sm disabled:opacity-50">Resend Email</button>
          <Link to="/admin/registrations" className="text-sm text-teal-700 hover:underline">Back</Link>
        </div>
      </div>

      {error && <div className="text-sm text-red-600">{error}</div>}

      <div className="grid gap-4 md:grid-cols-[260px_1fr]">
        <div className="bg-white border border-slate-200 rounded p-4 text-sm">
          <h3 className="font-semibold mb-2">Member</h3>
          <div><b>Name:</b> {name}</div>
          <div><b>Email:</b> {registration.email}</div>
          <div><b>Phone:</b> {registration.phone_number}</div>
          <div><b>Address:</b> {registration.street_address}, {registration.city}, {registration.region}</div>
          <div><b>ID:</b> {registration.id_type} — {registration.id_number}</div>
        </div>
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded p-4 text-sm">
            <h3 className="font-semibold mb-2">Registration</h3>
            <div className="grid md:grid-cols-2 gap-2">
              <div><b>Type:</b> {registration.membership_type}</div>
              <div><b>Status:</b> {registration.membership_status}</div>
              <div><b>Expiry:</b> {registration.membership_expiry ? new Date(registration.membership_expiry).toLocaleDateString() : '—'}</div>
              <div><b>Created:</b> {new Date(registration.created_at).toLocaleDateString()}</div>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded p-4 text-sm">
            <h3 className="font-semibold mb-2">Payment</h3>
            {payment ? (
              <div className="grid md:grid-cols-2 gap-2">
                <div><b>Reference:</b> {payment.reference}</div>
                <div><b>Status:</b> {payment.status}</div>
                <div><b>Amount:</b> GH₵{Number(payment.amount).toFixed(2)}</div>
                <div><b>Paid At:</b> {payment.paid_at ? new Date(payment.paid_at).toLocaleString() : '—'}</div>
              </div>
            ) : (
              <div className="text-slate-600">No payment record</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
