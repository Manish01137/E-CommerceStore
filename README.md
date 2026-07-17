# Ethereal Artisan — Organic Bath & Body E-Commerce

A fully functional, premium e-commerce site for a natural bath & body brand,
built from scratch with Next.js. Includes a complete B2C storefront (catalogue,
cart, checkout, payments, order tracking), a minimal B2B enquiry funnel, and a
protected admin panel.

## Tech stack

| Layer      | Choice                                        |
| ---------- | --------------------------------------------- |
| Frontend   | Next.js 16 (App Router) + React 19 + Tailwind CSS v4 |
| Animation  | Framer Motion (scroll reveals, page transitions, micro-interactions) |
| Backend    | Next.js API routes                            |
| Database   | Supabase (PostgreSQL) via Prisma              |
| Auth       | JWT (jose) in httpOnly cookies, bcrypt-hashed passwords |
| Payments   | Razorpay (test mode) with a built-in mock fallback |
| Shipping   | Shiprocket API (shipment creation + tracking) |

## Running locally

Prerequisites: Node 20+, and Postgres — either a Supabase project (free tier is
fine) or a local server (`brew install postgresql@16 && brew services start
postgresql@16 && createdb ethereal_artisan`).

```bash
npm install
cp .env.example .env.local   # then set DATABASE_URL / DIRECT_URL (see below)
npm run db:migrate           # creates the tables
npm run seed                 # seeds the 20-product catalogue + admin user
npm run dev                  # http://localhost:3000
```

