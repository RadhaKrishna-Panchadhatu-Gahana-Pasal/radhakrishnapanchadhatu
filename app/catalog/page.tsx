import { CatalogBrowser } from '@/components/store/catalog-browser';
import { getStore, queryPublicProducts } from '@/lib/store/repository';

export const dynamic = 'force-dynamic';

export default function CatalogPage() {
  const store = getStore();
  const products = queryPublicProducts({ sort: 'featured' });
  const categories = store.categories.filter((c) => c.isActive).sort((a, b) => a.sortOrder - b.sortOrder);

  return <CatalogBrowser products={products} categories={categories} />;
}
