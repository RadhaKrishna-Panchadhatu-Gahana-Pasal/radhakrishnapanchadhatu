'use client';

import { useEffect, useState } from 'react';
import type { ContentPage } from '@/lib/store/types';

export default function AdminPagesEditor() {
  const [pages, setPages] = useState<ContentPage[]>([]);
  const [savingSlug, setSavingSlug] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/cms')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.pages)) setPages(data.pages);
      });
  }, []);

  const updateLocal = (slug: string, patch: Partial<ContentPage>) => {
    setPages((prev) => prev.map((p) => (p.slug === slug ? { ...p, ...patch } : p)));
  };

  const handleSave = async (page: ContentPage) => {
    setSavingSlug(page.slug);
    const res = await fetch('/api/admin/cms', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resource: 'page', data: page }),
    });
    const data = await res.json();
    if (Array.isArray(data.pages)) setPages(data.pages);
    setSavingSlug(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-deep">CMS</p>
        <h1 className="section-title mt-2">Store Pages &amp; Policies</h1>
      </div>

      <div className="space-y-5">
        {pages.map((page) => (
          <div key={page.slug} className="card space-y-4 p-6">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-gold-deep">/{page.slug}</span>
              <span className="text-xs text-muted">
                Updated {new Date(page.updatedAt).toLocaleDateString()}
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-xs font-medium text-ink">
                Page Title
                <input
                  value={page.title}
                  onChange={(e) => updateLocal(page.slug, { title: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-line bg-[#FAF8F4] px-3 py-2 text-sm outline-none focus:border-gold"
                />
              </label>
              <label className="text-xs font-medium text-ink">
                Summary
                <input
                  value={page.summary}
                  onChange={(e) => updateLocal(page.slug, { summary: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-line bg-[#FAF8F4] px-3 py-2 text-sm outline-none focus:border-gold"
                />
              </label>
            </div>

            <label className="block text-xs font-medium text-ink">
              Body Copy
              <textarea
                rows={4}
                value={page.content}
                onChange={(e) => updateLocal(page.slug, { content: e.target.value })}
                className="mt-1 w-full rounded-xl border border-line bg-[#FAF8F4] px-3 py-2 text-sm outline-none focus:border-gold"
              />
            </label>

            <div className="flex justify-end">
              <button
                type="button"
                disabled={savingSlug === page.slug}
                onClick={() => handleSave(page)}
                className="rounded-full bg-gold px-5 py-2 text-xs font-medium text-white hover:bg-gold-deep"
              >
                {savingSlug === page.slug ? 'Saving...' : 'Save Page'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
