import type { MetadataRoute } from 'next';
import { getStore } from '@/lib/store/repository';

export default function sitemap(): MetadataRoute.Sitemap {
  const store = getStore();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const staticRoutes = [
    '',
    '/catalog',
    '/new-arrivals',
    '/custom-order',
    '/track-order',
    '/about',
    '/contact',
    '/faq',
    '/shipping-policy',
    '/return-refund-policy',
    '/terms',
    '/privacy',
    '/cookies',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
  }));

  const categoryRoutes = store.categories
    .filter((c) => c.isActive)
    .map((c) => ({
      url: `${baseUrl}/categories/${c.slug}`,
      lastModified: new Date(),
    }));

  const productRoutes = store.products
    .filter((p) => p.status === 'PUBLISHED')
    .map((p) => ({
      url: `${baseUrl}/product/${p.slug}`,
      lastModified: new Date(p.updatedAt),
    }));

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
