import { NextResponse } from 'next/server';
import { getSiteBaseUrl } from '@/lib/seo/metadata';
import { getStore, hydrateStore, queryPublicProducts } from '@/lib/store/repository';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Google Merchant Center / Meta catalogue feed (RSS 2.0 with the `g:` namespace).
 * One public URL: /feed/products.xml
 */
function esc(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function absolute(base: string, pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return `${base}${pathOrUrl.startsWith('/') ? '' : '/'}${pathOrUrl}`;
}

export async function GET() {
  await hydrateStore();
  const store = getStore();
  const base = getSiteBaseUrl().replace(/\/+$/, '');
  const products = queryPublicProducts({ sort: 'latest' }).filter((product) => product.pricePaisa !== null);

  const items = products
    .map((product) => {
      const primaryImage =
        product.images.find((image) => image.isPrimary)?.url ?? product.images[0]?.url ?? '/images/product-necklace.jpg';
      const availability = product.stockQuantity > 0 ? 'in_stock' : 'out_of_stock';
      return `<item>
  <g:id>${esc(product.sku)}</g:id>
  <g:title>${esc(product.name)}</g:title>
  <g:description>${esc(product.shortDescription || product.description)}</g:description>
  <g:link>${esc(`${base}/product/${product.slug}`)}</g:link>
  <g:image_link>${esc(absolute(base, primaryImage))}</g:image_link>
  <g:availability>${availability}</g:availability>
  <g:condition>new</g:condition>
  <g:price>${((product.pricePaisa ?? 0) / 100).toFixed(2)} NPR</g:price>
  ${product.compareAtPaisa ? `<g:sale_price>${((product.pricePaisa ?? 0) / 100).toFixed(2)} NPR</g:sale_price>` : ''}
  <g:brand>${esc(store.settings.storeName)}</g:brand>
  <g:mpn>${esc(product.sku)}</g:mpn>
  <g:identifier_exists>no</g:identifier_exists>
  <g:product_type>${esc(product.categoryName)}</g:product_type>
  <g:material>${esc(product.material)}</g:material>
  <g:shipping_weight>${product.weightGrams ?? 50} g</g:shipping_weight>
</item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
<channel>
  <title>${esc(store.settings.storeName)}</title>
  <link>${esc(base)}</link>
  <description>${esc(store.settings.tagline)}</description>
${items}
</channel>
</rss>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
