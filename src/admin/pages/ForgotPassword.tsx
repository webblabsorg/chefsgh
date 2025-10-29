import { useState } from 'react';
import { requestPasswordReset } from '../../lib/auth';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await requestPasswordReset(email);
      setSent(true);
    } catch (err: any) {
      setError(err.message || 'Failed to request reset');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="w-full max-w-sm bg-white p-6 rounded-lg shadow border border-slate-200">
        <h1 className="text-xl font-semibold text-slate-900 mb-1">Forgot Password</h1>
        <p className="text-sm text-slate-600 mb-4">Enter your admin email; if it matches an account, we'll email a reset link.</p>
        {sent ? (
          <div className="text-sm text-teal-700">If an account exists for {email}, a reset link has been sent.</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-sm text-slate-700">Email</label>
              <input
                type="email"
                className="mt-1 w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            {error && <div className="text-sm text-red-600">{error}</div>}
            <button
              type="submit"
              className="w-full bg-teal-600 hover:bg-teal-700 text-white rounded py-2 text-sm"
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
            <div className="text-xs text-slate-600 text-center">
              <a href="/admin/login" className="text-teal-700 hover:underline">Back to login</a>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
