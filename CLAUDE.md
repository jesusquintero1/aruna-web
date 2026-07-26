# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **Read `AGENTS.md` first.** This is a modified Next.js (v16.2.6): APIs and defaults may differ from training data. Consult `node_modules/next/dist/docs/` before writing framework code.

ARÜVIA is an e-commerce store with **two product lines** — Wayuu handbags (La Guajira, Colombia) and makeup — on one site: a public storefront plus a full admin panel (products, orders, POS, supplier purchases, finance, analytics). UI copy and comments are in Spanish; keep new user-facing text and comments in Spanish.

## Commands

```bash
npm run dev            # dev server → http://localhost:3000  (admin at /admin)
npm run build          # production build (run before pushing; deploys go to prod)
npm run lint           # eslint — currently clean; keep it that way
npm run seed:admin     # create admin user (bcrypt) in Supabase — run once, locally, against the live DB
npm run seed:products  # upsert src/data/productos.ts into Supabase — run once, locally
```

There is **no automated test suite.** Before pushing, run `npx tsc --noEmit`, `npm run lint`, and `npm run build`; then verify manually via the flows in `SETUP.md` §5 (create/edit product with images, create order, POS sale decrements stock).

Requires `.env.local` (see `.env.example`). Without `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY` the app runs in **demo mode**: `getSupabase()` returns `null`, data falls back to the hardcoded `src/data/productos.ts`, and writes are no-ops. Note the login rate limiter is fail-closed, so a locally-unconfigured Supabase blocks admin login too.

## Architecture

**Framework:** Next.js App Router. Two route groups under `src/app/`:
- `(store)/` — public storefront (home, catálogo, producto/[id], maquillaje, checkout, legal pages).
- `admin/(panel)/` — authed admin; `admin/login` is outside the group. `admin/(panel)/layout.tsx` guards the panel via `verifySession()`.

**Three-layer server data flow.** Understanding this is essential before touching any write path:

1. **Data modules** — `src/lib/db/*.ts`, all marked `import "server-only"`. Each gets the client via `getSupabase()` (service-role, from `src/lib/supabase/server.ts`) and returns `null`/fallbacks when Supabase is unconfigured.
2. **Server Actions** — `src/lib/db/*-actions.ts` and `src/lib/auth/actions.ts`, marked `"use server"`. These wrap the data modules, call `verifySession()`, validate input with Zod (`src/lib/validation/schemas.ts`), and `revalidatePath(...)`. Forms bind to them via `<form action={...}>`.
3. **Postgres RPCs** — all **stock and money mutations run inside transactional plpgsql functions**, not in JS: `create_order`, `update_order`, `delete_order`, `set_order_status`, `release_order`, `mark_order_paid`, `expire_pending_orders`, `apply_purchase_order`, `update_purchase_order`, `delete_purchase_order`. JS never computes prices or decrements stock directly — it calls `db.rpc(...)`. This keeps stock atomic (no overselling the last unit).

**Stock integrity invariants** (violating these silently corrupts inventory — the hard-won rules):
- Stock is validated and decremented **aggregated by `product_id`** (`sum(cantidad)` grouped), never per line item — two lines of the same product in one order must not each pass the "stock ≥ qty" check independently. Decrements clamp with `greatest(0, stock - qty)`.
- An order "reserves stock" in **any estado except `cancelado`**. Reposition/decrement steps are conditioned on estado: editing/deleting an already-`cancelado` order must **not** restore stock again (it was already restored on cancel), or inventory inflates.
- `set_order_status` is the only status-change path that adjusts stock (activo→cancelado restores, cancelado→activo re-validates+decrements). `updateOrderStatus` calls it — never write a raw `UPDATE orders SET estado`.

**Stock is derived, never a flag.** `products.stock` is the single source of truth; `disponible = stock > 0`. When auditing, the ledger is `sum(purchase_items.cantidad) − sum(order_items.cantidad WHERE order estado in ('pendiente','pagado','enviado'))` — see `supabase/diagnostico-stock.sql`.

**Product model flags** (all on `products`):
- `linea` (`'mochilas' | 'maquillaje'`) — partitions products *and* categories into the two lines. Each has its own admin dashboard (`/admin/mochilas`, `/admin/maquillaje`, shared `LineaDashboard.tsx`) and public catalog (`/catalogo`, `/maquillaje`). Storefront queries always filter by línea. The product detail page hides weaving-specific sections (artisan bio, capacity, dyes) when `linea === 'maquillaje'`.
- `publicado` — draft→published. **New products are created as drafts** (invisible in the store); admin list has an eye-toggle (`togglePublicado`). Every storefront query filters `publicado = true`; admin queries don't.
- `destacado` — drives BOTH the featured grid and the **home hero carousel** (`HomeClient.tsx`: newest published destacados, falling back to static images if none).
- `videos` (text[]) — product videos, uploaded **directly from the browser to Storage** (see Media below).

### Changing the database (RPCs *or* columns) — critical dual-write

Schema and RPC definitions exist in **two places** and both must stay in sync:
- `supabase/schema.sql` — canonical full schema (fresh installs).
- `supabase/migration-*.sql` — incremental, idempotent patches for the **already-deployed** DB.

Changing the DB means: edit `schema.sql`, add a new idempotent `migration-*.sql`, **and apply that migration to the live Supabase DB** (SQL Editor → paste → Run) — a code deploy alone does not change the database, and deployed code that expects a missing column/RPC fails at runtime. Because `create or replace function` only replaces a matching signature, changing a function's parameter list leaves the old overload behind as dead code (see `migration-fix-integridad-stock.sql`, which also drops a legacy `create_order`). Order of operations for a schema+code change: **apply the migration first, then merge the code** — the new code often calls an RPC that must already exist.

