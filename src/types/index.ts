// Re-export shared application types

export type { User, Product, Order, Payment, Review } from "@prisma/client";

// ─── Cart ─────────────────────────────────────────────────────────────────

export interface CartLineItem {
  id: string;
  productId: string;
  variantId: string | null;
  productName: string;
  variantLabel: string | null;
  sku: string;
  unitPrice: number; // paisa
  quantity: number;
  imageUrl: string | null;
  stock: number;
}

export interface CartSummary {
  items: CartLineItem[];
  subtotal: number;        // paisa
  discountAmount: number;  // paisa
  deliveryFee: number;     // paisa
  total: number;           // paisa
  currency: "NPR";
}

// ─── Checkout ─────────────────────────────────────────────────────────────

export interface CheckoutAddress {
  recipient: string;
  phone: string;
  province: string;
  district: string;
  municipality: string;
  ward?: string;
  street?: string;
  landmark?: string;
  notes?: string;
}

// ─── Payments ─────────────────────────────────────────────────────────────

export type PaymentProviderName = "esewa" | "khalti" | "fonepay" | "cod";

export interface PaymentInitiateResult {
  redirectUrl: string;
  providerTransactionId: string;
  paymentId: string;
}

// ─── API responses ────────────────────────────────────────────────────────

export interface ApiSuccess<T = unknown> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: string;
  details?: Record<string, string[]>;
}

export type ApiResponse<T = unknown> = ApiSuccess<T> | ApiError;
