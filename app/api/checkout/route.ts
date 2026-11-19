import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { calculateDeliveryFee, createServerOrder, getStore } from '@/lib/store/repository';

const CheckoutSchema = z.object({
  address: z.object({
    fullName: z.string().min(2).max(120),
    phone: z.string().min(7).max(25),
    email: z.string().email().optional().or(z.literal('')),
    province: z.string().min(2).max(80),
    district: z.string().min(2).max(80),
    municipality: z.string().min(2).max(120),
    ward: z.string().min(1).max(20),
    street: z.string().min(2).max(160),
    landmark: z.string().max(160).optional(),
    deliveryInstructions: z.string().max(400).optional(),
  }),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        variantId: z.string().optional(),
        quantity: z.number().int().min(1).max(25),
      })
    )
    .min(1),
  paymentMethod: z.enum(['ESEWA', 'KHALTI', 'FONEPAY', 'COD']),
  couponCode: z.string().max(40).optional(),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const province = searchParams.get('province') || 'Lumbini Province';
  const subtotalPaisa = Number(searchParams.get('subtotalPaisa') || '0');
  const couponCode = (searchParams.get('couponCode') || '').trim().toUpperCase();

  const store = getStore();
  let discountPaisa = 0;
  let couponMessage: string | null = null;

  if (couponCode) {
    const coupon = store.coupons.find((c) => c.code.toUpperCase() === couponCode && c.active);
    if (!coupon) {
      couponMessage = 'Coupon code is invalid or inactive.';
    } else if (subtotalPaisa < coupon.minOrderPaisa) {
      couponMessage = `Minimum order of NPR ${(coupon.minOrderPaisa / 100).toLocaleString()} required for ${coupon.code}.`;
    } else {
      discountPaisa =
        coupon.discountType === 'PERCENT'
          ? Math.round((subtotalPaisa * coupon.value) / 100)
          : Math.min(coupon.value, subtotalPaisa);
      couponMessage = `Applied ${coupon.code}`;
    }
  }

  const { feePaisa, zone } = calculateDeliveryFee(
    province,
    Math.max(0, subtotalPaisa - discountPaisa)
  );

  return NextResponse.json({
    discountPaisa,
    deliveryFeePaisa: feePaisa,
    estimatedDays: zone?.estimatedDays ?? '2–5 business days',
    codAvailable: store.settings.codEnabled && (zone ? zone.codAvailable : true),
    couponMessage,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = CheckoutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Please complete all required delivery and payment fields.' },
        { status: 400 }
      );
    }

    const result = createServerOrder({
      address: {
        ...parsed.data.address,
        email: parsed.data.address.email || undefined,
      },
      items: parsed.data.items,
      paymentMethod: parsed.data.paymentMethod,
      couponCode: parsed.data.couponCode,
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      orderNumber: result.order.orderNumber,
      trackingToken: result.order.trackingToken,
      paymentMethod: result.order.paymentMethod,
      paymentStatus: result.order.paymentStatus,
      totalPaisa: result.order.totalPaisa,
      providerReference: result.order.payment.providerReference,
    });
  } catch {
    return NextResponse.json({ error: 'Unable to process checkout.' }, { status: 500 });
  }
}
