# Victorious Concept

Victorious Concept is a real, live e-commerce and sourcing business selling
bags, shoes, slippers, clothing, perfumes, and accessories, plus a
"source it for me" personal-shopping service. Started with the founder
sourcing pieces for campus friends at Lagos Island and Trade Fair markets —
this site is where that grew into a proper online store.

**Live site:** https://victorious-concept.vercel.app

## Tech stack

- **React 19 + Vite** — frontend
- **Tailwind CSS v4** — styling (custom theme: cream/espresso/gold palette,
  Fraunces italic display font + Outfit body font)
- **Supabase** — database (Postgres), auth, and file storage
- **Paystack** — card payments (via `react-paystack` on the frontend,
  webhook-verified server-side)
- **Vercel** — hosting, with serverless functions under `/api` for anything
  that needs a secret key or must never trust the client (pricing,
  payments, refunds, contact form)
- **Vitest** — automated tests for the pricing/coupon/order logic

## Getting started

```bash
npm install
npm run dev
```

You'll need a `.env` file in the project root — copy `.env.example` and
fill in real values from your Supabase project settings and Paystack
dashboard. Never commit `.env` — it's gitignored.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Local dev server with hot reload |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | ESLint across the project |
| `npm run test` | Runs the Vitest suite (pricing/coupon/order logic) |

## Project structure

```
src/
  pages/          One file per route (Home, Shop, Checkout, Admin, ...)
  pages/admin/    Admin dashboard, split into one component per tab
  components/     Shared UI pieces used across pages
  context/        React context providers (cart, auth, toast, business settings)
  hooks/          Data-fetching and shared logic hooks
  lib/            Supabase client setup
  data/           Static content (starter catalog, site images)
  utils/          Small pure helpers (formatPrice, image compression, ...)

api/              Vercel serverless functions — the only code allowed to
                  use the Supabase service-role key or Paystack secret key
api/_lib/         Pure, testable business logic used by the api/ functions
                  (pricing.js is the core: subtotal, coupon, and total math)

supabase/         SQL: base_schema.sql (full schema dump), schema_additions.sql
                  (this build's additions, idempotent), plus one-off migration
                  files for specific features

docs/             DATABASE.md (schema reference) and PRODUCTION-AUDIT.md
                  (security/readiness audit)
```

## How pricing and payments actually work

Nothing about price, stock, or discount is ever trusted from the browser.
`api/create-order.js` looks up real product prices, real stock, and
re-validates any coupon server-side before an order is created — the
client only ever sends product IDs, quantities, and a coupon code.

Card payments go: Paystack checkout → `api/paystack-webhook.js` verifies
the transaction directly with Paystack's API → one atomic Postgres function
(`confirm_paid_order`) records the payment, snapshots the order items,
decrements stock, and updates order status together, all-or-nothing. Bank
transfer / WhatsApp orders go through the equivalent manual path
(`confirm_manual_payment`), triggered by an admin marking the order paid.

See `docs/DATABASE.md` for the full schema reference, and
`docs/PRODUCTION-AUDIT.md` for the security/readiness review this was
built against.

## Admin dashboard

`/admin` is restricted to the emails checked by the database's `is_admin()`
function (not just a frontend list — every sensitive table enforces this
at the Postgres row-level-security layer too). Products, orders, shipping
zones, discount codes, and business info (WhatsApp number, bank details)
are all manageable without touching SQL day-to-day.

## Deployment

Pushes to `main` deploy automatically via Vercel. Environment variables
(Supabase keys, Paystack keys, Resend API key for emails) are set in the
Vercel project settings, not in this repo.