'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Archive, Edit3, Plus, Search } from 'lucide-react';
import { formatNPR } from '@/lib/store/money';
import type { Product } from '@/lib/store/types';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/products');
      const data = await res.json();
      if (Array.isArray(data.products)) {
        setProducts(data.products);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleArchive = async (id: string) => {
    await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
    loadProducts();
  };

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.sku.toLowerCase().includes(query.toLowerCase()) ||
      p.categoryName.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-deep">
            Catalogue
          </p>
          <h1 className="section-title mt-2">Products ({products.length})</h1>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-sm font-medium text-white hover:bg-gold-deep"
        >
          <Plus className="h-4 w-4" /> New Product
        </Link>
      </div>

      <div className="mb-5 relative max-w-md">
        <Search className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-muted" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter by name, SKU, or category..."
          className="w-full rounded-xl border border-line bg-surface py-2.5 pl-10 pr-4 text-sm outline-none focus:border-gold"
        />
      </div>

      {loading ? (
        <div className="card p-8 text-sm text-muted">Loading products...</div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line bg-sand/60 text-xs uppercase tracking-[0.14em] text-muted">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Material / Category</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-sand/30">
                  <td className="px-4 py-3.5">
                    <div className="font-semibold text-ink">{p.name}</div>
                    <div className="text-xs text-muted">{p.sku}</div>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-muted">
                    {p.material} &middot; {p.categoryName}
                  </td>
                  <td className="px-4 py-3.5 font-medium tabular-nums">
                    {formatNPR(p.pricePaisa)}
                  </td>
                  <td className="px-4 py-3.5 tabular-nums">{p.stockQuantity}</td>
                  <td className="px-4 py-3.5 text-xs font-semibold">{p.status}</td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="inline-flex items-center gap-2">
                      <Link
                        href={`/admin/products/${p.id}`}
                        className="inline-flex items-center gap-1 rounded-full border border-line px-3 py-1 text-xs font-medium text-ink hover:border-gold"
                      >
                        <Edit3 className="h-3 w-3" /> Edit
                      </Link>
                      {p.status !== 'ARCHIVED' && (
                        <button
                          type="button"
                          onClick={() => handleArchive(p.id)}
                          className="inline-flex items-center gap-1 rounded-full border border-line px-3 py-1 text-xs font-medium text-muted hover:border-danger hover:text-danger"
                        >
                          <Archive className="h-3 w-3" /> Archive
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
