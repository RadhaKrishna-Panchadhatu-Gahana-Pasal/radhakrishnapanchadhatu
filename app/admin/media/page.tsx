'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import Image from 'next/image';
import type { MediaAsset } from '@/lib/store/types';

type MediaCategory = 'PRODUCT' | 'BANNER' | 'EDITORIAL' | 'CATEGORY';

export default function AdminMediaPage() {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [alt, setAlt] = useState('');
  const [category, setCategory] = useState<MediaCategory>('PRODUCT');
  const [uploading, setUploading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    fetch('/api/admin/cms')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.mediaAssets)) setAssets(data.mediaAssets);
      })
      .catch(() => setError('Could not load the media library.'));
  }, []);

  const registerAsset = async (asset: {
    title: string;
    url: string;
    alt: string;
    category: MediaCategory;
  }) => {
    const res = await fetch('/api/admin/cms', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resource: 'media', data: asset }),
    });
    const data = await res.json();
    if (Array.isArray(data.mediaAssets)) setAssets(data.mediaAssets);
    return res.ok;
  };

  const handleAddAsset = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!url.trim()) return;
    setError(null);
    setNotice(null);
    const saved = await registerAsset({ title, url, alt, category });
    if (!saved) {
      setError('Could not register this media asset.');
      return;
    }
    setTitle('');
    setUrl('');
    setAlt('');
    setNotice('Media asset registered.');
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    setError(null);
    setNotice(null);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/admin/media/upload', { method: 'POST', body: form });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Upload failed.');
        return;
      }

      const assetTitle = title.trim() || data.title || file.name;
      const assetAlt = alt.trim() || assetTitle;
      const saved = await registerAsset({
        title: assetTitle,
        url: data.url,
        alt: assetAlt,
        category,
      });

      if (!saved) {
        setError(`Uploaded to ${data.url}, but the library entry could not be saved. Paste that URL above.`);
        return;
      }

      setTitle('');
      setUrl('');
      setAlt('');
      setNotice(`${file.name} uploaded and added to the library.`);
    } catch {
      setError('Upload failed. Check your connection and try again.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-deep">CMS Assets</p>
        <h1 className="section-title mt-2">Media Library</h1>
      </div>

      <div className="card p-5">
        <h2 className="font-serif text-xl font-semibold text-ink">Upload from this device</h2>
        <p className="mt-1 text-xs text-muted">
          JPG, PNG, WebP, GIF or AVIF up to 5 MB. The file is stored alongside your shop data and
          is added to the library below with the title and category chosen here.
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          disabled={uploading}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void handleUpload(file);
          }}
          className="mt-3 block w-full cursor-pointer rounded-xl border border-line bg-field px-3 py-2 text-xs text-ink file:mr-3 file:rounded-full file:border-0 file:bg-gold file:px-4 file:py-2 file:text-xs file:font-medium file:text-white hover:file:bg-gold-deep"
        />
        {uploading && <p className="mt-2 text-xs text-muted">Uploading…</p>}
        <p className="mt-2 text-[11px] text-muted">
          Uploads need a writable disk. On a read-only host such as Vercel, use an image URL
          instead.
        </p>
      </div>

      <form onSubmit={handleAddAsset} className="card grid gap-4 p-5 sm:grid-cols-4">
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Asset title"
          className="rounded-xl border border-line bg-field px-3 py-2 text-sm outline-none focus:border-gold"
        />
        <input
          required
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="/images/... or https://..."
          className="rounded-xl border border-line bg-field px-3 py-2 text-sm outline-none focus:border-gold"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as MediaCategory)}
          className="rounded-xl border border-line bg-field px-3 py-2 text-sm outline-none focus:border-gold"
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
          Register from URL
        </button>
      </form>

      {notice && <p className="text-xs text-success">{notice}</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}

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
