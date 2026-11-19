import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProductDetailClient } from '@/components/store/product-detail-client';
import { formatMetaDescription, toAbsoluteUrl } from '@/lib/seo/metadata';
import { formatNPR, nprFromPaisa } from '@/lib/store/money';
import { getStore, queryPublicProducts } from '@/lib/store/repository';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const store = getStore();
  const product = store.products.find(
    (p) => p.slug === params.slug && p.status === 'PUBLISHED'
  );

  if (!product) {
    return {
      title: 'Product Not Found',
      robots: { index: false, follow: false },
    };
  }

  const title = product.seoTitle || product.name;
  const priceText = product.pricePaisa !== null ? `${formatNPR(product.pricePaisa)}. ` : '';
  const description = formatMetaDescription(
    product.seoDescription ||
      `${priceText}${product.shortDescription} Shop ${product.material} ${product.categoryName.toLowerCase()} from ${store.settings.storeName}, Butwal.`,
    product.description
  );

  const orderedImages = [
    ...product.images.filter((img) => img.isPrimary),
    ...product.images.filter((img) => !img.isPrimary),
  ];
  const primaryImage = orderedImages[0]?.url || '/images/product-necklace.jpg';
  const availabilityMeta =
    product.productType === 'MADE_TO_ORDER'
      ? 'available for order'
      : product.stockQuantity > 0
      ? 'in stock'
      : 'out of stock';

  return {
    title,
    description,
    keywords: [
      product.name,
      product.material,
      product.categoryName,
      'Nepal jewellery',
      'Butwal',
      ...product.tags,
    ],
    alternates: {
      canonical: `/product/${product.slug}`,
    },
    openGraph: {
      type: 'website',
      title: `${title} | ${store.settings.storeName}`,
      description,
      url: `/product/${product.slug}`,
      siteName: store.settings.storeName,
      locale: 'en_NP',
      images: orderedImages.length
        ? orderedImages.map((img) => ({
            url: img.url,
            alt: img.alt || product.name,
          }))
        : [{ url: primaryImage, alt: product.name }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | ${store.settings.storeName}`,
      description,
      images: [primaryImage],
    },
    other: {
      ...(product.pricePaisa !== null
        ? {
            'product:price:amount': String(nprFromPaisa(product.pricePaisa)),
            'product:price:currency': 'NPR',
          }
        : {}),
      'product:availability': availabilityMeta,
      'product:brand': store.settings.storeName,
    },
  };
}

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

  const avgRating =
    approvedReviews.length > 0
      ? Number(
          (
            approvedReviews.reduce((sum, rev) => sum + rev.rating, 0) /
            approvedReviews.length
          ).toFixed(1)
        )
      : null;

  const productUrl = toAbsoluteUrl(`/product/${product.slug}`);
  const availabilitySchema =
    product.productType === 'READY_STOCK' && product.stockQuantity <= 0
      ? 'https://schema.org/OutOfStock'
      : 'https://schema.org/InStock';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Product',
        name: product.name,
        sku: product.sku,
        description: product.description,
        material: product.material,
        category: product.categoryName,
        image: product.images.map((img) => toAbsoluteUrl(img.url)),
        url: productUrl,
        brand: {
          '@type': 'Brand',
          name: store.settings.storeName,
        },
        ...(product.pricePaisa !== null
          ? {
              offers: {
                '@type': 'Offer',
                url: productUrl,
                priceCurrency: 'NPR',
                price: String(nprFromPaisa(product.pricePaisa)),
                availability: availabilitySchema,
                itemCondition: 'https://schema.org/NewCondition',
                seller: {
                  '@type': 'Organization',
                  name: store.settings.storeName,
                },
              },
            }
          : {}),
        ...(avgRating !== null
          ? {
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: avgRating,
                reviewCount: approvedReviews.length,
              },
            }
          : {}),
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
            name: product.name,
            item: productUrl,
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
      <ProductDetailClient
        product={product}
        initialReviews={approvedReviews}
        relatedProducts={relatedProducts}
        whatsappDigits={store.settings.whatsappDigits}
      />
    </>
  );
}
