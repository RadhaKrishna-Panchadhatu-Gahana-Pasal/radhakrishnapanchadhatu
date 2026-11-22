import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, Manrope } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { AnnouncementBar } from '@/components/layout/announcement-bar';
import { CartDrawer } from '@/components/layout/cart-drawer';
import { CookieConsentBanner } from '@/components/layout/cookie-consent-banner';
import { Footer } from '@/components/layout/footer';
import { Header } from '@/components/layout/header';
import { OfflineIndicator } from '@/components/pwa/offline-indicator';
import { StoreProvider } from '@/components/providers/store-provider';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { getFirebaseClientConfig } from '@/lib/firebase/server-config';
import { getSiteBaseUrl } from '@/lib/seo/metadata';
import { getStore, hydrateStore } from '@/lib/store/repository';

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
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F7F5F0' },
    { media: '(prefers-color-scheme: dark)', color: '#12110F' },
  ],
  width: 'device-width',
  initialScale: 1,
};

// Runs before the first paint so the saved theme is applied without a flash.
const themeBootstrap = `(function(){try{var p=localStorage.getItem('rkp_theme')||'system';var d=p==='dark'||(p==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);var r=document.documentElement;if(d){r.classList.add('dark');}r.style.colorScheme=d?'dark':'light';}catch(e){}})();`;

export const metadata: Metadata = {
  metadataBase: new URL(getSiteBaseUrl()),
  title: {
    default: 'Radhakrishna Panchadhatu | Handcrafted Panchadhatu & Steel Jewellery',
    template: '%s | Radhakrishna Panchadhatu',
  },
  description:
    'Handcrafted Panchadhatu & 316L Surgical Steel Jewellery from 3 Tilottama Path, Yogikuti, Butwal 32907. Nationwide delivery across Nepal with eSewa, Khalti, Fonepay & COD.',
  applicationName: 'Radhakrishna Panchadhatu',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Radhakrishna',
  },
  icons: {
    icon: [{ url: '/icon.png', type: 'image/png', sizes: '256x256' }],
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'Radhakrishna Panchadhatu | Butwal, Nepal',
    description:
      'Authentic five-metal Panchadhatu ornaments and modern 316L surgical steel jewellery delivered across Nepal.',
    type: 'website',
    locale: 'en_NP',
    siteName: 'Radhakrishna Panchadhatu',
    images: [
      {
        url: '/images/hero-panchadhatu.jpg',
        width: 1200,
        height: 675,
        alt: 'Radhakrishna Panchadhatu crafted Nepali ornaments',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Radhakrishna Panchadhatu | Butwal, Nepal',
    description:
      'Authentic five-metal Panchadhatu ornaments and modern 316L surgical steel jewellery delivered across Nepal.',
    images: ['/images/hero-panchadhatu.jpg'],
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Loads the saved store once per server instance: Postgres on Vercel,
  // the local JSON file during development.
  await hydrateStore();
  const store = getStore();
  const firebaseConfig = getFirebaseClientConfig();
  const activeAnnouncements = store.announcements
    .filter((a) => a.enabled)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${manrope.variable}`}
      suppressHydrationWarning
    >
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
        <ThemeProvider>
          <StoreProvider firebaseConfig={firebaseConfig}>
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
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
