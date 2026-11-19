import { CatalogBrowser } from '@/components/store/catalog-browser';
import { getStore, queryPublicProducts } from '@/lib/store/repository';

export const dynamic = 'force-dynamic';

export default function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const store = getStore();
  const products = queryPublicProducts();
  const categories = store.categories.filter((c) => c.isActive).sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <CatalogBrowser
      products={products}
      categories={categories}
      initialQuery={searchParams.q || ''}
      heading="Search Jewellery"
      subheading="Search across Panchadhatu necklaces, rings, jhumkas, and 316L steel bangles by name, material, or SKU."
    />
  );
}
