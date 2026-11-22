import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/store/admin-guard';
import { toCsv } from '@/lib/store/csv';
import { getStore, hydrateStore } from '@/lib/store/repository';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Product catalogue as CSV, for Excel/Sheets bulk edits. */
export async function GET() {
  const guard = requireAdmin();
  if (!guard.ok) return guard.response;

  await hydrateStore();
  const store = getStore();
  const categoryName = (id: string) =>
    store.categories.find((category) => category.id === id)?.slug ?? '';

  const csv = toCsv(
    [
      'sku',
      'name',
      'category_slug',
      'material',
      'price_npr',
      'compare_at_npr',
      'stock',
      'status',
      'short_description',
    ],
    store.products.map((product) => [
      product.sku,
      product.name,
      categoryName(product.categoryId),
      product.material,
      product.pricePaisa === null ? '' : product.pricePaisa / 100,
      product.compareAtPaisa === null ? '' : product.compareAtPaisa / 100,
      product.stockQuantity,
      product.status,
      product.shortDescription,
    ])
  );

  const date = new Date().toISOString().slice(0, 10);
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="radhakrishna-products-${date}.csv"`,
      'Cache-Control': 'no-store',
    },
  });
}
