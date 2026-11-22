'use client';

import { useState } from 'react';
import type { ContentPage } from '@/lib/store/types';

export default function AdminPagesEditor({ initialPages }: { initialPages: ContentPage[] }) {
  const [pages, setPages] = useState(initialPages);
  const [savingSlug, setSavingSlug] = useState<string | null>(null);
  const [notice, setNotice] = useState('');

  const updateLocal = (slug: string, patch: Partial<ContentPage>) => {
    setPages((prev) => prev.map((p) => (p.slug === slug ? { ...p, ...patch } : p)));
  };

  const handleSave = async (page: ContentPage) => {
    setSavingSlug(page.slug);
    setNotice('');
    try {
      const res = await fetch('/api/admin/cms', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resource: 'page', data: page }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not save this page.');
      const saved = data.pages.find((p: ContentPage) => p.slug === page.slug);
      updateLocal(page.slug, { updatedAt: saved.updatedAt });
      setNotice(`Saved /${page.slug} in the current store session.`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Could not save this page.');
    } finally {
      setSavingSlug(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-deep">CMS</p>
        <h1 className="section-title mt-2">Store Pages &amp; Policies</h1>
      </div>

      <p className="text-sm text-muted">Edits use this server’s memory and may reset on restart or redeployment.</p>
      <p role="status" className="text-sm text-ink">{notice}</p>
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
                disabled={savingSlug !== null || !page.title.trim() || !page.content.trim()}
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
