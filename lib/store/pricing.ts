import type { Coupon } from './types';

/**
 * Pure money maths shared by checkout, the admin area and the tests.
 * Everything is in paisa (integer NPR × 100) so no floating point rounding
 * can leak into an order total.
 */

export interface CouponEvaluation {
  ok: boolean;
  discountPaisa: number;
  message: string;
}

export function computeCouponDiscount(coupon: Coupon, subtotalPaisa: number): number {
  if (!coupon.active) return 0;
  if (subtotalPaisa < coupon.minOrderPaisa) return 0;
  if (coupon.discountType === 'PERCENT') {
    return Math.round((subtotalPaisa * coupon.value) / 100);
  }
  return Math.min(coupon.value, subtotalPaisa);
}

export function evaluateCoupon(
  coupon: Coupon | undefined,
  subtotalPaisa: number,
  code: string
): CouponEvaluation {
  const normalized = code.trim().toUpperCase();
  if (!coupon || coupon.code.toUpperCase() !== normalized || !coupon.active) {
    return { ok: false, discountPaisa: 0, message: `Coupon code "${normalized}" is invalid or inactive.` };
  }
  if (subtotalPaisa < coupon.minOrderPaisa) {
    return { ok: false, discountPaisa: 0, message: `Coupon ${coupon.code} requires a higher order minimum.` };
  }
  return { ok: true, discountPaisa: computeCouponDiscount(coupon, subtotalPaisa), message: `Applied ${coupon.code}` };
}

export interface OrderTotals {
  subtotalPaisa: number;
  discountPaisa: number;
  giftCardPaisa: number;
  deliveryFeePaisa: number;
  totalPaisa: number;
}

/**
 * Delivery is charged on the discounted merchandise value, and a gift card can
 * only ever reduce what the customer owes — never below zero.
 */
export function computeOrderTotals(input: {
  subtotalPaisa: number;
  discountPaisa: number;
  deliveryFeePaisa: number;
  giftCardBalancePaisa?: number;
}): OrderTotals {
  const subtotalPaisa = Math.max(0, Math.round(input.subtotalPaisa));
  const discountPaisa = Math.min(subtotalPaisa, Math.max(0, Math.round(input.discountPaisa)));
  const deliveryFeePaisa = Math.max(0, Math.round(input.deliveryFeePaisa));
  const payableBeforeGiftCard = Math.max(0, subtotalPaisa - discountPaisa) + deliveryFeePaisa;
  const giftCardPaisa = Math.min(
    payableBeforeGiftCard,
    Math.max(0, Math.round(input.giftCardBalancePaisa ?? 0))
  );
  return {
    subtotalPaisa,
    discountPaisa,
    giftCardPaisa,
    deliveryFeePaisa,
    totalPaisa: Math.max(0, payableBeforeGiftCard - giftCardPaisa),
  };
}

/** Refundable amount remaining on an order, in paisa. */
export function computeRefundablePaisa(input: {
  totalPaisa: number;
  refundedPaisa?: number;
}): number {
  return Math.max(0, Math.round(input.totalPaisa) - Math.max(0, input.refundedPaisa ?? 0));
}

/** 1 loyalty point per NPR 100 actually paid, capped so a huge order cannot skew it. */
export function computeLoyaltyPoints(totalPaisa: number): number {
  return Math.min(5000, Math.floor(Math.max(0, totalPaisa) / 10000));
}

/** Default hold for an unpaid online order before its stock is returned to the shelf. */
export const PAYMENT_RESERVATION_MINUTES = 45;

export function reservationExpiryIso(now: Date = new Date(), minutes = PAYMENT_RESERVATION_MINUTES): string {
  return new Date(now.getTime() + minutes * 60_000).toISOString();
}
