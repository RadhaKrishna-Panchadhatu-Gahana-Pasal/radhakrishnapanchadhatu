'use client';

import { useState, type FormEvent } from 'react';
import { CheckCircle2, Send } from 'lucide-react';

export function ContactForm() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, email, message }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Could not send enquiry.');
      } else {
        setSent(true);
        setName('');
        setPhone('');
        setEmail('');
        setMessage('');
      }
    } catch {
      setError('Network error sending enquiry.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card p-6 sm:p-8">
      <h2 className="font-serif text-2xl font-semibold text-ink">Send a Message</h2>
      <p className="mt-1 text-xs text-muted">
        Ask about sizing, Panchadhatu alloys, nationwide courier timelines, or showroom visits.
      </p>

      {sent ? (
        <div className="mt-5 rounded-2xl border border-success/30 bg-sand/70 p-5 text-sm text-ink">
          <p className="flex items-center gap-2 font-semibold text-success">
            <CheckCircle2 className="h-4 w-4" /> Enquiry Sent
          </p>
          <p className="mt-1 text-muted">
            Thank you. Our Butwal store team has logged your enquiry and will reach out shortly.
          </p>
          <button
            type="button"
            onClick={() => setSent(false)}
            className="mt-3 text-xs font-medium text-gold-deep underline"
          >
            Send another message
          </button>
        </div>
      ) : (
        <div className="mt-5 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-ink">
              Name *
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                className="mt-1.5 w-full rounded-xl border border-line bg-[#FAF8F4] px-3.5 py-2.5 text-sm outline-none focus:border-gold"
              />
            </label>
            <label className="text-sm font-medium text-ink">
              Phone *
              <input
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="98XXXXXXXX"
                className="mt-1.5 w-full rounded-xl border border-line bg-[#FAF8F4] px-3.5 py-2.5 text-sm outline-none focus:border-gold"
              />
            </label>
          </div>

          <label className="block text-sm font-medium text-ink">
            Email (optional)
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="mt-1.5 w-full rounded-xl border border-line bg-[#FAF8F4] px-3.5 py-2.5 text-sm outline-none focus:border-gold"
            />
          </label>

          <label className="block text-sm font-medium text-ink">
            Message *
            <textarea
              required
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="How can we help?"
              className="mt-1.5 w-full rounded-xl border border-line bg-[#FAF8F4] px-3.5 py-2.5 text-sm outline-none focus:border-gold"
            />
          </label>

          {error && <p className="text-xs font-medium text-danger">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-medium text-white hover:bg-gold-deep disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            {submitting ? 'Sending...' : 'Send Enquiry'}
          </button>
        </div>
      )}
    </form>
  );
}
