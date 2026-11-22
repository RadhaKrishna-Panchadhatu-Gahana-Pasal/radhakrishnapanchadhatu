'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingBag } from 'lucide-react';
import { useStore } from '@/components/providers/store-provider';
import { formatNPR } from '@/lib/store/money';
import type { Product } from '@/lib/store/types';

export function ProductCard({ product }: { product: Product }) {
  const { addToCart, wishlist, toggleWishlist } = useStore();
  const saved = wishlist.includes(product.id);
  const primaryImage = product.images.find((i) => i.isPrimary) ?? product.images[0];
  const defaultVariant = product.variants[0];
  const effectivePrice = defaultVariant?.priceOverridePaisa ?? product.pricePaisa;
  const outOfStock = product.productType === 'READY_STOCK' && product.stockQuantity <= 0;

  const handleQuickAdd = () => {
    if (effectivePrice === null || outOfStock) return;
    addToCart({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      sku: defaultVariant?.sku ?? product.sku,
      material: product.material,
      variantId: defaultVariant?.id,
      variantLabel: defaultVariant?.label,
      unitPricePaisa: effectivePrice,
      quantity: 1,
      imageUrl: primaryImage?.url || '/images/product-necklace.jpg',
    });
  };

  return (
    <article className="group flex flex-col">
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl border border-line bg-elevated">
        <Link href={`/product/${product.slug}`} className="block h-full w-full">
          <Image
            src={primaryImage?.url || '/images/product-necklace.jpg'}
            alt={primaryImage?.alt || product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            referrerPolicy="no-referrer"
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        </Link>

        <button
          type="button"
          onClick={() => toggleWishlist(product.id)}
          aria-label={saved ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-line/80 bg-surface/90 text-ink backdrop-blur-sm transition hover:border-gold hover:text-gold-deep"
        >
          <Heart className={`h-4 w-4 ${saved ? 'fill-gold text-gold' : ''}`} />
        </button>

        {effectivePrice !== null && !outOfStock && (
          <button
            type="button"
            onClick={handleQuickAdd}
            className="absolute bottom-3 left-3 right-3 flex items-center justify-center gap-2 rounded-full bg-surface/95 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-ink opacity-95 shadow-soft backdrop-blur-sm transition hover:bg-gold hover:text-white md:opacity-0 md:group-hover:opacity-100"
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            Add to Cart
          </button>
        )}
      </div>

      <div className="mt-3.5 flex flex-1 flex-col">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted">
          {product.material} &middot; {product.categoryName}
          {product.productType === 'MADE_TO_ORDER' ? ' · Made to Order' : ''}
        </p>

        <Link
          href={`/product/${product.slug}`}
          className="mt-1 font-serif text-lg font-semibold leading-snug text-ink transition hover:text-gold-deep"
        >
          {product.name}
        </Link>

        <div className="mt-1.5 flex items-baseline gap-2 tabular-nums">
          <span className="text-sm font-semibold text-ink">{formatNPR(effectivePrice)}</span>
          {product.compareAtPaisa && effectivePrice !== null && product.compareAtPaisa > effectivePrice && (
            <span className="text-xs text-muted line-through">
              {formatNPR(product.compareAtPaisa)}
            </span>
          )}
          {outOfStock && <span className="text-xs font-medium text-danger">Out of stock</span>}
        </div>
      </div>
    </article>
  );
}
