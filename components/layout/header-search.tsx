'use client';

import { useEffect, useId, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ArrowRight, Loader2, Search, X } from 'lucide-react';
import { formatNPR } from '@/lib/store/money';
import type { Product } from '@/lib/store/types';

interface HeaderSearchProps {
  variant?: 'desktop' | 'mobile';
  autoFocus?: boolean;
  onNavigate?: () => void;
}

export function HeaderSearch({
  variant = 'desktop',
  autoFocus = false,
  onNavigate,
}: HeaderSearchProps) {
  const router = useRouter();
  const pathname = usePathname();
  const listboxId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [totalMatches, setTotalMatches] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [fetchedForQuery, setFetchedForQuery] = useState('');

  const trimmedQuery = query.trim();

  useEffect(() => {
    if (autoFocus) {
      inputRef.current?.focus();
    }
  }, [autoFocus]);

  // Close dropdown automatically after route changes
  useEffect(() => {
    setOpen(false);
    setActiveIndex(-1);
  }, [pathname]);

  // Close on outside click
  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, []);

  // Debounced real-time product suggestions
  useEffect(() => {
    if (!trimmedQuery) {
      setResults([]);
      setTotalMatches(0);
      setLoading(false);
      setError(null);
      setActiveIndex(-1);
      setFetchedForQuery('');
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError(null);

    const timer = window.setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/products?q=${encodeURIComponent(trimmedQuery)}&limit=6&sort=featured`,
          { signal: controller.signal }
        );
        if (!res.ok) {
          throw new Error('Unable to fetch suggestions');
        }
        const data = (await res.json()) as { products?: Product[]; total?: number };
        const items = Array.isArray(data.products) ? data.products : [];
        setResults(items);
        setTotalMatches(typeof data.total === 'number' ? data.total : items.length);
        setFetchedForQuery(trimmedQuery);
        setActiveIndex(-1);
      } catch (err) {
        if ((err as { name?: string })?.name === 'AbortError') return;
        setError('Unable to load matching jewellery right now.');
        setResults([]);
        setTotalMatches(0);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }, 150);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [trimmedQuery]);

  const showDropdown = open && trimmedQuery.length > 0;

  const navigateTo = (href: string) => {
    setOpen(false);
    setActiveIndex(-1);
    onNavigate?.();
    router.push(href);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!trimmedQuery) {
      navigateTo('/catalog');
      return;
    }
    if (activeIndex >= 0 && results[activeIndex]) {
      navigateTo(`/product/${results[activeIndex].slug}`);
      return;
    }
    navigateTo(`/search?q=${encodeURIComponent(trimmedQuery)}`);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      setOpen(false);
      setActiveIndex(-1);
      return;
    }

    if (!showDropdown || results.length === 0) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((prev) => (prev + 1 < results.length ? prev + 1 : 0));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    }
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setTotalMatches(0);
    setActiveIndex(-1);
    setOpen(false);
    inputRef.current?.focus();
  };

  const isDesktop = variant === 'desktop';

  return (
    <div
      ref={containerRef}
      className={isDesktop ? 'relative w-40 lg:w-44 xl:w-64' : 'relative w-full'}
    >
      <form onSubmit={handleSubmit} role="search" aria-label="Search jewellery catalog">
        <div className="relative flex items-center">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3 h-4 w-4 text-muted"
          />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => {
              if (trimmedQuery) setOpen(true);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search jewellery..."
            aria-label="Search jewellery"
            aria-autocomplete="list"
            aria-expanded={showDropdown}
            aria-controls={showDropdown ? listboxId : undefined}
            aria-activedescendant={
              showDropdown && activeIndex >= 0 && results[activeIndex]
                ? `${listboxId}-option-${results[activeIndex].id}`
                : undefined
            }
            role="combobox"
            className="h-9 w-full rounded-full border border-line bg-sand/70 pl-9 pr-8 text-sm text-ink placeholder:text-muted/80 transition focus:border-gold focus:bg-surface focus:outline-none focus:ring-2 focus:ring-gold/20 [&::-webkit-search-cancel-button]:hidden"
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Clear search"
              className="absolute right-2 rounded-full p-1 text-muted transition hover:bg-sand hover:text-ink"
            >
              {loading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-gold-deep" />
              ) : (
                <X className="h-3.5 w-3.5" />
              )}
            </button>
          )}
        </div>
      </form>

      {showDropdown && (
        <div
          className={`absolute top-full z-50 mt-2 overflow-hidden rounded-2xl border border-line bg-surface shadow-soft ${
            isDesktop ? 'right-0 w-[min(26rem,calc(100vw-2rem))]' : 'left-0 right-0'
          }`}
        >
          <div className="flex items-center justify-between border-b border-line px-4 py-2.5 text-xs text-muted">
            <span>
              {loading && fetchedForQuery !== trimmedQuery
                ? 'Searching collection...'
                : totalMatches > 0
                  ? `${totalMatches} matching ${totalMatches === 1 ? 'piece' : 'pieces'}`
                  : 'Search results'}
            </span>
            <span className="truncate max-w-[10rem] font-medium text-ink">
              &ldquo;{trimmedQuery}&rdquo;
            </span>
          </div>

          {error ? (
            <div className="px-4 py-5 text-center text-sm text-danger">{error}</div>
          ) : loading && results.length === 0 ? (
            <div className="flex items-center justify-center gap-2 px-4 py-6 text-sm text-muted">
              <Loader2 className="h-4 w-4 animate-spin text-gold-deep" />
              <span>Finding matching jewellery...</span>
            </div>
          ) : results.length === 0 && fetchedForQuery === trimmedQuery ? (
            <div className="px-4 py-6 text-center">
              <p className="text-sm font-medium text-ink">
                No pieces matched &ldquo;{trimmedQuery}&rdquo;.
              </p>
              <p className="mt-1 text-xs text-muted">
                Try searching for Panchadhatu, Steel, Pendant, Ring, or Jhumka.
              </p>
              <div className="mt-4 flex items-center justify-center gap-4 text-xs font-semibold text-gold-deep">
                <Link
                  href="/catalog"
                  onClick={() => {
                    setOpen(false);
                    onNavigate?.();
                  }}
                  className="hover:underline"
                >
                  Browse Full Catalog
                </Link>
                <span aria-hidden="true" className="text-line">
                  |
                </span>
                <Link
                  href="/custom-order"
                  onClick={() => {
                    setOpen(false);
                    onNavigate?.();
                  }}
                  className="hover:underline"
                >
                  Request Custom Piece
                </Link>
              </div>
            </div>
          ) : (
            <>
              <ul
                id={listboxId}
                role="listbox"
                aria-label="Matching jewellery suggestions"
                className="max-h-[22rem] divide-y divide-line overflow-y-auto"
              >
                {results.map((product, index) => {
                  const primaryImage =
                    product.images.find((img) => img.isPrimary) ?? product.images[0];
                  const defaultVariant = product.variants[0];
                  const effectivePrice =
                    defaultVariant?.priceOverridePaisa ?? product.pricePaisa;
                  const outOfStock =
                    product.productType === 'READY_STOCK' && product.stockQuantity <= 0;
                  const isHighlighted = index === activeIndex;

                  return (
                    <li
                      key={product.id}
                      id={`${listboxId}-option-${product.id}`}
                      role="option"
                      aria-selected={isHighlighted}
                    >
                      <Link
                        href={`/product/${product.slug}`}
                        onClick={() => {
                          setOpen(false);
                          setActiveIndex(-1);
                          onNavigate?.();
                        }}
                        onMouseEnter={() => setActiveIndex(index)}
                        className={`flex items-center gap-3.5 px-4 py-3 transition ${
                          isHighlighted ? 'bg-sand' : 'hover:bg-sand/60'
                        }`}
                      >
                        <div className="relative h-14 w-12 shrink-0 overflow-hidden rounded-lg border border-line bg-[#EFECE5]">
                          <Image
                            src={primaryImage?.url || '/images/product-necklace.jpg'}
                            alt={primaryImage?.alt || product.name}
                            fill
                            sizes="48px"
                            referrerPolicy="no-referrer"
                            className="object-cover"
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
                            {product.material} &middot; {product.categoryName}
                            {outOfStock ? ' · Out of stock' : ''}
                          </p>
                          <p className="truncate font-serif text-base font-semibold text-ink">
                            {product.name}
                          </p>
                        </div>

                        <div className="shrink-0 text-right tabular-nums">
                          <p className="text-sm font-semibold text-ink">
                            {formatNPR(effectivePrice)}
                          </p>
                          {product.compareAtPaisa &&
                            effectivePrice !== null &&
                            product.compareAtPaisa > effectivePrice && (
                              <p className="text-xs text-muted line-through">
                                {formatNPR(product.compareAtPaisa)}
                              </p>
                            )}
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>

              <div className="border-t border-line bg-sand/50 px-4 py-2.5">
                <Link
                  href={`/search?q=${encodeURIComponent(trimmedQuery)}`}
                  onClick={() => {
                    setOpen(false);
                    setActiveIndex(-1);
                    onNavigate?.();
                  }}
                  className="flex items-center justify-between text-xs font-semibold text-gold-deep transition hover:text-ink"
                >
                  <span>
                    View all {totalMatches} matching{' '}
                    {totalMatches === 1 ? 'result' : 'results'}
                  </span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
