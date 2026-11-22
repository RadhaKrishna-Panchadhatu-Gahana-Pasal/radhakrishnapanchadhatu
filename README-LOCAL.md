# Running the site locally

The laptop had no Node or Bun installed, so both are kept **inside this project** in
`.tools/` (git-ignored, no admin rights or system PATH changes). Nothing else on the
machine was modified.

## One-time setup (already done here)

```bash
mkdir -p .tools
curl -fsSL -o .tools/bun.zip https://github.com/oven-sh/bun/releases/latest/download/bun-windows-x64.zip
unzip -oq .tools/bun.zip -d .tools
# Node 22 LTS portable build (check https://nodejs.org/dist/latest-v22.x/ for the current file name)
curl -fsSL -o .tools/node.zip https://nodejs.org/dist/latest-v22.x/node-v22.23.5-win-x64.zip
unzip -oq .tools/node.zip -d .tools
rm -f .tools/*.zip
./.tools/bun-windows-x64/bun.exe install
```

`bun install` also runs `prisma generate` via the `db:generate` script if the Prisma
client is ever missing.

## Start the preview

```bash
bash scripts/preview.sh
```

Then open **http://localhost:3000**. `Ctrl+C` stops the server. The script reuses
`.tools/`, installs dependencies on first run, and serves with the same Next.js 14
version that Vercel builds.

## Notes

- `.env` (git-ignored) contains the production `DATABASE_URL`, so the local preview
  reads the real catalogue and catalogue edits made in the local `/admin` are written
  to the live database. Preview carefully, or point `DATABASE_URL` at a scratch
  database if you want to experiment freely.
- With `DATABASE_URL` empty the store falls back to `.data/store.json` (local, empty
  on a fresh checkout).
- Local dev output is logged to `.tools/dev.log` when the server is started in the
  background; `scripts/preview.sh` prints to the terminal instead.

## Other useful commands

```bash
export PATH="$PWD/.tools/node-v22.23.5-win-x64:$PWD/.tools/bun-windows-x64:$PATH"
bun run build      # production build (prisma generate + next build), same as Vercel
bun run typecheck  # tsc --noEmit
bun run lint       # next lint
```

## What's new (operational features)

Run the checks:

```bash
bun test tests        # pricing, Fonepay signing, CSV, rate limiting
bun run typecheck
bun run build
```

New optional environment variables (see `.env.example`):

| Variable | Purpose |
| --- | --- |
| `RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_REPLY_TO` | Order/status/abandoned-bag/gift-card email. Silent no-op when unset. |
| `CRON_SECRET` | Protects `/api/cron/maintenance` (Vercel Cron already configured in `vercel.json`). |
| `ERROR_WEBHOOK_URL` | Posts captured errors to Slack/Discord; errors are also stored for `/admin/system`. |
| `ADMIN_PASSCODE` | **Required in production** — sign-in refuses to work without it. |

Admin additions: `/admin/orders` (refunds, cancel, reconcile, packing slip),
`/admin/gift-cards`, `/admin/system` (health, backups, funnel, notification log),
and CSV export/import on `/admin/products`.