### Cross-cutting

- **Auth:** custom username/password. `admin_users` table with bcrypt hashes; session is a JWT (`jose`) signed with `AUTH_SECRET` in an httpOnly cookie (`aruna_admin`). `AUTH_SECRET` is **mandatory in production** — the app fails closed without it (no default secret). See `src/lib/auth/`.
- **Security:** RLS is enabled deny-all on every table; the server only ever uses the service-role key (never the anon key, never a browser client). CSP is enforced in `next.config.ts`. Rate limiting in `src/lib/security/rate-limit.ts` (+ `migration-rate-limit.sql`).
- **Payments:** Mercado Pago Checkout Pro (`src/lib/payments/mercadopago.ts`). Online orders are created `pendiente` (stock reserved immediately); the webhook `api/mercadopago/webhook` re-queries MP and calls `mark_order_paid` (approved) or `release_order` (rejected). The webhook returns **5xx on transient failures** (getPayment null, DB error) so MP retries rather than losing the payment — don't "simplify" it back to always-200. `expire_pending_orders` (pg_cron every 15 min, or `api/cron/expire-orders`) cancels+restocks abandoned `pendiente` **online** carts older than 60 min — POS orders (`channel='pos'`, created `pagado`) are never touched.
- **Order notifications:** `notifyOrderConfirmed(order)` (`src/lib/notify/order.ts`) fans out to **email + web push**, best-effort (each channel is a no-op when unconfigured and never throws). Fired by `createPosSale` (on sale) and the MP webhook (on first transition to paid). Email via Resend (`src/lib/email/send.ts`); push via VAPID/`web-push` (`src/lib/push/send.ts`, subscriptions in the `push_subscriptions` table, `migration-push-subscriptions.sql`). Admins opt in per-device with the dashboard `PushToggle`.
- **PWA:** installable app (no store). `src/app/manifest.ts` + `public/sw.js` (service worker: fetch is intentional passthrough with **no caching** — the store/POS need live data — plus push/notificationclick handlers). `InstallAppButton` in the POS login triggers the native prompt (Android/Chrome) or shows iOS "Add to Home Screen" instructions.
- **Media uploads — two distinct paths, don't mix them up.** *Images*: compressed **in the browser** (`ProductForm.tsx` → canvas, max 2000px, JPEG q0.82 — this is what keeps them under Netlify's ~6 MB request cap) and then travel inside the `saveProduct` Server Action to the `product-images` bucket (`serverActions.bodySizeLimit` raised in `next.config.ts`). *Videos*: too big for any request through Netlify — the browser asks `createVideoUploadUrl` for a **signed upload URL** and PUTs the file straight to Storage; the form only submits the resulting public URL (server re-validates it points at our bucket). CSP has `media-src` for Supabase.
- **Form error contract:** `saveProduct` / `saveInfografia` return `{ error }` consumed via `useActionState` (errors render inline next to the submit button) — they do **not** throw, because thrown Server Action errors are opaque in production. Follow this pattern for new admin forms.
- **Client store pattern:** components that read a browser store (cookie consent, `display-mode: standalone`) subscribe with `useSyncExternalStore`, not `useState`+`useEffect` — the `react-hooks/set-state-in-effect` lint rule is an error here (`AnalyticsScripts.tsx`, `CookieConsent.tsx`, helpers in `src/lib/analytics/config.ts`).
- **Analytics:** GA4 + Meta Pixel, gated behind cookie consent (`AnalyticsScripts.tsx`, `CookieConsent.tsx`); no-op until the `NEXT_PUBLIC_GA_ID`/`NEXT_PUBLIC_FB_PIXEL_ID` env vars are set. **Cart:** client-side `src/context/CartContext.tsx`.
- **Site config / content:** `src/config/site.ts` (WhatsApp, socials, FAQ, legal identity). Admin-editable content lives in the `site_settings` table (key→value; `src/lib/db/settings.ts`) — currently the per-line infographics (`infografia_mochilas`/`infografia_maquillaje`) managed at `/admin/contenido` and rendered at the bottom of each catalog via `InfografiaFooter`.

### Naming: brand vs internal identifiers

The brand is **ARÜVIA** (was ARÜNA; the `Ü` is `U+00DC`). But internal identifiers still use the `aruna` prefix on purpose — changing them would break live sessions/carts. **Do not rename** these: cookie `aruna_admin`, localStorage `aruna_cart`/`aruna_consent`, event `aruna-consent-change`, the Netlify site `aruna-wayuu`, the GitHub repo `aruna-web`, the npm package `aruna-next`, and asset filenames like `aruna_hero.png`. Only user-facing text is ARÜVIA.

## Deploy

Hosted on **Netlify** (`netlify.toml`, `@netlify/plugin-nextjs`), production branch `main`, live at **https://aruvia.com.co** (Cloudflare DNS → Netlify; SSL auto-provisioned). Workflow: branch → PR → **merge to `main` triggers the prod deploy** (all recent history is merged PRs). Env vars live in Netlify, not in the repo (secret values can't be read back via CLI by design). Building/deploying with the Netlify CLI from Windows is broken (adapter path bugs) — always use the remote build (git push / `netlify api createSiteBuild`).

> `README.md` and `SETUP.md` are partly stale (they mention Wompi/Vercel and the old ARÜNA name); the live app uses **Mercado Pago** and **Netlify**. Trust the code and `.env.example` over those docs.
