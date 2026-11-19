'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { useStore } from '@/components/providers/store-provider';
import { formatNPR } from '@/lib/store/money';

export function CartDrawer() {
  const {
    cart,
    cartCount,
    cartSubtotalPaisa,
    cartDrawerOpen,
    setCartDrawerOpen,
    updateCartQuantity,
    removeFromCart,
  } = useStore();

  useEffect(() => {
    if (!cartDrawerOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setCartDrawerOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [cartDrawerOpen, setCartDrawerOpen]);

  if (!cartDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label="Shopping cart">
      <div
        className="fixed inset-0 bg-ink/40 backdrop-blur-[2px] transition-opacity"
        onClick={() => setCartDrawerOpen(false)}
      />

      <aside className="relative z-10 flex h-full w-full max-w-md flex-col border-l border-line bg-surface shadow-2xl">
        <div className="flex items-center justify-between border-b border-line px-6 py-5">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="h-5 w-5 text-gold-deep" />
            <h2 className="font-serif text-2xl font-semibold text-ink">
              Your Cart <span className="text-base font-normal text-muted tabular-nums">({cartCount})</span>
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setCartDrawerOpen(false)}
            aria-label="Close shopping cart"
            className="rounded-full p-2 text-muted transition hover:bg-sand hover:text-ink"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {cart.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sand text-gold-deep">
                <ShoppingBag className="h-7 w-7" />
              </div>
              <h3 className="mt-4 font-serif text-2xl font-medium text-ink">Your bag is empty</h3>
              <p className="mt-2 max-w-xs text-sm text-muted">
                Explore handcrafted Panchadhatu ornaments and 316L steel pieces ready to ship from Butwal.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Link
                  href="/catalog"
                  onClick={() => setCartDrawerOpen(false)}
                  className="rounded-full bg-gold px-6 py-2.5 text-sm font-medium text-white transition hover:bg-gold-deep"
                >
                  Browse Catalog
                </Link>
                <Link
                  href="/new-arrivals"
                  onClick={() => setCartDrawerOpen(false)}
                  className="rounded-full border border-line px-5 py-2.5 text-sm font-medium text-ink transition hover:border-gold hover:text-gold-deep"
                >
                  New Arrivals
                </Link>
              </div>
            </div>
          ) : (
            <ul className="divide-y divide-line">
              {cart.map((item) => (
                <li key={`${item.productId}-${item.variantId || 'base'}`} className="flex gap-4 py-4">
                  <Link
                    href={`/product/${item.slug}`}
                    onClick={() => setCartDrawerOpen(false)}
                    className="relative h-24 w-20 shrink-0 overflow-hidden rounded-xl border border-line bg-sand"
                  >
                    <Image
                      src={item.imageUrl || '/images/product-necklace.jpg'}
                      alt={item.name}
                      fill
                      sizes="80px"
                      referrerPolicy="no-referrer"
                      className="object-cover"
                    />
                  </Link>

                  <div className="flex min-w-0 flex-1 flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={`/product/${item.slug}`}
                          onClick={() => setCartDrawerOpen(false)}
                          className="line-clamp-2 font-serif text-base font-semibold leading-snug text-ink hover:text-gold-deep"
                        >
                          {item.name}
                        </Link>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.productId, item.variantId)}
                          aria-label={`Remove ${item.name}`}
                          className="p-1 text-muted transition hover:text-danger"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="mt-0.5 text-xs text-muted">
                        {item.material}
                        {item.variantLabel ? ` · ${item.variantLabel}` : ''}
                      </p>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-2">
                      <div className="inline-flex items-center rounded-full border border-line bg-sand/70">
                        <button
                          type="button"
                          onClick={() =>
                            updateCartQuantity(item.productId, item.variantId, item.quantity - 1)
                          }
                          aria-label="Decrease quantity"
                          className="px-2.5 py-1 text-ink transition hover:text-gold-deep"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="min-w-[1.5rem] text-center text-xs font-medium text-ink tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateCartQuantity(item.productId, item.variantId, item.quantity + 1)
                          }
                          aria-label="Increase quantity"
                          className="px-2.5 py-1 text-ink transition hover:text-gold-deep"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <div className="text-right text-sm font-semibold text-ink tabular-nums">
                        {formatNPR(item.unitPricePaisa * item.quantity)}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {cart.length > 0 && (
          <div className="border-t border-line bg-sand/40 px-6 py-5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted">Subtotal</span>
              <span className="text-lg font-semibold text-ink tabular-nums">
                {formatNPR(cartSubtotalPaisa)}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted">
              Nationwide 7-province Nepal delivery &amp; promo codes calculated at checkout.
            </p>
            <div className="mt-4 grid gap-2.5">
              <Link
                href="/checkout"
                onClick={() => setCartDrawerOpen(false)}
                className="flex w-full items-center justify-center rounded-full bg-gold px-6 py-3 text-sm font-medium text-white transition hover:bg-gold-deep"
              >
                Proceed to Checkout
              </Link>
              <Link
                href="/cart"
                onClick={() => setCartDrawerOpen(false)}
                className="flex w-full items-center justify-center rounded-full border border-line bg-surface px-6 py-2.5 text-sm font-medium text-ink transition hover:border-gold hover:text-gold-deep"
              >
                View Full Cart
              </Link>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
