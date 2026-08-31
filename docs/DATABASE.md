# Database Schema Documentation

## The two things you need for a complete, reconstructable database

### 1. `supabase/schema_additions.sql` (in this repo)
Every table, column, function, trigger, and RLS policy added during the
security/commerce-engine hardening work — the payment system, order
architecture, variants, shipping, returns, coupon limits, review integrity,
and abuse protection. This file is idempotent: safe to run again against the
live project without erroring or duplicating anything.

### 2. A full schema export from Supabase (not in this repo yet — you should add one)
`schema_additions.sql` does **not** define the tables that existed before
this work began: `products`, `categories`, `collections`, `addresses`,
`reviews`, `testimonials`, `contact_messages`, `subscribers`,
`site_settings`, or the original columns on `orders`/`coupons`. Those were
only ever seen in pieces through the Supabase dashboard during this work —
never a complete, authoritative definition — so writing them into this repo
from memory would risk quietly getting something wrong, which is worse than
not having it at all.

**To get the real, complete, current schema:**
- Supabase dashboard → **Database** → **Backups**, or
- Install the Supabase CLI and run `supabase db dump --schema public`, or
- Your project's **Settings → Database** page may offer a direct schema export

Save that output as `supabase/base_schema.sql` in this repo, right alongside
`schema_additions.sql`. Together, the two files let you rebuild the entire
database from git if the Supabase project were ever lost — which is the
actual goal here, and neither file alone achieves it.

## What's inside schema_additions.sql, briefly

| Area | What it adds |
|---|---|
| **Orders** | `payment_status`, `order_status`, `shipping_*` columns, a real `UNIQUE` constraint on `order_number` |
| **Line items** | `order_items` — a permanent snapshot of what was actually bought, unaffected by later price changes |
| **Payments** | `payments` + `payment_events` — a real audit trail, separate from the order itself |
| **Variants** | `product_variants` — independent size/color stock and optional price override |
| **Shipping** | `shipping_zones`, including "fee varies, confirmed via WhatsApp" zones |
| **Returns** | `return_requests`, with a race-safe atomic claim before any refund is issued |
| **Coupons** | expiry, usage limits, minimum order amount |
| **Reviews** | a database-enforced 1–5 rating range, and a trigger that computes "verified purchase" from real paid orders — never trusting the client |
| **Functions** | `is_admin()`, `confirm_paid_order()`, `confirm_manual_payment()`, `process_order_confirmation_items()`, stock-decrement helpers, `compute_verified_purchase()` |

Every write-sensitive table uses `is_admin()` in its RLS policies — the same
function used everywhere else in the database — rather than a
frontend-only check.