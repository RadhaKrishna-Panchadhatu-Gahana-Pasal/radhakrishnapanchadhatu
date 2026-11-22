'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import { formatNPR } from '@/lib/store/money';
import type { MonthlySpendingPoint, SpendingSeriesSummary } from '@/lib/store/order-history';

interface TooltipPayloadItem {
  payload?: MonthlySpendingPoint;
  value?: number;
}

function CustomSpendingTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
}) {
  if (!active || !payload || payload.length === 0 || !payload[0]?.payload) {
    return null;
  }

  const point = payload[0].payload;

  return (
    <div className="rounded-xl border border-line bg-surface px-3.5 py-2.5 shadow-soft">
      <p className="font-serif text-base font-semibold text-ink">{point.fullMonthLabel}</p>
      <p className="mt-1 text-sm font-semibold text-gold-deep tabular-nums">
        {formatNPR(point.spendPaisa)}
      </p>
      <p className="mt-0.5 text-xs text-muted tabular-nums">
        {point.orderCount} {point.orderCount === 1 ? 'order' : 'orders'}
      </p>
    </div>
  );
}

function formatYAxisNpr(value: number): string {
  if (value === 0) return 'NPR 0';
  if (value >= 1000) {
    const k = value / 1000;
    return `NPR ${Number.isInteger(k) ? k : k.toFixed(1)}k`;
  }
  return `NPR ${value}`;
}

export function SpendingChart({
  summary,
  loading,
}: {
  summary: SpendingSeriesSummary;
  loading?: boolean;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section aria-labelledby="spending-chart-heading" className="card p-6 sm:p-8">
      <div className="flex flex-col gap-6 border-b border-line pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-deep">
            Spending Analytics
          </p>
          <h2 id="spending-chart-heading" className="mt-1.5 font-serif text-2xl font-semibold text-ink sm:text-3xl">
            Order Spending Over the Last 6 Months
          </h2>
          <p className="mt-1 text-sm text-muted">
            Monthly purchase totals in NPR across your synced and linked orders.
          </p>
        </div>

        <dl className="grid grid-cols-3 gap-5 sm:gap-7">
          <div>
            <dt className="text-xs text-muted">6-Month Total</dt>
            <dd className="mt-0.5 text-base font-semibold text-ink tabular-nums">
              {formatNPR(summary.totalSpentPaisa)}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Monthly Avg</dt>
            <dd className="mt-0.5 text-base font-semibold text-ink tabular-nums">
              {formatNPR(summary.averageMonthlyPaisa)}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Orders</dt>
            <dd className="mt-0.5 text-base font-semibold text-gold-deep tabular-nums">
              {summary.totalOrders}
            </dd>
          </div>
        </dl>
      </div>

      <div className="mt-6 h-72 w-full min-w-0">
        {loading || !mounted ? (
          <div className="flex h-full items-center justify-center rounded-xl bg-sand/60 text-sm text-muted">
            Loading 6-month spending chart...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={288} minWidth={0}>
            <LineChart
              data={summary.series}
              margin={{ top: 12, right: 16, left: 8, bottom: 4 }}
            >
              <CartesianGrid vertical={false} stroke="#E9E5DC" strokeDasharray="3 3" />
              <XAxis
                dataKey="monthLabel"
                tickLine={false}
                axisLine={{ stroke: '#E9E5DC' }}
                tick={{ fill: '#77736B', fontSize: 12 }}
                dy={8}
              />
              <YAxis
                tickFormatter={formatYAxisNpr}
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#77736B', fontSize: 12 }}
                width={72}
                allowDecimals={false}
                domain={[0, (dataMax: number) => (dataMax > 0 ? Math.ceil(dataMax * 1.15) : 5000)]}
              />
              <Tooltip
                content={<CustomSpendingTooltip />}
                cursor={{ stroke: '#B08A45', strokeWidth: 1, strokeDasharray: '4 4' }}
              />
              <Line
                type="monotone"
                dataKey="spendNpr"
                name="Order Spend"
                stroke="#B08A45"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#FFFFFF', stroke: '#80612F', strokeWidth: 2 }}
                activeDot={{ r: 6, fill: '#B08A45', stroke: '#FFFFFF', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {!loading && summary.totalOrders === 0 && (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4 text-xs text-muted">
          <p className="inline-flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-gold-deep" />
            <span>
              No orders recorded in the last 6 months yet. Link an order below or browse our collection to begin.
            </span>
          </p>
          <Link href="/catalog" className="font-semibold text-gold-deep hover:underline">
            Browse Jewellery &rarr;
          </Link>
        </div>
      )}
    </section>
  );
}
