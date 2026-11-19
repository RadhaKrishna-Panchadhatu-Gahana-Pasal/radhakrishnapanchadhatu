'use client';

import { useEffect, useState } from 'react';
import type { Announcement } from '@/lib/store/types';

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/cms')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.announcements)) setAnnouncements(data.announcements);
      });
  }, []);

  const updateLocal = (id: string, patch: Partial<Announcement>) => {
    setAnnouncements((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  };

  const handleSave = async (ann: Announcement) => {
    setSavingId(ann.id);
    const res = await fetch('/api/admin/cms', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resource: 'announcement', data: ann }),
    });
    const data = await res.json();
    if (Array.isArray(data.announcements)) setAnnouncements(data.announcements);
    setSavingId(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-deep">CMS</p>
        <h1 className="section-title mt-2">Top Announcement Bar</h1>
      </div>

      {announcements.map((ann) => (
        <div key={ann.id} className="card space-y-4 p-6">
          <label className="block text-xs font-medium text-ink">
            Announcement Message
            <input
              value={ann.message}
              onChange={(e) => updateLocal(ann.id, { message: e.target.value })}
              className="mt-1 w-full rounded-xl border border-line bg-[#FAF8F4] px-3.5 py-2.5 text-sm outline-none focus:border-gold"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-3">
            <label className="text-xs font-medium text-ink">
              Link Label
              <input
                value={ann.linkLabel || ''}
                onChange={(e) => updateLocal(ann.id, { linkLabel: e.target.value })}
                className="mt-1 w-full rounded-xl border border-line bg-[#FAF8F4] px-3 py-2 text-sm outline-none focus:border-gold"
              />
            </label>
            <label className="text-xs font-medium text-ink">
              Link URL
              <input
                value={ann.linkUrl || ''}
                onChange={(e) => updateLocal(ann.id, { linkUrl: e.target.value })}
                className="mt-1 w-full rounded-xl border border-line bg-[#FAF8F4] px-3 py-2 text-sm outline-none focus:border-gold"
              />
            </label>
            <label className="text-xs font-medium text-ink">
              Display Mode
              <select
                value={ann.mode}
                onChange={(e) =>
                  updateLocal(ann.id, { mode: e.target.value as 'STATIC' | 'SCROLLING' })
                }
                className="mt-1 w-full rounded-xl border border-line bg-[#FAF8F4] px-3 py-2 text-sm outline-none focus:border-gold"
              >
                <option value="STATIC">Static Centered</option>
                <option value="SCROLLING">Scrolling Marquee</option>
              </select>
            </label>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <div className="flex gap-5 text-xs font-medium text-ink">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={ann.enabled}
                  onChange={(e) => updateLocal(ann.id, { enabled: e.target.checked })}
                  className="h-4 w-4 accent-gold"
                />
                Enabled
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={ann.dismissible}
                  onChange={(e) => updateLocal(ann.id, { dismissible: e.target.checked })}
                  className="h-4 w-4 accent-gold"
                />
                Dismissible
              </label>
            </div>

            <button
              type="button"
              disabled={savingId === ann.id}
              onClick={() => handleSave(ann)}
              className="rounded-full bg-gold px-5 py-2 text-xs font-medium text-white hover:bg-gold-deep"
            >
              {savingId === ann.id ? 'Saving...' : 'Save Announcement'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
