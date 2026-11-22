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

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== 'object' || Array.isArray(body)) return NextResponse.json({ error: 'Invalid product data.' }, { status: 400 });
  if (body.slug !== undefined && (typeof body.slug !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(body.slug))) return NextResponse.json({ error: 'Use lowercase words separated by hyphens for the slug.' }, { status: 400 });
  if (store.products.some((p) => p.id !== product.id && (p.slug === body.slug || p.sku === body.sku))) return NextResponse.json({ error: 'This slug or SKU is already in use.' }, { status: 409 });
  if (body.stockQuantity !== undefined && (!Number.isSafeInteger(body.stockQuantity) || body.stockQuantity < 0)) return NextResponse.json({ error: 'Stock must be a non-negative whole number.' }, { status: 400 });
  if (body.categoryName !== undefined && !store.categories.some((c) => c.name === body.categoryName && (c.isActive || c.id === product.categoryId))) return NextResponse.json({ error: 'Select an available category.' }, { status: 400 });
  const timestamp = nowIso();
  if (typeof body.sku === 'string' && body.sku.trim()) product.sku = body.sku.trim();
  if (typeof body.shortDescription === 'string') product.shortDescription = body.shortDescription;
  if (typeof body.careInstructions === 'string') product.careInstructions = body.careInstructions;
  if (typeof body.deliveryNote === 'string') product.deliveryNote = body.deliveryNote;
  if (['READY_STOCK', 'MADE_TO_ORDER', 'CUSTOM_ORDER'].includes(body.productType)) product.productType = body.productType;

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
      ...product.images.slice(1).map((image) => ({ ...image, isPrimary: false })),
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
