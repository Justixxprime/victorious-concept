# Database

This documents the Victorious Concept Supabase (Postgres) database: how to
get the schema, what's in it, and how the pieces fit together.

## Getting the schema locally

The full structural schema (tables, functions, triggers, RLS policies -- no
customer data) lives in `supabase/base_schema.sql`, generated with:

```
pg_dump --schema=public --schema-only "<direct-connection-uri>" -f supabase/base_schema.sql
```

The direct connection URI is in the Supabase dashboard under
**Project Settings -> Database -> Connection string -> URI -> Direct
connection**. Use the *direct* connection (not the pooler) for `pg_dump`.

If you'd rather use the Supabase CLI instead of `pg_dump` directly, that
works too, but `supabase db dump` requires Docker Desktop to be installed
and running locally -- `pg_dump` alone does not.

`supabase/schema_additions.sql` is a separate, hand-maintained file: only
the objects added or changed *during this build session* (atomic payment
functions, variants, shipping zones, returns, etc). It's idempotent and
safe to re-run. `base_schema.sql` is the full picture; `schema_additions.sql`
is the changelog subset of it.

## Tables (18)

| Table | Purpose |
|---|---|
| `products` | Core catalog: name, price, category, images, sizes, stock, status |
| `product_variants` | Size/color/SKU variants with independent stock and optional price override |
| `categories` | Category metadata (name, description, sort order) |
| `collections` | Curated product groupings (slug, image, product_ids[]) |
| `orders` | Order header: customer info, totals, payment method, status |
| `order_items` | Line-item snapshot of what was actually ordered (price/qty at time of order) |
| `payments` | Payment records, one per confirmed transaction, idempotent via UNIQUE constraint |
| `payment_events` | Raw Paystack webhook event log |
| `coupons` | Discount codes: percent off, expiry, usage limit, minimum order amount |
| `reviews` | Product reviews with `verified_purchase` computed server-side |
| `testimonials` | Admin-entered quotes sourced from Instagram/WhatsApp/etc, not tied to a review |
| `addresses` | Per-user saved delivery addresses |
| `subscribers` | Newsletter signups |
| `contact_messages` | Contact form submissions, shown in Admin Messages tab |
| `shipping_zones` | Delivery fees per zone, with `is_variable` for road/plane quote-on-request |
| `return_requests` | Return/refund requests, tied to `process-refund.js` |
| `restock_waitlist` | Customers waiting on an out-of-stock product |
| `site_settings` | Key/value store: Hero content, WhatsApp number, bank details |

## Functions (10)

| Function | Purpose |
|---|---|
| `is_admin()` | Shared check used by RLS policies across every sensitive table -- not just a frontend email list |
| `confirm_paid_order` | Atomic confirmation for card payments: payment record + order_items snapshot + stock decrement + coupon usage + status update, all-or-nothing |
| `confirm_manual_payment` | Same atomic confirmation, for admin-verified bank transfer / WhatsApp payments |
| `decrement_stock` | Atomic stock decrement for simple (non-variant) products |
| `decrement_variant_stock` | Atomic stock decrement for a specific size/color variant |
| `increment_coupon_usage` | Bumps a coupon's usage count, called only at confirmed payment |
| `compute_verified_purchase` | Trigger function: sets `reviews.verified_purchase` from real paid `order_items`, overriding whatever the client sends |
| `process_order_confirmation_items` | Helper used inside the atomic confirmation functions to build the `order_items` snapshot |
| `get_order_by_reference` | Secure RPC for guest order tracking by phone + order number, without exposing all orders |
| `rls_auto_enable` | Housekeeping function related to RLS setup |

## Triggers (1)

- `trg_compute_verified_purchase` -- fires `compute_verified_purchase()` on
  reviews, so `verified_purchase` can never be spoofed from the browser.

## RLS policies

59 policies total across the 18 tables, verified directly via
`pg_policies` (not just inferred from the frontend). Every sensitive table
is gated by `is_admin()` at the database level, so even a compromised or
bypassed frontend `useIsAdmin.js` check can't grant write access -- that
frontend list only controls UI visibility, not actual authorization.

## Payment integrity model

Card payments (Paystack) and manual payments (bank transfer / WhatsApp,
confirmed by an admin) both funnel through one of two atomic Postgres
functions (`confirm_paid_order` / `confirm_manual_payment`) rather than a
sequence of separate client-driven steps. This means a payment is either
fully recorded (payment row + order_items + stock decrement + coupon usage
+ status) or not recorded at all -- no partial states from a dropped
connection or a race between two simultaneous confirmations.

## Local CLI metadata

`supabase/.temp/` is generated automatically by the Supabase CLI when you
run `supabase link`. It's machine-specific (project ref, pooler URL, CLI
version) and is gitignored -- it should never be committed. If you ever see
it show up in `git status`, that's a sign `supabase link` was run before
the `.gitignore` entry existed; just `git rm -r --cached supabase/.temp`.