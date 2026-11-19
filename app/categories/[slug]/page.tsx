import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CatalogBrowser } from '@/components/store/catalog-browser';
import { formatMetaDescription, toAbsoluteUrl } from '@/lib/seo/metadata';
import { getStore, queryPublicProducts } from '@/lib/store/repository';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const store = getStore();
  const category = store.categories.find((c) => c.slug === params.slug && c.isActive);

  if (!category) {
    return {
      title: 'Category Not Found',
      robots: { index: false, follow: false },
    };
  }

  const title = category.seoTitle || `${category.name} Jewellery in Nepal`;
  const description = formatMetaDescription(
    category.seoDescription ||
      `${category.description} Shop authentic ${category.name} pieces from Radhakrishna Panchadhatu in Butwal with Nepal-wide delivery.`,
    `Explore ${category.name} ornaments crafted for ceremonial and everyday wear across Nepal.`
  );
  const imageUrl = category.imageUrl || '/images/product-necklace.jpg';

  return {
    title,
    description,
    alternates: {
      canonical: `/categories/${category.slug}`,
    },
    openGraph: {
      type: 'website',
      title: `${title} | ${store.settings.storeName}`,
      description,
      url: `/categories/${category.slug}`,
      siteName: store.settings.storeName,
      locale: 'en_NP',
      images: [
        {
          url: imageUrl,
          alt: `${category.name} jewellery collection`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | ${store.settings.storeName}`,
      description,
      images: [imageUrl],
    },
  };
}

export default function CategorySlugPage({ params }: { params: { slug: string } }) {
  const store = getStore();
  const category = store.categories.find((c) => c.slug === params.slug && c.isActive);
  if (!category) {
    notFound();
  }

  const products = queryPublicProducts({ category: category.slug });
  const categories = store.categories
    .filter((c) => c.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        name: category.name,
        description: category.description,
        url: toAbsoluteUrl(`/categories/${category.slug}`),
        image: toAbsoluteUrl(category.imageUrl || '/images/product-necklace.jpg'),
        mainEntity: {
          '@type': 'ItemList',
          numberOfItems: products.length,
          itemListElement: products.map((product, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            url: toAbsoluteUrl(`/product/${product.slug}`),
            name: product.name,
          })),
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: toAbsoluteUrl('/'),
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Catalog',
            item: toAbsoluteUrl('/catalog'),
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: category.name,
            item: toAbsoluteUrl(`/categories/${category.slug}`),
          },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <CatalogBrowser
        products={products}
        categories={categories}
        initialCategory={category.slug}
        heading={category.name}
        subheading={category.description}
      />
    </>
  );
}
