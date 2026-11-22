import crypto from 'crypto';
import { loadStoreFromDisk, saveStoreToDisk } from './persistence';
import type {
  AdminAuditLog,
  AdminRole,
  Announcement,
  Banner,
  Category,
  ContactEnquiry,
  ContentPage,
  Coupon,
  CustomOrderRequest,
  FulfilmentStatus,
  HomepageSection,
  InventoryMovement,
  MediaAsset,
  Order,
  OrderAddress,
  OrderItem,
  PaymentMethod,
  PaymentStatus,
  Product,
  Review,
  ShippingZone,
  StoreSettings,
} from './types';

export interface StoreDatabase {
  settings: StoreSettings;
  categories: Category[];
  products: Product[];
  banners: Banner[];
  announcements: Announcement[];
  homepageSections: HomepageSection[];
  pages: ContentPage[];
  shippingZones: ShippingZone[];
  coupons: Coupon[];
  orders: Order[];
  reviews: Review[];
  customOrderRequests: CustomOrderRequest[];
  contactEnquiries: ContactEnquiry[];
  inventoryMovements: InventoryMovement[];
  mediaAssets: MediaAsset[];
  auditLogs: AdminAuditLog[];
}

function nowIso(): string {
  return new Date().toISOString();
}

function uid(prefix: string): string {
  return `${prefix}-${crypto.randomBytes(4).toString('hex')}`;
}

