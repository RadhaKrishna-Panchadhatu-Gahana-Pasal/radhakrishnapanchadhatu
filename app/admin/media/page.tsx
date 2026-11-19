'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Image from 'next/image';
import type { MediaAsset } from '@/lib/store/types';

export default function AdminMediaPage() {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [alt, setAlt] = useState('');
  const [category, setCategory] = useState<'PRODUCT' | 'BANNER' | 'EDITORIAL' | 'CATEGORY'>(
    'PRODUCT'
  );

  useEffect(() => {
    fetch('/api/admin/cms')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.mediaAssets)) setAssets(data.mediaAssets);
      });
  }, []);

  const handleAddAsset = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!url.trim()) return;
    const res = await fetch('/api/admin/cms', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        resource: 'media',
        data: { title, url, alt, category },
      }),
    });
    const data = await res.json();
    if (Array.isArray(data.mediaAssets)) setAssets(data.mediaAssets);
    setTitle('');
    setUrl('');
    setAlt('');
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-deep">CMS Assets</p>
        <h1 className="section-title mt-2">Media Library</h1>
      </div>

      <form onSubmit={handleAddAsset} className="card grid gap-4 p-5 sm:grid-cols-4">
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Asset title"
          className="rounded-xl border border-line bg-[#FAF8F4] px-3 py-2 text-sm outline-none focus:border-gold"
        />
        <input
          required
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="/images/... or https://..."
          className="rounded-xl border border-line bg-[#FAF8F4] px-3 py-2 text-sm outline-none focus:border-gold"
        />
        <select
          value={category}
          onChange={(e) =>
            setCategory(e.target.value as 'PRODUCT' | 'BANNER' | 'EDITORIAL' | 'CATEGORY')
          }
          className="rounded-xl border border-line bg-[#FAF8F4] px-3 py-2 text-sm outline-none focus:border-gold"
        >
          <option value="PRODUCT">Product</option>
          <option value="BANNER">Banner</option>
          <option value="EDITORIAL">Editorial</option>
          <option value="CATEGORY">Category</option>
        </select>
        <button
          type="submit"
          className="rounded-full bg-gold px-4 py-2 text-xs font-medium text-white hover:bg-gold-deep"
        >
          Register Media Asset
        </button>
      </form>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {assets.map((asset) => (
          <div key={asset.id} className="card p-4">
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-line bg-sand">
              <Image
                src={asset.url}
                alt={asset.alt || asset.title}
                fill
                sizes="(max-width: 1024px) 50vw, 30vw"
                referrerPolicy="no-referrer"
                className="object-cover"
              />
            </div>
            <div className="mt-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gold-deep">
                {asset.category}
              </p>
              <p className="font-serif text-lg font-semibold text-ink">{asset.title}</p>
              <p className="mt-1 truncate font-mono text-[11px] text-muted">{asset.url}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
