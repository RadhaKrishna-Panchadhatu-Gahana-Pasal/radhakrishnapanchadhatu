import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/store/admin-guard';
import { csvToObjects, parseCsv } from '@/lib/store/csv';
import { reportError } from '@/lib/observability/errors';
import { importProducts, type ProductImportRow } from '@/lib/store/operations';
import { flushStore, hydrateStore } from '@/lib/store/repository';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_BYTES = 2 * 1024 * 1024;

function number(value: string | undefined): number {
  const parsed = Number((value ?? '').replace(/[,\s]/g, ''));
  return Number.isFinite(parsed) ? parsed : NaN;
}

/**
 * Bulk product import. Accepts a CSV body (text/csv) or JSON `{ csv, dryRun }`.
 * Rows are matched by SKU: existing products are updated, new SKUs are created
 * as DRAFT so nothing goes live by accident.
 */
export async function POST(req: NextRequest) {
  const guard = requireAdmin(['OWNER', 'MANAGER']);
  if (!guard.ok) return guard.response;

  try {
    const contentType = req.headers.get('content-type') || '';
    let csv = '';
    let dryRun = false;

    if (contentType.includes('application/json')) {
      const body = (await req.json()) as { csv?: string; dryRun?: boolean };
      csv = body.csv ?? '';
      dryRun = Boolean(body.dryRun);
    } else {
      csv = await req.text();
    }

    if (!csv.trim()) {
      return NextResponse.json({ error: 'Upload a CSV file or paste CSV text.' }, { status: 400 });
    }
    if (csv.length > MAX_BYTES) {
      return NextResponse.json({ error: 'CSV is too large (max 2 MB).' }, { status: 413 });
    }

    const records = csvToObjects(csv);
    if (records.length === 0) {
      return NextResponse.json({ error: 'No data rows found in the CSV.' }, { status: 400 });
    }
    if (records.length > 500) {
      return NextResponse.json({ error: 'Import at most 500 rows at a time.' }, { status: 413 });
    }

    const rows: ProductImportRow[] = records.map((record) => ({
      sku: record.sku ?? '',
      name: record.name ?? '',
      categorySlug: record.category_slug || undefined,
      material: record.material || undefined,
      priceNpr: number(record.price_npr),
      compareAtNpr: record.compare_at_npr ? number(record.compare_at_npr) : undefined,
      stock: number(record.stock) || 0,
      status: ['DRAFT', 'PUBLISHED', 'ARCHIVED'].includes((record.status || '').toUpperCase())
        ? (record.status.toUpperCase() as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED')
        : 'DRAFT',
      shortDescription: record.short_description || undefined,
    }));

    if (dryRun) {
      return NextResponse.json({
        dryRun: true,
        rows: rows.length,
        preview: rows.slice(0, 10),
        wouldSkip: rows.filter((row) => !row.sku || !row.name || !Number.isFinite(row.priceNpr)).length,
      });
    }

    await hydrateStore();
    const result = importProducts(rows, guard.session.name);
    await flushStore();

    return NextResponse.json({ ...result, rows: records.length, parseColumns: parseCsv(csv)[0] });
  } catch (error) {
    reportError('admin.products.import', error, { path: '/api/admin/products/import' });
    return NextResponse.json({ error: 'Could not import the CSV.' }, { status: 500 });
  }
}
