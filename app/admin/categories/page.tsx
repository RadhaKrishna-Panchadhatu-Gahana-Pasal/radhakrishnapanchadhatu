'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Trash2 } from 'lucide-react';
import type { Category } from '@/lib/store/types';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    const res = await fetch('/api/admin/categories');
    const data = await res.json();
    if (Array.isArray(data.categories)) setCategories(data.categories);
  };

  useEffect(() => {
    load();
  }, []);

  const toggleActive = async (cat: Category) => {
    setError(null);
    await fetch('/api/admin/categories', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: cat.id, isActive: !cat.isActive }),
    });
    load();
  };

  const handleDelete = async (id: string) => {
    setError(null);
    const res = await fetch(`/api/admin/categories?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Unable to delete category.');
    } else {
      load();
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-deep">
            Collections
          </p>
          <h1 className="section-title mt-2">Categories</h1>
        </div>
        <Link
          href="/admin/categories/new"
          className="inline-flex items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-sm font-medium text-white hover:bg-gold-deep"
        >
          <Plus className="h-4 w-4" /> New Category
        </Link>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-danger/30 bg-surface p-3 text-xs text-danger">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {categories.map((cat) => (
          <div key={cat.id} className="card flex flex-col justify-between p-5">
            <div>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-serif text-2xl font-semibold text-ink">{cat.name}</h2>
                  <p className="text-xs text-muted">
                    /{cat.slug} &middot; Sort #{cat.sortOrder}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleActive(cat)}
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    cat.isActive
                      ? 'bg-success/15 text-success'
                      : 'bg-sand text-muted'
                  }`}
                >
                  {cat.isActive ? 'Active' : 'Hidden'}
                </button>
              </div>
              <p className="mt-2 text-sm text-muted">{cat.description}</p>
            </div>

            <div className="mt-4 flex justify-end border-t border-line pt-3">
              <button
                type="button"
                onClick={() => handleDelete(cat.id)}
                className="inline-flex items-center gap-1 text-xs font-medium text-muted hover:text-danger"
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
