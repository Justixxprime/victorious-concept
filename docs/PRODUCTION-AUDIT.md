# Victorious Concept — Production Audit

Rewritten 2026-09-10 against the live repository (main branch) and the live
Supabase project, directly, not from memory or an old summary. The previous
version of this file was dated 2026-08-28 and described the *original*
pre-fix state of the codebase (no webhook, `ADMIN_EMAILS`-only admin
authorization, client-trusted pricing) as if it were still true — it was
not. That was a real documentation-integrity problem: a stale critical
security warning left in place after the underlying issue was fixed is
actively misleading. This version reflects what is actually true today,
verified where possible by querying the live database rather than trusting
the repo's local snapshot files, which are also known to go stale (see §11).

Legend: 🟢 Good — keep · 🟡 Needs improvement · 🟠 Important · 🔴 Critical · ⚫ Missing

---

## 1. Payments (Paystack) — 🟢 GOOD

**What exists now:** `api/create-order.js` re-fetches every product/variant's
real price and stock from the database and recomputes the authoritative
subtotal, discount, and total server-side before anything is charged —
the client only ever sends product IDs, quantities, and a coupon code.
`api/paystack-webhook.js` verifies the `x-paystack-signature` header,
re-verifies the transaction directly against Paystack's API (amount,
currency, reference), and only then calls one atomic Postgres function,
`confirm_paid_order`, to mark the order paid. The frontend's
`onSuccess` callback is not treated as proof of anything — it just moves
the UI forward; the webhook is the sole authority on payment state.

**Verified live (2026-09-10):** `confirm_paid_order`, `decrement_stock`,
`decrement_variant_stock`, and `process_order_confirmation_items` are
revoked from both the `anon` and `authenticated` Postgres roles entirely —
they can only ever run via the webhook's service-role connection, never
directly from a browser session. Confirmed by querying
`information_schema.routine_privileges` against the live project, not
assumed from a file.

**Remaining risk:** none identified at the payment-verification layer
itself. Paystack is still in **TEST mode** (not yet switched to live
keys) — that's an operational step for launch day, not a code defect.

---

## 2. Admin Authorization — 🟢 GOOD

**What exists now:** A shared Postgres function `is_admin()` gates every
sensitive table's write policies (verified directly via `pg_policies` in
earlier sessions, and the function's existence reconfirmed live this
session). `src/hooks/useIsAdmin.js`'s `ADMIN_EMAILS` array now only
controls whether the Admin UI is shown to someone — it has no bearing on
whether a request actually succeeds, because the database itself checks
`is_admin()` independently of anything the frontend claims.

**Verified live (2026-09-10):** `is_admin()` exists as a live Postgres
function on the project. The five most sensitive functions in the codebase
(`confirm_manual_payment`, `confirm_paid_order`, `decrement_stock`,
`decrement_variant_stock`, `process_order_confirmation_items`) were
specifically audited for exactly the "authenticated customer calls them
directly" attack the original audit warned about — `confirm_manual_payment`
checks `is_admin()` internally and is the only one of the five grantable to
`authenticated` at all; the other four are revoked from both `anon` and
`authenticated`.

**Remaining risk:** none identified. This was the single highest-priority
item from the original audit and is now closed.

---

## 3. Client-Trusted Pricing — 🟢 GOOD

**What exists now:** `api/create-order.js` and `api/_lib/pricing.js` are
the sole source of truth for price, discount, and total. 37 automated tests
in `api/_lib/pricing.test.js` cover this logic directly (`npm run test`).
The client can send whatever it wants; the server recomputes from the
database and ignores anything the client claimed about pricing.

**Remaining risk:** none identified.

---

## 4. Order Data Model — 🟢 GOOD

**What exists now:** `payment_status` (`unpaid | pending | paid | failed |
refunded`) and `order_status` (`pending_payment | processing | shipped |
delivered | cancelled`) are separate, explicit columns, set correctly on
every path (card → `unpaid` until webhook confirms; bank transfer/WhatsApp →
`pending` until admin verifies). The old, dead, superseded `orders.status`
column (mentioned as a cleanup item in earlier project notes) has been
dropped.

