'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, LogIn, LogOut, Package, UserCheck } from 'lucide-react';
import { useStore } from '@/components/providers/store-provider';
import { fetchUserOrdersFromFirestore } from '@/lib/firebase/client';

export default function AccountPage() {
  const { user, authLoading, signInWithGoogle, signOutUser, wishlist } = useStore();
  const [authError, setAuthError] = useState<string | null>(null);
  const [firestoreOrders, setFirestoreOrders] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    if (!user) {
      setFirestoreOrders([]);
      return;
    }
    fetchUserOrdersFromFirestore(user.uid)
      .then((rows) => setFirestoreOrders(rows || []))
      .catch(() => {});
  }, [user]);

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

  return (
    <div className="container-shell py-12">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-deep">
          Customer Account
        </p>
        <h1 className="section-title mt-2">Your Account &amp; Saved Pieces</h1>

        {authLoading ? (
          <div className="card mt-8 p-8 text-sm text-muted">Checking account session...</div>
        ) : !user ? (
          <div className="card mt-8 p-8">
            <h2 className="font-serif text-2xl font-semibold text-ink">
              Sign in with Google
            </h2>
            <p className="mt-2 max-w-xl text-sm text-muted">
              Guest checkout works without an account. Sign in with Google to save your profile and sync wishlist items across devices.
            </p>
            {authError && <p className="mt-3 text-xs font-medium text-danger">{authError}</p>}
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-medium text-white hover:bg-gold-deep"
              >
                <LogIn className="h-4 w-4" />
                Continue with Google
              </button>
              <Link
                href="/track-order"
                className="inline-flex items-center gap-2 rounded-full border border-line px-6 py-3 text-sm font-medium text-ink hover:border-gold"
              >
                Guest Order Lookup
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-8 space-y-6">
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
                className="inline-flex items-center gap-1.5 rounded-full border border-line px-4 py-2 text-xs font-medium text-ink hover:border-danger hover:text-danger"
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
                <p className="mt-1 text-sm text-muted">
                  Look up any order by number &amp; phone ({firestoreOrders.length} synced records)
                </p>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
