'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import type { AdminSession } from '@/lib/store/auth';

const ADMIN_NAV = [
  { href: '/admin', label: 'Overview' },
  { href: '/admin/orders', label: 'Orders' },
  { href: '/admin/products', label: 'Products' },
  { href: '/admin/categories', label: 'Categories' },
  { href: '/admin/inventory', label: 'Inventory' },
  { href: '/admin/reviews', label: 'Reviews' },
  { href: '/admin/banners', label: 'Banners' },
  { href: '/admin/announcements', label: 'Announcements' },
  { href: '/admin/homepage', label: 'Homepage Sections' },
  { href: '/admin/pages', label: 'Pages & Policies' },
  { href: '/admin/media', label: 'Media Library' },
  { href: '/admin/gift-cards', label: 'Gift Cards' },
  { href: '/admin/system', label: 'System & Backups' },
  { href: '/admin/settings', label: 'Settings & Logs' },
];

export function AdminShell({
  session,
  children,
}: {
  session: AdminSession;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    router.refresh();
  };

  return (
    <div className="container-shell py-8">
      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        <aside className="card h-fit p-4">
          <div className="border-b border-line px-2 pb-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-deep">
              Admin CMS
            </p>
            <p className="mt-1 text-sm font-semibold text-ink">{session.name}</p>
            <p className="text-xs text-muted">
              {session.role} &middot; {session.email}
            </p>
          </div>

          <nav aria-label="Admin navigation" className="mt-3 space-y-1">
            {ADMIN_NAV.map((item) => {
              const active =
                item.href === '/admin'
                  ? pathname === '/admin'
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block rounded-xl px-3 py-2 text-sm font-medium transition ${
                    active
                      ? 'bg-gold text-white'
                      : 'text-ink hover:bg-sand hover:text-gold-deep'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <button
            type="button"
            onClick={handleSignOut}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-line px-3 py-2 text-xs font-medium text-ink transition hover:border-danger hover:text-danger"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign Out
          </button>
        </aside>

        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
