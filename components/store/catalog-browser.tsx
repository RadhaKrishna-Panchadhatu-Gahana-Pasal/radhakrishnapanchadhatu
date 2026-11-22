'use client';

import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { ProductCard } from '@/components/store/product-card';
import type { Category, Product } from '@/lib/store/types';

export function CatalogBrowser({
  products,
  categories,
  initialCategory = 'all',
  initialQuery = '',
  heading = 'Jewellery Catalog',
  subheading = 'Handcrafted Panchadhatu heirlooms and 316L stainless steel pieces priced in NPR.',
}: {
  products: Product[];
  categories: Category[];
  initialCategory?: string;
  initialQuery?: string;
  heading?: string;
  subheading?: string;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [material, setMaterial] = useState('all');
  const [availability, setAvailability] = useState<'all' | 'in-stock' | 'made-to-order'>('all');
  const [sort, setSort] = useState<'featured' | 'latest' | 'price-asc' | 'price-desc'>('featured');

  const filtered = useMemo(() => {
    let list = [...products];

    if (category !== 'all') {
      const catObj = categories.find((c) => c.slug === category || c.id === category);
      list = list.filter(
        (p) =>
          p.categoryId === category ||
          (catObj && p.categoryId === catObj.id) ||
          p.categoryName.toLowerCase() === category.toLowerCase()
      );
    }

    if (material !== 'all') {
      list = list.filter((p) => p.material.toLowerCase() === material.toLowerCase());
    }

    if (availability === 'in-stock') {
      list = list.filter((p) => p.productType === 'READY_STOCK' && p.stockQuantity > 0);
    } else if (availability === 'made-to-order') {
      list = list.filter((p) => p.productType === 'MADE_TO_ORDER');
    }

    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.material.toLowerCase().includes(q) ||
          p.categoryName.toLowerCase().includes(q) ||
          p.shortDescription.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    switch (sort) {
      case 'price-asc':
        list.sort(
          (a, b) =>
            (a.pricePaisa ?? Number.MAX_SAFE_INTEGER) - (b.pricePaisa ?? Number.MAX_SAFE_INTEGER)
        );
        break;
      case 'price-desc':
        list.sort((a, b) => (b.pricePaisa ?? 0) - (a.pricePaisa ?? 0));
        break;
      case 'latest':
        list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        break;
      default:
        list.sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured));
    }

    return list;
  }, [products, categories, category, material, availability, query, sort]);

  return (
    <div className="container-shell py-12">
      <div className="border-b border-line pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-deep">
          Collection
        </p>
        <h1 className="section-title mt-2">{heading}</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted sm:text-base">{subheading}</p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <div className="relative sm:col-span-2 lg:col-span-2">
            <Search className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-muted" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search piece, SKU, Panchadhatu, steel..."
              aria-label="Search products"
              className="w-full rounded-xl border border-line bg-surface py-2.5 pl-10 pr-4 text-sm text-ink outline-none transition focus:border-gold"
            />
          </div>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            aria-label="Filter by category"
            className="rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm text-ink outline-none focus:border-gold"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={material}
            onChange={(e) => setMaterial(e.target.value)}
            aria-label="Filter by material"
            className="rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm text-ink outline-none focus:border-gold"
          >
            <option value="all">All Materials</option>
            {Array.from(new Set(products.map((p) => p.material))).sort().map((name) => (
              <option key={name} value={name}>{name === 'Steel' ? 'Steel (316L)' : name}</option>
            ))}
          </select>

          <select
            value={sort}
            onChange={(e) =>
              setSort(e.target.value as 'featured' | 'latest' | 'price-asc' | 'price-desc')
            }
            aria-label="Sort products"
            className="rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm text-ink outline-none focus:border-gold"
          >
            <option value="featured">Featured First</option>
            <option value="latest">Newest First</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-muted">
          <div className="flex items-center gap-4">
            {(['all', 'in-stock', 'made-to-order'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                aria-pressed={availability === mode}
                onClick={() => setAvailability(mode)}
                className={`border-b-2 pb-1 font-medium transition ${
                  availability === mode
                    ? 'border-gold text-ink'
                    : 'border-transparent hover:text-ink'
                }`}
              >
                {mode === 'all' ? 'All Pieces' : mode === 'in-stock' ? 'Ready to Ship' : 'Made to Order'}
              </button>
            ))}
          </div>
          <span role="status" className="tabular-nums">
            Showing {filtered.length} {filtered.length === 1 ? 'piece' : 'pieces'}
          </span>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card mt-10 p-10 text-center">
          <h2 className="font-serif text-2xl font-medium text-ink">No matching pieces found</h2>
          <p className="mt-2 text-sm text-muted">
            Try clearing one of your active filters or submit a bespoke design request.
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setCategory('all');
              setMaterial('all');
              setAvailability('all');
            }}
            className="mt-5 rounded-full border border-line px-5 py-2 text-sm font-medium text-ink hover:border-gold"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
