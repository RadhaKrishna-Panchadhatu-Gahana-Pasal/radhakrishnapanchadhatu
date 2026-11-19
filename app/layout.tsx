import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, Manrope } from 'next/font/google';
import { AnnouncementBar } from '@/components/layout/announcement-bar';
import { CartDrawer } from '@/components/layout/cart-drawer';
import { CookieConsentBanner } from '@/components/layout/cookie-consent-banner';
import { Footer } from '@/components/layout/footer';
import { Header } from '@/components/layout/header';
import { OfflineIndicator } from '@/components/pwa/offline-indicator';
import { StoreProvider } from '@/components/providers/store-provider';
import { getStore } from '@/lib/store/repository';

export const dynamic = 'force-dynamic';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-cormorant',
  display: 'swap',
});

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-manrope',
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: '#B08A45',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: 'Radhakrishna Panchadhatu | Handcrafted Panchadhatu & Steel Jewellery',
    template: '%s | Radhakrishna Panchadhatu',
  },
  description:
    'Handcrafted Panchadhatu & 316L Surgical Steel Jewellery from Yogikuti, Santichowk, Butwal. Nationwide delivery across Nepal with eSewa, Khalti, Fonepay & Cash on Delivery.',
  applicationName: 'Radhakrishna Panchadhatu',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Radhakrishna',
  },
  icons: {
    icon: '/icon.svg',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'Radhakrishna Panchadhatu | Butwal, Nepal',
    description:
      'Authentic five-metal Panchadhatu ornaments and modern 316L surgical steel jewellery delivered across Nepal.',
    type: 'website',
    locale: 'en_NP',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const store = getStore();
  const activeAnnouncements = store.announcements
    .filter((a) => a.enabled)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <html lang="en" className={`${cormorant.variable} ${manrope.variable}`}>
      <body>
        <StoreProvider>
          <div className="flex min-h-screen flex-col bg-sand text-ink">
            <AnnouncementBar announcements={activeAnnouncements} />
            <Header storeName={store.settings.storeName} />
            <main className="flex-1">{children}</main>
            <Footer settings={store.settings} />
          </div>
          <CartDrawer />
          <CookieConsentBanner />
          <OfflineIndicator />
        </StoreProvider>
      </body>
    </html>
  );
}
