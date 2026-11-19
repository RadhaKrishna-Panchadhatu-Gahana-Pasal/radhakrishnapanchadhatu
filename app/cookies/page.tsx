'use client';

import { useStore } from '@/components/providers/store-provider';

export default function CookiesPage() {
  const { cookiePrefs, setCookieModalOpen } = useStore();

  return (
    <div className="container-shell py-14">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-deep">
          Radhakrishna Panchadhatu
        </p>
        <h1 className="section-title mt-2">Cookie Policy &amp; Preferences</h1>
        <p className="mt-3 text-base text-muted">
          Essential, analytics, and marketing cookie controls for your browsing session.
        </p>

        <div className="card mt-8 space-y-5 p-8 text-sm leading-relaxed text-ink/90 sm:text-base">
          <p>
            Essential cookies and browser storage keep your shopping bag, wishlist, checkout state, and cookie preferences working reliably.
          </p>
          <p>
            Optional analytics and marketing cookies are disabled until you explicitly choose to enable them.
          </p>
          <div className="rounded-xl border border-line bg-sand/60 p-4 text-xs">
            <p className="font-semibold text-ink">Current Preference Status</p>
            <p className="mt-1 text-muted">
              Essential: Active &middot; Analytics:{' '}
              {cookiePrefs?.analytics ? 'Enabled' : 'Disabled'} &middot; Marketing:{' '}
              {cookiePrefs?.marketing ? 'Enabled' : 'Disabled'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setCookieModalOpen(true)}
            className="rounded-full bg-gold px-6 py-2.5 text-sm font-medium text-white hover:bg-gold-deep"
          >
            Update Cookie Preferences
          </button>
        </div>
      </div>
    </div>
  );
}