---

## 5. Inventory (Race Safety) — 🟢 GOOD

**What exists now:** `decrement_stock` and `decrement_variant_stock` are
atomic Postgres functions, called only from inside the same transaction as
payment confirmation (`confirm_paid_order` / `confirm_manual_payment`),
never as a separate read-then-write from the client. Confirmed live and
correctly locked down (see §1, §2).

---

## 6. Guest Checkout — 🟢 GOOD

**What exists now:** Every order is persisted regardless of login state —
`orders.user_id` is nullable, and `order_number`/`customer_phone` are
always stored for guest lookup via `/track-order`.

---

## 7. Secrets & Environment Variables — 🟢 GOOD

**Verified (2026-09-10):** `git ls-files | grep '^\.env$'` returns nothing —
`.env` is not tracked in the repository. `.env.example` exists with
placeholder values. No secret key material was found committed anywhere in
the current working tree during this audit.

---

## 8. Coupon Engine — 🟢 GOOD

**Verified live (2026-09-10)** by querying the `coupons` table's actual
columns directly, not a local schema file (which is stale here, see §11):
`discount_type` (percent / fixed / free_shipping), `fixed_amount_off`,
`percent_off`, `applies_to_category`, `expires_at`, `max_uses`,
`used_count`, `min_order_amount`, and `referred_by_user_id` (for the
referral-code system, where a referral code is just a coupon tagged to a
user) all exist as real columns. All of it is validated server-side during
order confirmation, not just previewed client-side. This is a materially
richer coupon engine than the original audit described as a gap — that gap
is closed.

---

## 9. Row-Level Security — 🟢 GOOD, spot-verified

Every sensitive table is gated by `is_admin()` rather than relying on
`auth.role() = 'authenticated'` alone. This session re-verified the RLS
posture of the highest-risk functions directly against the live database
(§1, §2) rather than trusting a prior summary. A full `pg_policies` sweep
across every table was done in an earlier session; nothing in this session's
changes (audit logging, site images, coupon reads) required loosening any
existing policy — the two new tables added this session (`audit_logs`,
described in §10) were created with `is_admin()`-gated RLS from the start.

---

## 10. Audit Logging — 🟢 GOOD (new this session)

**What existed before:** Nothing. No `audit_logs` table, no record of
which admin changed what or when. Confirmed via a live query against the
database before building this — genuinely missing, not just undocumented.

**What exists now:** A new `audit_logs` table (admin-only read and write
via RLS, indexed on `created_at` and `entity`), plus a shared
`logAdminAction()` helper (`src/utils/auditLog.js`) wired into the
highest-value sensitive actions: order status changes, marking an order
paid, undoing a payment, order deletion, coupon create/enable/disable/
delete, return approval/rejection (which triggers a real Paystack refund),
and product creation/deletion/price-change/stock-change. A new **Audit
Log** tab in the admin panel (`AdminAuditLogTab.jsx`) shows the most recent
200 entries with actor, action, and a human-readable summary of what
changed.

**Deliberately not logged:** every minor product-edit field (name, image,
category) — only price and stock changes are diffed and logged, since
those are the fields with real financial/inventory consequence; logging
every field on every save would make the log noisy rather than useful.

**Remaining gap:** the refund/return log entry is written client-side
after a successful API response, not from inside `api/process-refund.js`
itself. This is consistent with how every other admin action in this
codebase is logged, but a server-side log write (inside the same
transaction as the refund) would be marginally more tamper-resistant.
Low priority given the refund itself is already fully server-authoritative
and idempotent — the log is a convenience/accountability record, not a
security control.

---

## 11. A Note on Stale Local Snapshot Files

`supabase/base_schema.sql` is a one-time `pg_dump` snapshot, documented in
`docs/DATABASE.md` as something that needs to be manually regenerated —
it is not live-synced. This audit found it missing columns (`discount_type`,
`fixed_amount_off`, etc. on `coupons`) that verifiably exist in the live
database. **Do not trust `base_schema.sql` as current fact** — regenerate
it before relying on it, or query the live project directly (this audit
used the Supabase MCP connector's `execute_sql`/`list_tables` tools for
exactly this reason). The same caution applies to any prior audit document,
including the version of this file that existed before today — a
"production audit" is a snapshot the moment it's written, not a live
document, and should be re-verified rather than assumed current.

