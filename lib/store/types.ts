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
  /** Transaction id returned by the payment network (e.g. Fonepay UID). */
  gatewayReference?: string;
  idempotencyKey: string;
  verifiedAt?: string;
  /** Total already returned to the customer, in paisa. */
  refundedPaisa?: number;
  refunds?: PaymentRefund[];
  createdAt: string;
}

export interface PaymentRefund {
  id: string;
  amountPaisa: number;
  reason: string;
  actor: string;
  /** Gateway refund reference when the refund was processed by Fonepay/bank. */
  gatewayReference?: string;
  createdAt: string;
}

/** Append-only ledger of gateway callbacks, used to make settlement idempotent. */
export interface PaymentEvent {
  id: string;
  orderId: string;
  orderNumber: string;
  providerReference: string;
  outcome: 'PAID' | 'FAILED' | 'CANCELLED' | 'REFUNDED' | 'RECONCILED';
  source: 'CALLBACK' | 'ADMIN' | 'SANDBOX' | 'CRON';
  amountPaisa: number;
  gatewayReference?: string;
  note?: string;
  createdAt: string;
}

export interface GiftCard {
  id: string;
  code: string;
  initialPaisa: number;
  balancePaisa: number;
  active: boolean;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export type NotificationChannel = 'EMAIL' | 'WHATSAPP';

export interface NotificationLogEntry {
  id: string;
  channel: NotificationChannel;
  /** Stable de-duplication key, e.g. order:RKP-2026-1002:placed. */
  key: string;
  to: string;
  subject: string;
  status: 'SENT' | 'SKIPPED' | 'FAILED';
  detail?: string;
  createdAt: string;
}

export interface AbandonedCartItem {
  productId: string;
  name: string;
  quantity: number;
  unitPricePaisa: number;
}

export interface AbandonedCart {
  id: string;
  email: string;
  customerName?: string;
  phone?: string;
  items: AbandonedCartItem[];
  subtotalPaisa: number;
  recoveryToken: string;
  remindedAt?: string;
  recoveredOrderNumber?: string;
  createdAt: string;
}

export interface AnalyticsDay {
  date: string;
  events: Record<string, number>;
}

export interface SystemEvent {
  id: string;
  level: 'ERROR' | 'WARN' | 'INFO';
  scope: string;
  message: string;
  detail?: string;
  path?: string;
  createdAt: string;
}

export interface BackupRecord {
  id: string;
  reason: string;
  orders: number;
  products: number;
  sizeBytes: number;
  /** Postgres row revision the backup was taken from, when known. */
  revision?: number | null;
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
  /** Stock is held for the order; released when an unpaid order expires or is cancelled. */
  stockReserved?: boolean;
  stockReleased?: boolean;
  reservationExpiresAt?: string;
  giftCardCode?: string;
  giftCardPaisa?: number;
  loyaltyPointsEarned?: number;
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
