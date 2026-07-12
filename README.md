# Terra Botanica — Organic Bath & Body E-Commerce

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
| Database   | MongoDB via Mongoose                          |
| Auth       | JWT (jose) in httpOnly cookies, bcrypt-hashed passwords |
| Payments   | Razorpay (test mode) with a built-in mock fallback |
| Shipping   | Shiprocket API (shipment creation + tracking) |

## Running locally

Prerequisites: Node 20+, MongoDB running locally (`brew services start mongodb-community`).

```bash
npm install
cp .env.example .env.local   # then edit values (see below)
npm run seed                  # seeds 16 products + the admin user
npm run dev                   # http://localhost:3000
```

The seed script prints the admin credentials it created (defaults:
`admin@terrabotanica.in` / `admin123` — change `ADMIN_EMAIL` / `ADMIN_PASSWORD`
in `.env.local` before seeding for anything non-local).

### Environment variables (`.env.local`)

| Variable | Purpose |
| -------- | ------- |
| `MONGODB_URI` | Mongo connection string (default: local `terra-botanica` db) |
| `JWT_SECRET` | Session signing key — generate with `openssl rand -base64 32` |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Admin account created by `npm run seed` |
| `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Test-mode keys from the [Razorpay dashboard](https://dashboard.razorpay.com). **When left blank, checkout uses a clearly-labelled mock payment dialog** so the full order flow works locally. |
| `SHIPROCKET_EMAIL`, `SHIPROCKET_PASSWORD`, `SHIPROCKET_PICKUP_LOCATION` | Shiprocket API-user credentials from [app.shiprocket.in](https://app.shiprocket.in) (Settings → API). When blank, shipment creation is skipped and orders stay in "processing" for manual handling. |

### Going live checklist

1. Set real Razorpay **live** keys and a strong `JWT_SECRET`.
2. Set Shiprocket API credentials and the exact pickup-location nickname from
   your Shiprocket settings.
3. Point `MONGODB_URI` at your production cluster and run `npm run seed` once
   (or add products through the admin panel).
4. `npm run build && npm start`.

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
- `npm run seed` — reset products + ensure admin user
- `npm run images` — regenerate the SVG product artwork in `public/products/`
- `npm run lint` / `npx tsc --noEmit` — lint & typecheck
- `node scripts/verify-e2e.mjs` — browser end-to-end check of the full
  cart → register → checkout → payment → confirmation flow (needs
  `npm i --no-save playwright-core` and Google Chrome installed)
# E-CommerceStore
