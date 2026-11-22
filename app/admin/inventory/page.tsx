'use client';

import { useEffect, useState } from 'react';
import type { InventoryMovement, Product } from '@/lib/store/types';

export default function AdminInventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [draftStock, setDraftStock] = useState<Record<string, number>>({});

  const load = async () => {
    const res = await fetch('/api/admin/products');
    const data = await res.json();
    if (Array.isArray(data.products)) {
      setProducts(data.products);
      const map: Record<string, number> = {};
      for (const p of data.products as Product[]) {
        map[p.id] = p.stockQuantity;
      }
      setDraftStock(map);
    }
    if (Array.isArray(data.inventoryMovements)) setMovements(data.inventoryMovements);
  };

  useEffect(() => {
    load();
  }, []);

  const handleAdjust = async (productId: string) => {
    await fetch(`/api/admin/products/${productId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        stockQuantity: draftStock[productId] ?? 0,
        stockReason: 'Manual inventory restock/adjustment',
      }),
    });
    load();
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-deep">
          Stock Control
        </p>
        <h1 className="section-title mt-2">Inventory &amp; Movements</h1>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line bg-sand/60 text-xs uppercase tracking-[0.14em] text-muted">
            <tr>
              <th className="px-4 py-3">SKU / Product</th>
              <th className="px-4 py-3">Threshold</th>
              <th className="px-4 py-3">Available Stock</th>
              <th className="px-4 py-3 text-right">Update</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {products.map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-3">
                  <div className="font-semibold text-ink">{p.name}</div>
                  <div className="text-xs text-muted">{p.sku}</div>
                </td>
                <td className="px-4 py-3 text-xs text-muted tabular-nums">
                  Alert &le; {p.lowStockThreshold}
                </td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    min="0"
                    value={draftStock[p.id] ?? p.stockQuantity}
                    onChange={(e) =>
                      setDraftStock((prev) => ({
                        ...prev,
                        [p.id]: Math.max(0, Number(e.target.value)),
                      }))
                    }
                    className="w-24 rounded-lg border border-line bg-field px-2.5 py-1.5 text-sm tabular-nums outline-none focus:border-gold"
                  />
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => handleAdjust(p.id)}
                    className="rounded-full bg-gold px-4 py-1.5 text-xs font-medium text-white hover:bg-gold-deep"
                  >
                    Save Stock
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card p-6">
        <h2 className="font-serif text-2xl font-semibold text-ink">Recent Stock Ledger</h2>
        {movements.length === 0 ? (
          <p className="mt-3 text-sm text-muted">
            Order deductions and manual stock adjustments will appear here.
          </p>
        ) : (
          <div className="mt-4 divide-y divide-line text-xs">
            {movements.map((m) => (
              <div key={m.id} className="flex items-center justify-between py-2.5">
                <div>
                  <span className="font-semibold text-ink">{m.productName}</span> &middot;{' '}
                  <span className="text-muted">{m.reason}</span> ({m.actorName})
                </div>
                <span
                  className={`font-semibold tabular-nums ${
                    m.quantityDelta >= 0 ? 'text-success' : 'text-danger'
                  }`}
                >
                  {m.quantityDelta >= 0 ? `+${m.quantityDelta}` : m.quantityDelta}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
