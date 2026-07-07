# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

> **Read `AGENTS.md` first.** This is a modified Next.js (v16.2.6): APIs and defaults may differ from training data. Consult `node_modules/next/dist/docs/` before writing framework code.

ARÜNA is an e-commerce store with **two product lines** — Wayuu handbags (La Guajira, Colombia) and makeup — on one site: a public storefront plus a full admin panel (products, orders, POS, supplier purchases, finance, analytics). UI copy and comments are in Spanish; keep new user-facing text and comments in Spanish.

## Commands

```bash
npm run dev            # dev server → http://localhost:3000  (admin at /admin)
npm run build          # production build (run before pushing; deploys go to prod)
npm run lint           # eslint
npm run seed:admin     # create admin user (bcrypt) in Supabase — run once, locally, against the live DB
npm run seed:products  # upsert src/data/productos.ts into Supabase — run once, locally
```

There is **no automated test suite**. Verify changes manually via the flows in `SETUP.md` §5 (create/edit product with images, create order, POS sale decrements stock).

`npm run lint` currently fails on `main` with 3 pre-existing errors + 1 warning (`AnalyticsScripts`, `CookieConsent`, `CountUp`, `HomeClient` — `react-hooks/set-state-in-effect` / `exhaustive-deps`). Don't let them block unrelated work; just don't add new ones.

Requires `.env.local` (see `.env.example`). Without `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY` the app runs in **demo mode**: `getSupabase()` returns `null`, data falls back to the hardcoded `src/data/productos.ts`, and writes are no-ops.

## Architecture

**Framework:** Next.js App Router. Two route groups under `src/app/`:
- `(store)/` — public storefront (home, catálogo, producto/[id], checkout, legal pages).
- `admin/(panel)/` — authed admin; `admin/login` is outside the group. `admin/(panel)/layout.tsx` guards the panel via `verifySession()`.

**Three-layer server data flow.** Understanding this is essential before touching any write path:

1. **Data modules** — `src/lib/db/*.ts`, all marked `import "server-only"`. Each gets the client via `getSupabase()` (service-role, from `src/lib/supabase/server.ts`) and returns `null`/fallbacks when Supabase is unconfigured.
2. **Server Actions** — `src/lib/db/*-actions.ts` and `src/lib/auth/actions.ts`, marked `"use server"`. These wrap the data modules, call `verifySession()`, validate input with Zod (`src/lib/validation/schemas.ts`), and `revalidatePath(...)`. Forms bind to them via `<form action={...}>`.
3. **Postgres RPCs** — all **stock and money mutations run inside transactional plpgsql functions**, not in JS. `create_order`, `update_order`, `delete_order`, `release_order`, `mark_order_paid`, `expire_pending_orders`, `apply_purchase_order`, `update_purchase_order`, `delete_purchase_order`. JS never computes prices or decrements stock directly — it calls `db.rpc(...)`. This keeps stock atomic (no overselling the last unit).

**Stock is derived, never a flag.** `products.stock` is the single source of truth; `disponible = stock > 0`. Sales decrement it (`create_order`), supplier purchases increment it (`apply_purchase_order`), cancellations/expirations restore it. When auditing stock, the ledger is `sum(purchase_items.cantidad) − sum(order_items.cantidad WHERE order estado in ('pendiente','pagado','enviado'))` — see `supabase/diagnostico-stock.sql`.

**Product model flags** (all on `products`):
- `linea` (`'mochilas' | 'maquillaje'`) — partitions products *and* categories into the two lines. Each line has its own admin dashboard (`/admin/mochilas`, `/admin/maquillaje`, shared `LineaDashboard.tsx`) and its own public catalog (`/catalogo`, `/maquillaje`). Storefront queries always filter by línea; the general admin dashboard shows a per-line breakdown. Products detail page hides weaving-specific sections (artisan bio, capacity, dyes) when `linea === 'maquillaje'`.
- `publicado` — draft→published. **New products are created as drafts** (invisible in the store); the admin list has an eye-toggle (`togglePublicado`) and the form a checkbox. Every storefront query filters `publicado = true`; admin queries don't.
- `destacado` — drives BOTH the featured grid and the **home hero carousel** (`HomeClient.tsx`: 5 newest published destacados, falling back to 3 static images if none).
- `videos` (text[]) — product videos, uploaded **directly from the browser to Storage** (see Media below).

