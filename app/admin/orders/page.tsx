'use client';

import { useEffect, useState } from 'react';
import { Printer, Search } from 'lucide-react';
import { formatNPR } from '@/lib/store/money';
import type { FulfilmentStatus, Order, PaymentStatus } from '@/lib/store/types';

const FULFILMENT_STATUSES: FulfilmentStatus[] = [
  'ORDER_PLACED',
  'ORDER_RECEIVED',
  'PROCESSING',
  'READY_TO_DISPATCH',
  'DISPATCHED',
  'IN_TRANSIT',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'CANCELLED',
  'RETURN_REQUESTED',
  'RETURNED',
];

const PAYMENT_STATUSES: PaymentStatus[] = [
  'PENDING',
  'INITIATED',
  'PROCESSING',
  'PAID',
  'FAILED',
  'CANCELLED',
  'EXPIRED',
  'REFUNDED',
  'PARTIALLY_REFUNDED',
  'MANUAL_REVIEW',
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const [saving, setSaving] = useState(false);

  const [fulfilmentStatus, setFulfilmentStatus] = useState<FulfilmentStatus>('ORDER_PLACED');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('PENDING');
  const [courierName, setCourierName] = useState('');
  const [trackingReference, setTrackingReference] = useState('');
  const [publicNote, setPublicNote] = useState('');
  const [internalNote, setInternalNote] = useState('');

  const loadOrders = async (search = q) => {
    const params = new URLSearchParams();
    if (search.trim()) params.set('q', search.trim());
    const res = await fetch(`/api/admin/orders?${params.toString()}`);
    const data = await res.json();
    if (Array.isArray(data.orders)) {
      setOrders(data.orders);
      if (!selectedId && data.orders[0]) {
        selectOrder(data.orders[0]);
      }
    }
  };

  const selectOrder = (ord: Order) => {
    setSelectedId(ord.id);
    setFulfilmentStatus(ord.fulfilmentStatus);
    setPaymentStatus(ord.paymentStatus);
    setCourierName(ord.courierName || '');
    setTrackingReference(ord.trackingReference || '');
    setPublicNote('');
    setInternalNote('');
  };

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeOrder = orders.find((o) => o.id === selectedId) ?? orders[0] ?? null;

  const handleSaveOrder = async () => {
    if (!activeOrder) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: activeOrder.id,
          fulfilmentStatus,
          paymentStatus,
          courierName,
          trackingReference,
          publicNote,
          internalNote,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setOrders((prev) => prev.map((o) => (o.id === data.order.id ? data.order : o)));
        selectOrder(data.order);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-deep">
            Fulfilment &amp; Reconciliation
          </p>
          <h1 className="section-title mt-2">Orders ({orders.length})</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted" />
            <input
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                loadOrders(e.target.value);
              }}
              placeholder="Search RKP- or phone..."
              className="rounded-full border border-line bg-surface py-2 pl-9 pr-4 text-xs outline-none focus:border-gold"
            />
          </div>
          {activeOrder && (
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-4 py-2 text-xs font-medium text-ink hover:border-gold"
            >
              <Printer className="h-3.5 w-3.5" /> Print Invoice
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        {/* Order list */}
        <div className="card divide-y divide-line">
          {orders.map((ord) => (
            <button
              key={ord.id}
              type="button"
              onClick={() => selectOrder(ord)}
              className={`w-full p-4 text-left transition hover:bg-sand/50 ${
                activeOrder?.id === ord.id ? 'bg-sand/80' : ''
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-ink">{ord.orderNumber}</span>
                <span className="font-semibold text-gold-deep tabular-nums">
                  {formatNPR(ord.totalPaisa)}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted">
                {ord.customerName} &middot; {ord.customerPhone}
              </p>
              <p className="mt-1 text-[11px] font-medium text-ink">
                {ord.fulfilmentStatus} &middot; {ord.paymentMethod}: {ord.paymentStatus}
              </p>
            </button>
          ))}
        </div>

        {/* Selected Order Editor */}
        {activeOrder && (
          <div className="card space-y-5 p-6">
            <div className="border-b border-line pb-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h2 className="font-serif text-2xl font-semibold text-ink">
                    {activeOrder.orderNumber}
                  </h2>
                  <p className="text-xs text-muted">
                    Token: <code>{activeOrder.trackingToken}</code>
                  </p>
                </div>
                <div className="text-right text-sm font-semibold tabular-nums">
                  {formatNPR(activeOrder.totalPaisa)}
                </div>
              </div>
              <p className="mt-2 text-xs text-muted">
                {activeOrder.address.fullName} ({activeOrder.address.phone}) &mdash;{' '}
                {activeOrder.address.street}, Ward {activeOrder.address.ward},{' '}
                {activeOrder.address.municipality}, {activeOrder.address.district},{' '}
                {activeOrder.address.province}
              </p>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                Items
              </h3>
              <ul className="mt-2 divide-y divide-line text-sm">
                {activeOrder.items.map((item) => (
                  <li key={item.id} className="flex justify-between py-2">
                    <span>
                      {item.productName} {item.variantLabel ? `(${item.variantLabel})` : ''} &times;{' '}
                      {item.quantity}
                    </span>
                    <span className="tabular-nums font-medium">
                      {formatNPR(item.unitPricePaisa * item.quantity)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid gap-4 border-t border-line pt-4 sm:grid-cols-2">
              <label className="text-xs font-medium text-ink">
                Fulfilment Status
                <select
                  value={fulfilmentStatus}
                  onChange={(e) => setFulfilmentStatus(e.target.value as FulfilmentStatus)}
                  className="mt-1 w-full rounded-xl border border-line bg-[#FAF8F4] px-3 py-2 text-sm outline-none focus:border-gold"
                >
                  {FULFILMENT_STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-xs font-medium text-ink">
                Payment Status
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
                  className="mt-1 w-full rounded-xl border border-line bg-[#FAF8F4] px-3 py-2 text-sm outline-none focus:border-gold"
                >
                  {PAYMENT_STATUSES.map((pst) => (
                    <option key={pst} value={pst}>
                      {pst}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-xs font-medium text-ink">
                Courier Partner
                <input
                  value={courierName}
                  onChange={(e) => setCourierName(e.target.value)}
                  placeholder="Nepal Can Move / Upaya"
                  className="mt-1 w-full rounded-xl border border-line bg-[#FAF8F4] px-3 py-2 text-sm outline-none focus:border-gold"
                />
              </label>

              <label className="text-xs font-medium text-ink">
                Courier Tracking Ref
                <input
                  value={trackingReference}
                  onChange={(e) => setTrackingReference(e.target.value)}
                  placeholder="NCM-..."
                  className="mt-1 w-full rounded-xl border border-line bg-[#FAF8F4] px-3 py-2 text-sm outline-none focus:border-gold"
                />
              </label>

              <label className="text-xs font-medium text-ink sm:col-span-2">
                Public Customer Timeline Note
                <input
                  value={publicNote}
                  onChange={(e) => setPublicNote(e.target.value)}
                  placeholder="Shown on customer tracking timeline..."
                  className="mt-1 w-full rounded-xl border border-line bg-[#FAF8F4] px-3 py-2 text-sm outline-none focus:border-gold"
                />
              </label>

              <label className="text-xs font-medium text-ink sm:col-span-2">
                Internal Staff Note
                <input
                  value={internalNote}
                  onChange={(e) => setInternalNote(e.target.value)}
                  placeholder="Internal packing or COD reconciliation note..."
                  className="mt-1 w-full rounded-xl border border-line bg-[#FAF8F4] px-3 py-2 text-sm outline-none focus:border-gold"
                />
              </label>
            </div>

            <button
              type="button"
              disabled={saving}
              onClick={handleSaveOrder}
              className="w-full rounded-full bg-gold px-5 py-2.5 text-sm font-medium text-white hover:bg-gold-deep disabled:opacity-50"
            >
              {saving ? 'Updating Order...' : 'Save Order & Append Timeline'}
            </button>

            <div className="border-t border-line pt-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                Timeline History
              </p>
              <ul className="mt-2 space-y-2 text-xs">
                {activeOrder.timeline.map((t) => (
                  <li key={t.id} className="rounded-lg bg-sand/60 p-2.5">
                    <strong>{t.toStatus}</strong> &mdash; {t.publicNote}
                    {t.internalNote && (
                      <span className="block text-[11px] text-muted">
                        Internal: {t.internalNote}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
