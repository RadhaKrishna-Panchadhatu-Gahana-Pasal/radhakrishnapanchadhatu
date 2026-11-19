import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAdminSession } from '@/lib/store/auth';
import { appendAuditLog, getStore, uid } from '@/lib/store/repository';

export const dynamic = 'force-dynamic';

const CategorySchema = z.object({
  name: z.string().min(2).max(120),
  slug: z.string().min(2).max(120),
  description: z.string().max(1000).optional(),
  imageUrl: z.string().max(500).optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(10),
});

export async function GET() {
  const session = getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const store = getStore();
  return NextResponse.json({
    categories: [...store.categories].sort((a, b) => a.sortOrder - b.sortOrder),
  });
}

export async function POST(req: NextRequest) {
  const session = getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const parsed = CategorySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid category payload.' }, { status: 400 });
  }

  const store = getStore();
  const cleanSlug = parsed.data.slug.trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-');
  if (store.categories.some((c) => c.slug === cleanSlug)) {
    return NextResponse.json({ error: 'Category slug already exists.' }, { status: 409 });
  }

  const category = {
    id: uid('cat'),
    name: parsed.data.name.trim(),
    slug: cleanSlug,
    description: parsed.data.description?.trim() || '',
    imageUrl: parsed.data.imageUrl?.trim() || '/images/product-necklace.jpg',
    isActive: parsed.data.isActive,
    sortOrder: parsed.data.sortOrder,
  };
  store.categories.push(category);

  appendAuditLog({
    actor: session.name,
    role: session.role,
    action: 'CATEGORY_CREATED',
    entityType: 'Category',
    entityId: category.id,
    summary: `Created category "${category.name}".`,
  });

  return NextResponse.json({ category }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const session = getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const store = getStore();
  const cat = store.categories.find((c) => c.id === body.id);
  if (!cat) return NextResponse.json({ error: 'Category not found' }, { status: 404 });

  if (typeof body.isActive === 'boolean') cat.isActive = body.isActive;
  if (typeof body.sortOrder === 'number') cat.sortOrder = body.sortOrder;
  if (typeof body.name === 'string' && body.name.trim()) cat.name = body.name.trim();
  if (typeof body.description === 'string') cat.description = body.description;

  appendAuditLog({
    actor: session.name,
    role: session.role,
    action: 'CATEGORY_UPDATED',
    entityType: 'Category',
    entityId: cat.id,
    summary: `Updated category "${cat.name}".`,
  });

  return NextResponse.json({ category: cat });
}

export async function DELETE(req: NextRequest) {
  const session = getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const store = getStore();

  if (store.products.some((p) => p.categoryId === id && p.status !== 'ARCHIVED')) {
    return NextResponse.json(
      { error: 'Cannot delete a category that still has active products. Reassign or archive products first.' },
      { status: 400 }
    );
  }

  store.categories = store.categories.filter((c) => c.id !== id);
  return NextResponse.json({ deleted: true });
}
