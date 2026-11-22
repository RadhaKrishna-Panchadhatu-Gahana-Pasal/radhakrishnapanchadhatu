'use client';

import { useState, type FormEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  CheckCircle2,
  Heart,
  MessageCircle,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Star,
  Truck,
} from 'lucide-react';
import { useStore } from '@/components/providers/store-provider';
import { ProductCard } from '@/components/store/product-card';
import { formatNPR } from '@/lib/store/money';
import type { Product, Review } from '@/lib/store/types';
import { buildProductWhatsAppUrl } from '@/lib/store/whatsapp';

export function ProductDetailClient({
  product,
  initialReviews,
  relatedProducts,
  whatsappDigits,
}: {
  product: Product;
  initialReviews: Review[];
  relatedProducts: Product[];
  whatsappDigits: string;
}) {
  const { addToCart, wishlist, toggleWishlist } = useStore();
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState<string | undefined>(
    product.variants[0]?.id
  );
  const [quantity, setQuantity] = useState(1);

  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [revName, setRevName] = useState('');
  const [revOrderNumber, setRevOrderNumber] = useState('');
  const [revPhone, setRevPhone] = useState('');
  const [revRating, setRevRating] = useState(5);
  const [revTitle, setRevTitle] = useState('');
  const [revContent, setRevContent] = useState('');
  const [revMessage, setRevMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [revSubmitting, setRevSubmitting] = useState(false);

  const saved = wishlist.includes(product.id);
  const activeVariant = product.variants.find((v) => v.id === selectedVariantId);
  const activePrice = activeVariant?.priceOverridePaisa ?? product.pricePaisa;
  const activeStock = activeVariant ? activeVariant.stockQuantity : product.stockQuantity;
  const activeSku = activeVariant?.sku ?? product.sku;
  const outOfStock = product.productType === 'READY_STOCK' && activeStock <= 0;
  const images = product.images.length
    ? product.images
    : [{ id: 'fallback', url: '/images/product-necklace.jpg', alt: product.name, isPrimary: true }];
  const mainImage = images[selectedImageIdx] ?? images[0];

  const pageUrl =
    typeof window !== 'undefined'
      ? window.location.href
      : `/product/${product.slug}`;

  const orderWhatsAppUrl = buildProductWhatsAppUrl({
    whatsappDigits,
    productName: product.name,
    sku: activeSku,
    productUrl: pageUrl,
    variantLabel: activeVariant?.label,
    quantity,
    intent: 'order',
  });

  const askWhatsAppUrl = buildProductWhatsAppUrl({
    whatsappDigits,
    productName: product.name,
    sku: activeSku,
    productUrl: pageUrl,
    variantLabel: activeVariant?.label,
    intent: 'ask',
  });

  const handleAddToCart = () => {
    if (activePrice === null || outOfStock) return;
    addToCart({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      sku: activeSku,
      material: product.material,
      variantId: activeVariant?.id,
      variantLabel: activeVariant?.label,
      unitPricePaisa: activePrice,
      quantity,
      imageUrl: mainImage.url,
    });
  };

  const handleReviewSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setRevSubmitting(true);
    setRevMessage(null);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          orderNumber: revOrderNumber,
          customerPhone: revPhone,
          customerName: revName,
          rating: revRating,
          title: revTitle,
          content: revContent,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setRevMessage({ type: 'err', text: data.error || 'Could not submit review.' });
      } else {
        setRevMessage({
          type: 'ok',
          text: 'Verified purchase confirmed. Your review has been submitted for store moderation.',
        });
        setRevTitle('');
        setRevContent('');
        setRevOrderNumber('');
        setRevPhone('');
        if (data.review?.status === 'APPROVED') {
          setReviews((prev) => [data.review, ...prev]);
        }
      }
    } catch {
      setRevMessage({ type: 'err', text: 'Network error submitting review.' });
    } finally {
      setRevSubmitting(false);
    }
  };

  return (
    <div className="container-shell pb-24 pt-10 md:pb-16">
      <nav aria-label="Breadcrumb" className="mb-6 text-xs text-muted">
        <Link href="/" className="hover:text-ink">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/catalog" className="hover:text-ink">Catalog</Link>
        <span className="mx-2">/</span>
        <span className="text-ink">{product.name}</span>
      </nav>

      {/* Contiguous Purchase Module */}
      <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[2rem] border border-line bg-elevated">
            <Image
              src={mainImage.url}
              alt={mainImage.alt || product.name}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 48vw"
              referrerPolicy="no-referrer"
              className="object-cover"
            />
          </div>

          {images.length > 1 && (
            <div className="mt-4 flex gap-3">
              {images.map((img, idx) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => setSelectedImageIdx(idx)}
                  className={`relative h-20 w-16 overflow-hidden rounded-xl border transition ${
                    selectedImageIdx === idx ? 'border-gold ring-2 ring-gold/30' : 'border-line'
                  }`}
                >
                  <Image
                    src={img.url}
                    alt={img.alt}
                    fill
                    sizes="64px"
                    referrerPolicy="no-referrer"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-deep">
            {product.material} &middot; {product.categoryName} &middot; SKU {activeSku}
          </p>
          <h1 className="mt-3 font-serif text-3xl font-semibold leading-tight text-ink sm:text-4xl">
            {product.name}
          </h1>

          <div className="mt-4 flex items-baseline gap-3 tabular-nums">
            <span className="text-2xl font-semibold text-ink">{formatNPR(activePrice)}</span>
            {product.compareAtPaisa && activePrice !== null && product.compareAtPaisa > activePrice && (
              <span className="text-base text-muted line-through">
                {formatNPR(product.compareAtPaisa)}
              </span>
            )}
          </div>

          <p className="mt-3 text-xs font-medium text-muted">
            {outOfStock ? (
              <span className="text-danger">Currently out of stock</span>
            ) : product.productType === 'MADE_TO_ORDER' ? (
              <span className="text-gold-deep">Made to order &middot; Crafted within 5–7 days</span>
            ) : (
              <span className="text-success">In stock ({activeStock} available)</span>
            )}
          </p>

          <p className="mt-5 text-sm leading-relaxed text-ink/90 sm:text-base">
            {product.description}
          </p>

          {product.variants.length > 0 && (
            <div className="mt-6">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                Select Option
              </p>
              <div className="mt-2.5 flex flex-wrap gap-2.5">
                {product.variants.map((variant) => (
                  <button
                    key={variant.id}
                    type="button"
                    onClick={() => setSelectedVariantId(variant.id)}
                    className={`rounded-full border px-4 py-2 text-xs font-medium transition ${
                      selectedVariantId === variant.id
                        ? 'border-gold bg-gold/10 text-ink'
                        : 'border-line bg-surface text-muted hover:border-gold'
                    }`}
                  >
                    {variant.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity + Primary Cart & Wishlist Actions */}
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center rounded-full border border-line bg-surface px-2 py-1">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
                className="p-2 text-ink hover:text-gold-deep"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="min-w-[2rem] text-center text-sm font-semibold tabular-nums">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(25, q + 1))}
                aria-label="Increase quantity"
                className="p-2 text-ink hover:text-gold-deep"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            {activePrice !== null ? (
              <button
                type="button"
                disabled={outOfStock}
                onClick={handleAddToCart}
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-gold px-6 py-3.5 text-sm font-medium text-white transition hover:bg-gold-deep disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ShoppingBag className="h-4 w-4" />
                {outOfStock ? 'Out of Stock' : 'Add to Cart'}
              </button>
            ) : (
              <a
                href={orderWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-gold px-6 py-3.5 text-sm font-medium text-white transition hover:bg-gold-deep"
              >
                <MessageCircle className="h-4 w-4" />
                Request Price on WhatsApp
              </a>
            )}

            <button
              type="button"
              onClick={() => toggleWishlist(product.id)}
              aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-line bg-surface text-ink transition hover:border-gold hover:text-gold-deep"
            >
              <Heart className={`h-5 w-5 ${saved ? 'fill-gold text-gold' : ''}`} />
            </button>
          </div>

          {/* Direct WhatsApp Ordering & Questions */}
          <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
            <a
              href={orderWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-line bg-surface px-4 py-2.5 text-xs font-medium text-ink transition hover:border-gold hover:text-gold-deep"
            >
              <MessageCircle className="h-4 w-4 text-success" />
              Order via WhatsApp
            </a>
            <a
              href={askWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-line bg-surface px-4 py-2.5 text-xs font-medium text-muted transition hover:border-gold hover:text-ink"
            >
              Ask on WhatsApp
            </a>
          </div>

          {/* Craftsmanship & Care Details */}
          <div className="mt-8 space-y-4 border-t border-line pt-6 text-sm">
            <div className="flex items-start gap-3">
              <Truck className="mt-0.5 h-4 w-4 shrink-0 text-gold-deep" />
              <div>
                <p className="font-medium text-ink">Nepal Nationwide Delivery</p>
                <p className="text-xs text-muted">{product.deliveryNote}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-gold-deep" />
              <div>
                <p className="font-medium text-ink">Care &amp; Material Notes</p>
                <p className="text-xs text-muted">
                  {product.careInstructions}
                  {product.weightGrams ? ` · Approx. weight: ${product.weightGrams}g` : ''}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Verified Customer Reviews */}
      <section className="mt-16 border-t border-line pt-12">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-deep">
              Verified Buyers
            </p>
            <h2 className="section-title mt-2">Customer Reviews</h2>

            {reviews.length === 0 ? (
              <p className="mt-4 text-sm text-muted">
                No published reviews yet for this ornament. Delivered customers can submit a verified review using their order number.
              </p>
            ) : (
              <div className="mt-6 space-y-4">
                {reviews.map((rev) => (
                  <div key={rev.id} className="card p-5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1 text-gold">
                        {Array.from({ length: rev.rating }).map((_, idx) => (
                          <Star key={idx} className="h-4 w-4 fill-gold" />
                        ))}
                      </div>
                      {rev.verifiedPurchase && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-success">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Verified Purchase
                        </span>
                      )}
                    </div>
                    <h3 className="mt-2 font-serif text-lg font-semibold text-ink">{rev.title}</h3>
                    <p className="mt-1 text-sm text-muted">{rev.content}</p>
                    <p className="mt-3 text-xs text-muted">
                      {rev.customerName} &middot; {new Date(rev.createdAt).toLocaleDateString()}
                    </p>
                    {rev.adminReply && (
                      <div className="mt-3 rounded-xl border border-line bg-sand p-3 text-xs text-ink">
                        <strong>Store Reply:</strong> {rev.adminReply}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <form onSubmit={handleReviewSubmit} className="card h-fit p-6">
            <h3 className="font-serif text-2xl font-semibold text-ink">Write a Verified Review</h3>
            <p className="mt-1 text-xs text-muted">
              Only delivered orders containing this ornament can submit a review.
            </p>

            <div className="mt-4 space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  required
                  value={revOrderNumber}
                  onChange={(e) => setRevOrderNumber(e.target.value)}
                  placeholder="Order Number (e.g. RKP-2026-1001)"
                  className="rounded-xl border border-line bg-sand/60 px-3.5 py-2.5 text-sm outline-none focus:border-gold"
                />
                <input
                  required
                  value={revPhone}
                  onChange={(e) => setRevPhone(e.target.value)}
                  placeholder="Order Phone (e.g. 9841000000)"
                  className="rounded-xl border border-line bg-sand/60 px-3.5 py-2.5 text-sm outline-none focus:border-gold"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  required
                  value={revName}
                  onChange={(e) => setRevName(e.target.value)}
                  placeholder="Your Name"
                  className="rounded-xl border border-line bg-sand/60 px-3.5 py-2.5 text-sm outline-none focus:border-gold"
                />
                <select
                  value={revRating}
                  onChange={(e) => setRevRating(Number(e.target.value))}
                  aria-label="Rating"
                  className="rounded-xl border border-line bg-sand/60 px-3.5 py-2.5 text-sm outline-none focus:border-gold"
                >
                  <option value={5}>5 Stars — Excellent</option>
                  <option value={4}>4 Stars — Very Good</option>
                  <option value={3}>3 Stars — Good</option>
                  <option value={2}>2 Stars — Fair</option>
                  <option value={1}>1 Star — Needs Improvement</option>
                </select>
              </div>

              <input
                required
                value={revTitle}
                onChange={(e) => setRevTitle(e.target.value)}
                placeholder="Review Headline"
                className="w-full rounded-xl border border-line bg-sand/60 px-3.5 py-2.5 text-sm outline-none focus:border-gold"
              />
              <textarea
                required
                value={revContent}
                onChange={(e) => setRevContent(e.target.value)}
                rows={3}
                placeholder="Share craftsmanship, weight, and delivery feedback..."
                className="w-full rounded-xl border border-line bg-sand/60 px-3.5 py-2.5 text-sm outline-none focus:border-gold"
              />
            </div>

            {revMessage && (
              <p
                className={`mt-3 text-xs font-medium ${
                  revMessage.type === 'ok' ? 'text-success' : 'text-danger'
                }`}
              >
                {revMessage.text}
              </p>
            )}

            <button
              type="submit"
              disabled={revSubmitting}
              className="mt-4 w-full rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-surface transition hover:bg-gold-deep disabled:opacity-50"
            >
              {revSubmitting ? 'Verifying Order...' : 'Submit Verified Review'}
            </button>
          </form>
        </div>
      </section>

      {/* Related Pieces */}
      {relatedProducts.length > 0 && (
        <section className="mt-16 border-t border-line pt-12">
          <h2 className="section-title">You May Also Appreciate</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {relatedProducts.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}

      {/* Compact Sticky Mobile Purchase Bar (<= 15% viewport height) */}
      {activePrice !== null && (
        <div className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-between gap-3 border-t border-line bg-surface/95 px-4 py-2.5 backdrop-blur-md md:hidden">
          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-ink">{product.name}</p>
            <p className="text-sm font-semibold text-gold-deep tabular-nums">
              {formatNPR(activePrice)}
            </p>
          </div>
          <button
            type="button"
            disabled={outOfStock}
            onClick={handleAddToCart}
            className="shrink-0 rounded-full bg-gold px-5 py-2 text-xs font-semibold text-white"
          >
            {outOfStock ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      )}
    </div>
  );
}
