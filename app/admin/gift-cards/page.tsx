'use client';

import { useEffect, useState } from 'react';
import { Gift, Send } from 'lucide-react';
import { formatNPR } from '@/lib/store/money';
import type { GiftCard } from '@/lib/store/types';

export default function AdminGiftCardsPage() {
  const [giftCards, setGiftCards] = useState<GiftCard[]>([]);
  const [amount, setAmount] = useState('1000');
  const [note, setNote] = useState('');
  const [email, setEmail] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const load = async () => {
    const res = await fetch('/api/admin/gift-cards');
    const data = await res.json();
    if (Array.isArray(data.giftCards)) setGiftCards(data.giftCards);
  };

  useEffect(() => {
    load();
  }, []);

  const issue = async () => {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/gift-cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amountNpr: Number(amount),
          note: note || undefined,
          email: email || undefined,
          recipientName: recipientName || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || 'Could not issue the gift card.');
      } else {
        setMessage(
          `Issued ${data.giftCard.code} for ${formatNPR(data.giftCard.initialPaisa)}` +
            (data.email === 'SENT' ? ' and emailed it to the customer.' : '.')
        );
        setNote('');
        setEmail('');
        setRecipientName('');
        load();
      }
    } finally {
      setBusy(false);
    }
  };

  const toggle = async (card: GiftCard) => {
    await fetch('/api/admin/gift-cards', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: card.code, active: !card.active }),
    });
    load();
  };

  const outstandingPaisa = giftCards
    .filter((card) => card.active)
    .reduce((sum, card) => sum + card.balancePaisa, 0);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-deep">
          Store Credit
        </p>
        <h1 className="section-title mt-2">Gift Cards</h1>
        <p className="mt-1 text-xs text-muted">
          Outstanding balance across active cards: <strong className="text-ink">{formatNPR(outstandingPaisa)}</strong>
        </p>
      </div>

      <div className="card space-y-4 p-6">
        <h2 className="flex items-center gap-2 font-serif text-xl font-semibold text-ink">
          <Gift aria-hidden="true" className="h-4 w-4 text-gold-deep" /> Issue a gift card
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-xs font-medium text-ink">
            Value (NPR)
            <input
              type="number"
              min={1}
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              className="mt-1 w-full rounded-xl border border-line bg-field px-3 py-2 text-sm outline-none focus:border-gold"
            />
          </label>
          <label className="text-xs font-medium text-ink">
            Note (internal)
            <input
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Dashain promotion / exchange credit"
              className="mt-1 w-full rounded-xl border border-line bg-field px-3 py-2 text-sm outline-none focus:border-gold"
            />
          </label>
          <label className="text-xs font-medium text-ink">
            Email the code to (optional)
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="customer@example.com"
              className="mt-1 w-full rounded-xl border border-line bg-field px-3 py-2 text-sm outline-none focus:border-gold"
            />
          </label>
          <label className="text-xs font-medium text-ink">
            Recipient name (optional)
            <input
              value={recipientName}
              onChange={(event) => setRecipientName(event.target.value)}
              placeholder="Sita Sharma"
              className="mt-1 w-full rounded-xl border border-line bg-field px-3 py-2 text-sm outline-none focus:border-gold"
            />
          </label>
        </div>
        <button
          type="button"
          onClick={issue}
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-sm font-medium text-white hover:bg-gold-deep disabled:opacity-50"
        >
          <Send aria-hidden="true" className="h-4 w-4" />
          {busy ? 'Issuing...' : 'Issue gift card'}
        </button>
        {message && <p className="text-xs text-gold-deep">{message}</p>}
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line bg-sand/60 text-xs uppercase tracking-[0.14em] text-muted">
            <tr>
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Initial</th>
              <th className="px-4 py-3">Balance</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Note</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {giftCards.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-xs text-muted">
                  No gift cards issued yet.
                </td>
              </tr>
            ) : (
              giftCards.map((card) => (
                <tr key={card.id} className="hover:bg-sand/30">
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-ink">{card.code}</td>
                  <td className="px-4 py-3 tabular-nums">{formatNPR(card.initialPaisa)}</td>
                  <td className="px-4 py-3 tabular-nums">{formatNPR(card.balancePaisa)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                        card.active ? 'bg-success/10 text-success' : 'bg-sand text-muted'
                      }`}
                    >
                      {card.active ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted">{card.note || '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => toggle(card)}
                      className="rounded-full border border-line px-3 py-1 text-xs font-medium text-ink hover:border-gold"
                    >
                      {card.active ? 'Disable' : 'Enable'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-muted">
        Gift cards are redeemed at checkout, can be used partially, and keep their remaining balance.
        Email delivery requires RESEND_API_KEY and EMAIL_FROM to be configured.
      </p>
    </div>
  );
}
