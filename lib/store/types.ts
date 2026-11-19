export type ProductStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type ProductType = 'READY_STOCK' | 'MADE_TO_ORDER' | 'CUSTOM_ORDER';

export type PaymentMethod = 'ESEWA' | 'KHALTI' | 'FONEPAY' | 'COD';
export type PaymentStatus =
  | 'PENDING'
  | 'INITIATED'
  | 'PROCESSING'
  | 'PAID'
  | 'FAILED'
  | 'CANCELLED'
  | 'EXPIRED'
  | 'REFUNDED'
  | 'PARTIALLY_REFUNDED'
  | 'MANUAL_REVIEW';

export type FulfilmentStatus =
  | 'ORDER_PLACED'
  | 'ORDER_RECEIVED'
  | 'PROCESSING'
  | 'READY_TO_DISPATCH'
  | 'DISPATCHED'
  | 'IN_TRANSIT'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'RETURN_REQUESTED'
  | 'RETURNED';

export type AdminRole = 'OWNER' | 'MANAGER' | 'ORDER_STAFF' | 'CONTENT_EDITOR' | 'REVIEWER';

export interface ProductVariant {
  id: string;
  label: string;
  sku: string;
  priceOverridePaisa: number | null;
  stockQuantity: number;
}

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  isPrimary: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  shortDescription: string;
  description: string;
  material: string;
  categoryId: string;
  categoryName: string;
  collectionSlug?: string;
  pricePaisa: number | null;
  compareAtPaisa: number | null;
  stockQuantity: number;
  lowStockThreshold: number;
  productType: ProductType;
  weightGrams?: number;
  careInstructions: string;
  deliveryNote: string;
  tags: string[];
  images: ProductImage[];
  variants: ProductVariant[];
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  status: ProductStatus;
  seoTitle?: string;
  seoDescription?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  isActive: boolean;
  sortOrder: number;
  seoTitle?: string;
  seoDescription?: string;
}

export interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  isActive: boolean;
}

export interface InventoryMovement {
  id: string;
  productId: string;
  productName: string;
  variantId?: string;
  quantityDelta: number;
  reason: string;
  actorName: string;
  createdAt: string;
}

export interface OrderAddress {
  fullName: string;
  phone: string;
  email?: string;
  province: string;
  district: string;
  municipality: string;
  ward: string;
  street: string;
  landmark?: string;
  deliveryInstructions?: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  sku: string;
  variantId?: string;
  variantLabel?: string;
  imageUrl: string;
  unitPricePaisa: number;
  quantity: number;
}

export interface OrderStatusHistoryEntry {
  id: string;
  fromStatus: FulfilmentStatus | null;
  toStatus: FulfilmentStatus;
  publicNote: string;
  internalNote?: string;
  actor: string;
  createdAt: string;
}

export interface PaymentRecord {
  id: string;
  orderId: string;
  provider: PaymentMethod;
  amountPaisa: number;
  currency: 'NPR';
  status: PaymentStatus;
  providerReference: string;
  idempotencyKey: string;
  verifiedAt?: string;
  createdAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  trackingToken: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  address: OrderAddress;
  items: OrderItem[];
  subtotalPaisa: number;
  discountPaisa: number;
  couponCode?: string;
  deliveryFeePaisa: number;
  totalPaisa: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  fulfilmentStatus: FulfilmentStatus;
  courierName?: string;
  trackingReference?: string;
  timeline: OrderStatusHistoryEntry[];
  payment: PaymentRecord;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  productId: string;
  productName: string;
  orderNumber: string;
  customerName: string;
  rating: number;
  title: string;
  content: string;
  verifiedPurchase: boolean;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  adminReply?: string;
  createdAt: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaUrl: string;
  imageUrl: string;
  imageAlt: string;
  enabled: boolean;
  sortOrder: number;
}

export interface Announcement {
  id: string;
  message: string;
  linkLabel?: string;
  linkUrl?: string;
  mode: 'STATIC' | 'SCROLLING';
  enabled: boolean;
  dismissible: boolean;
  sortOrder: number;
}

export interface HomepageSection {
  id: string;
  type:
    | 'HERO'
    | 'CATEGORIES'
    | 'NEW_ARRIVALS'
    | 'FEATURED'
    | 'BRAND_STORY'
    | 'PROMO_BANNER'
    | 'CUSTOM_CTA'
    | 'STORE_VISIT';
  title: string;
  subtitle: string;
  ctaLabel?: string;
  ctaUrl?: string;
  imageUrl?: string;
  enabled: boolean;
  sortOrder: number;
}

export interface ContentPage {
  slug: string;
  title: string;
  summary: string;
  content: string;
  seoTitle?: string;
  seoDescription?: string;
  updatedAt: string;
}

export interface CustomOrderRequest {
  id: string;
  referenceCode: string;
  customerName: string;
  customerPhone: string;
  preferredMaterial: string;
  budgetNote?: string;
  description: string;
  referenceImageUrl?: string;
  consentAccepted: boolean;
  status: 'NEW' | 'REVIEWING' | 'QUOTED' | 'CLOSED';
  createdAt: string;
}

export interface ContactEnquiry {
  id: string;
  name: string;
  phone: string;
  email?: string;
  message: string;
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'PERCENT' | 'FLAT_PAISA';
  value: number;
  minOrderPaisa: number;
  active: boolean;
  usageCount: number;
}

export interface ShippingZone {
  id: string;
  province: string;
  feePaisa: number;
  freeThresholdPaisa: number;
  estimatedDays: string;
  codAvailable: boolean;
}

export interface MediaAsset {
  id: string;
  title: string;
  url: string;
  alt: string;
  category: 'PRODUCT' | 'BANNER' | 'EDITORIAL' | 'CATEGORY';
  createdAt: string;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  phone: string;
  whatsappDigits: string;
  email: string;
  address: string;
  cityLine: string;
  mapUrl: string;
  openingHours: string;
  facebookUrl: string;
  tiktokUrl: string;
  currency: 'NPR';
  timezone: 'Asia/Kathmandu';
  codEnabled: boolean;
  esewaEnabled: boolean;
  khaltiEnabled: boolean;
  fonepayEnabled: boolean;
  customOrderConsentText: string;
}

export interface AdminAuditLog {
  id: string;
  actor: string;
  role: AdminRole;
  action: string;
  entityType: string;
  entityId: string;
  summary: string;
  createdAt: string;
}
