import { NextRequest, NextResponse } from 'next/server';
import { getStore, hydrateStore, queryPublicProducts } from '@/lib/store/repository';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get('slug');
  await hydrateStore();
  const store = getStore();

  if (slug) {
    const product = store.products.find((p) => p.slug === slug && p.status === 'PUBLISHED');
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    const reviews = store.reviews.filter(
      (r) => r.productId === product.id && r.status === 'APPROVED'
    );
    return NextResponse.json({ product, reviews });
  }

  const allProducts = queryPublicProducts({
    q: searchParams.get('q') ?? undefined,
    category: searchParams.get('category') ?? undefined,
    material: searchParams.get('material') ?? undefined,
    availability: (searchParams.get('availability') as 'all' | 'in-stock' | 'made-to-order') ?? 'all',
    newArrival: searchParams.get('newArrival') === 'true',
    featured: searchParams.get('featured') === 'true',
    sort: (searchParams.get('sort') as 'latest' | 'price-asc' | 'price-desc' | 'featured') ?? 'latest',
  });

  const limitParam = searchParams.get('limit');
  const limit = limitParam ? Number.parseInt(limitParam, 10) : NaN;
  const products =
    Number.isFinite(limit) && limit > 0 ? allProducts.slice(0, limit) : allProducts;

  return NextResponse.json({ products, total: allProducts.length });
}
