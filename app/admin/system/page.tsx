'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, Database, HardDriveDownload, Mail, MessageCircle, RefreshCw } from 'lucide-react';
import { formatNPR } from '@/lib/store/money';
import type { AbandonedCart, AnalyticsDay, BackupRecord, NotificationLogEntry, SystemEvent } from '@/lib/store/types';

interface SystemPayload {
  storage: 'database' | 'file';
  hydrated: boolean;
  database: {
    configured: boolean;
    connected: boolean;
    updatedAt: string | null;
    revision: number | null;
    error: string | null;
  };
  errors: SystemEvent[];
  backups: BackupRecord[];
  analytics: { days: AnalyticsDay[]; totals: Record<string, number>; conversionRate: number | null };
  notifications: NotificationLogEntry[];
  abandonedCarts: AbandonedCart[];
  emailConfigured: boolean;
  whatsappConfigured: boolean;
  cronConfigured: boolean;
}

const FUNNEL: { key: string; label: string }[] = [
  { key: 'catalog_view', label: 'Catalogue views' },
  { key: 'product_view', label: 'Product views' },
  { key: 'add_to_cart', label: 'Add to cart' },
  { key: 'checkout_start', label: 'Checkout started' },
  { key: 'purchase', label: 'Purchases' },
];

export default function AdminSystemPage() {
  const [data, setData] = useState<SystemPayload | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const load = async () => {
    const res = await fetch('/api/admin/system');
    if (res.ok) setData(await res.json());
  };

  useEffect(() => {
    load();
    const timer = setInterval(load, 60_000);
    return () => clearInterval(timer);
  }, []);

  const backupNow = async () => {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/system', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'manual-admin' }),
      });
      const payload = await res.json();
      setMessage(
        res.ok
          ? `Backup ${payload.backup.id} created (${payload.backup.orders} orders, ${payload.backup.sizeBytes} bytes).`
          : payload.error || 'Backup failed.'
      );
      await load();
    } finally {
      setBusy(false);
    }
  };

  if (!data) {
    return <div className="card p-8 text-sm text-muted">Loading system health…</div>;
  }

  const paidOrders = data.analytics.totals.purchase ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-deep">
            Reliability
          </p>
          <h1 className="section-title mt-2">System &amp; Backups</h1>
        </div>
        <button
          type="button"
          onClick={backupNow}
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-sm font-medium text-white hover:bg-gold-deep disabled:opacity-50"
        >
          <HardDriveDownload aria-hidden="true" className="h-4 w-4" />
          {busy ? 'Backing up…' : 'Back up now'}
        </button>
      </div>

      {message && <p className="rounded-xl border border-line bg-sand/50 p-3 text-xs text-ink">{message}</p>}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="card p-5">
          <p className="flex items-center gap-1.5 text-xs uppercase tracking-[0.14em] text-muted">
            <Database aria-hidden="true" className="h-3.5 w-3.5" /> Storage
          </p>
          <p className="mt-2 text-lg font-semibold text-ink">
            {data.storage === 'database' ? 'Postgres' : 'Local JSON'}
          </p>
          <p className="mt-1 text-xs text-muted">
            {data.database.configured
              ? data.database.connected
                ? `Connected · revision ${data.database.revision ?? '—'}`
                : 'Not reachable'
              : 'No DATABASE_URL configured'}
          </p>
        </div>
        <div className="card p-5">
          <p className="text-xs uppercase tracking-[0.14em] text-muted">Email</p>
          <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-ink">
            <Mail aria-hidden="true" className="h-4 w-4 text-gold-deep" />
            {data.emailConfigured ? 'Configured' : 'Not configured'}
          </p>
          <p className="mt-1 text-xs text-muted">Order + status emails</p>
        </div>
        <div className="card p-5">
          <p className="text-xs uppercase tracking-[0.14em] text-muted">WhatsApp</p>
          <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-ink">
            <MessageCircle aria-hidden="true" className="h-4 w-4 text-gold-deep" />
            {data.whatsappConfigured ? 'Cloud API ready' : 'Not configured'}
          </p>
          <p className="mt-1 text-xs text-muted">Order updates</p>
        </div>
        <div className="card p-5">
          <p className="text-xs uppercase tracking-[0.14em] text-muted">Daily job</p>
          <p className="mt-2 text-sm font-semibold text-ink">
            {data.cronConfigured ? 'CRON_SECRET set' : 'CRON_SECRET missing'}
          </p>
          <p className="mt-1 text-xs text-muted">03:00 NPT · /api/cron/maintenance</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl font-semibold text-ink">30-day funnel</h2>
            <span className="text-xs text-muted">Consented visits only</span>
          </div>
          <div className="mt-4 space-y-2.5">
            {FUNNEL.map((step) => {
              const value = data.analytics.totals[step.key] ?? 0;
              const max = Math.max(1, ...FUNNEL.map((entry) => data.analytics.totals[entry.key] ?? 0));
              return (
                <div key={step.key}>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted">{step.label}</span>
                    <span className="font-semibold tabular-nums text-ink">{value}</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-sand">
                    <div
                      className="h-full rounded-full bg-gold"
                      style={{ width: `${Math.round((value / max) * 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mt-4 text-xs text-muted">
            Checkout → purchase rate:{' '}
            <strong className="text-ink">
              {data.analytics.conversionRate === null ? '—' : `${data.analytics.conversionRate}%`}
            </strong>{' '}
            · {paidOrders} tracked purchases
          </p>
        </div>

        <div className="card p-6">
          <h2 className="font-serif text-xl font-semibold text-ink">Recent errors</h2>
          {data.errors.length === 0 ? (
            <p className="mt-3 text-sm text-muted">No errors recorded. 🎉</p>
          ) : (
            <ul className="mt-3 max-h-72 space-y-2 overflow-y-auto pr-1 text-xs">
              {data.errors.map((event) => (
                <li key={event.id} className="rounded-xl border border-line bg-sand/40 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1 font-semibold text-danger">
                      <AlertTriangle aria-hidden="true" className="h-3.5 w-3.5" />
                      {event.scope}
                    </span>
                    <span className="text-[11px] text-muted tabular-nums">
                      {new Date(event.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="mt-1 text-ink">{event.message}</p>
                  {event.path && <p className="mt-0.5 font-mono text-[11px] text-muted">{event.path}</p>}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <h2 className="font-serif text-xl font-semibold text-ink">Backups</h2>
          {data.backups.length === 0 ? (
            <p className="mt-3 text-sm text-muted">No backups yet — the nightly job creates one.</p>
          ) : (
            <ul className="mt-3 divide-y divide-line text-xs">
              {data.backups.map((backup) => (
                <li key={backup.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div>
                    <p className="font-semibold text-ink">{backup.reason}</p>
                    <p className="text-muted">
                      {new Date(backup.createdAt).toLocaleString()} · {backup.orders} orders ·{' '}
                      {(backup.sizeBytes / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <span className="font-mono text-[11px] text-muted">{backup.id}</span>
                </li>
              ))}
            </ul>
          )}
          <a
            href="/api/admin/backup"
            className="mt-4 inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-xs font-medium text-ink hover:border-gold"
          >
            <RefreshCw aria-hidden="true" className="h-3.5 w-3.5" /> Download current snapshot (JSON)
          </a>
        </div>

        <div className="card p-6">
          <h2 className="font-serif text-xl font-semibold text-ink">Notification log</h2>
          {data.notifications.length === 0 ? (
            <p className="mt-3 text-sm text-muted">Nothing sent yet.</p>
          ) : (
            <ul className="mt-3 max-h-72 divide-y divide-line overflow-y-auto pr-1 text-xs">
              {data.notifications.map((entry) => (
                <li key={entry.id} className="py-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-ink">
                      {entry.channel} · {entry.status}
                    </span>
                    <span className="text-[11px] text-muted">
                      {new Date(entry.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-muted">
                    {entry.subject} → {entry.to}
                  </p>
                  {entry.detail && <p className="text-[11px] text-muted">{entry.detail}</p>}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="card p-6">
        <h2 className="font-serif text-xl font-semibold text-ink">Abandoned bags</h2>
        {data.abandonedCarts.length === 0 ? (
          <p className="mt-3 text-sm text-muted">No captured carts yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-line text-xs">
            {data.abandonedCarts.map((cart) => (
              <li key={cart.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                <span className="font-medium text-ink">{cart.email}</span>
                <span className="text-muted tabular-nums">{formatNPR(cart.subtotalPaisa)}</span>
                <span className="text-muted">
                  {cart.recoveredOrderNumber
                    ? `Recovered → ${cart.recoveredOrderNumber}`
                    : cart.remindedAt
                    ? 'Reminder sent'
                    : 'Awaiting reminder'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
