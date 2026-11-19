import Link from 'next/link';
import { CheckCircle2, PackageCheck } from 'lucide-react';
import { formatNPR } from '@/lib/store/money';
import { getStore } from '@/lib/store/repository';

export const dynamic = 'force-dynamic';

export default function OrderSuccessPage({
  searchParams,
}: {
  searchParams: { orderNumber?: string; token?: string };
}) {
  const store = getStore();
  const order = store.orders.find(
    (o) =>
      (searchParams.token && o.trackingToken === searchParams.token) ||
      (searchParams.orderNumber && o.orderNumber === searchParams.orderNumber)
  );

  return (
    <div className="container-shell py-14">
      <div className="card mx-auto max-w-2xl p-8 sm:p-10">
        <div className="flex items-center gap-3 text-success">
          <CheckCircle2 className="h-8 w-8 shrink-0" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em]">Order Confirmed</p>
            <h1 className="font-serif text-3xl font-semibold text-ink">
              Thank You for Your Order
            </h1>
          </div>
        </div>

        {order ? (
          <div className="mt-6 space-y-5">
            <div className="grid gap-4 rounded-2xl border border-line bg-sand/70 p-5 text-sm sm:grid-cols-3">
              <div>
                <p className="text-xs text-muted">Order Number</p>
                <p className="mt-1 font-semibold text-ink">{order.orderNumber}</p>
              </div>
              <div>
                <p className="text-xs text-muted">Payment Status</p>
                <p className="mt-1 font-semibold text-ink">
                  {order.paymentMethod} &middot; {order.paymentStatus}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted">Total Paid / Due</p>
                <p className="mt-1 font-semibold text-ink tabular-nums">
                  {formatNPR(order.totalPaisa)}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-line p-5">
              <h2 className="font-serif text-xl font-semibold text-ink">Items Ordered</h2>
              <ul className="mt-3 divide-y divide-line text-sm">
                {order.items.map((item) => (
                  <li key={item.id} className="flex justify-between py-2.5">
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

            <div className="flex flex-wrap gap-3">
              <Link
                href={`/track-order/${order.trackingToken}`}
                className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-medium text-white hover:bg-gold-deep"
              >
                <PackageCheck className="h-4 w-4" />
                Track This Order Live
              </Link>
              <Link
                href="/catalog"
                className="inline-flex items-center rounded-full border border-line px-6 py-3 text-sm font-medium text-ink hover:border-gold"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-6">
            <p className="text-sm text-muted">
              Your order request was recorded. Use your order number and phone number on the order tracking page to check status anytime.
            </p>
            <Link
              href="/track-order"
              className="mt-5 inline-flex rounded-full bg-gold px-6 py-3 text-sm font-medium text-white"
            >
              Go to Order Tracking
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