---

## 12. Accessibility — 🟢 GOOD

Keyboard navigation and ARIA audit completed: mega menu and "Explore"
dropdown are keyboard-operable (not hover-only), every full-screen overlay
(mobile menu, search, product image lightbox, mobile filter drawer) traps
focus, closes on Escape, and returns focus to its trigger on close.
WCAG contrast: gold text on the cream background was measured and found
failing (2.65:1, needs 4.5:1) — fixed via a `text-gold-deep` token applied
across every real instance (143 text instances, 54 files) while
deliberately preserving the original brighter gold on permanently-dark
backgrounds and on icons, where it already passes.

**Remaining gap:** a small number of admin-only tabs were not part of the
customer-facing keyboard-nav sweep, since the admin panel is `noindex`'d
and used only by the two people running the business, not customers. Low
priority.

---

## 13. Performance — 🟢 GOOD

The Paystack SDK (`react-paystack`) previously loaded on every checkout
visit regardless of payment method chosen; it's now lazy-loaded via
`PaystackCheckoutTrigger.jsx` and only downloads at the moment a card
payment actually begins (Checkout's own bundle dropped from 135 kB to
19 kB). `loading="lazy"` is applied broadly via the shared `RevealImage`
component; this audit found and fixed three remaining gaps on genuinely
below-the-fold, meaningfully-sized images (`Lookbook.jsx`'s grid tiles,
`CategoryGrid.jsx`, review photos) while deliberately leaving it off
above-the-fold heroes, on-demand overlay content, and tiny cart thumbnails
where lazy-loading would add risk (pop-in) or no real benefit.

---

## 14. SEO — 🟢 GOOD

Dynamic sitemap (`api/sitemap.js`) pulls categories and collections live
from the database rather than a hardcoded array that would silently go
stale; journal post slugs are listed alongside the other static pages.
Every public route has real per-page title/description via `SEO.jsx`.
Admin, Cart, and Wishlist pages are correctly `noindex`'d.

---

## 15. Design, Content & Brand — 🟢 GOOD

Real founder story, real sourcing history (Lagos Island, Trade Fair), real
contact/bank/WhatsApp details (admin-editable, not hardcoded). No
fabricated reviews, statistics, awards, or business claims found anywhere
in this or prior audits. Journal posts have real, fuller multi-paragraph
content rather than placeholder excerpts. A sitewide "no dashes in visible
copy" rule (the founder's own stated preference, since dashes "look AI") is
enforced — this audit found and fixed 8 remaining violations in
admin-facing copy that earlier dash-removal passes had missed (3 in
`AdminContentTab.jsx`, 5 in toast messages in `AdminOrdersTab.jsx` and
`AdminProductsTab.jsx`).

---

## Genuinely open items (not yet built, in rough priority order)

1. **Full keyboard-nav/ARIA audit of the admin panel itself** — the
   customer-facing site got this treatment; the admin panel did not,
   since it's internal-only tooling. Low priority unless the business
   grows to more than the two current admin users.
2. **Partial-item returns** — a return request currently covers a whole
   order, not individual line items within it.
3. **TypeScript coverage** is a pilot (JSDoc-based, not a full migration),
   currently scoped to `api/_lib/**` plus the payment/order serverless
   handlers. Expanding further is a judgment call, not a defect.
4. **Server-side (rather than client-side) audit log writes for refunds**
   — see §10's noted gap. Low priority, not a security issue.
5. **Deeper Phase 3/4/5 creative work and Phase 10 final polish** from the
   master redesign brief are substantially complete (cursor experience,
   richer Lookbook/Journal storytelling, site-images-from-admin, design
   system consistency); anything further here is refinement, not a gap.

Nothing in this list is a security or correctness defect. Everything
flagged 🔴 or 🟠 in the original 2026-08-28 audit is now 🟢.
