'use client';

import Link from 'next/link';
import { MapPin, Phone } from 'lucide-react';
import { useStore } from '@/components/providers/store-provider';
import { PWAInstallButton } from '@/components/pwa/pwa-install-button';
import type { StoreSettings } from '@/lib/store/types';

export function Footer({ settings }: { settings: StoreSettings }) {
  const { setCookieModalOpen } = useStore();

  return (
    <footer className="border-t border-line bg-surface">
      <div className="container-shell grid gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-1">
          <div className="font-serif text-2xl font-semibold tracking-[0.04em] text-ink">
            {settings.storeName}
          </div>
          <p className="mt-3 text-sm leading-relaxed text-muted">{settings.tagline}</p>
          <div className="mt-4 space-y-2 text-sm text-ink">
            <p className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold-deep" />
              <span>
                {settings.address}, {settings.cityLine}
              </span>
            </p>
            <p className="flex items-center gap-2">
              <Phone className="h-4 w-4 shrink-0 text-gold-deep" />
              <a href={`tel:${settings.phone.replace(/[^\d+]/g, '')}`} className="tabular-nums hover:text-gold-deep">
                {settings.phone}
              </a>
            </p>
          </div>
          <div className="mt-4">
            <PWAInstallButton compact />
          </div>
        </div>

        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-deep">
            Collections
          </div>
          <ul className="mt-4 space-y-2.5 text-sm text-muted">
            <li><Link href="/catalog" className="hover:text-gold-deep">Full Catalog</Link></li>
            <li><Link href="/categories/panchadhatu" className="hover:text-gold-deep">Panchadhatu</Link></li>
            <li><Link href="/categories/steel-jewellery" className="hover:text-gold-deep">Steel Jewellery</Link></li>
            <li><Link href="/new-arrivals" className="hover:text-gold-deep">New Arrivals</Link></li>
            <li><Link href="/custom-order" className="hover:text-gold-deep">Custom Order</Link></li>
          </ul>
        </div>

        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-deep">
            Customer Care
          </div>
          <ul className="mt-4 space-y-2.5 text-sm text-muted">
            <li><Link href="/track-order" className="hover:text-gold-deep">Track Order</Link></li>
            <li><Link href="/faq" className="hover:text-gold-deep">FAQ &amp; Care</Link></li>
            <li><Link href="/shipping-policy" className="hover:text-gold-deep">Shipping &amp; Delivery</Link></li>
            <li><Link href="/return-refund-policy" className="hover:text-gold-deep">Returns &amp; Exchanges</Link></li>
            <li><Link href="/install" className="hover:text-gold-deep">Install App</Link></li>
          </ul>
        </div>

        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-deep">
            Store &amp; Policies
          </div>
          <ul className="mt-4 space-y-2.5 text-sm text-muted">
            <li><Link href="/about" className="hover:text-gold-deep">About Us</Link></li>
            <li><Link href="/contact" className="hover:text-gold-deep">Visit Butwal Store</Link></li>
            <li><Link href="/terms" className="hover:text-gold-deep">Terms &amp; Conditions</Link></li>
            <li><Link href="/privacy" className="hover:text-gold-deep">Privacy Policy</Link></li>
            <li>
              <button
                type="button"
                onClick={() => setCookieModalOpen(true)}
                className="text-left hover:text-gold-deep"
              >
                Cookie Preferences
              </button>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-line bg-sand/50">
        <div className="container-shell flex flex-wrap items-center justify-between gap-3 py-4 text-xs text-muted">
          <span>
            &copy; {new Date().getFullYear()} {settings.storeName} · {settings.address}, Butwal
          </span>
          <span>Currency: NPR · Timezone: Asia/Kathmandu · eSewa / Khalti / Fonepay / COD</span>
        </div>
      </div>
    </footer>
  );
}
