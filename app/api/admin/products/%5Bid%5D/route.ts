import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/store/auth';
import { appendAuditLog, getStore, nowIso, uid } from '@/lib/store/repository';
import { paisaFromNPR } from '@/lib/store/money';

export const dynamic = 'force-dynamic';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const store = getStore();
  const product = store.products.find((p) => p.id === params.id || p.slug === params.id);
  if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

  const body = await req.json();
  const timestamp = nowIso();

  if (typeof body.name === 'string' && body.name.trim()) product.name = body.name.trim();
  if (typeof body.slug === 'string' && body.slug.trim()) product.slug = body.slug.trim();
  if (typeof body.material === 'string') product.material = body.material;
  if (typeof body.categoryName === 'string') {
    const cat = store.categories.find(
      (c) => c.name.toLowerCase() === body.categoryName.toLowerCase()
    );
    product.categoryName = cat?.name ?? body.categoryName;
    if (cat) product.categoryId = cat.id;
  }
  if (body.priceNpr !== undefined) {
    product.pricePaisa = String(body.priceNpr).trim() === '' ? null : paisaFromNPR(body.priceNpr);
  }
  if (body.compareAtNpr !== undefined) {
    product.compareAtPaisa =
      String(body.compareAtNpr).trim() === '' ? null : paisaFromNPR(body.compareAtNpr);
  }
  if (typeof body.stockQuantity === 'number' && Number.isFinite(body.stockQuantity)) {
    const delta = body.stockQuantity - product.stockQuantity;
    product.stockQuantity = Math.max(0, Math.round(body.stockQuantity));
    if (delta !== 0) {
      store.inventoryMovements.unshift({
        id: uid('mov'),
        productId: product.id,
        productName: product.name,
        quantityDelta: delta,
        reason: typeof body.stockReason === 'string' && body.stockReason ? body.stockReason : 'Admin stock adjustment',
        actorName: session.name,
        createdAt: timestamp,
      });
    }
  }
  if (body.status === 'DRAFT' || body.status === 'PUBLISHED' || body.status === 'ARCHIVED') {
    product.status = body.status;
  }
  if (typeof body.isFeatured === 'boolean') product.isFeatured = body.isFeatured;
  if (typeof body.isNewArrival === 'boolean') product.isNewArrival = body.isNewArrival;
  if (typeof body.description === 'string') product.description = body.description;
  if (typeof body.imageUrl === 'string' && body.imageUrl.trim()) {
    product.images = [
      { id: product.images[0]?.id ?? uid('img'), url: body.imageUrl.trim(), alt: product.name, isPrimary: true },
    ];
  }
  product.updatedAt = timestamp;

  appendAuditLog({
    actor: session.name,
    role: session.role,
    action: 'PRODUCT_UPDATED',
    entityType: 'Product',
    entityId: product.id,
    summary: `Updated "${product.name}" (Stock: ${product.stockQuantity}, Status: ${product.status}).`,
  });

  return NextResponse.json({ product });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const store = getStore();
  const product = store.products.find((p) => p.id === params.id);
  if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

  // Archive rather than hard delete so historical orders keep references intact
  product.status = 'ARCHIVED';
  product.updatedAt = nowIso();

  appendAuditLog({
    actor: session.name,
    role: session.role,
    action: 'PRODUCT_ARCHIVED',
    entityType: 'Product',
    entityId: product.id,
    summary: `Archived product "${product.name}".`,
  });

  return NextResponse.json({ product });
}