### Changing the database (RPCs *or* columns) — critical dual-write

Schema and RPC definitions exist in **two places** and both must stay in sync:
- `supabase/schema.sql` — canonical full schema (fresh installs).
- `supabase/migration-*.sql` — incremental, idempotent patches for the **already-deployed** DB.

Changing the DB means: edit `schema.sql`, add a new idempotent `migration-*.sql` (e.g. `migration-maquillaje-publicar-videos.sql`), **and apply that migration to the live Supabase DB** (SQL Editor → paste → Run) — a code deploy alone does not change the database, and deployed code that expects a missing column fails at runtime. Watch for the asymmetric-clamp bug class: revert steps must mirror apply steps exactly, or edits inflate stock (`migration-fix-stock-compras-editar.sql` documents one such fix).

### Cross-cutting

- **Auth:** custom username/password. `admin_users` table with bcrypt hashes; session is a JWT (`jose`) signed with `AUTH_SECRET`. `AUTH_SECRET` is **mandatory in production** — the app fails closed without it (no default secret). See `src/lib/auth/`.
- **Security:** RLS is enabled deny-all on every table; the server only ever uses the service-role key (never the anon key, never a browser client). CSP is enforced in `next.config.ts`. Rate limiting in `src/lib/security/rate-limit.ts` (+ `migration-rate-limit.sql`).
- **Payments:** Mercado Pago Checkout Pro (`src/lib/payments/mercadopago.ts`). Online orders are created `pendiente` (stock reserved immediately); the webhook `api/mercadopago/webhook` re-queries MP and calls `mark_order_paid` (approved) or `release_order` (rejected). `expire_pending_orders` (pg_cron every 15 min, or `api/cron/expire-orders`) cancels+restocks abandoned `pendiente` **online** carts older than 60 min — POS orders (`channel='pos'`, created `pagado`) are never touched.
- **Media uploads — two distinct paths, don't mix them up.** *Images*: compressed **in the browser** (`ProductForm.tsx` → canvas, max 2000px, JPEG q0.82 — this is what keeps them under Netlify's ~6 MB request cap) and then travel inside the `saveProduct` Server Action to the `product-images` bucket (`serverActions.bodySizeLimit` raised in `next.config.ts`). *Videos*: too big for any request through Netlify — the browser asks `createVideoUploadUrl` for a **signed upload URL** and PUTs the file straight to Storage; the form only submits the resulting public URL (server re-validates it points at our bucket). CSP has `media-src` for Supabase.
- **Form error contract:** `saveProduct` / `saveInfografia` return `{ error }` consumed via `useActionState` (errors render inline next to the submit button) — they do **not** throw, because thrown Server Action errors are opaque in production. Follow this pattern for new admin forms.
- **Emails:** Resend (`src/lib/email/send.ts`), sent on first transition to paid. **Analytics:** GA4 + Meta Pixel, gated behind cookie consent (`src/components/AnalyticsScripts.tsx`, `CookieConsent.tsx`). **Cart:** client-side `src/context/CartContext.tsx`.
- **Site config / content:** `src/config/site.ts` (WhatsApp, socials, FAQ), `src/data/simbolos.ts` (the six sacred fauna/flora symbols each product carries). Admin-editable content lives in the `site_settings` table (key→value; `src/lib/db/settings.ts`) — currently the per-line infographics (`infografia_mochilas`/`infografia_maquillaje`) managed at `/admin/contenido` and rendered at the bottom of each catalog via `InfografiaFooter`.

## Deploy

Hosted on **Netlify** (`netlify.toml`, `@netlify/plugin-nextjs`), production branch `main`. Workflow: branch → PR → merge to `main` triggers the deploy (all recent history is merged PRs). Env vars are set in Netlify, not committed.

> `README.md` and `SETUP.md` are partly stale — they mention Wompi and Vercel; the live app uses **Mercado Pago** and **Netlify**. Trust the code and `.env.example` over those docs.
