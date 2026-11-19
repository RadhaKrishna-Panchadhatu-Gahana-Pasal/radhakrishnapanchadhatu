import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes safely */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a paisa integer to a human-readable NPR string.
 * e.g. 150000 → "NPR 1,500"
 */
export function formatNPR(paisa: number): string {
  const rupees = paisa / 100;
  return new Intl.NumberFormat("ne-NP", {
    style: "currency",
    currency: "NPR",
    maximumFractionDigits: 0,
  }).format(rupees);
}

/**
 * Convert NPR to paisa (integer). Never use floating point for money.
 * e.g. 1500 → 150000
 */
export function nprToPaisa(npr: number): number {
  return Math.round(npr * 100);
}

/**
 * Convert paisa to NPR rupees.
 */
export function paisaToNpr(paisa: number): number {
  return paisa / 100;
}

/**
 * Generate a WhatsApp click-to-chat URL with a prefilled message.
 */
export function buildWhatsAppUrl(
  phone: string,
  message: string
): string {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

/**
 * Generate a WhatsApp product enquiry message.
 */
export function buildProductWhatsAppMessage(params: {
  productName: string;
  sku: string;
  productUrl: string;
  variant?: string;
  quantity?: number;
}): string {
  const lines = [
    `Hello, I am interested in this product:`,
    `Product: ${params.productName}`,
    `SKU: ${params.sku}`,
    params.variant ? `Variant: ${params.variant}` : null,
    params.quantity ? `Quantity: ${params.quantity}` : null,
    `Link: ${params.productUrl}`,
  ].filter(Boolean);

  return lines.join("\n");
}

/**
 * Slugify a string.
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Truncate a string to a maximum length.
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 1) + "…";
}
