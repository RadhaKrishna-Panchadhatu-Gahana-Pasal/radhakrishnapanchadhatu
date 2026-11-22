'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { useStore } from '@/components/providers/store-provider';
import { ProductCard } from '@/components/store/product-card';
import type { Product } from '@/lib/store/types';

export default function WishlistPage() {
  const { wishlist } = useStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        setProducts(Array.isArray(data.products) ? data.products : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const savedProducts = products.filter((p) => wishlist.includes(p.id));

  return (
    <div className="container-shell py-12">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-deep">Saved Pieces</p>
      <h1 className="section-title mt-2">Your Wishlist</h1>
      <p className="mt-2 text-sm text-muted">
        Bookmark pieces you love and revisit them anytime. Sign in with Google to sync across devices.
      </p>

      {loading ? (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="aspect-[3/4] animate-pulse rounded-2xl bg-elevated" />
          ))}
        </div>
      ) : savedProducts.length === 0 ? (
        <div className="card mt-10 p-12 text-center">
          <Heart className="mx-auto h-10 w-10 text-gold-deep" />
          <h2 className="mt-4 font-serif text-2xl font-medium text-ink">No saved jewellery yet</h2>
          <p className="mt-2 text-sm text-muted">
            Tap the heart icon on any Panchadhatu or steel piece to keep it here.
          </p>
          <Link
            href="/catalog"
            className="mt-6 inline-flex rounded-full bg-gold px-6 py-2.5 text-sm font-medium text-white hover:bg-gold-deep"
          >
            Explore Catalog
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {savedProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
