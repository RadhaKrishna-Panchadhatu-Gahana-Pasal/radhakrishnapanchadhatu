import { describe, expect, test } from 'bun:test';
import {
  computeCouponDiscount,
  computeLoyaltyPoints,
  computeOrderTotals,
  computeRefundablePaisa,
  evaluateCoupon,
  reservationExpiryIso,
} from '../lib/store/pricing';
import type { Coupon } from '../lib/store/types';

const percentCoupon: Coupon = {
  id: 'c1',
  code: 'WELCOME10',
  discountType: 'PERCENT',
  value: 10,
  minOrderPaisa: 250000,
  active: true,
  usageCount: 0,
};

const flatCoupon: Coupon = {
  id: 'c2',
  code: 'FESTIVE500',
  discountType: 'FLAT_PAISA',
  value: 50000,
  minOrderPaisa: 400000,
  active: true,
  usageCount: 0,
};

describe('coupon maths', () => {
  test('percentage discount rounds to the nearest paisa', () => {
    expect(computeCouponDiscount(percentCoupon, 420000)).toBe(42000);
    expect(computeCouponDiscount(percentCoupon, 333333)).toBe(33333);
  });

  test('flat discount never exceeds the subtotal', () => {
    expect(computeCouponDiscount(flatCoupon, 400000)).toBe(50000);
    expect(computeCouponDiscount({ ...flatCoupon, minOrderPaisa: 0 }, 30000)).toBe(30000);
  });

  test('inactive coupons and unmet minimums give no discount', () => {
    expect(computeCouponDiscount({ ...percentCoupon, active: false }, 500000)).toBe(0);
    expect(computeCouponDiscount(percentCoupon, 100000)).toBe(0);
  });

  test('evaluateCoupon explains why a code failed', () => {
    expect(evaluateCoupon(undefined, 500000, 'nope').ok).toBe(false);
    expect(evaluateCoupon(percentCoupon, 100000, 'welcome10').message).toContain('minimum');
    const applied = evaluateCoupon(percentCoupon, 500000, ' welcome10 ');
    expect(applied.ok).toBe(true);
    expect(applied.discountPaisa).toBe(50000);
  });
});

describe('order totals', () => {
  test('delivery is added after the discount', () => {
    const totals = computeOrderTotals({
      subtotalPaisa: 420000,
      discountPaisa: 42000,
      deliveryFeePaisa: 15000,
    });
    expect(totals.totalPaisa).toBe(393000);
  });

  test('a gift card only pays what is owed, and never below zero', () => {
    const partial = computeOrderTotals({
      subtotalPaisa: 420000,
      discountPaisa: 42000,
      deliveryFeePaisa: 15000,
      giftCardBalancePaisa: 100000,
    });
    expect(partial.giftCardPaisa).toBe(100000);
    expect(partial.totalPaisa).toBe(293000);

    const excess = computeOrderTotals({
      subtotalPaisa: 100000,
      discountPaisa: 0,
      deliveryFeePaisa: 10000,
      giftCardBalancePaisa: 500000,
    });
    expect(excess.giftCardPaisa).toBe(110000);
    expect(excess.totalPaisa).toBe(0);
  });

  test('discount cannot make the subtotal negative', () => {
    const totals = computeOrderTotals({
      subtotalPaisa: 10000,
      discountPaisa: 999999,
      deliveryFeePaisa: 0,
    });
    expect(totals.discountPaisa).toBe(10000);
    expect(totals.totalPaisa).toBe(0);
  });

  test('rounds fractional paisa instead of leaking floats', () => {
    const totals = computeOrderTotals({
      subtotalPaisa: 1000.6,
      discountPaisa: 0,
      deliveryFeePaisa: 0,
    });
    expect(totals.subtotalPaisa).toBe(1001);
    expect(Number.isInteger(totals.totalPaisa)).toBe(true);
  });
});

describe('refunds and loyalty', () => {
  test('refundable balance shrinks with each refund', () => {
    expect(computeRefundablePaisa({ totalPaisa: 420000, refundedPaisa: 20000 })).toBe(400000);
    expect(computeRefundablePaisa({ totalPaisa: 420000, refundedPaisa: 420000 })).toBe(0);
    expect(computeRefundablePaisa({ totalPaisa: 420000, refundedPaisa: 500000 })).toBe(0);
  });

  test('loyalty gives one point per NPR 100 and caps runaway orders', () => {
    expect(computeLoyaltyPoints(420000)).toBe(42);
    expect(computeLoyaltyPoints(0)).toBe(0);
    expect(computeLoyaltyPoints(99)).toBe(0);
    expect(computeLoyaltyPoints(100_000_000)).toBe(5000);
  });
});

describe('reservation window', () => {
  test('expires at the configured hold window', () => {
    const now = new Date('2026-11-22T00:00:00.000Z');
    expect(reservationExpiryIso(now, 45)).toBe('2026-11-22T00:45:00.000Z');
    expect(reservationExpiryIso(now)).toBe('2026-11-22T00:45:00.000Z');
  });
});
