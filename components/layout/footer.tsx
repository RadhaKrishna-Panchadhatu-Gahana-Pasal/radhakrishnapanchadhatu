'use client';

import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Phone } from 'lucide-react';
import { useStore } from '@/components/providers/store-provider';
import { PWAInstallButton } from '@/components/pwa/pwa-install-button';
import type { StoreSettings } from '@/lib/store/types';

export function Footer({ settings }: { settings: StoreSettings }) {
  const { setCookieModalOpen } = useStore();

  return (
    <footer className="relative overflow-hidden border-t border-line bg-surface">
      {/* Studio watermark: a faint presence, never over the shopping content. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 select-none whitespace-nowrap text-center font-serif text-[15vw] font-semibold leading-[0.78] tracking-tight text-ink/[0.04]"
      >
        Lamir Kohsa
      </span>

      <div className="container-shell relative grid gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-1">
          <Link href="/" aria-label={`${settings.storeName} home`} className="inline-block">
            <Image
              src="/brand/logo-light.png"
              alt={settings.storeName}
              width={900}
              height={366}
              className="h-14 w-auto dark:hidden"
            />
            <Image
              src="/brand/logo-dark.png"
              alt=""
              aria-hidden
              width={900}
              height={366}
              className="hidden h-14 w-auto dark:block"
            />
          </Link>
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

      <div className="relative border-t border-line bg-sand/50">
        <div className="container-shell flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-4 text-xs text-muted">
          <span>
            &copy; {new Date().getFullYear()} {settings.storeName} · {settings.address}, Butwal
          </span>
          <span>Currency: NPR · Timezone: Asia/Kathmandu · eSewa / Khalti / Fonepay / COD</span>
          <span className="flex items-center gap-1.5">
            <span>Website by</span>
            <a
              href="https://github.com/ashokrimal"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-ink/75 underline-offset-2 transition hover:text-gold-deep hover:underline"
            >
              Ashok Rimal
            </a>
            <span aria-hidden="true" className="text-line">
              |
            </span>
            <span
              className="font-serif text-[13px] tracking-[0.08em] text-gold-deep/75"
              title="Lamir Kohsa"
            >
              Lamir Kohsa
            </span>
          </span>
        </div>
      </div>
    </footer>
  );
}
