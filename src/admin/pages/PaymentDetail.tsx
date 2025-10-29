import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchPayment } from '../../lib/adminPaymentsApi';

export default function PaymentDetail() {
  const { id } = useParams();
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (!id) return;
        const res = await fetchPayment(id);
        if (!mounted) return;
        setData(res);
      } catch (e: any) {
        setError(e.message || 'Failed to load payment');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [id]);

  if (loading) return <div className="text-slate-600">Loading...</div>;
  if (!data) return <div className="text-slate-600">Not found</div>;

  const { payment, registration } = data;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Payment {payment.reference}</h1>
        <Link to="/admin/payments" className="text-sm text-teal-700 hover:underline">Back</Link>
      </div>

      {error && <div className="text-sm text-red-600">{error}</div>}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="bg-white border border-slate-200 rounded p-4 text-sm">
          <h3 className="font-semibold mb-2">Payment</h3>
          <div className="grid grid-cols-2 gap-2">
            <div><b>Status:</b> {payment.status}</div>
            <div><b>Amount:</b> {payment.currency} {Number(payment.amount).toFixed(2)}</div>
            <div><b>Gateway:</b> {payment.gateway}</div>
            <div><b>Channel:</b> {payment.channel || '—'}</div>
            <div><b>Customer:</b> {payment.customer_email}</div>
            <div><b>Paid At:</b> {payment.paid_at ? new Date(payment.paid_at).toLocaleString() : '—'}</div>
            <div className="col-span-2"><b>Metadata:</b>
              <pre className="mt-1 bg-slate-50 border border-slate-200 rounded p-2 overflow-auto max-h-40">{formatJson(payment.metadata)}</pre>
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded p-4 text-sm">
          <h3 className="font-semibold mb-2">Linked Registration</h3>
          {registration ? (
            <div className="grid grid-cols-2 gap-2">
              <div><b>Membership ID:</b> {registration.membership_id}</div>
              <div><b>Type:</b> {registration.membership_type}</div>
              <div><b>Status:</b> {registration.membership_status}</div>
              <div><b>Expiry:</b> {registration.membership_expiry ? new Date(registration.membership_expiry).toLocaleDateString() : '—'}</div>
            </div>
          ) : (
            <div className="text-slate-600">No linked registration</div>
          )}
        </div>
      </div>
    </div>
  );
}

function formatJson(value: any) {
  try {
    const obj = typeof value === 'string' ? JSON.parse(value) : value;
    return JSON.stringify(obj, null, 2);
  } catch {
    return String(value ?? '');
  }
}
