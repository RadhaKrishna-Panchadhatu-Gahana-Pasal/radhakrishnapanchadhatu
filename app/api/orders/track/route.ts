import { NextRequest, NextResponse } from 'next/server';
import { getStore, hydrateStore, toPublicTrackingView } from '@/lib/store/repository';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token')?.trim();
  const orderNumber = searchParams.get('orderNumber')?.trim().toUpperCase();
  const phone = searchParams.get('phone')?.replace(/\D/g, '') ?? '';

  await hydrateStore();
  const store = getStore();

  if (token) {
    const order = store.orders.find((o) => o.trackingToken === token);
    if (!order) {
      return NextResponse.json({ error: 'Tracking token not found.' }, { status: 404 });
    }
    return NextResponse.json({ order: toPublicTrackingView(order) });
  }

  if (orderNumber && phone.length >= 7) {
    const order = store.orders.find(
      (o) =>
        o.orderNumber.toUpperCase() === orderNumber &&
        o.customerPhone.replace(/\D/g, '').endsWith(phone.slice(-7))
    );
    if (!order) {
      return NextResponse.json(
        { error: 'No matching order found for that order number and phone.' },
        { status: 404 }
      );
    }
    return NextResponse.json({ order: toPublicTrackingView(order) });
  }

  return NextResponse.json(
    { error: 'Provide a tracking token or order number with phone number.' },
    { status: 400 }
  );
}
