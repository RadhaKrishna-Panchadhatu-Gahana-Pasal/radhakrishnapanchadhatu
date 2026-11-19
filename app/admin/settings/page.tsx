'use client';

import { useEffect, useState } from 'react';
import { formatNPR, nprFromPaisa } from '@/lib/store/money';
import type {
  AdminAuditLog,
  CustomOrderRequest,
  ShippingZone,
  StoreSettings,
} from '@/lib/store/types';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [zones, setZones] = useState<ShippingZone[]>([]);
  const [customRequests, setCustomRequests] = useState<CustomOrderRequest[]>([]);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([]);
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    fetch('/api/admin/cms')
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) setSettings(data.settings);
        if (Array.isArray(data.shippingZones)) setZones(data.shippingZones);
        if (Array.isArray(data.customOrderRequests)) setCustomRequests(data.customOrderRequests);
        if (Array.isArray(data.auditLogs)) setAuditLogs(data.auditLogs);
      });
  }, []);

  const saveSettings = async () => {
    if (!settings) return;
    setSavedNotice(false);
    const res = await fetch('/api/admin/cms', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resource: 'settings', data: settings }),
    });
    const data = await res.json();
    if (data.settings) {
      setSettings(data.settings);
      setSavedNotice(true);
    }
  };

  const updateZone = async (zone: ShippingZone, feeNpr: number, codAvailable: boolean) => {
    const res = await fetch('/api/admin/cms', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        resource: 'shippingZone',
        data: {
          id: zone.id,
          feeNpr,
          codAvailable,
        },
      }),
    });
    const data = await res.json();
    if (Array.isArray(data.shippingZones)) setZones(data.shippingZones);
  };

  const updateCustomStatus = async (
    id: string,
    status: CustomOrderRequest['status']
  ) => {
    const res = await fetch('/api/admin/cms', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        resource: 'customOrderRequest',
        data: { id, status },
      }),
    });
    const data = await res.json();
    if (Array.isArray(data.customOrderRequests)) setCustomRequests(data.customOrderRequests);
  };

  if (!settings) {
    return <div className="card p-8 text-sm text-muted">Loading store settings...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-deep">
          Configuration
        </p>
        <h1 className="section-title mt-2">Store Settings, Shipping &amp; Audit Logs</h1>
      </div>

      {/* Store Business & Payment Controls */}
      <div className="card space-y-5 p-6">
        <h2 className="font-serif text-2xl font-semibold text-ink">Business &amp; Payment Settings</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-xs font-medium text-ink">
            Store Name
            <input
              value={settings.storeName}
              onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
              className="mt-1 w-full rounded-xl border border-line bg-[#FAF8F4] px-3 py-2 text-sm outline-none focus:border-gold"
            />
          </label>
          <label className="text-xs font-medium text-ink">
            Phone Number
            <input
              value={settings.phone}
              onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
              className="mt-1 w-full rounded-xl border border-line bg-[#FAF8F4] px-3 py-2 text-sm outline-none focus:border-gold"
            />
          </label>
          <label className="text-xs font-medium text-ink">
            WhatsApp Digits (country code included)
            <input
              value={settings.whatsappDigits}
              onChange={(e) => setSettings({ ...settings, whatsappDigits: e.target.value })}
              className="mt-1 w-full rounded-xl border border-line bg-[#FAF8F4] px-3 py-2 text-sm outline-none focus:border-gold"
            />
          </label>
          <label className="text-xs font-medium text-ink">
            Business Email
            <input
              value={settings.email}
              onChange={(e) => setSettings({ ...settings, email: e.target.value })}
              className="mt-1 w-full rounded-xl border border-line bg-[#FAF8F4] px-3 py-2 text-sm outline-none focus:border-gold"
            />
          </label>
          <label className="text-xs font-medium text-ink">
            Showroom Address
            <input
              value={settings.address}
              onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              className="mt-1 w-full rounded-xl border border-line bg-[#FAF8F4] px-3 py-2 text-sm outline-none focus:border-gold"
            />
          </label>
          <label className="text-xs font-medium text-ink">
            Opening Hours
            <input
              value={settings.openingHours}
              onChange={(e) => setSettings({ ...settings, openingHours: e.target.value })}
              className="mt-1 w-full rounded-xl border border-line bg-[#FAF8F4] px-3 py-2 text-sm outline-none focus:border-gold"
            />
          </label>
        </div>

        <div className="flex flex-wrap gap-5 pt-2 text-xs font-medium text-ink">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.esewaEnabled}
              onChange={(e) => setSettings({ ...settings, esewaEnabled: e.target.checked })}
              className="h-4 w-4 accent-gold"
            />
            eSewa
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.khaltiEnabled}
              onChange={(e) => setSettings({ ...settings, khaltiEnabled: e.target.checked })}
              className="h-4 w-4 accent-gold"
            />
            Khalti
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.fonepayEnabled}
              onChange={(e) => setSettings({ ...settings, fonepayEnabled: e.target.checked })}
              className="h-4 w-4 accent-gold"
            />
            Fonepay
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.codEnabled}
              onChange={(e) => setSettings({ ...settings, codEnabled: e.target.checked })}
              className="h-4 w-4 accent-gold"
            />
            Cash on Delivery
          </label>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-success">{savedNotice ? 'Settings updated.' : ''}</span>
          <button
            type="button"
            onClick={saveSettings}
            className="rounded-full bg-gold px-6 py-2.5 text-xs font-medium text-white hover:bg-gold-deep"
          >
            Save Store Settings
          </button>
        </div>
      </div>

      {/* 7-Province Nepal Shipping Zones */}
      <div className="card p-6">
        <h2 className="font-serif text-2xl font-semibold text-ink">Nepal Province Delivery Rules</h2>
        <div className="mt-4 divide-y divide-line text-sm">
          {zones.map((zone) => (
            <div key={zone.id} className="flex flex-wrap items-center justify-between gap-4 py-3">
              <div>
                <p className="font-semibold text-ink">{zone.province}</p>
                <p className="text-xs text-muted">
                  ETA: {zone.estimatedDays} &middot; Free above{' '}
                  <span className="tabular-nums">{formatNPR(zone.freeThresholdPaisa)}</span>
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span>
                  Fee:{' '}
                  <strong className="tabular-nums">NPR {nprFromPaisa(zone.feePaisa)}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => updateZone(zone, nprFromPaisa(zone.feePaisa), !zone.codAvailable)}
                  className={`rounded-full px-3 py-1 font-medium ${
                    zone.codAvailable
                      ? 'bg-success/15 text-success'
                      : 'bg-sand text-muted'
                  }`}
                >
                  COD: {zone.codAvailable ? 'Enabled' : 'Disabled'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Order Design Leads */}
      <div className="card p-6">
        <h2 className="font-serif text-2xl font-semibold text-ink">
          Custom Design Requests ({customRequests.length})
        </h2>
        {customRequests.length === 0 ? (
          <p className="mt-3 text-sm text-muted">No bespoke custom design leads submitted yet.</p>
        ) : (
          <div className="mt-4 divide-y divide-line text-sm">
            {customRequests.map((req) => (
              <div key={req.id} className="flex flex-wrap items-start justify-between gap-4 py-3">
                <div>
                  <p className="font-semibold text-ink">
                    {req.referenceCode} &middot; {req.customerName} ({req.customerPhone})
                  </p>
                  <p className="text-xs text-muted">
                    Material: {req.preferredMaterial}
                    {req.budgetNote ? ` · Budget: ${req.budgetNote}` : ''}
                  </p>
                  <p className="mt-1 text-xs text-ink">{req.description}</p>
                </div>
                <select
                  value={req.status}
                  onChange={(e) =>
                    updateCustomStatus(req.id, e.target.value as CustomOrderRequest['status'])
                  }
                  className="rounded-lg border border-line bg-[#FAF8F4] px-2.5 py-1.5 text-xs"
                >
                  <option value="NEW">NEW</option>
                  <option value="REVIEWING">REVIEWING</option>
                  <option value="QUOTED">QUOTED</option>
                  <option value="CLOSED">CLOSED</option>
                </select>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Audit Log */}
      <div className="card p-6">
        <h2 className="font-serif text-2xl font-semibold text-ink">Admin Audit Trail</h2>
        <div className="mt-4 divide-y divide-line text-xs">
          {auditLogs.slice(0, 15).map((log) => (
            <div key={log.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
              <div>
                <span className="font-semibold text-ink">{log.action}</span> &middot;{' '}
                <span className="text-muted">{log.summary}</span>
              </div>
              <span className="text-muted">
                {log.actor} ({log.role}) &middot; {new Date(log.createdAt).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
