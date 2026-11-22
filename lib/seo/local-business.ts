import type { StoreSettings } from '@/lib/store/types';

/**
 * LocalBusiness structured data. Google uses this for the knowledge panel and
 * "near me" results, which matters for a physical Butwal shop.
 */
export function buildLocalBusinessJsonLd(settings: StoreSettings, baseUrl: string) {
  const origin = baseUrl.replace(/\/+$/, '');
  return {
    '@context': 'https://schema.org',
    '@type': 'JewelryStore',
    '@id': `${origin}/#store`,
    name: settings.storeName,
    alternateName: 'Radha Krishna Panchha Dhatu Gahana Pasal',
    description: settings.tagline,
    url: origin,
    telephone: settings.phone,
    email: settings.email.includes('Confirm') ? undefined : settings.email,
    image: `${origin}/images/hero-panchadhatu.jpg`,
    logo: `${origin}/brand/logo-light.png`,
    priceRange: 'NPR 1,500–NPR 15,000',
    currenciesAccepted: 'NPR',
    paymentAccepted: 'Cash, eSewa, Khalti, Fonepay, Cash on Delivery',
    address: {
      '@type': 'PostalAddress',
      streetAddress: settings.address,
      addressLocality: 'Butwal',
      addressRegion: 'Lumbini Province',
      postalCode: '32907',
      addressCountry: 'NP',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 27.6866,
      longitude: 83.4323,
    },
    areaServed: {
      '@type': 'Country',
      name: 'Nepal',
    },
    sameAs: [settings.facebookUrl, settings.tiktokUrl].filter(Boolean),
    hasMap: settings.mapUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${origin}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}