Skip the database entirely and `npm run dev` still works — see
[preview mode](#option-a--deploy-now-no-database-preview-mode).

The seed script prints the admin credentials it created (defaults:
`admin@etherealartisan.in` / `admin123` — change `ADMIN_EMAIL` / `ADMIN_PASSWORD`
in `.env.local` before seeding for anything non-local).

### Environment variables (`.env.local`)

| Variable | Purpose |
| -------- | ------- |
| `DATABASE_URL` | Runtime connection. Supabase **Transaction mode** pooler, port 6543, with `?pgbouncer=true` — serverless opens many short-lived connections. Leave blank for preview mode. |
| `DIRECT_URL` | Used by Prisma Migrate, which needs a real session. Supabase **Session mode** pooler, port 5432. Not the `db.<ref>.supabase.co` direct connection — that's IPv6-only on new projects and fails from Vercel. |
| `JWT_SECRET` | Session signing key — generate with `openssl rand -base64 32` |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Admin account created by `npm run seed` |
| `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Test-mode keys from the [Razorpay dashboard](https://dashboard.razorpay.com). **When left blank, checkout uses a clearly-labelled mock payment dialog** so the full order flow works locally. |
| `SHIPROCKET_EMAIL`, `SHIPROCKET_PASSWORD`, `SHIPROCKET_PICKUP_LOCATION` | Shiprocket API-user credentials from [app.shiprocket.in](https://app.shiprocket.in) (Settings → API). When blank, shipment creation is skipped and orders stay in "processing" for manual handling. |

## Deploying to Vercel

### Option A — deploy now, no database (preview mode)

The app runs **without any backend at all**. If `DATABASE_URL` is not set, it
serves the catalogue from `src/data/catalogue.json` and everything that doesn't
need to persist works:

| Works in preview mode | Disabled (needs a database) |
| --- | --- |
| Home, Shop, Business pages | Sign in / register |
| Full catalogue, search, filters, sort | Checkout & payments |
| Product detail pages + galleries | Order history / tracking |
| Cart (drawer, quantities, persistence) | B2B enquiry submissions |
| | Admin panel |

A slim "Preview mode" banner appears at the top so visitors know why checkout is
off, and the disabled routes return a clear message instead of an error page.

To deploy this way:

```bash
git add -A && git commit -m "Ethereal Artisan storefront"
git push
```

Import the repo at [vercel.com/new](https://vercel.com/new) and **set no
environment variables at all**. It builds and ships as-is. Add the database
later (Option B) and every disabled feature switches on with no code changes.

### Option B — add the full backend (Supabase)

Vercel runs this app serverless, which changes two things: **there is no local
database** and **the filesystem is read-only**. Both are handled below.

#### 1. Create the Supabase project

1. New project at [supabase.com](https://supabase.com) (free tier is fine).
   Save the database password it generates — it is shown once.
2. Top bar → **Connect** → **ORMs** → **Prisma**. Copy both strings:

```env
DATABASE_URL=postgresql://postgres.<PROJECT-REF>:<PASSWORD>@aws-0-<REGION>.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.<PROJECT-REF>:<PASSWORD>@aws-0-<REGION>.pooler.supabase.com:5432/postgres
```

3. Put both in `.env.local`, then create the tables and seed:

```bash
npm run db:deploy   # applies prisma/migrations to Supabase
npm run seed        # 20-product catalogue + admin user
```

Both URLs use the **pooler** host. Runtime queries use transaction mode (6543)
because serverless opens many short-lived connections; Prisma Migrate uses
session mode (5432) because it needs a real session. Don't use the
`db.<ref>.supabase.co` direct connection — it's IPv6-only on new projects and
won't resolve from Vercel. See `prisma.config.ts`.

If the password contains `@ : / ?` or `#`, URL-encode it (`@` → `%40`).

You can inspect the data any time with `npm run db:studio`, or in Supabase's
own table editor.

#### 2. Push to GitHub, then import on Vercel

```bash
git add -A
git commit -m "Ethereal Artisan storefront"
git remote add origin https://github.com/<you>/<repo>.git
git push -u origin main
```

Then on [vercel.com/new](https://vercel.com/new): import the repo. Framework is
auto-detected as Next.js — leave the build settings alone. `npm run build` runs
`prisma generate` first, so the client is always built against the current
schema.

#### 3. Environment variables (Project → Settings → Environment Variables)

| Variable | Value |
| -------- | ----- |
| `DATABASE_URL` | Supabase pooler, **transaction mode**, port 6543, `?pgbouncer=true` |
| `DIRECT_URL` | Supabase pooler, **session mode**, port 5432 |
| `JWT_SECRET` | A long random string — `openssl rand -base64 32` |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Your admin login (used by the seed script) |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` / `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Razorpay keys. **Leave blank and checkout falls back to the mock payment dialog** — fine for a demo, not for real orders. |
| `SHIPROCKET_EMAIL` / `SHIPROCKET_PASSWORD` / `SHIPROCKET_PICKUP_LOCATION` | Shiprocket API user. Blank = shipment creation skipped. |
| `BLOB_READ_WRITE_TOKEN` | Added automatically when you create a Blob store (below). |

#### 4. Blob storage — required for admin image uploads

Vercel's filesystem is read-only, so `/api/upload` cannot write to
`public/uploads` in production. It writes to Vercel Blob instead:

- Vercel dashboard → **Storage → Create → Blob**, connect it to the project.
- This injects `BLOB_READ_WRITE_TOKEN` automatically; redeploy once.

Without the token, uploads still work locally (files go to `public/uploads`),
but the **Add Product** image upload in the admin panel will fail in production.

#### 5. Changing the schema later

```bash
npm run db:migrate -- --name what_changed   # dev: edit schema, create migration
npm run db:deploy                            # prod: apply pending migrations
```

Never hand-edit tables in the Supabase dashboard — the migration history in
`prisma/migrations/` is the source of truth, and drift will bite on the next
deploy.

#### 6. Before taking real money

1. Swap Razorpay test keys for **live** keys and confirm a real ₹1 payment.
2. Set Shiprocket credentials and the exact pickup-location nickname from your
   Shiprocket settings.
3. Change `ADMIN_PASSWORD` from the seeded default and re-seed, or update the
   password from the database.

## Site map

- `/` — Home: brand story, philosophy, Choose Your Path (Shop / Business), featured products
- `/products` — full catalogue with search, category/scent filters, sorting
- `/products/[slug]` — product detail: gallery, scent picker, quantity, add to cart, related items
- `/shop` — customer storefront landing: categories, bestsellers, testimonials, new arrivals
- `/business` — B2B credibility + "Enquire to Know More" form (no pricing/cart)
- `/login`, `/register` — customer auth
- `/checkout` — address + payment (Razorpay or mock), sign-in required
- `/account` — order history, saved addresses; `/account/orders/[id]` — order status, shipment tracking
- `/admin` — protected panel: sales overview, product CRUD with image upload, order management (status updates), customers, B2B enquiries

## Payment flow

1. `POST /api/orders` validates the cart server-side (prices and stock come
   from the database, never the client) and creates the order as `pending`.
2. With Razorpay configured, a Razorpay order is created and the hosted
   checkout opens (cards / UPI / net-banking in test mode).
3. `POST /api/payment/verify` checks the HMAC signature. On success the order
   is marked paid, stock is decremented, and a Shiprocket shipment is created
   automatically; the tracking link appears on the customer's order page.
4. Failed or abandoned payments mark the order `failed` and never touch stock.

## Scripts

- `npm run dev` — dev server
- `npm run db:migrate` — create/apply a migration in development
- `npm run db:deploy` — apply pending migrations (production/CI)
- `npm run db:studio` — browse the database in Prisma Studio
- `npm run seed` — upsert the catalogue + ensure the admin user
- `npm run placeholders` — regenerate the branded placeholder cards for products
  that don't have real photography yet (`public/products/ph-*.svg`)
- `npm run lint` / `npx tsc --noEmit` — lint & typecheck
- `node scripts/verify-e2e.mjs` — browser end-to-end check of the full
  cart → register → checkout → payment → confirmation flow (needs
  `npm i --no-save playwright-core` and Google Chrome installed)
# E-CommerceStore
