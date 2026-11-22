'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, Star, XCircle } from 'lucide-react';
import type { Review } from '@/lib/store/types';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch('/api/admin/cms')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.reviews)) setReviews(data.reviews);
      });
  }, []);

  const moderateReview = async (
    rev: Review,
    status: 'APPROVED' | 'REJECTED' | 'PENDING'
  ) => {
    const res = await fetch('/api/admin/cms', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        resource: 'review',
        data: {
          id: rev.id,
          status,
          adminReply: replyDrafts[rev.id] ?? rev.adminReply,
        },
      }),
    });
    const data = await res.json();
    if (Array.isArray(data.reviews)) setReviews(data.reviews);
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-deep">
          Moderation
        </p>
        <h1 className="section-title mt-2">Verified Customer Reviews ({reviews.length})</h1>
      </div>

      <div className="space-y-4">
        {reviews.map((rev) => (
          <div key={rev.id} className="card space-y-3 p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-serif text-xl font-semibold text-ink">{rev.productName}</p>
                <p className="text-xs text-muted">
                  {rev.customerName} &middot; Order {rev.orderNumber} &middot;{' '}
                  {rev.verifiedPurchase ? 'Verified Purchase' : 'Unverified'}
                </p>
              </div>
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-gold-deep">
                {rev.status}
              </span>
            </div>

            <div className="flex items-center gap-1 text-gold">
              {Array.from({ length: rev.rating }).map((_, idx) => (
                <Star key={idx} className="h-4 w-4 fill-gold" />
              ))}
            </div>

            <p className="text-sm font-semibold text-ink">{rev.title}</p>
            <p className="text-sm text-muted">{rev.content}</p>

            <input
              value={replyDrafts[rev.id] ?? rev.adminReply ?? ''}
              onChange={(e) =>
                setReplyDrafts((prev) => ({ ...prev, [rev.id]: e.target.value }))
              }
              placeholder="Optional official store reply..."
              className="w-full rounded-xl border border-line bg-field px-3 py-2 text-xs outline-none focus:border-gold"
            />

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => moderateReview(rev, 'APPROVED')}
                className="inline-flex items-center gap-1.5 rounded-full bg-success px-4 py-1.5 text-xs font-medium text-white"
              >
                <CheckCircle2 className="h-3.5 w-3.5" /> Approve &amp; Publish
              </button>
              <button
                type="button"
                onClick={() => moderateReview(rev, 'REJECTED')}
                className="inline-flex items-center gap-1.5 rounded-full border border-line px-4 py-1.5 text-xs font-medium text-danger hover:border-danger"
              >
                <XCircle className="h-3.5 w-3.5" /> Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
