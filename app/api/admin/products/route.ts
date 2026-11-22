import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAdminSession } from '@/lib/store/auth';
import { appendAuditLog, getStore, nowIso, uid } from '@/lib/store/repository';
import { paisaFromNPR } from '@/lib/store/money';

export const dynamic = 'force-dynamic';

const ProductCreateSchema = z.object({
  name: z.string().min(2).max(160),
  slug: z.string().min(2).max(160),
  sku: z.string().min(2).max(64).optional(),
  categoryName: z.string().min(2).max(120),
  material: z.string().min(2).max(80),
  priceNpr: z.union([z.string(), z.number()]).optional(),
  compareAtNpr: z.union([z.string(), z.number()]).optional(),
  stockQuantity: z.number().int().min(0),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']),
  productType: z.enum(['READY_STOCK', 'MADE_TO_ORDER', 'CUSTOM_ORDER']).default('READY_STOCK'),
  isFeatured: z.boolean().default(false),
  isNewArrival: z.boolean().default(false),
  shortDescription: z.string().max(400).optional(),
  description: z.string().max(4000).optional(),
  careInstructions: z.string().max(600).optional(),
  deliveryNote: z.string().max(400).optional(),
  imageUrl: z.string().max(500).optional(),
});

export async function GET() {
  const session = getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const store = getStore();
  return NextResponse.json({
    products: store.products,
    categories: store.categories,
    inventoryMovements: store.inventoryMovements,
  });
}

export async function POST(req: NextRequest) {
  const session = getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const parsed = ProductCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid product fields.' }, { status: 400 });
    }

    const store = getStore();
    const cleanSlug = parsed.data.slug
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, '-');

    if (store.products.some((p) => p.slug === cleanSlug)) {
      return NextResponse.json({ error: 'A product with this slug already exists.' }, { status: 409 });
    }

    const cat = store.categories.find(
      (c) => c.name.toLowerCase() === parsed.data.categoryName.toLowerCase()
    );
    if (!cat?.isActive) return NextResponse.json({ error: 'Select an active category.' }, { status: 400 });
    if (parsed.data.sku && store.products.some((p) => p.sku === parsed.data.sku?.trim())) return NextResponse.json({ error: 'This SKU already exists.' }, { status: 409 });
    const pricePaisa =
      parsed.data.priceNpr !== undefined && String(parsed.data.priceNpr).trim() !== ''
        ? paisaFromNPR(parsed.data.priceNpr)
        : null;
    const compareAtPaisa =
      parsed.data.compareAtNpr !== undefined && String(parsed.data.compareAtNpr).trim() !== ''
        ? paisaFromNPR(parsed.data.compareAtNpr)
        : null;

    const timestamp = nowIso();
    const product = {
      id: uid('prod'),
      name: parsed.data.name.trim(),
      slug: cleanSlug,
      sku: parsed.data.sku?.trim() || `RKP-${Date.now().toString().slice(-6)}`,
      shortDescription:
        parsed.data.shortDescription?.trim() ||
        `${parsed.data.material} piece crafted for the ${parsed.data.categoryName} collection.`,
      description:
        parsed.data.description?.trim() ||
        'Managed in Radhakrishna Panchadhatu CMS.',
      material: parsed.data.material,
      categoryId: cat?.id ?? 'cat-panchadhatu',
      categoryName: cat?.name ?? parsed.data.categoryName,
      pricePaisa,
      compareAtPaisa,
      stockQuantity: parsed.data.stockQuantity,
      lowStockThreshold: 4,
      productType: parsed.data.productType,
      careInstructions: parsed.data.careInstructions?.trim() || 'Wipe with a soft dry cloth.',
      deliveryNote: parsed.data.deliveryNote?.trim() || 'Dispatched from Butwal across Nepal.',
      tags: [parsed.data.material.toLowerCase(), parsed.data.categoryName.toLowerCase()],
      images: [
        {
          id: uid('img'),
          url: parsed.data.imageUrl?.trim() || '/images/product-necklace.jpg',
          alt: parsed.data.name.trim(),
          isPrimary: true,
        },
      ],
      variants: [],
      isFeatured: parsed.data.isFeatured,
      isNewArrival: parsed.data.isNewArrival,
      isBestSeller: false,
      status: parsed.data.status,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    store.products.unshift(product);
    if (product.stockQuantity > 0) {
      store.inventoryMovements.unshift({
        id: uid('mov'),
        productId: product.id,
        productName: product.name,
        quantityDelta: product.stockQuantity,
        reason: 'Initial product creation',
        actorName: session.name,
        createdAt: timestamp,
      });
    }

    appendAuditLog({
      actor: session.name,
      role: session.role,
      action: 'PRODUCT_CREATED',
      entityType: 'Product',
      entityId: product.id,
      summary: `Created product "${product.name}" (${product.status}).`,
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Unable to create product.' }, { status: 500 });
  }
}
