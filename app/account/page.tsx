'use client';

import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { ArrowRight, Heart, LogIn, LogOut, Package, Search, UserCheck } from 'lucide-react';
import { SpendingChart } from '@/components/account/spending-chart';
import { useStore } from '@/components/providers/store-provider';
import { fetchUserOrdersFromFirestore } from '@/lib/firebase/client';
import { formatNPR } from '@/lib/store/money';
import {
  buildSixMonthSpendingSeries,
  getSavedTrackedOrderTokens,
  normalizeFirestoreOrder,
  saveTrackedOrderToken,
  type AccountOrderSummary,
} from '@/lib/store/order-history';

interface TrackedOrderApiResponse {
  order?: {
    orderNumber: string;
    trackingToken: string;
    fulfilmentStatus: string;
    paymentStatus: string;
    totalPaisa: number;
    createdAt: string;
    items?: { quantity?: number }[];
  };
  error?: string;
}

export default function AccountPage() {
  const { user, authLoading, signInWithGoogle, signOutUser, wishlist } = useStore();
  const [authError, setAuthError] = useState<string | null>(null);
  const [orders, setOrders] = useState<AccountOrderSummary[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  const [linkOrderNumber, setLinkOrderNumber] = useState('');
  const [linkPhone, setLinkPhone] = useState('');
  const [linkLoading, setLinkLoading] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [linkSuccess, setLinkSuccess] = useState<string | null>(null);

  const userUid = user?.uid ?? '';

  const loadAccountOrders = useCallback(async () => {
    setOrdersLoading(true);
    try {
      const merged = new Map<string, AccountOrderSummary>();

      if (userUid) {
        try {
          const firestoreRows = await fetchUserOrdersFromFirestore(userUid);
          for (const row of firestoreRows || []) {
            const normalized = normalizeFirestoreOrder(row);
            if (normalized) {
              merged.set(normalized.orderNumber, normalized);
            }
          }
        } catch {
          // Ignore Firestore fetch failure when client Firebase is unconfigured
        }
      }

      const tokens = getSavedTrackedOrderTokens();
      if (tokens.length > 0) {
        const fetched = await Promise.all(
          tokens.map(async (token) => {
            try {
              const res = await fetch(`/api/orders/track?token=${encodeURIComponent(token)}`);
              if (!res.ok) return null;
              const data = (await res.json()) as TrackedOrderApiResponse;
              if (!data.order) return null;
              const itemCount = (data.order.items || []).reduce(
                (sum, item) => sum + (item.quantity || 1),
                0
              );
              const summary: AccountOrderSummary = {
                orderNumber: data.order.orderNumber,
                trackingToken: data.order.trackingToken,
                totalPaisa: data.order.totalPaisa,
                paymentStatus: data.order.paymentStatus,
                fulfilmentStatus: data.order.fulfilmentStatus,
                createdAt: data.order.createdAt,
                itemCount: itemCount || 1,
              };
              return summary;
            } catch {
              return null;
            }
          })
        );

        for (const item of fetched) {
          if (item && !merged.has(item.orderNumber)) {
            merged.set(item.orderNumber, item);
          }
        }
      }

      const sorted = Array.from(merged.values()).sort((a, b) =>
        b.createdAt.localeCompare(a.createdAt)
      );
      setOrders(sorted);
    } finally {
      setOrdersLoading(false);
    }
  }, [userUid]);

  useEffect(() => {
    loadAccountOrders();
  }, [loadAccountOrders]);

  const spendingSummary = useMemo(() => buildSixMonthSpendingSeries(orders), [orders]);

  const handleGoogleSignIn = async () => {
    setAuthError(null);
    try {
      await signInWithGoogle();
    } catch (err) {
      setAuthError(
        err instanceof Error ? err.message : 'Unable to complete Google sign-in right now.'
      );
    }
  };

  const handleLinkOrder = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!linkOrderNumber.trim() || !linkPhone.trim()) return;

    setLinkLoading(true);
    setLinkError(null);
    setLinkSuccess(null);

    try {
      const params = new URLSearchParams({
        orderNumber: linkOrderNumber.trim(),
        phone: linkPhone.trim(),
      });
      const res = await fetch(`/api/orders/track?${params.toString()}`);
      const data = (await res.json()) as TrackedOrderApiResponse;

      if (!res.ok || !data.order) {
        setLinkError(data.error || 'No matching order found for that number and phone.');
      } else {
        saveTrackedOrderToken(data.order.trackingToken);
        setLinkSuccess(`Added order ${data.order.orderNumber} to your spending history.`);
        setLinkOrderNumber('');
        setLinkPhone('');
        await loadAccountOrders();
      }
    } catch {
      setLinkError('Unable to verify order right now. Please try again.');
    } finally {
      setLinkLoading(false);
    }
  };

  return (
    <div className="container-shell py-12">
      <div className="mx-auto max-w-5xl space-y-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-deep">
            Customer Account
          </p>
          <h1 className="section-title mt-2">Your Account, Spending &amp; Saved Pieces</h1>
        </div>

        {authLoading ? (
          <div className="card p-8 text-sm text-muted">Checking account session...</div>
        ) : !user ? (
          <div className="card p-6 sm:p-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-serif text-2xl font-semibold text-ink">
                  Sign in with Google
                </h2>
                <p className="mt-2 max-w-xl text-sm text-muted">
                  Guest checkout works without an account. Sign in with Google to sync your profile, wishlist, and order history across devices.
                </p>
                {authError && <p className="mt-3 text-xs font-medium text-danger">{authError}</p>}
              </div>
              <div className="flex flex-wrap gap-3 shrink-0">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-medium text-white transition hover:bg-gold-deep whitespace-nowrap"
                >
                  <LogIn className="h-4 w-4" />
                  Continue with Google
                </button>
                <Link
                  href="/wishlist"
                  className="inline-flex items-center gap-2 rounded-full border border-line px-5 py-3 text-sm font-medium text-ink transition hover:border-gold whitespace-nowrap"
                >
                  <Heart className="h-4 w-4 text-gold-deep" />
                  Wishlist ({wishlist.length})
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="card flex flex-wrap items-center justify-between gap-4 p-6">
              <div className="flex items-center gap-3.5">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sand text-gold-deep">
                  <UserCheck className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-serif text-2xl font-semibold text-ink">
                    {user.displayName || 'Verified Customer'}
                  </h2>
                  <p className="text-xs text-muted">{user.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => signOutUser()}
                className="inline-flex items-center gap-1.5 rounded-full border border-line px-4 py-2 text-xs font-medium text-ink transition hover:border-danger hover:text-danger"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign Out
              </button>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Link href="/wishlist" className="card p-6 transition hover:border-gold">
                <Heart className="h-5 w-5 text-gold-deep" />
                <h3 className="mt-3 font-serif text-xl font-semibold text-ink">Saved Wishlist</h3>
                <p className="mt-1 text-sm text-muted tabular-nums">
                  {wishlist.length} saved jewellery {wishlist.length === 1 ? 'piece' : 'pieces'}
                </p>
              </Link>

              <Link href="/track-order" className="card p-6 transition hover:border-gold">
                <Package className="h-5 w-5 text-gold-deep" />
                <h3 className="mt-3 font-serif text-xl font-semibold text-ink">Order Tracking</h3>
                <p className="mt-1 text-sm text-muted tabular-nums">
                  Look up any order by number &amp; phone ({orders.length} linked{' '}
                  {orders.length === 1 ? 'record' : 'records'})
                </p>
              </Link>
            </div>
          </div>
        )}

        {/* 6-Month Recharts Spending Visualization */}
        <SpendingChart summary={spendingSummary} loading={ordersLoading} />

        {/* Link Order & Linked Order History */}
        <section className="card p-6 sm:p-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-deep">
                Order Ledger
              </p>
              <h2 className="mt-1 font-serif text-2xl font-semibold text-ink">
                Linked Orders &amp; Receipts
              </h2>
              <p className="mt-1 text-sm text-muted">
                Orders placed in this browser appear automatically. You can also verify any previous order by number and checkout phone.
              </p>
            </div>
          </div>

          <form
            onSubmit={handleLinkOrder}
            className="mt-5 grid gap-3 sm:grid-cols-[1fr_1fr_auto]"
          >
            <input
              required
              value={linkOrderNumber}
              onChange={(e) => setLinkOrderNumber(e.target.value)}
              placeholder="Order Number (e.g. RKP-2026-1001)"
              aria-label="Order Number"
              className="rounded-xl border border-line bg-field px-3.5 py-2.5 text-sm text-ink outline-none focus:border-gold"
            />
            <input
              required
              value={linkPhone}
              onChange={(e) => setLinkPhone(e.target.value)}
              placeholder="Checkout Phone (e.g. 9841000000)"
              aria-label="Checkout Phone Number"
              className="rounded-xl border border-line bg-field px-3.5 py-2.5 text-sm text-ink outline-none focus:border-gold"
            />
            <button
              type="submit"
              disabled={linkLoading}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-6 py-2.5 text-sm font-medium text-surface transition hover:bg-gold-deep disabled:opacity-50 whitespace-nowrap"
            >
              <Search className="h-4 w-4" />
              {linkLoading ? 'Verifying...' : 'Link Order'}
            </button>
          </form>

          {linkError && <p className="mt-3 text-xs font-medium text-danger">{linkError}</p>}
          {linkSuccess && <p className="mt-3 text-xs font-medium text-success">{linkSuccess}</p>}

          {orders.length > 0 && (
            <div className="mt-6 divide-y divide-line border-t border-line">
              {orders.map((order) => (
                <div
                  key={order.orderNumber}
                  className="flex flex-wrap items-center justify-between gap-4 py-4"
                >
                  <div>
                    <p className="font-serif text-lg font-semibold text-ink">
                      {order.orderNumber}
                    </p>
                    <p className="mt-0.5 text-xs text-muted tabular-nums">
                      {new Date(order.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}{' '}
                      &middot; {order.itemCount} {order.itemCount === 1 ? 'item' : 'items'} &middot;{' '}
                      {order.fulfilmentStatus.replaceAll('_', ' ')}
                    </p>
                  </div>

                  <div className="flex items-center gap-5">
                    <div className="text-right tabular-nums">
                      <p className="text-sm font-semibold text-ink">
                        {formatNPR(order.totalPaisa)}
                      </p>
                      <p className="text-xs text-muted">{order.paymentStatus}</p>
                    </div>
                    {order.trackingToken && (
                      <Link
                        href={`/track-order/${encodeURIComponent(order.trackingToken)}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-gold-deep transition hover:text-ink whitespace-nowrap"
                      >
                        Track
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
