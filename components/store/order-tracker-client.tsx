'use client';

import { useState, type FormEvent } from 'react';
import { PackageCheck, Search, Truck } from 'lucide-react';
import { formatNPR } from '@/lib/store/money';
import { saveTrackedOrderToken } from '@/lib/store/order-history';

export interface PublicOrderTrackingView {
  orderNumber: string;
  trackingToken: string;
  fulfilmentStatus: string;
  paymentStatus: string;
  paymentMethod: string;
  courierName: string | null;
  trackingReference: string | null;
  province: string;
  municipality: string;
  items: {
    id: string;
    productName: string;
    variantLabel?: string;
    quantity: number;
    unitPricePaisa: number;
  }[];
  totalPaisa: number;
  timeline: {
    id: string;
    toStatus: string;
    publicNote: string;
    createdAt: string;
  }[];
  createdAt: string;
}

export function OrderTrackerClient({
  initialOrder = null,
}: {
  initialOrder?: PublicOrderTrackingView | null;
}) {
  const [orderNumber, setOrderNumber] = useState(initialOrder?.orderNumber || '');
  const [phone, setPhone] = useState('');
  const [order, setOrder] = useState<PublicOrderTrackingView | null>(initialOrder);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLookup = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        orderNumber: orderNumber.trim(),
        phone: phone.trim(),
      });
      const res = await fetch(`/api/orders/track?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) {
        setOrder(null);
        setError(data.error || 'No matching order found.');
      } else {
        setOrder(data.order);
        saveTrackedOrderToken(data.order?.trackingToken);
      }
    } catch {
      setError('Unable to look up order.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-shell py-12">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-deep">
          Order Tracking
        </p>
        <h1 className="section-title mt-2">Track Your Jewellery Order</h1>
        <p className="mt-2 text-sm text-muted">
          Enter your order number and checkout phone number to check live fulfilment and payment status across Nepal.
        </p>

        <form onSubmit={handleLookup} className="card mt-6 grid gap-3 p-5 sm:grid-cols-[1fr_1fr_auto]">
          <input
            required
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder="Order Number (e.g. RKP-2026-1001)"
            className="rounded-xl border border-line bg-[#FAF8F4] px-3.5 py-2.5 text-sm outline-none focus:border-gold"
          />
          <input
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone Number (e.g. 9841000000)"
            className="rounded-xl border border-line bg-[#FAF8F4] px-3.5 py-2.5 text-sm outline-none focus:border-gold"
          />
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-gold px-6 py-2.5 text-sm font-medium text-white hover:bg-gold-deep disabled:opacity-50"
          >
            <Search className="h-4 w-4" />
            {loading ? 'Checking...' : 'Track'}
          </button>
        </form>
        <p className="mt-2 text-xs text-muted">
          Sample order available to test: <span className="font-mono text-ink">RKP-2026-1001</span> with phone{' '}
          <span className="font-mono text-ink">9841000000</span>.
        </p>

        {error && (
          <div className="mt-6 rounded-2xl border border-danger/30 bg-surface p-5 text-sm text-danger">
            {error}
          </div>
        )}

        {order && (
          <div className="card mt-8 p-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line pb-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-deep">
                  Order {order.orderNumber}
                </p>
                <h2 className="mt-1 font-serif text-2xl font-semibold text-ink">
                  {order.fulfilmentStatus.replaceAll('_', ' ')}
                </h2>
                <p className="mt-1 text-xs text-muted">
                  Destination: {order.municipality}, {order.province}
                </p>
              </div>
              <div className="text-right text-sm">
                <p className="text-xs text-muted">Payment Status</p>
                <p className="font-semibold text-ink">
                  {order.paymentMethod} &middot; {order.paymentStatus}
                </p>
                <p className="mt-1 font-semibold text-gold-deep tabular-nums">
                  {formatNPR(order.totalPaisa)}
                </p>
              </div>
            </div>

            {(order.courierName || order.trackingReference) && (
              <div className="mt-5 flex flex-wrap items-center gap-4 rounded-xl border border-line bg-sand/70 p-4 text-sm">
                <Truck className="h-5 w-5 text-gold-deep" />
                <div>
                  <span className="font-medium text-ink">
                    Courier: {order.courierName || 'Assigned Partner'}
                  </span>
                  {order.trackingReference && (
                    <span className="ml-3 text-xs text-muted">
                      Tracking Ref: <strong className="text-ink">{order.trackingReference}</strong>
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className="mt-6">
              <h3 className="flex items-center gap-2 font-serif text-xl font-semibold text-ink">
                <PackageCheck className="h-5 w-5 text-gold-deep" />
                Fulfilment Timeline
              </h3>
              <ol className="mt-4 space-y-4 border-l-2 border-gold/40 pl-5">
                {order.timeline.map((step) => (
                  <li key={step.id} className="relative">
                    <span className="absolute -left-[25px] top-1.5 h-2.5 w-2.5 rounded-full bg-gold" />
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold-deep">
                      {step.toStatus.replaceAll('_', ' ')}
                    </p>
                    <p className="mt-0.5 text-sm text-ink">{step.publicNote}</p>
                    <p className="mt-0.5 text-xs text-muted">
                      {new Date(step.createdAt).toLocaleString()}
                    </p>
                  </li>
                ))}
              </ol>
            </div>

            <div className="mt-6 border-t border-line pt-5">
              <h3 className="font-serif text-lg font-semibold text-ink">Items in Parcel</h3>
              <ul className="mt-2 divide-y divide-line text-sm">
                {order.items.map((item) => (
                  <li key={item.id} className="flex justify-between py-2">
                    <span>
                      {item.productName} {item.variantLabel ? `(${item.variantLabel})` : ''} &times;{' '}
                      {item.quantity}
                    </span>
                    <span className="font-medium tabular-nums">
                      {formatNPR(item.unitPricePaisa * item.quantity)}
                    </span>
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
