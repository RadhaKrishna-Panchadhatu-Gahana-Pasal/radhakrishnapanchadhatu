# Firestore Security Specification

## Data Invariants
1. Only verified admins (`isAdmin()`) may create, update, or delete catalog items (`products`, `categories`, `banners`, `announcements`, `homepageSections`, `pages`, `settings`, `shippingZones`, `coupons`, `inventoryMovements`).
2. Public visitors may read `PUBLISHED` products, active categories, enabled banners/announcements/sections, public pages, and store settings, but NEVER `DRAFT` or `ARCHIVED` products.
3. Customer PII (`users/{userId}/private/*`) is strictly isolated to `request.auth.uid == userId` or `isAdmin()`.
4. Orders (`orders/{orderId}`) are readable/listable ONLY by `isAdmin()` or the owning authenticated user (`resource.data.userId == request.auth.uid`). Public tracking uses `/orderTracking/{trackingToken}` which prohibits `list` queries and excludes street addresses/emails.
5. Reviews (`reviews/{reviewId}`) may only be created by an authenticated customer whose referenced order exists, belongs to `request.auth.uid`, and has `fulfilmentStatus == 'DELIVERED'`, with initial `status == 'PENDING'`.
6. Admin audit logs (`adminAuditLogs/{logId}`) are append-only for admins (`allow update, delete: if false`).

## Dirty Dozen Adversarial Payloads (All Must Fail with PERMISSION_DENIED)
1. Unauthenticated write to `/products/prod-1` (shadow product creation).
2. Non-admin authenticated user attempting `create` or `update` on `/settings/store` (`codEnabled: false`).
3. Non-admin user creating `/admins/{uid}` to escalate privileges.
4. Authenticated user reading `/users/other-uid/private/profile` (PII leak).
5. Unauthenticated `list` query on `/orders` or `/orderTracking` (order scraping).
6. Authenticated user creating `/orders/ord-1` with `userId: "victim-uid"` (identity spoofing).
7. Authenticated user creating `/orders/ord-1` with `paymentStatus: "PAID"` directly on create (state shortcutting).
8. Authenticated user updating `/orders/ord-1` `totalPaisa` or `fulfilmentStatus: "DELIVERED"`.
9. Authenticated user submitting a review with `status: "APPROVED"` (bypassing moderation).
10. Authenticated user submitting a review referencing an undelivered (`PROCESSING`) order.
11. Injecting a 2000-character document ID on `/products/{longId}` (ID poisoning).
12. Updating or deleting an existing `/adminAuditLogs/{logId}` entry (audit tampering).
