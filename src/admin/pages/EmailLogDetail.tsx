import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchEmail, resendEmail } from '../../lib/adminEmailApi';

export default function EmailLogDetail() {
  const { id } = useParams();
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const load = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetchEmail(id);
      setData(res);
    } catch (e: any) {
      setError(e.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [id]);

  const onResend = async () => {
    if (!id) return;
    setSending(true);
    setError(null);
    try {
      await resendEmail(id);
      alert('Email resent');
    } catch (e: any) {
      setError(e.message || 'Resend failed');
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div className="text-slate-600">Loading...</div>;
  if (!data) return <div className="text-slate-600">Not found</div>;
  const { email } = data;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Email: {email.subject}</h1>
        <div className="flex items-center gap-3">
          <button disabled={sending} onClick={onResend} className="border text-slate-700 hover:bg-slate-50 rounded px-3 py-2 text-sm disabled:opacity-50">Resend</button>
          <Link to="/admin/email-logs" className="text-sm text-teal-700 hover:underline">Back</Link>
        </div>
      </div>
      {error && <div className="text-sm text-red-600">{error}</div>}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="bg-white border border-slate-200 rounded p-4 text-sm">
          <h3 className="font-semibold mb-2">Meta</h3>
          <div className="grid grid-cols-2 gap-2">
            <div><b>Recipient:</b> {email.recipient_email}</div>
            <div><b>Status:</b> {email.status}</div>
            <div><b>Sent At:</b> {email.sent_at ? new Date(email.sent_at).toLocaleString() : '—'}</div>
            <div><b>Created:</b> {new Date(email.created_at).toLocaleString()}</div>
            {email.registration_id && <div className="col-span-2"><b>Registration ID:</b> {email.registration_id}</div>}
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded p-4 text-sm">
          <h3 className="font-semibold mb-2">Body</h3>
          <div className="border border-slate-200 rounded bg-slate-50 p-2 overflow-auto max-h-[60vh]">
            <iframe title="email-body" srcDoc={email.body} className="w-full h-[60vh] bg-white" />
          </div>
        </div>
      </div>
    </div>
  );
}
