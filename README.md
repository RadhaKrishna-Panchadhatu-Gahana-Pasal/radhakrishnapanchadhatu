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

> `prisma/schema.prisma` and `prisma/seed.ts` describe a planned PostgreSQL model. **They are not wired into the running app** — nothing imports `lib/prisma.ts`. See [Roadmap](#roadmap).

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

The whole shop — catalogue, CMS content, orders, enquiries, reviews, audit log — is one `StoreDatabase` object.

- On start-up the app loads `.data/store.json` if it exists, otherwise it seeds fresh data.
- Every mutation (admin save, checkout, review, enquiry, custom-order lead) writes the file back atomically.
- Override the location with `STORE_DATA_FILE` (absolute or relative path).

**Backing up the shop = copying that one file.** Add it to your backup routine.

### Hosting caveat

This design needs a writable disk. It is fine on a VPS, a local machine, or Docker with a volume. On a read-only/ephemeral filesystem such as **Vercel**, the app still runs but writes fail — it logs one warning and keeps the data in memory, so catalogue edits and orders are lost between requests and deploys. To run on serverless, the Prisma/PostgreSQL layer must be wired first (see Roadmap).

---

## Environment Variables

Required for a production launch:

| Variable | Purpose |
|---|---|
| `AUTH_SECRET` | Signs admin/customer session cookies |
| `ADMIN_PASSCODE` | Admin panel passcode |
| `APP_URL` | Absolute origin used in canonical URLs and metadata |
| `NEXT_PUBLIC_APP_URL` | Same origin, exposed to the browser |
| `STORE_DATA_FILE` | Optional path for the JSON shop database |
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
| Fonepay QR | Live once `FONEPAY_MERCHANT_ID` + `FONEPAY_SECRET_KEY` are set — otherwise **Coming soon** | Sandbox / test |
| eSewa | **Coming soon** (no merchant account yet) | Sandbox / test |
| Khalti | **Coming soon** (no merchant account yet) | Sandbox / test |
| Cash on Delivery | Live, subject to per-province availability | Live |

The shop has a Fonepay merchant account; eSewa and Khalti stay visible at checkout but disabled and labelled "Coming soon" until their onboarding completes. Store-level toggles in `/admin/settings` can switch any method off entirely, and the server rejects any method that is not selectable.

**What "sandbox" means today:** the checkout creates the order with `paymentStatus: INITIATED` and completes a simulated gateway step that posts the outcome to `/api/payments/verify`. No request reaches a provider and no provider signature is verified, so a customer can currently mark their own order paid. That is fine for development and previews only.

Before Fonepay is enabled for real customers:

1. Add the Fonepay merchant credentials to the environment,
2. replace the simulated step with a server-initiated Fonepay payment request,
3. verify Fonepay's response signature server-side before marking an order paid,
4. set `PAYMENTS_ALLOW_LIVE=true`.

Step 4 is deliberately separate: credentials alone never make a method Live, so a half-finished integration cannot start advertising itself to customers.

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

- ⬜ Wire Prisma/PostgreSQL so the shop can run on serverless hosting
- ⬜ Replace the simulated gateway step with server-verified Fonepay requests and callbacks (eSewa and Khalti after onboarding)
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
