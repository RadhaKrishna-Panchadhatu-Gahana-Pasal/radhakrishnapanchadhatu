'use client';

import Link from 'next/link';
import { CheckCircle2, Smartphone } from 'lucide-react';
import { PWAInstallButton } from '@/components/pwa/pwa-install-button';
import { useStore } from '@/components/providers/store-provider';

export default function InstallPage() {
  const { isInstalledPwa } = useStore();

  return (
    <div className="container-shell py-14">
      <div className="card mx-auto max-w-2xl p-8 sm:p-10">
        <div className="flex items-center gap-3 text-gold-deep">
          <Smartphone className="h-7 w-7" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em]">Progressive Web App</p>
            <h1 className="font-serif text-3xl font-semibold text-ink">
              Install Radhakrishna Storefront
            </h1>
          </div>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-muted">
          Install our lightweight web app on your phone or desktop for faster catalogue browsing, instant home-screen launch, and offline fallback when network reception drops.
        </p>

        {isInstalledPwa ? (
          <div className="mt-6 flex items-center gap-2 rounded-2xl border border-success/30 bg-sand/70 p-4 text-sm font-medium text-success">
            <CheckCircle2 className="h-5 w-5" />
            App is already installed on this device.
          </div>
        ) : (
          <div className="mt-6">
            <PWAInstallButton />
          </div>
        )}

        <div className="mt-8 border-t border-line pt-6 text-xs text-muted space-y-2">
          <p className="font-semibold text-ink">Android Chrome / Desktop Edge &amp; Chrome</p>
          <p>Use the Install App button above or select &ldquo;Install App&rdquo; from your browser menu.</p>
          <p className="pt-2 font-semibold text-ink">iPhone &amp; iPad (Safari)</p>
          <p>Tap Share &rarr; Add to Home Screen &rarr; Add.</p>
        </div>

        <div className="mt-6">
          <Link href="/catalog" className="text-sm font-medium text-gold-deep underline">
            Return to Catalog
          </Link>
        </div>
      </div>
    </div>
  );
}
