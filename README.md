# Radha Krishna Panchha Dhatu — E-Commerce Platform

Premium Panchadhatu and steel jewellery e-commerce platform for a Nepal-based retailer in Butwal, with online ordering, Nepal payment gateways (eSewa, Khalti, Fonepay), WhatsApp ordering, a full CMS admin panel, and PWA support.

![Status](https://img.shields.io/badge/status-development-yellow)
![Framework](https://img.shields.io/badge/framework-Next.js_15-black)
![Language](https://img.shields.io/badge/language-TypeScript-blue)
![Market](https://img.shields.io/badge/market-Nepal-red)

---

## Business Details

| Field | Value |
|---|---|
| Store | Radha Krishna Panchha Dhatu |
| Location | Yogikuti, Santichowk, Tilottama Path, Butwal |
| Phone | +977 984-670-3068 / +977 976-367-8419 |
| Speciality | Panchadhatu & Steel Jewellery |
| Delivery | Throughout Nepal |

---

## Tech Stack

| Area | Technology |
|---|---|
| Framework | Next.js 15 App Router |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Database | PostgreSQL via Prisma |
| Auth | Auth.js (NextAuth v5) |
| Payments | eSewa, Khalti, Fonepay |
| Storage | Cloudflare R2 (S3-compatible) |
| Cache | Upstash Redis |
| Email | Resend |

---

## Getting Started

### Prerequisites

- Node.js LTS (v20+)
- pnpm (`npm install -g pnpm`)
- PostgreSQL database

### Setup

```bash
# 1. Clone the repository
git clone https://github.com/RadhaKrishna-Panchadhatu-Gahana-Pasal/radhakrishnapanchadhatu.git
cd radhakrishnapanchadhatu

# 2. Install dependencies
pnpm install

# 3. Configure environment
cp .env.example .env
# Edit .env with your database URL, auth secret, etc.

# 4. Generate Prisma client
pnpm db:generate

# 5. Run database migrations
pnpm db:migrate

# 6. Seed development data
pnpm db:seed

# 7. Start dev server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) for the storefront.  
Open [http://localhost:3000/admin](http://localhost:3000/admin) for the admin panel.

---

## Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Production build
pnpm start        # Start production server
pnpm lint         # ESLint
pnpm typecheck    # TypeScript check
pnpm test         # Run unit tests
pnpm test:e2e     # Run Playwright end-to-end tests
pnpm db:generate  # Generate Prisma client
pnpm db:migrate   # Run migrations (dev)
pnpm db:deploy    # Run migrations (production)
pnpm db:seed      # Seed development data
pnpm db:studio    # Open Prisma Studio
```

---

## Project Structure

```
src/
├── app/
│   ├── (store)/          # Public storefront pages
│   ├── (auth)/           # Login / register
│   ├── account/          # Customer account pages
│   ├── admin/            # Protected admin panel
│   └── api/              # API routes (payments, webhooks)
├── components/
│   ├── layout/           # Header, footer, announcement bar
│   ├── home/             # Homepage sections
│   └── admin/            # Admin UI components
├── features/
│   └── payments/         # Payment provider adapters (eSewa, Khalti, Fonepay)
├── lib/
│   ├── db/               # Prisma client singleton
│   ├── money/            # Paisa arithmetic helpers
│   ├── env/              # Type-safe env variables
│   └── utils.ts          # Shared utilities
├── types/                # Shared TypeScript types
└── middleware.ts         # Security headers, auth guard
prisma/
├── schema.prisma         # Full database schema
└── seed.ts               # Development seed data
```

---

## Payment Gateways

| Gateway | Status | Notes |
|---|---|---|
| eSewa | Sandbox ready | Requires merchant credentials for production |
| Khalti | Sandbox ready | Requires merchant credentials for production |
| Fonepay | Placeholder | Requires official merchant onboarding and integration docs |

**Important:** Online payments require merchant account approval from each provider. Use sandbox credentials during development. See `.env.example` for required variables.

---

## Development Phases

- **Phase 1** — Foundation & design system ✅ (this scaffold)
- **Phase 2** — CMS & product catalogue
- **Phase 3** — Cart, checkout, orders
- **Phase 4** — Payment integrations
- **Phase 5** — Auth, notifications, accounts
- **Phase 6** — Reviews, PWA, SEO
- **Phase 7** — Production launch

---

## Security Notes

- Never commit `.env` to Git
- Payment provider credentials are server-side only
- Admin routes require role-based authentication
- All totals are calculated server-side — never trust client-submitted prices
- Money is stored as integer paisa to avoid floating-point errors

---

## License

Private — Radha Krishna Panchha Dhatu. All rights reserved.
