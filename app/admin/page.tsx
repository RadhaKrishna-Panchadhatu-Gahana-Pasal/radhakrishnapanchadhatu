import Link from 'next/link';
import { formatNPR } from '@/lib/store/money';
import { getStore } from '@/lib/store/repository';

export const dynamic = 'force-dynamic';

export default function AdminOverviewPage() {
  const store = getStore();
  const paidOrders = store.orders.filter((o) => o.paymentStatus === 'PAID');
  const verifiedRevenuePaisa = paidOrders.reduce((sum, o) => sum + o.totalPaisa, 0);
  const pendingFulfilment = store.orders.filter(
    (o) => !['DELIVERED', 'CANCELLED', 'RETURNED'].includes(o.fulfilmentStatus)
  );
  const lowStockProducts = store.products.filter(
    (p) => p.status === 'PUBLISHED' && p.stockQuantity <= p.lowStockThreshold
  );
  const pendingReviews = store.reviews.filter((r) => r.status === 'PENDING');
  const openCustomLeads = store.customOrderRequests.filter((r) => r.status === 'NEW');

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-deep">
            Operations Overview
          </p>
          <h1 className="section-title mt-2">Store Management</h1>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <Link
            href="/admin/products/new"
            className="rounded-full bg-gold px-5 py-2 text-xs font-medium text-white hover:bg-gold-deep"
          >
            + Add Product
          </Link>
          <Link
            href="/admin/orders"
            className="rounded-full border border-line bg-surface px-5 py-2 text-xs font-medium text-ink hover:border-gold"
          >
            Manage Orders
          </Link>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="card p-5">
          <p className="text-xs uppercase tracking-[0.16em] text-muted">Verified Revenue</p>
          <p className="mt-2 font-serif text-3xl font-semibold text-ink tabular-nums">
            {formatNPR(verifiedRevenuePaisa)}
          </p>
          <p className="mt-1 text-xs text-muted tabular-nums">{paidOrders.length} paid orders</p>
        </div>

        <div className="card p-5">
          <p className="text-xs uppercase tracking-[0.16em] text-muted">Orders Awaiting Action</p>
          <p className="mt-2 font-serif text-3xl font-semibold text-gold-deep tabular-nums">
            {pendingFulfilment.length}
          </p>
          <p className="mt-1 text-xs text-muted tabular-nums">
            Total orders: {store.orders.length}
          </p>
        </div>

        <div className="card p-5">
          <p className="text-xs uppercase tracking-[0.16em] text-muted">Low Stock Alerts</p>
          <p className="mt-2 font-serif text-3xl font-semibold text-warning tabular-nums">
            {lowStockProducts.length}
          </p>
          <p className="mt-1 text-xs text-muted">Published SKUs at or below threshold</p>
        </div>

        <div className="card p-5">
          <p className="text-xs uppercase tracking-[0.16em] text-muted">Queues</p>
          <p className="mt-2 font-serif text-3xl font-semibold text-ink tabular-nums">
            {pendingReviews.length + openCustomLeads.length}
          </p>
          <p className="mt-1 text-xs text-muted tabular-nums">
            {pendingReviews.length} reviews &middot; {openCustomLeads.length} custom requests
          </p>
        </div>
      </div>

      {/* Recent Orders + Low Stock */}
      <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl font-semibold text-ink">Recent Orders</h2>
            <Link href="/admin/orders" className="text-xs font-medium text-gold-deep underline">
              View All
            </Link>
          </div>
          <div className="mt-4 divide-y divide-line text-sm">
            {store.orders.slice(0, 6).map((ord) => (
              <div key={ord.id} className="flex items-center justify-between gap-3 py-3">
                <div>
                  <p className="font-semibold text-ink">{ord.orderNumber}</p>
                  <p className="text-xs text-muted">
                    {ord.customerName} &middot; {ord.address.province}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-ink tabular-nums">{formatNPR(ord.totalPaisa)}</p>
                  <p className="text-xs text-muted">
                    {ord.fulfilmentStatus} &middot; {ord.paymentStatus}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl font-semibold text-ink">Low Stock SKUs</h2>
            <Link href="/admin/inventory" className="text-xs font-medium text-gold-deep underline">
              Inventory Log
            </Link>
          </div>
          {lowStockProducts.length === 0 ? (
            <p className="mt-4 text-sm text-muted">All published items are comfortably stocked.</p>
          ) : (
            <div className="mt-4 divide-y divide-line text-sm">
              {lowStockProducts.map((p) => (
                <div key={p.id} className="flex items-center justify-between py-3">
                  <div>
                    <Link
                      href={`/admin/products/${p.id}`}
                      className="font-medium text-ink hover:text-gold-deep"
                    >
                      {p.name}
                    </Link>
                    <p className="text-xs text-muted">{p.sku}</p>
                  </div>
                  <span className="font-semibold text-warning tabular-nums">
                    {p.stockQuantity} left
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
