-- ============================================================================
-- VICTORIOUS CONCEPT — SCHEMA ADDITIONS
-- ============================================================================
-- Every table, column, function, trigger, and policy added to the database
-- during the security/commerce-engine hardening work. This file is safe to
-- run against the existing project (every statement is idempotent — it will
-- not error or duplicate anything if run again).
--
-- WHAT THIS FILE DOES **NOT** COVER:
-- The tables that already existed before this work began — products,
-- categories, collections, addresses, reviews, testimonials,
-- contact_messages, subscribers, site_settings, and the original columns on
-- coupons/orders — are NOT fully defined here, because their exact original
-- structure was never fully dumped to the assistant that wrote this file; it
-- only ever saw pieces of them through the Supabase dashboard. Trying to
-- "reconstruct" those from memory would risk silently getting them wrong.
--
-- TO GET A COMPLETE, FULLY AUTHORITATIVE SCHEMA FILE:
-- In Supabase, go to Database → Backups, or run `supabase db dump` with the
-- Supabase CLI, or use Database → Database → "Export schema" if available in
-- your project's dashboard version. That gives you the real, complete,
-- current definition of every table exactly as it exists today. Keep that
-- export alongside this file in version control — together they cover
-- everything.
-- ============================================================================


-- ============================================================================
-- TABLES ADDED
-- ============================================================================

create table if not exists order_items (
  id bigint generated always as identity primary key,
  order_id bigint not null references orders(id) on delete cascade,
  product_id bigint,
  variant_id bigint,
  product_name text not null,
  sku text,
  unit_price int not null,
  quantity int not null,
  line_total int not null,
  created_at timestamptz not null default now()
);

