'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Heart, Menu, Search, ShoppingBag, User, X } from 'lucide-react';
import { HeaderSearch } from '@/components/layout/header-search';
import { useStore } from '@/components/providers/store-provider';

const NAV_LINKS = [
  { href: '/catalog', label: 'Catalog' },
  { href: '/new-arrivals', label: 'New Arrivals' },
  { href: '/custom-order', label: 'Custom Order' },
  { href: '/track-order', label: 'Track Order' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export function Header({ storeName = 'Radhakrishna Panchadhatu' }: { storeName?: string }) {
  const { cartCount, wishlist, setCartDrawerOpen, user } = useStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/95 backdrop-blur-md">
      <div className="container-shell flex h-16 items-center justify-between gap-3 xl:gap-6">
        {/* Brand + mobile menu button */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => {
              setMobileOpen((prev) => !prev);
              setMobileSearchOpen(false);
            }}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="rounded-lg p-1.5 text-ink transition hover:bg-sand lg:hidden"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <Link
            href="/"
            className="whitespace-nowrap shrink-0 font-serif text-lg font-semibold tracking-[0.04em] text-ink sm:text-xl"
          >
            {storeName}
          </Link>
        </div>

        {/* Concise single-row primary links */}
        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-3.5 text-[13px] font-medium text-muted lg:flex xl:gap-5 xl:text-sm"
        >
          {NAV_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap shrink-0 transition hover:text-gold-deep"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Live Search, Wishlist, Account, Cart trigger */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <div className="hidden md:block">
            <HeaderSearch variant="desktop" />
          </div>

          <button
            type="button"
            onClick={() => {
              setMobileSearchOpen((prev) => !prev);
              setMobileOpen(false);
            }}
            aria-label={mobileSearchOpen ? 'Close search bar' : 'Search jewellery'}
            aria-expanded={mobileSearchOpen}
            className="rounded-full p-2 text-ink transition hover:bg-sand hover:text-gold-deep md:hidden"
          >
            {mobileSearchOpen ? (
              <X className="h-[18px] w-[18px]" />
            ) : (
              <Search className="h-[18px] w-[18px]" />
            )}
          </button>

          <Link
            href="/wishlist"
            aria-label={`Wishlist (${wishlist.length})`}
            className="relative shrink-0 rounded-full p-2 text-ink transition hover:bg-sand hover:text-gold-deep"
          >
            <Heart className="h-[18px] w-[18px]" />
            {wishlist.length > 0 && (
              <span className="absolute right-1 top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-gold px-1 text-[10px] font-semibold text-white tabular-nums">
                {wishlist.length}
              </span>
            )}
          </Link>

          <Link
            href="/account"
            aria-label={user ? 'Customer account' : 'Sign in'}
            className="hidden shrink-0 rounded-full p-2 text-ink transition hover:bg-sand hover:text-gold-deep sm:inline-flex"
          >
            <User className="h-[18px] w-[18px]" />
          </Link>

          <button
            type="button"
            onClick={() => setCartDrawerOpen(true)}
            aria-label={`Open shopping cart (${cartCount} items)`}
            className="relative inline-flex shrink-0 items-center gap-1.5 rounded-full border border-line bg-sand/70 px-3 py-1.5 text-sm font-medium text-ink transition hover:border-gold hover:text-gold-deep whitespace-nowrap"
          >
            <ShoppingBag className="h-4 w-4 text-gold-deep" />
            <span className="hidden sm:inline">Cart</span>
            <span className="tabular-nums font-semibold text-gold-deep">{cartCount}</span>
          </button>

          <Link
            href="/admin"
            className="hidden shrink-0 whitespace-nowrap rounded-full bg-ink px-3 py-1.5 text-xs font-medium tracking-wide text-surface transition hover:bg-gold-deep lg:inline-flex"
          >
            Admin
          </Link>
        </div>
      </div>

      {/* Mobile expandable search bar with live dropdown */}
      {mobileSearchOpen && (
        <div className="border-t border-line bg-surface px-4 py-3 md:hidden">
          <HeaderSearch
            variant="mobile"
            autoFocus
            onNavigate={() => setMobileSearchOpen(false)}
          />
        </div>
      )}

      {/* Mobile slide-down drawer */}
      {mobileOpen && (
        <div className="border-t border-line bg-surface px-4 py-4 lg:hidden">
          <nav aria-label="Mobile navigation" className="grid gap-1">
            {NAV_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-xl px-3 py-2.5 text-sm font-medium text-ink transition hover:bg-sand hover:text-gold-deep"
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-2 flex items-center gap-3 border-t border-line pt-3">
              <Link
                href="/account"
                onClick={() => setMobileOpen(false)}
                className="flex-1 rounded-full border border-line py-2 text-center text-sm font-medium text-ink"
              >
                Account
              </Link>
              <Link
                href="/admin"
                onClick={() => setMobileOpen(false)}
                className="flex-1 rounded-full bg-ink py-2 text-center text-sm font-medium text-surface"
              >
                Admin CMS
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
