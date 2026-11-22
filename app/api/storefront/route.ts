import { NextResponse } from 'next/server';
import { getStore, hydrateStore } from '@/lib/store/repository';

export const dynamic = 'force-dynamic';

export async function GET() {
  await hydrateStore();
  const store = getStore();
  return NextResponse.json({
    settings: store.settings,
    categories: store.categories.filter((c) => c.isActive).sort((a, b) => a.sortOrder - b.sortOrder),
    announcements: store.announcements.filter((a) => a.enabled).sort((a, b) => a.sortOrder - b.sortOrder),
    banners: store.banners.filter((b) => b.enabled).sort((a, b) => a.sortOrder - b.sortOrder),
    homepageSections: store.homepageSections
      .filter((s) => s.enabled)
      .sort((a, b) => a.sortOrder - b.sortOrder),
    shippingZones: store.shippingZones,
    pages: store.pages,
  });
}
