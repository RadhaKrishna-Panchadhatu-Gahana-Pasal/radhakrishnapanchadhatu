'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useStore } from '@/components/providers/store-provider';
import { formatNPR } from '@/lib/store/money';

export default function CartPage() {
  const { cart, cartSubtotalPaisa, updateCartQuantity, removeFromCart } = useStore();

  return (
    <div className="container-shell py-12">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-deep">Shopping Bag</p>
      <h1 className="section-title mt-2">Your Cart</h1>

      {cart.length === 0 ? (
        <div className="card mt-8 p-12 text-center">
          <ShoppingBag className="mx-auto h-10 w-10 text-gold-deep" />
          <h2 className="mt-4 font-serif text-2xl font-medium text-ink">Your cart is empty</h2>
          <p className="mt-2 text-sm text-muted">
            Add Panchadhatu ornaments or 316L steel pieces to begin your order.
          </p>
          <Link
            href="/catalog"
            className="mt-6 inline-flex rounded-full bg-gold px-6 py-3 text-sm font-medium text-white hover:bg-gold-deep"
          >
            Browse Catalog
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-[1.35fr_0.65fr]">
          <div className="card divide-y divide-line p-6">
            {cart.map((item) => (
              <div key={`${item.productId}-${item.variantId || 'base'}`} className="flex gap-4 py-5 first:pt-0 last:pb-0">
                <Link
                  href={`/product/${item.slug}`}
                  className="relative h-28 w-24 shrink-0 overflow-hidden rounded-xl border border-line bg-sand"
                >
                  <Image
                    src={item.imageUrl || '/images/product-necklace.jpg'}
                    alt={item.name}
                    fill
                    sizes="96px"
                    referrerPolicy="no-referrer"
                    className="object-cover"
                  />
                </Link>

                <div className="flex flex-1 flex-col justify-between">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <Link
                        href={`/product/${item.slug}`}
                        className="font-serif text-xl font-semibold text-ink hover:text-gold-deep"
                      >
                        {item.name}
                      </Link>
                      <p className="mt-1 text-xs text-muted">
                        {item.material}
                        {item.variantLabel ? ` · ${item.variantLabel}` : ''} · SKU {item.sku}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.productId, item.variantId)}
                      aria-label={`Remove ${item.name}`}
                      className="p-1.5 text-muted hover:text-danger"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-4">
                    <div className="inline-flex items-center rounded-full border border-line bg-sand/70">
                      <button
                        type="button"
                        onClick={() => updateCartQuantity(item.productId, item.variantId, item.quantity - 1)}
                        className="px-3 py-1 text-ink hover:text-gold-deep"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="min-w-[2rem] text-center text-xs font-semibold tabular-nums">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateCartQuantity(item.productId, item.variantId, item.quantity + 1)}
                        className="px-3 py-1 text-ink hover:text-gold-deep"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <span className="text-base font-semibold text-ink tabular-nums">
                      {formatNPR(item.unitPricePaisa * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <aside className="card h-fit p-6">
            <h2 className="font-serif text-2xl font-semibold text-ink">Order Summary</h2>
            <div className="mt-4 space-y-3 border-b border-line pb-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">Items Subtotal</span>
                <span className="font-semibold text-ink tabular-nums">
                  {formatNPR(cartSubtotalPaisa)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Delivery Fee</span>
                <span className="text-xs text-muted">Calculated by province</span>
              </div>
            </div>
            <p className="mt-4 text-xs text-muted">
              Promo codes (such as <code className="font-mono text-ink">WELCOME10</code>) and province shipping rates are verified at checkout.
            </p>
            <Link
              href="/checkout"
              className="mt-6 flex w-full items-center justify-center rounded-full bg-gold px-6 py-3.5 text-sm font-medium text-white transition hover:bg-gold-deep"
            >
              Proceed to Checkout
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}
