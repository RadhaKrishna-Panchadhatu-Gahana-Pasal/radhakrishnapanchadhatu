import { notFound } from 'next/navigation';
import { OrderTrackerClient } from '@/components/store/order-tracker-client';
import { getStore, toPublicTrackingView } from '@/lib/store/repository';

export const dynamic = 'force-dynamic';

export default function TrackOrderTokenPage({ params }: { params: { token: string } }) {
  const order = getStore().orders.find((o) => o.trackingToken === params.token);
  if (!order) {
    notFound();
  }

  return <OrderTrackerClient initialOrder={toPublicTrackingView(order)} />;
}
