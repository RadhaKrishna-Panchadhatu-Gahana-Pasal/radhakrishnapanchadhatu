'use client';

import { useState } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';
import type { Announcement } from '@/lib/store/types';

export function AnnouncementBar({ announcements }: { announcements: Announcement[] }) {
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const active = announcements.find((a) => a.enabled && !dismissedIds.includes(a.id));

  if (!active) return null;

  return (
    <div className="relative border-b border-gold-deep/20 bg-ink text-sand">
      <div className="container-shell flex min-h-[38px] items-center justify-center gap-3 py-1.5 pr-8 text-xs tracking-wide">
        {active.mode === 'SCROLLING' ? (
          <div className="overflow-hidden whitespace-nowrap">
            <div className="animate-marquee gap-12">
              <span>{active.message}</span>
              <span aria-hidden="true">{active.message}</span>
            </div>
          </div>
        ) : (
          <p className="text-center font-medium">
            {active.message}
            {active.linkUrl && active.linkLabel && (
              <>
                {' '}
                <Link
                  href={active.linkUrl}
                  className="ml-1.5 underline decoration-gold/80 underline-offset-4 hover:text-gold"
                >
                  {active.linkLabel}
                </Link>
              </>
            )}
          </p>
        )}

        {active.dismissible && (
          <button
            type="button"
            onClick={() => setDismissedIds((prev) => [...prev, active.id])}
            aria-label="Dismiss announcement"
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-sand/70 transition hover:text-gold-deep"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
