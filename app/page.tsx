import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, MapPin, Phone, Sparkles } from 'lucide-react';
import { StoreMap } from '@/components/maps/store-map';
import { ProductCard } from '@/components/store/product-card';
import { getGoogleMapsApiKey } from '@/lib/maps/config';
import { getStore, queryPublicProducts } from '@/lib/store/repository';

export const dynamic = 'force-dynamic';

export default function HomePage() {
  const store = getStore();
  const mapsApiKey = getGoogleMapsApiKey();
  const { settings, categories, banners, homepageSections } = store;

  const activeBanners = banners.filter((b) => b.enabled).sort((a, b) => a.sortOrder - b.sortOrder);
  const heroBanner = activeBanners[0];
  const promoBanner = activeBanners[1];

  const heroSection = homepageSections.find((s) => s.type === 'HERO' && s.enabled);
  const categorySection = homepageSections.find((s) => s.type === 'CATEGORIES' && s.enabled);
  const featuredSection = homepageSections.find((s) => s.type === 'FEATURED' && s.enabled);
  const storySection = homepageSections.find((s) => s.type === 'BRAND_STORY' && s.enabled);

  const featuredProducts = queryPublicProducts({ featured: true }).slice(0, 4);
  const newArrivals = queryPublicProducts({ newArrival: true }).slice(0, 4);
  const activeCategories = categories
    .filter((c) => c.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .slice(0, 6);

  return (
    <div>
      {/* Hero Section */}
      <section className="border-b border-line bg-surface">
        <div className="container-shell grid gap-10 py-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-20">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-deep">
              Butwal, Nepal &middot; Panchadhatu &amp; 316L Steel
            </p>
            <h1 className="mt-4 font-serif text-4xl font-semibold leading-[1.08] tracking-tight text-ink sm:text-5xl lg:text-6xl">
              {heroSection?.title || heroBanner?.title || 'Timeless Panchadhatu & Steel Craftsmanship'}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
              {heroSection?.subtitle ||
                heroBanner?.subtitle ||
                'Hand-finished ornaments rooted in Nepali heritage from Yogikuti, Santichowk — delivered nationwide across all 7 provinces.'}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href={heroSection?.ctaUrl || '/catalog'}
                className="inline-flex items-center gap-2 rounded-full bg-gold px-7 py-3.5 text-sm font-medium text-white transition hover:bg-gold-deep"
              >
                {heroSection?.ctaLabel || 'Explore Catalog'}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/custom-order"
                className="inline-flex items-center gap-2 rounded-full border border-line bg-sand/70 px-6 py-3.5 text-sm font-medium text-ink transition hover:border-gold hover:text-gold-deep"
              >
                Custom Design Request
              </Link>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-6 border-t border-line pt-6 text-xs text-muted sm:max-w-lg">
              <div>
                <p className="font-semibold uppercase tracking-[0.14em] text-ink">7 Provinces</p>
                <p className="mt-1">Nationwide Nepal delivery</p>
              </div>
              <div>
                <p className="font-semibold uppercase tracking-[0.14em] text-ink">NPR Verified</p>
                <p className="mt-1">eSewa, Khalti, Fonepay &amp; COD</p>
              </div>
              <div>
                <p className="font-semibold uppercase tracking-[0.14em] text-ink">Butwal Store</p>
                <p className="mt-1">Yogikuti, Santichowk</p>
              </div>
            </div>
          </div>

          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[2rem] border border-line bg-[#EFECE5] shadow-soft lg:aspect-[5/4]">
            <Image
              src={heroSection?.imageUrl || heroBanner?.imageUrl || '/images/hero-panchadhatu.jpg'}
              alt={heroBanner?.imageAlt || 'Handcrafted Panchadhatu jewellery'}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 48vw"
              referrerPolicy="no-referrer"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* Shop by Category */}
      {categorySection && (
        <section className="container-shell py-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-deep">
                Collections
              </p>
              <h2 className="section-title mt-2">{categorySection.title}</h2>
              <p className="mt-2 max-w-xl text-sm text-muted">{categorySection.subtitle}</p>
            </div>
            <Link
              href="/catalog"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-gold-deep hover:text-ink"
            >
              Browse All Pieces <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {activeCategories.map((cat) => (
              <Link
                key={cat.id}
                href={`/categories/${cat.slug}`}
                className="group flex items-center gap-4 rounded-2xl border border-line bg-surface p-3.5 transition hover:border-gold hover:shadow-soft"
              >
                <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-sand">
                  <Image
                    src={cat.imageUrl || '/images/product-necklace.jpg'}
                    alt={cat.name}
                    fill
                    sizes="80px"
                    referrerPolicy="no-referrer"
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="min-w-0">
                  <h3 className="font-serif text-xl font-semibold text-ink group-hover:text-gold-deep">
                    {cat.name}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">
                    {cat.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Signature / Featured Pieces */}
      {featuredSection && featuredProducts.length > 0 && (
        <section className="border-t border-line bg-surface py-16">
          <div className="container-shell">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-deep">
                  Curated Selection
                </p>
                <h2 className="section-title mt-2">{featuredSection.title}</h2>
                <p className="mt-2 max-w-xl text-sm text-muted">{featuredSection.subtitle}</p>
              </div>
              <Link
                href={featuredSection.ctaUrl || '/catalog'}
                className="inline-flex items-center gap-1.5 rounded-full border border-line px-5 py-2 text-sm font-medium text-ink transition hover:border-gold hover:text-gold-deep"
              >
                {featuredSection.ctaLabel || 'View Full Catalog'}
              </Link>
            </div>

            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Brand Craftsmanship & Custom Design CTA */}
      {storySection && (
        <section className="container-shell py-16">
          <div className="grid overflow-hidden rounded-[2rem] border border-line bg-surface shadow-soft lg:grid-cols-2">
            <div className="relative min-h-[300px] bg-[#EFECE5]">
              <Image
                src={storySection.imageUrl || promoBanner?.imageUrl || '/images/banner-craftsmanship.jpg'}
                alt={storySection.title}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                referrerPolicy="no-referrer"
                className="object-cover"
              />
            </div>

            <div className="flex flex-col justify-center p-8 sm:p-12">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-gold-deep">
                <Sparkles className="h-3.5 w-3.5" /> Artisanal Workshop
              </p>
              <h2 className="section-title mt-3">{storySection.title}</h2>
              <p className="mt-4 text-sm leading-relaxed text-muted sm:text-base">
                {storySection.subtitle}
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/custom-order"
                  className="rounded-full bg-gold px-6 py-3 text-sm font-medium text-white transition hover:bg-gold-deep"
                >
                  Request Custom Design
                </Link>
                <Link
                  href={storySection.ctaUrl || '/about'}
                  className="rounded-full border border-line px-6 py-3 text-sm font-medium text-ink transition hover:border-gold hover:text-gold-deep"
                >
                  {storySection.ctaLabel || 'Visit Our Store'}
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <section className="border-t border-line bg-surface py-16">
          <div className="container-shell">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-deep">
                  Fresh From the Bench
                </p>
                <h2 className="section-title mt-2">New Arrivals</h2>
              </div>
              <Link
                href="/new-arrivals"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-gold-deep hover:text-ink"
              >
                See All New Arrivals <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {newArrivals.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Visit Our Butwal Showroom with Google Maps */}
      <section className="border-t border-line bg-sand py-16">
        <div className="container-shell grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-deep">
              Showroom &amp; Consultation
            </p>
            <h2 className="section-title mt-2">Visit Us in Butwal</h2>
            <p className="mt-4 text-sm leading-relaxed text-muted sm:text-base">
              Experience our Panchadhatu ornaments and 316L steel collection in person, request bespoke sizing, or pick up online orders directly from our showroom.
            </p>

            <div className="mt-6 space-y-3 rounded-2xl border border-line bg-surface p-5 text-sm">
              <p className="flex items-start gap-2.5 text-ink">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold-deep" />
                <span>
                  {settings.address}, {settings.cityLine}
                </span>
              </p>
              <p className="flex items-center gap-2.5 text-ink">
                <Phone className="h-4 w-4 shrink-0 text-gold-deep" />
                <a href={`tel:${settings.phone.replace(/[^\d+]/g, '')}`} className="tabular-nums font-medium hover:text-gold-deep">
                  {settings.phone}
                </a>
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/contact"
                className="rounded-full bg-ink px-6 py-3 text-sm font-medium text-surface transition hover:bg-gold-deep"
              >
                Contact Showroom
              </Link>
              <Link
                href="/track-order"
                className="rounded-full border border-line bg-surface px-6 py-3 text-sm font-medium text-ink transition hover:border-gold hover:text-gold-deep"
              >
                Track an Order
              </Link>
            </div>
          </div>

          <StoreMap
            apiKey={mapsApiKey}
            storeName={settings.storeName}
            address={settings.address}
            cityLine={settings.cityLine}
            phone={settings.phone}
            mapUrl={settings.mapUrl}
          />
        </div>
      </section>
    </div>
  );
}
