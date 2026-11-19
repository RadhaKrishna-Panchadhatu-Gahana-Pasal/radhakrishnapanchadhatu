'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Lock } from 'lucide-react';

export function AdminLoginGate() {
  const router = useRouter();
  const [email, setEmail] = useState('itsuniquebhattarai@gmail.com');
  const [passcode, setPasscode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, passcode }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Authentication failed.');
      } else {
        router.refresh();
      }
    } catch {
      setError('Unable to sign in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-shell py-16">
      <div className="card mx-auto max-w-md p-8">
        <div className="flex items-center gap-3 text-gold-deep">
          <Lock className="h-6 w-6" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em]">Protected Access</p>
            <h1 className="font-serif text-3xl font-semibold text-ink">Admin Sign In</h1>
          </div>
        </div>

        <p className="mt-3 text-xs leading-relaxed text-muted">
          Authorized Radhakrishna Panchadhatu staff only. Enter your allowlisted email and store passcode.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block text-sm font-medium text-ink">
            Staff Email
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-line bg-[#FAF8F4] px-3.5 py-2.5 text-sm outline-none focus:border-gold"
            />
          </label>

          <label className="block text-sm font-medium text-ink">
            Store Passcode
            <input
              type="password"
              required
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              placeholder="Enter admin passcode"
              className="mt-1.5 w-full rounded-xl border border-line bg-[#FAF8F4] px-3.5 py-2.5 text-sm outline-none focus:border-gold"
            />
          </label>

          {error && <p className="text-xs font-medium text-danger">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-gold px-6 py-3 text-sm font-medium text-white transition hover:bg-gold-deep disabled:opacity-50"
          >
            {loading ? 'Signing In...' : 'Enter Admin CMS'}
          </button>
        </form>

        <div className="mt-5 rounded-xl border border-line bg-sand/70 p-3.5 text-xs text-muted">
          <p className="font-medium text-ink">Preview Owner Credentials</p>
          <p className="mt-1">
            Email: <code className="text-ink">itsuniquebhattarai@gmail.com</code>
          </p>
          <p>
            Default Passcode: <code className="text-ink">RKP-ADMIN-2026</code>
          </p>
          <button
            type="button"
            onClick={() => {
              setEmail('itsuniquebhattarai@gmail.com');
              setPasscode('RKP-ADMIN-2026');
            }}
            className="mt-2 font-medium text-gold-deep underline"
          >
            Fill Owner Credentials
          </button>
        </div>
      </div>
    </div>
  );
}
