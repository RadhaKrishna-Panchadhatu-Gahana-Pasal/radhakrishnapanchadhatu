import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/store/auth';
import { appendAuditLog, getStore, nowIso, uid } from '@/lib/store/repository';
import { paisaFromNPR } from '@/lib/store/money';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const store = getStore();
  return NextResponse.json({
    settings: store.settings,
    banners: store.banners,
    announcements: store.announcements,
    homepageSections: store.homepageSections,
    pages: store.pages,
    shippingZones: store.shippingZones,
    coupons: store.coupons,
    reviews: store.reviews,
    customOrderRequests: store.customOrderRequests,
    contactEnquiries: store.contactEnquiries,
    mediaAssets: store.mediaAssets,
    auditLogs: store.auditLogs,
    inventoryMovements: store.inventoryMovements,
  });
}

export async function PATCH(req: NextRequest) {
  const session = getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const store = getStore();

  switch (body.resource) {
    case 'settings': {
      store.settings = { ...store.settings, ...body.data };
      appendAuditLog({
        actor: session.name,
        role: session.role,
        action: 'SETTINGS_UPDATED',
        entityType: 'StoreSettings',
        entityId: 'store',
        summary: 'Updated store configuration and payment/delivery settings.',
      });
      return NextResponse.json({ settings: store.settings });
    }
    case 'banner': {
      const idx = store.banners.findIndex((b) => b.id === body.data.id);
      if (idx >= 0) {
        store.banners[idx] = { ...store.banners[idx], ...body.data };
      } else {
        store.banners.push({ ...body.data, id: uid('ban') });
      }
      appendAuditLog({
        actor: session.name,
        role: session.role,
        action: 'BANNER_SAVED',
        entityType: 'Banner',
        entityId: body.data.id || 'new',
        summary: `Updated banner "${body.data.title}".`,
      });
      return NextResponse.json({ banners: store.banners });
    }
    case 'announcement': {
      const idx = store.announcements.findIndex((a) => a.id === body.data.id);
      if (idx >= 0) {
        store.announcements[idx] = { ...store.announcements[idx], ...body.data };
      } else {
        store.announcements.push({ ...body.data, id: uid('ann') });
      }
      appendAuditLog({
        actor: session.name,
        role: session.role,
        action: 'ANNOUNCEMENT_SAVED',
        entityType: 'Announcement',
        entityId: body.data.id || 'new',
        summary: `Updated announcement bar message.`,
      });
      return NextResponse.json({ announcements: store.announcements });
    }
    case 'homepageSection': {
      const idx = store.homepageSections.findIndex((s) => s.id === body.data.id);
      if (idx >= 0) {
        store.homepageSections[idx] = { ...store.homepageSections[idx], ...body.data };
      }
      appendAuditLog({
        actor: session.name,
        role: session.role,
        action: 'HOMEPAGE_SECTION_UPDATED',
        entityType: 'HomepageSection',
        entityId: body.data.id,
        summary: `Updated homepage section "${body.data.title}".`,
      });
      return NextResponse.json({ homepageSections: store.homepageSections });
    }
    case 'page': {
      const { slug, title, summary, content } = body.data ?? {};
      const page = store.pages.find((p) => p.slug === slug);
      if (!page) return NextResponse.json({ error: 'Page not found.' }, { status: 404 });
      if (typeof title !== 'string' || !title.trim() || title.length > 200 ||
          typeof summary !== 'string' || summary.length > 2000 ||
          typeof content !== 'string' || !content.trim() || content.length > 50000) {
        return NextResponse.json({ error: 'Check the title, summary and body length before saving.' }, { status: 400 });
      }
      Object.assign(page, { title: title.trim(), summary: summary.trim(), content: content.trim(), updatedAt: nowIso() });
      appendAuditLog({
        actor: session.name,
        role: session.role,
        action: 'PAGE_UPDATED',
        entityType: 'ContentPage',
        entityId: body.data.slug,
        summary: `Updated content page "/${body.data.slug}".`,
      });
      return NextResponse.json({ pages: store.pages });
    }
    case 'shippingZone': {
      const idx = store.shippingZones.findIndex((z) => z.id === body.data.id);
      if (idx >= 0) {
        store.shippingZones[idx] = {
          ...store.shippingZones[idx],
          feePaisa:
            body.data.feeNpr !== undefined
              ? paisaFromNPR(body.data.feeNpr)
              : store.shippingZones[idx].feePaisa,
          freeThresholdPaisa:
            body.data.freeThresholdNpr !== undefined
              ? paisaFromNPR(body.data.freeThresholdNpr)
              : store.shippingZones[idx].freeThresholdPaisa,
          estimatedDays: body.data.estimatedDays ?? store.shippingZones[idx].estimatedDays,
          codAvailable:
            body.data.codAvailable !== undefined
              ? body.data.codAvailable
              : store.shippingZones[idx].codAvailable,
        };
      }
      return NextResponse.json({ shippingZones: store.shippingZones });
    }
    case 'review': {
      const rev = store.reviews.find((r) => r.id === body.data.id);
      if (rev) {
        if (body.data.status) rev.status = body.data.status;
        if (body.data.adminReply !== undefined) rev.adminReply = body.data.adminReply;
        appendAuditLog({
          actor: session.name,
          role: session.role,
          action: 'REVIEW_MODERATED',
          entityType: 'Review',
          entityId: rev.id,
          summary: `Set review ${rev.id} status to ${rev.status}.`,
        });
      }
      return NextResponse.json({ reviews: store.reviews });
    }
    case 'customOrderRequest': {
      const reqItem = store.customOrderRequests.find((r) => r.id === body.data.id);
      if (reqItem && body.data.status) {
        reqItem.status = body.data.status;
      }
      return NextResponse.json({ customOrderRequests: store.customOrderRequests });
    }
    case 'media': {
      const asset = {
        id: uid('med'),
        title: String(body.data.title || 'Uploaded Media'),
        url: String(body.data.url || '/images/product-necklace.jpg'),
        alt: String(body.data.alt || 'Jewellery photo'),
        category: (body.data.category || 'PRODUCT') as 'PRODUCT' | 'BANNER' | 'EDITORIAL' | 'CATEGORY',
        createdAt: nowIso(),
      };
      store.mediaAssets.unshift(asset);
      return NextResponse.json({ mediaAssets: store.mediaAssets });
    }
    default:
      return NextResponse.json({ error: 'Unknown CMS resource.' }, { status: 400 });
  }
}
