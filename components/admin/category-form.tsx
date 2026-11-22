'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export function CategoryForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('/images/product-necklace.jpg');
  const [isActive, setIsActive] = useState(true);
  const [sortOrder, setSortOrder] = useState(10);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          description,
          imageUrl,
          isActive,
          sortOrder: Number(sortOrder) || 10,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Could not create category.');
      } else {
        router.push('/admin/categories');
        router.refresh();
      }
    } catch {
      setError('Network error saving category.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card p-6 md:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-deep">Categories</p>
      <h1 className="mt-2 font-serif text-3xl font-semibold text-ink">Add Category</h1>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <label className="text-sm font-medium text-ink">
          Category Name *
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Bridal Sets"
            className="mt-1.5 w-full rounded-xl border border-line bg-field px-4 py-2.5 text-sm outline-none focus:border-gold"
          />
        </label>

        <label className="text-sm font-medium text-ink">
          Slug *
          <input
            required
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="bridal-sets"
            className="mt-1.5 w-full rounded-xl border border-line bg-field px-4 py-2.5 text-sm outline-none focus:border-gold"
          />
        </label>

        <label className="text-sm font-medium text-ink">
          Image Path / URL
          <input
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-line bg-field px-4 py-2.5 text-sm outline-none focus:border-gold"
          />
        </label>

        <label className="text-sm font-medium text-ink">
          Sort Order
          <input
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(Number(e.target.value))}
            className="mt-1.5 w-full rounded-xl border border-line bg-field px-4 py-2.5 text-sm outline-none focus:border-gold"
          />
        </label>

        <label className="text-sm font-medium text-ink md:col-span-2">
          Description
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-line bg-field px-4 py-2.5 text-sm outline-none focus:border-gold"
          />
        </label>

        <label className="flex items-center gap-3 text-sm font-medium text-ink">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="h-4 w-4 accent-gold"
          />
          Visible in Public Storefront
        </label>
      </div>

      {error && <p className="mt-4 text-xs font-medium text-danger">{error}</p>}

      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.push('/admin/categories')}
          className="rounded-full border border-line px-5 py-2.5 text-sm font-medium text-ink"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-gold px-6 py-2.5 text-sm font-medium text-white hover:bg-gold-deep disabled:opacity-50"
        >
          {submitting ? 'Saving...' : 'Save Category'}
        </button>
      </div>
    </form>
  );
}

export default CategoryForm;
