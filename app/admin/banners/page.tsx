'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import type { Banner } from '@/lib/store/types';

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/cms')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.banners)) setBanners(data.banners);
      });
  }, []);

  const updateLocal = (id: string, patch: Partial<Banner>) => {
    setBanners((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  };

  const handleSave = async (banner: Banner) => {
    setSavingId(banner.id);
    const res = await fetch('/api/admin/cms', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resource: 'banner', data: banner }),
    });
    const data = await res.json();
    if (Array.isArray(data.banners)) setBanners(data.banners);
    setSavingId(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-deep">CMS</p>
        <h1 className="section-title mt-2">Hero &amp; Promo Banners</h1>
      </div>

      <div className="grid gap-6">
        {banners.map((banner) => (
          <div key={banner.id} className="card grid gap-6 p-6 md:grid-cols-[240px_1fr]">
            <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-line bg-sand">
              <Image
                src={banner.imageUrl || '/images/hero-panchadhatu.jpg'}
                alt={banner.imageAlt || banner.title}
                fill
                sizes="240px"
                referrerPolicy="no-referrer"
                className="object-cover"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-xs font-medium text-ink">
                Headline
                <input
                  value={banner.title}
                  onChange={(e) => updateLocal(banner.id, { title: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-line bg-[#FAF8F4] px-3 py-2 text-sm outline-none focus:border-gold"
                />
              </label>

              <label className="text-xs font-medium text-ink">
                Image Path / URL
                <input
                  value={banner.imageUrl}
                  onChange={(e) => updateLocal(banner.id, { imageUrl: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-line bg-[#FAF8F4] px-3 py-2 text-sm outline-none focus:border-gold"
                />
              </label>

              <label className="text-xs font-medium text-ink sm:col-span-2">
                Subtitle
                <input
                  value={banner.subtitle}
                  onChange={(e) => updateLocal(banner.id, { subtitle: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-line bg-[#FAF8F4] px-3 py-2 text-sm outline-none focus:border-gold"
                />
              </label>

              <label className="text-xs font-medium text-ink">
                CTA Label
                <input
                  value={banner.ctaLabel}
                  onChange={(e) => updateLocal(banner.id, { ctaLabel: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-line bg-[#FAF8F4] px-3 py-2 text-sm outline-none focus:border-gold"
                />
              </label>

              <label className="text-xs font-medium text-ink">
                CTA Link
                <input
                  value={banner.ctaUrl}
                  onChange={(e) => updateLocal(banner.id, { ctaUrl: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-line bg-[#FAF8F4] px-3 py-2 text-sm outline-none focus:border-gold"
                />
              </label>

              <div className="flex items-center justify-between sm:col-span-2">
                <label className="flex items-center gap-2 text-xs font-medium text-ink">
                  <input
                    type="checkbox"
                    checked={banner.enabled}
                    onChange={(e) => updateLocal(banner.id, { enabled: e.target.checked })}
                    className="h-4 w-4 accent-gold"
                  />
                  Enabled on storefront
                </label>

                <button
                  type="button"
                  disabled={savingId === banner.id}
                  onClick={() => handleSave(banner)}
                  className="rounded-full bg-gold px-5 py-2 text-xs font-medium text-white hover:bg-gold-deep disabled:opacity-50"
                >
                  {savingId === banner.id ? 'Saving...' : 'Save Banner'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
