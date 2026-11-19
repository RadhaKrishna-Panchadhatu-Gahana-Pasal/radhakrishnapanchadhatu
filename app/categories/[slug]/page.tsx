import { notFound } from 'next/navigation';
import { CatalogBrowser } from '@/components/store/catalog-browser';
import { getStore, queryPublicProducts } from '@/lib/store/repository';

export const dynamic = 'force-dynamic';

export default function CategorySlugPage({ params }: { params: { slug: string } }) {
  const store = getStore();
  const category = store.categories.find((c) => c.slug === params.slug && c.isActive);
  if (!category) {
    notFound();
  }

  const products = queryPublicProducts({ category: category.slug });
  const categories = store.categories.filter((c) => c.isActive).sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <CatalogBrowser
      products={products}
      categories={categories}
      initialCategory={category.slug}
      heading={category.name}
      subheading={category.description}
    />
  );
}