create table if not exists payments (
  id bigint generated always as identity primary key,
  order_id bigint not null references orders(id) on delete cascade,
  provider text not null default 'paystack',
  provider_reference text not null unique,
  amount int not null,
  currency text not null default 'NGN',
  status text not null default 'pending',
  paid_at timestamptz,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create table if not exists payment_events (
  id bigint generated always as identity primary key,
  provider_reference text,
  event_type text,
  raw_payload jsonb,
  processed boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists product_variants (
  id bigint generated always as identity primary key,
  product_id bigint not null references products(id) on delete cascade,
  size text,
  color text,
  sku text,
  price_override int,
  stock int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists shipping_zones (
  id bigint generated always as identity primary key,
  name text not null unique,
  fee int not null,
  estimated_days text,
  is_variable boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists return_requests (
  id bigint generated always as identity primary key,
  order_id bigint not null references orders(id) on delete cascade,
  user_id uuid,
  reason text not null,
  items jsonb,
  status text not null default 'requested',
  refund_amount int,
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists restock_waitlist (
  id bigint generated always as identity primary key,
  product_id bigint not null references products(id) on delete cascade,
  email text not null,
  notified boolean not null default false,
  created_at timestamptz not null default now(),
  unique(product_id, email)
);


-- ============================================================================
-- COLUMNS ADDED TO PRE-EXISTING TABLES
-- ============================================================================

alter table orders
  add column if not exists payment_status text not null default 'unpaid',
  add column if not exists order_status text not null default 'pending_payment',
  add column if not exists customer_email text,
  add column if not exists coupon_code text,
  add column if not exists shipping_fee int not null default 0,
  add column if not exists shipping_zone text,
  add column if not exists shipping_is_variable boolean not null default false;

do $$ begin
  alter table orders add constraint orders_payment_status_check
    check (payment_status in ('unpaid','pending','paid','failed','refunded'));
exception when duplicate_object then null; end $$;

do $$ begin
  alter table orders add constraint orders_order_status_check
    check (order_status in ('pending_payment','processing','shipped','delivered','cancelled','return_requested','returned','refund_pending','refunded'));
exception when duplicate_object then null; end $$;

do $$ begin
  alter table orders add constraint orders_order_number_unique unique (order_number);
exception when duplicate_object then null; end $$;

alter table coupons
  add column if not exists expires_at timestamptz,
  add column if not exists max_uses int,
  add column if not exists used_count int not null default 0,
  add column if not exists min_order_amount int;

alter table order_items
  add column if not exists variant_id bigint references product_variants(id);

alter table subscribers
  add column if not exists ip_address text;

do $$ begin
  alter table reviews add constraint reviews_rating_range check (rating >= 1 and rating <= 5);
exception when duplicate_object then null; end $$;


-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Admin check used by RLS policies across the database. The single source of
-- truth for "is this user an admin" — the frontend's ADMIN_EMAILS list only
-- controls UI visibility and must never be treated as real authorization.
create or replace function is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select coalesce(
    lower(auth.jwt() ->> 'email') in (
      'victoriaobioma31@yahoo.com',
      'justixxchiobi@gmail.com'
    ),
    false
  );
$$;

create or replace function decrement_stock(product_id bigint, qty int)
returns void
language sql
as $$
  update products set stock = greatest(stock - qty, 0) where id = product_id;
$$;

create or replace function decrement_variant_stock(variant_id bigint, qty int)
returns void
language sql
as $$
  update product_variants set stock = greatest(stock - qty, 0) where id = variant_id;
$$;

-- Superseded by process_order_confirmation_items() below, which increments
-- coupon usage as part of the atomic payment-confirmation flow instead.
-- Left in place only in case anything external still references it.
create or replace function increment_coupon_usage(coupon_id bigint)
returns void
language sql
as $$
  update coupons set used_count = used_count + 1 where id = coupon_id;
$$;

-- Shared by confirm_paid_order() and confirm_manual_payment(): snapshots
-- each purchased line item permanently, decrements the correct stock pool
-- (variant or base product), and counts coupon usage — all only once a
-- payment is genuinely confirmed, never at order creation.
create or replace function process_order_confirmation_items(p_order_id bigint, p_items jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_item jsonb;
  v_variant_id bigint;
begin
  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_variant_id := nullif(v_item->>'variantId', '')::bigint;

    insert into order_items (order_id, product_id, variant_id, product_name, unit_price, quantity, line_total)
    values (
      p_order_id,
      (v_item->>'id')::bigint,
      v_variant_id,
      v_item->>'name',
      (v_item->>'price')::int,
      (v_item->>'quantity')::int,
      (v_item->>'price')::int * (v_item->>'quantity')::int
    );

    if v_variant_id is not null then
      update product_variants set stock = greatest(stock - (v_item->>'quantity')::int, 0) where id = v_variant_id;
    else
      update products set stock = greatest(stock - (v_item->>'quantity')::int, 0) where id = (v_item->>'id')::bigint;
    end if;
  end loop;

  update coupons set used_count = used_count + 1
  where code = (select coupon_code from orders where id = p_order_id and coupon_code is not null);
end;
$$;

-- Called once by the Paystack webhook after it has independently verified a
-- transaction with Paystack's own servers. Atomic: the payments insert
-- (guarded by the UNIQUE constraint on provider_reference) either claims
-- this confirmation or, if already claimed, returns 'already_processed'
-- immediately with no other writes — making the whole function idempotent
-- and safe against duplicate/retried webhooks.
create or replace function confirm_paid_order(
  p_order_id bigint, p_reference text, p_amount int, p_currency text,
  p_channel text, p_gateway_response text, p_items jsonb
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_payment_id bigint;
begin
  insert into payments (order_id, provider, provider_reference, amount, currency, status, paid_at, metadata)
  values (p_order_id, 'paystack', p_reference, p_amount, p_currency, 'paid', now(),
          jsonb_build_object('channel', p_channel, 'gateway_response', p_gateway_response))
  on conflict (provider_reference) do nothing
  returning id into v_payment_id;

  if v_payment_id is null then
    return 'already_processed';
  end if;

  perform process_order_confirmation_items(p_order_id, p_items);

  update orders set payment_status = 'paid', order_status = 'processing', payment_reference = p_reference
  where id = p_order_id;

  return 'confirmed';
end;
$$;

-- Same pattern as confirm_paid_order(), used when an admin manually verifies
-- a bank transfer or WhatsApp-arranged payment instead of Paystack's webhook.
create or replace function confirm_manual_payment(
  p_order_id bigint, p_reference text, p_amount int, p_verified_via text, p_items jsonb
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_payment_id bigint;
begin
  insert into payments (order_id, provider, provider_reference, amount, currency, status, paid_at, metadata)
  values (p_order_id, 'manual', p_reference, p_amount, 'NGN', 'paid', now(),
          jsonb_build_object('verified_via', p_verified_via))
  on conflict (provider_reference) do nothing
  returning id into v_payment_id;

  if v_payment_id is null then
    return 'already_processed';
  end if;

  perform process_order_confirmation_items(p_order_id, p_items);

  update orders set payment_status = 'paid', order_status = 'processing'
  where id = p_order_id;

  return 'confirmed';
end;
$$;

-- Overrides whatever a client sends for reviews.verified_purchase with a
-- real check against paid orders — a customer cannot fake this by editing
-- the request, since the trigger recomputes it unconditionally on every
-- insert/update.
create or replace function compute_verified_purchase()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.verified_purchase := exists (
    select 1 from order_items oi
    join orders o on o.id = oi.order_id
    where o.user_id = new.user_id
      and oi.product_id = new.product_id
      and o.payment_status = 'paid'
  );
  return new;
end;
$$;

-- Guest order lookup used by /track-order and by Checkout's post-payment
-- polling — requires both the exact order number AND the phone number on
-- the order, so it can't be used to browse other customers' orders.
create or replace function get_order_by_reference(order_num text, phone text)
 returns table(order_number text, status text, total bigint, items jsonb, payment_method text, created_at timestamp with time zone, payment_status text, order_status text)
 language sql
 security definer
 set search_path = public
as $$
  select order_number, status, total, items, payment_method, created_at, payment_status, order_status
  from orders
  where order_number = order_num
  and customer_phone = phone;
$$;


-- ============================================================================
-- TRIGGERS
-- ============================================================================

drop trigger if exists trg_compute_verified_purchase on reviews;
create trigger trg_compute_verified_purchase
before insert or update on reviews
for each row execute function compute_verified_purchase();


-- ============================================================================
-- ROW LEVEL SECURITY — new tables
-- ============================================================================

alter table order_items enable row level security;
alter table payments enable row level security;
alter table payment_events enable row level security;
alter table product_variants enable row level security;
alter table shipping_zones enable row level security;
alter table return_requests enable row level security;
alter table restock_waitlist enable row level security;

do $$ begin
  create policy "Admins manage order_items" on order_items for all using (is_admin()) with check (is_admin());
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "Users view their own order_items" on order_items for select using (
    exists (select 1 from orders where orders.id = order_items.order_id and orders.user_id = auth.uid())
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Admins manage payments" on payments for all using (is_admin()) with check (is_admin());
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Admins manage payment_events" on payment_events for all using (is_admin()) with check (is_admin());
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Public can read variants" on product_variants for select using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "Admins manage variants" on product_variants for all using (is_admin()) with check (is_admin());
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Public can read active shipping zones" on shipping_zones for select using (active = true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "Admins manage shipping zones" on shipping_zones for all using (is_admin()) with check (is_admin());
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Users view their own returns" on return_requests for select using (
    exists (select 1 from orders where orders.id = return_requests.order_id and orders.user_id = auth.uid())
  );
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "Users request returns on their own orders" on return_requests for insert with check (
    exists (select 1 from orders where orders.id = return_requests.order_id and orders.user_id = auth.uid())
  );
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "Admins manage returns" on return_requests for all using (is_admin()) with check (is_admin());
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Anyone can join a waitlist" on restock_waitlist for insert with check (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "Admins manage waitlist" on restock_waitlist for all using (is_admin()) with check (is_admin());
exception when duplicate_object then null; end $$;