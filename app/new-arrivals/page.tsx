import { CatalogBrowser } from '@/components/store/catalog-browser';
import { getStore, queryPublicProducts } from '@/lib/store/repository';

export const dynamic = 'force-dynamic';

export default function NewArrivalsPage() {
  const store = getStore();
  const products = queryPublicProducts({ newArrival: true, sort: 'latest' });
  const categories = store.categories.filter((c) => c.isActive).sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <CatalogBrowser
      products={products}
      categories={categories}
      heading="New Arrivals"
      subheading="Newly finished Panchadhatu ornaments and modern 316L stainless steel designs from our Butwal workshop."
    />
  );
}
