'use client';

import { useEffect, useState } from 'react';
import type { HomepageSection } from '@/lib/store/types';

export default function AdminHomepagePage() {
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/cms')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.homepageSections)) setSections(data.homepageSections);
      });
  }, []);

  const updateLocal = (id: string, patch: Partial<HomepageSection>) => {
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  };

  const handleSave = async (sec: HomepageSection) => {
    setSavingId(sec.id);
    const res = await fetch('/api/admin/cms', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resource: 'homepageSection', data: sec }),
    });
    const data = await res.json();
    if (Array.isArray(data.homepageSections)) setSections(data.homepageSections);
    setSavingId(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-deep">CMS</p>
        <h1 className="section-title mt-2">Homepage Sections</h1>
      </div>

      <div className="grid gap-5">
        {sections.map((sec) => (
          <div key={sec.id} className="card space-y-4 p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-deep">
                {sec.type} &middot; Order #{sec.sortOrder}
              </span>
              <label className="flex items-center gap-2 text-xs font-medium text-ink">
                <input
                  type="checkbox"
                  checked={sec.enabled}
                  onChange={(e) => updateLocal(sec.id, { enabled: e.target.checked })}
                  className="h-4 w-4 accent-gold"
                />
                Visible on Homepage
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-xs font-medium text-ink">
                Section Title
                <input
                  value={sec.title}
                  onChange={(e) => updateLocal(sec.id, { title: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-line bg-field px-3 py-2 text-sm outline-none focus:border-gold"
                />
              </label>
              <label className="text-xs font-medium text-ink">
                CTA Label (optional)
                <input
                  value={sec.ctaLabel || ''}
                  onChange={(e) => updateLocal(sec.id, { ctaLabel: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-line bg-field px-3 py-2 text-sm outline-none focus:border-gold"
                />
              </label>
              <label className="text-xs font-medium text-ink sm:col-span-2">
                Subtitle
                <textarea
                  rows={2}
                  value={sec.subtitle}
                  onChange={(e) => updateLocal(sec.id, { subtitle: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-line bg-field px-3 py-2 text-sm outline-none focus:border-gold"
                />
              </label>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                disabled={savingId === sec.id}
                onClick={() => handleSave(sec)}
                className="rounded-full bg-gold px-5 py-2 text-xs font-medium text-white hover:bg-gold-deep"
              >
                {savingId === sec.id ? 'Saving...' : 'Save Section'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
