import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/store/admin-guard';
import { getStore, hydrateStore } from '@/lib/store/repository';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function esc(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function npr(paisa: number): string {
  return `NPR ${(paisa / 100).toLocaleString('en-NP', { maximumFractionDigits: 2 })}`;
}

/**
 * Printable packing slip (no prices shown to the courier, COD amount separate).
 * Opens in a new tab and calls window.print() automatically.
 */
export async function GET(req: NextRequest) {
  const guard = requireAdmin();
  if (!guard.ok) return guard.response;

  const orderId = new URL(req.url).searchParams.get('orderId');
  if (!orderId) return NextResponse.json({ error: 'orderId is required' }, { status: 400 });

  await hydrateStore();
  const store = getStore();
  const order = store.orders.find((entry) => entry.id === orderId);
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

  const a = order.address;
  const rows = order.items
    .map(
      (item, index) => `<tr>
        <td>${index + 1}</td>
        <td><strong>${esc(item.productName)}</strong><br /><span class="muted">${esc(item.sku)}${
          item.variantLabel ? ` · ${esc(item.variantLabel)}` : ''
        }</span></td>
        <td class="center">${item.quantity}</td>
      </tr>`
    )
    .join('');

  const html = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8" />
<title>Packing slip ${esc(order.orderNumber)}</title>
<style>
  @page { size: A5; margin: 12mm; }
  * { box-sizing: border-box; }
  body { font-family: -apple-system, "Segoe UI", Helvetica, Arial, sans-serif; color:#1b1917; margin:0; }
  .head { display:flex; justify-content:space-between; align-items:flex-start; border-bottom:2px solid #a07c3c; padding-bottom:10px; }
  .brand { font-family: Georgia, serif; font-size:20px; font-weight:600; }
  .brand small { display:block; font-family: inherit; font-size:10px; letter-spacing:.18em; text-transform:uppercase; color:#6b6152; margin-top:3px; }
  h1 { font-size:15px; margin:0 0 4px; }
  .muted { color:#6b6152; font-size:11px; }
  .grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; margin:14px 0; font-size:12px; line-height:1.5; }
  table { width:100%; border-collapse:collapse; font-size:12px; }
  th { text-align:left; font-size:10px; text-transform:uppercase; letter-spacing:.1em; color:#6b6152; border-bottom:1px solid #e3ded2; padding:6px 4px; }
  td { padding:7px 4px; border-bottom:1px solid #e3ded2; vertical-align:top; }
  .center { text-align:center; }
  .cod { margin-top:14px; border:1px dashed #a07c3c; border-radius:8px; padding:10px; font-size:13px; display:flex; justify-content:space-between; }
  .note { margin-top:12px; font-size:11px; color:#6b6152; }
  .sign { margin-top:22px; display:flex; gap:30px; font-size:11px; color:#6b6152; }
  .sign div { flex:1; border-top:1px solid #1b1917; padding-top:5px; }
  @media print { .noprint { display:none; } }
</style></head><body onload="window.print()">
  <div class="head">
    <div class="brand">${esc(store.settings.storeName)}<small>Packing slip</small></div>
    <div style="text-align:right;font-size:12px;line-height:1.5;">
      <strong>${esc(order.orderNumber)}</strong><br />
      <span class="muted">${new Date(order.createdAt).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })}</span><br />
      <span class="muted">${esc(order.paymentMethod)} · ${esc(order.paymentStatus)}</span>
    </div>
  </div>

  <div class="grid">
    <div>
      <div class="muted">Deliver to</div>
      <strong>${esc(a.fullName)}</strong><br />
      ${esc(a.phone)}<br />
      ${esc(a.street)}, Ward ${esc(a.ward)}<br />
      ${esc(a.municipality)}, ${esc(a.district)}<br />
      ${esc(a.province)}
      ${a.landmark ? `<br /><span class="muted">Landmark: ${esc(a.landmark)}</span>` : ''}
    </div>
    <div>
      <div class="muted">From</div>
      <strong>${esc(store.settings.storeName)}</strong><br />
      ${esc(store.settings.address)}<br />
      ${esc(store.settings.cityLine)}<br />
      ${esc(store.settings.phone)}
      ${
        order.courierName || order.trackingReference
          ? `<div class="muted" style="margin-top:8px;">Courier: ${esc(order.courierName || '—')}<br />Ref: ${esc(
              order.trackingReference || '—'
            )}</div>`
          : ''
      }
    </div>
  </div>

  <table>
    <thead><tr><th>#</th><th>Item</th><th class="center">Qty</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>

  ${
    order.paymentMethod === 'COD'
      ? `<div class="cod"><span>Collect from customer (COD)</span><strong>${npr(order.totalPaisa)}</strong></div>`
      : '<p class="note">Prepaid online — do not collect cash.</p>'
  }

  ${a.deliveryInstructions ? `<p class="note"><strong>Instructions:</strong> ${esc(a.deliveryInstructions)}</p>` : ''}
  <p class="note">Check the piece for damage before sealing. Exchanges within 7 days of delivery with this slip.</p>

  <div class="sign"><div>Packed by</div><div>Courier signature</div></div>
  <p class="noprint" style="margin-top:18px;font-size:11px;color:#6b6152;">Use your browser's Print dialog to save as PDF.</p>
</body></html>`;

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}
