# Radha Krishna Panchha Dhatu — E-Commerce Platform

Premium Panchadhatu and steel jewellery storefront for a Nepal-based retailer in Butwal, with a CMS-driven admin panel, online ordering, order tracking, verified reviews, WhatsApp ordering, and PWA support.

![Status](https://img.shields.io/badge/status-internal--preview-yellow)
![Framework](https://img.shields.io/badge/framework-Next.js_14-black)
![Language](https://img.shields.io/badge/language-TypeScript-blue)
![Market](https://img.shields.io/badge/market-Nepal-red)

---

## Business Details

| Field | Value |
|---|---|
| Store | Radha Krishna Panchha Dhatu |
| Location | 3 Tilottama Path, Yogikuti (500m west of Yogikuti Chowk), Butwal 32907 |
| Phone | +977 984-670-3068 / +977 976-367-8419 |
| Speciality | Panchadhatu & Steel Jewellery |
| Delivery | Throughout Nepal |

---

## Tech Stack

| Area | Technology |
|---|---|
| Framework | Next.js 14.2 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Data | JSON document store on disk (`.data/store.json`) |
| Admin auth | HMAC-signed cookie session + admin allowlist + passcode |
| Customer sign-in | Firebase Auth (optional; only if `NEXT_PUBLIC_FIREBASE_*` is configured) |
| Maps | Google Maps JS API (optional) |
| PWA | Web manifest + service worker + offline indicator |

> The app stores CMS content and orders as one JSONB snapshot via Prisma (`lib/store/postgres.ts`). `prisma/schema.prisma` also contains a fully normalised model and `prisma/seed.ts`, which are not used at runtime — the snapshot keeps the existing synchronous domain intact. See [Roadmap](#roadmap).

---

## Requirements

- Node.js 20 or newer
- Bun 1.2+ (`bun.lock` is the committed lockfile) — or npm/pnpm if you prefer

---

## Setup

```bash
# 1. Install dependencies
bun install

# 2. Configure environment
cp .env.example .env
# Edit .env — see Environment Variables below

# 3. Start the dev server
bun run dev
```

Storefront: <http://localhost:3000>
Admin panel: <http://localhost:3000/admin>

The app boots with a seeded catalogue (6 products, 6 categories, CMS pages, shipping zones, 2 coupons) and one delivered sample order — `RKP-2026-1001` — so the tracking and verified-review flows can be tested immediately.

---

## Admin Access

Sign in at `/admin/login` with an email on the allowlist **and** your `ADMIN_PASSCODE`.

Two settings matter here:

- `ADMIN_PASSCODE` — if unset, the code falls back to `RKP-ADMIN-2026`. **Always set it in production.**
- `AUTH_SECRET` — signs the admin and customer session cookies. If unset it falls back to a development string. **Always set it in production.**

The allowlist lives in `app/api/admin/auth/route.ts` (`ALLOWED_ADMINS`). Add or remove staff emails there; each entry carries a role (`OWNER`, `MANAGER`, `ORDER_STAFF`, `CONTENT_EDITOR`, `REVIEWER`).

---

## What the CMS Controls

| Admin page | Manages |
|---|---|
| `/admin/products` | Products, prices, stock, images, publish state |
| `/admin/categories` | Categories, slugs, ordering |
| `/admin/orders` | Fulfilment status, courier + tracking reference, notes |
| `/admin/inventory` | Stock levels and movement history |
| `/admin/homepage` | Homepage sections and their order |
| `/admin/banners` | Hero and promo banners |
| `/admin/announcements` | Announcement bar messages |
| `/admin/pages` | About, FAQ, shipping, returns, terms, privacy, cookies |
| `/admin/reviews` | Approve, reject, reply to verified reviews |
| `/admin/media` | Media library entries |
| `/admin/settings` | Store details, payment toggles, shipping zones, coupons |

Every admin write is recorded in the audit log (`/admin` dashboard) with actor, role and timestamp.

---

## Data & Persistence

The whole shop — catalogue, CMS content, orders, enquiries, reviews, audit log — is one `StoreDatabase` object, stored as a single JSONB row (`store_state`) in Postgres or as `.data/store.json` locally.

- **With `DATABASE_URL` set** (production, and any serverless host): the snapshot is read from Postgres once per server start and written back after every mutation. `lib/store/postgres.ts` creates the `store_state` table on first use, so there is no migration step.
- **Without `DATABASE_URL`** (plain local development): `.data/store.json` is loaded and rewritten atomically — override the path with `STORE_DATA_FILE`.
- Reads are synchronous from an in-memory cache; `hydrateStore()` fills it from `app/layout.tsx` (every page) and from the store-touching API routes before they read or write.
- Mutating API routes `await flushStore()` before responding, so a serverless instance is never frozen between a change and its save.
- If Postgres is configured but unreachable the app keeps serving seed data and **blocks writes**, rather than overwriting live orders with seed data.

**Backing up the shop** = backing up the `store_state` row (or copying the JSON file when running file-backed).

### Free Postgres setup (Vercel)

1. Create a free database on Neon or Supabase.
2. Copy the **pooled** connection string and set it as `DATABASE_URL` in Vercel → Settings → Environment Variables (Production and Preview). It should look like `postgresql://user:pass@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require&pgbouncer=true`.
3. Redeploy. The first request creates `store_state` and writes the current seed/JSON snapshot into it.

A JSONB snapshot is intentionally simple and keeps the whole domain synchronous. It is last-write-wins across concurrent instances, which is fine for one shop with a handful of admins and orders — a normalised order table would be the next step if write contention ever matters.

---

## Environment Variables

Required for a production launch:

| Variable | Purpose |
|---|---|
| `AUTH_SECRET` | Signs admin/customer session cookies |
| `ADMIN_PASSCODE` | Admin panel passcode |
| `APP_URL` | Absolute origin used in canonical URLs and metadata |
| `NEXT_PUBLIC_APP_URL` | Same origin, exposed to the browser |
| `DATABASE_URL` | Postgres connection string — required for persistence on Vercel; blank locally to use the JSON file |
| `STORE_DATA_FILE` | Optional path for the local JSON shop database (file mode only) |
| `UPLOADS_DIR` | Optional path for images uploaded from the admin panel |
| `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID` | Free-tier WhatsApp Cloud API order notifications (no paid SMS needed) |

Optional integrations (each degrades gracefully when unset):

- Firebase client SDK — `NEXT_PUBLIC_FIREBASE_API_KEY`, `_AUTH_DOMAIN`, `_PROJECT_ID`, `_STORAGE_BUCKET`, `_MESSAGING_SENDER_ID`, `_APP_ID`, `_DATABASE_ID`, `_MEASUREMENT_ID` (enables Google sign-in, account page and wishlist sync)
- Google Maps — `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`, `GOOGLE_MAPS_API_KEY` (address autocomplete, store map)
- Email — `RESEND_API_KEY`, `EMAIL_FROM`
- SMS / WhatsApp — `SMS_*`, `WHATSAPP_*`
- Object storage — `STORAGE_*`
- Analytics — `NEXT_PUBLIC_GA_ID`, `SENTRY_DSN`

Payment gateway credentials (`ESEWA_*`, `KHALTI_*`, `FONEPAY_*`) are reserved but not yet consumed — see below.

---

## Payments

Which methods appear at checkout depends on the environment (`lib/payments/availability.ts`):

| Method | Production | Local dev / preview |
|---|---|---|
| Fonepay QR | Live once `FONEPAY_MERCHANT_ID` + `FONEPAY_SECRET_KEY` are set and `PAYMENTS_ALLOW_LIVE=true` — otherwise **Coming soon** | Sandbox, requires the same credentials; without them the option is disabled |
| eSewa | **Coming soon** (no merchant account yet) | Sandbox / test |
| Khalti | **Coming soon** (no merchant account yet) | Sandbox / test |
| Cash on Delivery | Live, subject to per-province availability | Live |

The shop has a Fonepay merchant account; eSewa and Khalti stay visible at checkout but disabled and labelled "Coming soon" until their onboarding completes. Store-level toggles in `/admin/settings` can switch any method off entirely, and the server rejects any method that is not selectable.

### Fonepay (real gateway)

`lib/payments/fonepay.ts` implements the clientapi redirect flow:

1. Checkout creates the order with `paymentStatus: INITIATED` and the API returns a signed payment URL (`PID,MD,PRN,AMT,CRN,DT,R1,R2,RU` hashed with HMAC-SHA512). The browser is sent to Fonepay's hosted page.
2. Fonepay redirects the shopper to `/api/payments/fonepay/callback` with `PRN`/`BID`/`UID`. Those parameters are treated as *a pointer*, never as proof of payment.
3. The callback calls Fonepay's `verificationMerchant` endpoint server-to-server (`PID,AMT,PRN,BID,UID` signature), compares the returned amount with the stored order total, and only then marks the order `PAID` (with the Fonepay UID kept as `gatewayReference`).
4. Repeated callbacks and refreshed tabs are idempotent; failed or unverifiable payments leave the order `INITIATED`/`FAILED` and redirect to the tracking page.

`FONEPAY_ENV=sandbox` uses `https://dev-clientapi.fonepay.com`, `FONEPAY_ENV=production` uses `https://clientapi.fonepay.com`. The return URL must be publicly reachable, so for local testing set `FONEPAY_RETURN_URL` to a tunnel.

`/api/payments/verify` still exists only for eSewa/Khalti **sandbox** settlement: it is disabled in production and refuses Fonepay orders outright. Cash on Delivery works end to end today, including per-province availability.

Cash on Delivery works end to end today, including per-province availability.

---

## Image Uploads

Admins can add images two ways from `/admin/media`:

- **From this device** — `POST /api/admin/media/upload` accepts JPG, PNG, WebP, GIF or AVIF up to 5 MB, stores the file under `UPLOADS_DIR` (default `.data/uploads`) and serves it from `/api/media/<file>`.
- **From the web** — paste an existing site path or external URL and register it.

Product, category and banner forms accept the resulting `/api/media/...` URL. Device uploads need a writable disk, so they work on a VPS or local machine but not on Vercel; there, use an external image URL.

## Order Tracking & Reviews

- Customers track orders at `/track-order` with order number + phone, or via the tokenised link `/track-order/<token>` issued at checkout.
- Only the tokenised view is shareable; it excludes street address and email.
- Reviews require a delivered order: order number + checkout phone, then moderation before they appear.

---

## Project Structure

```
app/
├── (public pages)        page.tsx, catalog, product/[slug], categories/[slug],
│                         cart, checkout, wishlist, search, new-arrivals,
│                         custom-order, contact, track-order, account
├── admin/                CMS panel (products, orders, inventory, homepage,
│                         banners, announcements, pages, reviews, media, settings)
├── api/                  checkout, payments/verify, orders/track, products,
│                         reviews, contact, custom-order-requests,
│                         storefront, admin/*
├── layout.tsx            Root layout, fonts, announcement bar, header, footer
├── sitemap.ts / robots.ts / manifest.ts
components/
├── admin/                Admin shell, forms, editors
├── layout/               Header, footer, cart drawer, search, cookie banner
├── store/                Catalog, product detail, checkout, tracking, CMS view
├── providers/            Cart, wishlist, auth, PWA, cookie state
lib/
├── store/repository.ts   StoreDatabase, seed data, all domain mutations
├── store/persistence.ts  Atomic JSON read/write
├── store/auth.ts         Signed session cookies
├── store/money.ts        Paisa arithmetic
├── firebase/             Optional client config + auth helpers
├── seo/metadata.ts       Canonical/OG metadata helpers
└── prisma.ts             Unused Prisma singleton (planned migration)
prisma/                   Planned schema + seed (not used by the app)
public/                   Images, icons, service worker
```

---

## Scripts

```bash
bun run dev         # Development server on :3000
bun run build       # prisma generate && next build
bun run start       # Production server
bun run lint        # ESLint
bun run typecheck   # tsc --noEmit
```

`prisma/seed.ts` is included for the planned database but is not wired to a script yet (it needs `tsx` or `ts-node` as a dev dependency).

---

## Roadmap

Done:

- ✅ Storefront, catalogue, product detail, search, filtered catalog
- ✅ Cart, checkout, COD + simulated online payment, coupons, province shipping zones
- ✅ Orders: tracking, timeline, admin fulfilment, courier reference
- ✅ CMS: products, categories, homepage, banners, announcements, pages, media, settings
- ✅ Reviews with verified-purchase moderation, custom-order leads, contact enquiries
- ✅ PWA, SEO metadata, sitemap, robots, cookie consent
- ✅ JSON persistence, audit log

Remaining:

- ✅ Postgres persistence (`store_state` JSONB snapshot) for Vercel, with the local JSON file kept for development
- ✅ Server-verified Fonepay redirect + callback (eSewa and Khalti still sandbox-only after their onboarding)
- ✅ WhatsApp order notifications wired; add approved message templates for customers who have not messaged the shop first
- ⬜ Migrate admin auth to Auth.js with per-user roles (currently allowlist + passcode)
- ⬜ Email/SMS/WhatsApp order notifications
- ⬜ Object storage uploads for product and banner images
- ⬜ Automated tests (no test runner is configured)
- ⬜ Production launch: real domain, credentials, backups, monitoring

---

## Security Notes

- Never commit `.env` or `.data/` — both are gitignored
- `ADMIN_PASSCODE`, `AUTH_SECRET` and payment credentials are server-side only
- All totals are recalculated server-side; client-submitted prices are ignored
- Money is stored as integer paisa to avoid floating-point errors
- Admin API routes reject unauthenticated requests (401)
- Customer-facing order tracking never exposes street address or email

---

## License

Private — Radha Krishna Panchha Dhatu. All rights reserved.
