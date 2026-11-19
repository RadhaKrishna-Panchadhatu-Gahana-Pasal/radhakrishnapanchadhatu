'use client';

import { useState, type FormEvent } from 'react';
import { CheckCircle2, MessageCircle, Sparkles } from 'lucide-react';

export default function CustomOrderPage() {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [preferredMaterial, setPreferredMaterial] = useState('Panchadhatu');
  const [budgetNote, setBudgetNote] = useState('');
  const [description, setDescription] = useState('');
  const [referenceImageUrl, setReferenceImageUrl] = useState('');
  const [consentAccepted, setConsentAccepted] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<{
    referenceCode: string;
    whatsappUrl: string;
  } | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!consentAccepted) {
      setError('Please accept the contact consent checkbox before submitting.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/custom-order-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          customerPhone,
          preferredMaterial,
          budgetNote: budgetNote || undefined,
          description,
          referenceImageUrl: referenceImageUrl || undefined,
          consentAccepted: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Unable to submit custom design request.');
      } else {
        setSubmitted({
          referenceCode: data.request.referenceCode,
          whatsappUrl: data.whatsappUrl,
        });
      }
    } catch {
      setError('Network error submitting request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-shell py-12">
      <div className="mx-auto max-w-2xl">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-gold-deep">
          <Sparkles className="h-3.5 w-3.5" /> Bespoke Commission
        </p>
        <h1 className="section-title mt-2">Custom Jewellery Design Request</h1>
        <p className="mt-2 text-sm text-muted sm:text-base">
          Describe your custom Panchadhatu or 316L steel ornament. Our Butwal workshop creates a unique reference ID and opens a pre-filled WhatsApp brief for quick artisan consultation.
        </p>

        {submitted ? (
          <div className="card mt-8 p-8 text-center">
            <CheckCircle2 className="mx-auto h-10 w-10 text-success" />
            <h2 className="mt-4 font-serif text-3xl font-semibold text-ink">
              Request Logged: {submitted.referenceCode}
            </h2>
            <p className="mt-2 text-sm text-muted">
              Our workshop team has received your design brief. Continue directly on WhatsApp to share reference photos and confirm sizing and pricing.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <a
                href={submitted.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-medium text-white hover:bg-gold-deep"
              >
                <MessageCircle className="h-4 w-4" />
                Continue on WhatsApp
              </a>
              <button
                type="button"
                onClick={() => {
                  setSubmitted(null);
                  setDescription('');
                }}
                className="rounded-full border border-line px-5 py-3 text-sm font-medium text-ink"
              >
                Submit Another Request
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="card mt-8 space-y-5 p-6 sm:p-8">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium text-ink">
                Your Name *
                <input
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Full name"
                  className="mt-1.5 w-full rounded-xl border border-line bg-[#FAF8F4] px-3.5 py-2.5 text-sm outline-none focus:border-gold"
                />
              </label>

              <label className="text-sm font-medium text-ink">
                Phone / WhatsApp *
                <input
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="98XXXXXXXX"
                  className="mt-1.5 w-full rounded-xl border border-line bg-[#FAF8F4] px-3.5 py-2.5 text-sm outline-none focus:border-gold"
                />
              </label>

              <label className="text-sm font-medium text-ink">
                Preferred Material *
                <select
                  value={preferredMaterial}
                  onChange={(e) => setPreferredMaterial(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-line bg-[#FAF8F4] px-3.5 py-2.5 text-sm outline-none focus:border-gold"
                >
                  <option value="Panchadhatu">Panchadhatu (Traditional Five-Metal)</option>
                  <option value="316L Surgical Steel">316L Surgical Steel</option>
                  <option value="Mixed Panchadhatu & Stone">Mixed Panchadhatu &amp; Stone Inlay</option>
                </select>
              </label>

              <label className="text-sm font-medium text-ink">
                Target Budget (NPR, optional)
                <input
                  value={budgetNote}
                  onChange={(e) => setBudgetNote(e.target.value)}
                  placeholder="e.g. NPR 4,000 – 8,000"
                  className="mt-1.5 w-full rounded-xl border border-line bg-[#FAF8F4] px-3.5 py-2.5 text-sm outline-none focus:border-gold"
                />
              </label>
            </div>

            <label className="block text-sm font-medium text-ink">
              Reference Image URL (optional)
              <input
                value={referenceImageUrl}
                onChange={(e) => setReferenceImageUrl(e.target.value)}
                placeholder="https://..."
                className="mt-1.5 w-full rounded-xl border border-line bg-[#FAF8F4] px-3.5 py-2.5 text-sm outline-none focus:border-gold"
              />
            </label>

            <label className="block text-sm font-medium text-ink">
              Design Description &amp; Measurements *
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe ornament type, engraving text, bangle/ring size, stone preference, or ceremony date..."
                className="mt-1.5 w-full rounded-xl border border-line bg-[#FAF8F4] px-3.5 py-2.5 text-sm outline-none focus:border-gold"
              />
            </label>

            <label className="flex items-start gap-3 rounded-xl border border-line bg-sand/60 p-4 text-xs leading-relaxed text-ink">
              <input
                type="checkbox"
                checked={consentAccepted}
                onChange={(e) => setConsentAccepted(e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-gold"
              />
              <span>
                I agree to be contacted by Radhakrishna Panchadhatu via phone or WhatsApp regarding feasibility, pricing, and delivery timelines for my custom design request.
              </span>
            </label>

            {error && <p className="text-xs font-medium text-danger">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-full bg-gold px-6 py-3.5 text-sm font-medium text-white transition hover:bg-gold-deep disabled:opacity-50"
            >
              {submitting ? 'Submitting Request...' : 'Submit Custom Request'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
