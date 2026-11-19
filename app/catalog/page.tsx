import type { Metadata } from 'next';
import { CatalogBrowser } from '@/components/store/catalog-browser';
import { toAbsoluteUrl } from '@/lib/seo/metadata';
import { nprFromPaisa } from '@/lib/store/money';
import { getStore, queryPublicProducts } from '@/lib/store/repository';

export const dynamic = 'force-dynamic';

const CATALOG_TITLE = 'Panchadhatu & Steel Jewellery Catalog';
const CATALOG_DESCRIPTION =
  'Browse handcrafted Panchadhatu necklaces, rings, jhumkas, and 316L steel bangles from Butwal with nationwide delivery across Nepal.';

export const metadata: Metadata = {
  title: CATALOG_TITLE,
  description: CATALOG_DESCRIPTION,
  alternates: {
    canonical: '/catalog',
  },
  openGraph: {
    type: 'website',
    title: `${CATALOG_TITLE} | Radhakrishna Panchadhatu`,
    description: CATALOG_DESCRIPTION,
    url: '/catalog',
    siteName: 'Radhakrishna Panchadhatu',
    locale: 'en_NP',
    images: [
      {
        url: '/images/hero-panchadhatu.jpg',
        width: 1200,
        height: 675,
        alt: 'Radhakrishna Panchadhatu jewellery catalog',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${CATALOG_TITLE} | Radhakrishna Panchadhatu`,
    description: CATALOG_DESCRIPTION,
    images: ['/images/hero-panchadhatu.jpg'],
  },
};

export default function CatalogPage() {
  const store = getStore();
  const products = queryPublicProducts({ sort: 'featured' });
  const categories = store.categories
    .filter((c) => c.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: CATALOG_TITLE,
    description: CATALOG_DESCRIPTION,
    url: toAbsoluteUrl('/catalog'),
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: products.length,
      itemListElement: products.slice(0, 12).map((product, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: toAbsoluteUrl(`/product/${product.slug}`),
        name: product.name,
        ...(product.pricePaisa !== null
          ? {
              item: {
                '@type': 'Product',
                name: product.name,
                offers: {
                  '@type': 'Offer',
                  priceCurrency: 'NPR',
                  price: String(nprFromPaisa(product.pricePaisa)),
                },
              },
            }
          : {}),
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <CatalogBrowser products={products} categories={categories} />
    </>
  );
}