function createInitialDatabase(): StoreDatabase {
  const created = '2026-11-15T06:00:00.000Z';

  const settings: StoreSettings = {
    storeName: 'Radhakrishna Panchadhatu',
    tagline: 'Handcrafted Panchadhatu & Surgical Steel Jewellery',
    phone: '984-670-3068',
    whatsappDigits: '9779846703068',
    email: 'Confirm business email in Store Settings',
    address: '3 Tilottama Path, Yogikuti (500m west of Yogikuti Chowk)',
    cityLine: 'Butwal 32907, Rupandehi, Lumbini Province, Nepal',
    mapUrl:
      'https://www.google.com/maps/search/?api=1&query=Radha%20Krishna%20Panchha%20Dhatu%2C%203%20Tilottama%20Path%2C%20Yogikuti%2C%20Butwal%2032907',
    openingHours: 'Confirm opening hours in Store Settings',
    facebookUrl: '',
    tiktokUrl: '',
    currency: 'NPR',
    timezone: 'Asia/Kathmandu',
    codEnabled: true,
    esewaEnabled: true,
    khaltiEnabled: true,
    fonepayEnabled: true,
    customOrderConsentText:
      'I agree to be contacted by Radhakrishna Panchadhatu via phone or WhatsApp regarding feasibility, pricing, and delivery timelines for my custom design request.',
  };

  const categories: Category[] = [
    {
      id: 'cat-panchadhatu',
      name: 'Panchadhatu',
      slug: 'panchadhatu',
      description: 'Traditional five-metal sacred alloy ornaments crafted by Nepali artisans.',
      imageUrl: '/images/product-necklace.jpg',
      isActive: true,
      sortOrder: 1,
    },
    {
      id: 'cat-steel',
      name: 'Steel Jewellery',
      slug: 'steel-jewellery',
      description: 'Tarnish-resistant 316L stainless steel bangles, bands, and daily wear.',
      imageUrl: '/images/product-bangles.jpg',
      isActive: true,
      sortOrder: 2,
    },
    {
      id: 'cat-necklaces',
      name: 'Necklaces',
      slug: 'necklaces',
      description: 'Ceremonial pendants, chokers, and layered Panchadhatu necklaces.',
      imageUrl: '/images/hero-panchadhatu.jpg',
      isActive: true,
      sortOrder: 3,
    },
    {
      id: 'cat-rings',
      name: 'Rings',
      slug: 'rings',
      description: 'Engraved Panchadhatu signet rings and everyday steel bands.',
      imageUrl: '/images/product-ring.jpg',
      isActive: true,
      sortOrder: 4,
    },
    {
      id: 'cat-earrings',
      name: 'Earrings',
      slug: 'earrings',
      description: 'Artisanal Nepali jhumka drops and minimalist studs.',
      imageUrl: '/images/product-earrings.jpg',
      isActive: true,
      sortOrder: 5,
    },
    {
      id: 'cat-bracelets',
      name: 'Bracelets & Bangles',
      slug: 'bracelets',
      description: 'Stackable steel bangles and traditional Panchadhatu kadas.',
      imageUrl: '/images/product-bangles.jpg',
      isActive: true,
      sortOrder: 6,
    },
  ];

  const products: Product[] = [
    {
      id: 'prod-mandala-pendant',
      name: 'Sacred Mandala Panchadhatu Pendant',
      slug: 'sacred-mandala-panchadhatu-pendant',
      sku: 'RKP-NCK-001',
      shortDescription: 'Hand-engraved five-metal pendant with fine Nepali geometric relief.',
      description:
        'Crafted in traditional Panchadhatu alloy combining copper, brass, zinc, silver, and trace gold tones. Designed for auspicious occasions and everyday spiritual wear with a gentle satin finish.',
      material: 'Panchadhatu',
      categoryId: 'cat-necklaces',
      categoryName: 'Necklaces',
      pricePaisa: 420000,
      compareAtPaisa: 480000,
      stockQuantity: 14,
      lowStockThreshold: 4,
      productType: 'READY_STOCK',
      weightGrams: 28,
      careInstructions: 'Wipe gently with a dry cotton cloth after wear; avoid harsh perfumes.',
      deliveryNote: 'Dispatched from Butwal within 24 hours across Nepal.',
      tags: ['panchadhatu', 'necklace', 'pendant', 'auspicious'],
      images: [
        {
          id: 'img-1',
          url: '/images/product-necklace.jpg',
          alt: 'Sacred Mandala Panchadhatu Pendant on travertine stone',
          isPrimary: true,
        },
        {
          id: 'img-1b',
          url: '/images/hero-panchadhatu.jpg',
          alt: 'Panchadhatu necklace styling detail',
          isPrimary: false,
        },
      ],
      variants: [
        { id: 'var-1-18', label: '18-inch Chain', sku: 'RKP-NCK-001-18', priceOverridePaisa: null, stockQuantity: 8 },
        { id: 'var-1-22', label: '22-inch Chain', sku: 'RKP-NCK-001-22', priceOverridePaisa: 450000, stockQuantity: 6 },
      ],
      isFeatured: true,
      isNewArrival: true,
      isBestSeller: true,
      status: 'PUBLISHED',
      createdAt: created,
      updatedAt: created,
    },
    {
      id: 'prod-steel-bangle-stack',
      name: 'Two-Tone Surgical Steel Bangle Stack',
      slug: 'two-tone-surgical-steel-bangle-stack',
      sku: 'RKP-BRC-002',
      shortDescription: 'Water-resistant 316L stainless steel stack with champagne gold accents.',
      description:
        'A five-piece architectural bangle stack blending mirror-polished 316L surgical steel and brushed champagne-gold bands. Hypoallergenic, tarnish-resistant, and balanced for daily wear.',
      material: 'Steel',
      categoryId: 'cat-bracelets',
      categoryName: 'Bracelets & Bangles',
      pricePaisa: 265000,
      compareAtPaisa: 310000,
      stockQuantity: 22,
      lowStockThreshold: 5,
      productType: 'READY_STOCK',
      weightGrams: 42,
      careInstructions: 'Waterproof and sweat-resistant; rinse and buff with soft microfibre.',
      deliveryNote: 'Nationwide courier delivery available.',
      tags: ['steel', 'bangles', 'hypoallergenic', 'daily-wear'],
      images: [
        {
          id: 'img-2',
          url: '/images/product-bangles.jpg',
          alt: 'Two-Tone Surgical Steel Bangle Stack on warm stone',
          isPrimary: true,
        },
      ],
      variants: [
        { id: 'var-2-24', label: 'Size 2.4 (Small)', sku: 'RKP-BRC-002-24', priceOverridePaisa: null, stockQuantity: 8 },
        { id: 'var-2-26', label: 'Size 2.6 (Medium)', sku: 'RKP-BRC-002-26', priceOverridePaisa: null, stockQuantity: 10 },
        { id: 'var-2-28', label: 'Size 2.8 (Large)', sku: 'RKP-BRC-002-28', priceOverridePaisa: null, stockQuantity: 4 },
      ],
      isFeatured: true,
      isNewArrival: true,
      isBestSeller: true,
      status: 'PUBLISHED',
      createdAt: created,
      updatedAt: created,
    },
    {
      id: 'prod-turquoise-filigree-ring',
      name: 'Heritage Filigree Panchadhatu Ring',
      slug: 'heritage-filigree-panchadhatu-ring',
      sku: 'RKP-RNG-003',
      shortDescription: 'Hand-carved Panchadhatu band set with a tranquil turquoise cabochon.',
      description:
        'Inspired by classic Newari and Himalayan metalwork, this bold statement ring pairs textured Panchadhatu granulation with a vibrant turquoise centerpiece.',
      material: 'Panchadhatu',
      categoryId: 'cat-rings',
      categoryName: 'Rings',
      pricePaisa: 340000,
      compareAtPaisa: null,
      stockQuantity: 9,
      lowStockThreshold: 3,
      productType: 'READY_STOCK',
      weightGrams: 14,
      careInstructions: 'Remove before swimming or applying lotions to preserve antique patina.',
      deliveryNote: 'Includes protective velvet pouch.',
      tags: ['panchadhatu', 'ring', 'filigree', 'turquoise'],
      images: [
        {
          id: 'img-3',
          url: '/images/product-ring.jpg',
          alt: 'Heritage Filigree Panchadhatu Ring with turquoise inlay',
          isPrimary: true,
        },
      ],
      variants: [
        { id: 'var-3-16', label: 'US Size 7 (Adjustable)', sku: 'RKP-RNG-003-7', priceOverridePaisa: null, stockQuantity: 5 },
        { id: 'var-3-18', label: 'US Size 9 (Adjustable)', sku: 'RKP-RNG-003-9', priceOverridePaisa: null, stockQuantity: 4 },
      ],
      isFeatured: true,
      isNewArrival: false,
      isBestSeller: true,
      status: 'PUBLISHED',
      createdAt: created,
      updatedAt: created,
    },
    {
      id: 'prod-festive-jhumka-earrings',
      name: 'Artisanal Panchadhatu Jhumka Drops',
      slug: 'artisanal-panchadhatu-jhumka-drops',
      sku: 'RKP-EAR-004',
      shortDescription: 'Bell-domed Panchadhatu earrings inlaid with coral and turquoise accents.',
      description:
        'Delicately balanced traditional jhumkas finished with hand-soldered ghungroo droplets and warm stone accents. Lightweight enough for full-day festivities.',
      material: 'Panchadhatu',
      categoryId: 'cat-earrings',
      categoryName: 'Earrings',
      pricePaisa: 310000,
      compareAtPaisa: 360000,
      stockQuantity: 11,
      lowStockThreshold: 3,
      productType: 'READY_STOCK',
      weightGrams: 18,
      careInstructions: 'Store flat in an airtight pouch away from moisture.',
      deliveryNote: 'Ready to dispatch from Butwal.',
      tags: ['panchadhatu', 'earrings', 'jhumka', 'festive'],
      images: [
        {
          id: 'img-4',
          url: '/images/product-earrings.jpg',
          alt: 'Artisanal Panchadhatu Jhumka Drops on linen and stone',
          isPrimary: true,
        },
      ],
      variants: [
        { id: 'var-4-ant', label: 'Antique Finish', sku: 'RKP-EAR-004-ANT', priceOverridePaisa: null, stockQuantity: 7 },
        { id: 'var-4-gld', label: 'Warm Gold Finish', sku: 'RKP-EAR-004-GLD', priceOverridePaisa: 330000, stockQuantity: 4 },
      ],
      isFeatured: true,
      isNewArrival: true,
      isBestSeller: false,
      status: 'PUBLISHED',
      createdAt: created,
      updatedAt: created,
    },
    {
      id: 'prod-ceremonial-collar-set',
      name: 'Royal Ceremonial Panchadhatu Collar Set',
      slug: 'royal-ceremonial-panchadhatu-collar-set',
      sku: 'RKP-NCK-005',
      shortDescription: 'Matching Panchadhatu bridal collar necklace and teardrop earrings.',
      description:
        'An heirloom-inspired Panchadhatu suite featuring intricate filigree arches, hand-set turquoise and coral highlights, and an adjustable braided silk tie cord.',
      material: 'Panchadhatu',
      categoryId: 'cat-necklaces',
      categoryName: 'Necklaces',
      pricePaisa: 890000,
      compareAtPaisa: 980000,
      stockQuantity: 3,
      lowStockThreshold: 4,
      productType: 'MADE_TO_ORDER',
      weightGrams: 76,
      careInstructions: 'Store in lined box; wipe gently after ceremonial wear.',
      deliveryNote: 'Available for immediate dispatch or custom sizing within 5–7 days.',
      tags: ['bridal', 'panchadhatu', 'set', 'necklace'],
      images: [
        {
          id: 'img-5',
          url: '/images/hero-panchadhatu.jpg',
          alt: 'Royal Ceremonial Panchadhatu Collar Set',
          isPrimary: true,
        },
      ],
      variants: [
        { id: 'var-5-std', label: 'Complete Necklace + Earrings Set', sku: 'RKP-NCK-005-SET', priceOverridePaisa: null, stockQuantity: 3 },
      ],
      isFeatured: false,
      isNewArrival: true,
      isBestSeller: false,
      status: 'PUBLISHED',
      createdAt: created,
      updatedAt: created,
    },
    {
      id: 'prod-minimal-steel-cuff',
      name: 'Brushed Steel Everyday Kada',
      slug: 'brushed-steel-everyday-kada',
      sku: 'RKP-STL-006',
      shortDescription: 'Clean architectural 316L stainless steel cuff for all-day comfort.',
      description:
        'Engineered from skin-safe 316L stainless steel with chamfered inner edges and a quiet satin sheen. Resistant to water, humidity, and daily wear.',
      material: 'Steel',
      categoryId: 'cat-steel',
      categoryName: 'Steel Jewellery',
      pricePaisa: 185000,
      compareAtPaisa: null,
      stockQuantity: 19,
      lowStockThreshold: 5,
      productType: 'READY_STOCK',
      weightGrams: 30,
      careInstructions: 'Rinse with mild soap and dry with a soft cloth.',
      deliveryNote: 'Ships same day for orders placed before 3 PM NPT.',
      tags: ['steel', 'kada', 'minimalist', 'unisex'],
      images: [
        {
          id: 'img-6',
          url: '/images/product-bangles.jpg',
          alt: 'Brushed Steel Everyday Kada',
          isPrimary: true,
        },
      ],
      variants: [
        { id: 'var-6-m', label: 'Medium (60mm)', sku: 'RKP-STL-006-M', priceOverridePaisa: null, stockQuantity: 11 },
        { id: 'var-6-l', label: 'Large (65mm)', sku: 'RKP-STL-006-L', priceOverridePaisa: null, stockQuantity: 8 },
      ],
      isFeatured: false,
      isNewArrival: false,
      isBestSeller: true,
      status: 'PUBLISHED',
      createdAt: created,
      updatedAt: created,
    },
  ];

  const banners: Banner[] = [
    {
      id: 'banner-hero-1',
      title: 'Timeless Panchadhatu & Steel Craftsmanship',
      subtitle:
        'Hand-finished ornaments rooted in Nepali heritage from Butwal, Yogikuti — delivered nationwide across all 7 provinces.',
      ctaLabel: 'Explore Collection',
      ctaUrl: '/catalog',
      imageUrl: '/images/hero-panchadhatu.jpg',
      imageAlt: 'Handcrafted Nepali Panchadhatu necklace and earrings on travertine',
      enabled: true,
      sortOrder: 1,
    },
    {
      id: 'banner-promo-2',
      title: 'Bespoke Designs Crafted to Order',
      subtitle:
        'Share a reference sketch or photo with our artisans for custom Panchadhatu or steel ornaments.',
      ctaLabel: 'Request Custom Design',
      ctaUrl: '/custom-order',
      imageUrl: '/images/banner-craftsmanship.jpg',
      imageAlt: 'Artisan jeweller crafting Panchadhatu ornaments at workbench',
      enabled: true,
      sortOrder: 2,
    },
  ];

  const announcements: Announcement[] = [
    {
      id: 'ann-1',
      message: 'Nationwide delivery across Nepal · Free delivery in Lumbini above NPR 3,500 · Use code WELCOME10',
      linkLabel: 'Shop Catalog',
      linkUrl: '/catalog',
      mode: 'STATIC',
      enabled: true,
      dismissible: true,
      sortOrder: 1,
    },
  ];

  const homepageSections: HomepageSection[] = [
    {
      id: 'sec-hero',
      type: 'HERO',
      title: 'Sacred Five-Metal & Modern Steel Jewellery',
      subtitle:
        'Thoughtfully crafted Panchadhatu heirlooms and tarnish-resistant 316L steel pieces from our Butwal workshop.',
      ctaLabel: 'Explore Catalog',
      ctaUrl: '/catalog',
      imageUrl: '/images/hero-panchadhatu.jpg',
      enabled: true,
      sortOrder: 1,
    },
    {
      id: 'sec-categories',
      type: 'CATEGORIES',
      title: 'Shop by Material & Category',
      subtitle: 'Curated Panchadhatu traditions and everyday stainless steel silhouettes.',
      enabled: true,
      sortOrder: 2,
    },
    {
      id: 'sec-featured',
      type: 'FEATURED',
      title: 'Signature Pieces',
      subtitle: 'Selected ornaments ready for dispatch across Nepal.',
      ctaLabel: 'View Full Catalog',
      ctaUrl: '/catalog',
      enabled: true,
      sortOrder: 3,
    },
    {
      id: 'sec-story',
      type: 'BRAND_STORY',
      title: 'Crafted in Butwal, Worn Across Nepal',
      subtitle:
        'Every Panchadhatu piece honours five-metal balance and patient hand-finishing, paired with modern steel essentials built for daily life.',
      ctaLabel: 'Visit Our Store',
      ctaUrl: '/contact',
      imageUrl: '/images/banner-craftsmanship.jpg',
      enabled: true,
      sortOrder: 4,
    },
  ];

  const pages: ContentPage[] = [
    {
      slug: 'about',
      title: 'Our Craft & Heritage',
      summary: 'Panchadhatu tradition and modern steel ornaments from Butwal, Nepal.',
      content:
        'Radhakrishna Panchadhatu brings together traditional Nepali five-metal artistry and resilient 316L stainless steel jewellery. Located at 3 Tilottama Path, Yogikuti — about 500 metres west of Yogikuti Chowk — in Butwal 32907, we welcome walk-in guests and ship reliably across all seven provinces of Nepal.\n\nOur Panchadhatu ornaments are valued for ceremonial wear, spiritual significance, and warm metallic lustre, while our surgical steel line offers hypoallergenic, water-resistant pieces tailored for everyday comfort.',
      updatedAt: created,
    },
    {
      slug: 'faq',
      title: 'Frequently Asked Questions',
      summary: 'Answers on Panchadhatu care, steel durability, payments, and Nepal delivery.',
      content:
        'Q: What is Panchadhatu?\nA: Panchadhatu is a traditional sacred alloy combining five metals, prized in Nepali craftsmanship for ceremonial ornaments and spiritual wear.\n\nQ: Do you deliver outside Butwal?\nA: Yes. We deliver nationwide across all seven provinces of Nepal.\n\nQ: Which payment methods are accepted?\nA: We support eSewa, Khalti, Fonepay (subject to merchant verification), and Cash on Delivery where enabled.',
      updatedAt: created,
    },
    {
      slug: 'shipping-policy',
      title: 'Shipping & Delivery Policy',
      summary: 'Delivery timelines and charges across Nepal.',
      content:
        'Orders placed before 3:00 PM NPT are packed and handed to our courier partners the same or next business day from Butwal, Yogikuti.\n\nLumbini Province: 1–2 business days.\nKathmandu Valley & Bagmati: 2–3 business days.\nOther provinces: 3–5 business days depending on municipality accessibility.',
      updatedAt: created,
    },
    {
      slug: 'return-refund-policy',
      title: 'Return & Refund Policy',
      summary: 'Guidelines for exchanges, damaged arrivals, and custom orders.',
      content:
        'Unworn ready-stock items in original packaging may be requested for exchange within 7 days of delivery. Custom-designed or made-to-order pieces are non-returnable unless damaged in transit.\n\nPlease contact us on 984-670-3068 with your order number if an item arrives damaged.',
      updatedAt: created,
    },
    {
      slug: 'terms',
      title: 'Terms & Conditions',
      summary: 'Storefront ordering, pricing in NPR, and map usage terms.',
      content:
        'All prices are listed in Nepalese Rupees (NPR) and validated server-side upon checkout. Orders paid via online gateways are confirmed only after server-side transaction verification.\n\nOur store locator and checkout address helper integrate Google Maps features and are subject to Google Maps End User Additional Terms of Service.',
      updatedAt: created,
    },
    {
      slug: 'privacy',
      title: 'Privacy Policy',
      summary: 'How we handle your name, phone, delivery address, and payment privacy.',
      content:
        'We collect only the customer details required to fulfil your order, arrange delivery across Nepal, and send requested order status updates. We never store wallet PINs or payment credentials.\n\nTo request deletion or correction of your account records, please reach out to our Butwal store team.',
      updatedAt: created,
    },
    {
      slug: 'cookies',
      title: 'Cookie Policy',
      summary: 'Essential, analytics, and marketing cookie preferences.',
      content:
        'Essential cookies and local storage keep your shopping cart, session security, and consent preferences active. Optional analytics or marketing cookies are only enabled if you choose to accept them.',
      updatedAt: created,
    },
  ];

  const shippingZones: ShippingZone[] = [
    { id: 'sz-lumbini', province: 'Lumbini Province', feePaisa: 10000, freeThresholdPaisa: 350000, estimatedDays: '1–2 business days', codAvailable: true },
    { id: 'sz-bagmati', province: 'Bagmati Province', feePaisa: 15000, freeThresholdPaisa: 500000, estimatedDays: '2–3 business days', codAvailable: true },
    { id: 'sz-gandaki', province: 'Gandaki Province', feePaisa: 15000, freeThresholdPaisa: 500000, estimatedDays: '2–3 business days', codAvailable: true },
    { id: 'sz-koshi', province: 'Koshi Province', feePaisa: 20000, freeThresholdPaisa: 600000, estimatedDays: '3–4 business days', codAvailable: true },
    { id: 'sz-madhesh', province: 'Madhesh Province', feePaisa: 18000, freeThresholdPaisa: 550000, estimatedDays: '2–4 business days', codAvailable: true },
    { id: 'sz-karnali', province: 'Karnali Province', feePaisa: 25000, freeThresholdPaisa: 750000, estimatedDays: '4–6 business days', codAvailable: false },
    { id: 'sz-sudur', province: 'Sudurpashchim Province', feePaisa: 25000, freeThresholdPaisa: 750000, estimatedDays: '4–5 business days', codAvailable: false },
  ];

  const coupons: Coupon[] = [
    { id: 'cpn-welcome', code: 'WELCOME10', discountType: 'PERCENT', value: 10, minOrderPaisa: 250000, active: true, usageCount: 0 },
    { id: 'cpn-festive', code: 'FESTIVE500', discountType: 'FLAT_PAISA', value: 50000, minOrderPaisa: 400000, active: true, usageCount: 0 },
  ];

  // Seed one delivered sample order so reviewers/testers can immediately test order tracking & verified reviews
  const sampleOrder: Order = {
    id: 'ord-sample-1001',
    orderNumber: 'RKP-2026-1001',
    trackingToken: 'trk_butwal_demo_991827',
    customerName: 'Sita Sharma',
    customerPhone: '9841000000',
    customerEmail: 'sita@example.com',
    address: {
      fullName: 'Sita Sharma',
      phone: '9841000000',
      province: 'Lumbini Province',
      district: 'Rupandehi',
      municipality: 'Butwal Sub-Metropolitan City',
      ward: '11',
      street: 'Yogikuti, Santichowk',
      landmark: 'Near Santichowk Temple',
    },
    items: [
      {
        id: 'oi-1',
        productId: 'prod-mandala-pendant',
        productName: 'Sacred Mandala Panchadhatu Pendant',
        productSlug: 'sacred-mandala-panchadhatu-pendant',
        sku: 'RKP-NCK-001-18',
        variantId: 'var-1-18',
        variantLabel: '18-inch Chain',
        imageUrl: '/images/product-necklace.jpg',
        unitPricePaisa: 420000,
        quantity: 1,
      },
    ],
    subtotalPaisa: 420000,
    discountPaisa: 0,
    deliveryFeePaisa: 0,
    totalPaisa: 420000,
    paymentMethod: 'ESEWA',
    paymentStatus: 'PAID',
    fulfilmentStatus: 'DELIVERED',
    courierName: 'Nepal Can Move',
    trackingReference: 'NCM-BTL-88412',
    timeline: [
      {
        id: 'tl-1',
        fromStatus: null,
        toStatus: 'ORDER_PLACED',
        publicNote: 'Order submitted by customer.',
        actor: 'System',
        createdAt: '2026-11-16T08:00:00.000Z',
      },
      {
        id: 'tl-2',
        fromStatus: 'ORDER_PLACED',
        toStatus: 'PROCESSING',
        publicNote: 'Payment verified via eSewa. Polishing and packing your ornament.',
        actor: 'Owner',
        createdAt: '2026-11-16T09:15:00.000Z',
      },
      {
        id: 'tl-3',
        fromStatus: 'PROCESSING',
        toStatus: 'DISPATCHED',
        publicNote: 'Handed over to Nepal Can Move (Tracking: NCM-BTL-88412).',
        actor: 'Owner',
        createdAt: '2026-11-16T14:30:00.000Z',
      },
      {
        id: 'tl-4',
        fromStatus: 'DISPATCHED',
        toStatus: 'DELIVERED',
        publicNote: 'Delivered to customer in Butwal.',
        actor: 'Owner',
        createdAt: '2026-11-17T11:20:00.000Z',
      },
    ],
    payment: {
      id: 'pay-sample-1001',
      orderId: 'ord-sample-1001',
      provider: 'ESEWA',
      amountPaisa: 420000,
      currency: 'NPR',
      status: 'PAID',
      providerReference: 'ESW-98127361',
      idempotencyKey: 'idem-sample-1001',
      verifiedAt: '2026-11-16T08:05:00.000Z',
      createdAt: '2026-11-16T08:00:00.000Z',
    },
    createdAt: '2026-11-16T08:00:00.000Z',
    updatedAt: '2026-11-17T11:20:00.000Z',
  };

  const reviews: Review[] = [
    {
      id: 'rev-1',
      productId: 'prod-mandala-pendant',
      productName: 'Sacred Mandala Panchadhatu Pendant',
      orderNumber: 'RKP-2026-1001',
      customerName: 'Sita Sharma',
      rating: 5,
      title: 'Fine detailing and prompt Butwal delivery',
      content:
        'The engraving on the Panchadhatu pendant feels solid and refined. Arrived well-packaged the very next day.',
      verifiedPurchase: true,
      status: 'APPROVED',
      createdAt: '2026-11-18T07:00:00.000Z',
    },
  ];

  const mediaAssets: MediaAsset[] = [
    { id: 'med-1', title: 'Hero Panchadhatu Campaign', url: '/images/hero-panchadhatu.jpg', alt: 'Panchadhatu necklace and earrings on travertine', category: 'BANNER', createdAt: created },
    { id: 'med-2', title: 'Sacred Mandala Pendant', url: '/images/product-necklace.jpg', alt: 'Mandala Panchadhatu pendant', category: 'PRODUCT', createdAt: created },
    { id: 'med-3', title: 'Surgical Steel Bangle Stack', url: '/images/product-bangles.jpg', alt: 'Two-tone steel bangles', category: 'PRODUCT', createdAt: created },
    { id: 'med-4', title: 'Heritage Filigree Ring', url: '/images/product-ring.jpg', alt: 'Filigree Panchadhatu ring', category: 'PRODUCT', createdAt: created },
    { id: 'med-5', title: 'Artisanal Jhumka Drops', url: '/images/product-earrings.jpg', alt: 'Panchadhatu jhumka earrings', category: 'PRODUCT', createdAt: created },
    { id: 'med-6', title: 'Butwal Artisan Workbench', url: '/images/banner-craftsmanship.jpg', alt: 'Jewellery artisan crafting Panchadhatu', category: 'EDITORIAL', createdAt: created },
  ];

  return {
    settings,
    categories,
    products,
    banners,
    announcements,
    homepageSections,
    pages,
    shippingZones,
    coupons,
    orders: [sampleOrder],
    reviews,
    customOrderRequests: [],
    contactEnquiries: [],
    inventoryMovements: [],
    mediaAssets,
    auditLogs: [
      {
        id: 'audit-init',
        actor: 'System',
        role: 'OWNER',
        action: 'STORE_INITIALIZED',
        entityType: 'StoreSettings',
        entityId: 'store',
        summary: 'Initialized Radhakrishna Panchadhatu storefront configuration.',
        createdAt: created,
      },
    ],
  };
}

