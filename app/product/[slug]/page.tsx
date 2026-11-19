import { notFound } from 'next/navigation';
import { ProductDetailClient } from '@/components/store/product-detail-client';
import { getStore, queryPublicProducts } from '@/lib/store/repository';

export const dynamic = 'force-dynamic';

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  const store = getStore();
  const product = store.products.find(
    (p) => p.slug === params.slug && p.status === 'PUBLISHED'
  );
  if (!product) {
    notFound();
  }

  const approvedReviews = store.reviews.filter(
    (r) => r.productId === product.id && r.status === 'APPROVED'
  );
  const relatedProducts = queryPublicProducts()
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  return (
    <ProductDetailClient
      product={product}
      initialReviews={approvedReviews}
      relatedProducts={relatedProducts}
      whatsappDigits={store.settings.whatsappDigits}
    />
  );
}
