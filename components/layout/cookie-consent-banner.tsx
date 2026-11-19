'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useStore } from '@/components/providers/store-provider';

export function CookieConsentBanner() {
  const { cookiePrefs, cookieModalOpen, setCookieModalOpen, saveCookiePrefs } = useStore();
  const [analytics, setAnalytics] = useState(cookiePrefs?.analytics ?? false);
  const [marketing, setMarketing] = useState(cookiePrefs?.marketing ?? false);

  const showBanner = cookiePrefs === null;

  return (
    <>
      {showBanner && !cookieModalOpen && (
        <div
          role="region"
          aria-label="Cookie consent"
          className="fixed bottom-4 right-4 z-40 max-w-md rounded-2xl border border-line bg-surface p-5 shadow-soft"
        >
          <p className="font-serif text-lg font-semibold text-ink">Cookie Preferences</p>
          <p className="mt-1.5 text-xs leading-relaxed text-muted">
            We use essential storage to keep your shopping bag and checkout secure. Optional analytics cookies are only enabled with your consent.{' '}
            <Link href="/cookies" className="underline hover:text-gold-deep">
              Cookie Policy
            </Link>
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => saveCookiePrefs({ analytics: true, marketing: true })}
              className="rounded-full bg-gold px-4 py-2 text-xs font-medium text-white transition hover:bg-gold-deep"
            >
              Accept All
            </button>
            <button
              type="button"
              onClick={() => saveCookiePrefs({ analytics: false, marketing: false })}
              className="rounded-full border border-line px-4 py-2 text-xs font-medium text-ink transition hover:border-gold"
            >
              Essential Only
            </button>
            <button
              type="button"
              onClick={() => setCookieModalOpen(true)}
              className="px-2 py-1 text-xs font-medium text-muted underline hover:text-ink"
            >
              Customize
            </button>
          </div>
        </div>
      )}

      {cookieModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Customize cookie preferences"
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/45 p-4 backdrop-blur-[2px]"
        >
          <div className="w-full max-w-md rounded-2xl border border-line bg-surface p-6 shadow-2xl">
            <h2 className="font-serif text-2xl font-semibold text-ink">Manage Cookie Preferences</h2>
            <p className="mt-2 text-xs text-muted">
              Choose which categories of cookies and local storage you allow on Radhakrishna Panchadhatu.
            </p>

            <div className="mt-5 space-y-3">
              <div className="flex items-start justify-between gap-4 rounded-xl border border-line bg-sand/60 p-3.5">
                <div>
                  <p className="text-sm font-medium text-ink">Essential Storage</p>
                  <p className="text-xs text-muted">Shopping cart, session security, and consent choice.</p>
                </div>
                <span className="text-xs font-medium text-success">Always Active</span>
              </div>

              <label className="flex cursor-pointer items-start justify-between gap-4 rounded-xl border border-line p-3.5">
                <div>
                  <p className="text-sm font-medium text-ink">Analytics</p>
                  <p className="text-xs text-muted">Helps us improve collection discovery and mobile speed.</p>
                </div>
                <input
                  type="checkbox"
                  checked={analytics}
                  onChange={(e) => setAnalytics(e.target.checked)}
                  className="mt-1 h-4 w-4 accent-gold"
                />
              </label>

              <label className="flex cursor-pointer items-start justify-between gap-4 rounded-xl border border-line p-3.5">
                <div>
                  <p className="text-sm font-medium text-ink">Marketing</p>
                  <p className="text-xs text-muted">Seasonal festival reminders and campaign attribution.</p>
                </div>
                <input
                  type="checkbox"
                  checked={marketing}
                  onChange={(e) => setMarketing(e.target.checked)}
                  className="mt-1 h-4 w-4 accent-gold"
                />
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setCookieModalOpen(false)}
                className="rounded-full border border-line px-4 py-2 text-xs font-medium text-ink"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => saveCookiePrefs({ analytics, marketing })}
                className="rounded-full bg-gold px-5 py-2 text-xs font-medium text-white hover:bg-gold-deep"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