const globalForStore = globalThis as unknown as { __rkpStore?: StoreDatabase };

export function getStore(): StoreDatabase {
  if (!globalForStore.__rkpStore) {
    globalForStore.__rkpStore = loadStoreFromDisk() ?? createInitialDatabase();
  }
  return globalForStore.__rkpStore;
}

/**
 * Persist the current store to disk. Called after every mutation so CMS edits,
 * orders and settings survive a server restart. Safe to call when nothing
 * changed and safe on read-only filesystems (it logs once and gives up).
 */
export function saveStore(): boolean {
  if (!globalForStore.__rkpStore) return false;
  return saveStoreToDisk(globalForStore.__rkpStore);
}

export function appendAuditLog(params: {
  actor: string;
  role: AdminRole;
  action: string;
  entityType: string;
  entityId: string;
  summary: string;
}) {
  const store = getStore();
  store.auditLogs.unshift({
    id: uid('audit'),
    actor: params.actor,
    role: params.role,
    action: params.action,
    entityType: params.entityType,
    entityId: params.entityId,
    summary: params.summary,
    createdAt: nowIso(),
  });
  saveStore();
}

export function queryPublicProducts(opts?: {
  q?: string;
  category?: string;
  material?: string;
  availability?: 'all' | 'in-stock' | 'made-to-order';
  newArrival?: boolean;
  featured?: boolean;
  sort?: 'latest' | 'price-asc' | 'price-desc' | 'featured';
  minPricePaisa?: number;
  maxPricePaisa?: number;
}): Product[] {
  const store = getStore();
  let list = store.products.filter((p) => p.status === 'PUBLISHED');

  if (opts?.category && opts.category !== 'all') {
    const cat = store.categories.find((c) => c.slug === opts.category || c.id === opts.category);
    list = list.filter(
      (p) =>
        p.categoryId === opts.category ||
        (cat && p.categoryId === cat.id) ||
        p.categoryName.toLowerCase() === opts.category?.toLowerCase()
    );
  }
  if (opts?.material && opts.material !== 'all') {
    list = list.filter((p) => p.material.toLowerCase() === opts.material?.toLowerCase());
  }
  if (opts?.availability === 'in-stock') {
    list = list.filter((p) => p.stockQuantity > 0);
  } else if (opts?.availability === 'made-to-order') {
    list = list.filter((p) => p.productType === 'MADE_TO_ORDER');
  }
  if (opts?.newArrival) {
    list = list.filter((p) => p.isNewArrival);
  }
  if (opts?.featured) {
    list = list.filter((p) => p.isFeatured);
  }
  if (opts?.minPricePaisa !== undefined) {
    list = list.filter((p) => p.pricePaisa !== null && p.pricePaisa >= opts.minPricePaisa!);
  }
  if (opts?.maxPricePaisa !== undefined) {
    list = list.filter((p) => p.pricePaisa !== null && p.pricePaisa <= opts.maxPricePaisa!);
  }
  if (opts?.q && opts.q.trim()) {
    const q = opts.q.trim().toLowerCase();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.material.toLowerCase().includes(q) ||
        p.categoryName.toLowerCase().includes(q) ||
        p.shortDescription.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
    );
  }

  switch (opts?.sort) {
    case 'price-asc':
      list = [...list].sort((a, b) => (a.pricePaisa ?? Number.MAX_SAFE_INTEGER) - (b.pricePaisa ?? Number.MAX_SAFE_INTEGER));
      break;
    case 'price-desc':
      list = [...list].sort((a, b) => (b.pricePaisa ?? 0) - (a.pricePaisa ?? 0));
      break;
    case 'featured':
      list = [...list].sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured));
      break;
    default:
      list = [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  return list;
}

export function calculateDeliveryFee(province: string, subtotalPaisa: number): {
  feePaisa: number;
  zone: ShippingZone | undefined;
} {
  const store = getStore();
  const zone = store.shippingZones.find(
    (z) => z.province.toLowerCase() === province.toLowerCase()
  );
  if (!zone) {
    return { feePaisa: subtotalPaisa >= 500000 ? 0 : 15000, zone: undefined };
  }
  const feePaisa = subtotalPaisa >= zone.freeThresholdPaisa ? 0 : zone.feePaisa;
  return { feePaisa, zone };
}

export function createServerOrder(input: {
  address: OrderAddress;
  items: { productId: string; variantId?: string; quantity: number }[];
  paymentMethod: PaymentMethod;
  couponCode?: string;
}): { ok: true; order: Order } | { ok: false; error: string } {
  const store = getStore();

  if (input.paymentMethod === 'COD' && !store.settings.codEnabled) {
    return { ok: false, error: 'Cash on Delivery is currently disabled.' };
  }
  if (input.paymentMethod === 'ESEWA' && !store.settings.esewaEnabled) {
    return { ok: false, error: 'eSewa is currently disabled.' };
  }
  if (input.paymentMethod === 'KHALTI' && !store.settings.khaltiEnabled) {
    return { ok: false, error: 'Khalti is currently disabled.' };
  }
  if (input.paymentMethod === 'FONEPAY' && !store.settings.fonepayEnabled) {
    return { ok: false, error: 'Fonepay is currently disabled.' };
  }

  const orderItems: OrderItem[] = [];
  let subtotalPaisa = 0;

  // Atomic stock & server-side price validation
  for (const reqItem of input.items) {
    const product = store.products.find((p) => p.id === reqItem.productId && p.status === 'PUBLISHED');
    if (!product) {
      return { ok: false, error: 'One or more selected products are no longer available.' };
    }
    if (product.pricePaisa === null) {
      return { ok: false, error: `${product.name} requires a WhatsApp quote before ordering.` };
    }

    const variant = reqItem.variantId
      ? product.variants.find((v) => v.id === reqItem.variantId)
      : product.variants[0];

    const availableStock = variant ? variant.stockQuantity : product.stockQuantity;
    if (product.productType === 'READY_STOCK' && availableStock < reqItem.quantity) {
      return {
        ok: false,
        error: `Insufficient stock for ${product.name}${variant ? ` (${variant.label})` : ''}. Available: ${availableStock}.`,
      };
    }

    const unitPricePaisa = variant?.priceOverridePaisa ?? product.pricePaisa;
    subtotalPaisa += unitPricePaisa * reqItem.quantity;

    orderItems.push({
      id: uid('oi'),
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      sku: variant?.sku ?? product.sku,
      variantId: variant?.id,
      variantLabel: variant?.label,
      imageUrl: product.images.find((i) => i.isPrimary)?.url ?? product.images[0]?.url ?? '/images/product-necklace.jpg',
      unitPricePaisa,
      quantity: reqItem.quantity,
    });
  }

  // Coupon validation
  let discountPaisa = 0;
  let appliedCouponCode: string | undefined;
  if (input.couponCode && input.couponCode.trim()) {
    const normalized = input.couponCode.trim().toUpperCase();
    const coupon = store.coupons.find((c) => c.code.toUpperCase() === normalized && c.active);
    if (!coupon) {
      return { ok: false, error: `Coupon code "${normalized}" is invalid or inactive.` };
    }
    if (subtotalPaisa < coupon.minOrderPaisa) {
      return { ok: false, error: `Coupon ${normalized} requires a higher order minimum.` };
    }
    discountPaisa =
      coupon.discountType === 'PERCENT'
        ? Math.round((subtotalPaisa * coupon.value) / 100)
        : Math.min(coupon.value, subtotalPaisa);
    coupon.usageCount += 1;
    appliedCouponCode = coupon.code;
  }

  const { feePaisa: deliveryFeePaisa, zone } = calculateDeliveryFee(
    input.address.province,
    Math.max(0, subtotalPaisa - discountPaisa)
  );
  if (input.paymentMethod === 'COD' && zone && !zone.codAvailable) {
    return { ok: false, error: `Cash on Delivery is not available for ${zone.province}. Please choose an online payment gateway.` };
  }

  const totalPaisa = Math.max(0, subtotalPaisa - discountPaisa) + deliveryFeePaisa;

  // Deduct stock & record inventory movements
  const timestamp = nowIso();
  for (const item of orderItems) {
    const product = store.products.find((p) => p.id === item.productId);
    if (product && product.productType === 'READY_STOCK') {
      const variant = item.variantId
        ? product.variants.find((v) => v.id === item.variantId)
        : undefined;
      if (variant) {
        variant.stockQuantity = Math.max(0, variant.stockQuantity - item.quantity);
      }
      product.stockQuantity = Math.max(0, product.stockQuantity - item.quantity);
      store.inventoryMovements.unshift({
        id: uid('mov'),
        productId: product.id,
        productName: product.name,
        variantId: variant?.id,
        quantityDelta: -item.quantity,
        reason: 'Customer order reservation',
        actorName: 'Checkout System',
        createdAt: timestamp,
      });
    }
  }

  const orderId = uid('ord');
  const orderNumber = `RKP-${new Date().getFullYear()}-${String(1002 + store.orders.length)}`;
  const trackingToken = `trk_${crypto.randomBytes(12).toString('hex')}`;
  const isOnline = input.paymentMethod !== 'COD';

  const order: Order = {
    id: orderId,
    orderNumber,
    trackingToken,
    customerName: input.address.fullName,
    customerPhone: input.address.phone,
    customerEmail: input.address.email,
    address: input.address,
    items: orderItems,
    subtotalPaisa,
    discountPaisa,
    couponCode: appliedCouponCode,
    deliveryFeePaisa,
    totalPaisa,
    paymentMethod: input.paymentMethod,
    paymentStatus: isOnline ? 'INITIATED' : 'PENDING',
    fulfilmentStatus: 'ORDER_PLACED',
    timeline: [
      {
        id: uid('tl'),
        fromStatus: null,
        toStatus: 'ORDER_PLACED',
        publicNote: isOnline
          ? `Order placed. Awaiting ${input.paymentMethod} verification.`
          : 'Order placed with Cash on Delivery.',
        actor: 'System',
        createdAt: timestamp,
      },
    ],
    payment: {
      id: uid('pay'),
      orderId,
      provider: input.paymentMethod,
      amountPaisa: totalPaisa,
      currency: 'NPR',
      status: isOnline ? 'INITIATED' : 'PENDING',
      providerReference: `${input.paymentMethod}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
      idempotencyKey: `idem-${orderId}`,
      createdAt: timestamp,
    },
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  store.orders.unshift(order);
  saveStore();
  return { ok: true, order };
}

export function verifyServerPayment(params: {
  orderNumber: string;
  trackingToken: string;
  providerReference: string;
  outcome: 'PAID' | 'FAILED' | 'CANCELLED';
}): { ok: true; order: Order; idempotentReplay: boolean } | { ok: false; error: string } {
  const store = getStore();
  const order = store.orders.find(
    (o) => o.orderNumber === params.orderNumber && o.trackingToken === params.trackingToken
  );
  if (!order) {
    return { ok: false, error: 'Order not found.' };
  }

  // Idempotent guard: already finalized with PAID
  if (order.paymentStatus === 'PAID') {
    return { ok: true, order, idempotentReplay: true };
  }

  const timestamp = nowIso();
  order.payment.status = params.outcome;
  order.paymentStatus = params.outcome;
  order.payment.providerReference = params.providerReference || order.payment.providerReference;

  if (params.outcome === 'PAID') {
    order.payment.verifiedAt = timestamp;
    if (order.fulfilmentStatus === 'ORDER_PLACED') {
      order.fulfilmentStatus = 'ORDER_RECEIVED';
      order.timeline.push({
        id: uid('tl'),
        fromStatus: 'ORDER_PLACED',
        toStatus: 'ORDER_RECEIVED',
        publicNote: `Payment verified server-side via ${order.paymentMethod} (Ref: ${order.payment.providerReference}). Order received by store.`,
        actor: 'Payment Verifier',
        createdAt: timestamp,
      });
    }
  } else {
    order.timeline.push({
      id: uid('tl'),
      fromStatus: order.fulfilmentStatus,
      toStatus: order.fulfilmentStatus,
      publicNote: `Payment ${params.outcome.toLowerCase()} via ${order.paymentMethod}.`,
      actor: 'Payment Verifier',
      createdAt: timestamp,
    });
  }

  order.updatedAt = timestamp;
  saveStore();
  return { ok: true, order, idempotentReplay: false };
}

export function updateOrderAdmin(params: {
  orderId: string;
  fulfilmentStatus?: FulfilmentStatus;
  paymentStatus?: PaymentStatus;
  courierName?: string;
  trackingReference?: string;
  publicNote?: string;
  internalNote?: string;
  actor: string;
  role: AdminRole;
}): Order | null {
  const store = getStore();
  const order = store.orders.find((o) => o.id === params.orderId);
  if (!order) return null;

  const timestamp = nowIso();
  const prevStatus = order.fulfilmentStatus;

  if (params.courierName !== undefined) order.courierName = params.courierName;
  if (params.trackingReference !== undefined) order.trackingReference = params.trackingReference;
  if (params.paymentStatus && params.paymentStatus !== order.paymentStatus) {
    order.paymentStatus = params.paymentStatus;
    order.payment.status = params.paymentStatus;
  }

  if (params.fulfilmentStatus && (params.fulfilmentStatus !== prevStatus || params.publicNote)) {
    order.fulfilmentStatus = params.fulfilmentStatus;
    order.timeline.push({
      id: uid('tl'),
      fromStatus: prevStatus,
      toStatus: params.fulfilmentStatus,
      publicNote: params.publicNote?.trim() || `Order status updated to ${params.fulfilmentStatus.replaceAll('_', ' ')}.`,
      internalNote: params.internalNote?.trim(),
      actor: params.actor,
      createdAt: timestamp,
    });
  }

  order.updatedAt = timestamp;

  appendAuditLog({
    actor: params.actor,
    role: params.role,
    action: 'ORDER_UPDATED',
    entityType: 'Order',
    entityId: order.orderNumber,
    summary: `Updated ${order.orderNumber} (Fulfilment: ${order.fulfilmentStatus}, Payment: ${order.paymentStatus}).`,
  });

  return order;
}

export function submitVerifiedReview(input: {
  productId: string;
  orderNumber: string;
  customerPhone: string;
  customerName: string;
  rating: number;
  title: string;
  content: string;
}): { ok: true; review: Review } | { ok: false; error: string } {
  const store = getStore();
  const order = store.orders.find(
    (o) =>
      o.orderNumber.toUpperCase() === input.orderNumber.trim().toUpperCase() &&
      o.customerPhone.replace(/\D/g, '').endsWith(input.customerPhone.replace(/\D/g, '').slice(-7))
  );

  if (!order) {
    return { ok: false, error: 'No matching order found for that order number and phone number.' };
  }
  if (order.fulfilmentStatus !== 'DELIVERED') {
    return { ok: false, error: 'Verified reviews can only be submitted once your order is delivered.' };
  }
  const hasItem = order.items.some((item) => item.productId === input.productId);
  if (!hasItem) {
    return { ok: false, error: 'This product was not part of the referenced delivered order.' };
  }
  const duplicate = store.reviews.find(
    (r) => r.productId === input.productId && r.orderNumber === order.orderNumber
  );
  if (duplicate) {
    return { ok: false, error: 'A review has already been submitted for this item on this order.' };
  }

  const product = store.products.find((p) => p.id === input.productId);
  const review: Review = {
    id: uid('rev'),
    productId: input.productId,
    productName: product?.name ?? 'Jewellery Piece',
    orderNumber: order.orderNumber,
    customerName: input.customerName.trim(),
    rating: Math.min(5, Math.max(1, Math.round(input.rating))),
    title: input.title.trim(),
    content: input.content.trim(),
    verifiedPurchase: true,
    status: 'PENDING',
    createdAt: nowIso(),
  };
  store.reviews.unshift(review);
  saveStore();
  return { ok: true, review };
}

export function createCustomOrderLead(input: {
  customerName: string;
  customerPhone: string;
  preferredMaterial: string;
  budgetNote?: string;
  description: string;
  referenceImageUrl?: string;
  consentAccepted: boolean;
}): CustomOrderRequest {
  const store = getStore();
  const req: CustomOrderRequest = {
    id: uid('cust'),
    referenceCode: `CUST-${crypto.randomBytes(3).toString('hex').toUpperCase()}`,
    customerName: input.customerName.trim(),
    customerPhone: input.customerPhone.trim(),
    preferredMaterial: input.preferredMaterial.trim(),
    budgetNote: input.budgetNote?.trim(),
    description: input.description.trim(),
    referenceImageUrl: input.referenceImageUrl?.trim(),
    consentAccepted: input.consentAccepted,
    status: 'NEW',
    createdAt: nowIso(),
  };
  store.customOrderRequests.unshift(req);
  saveStore();
  return req;
}

export function toPublicTrackingView(order: Order) {
  return {
    orderNumber: order.orderNumber,
    trackingToken: order.trackingToken,
    fulfilmentStatus: order.fulfilmentStatus,
    paymentStatus: order.paymentStatus,
    paymentMethod: order.paymentMethod,
    courierName: order.courierName ?? null,
    trackingReference: order.trackingReference ?? null,
    province: order.address.province,
    municipality: order.address.municipality,
    items: order.items.map((item) => ({
      id: item.id,
      productName: item.productName,
      variantLabel: item.variantLabel,
      quantity: item.quantity,
      unitPricePaisa: item.unitPricePaisa,
      imageUrl: item.imageUrl,
    })),
    subtotalPaisa: order.subtotalPaisa,
    discountPaisa: order.discountPaisa,
    deliveryFeePaisa: order.deliveryFeePaisa,
    totalPaisa: order.totalPaisa,
    timeline: order.timeline.map((entry) => ({
      id: entry.id,
      toStatus: entry.toStatus,
      publicNote: entry.publicNote,
      createdAt: entry.createdAt,
    })),
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
}

export { uid, nowIso };
