--
-- PostgreSQL database dump
--

\restrict qNWudbe02Wz3eK3rEVVpR21tG73QufhUw1wyzM7FBDieI2c5U3rqG81tadp9mjF

-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: pg_database_owner
--

CREATE SCHEMA public;


ALTER SCHEMA public OWNER TO pg_database_owner;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: pg_database_owner
--

COMMENT ON SCHEMA public IS 'standard public schema';


--
-- Name: compute_verified_purchase(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.compute_verified_purchase() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
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


ALTER FUNCTION public.compute_verified_purchase() OWNER TO postgres;

--
-- Name: confirm_manual_payment(bigint, text, integer, text, jsonb); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.confirm_manual_payment(p_order_id bigint, p_reference text, p_amount integer, p_verified_via text, p_items jsonb) RETURNS text
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
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


ALTER FUNCTION public.confirm_manual_payment(p_order_id bigint, p_reference text, p_amount integer, p_verified_via text, p_items jsonb) OWNER TO postgres;

--
-- Name: confirm_paid_order(bigint, text, integer, text, text, text, jsonb); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.confirm_paid_order(p_order_id bigint, p_reference text, p_amount integer, p_currency text, p_channel text, p_gateway_response text, p_items jsonb) RETURNS text
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
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


ALTER FUNCTION public.confirm_paid_order(p_order_id bigint, p_reference text, p_amount integer, p_currency text, p_channel text, p_gateway_response text, p_items jsonb) OWNER TO postgres;

--
-- Name: decrement_stock(bigint, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.decrement_stock(product_id bigint, qty integer) RETURNS void
    LANGUAGE sql
    AS $$
  update products set stock = greatest(stock - qty, 0) where id = product_id;
$$;


ALTER FUNCTION public.decrement_stock(product_id bigint, qty integer) OWNER TO postgres;

--
-- Name: decrement_variant_stock(bigint, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.decrement_variant_stock(variant_id bigint, qty integer) RETURNS void
    LANGUAGE sql
    AS $$
  update product_variants set stock = greatest(stock - qty, 0) where id = variant_id;
$$;


ALTER FUNCTION public.decrement_variant_stock(variant_id bigint, qty integer) OWNER TO postgres;

--
-- Name: get_order_by_reference(text, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_order_by_reference(order_num text, phone text) RETURNS TABLE(order_number text, status text, total bigint, items jsonb, payment_method text, created_at timestamp with time zone, payment_status text, order_status text)
    LANGUAGE sql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  select order_number, status, total, items, payment_method, created_at, payment_status, order_status
  from orders
  where order_number = order_num
  and customer_phone = phone;
$$;


ALTER FUNCTION public.get_order_by_reference(order_num text, phone text) OWNER TO postgres;

--
-- Name: increment_coupon_usage(bigint); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.increment_coupon_usage(coupon_id bigint) RETURNS void
    LANGUAGE sql
    AS $$
  update coupons set used_count = used_count + 1 where id = coupon_id;
$$;


ALTER FUNCTION public.increment_coupon_usage(coupon_id bigint) OWNER TO postgres;

--
-- Name: is_admin(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.is_admin() RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT coalesce(
    lower(auth.jwt() ->> 'email') IN (
      'victoriaobioma31@yahoo.com',
      'justixxchiobi@gmail.com'
    ),
    false
  );
$$;


ALTER FUNCTION public.is_admin() OWNER TO postgres;

--
-- Name: process_order_confirmation_items(bigint, jsonb); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.process_order_confirmation_items(p_order_id bigint, p_items jsonb) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
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


ALTER FUNCTION public.process_order_confirmation_items(p_order_id bigint, p_items jsonb) OWNER TO postgres;

--
-- Name: rls_auto_enable(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.rls_auto_enable() RETURNS event_trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'pg_catalog'
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$$;


ALTER FUNCTION public.rls_auto_enable() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: addresses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.addresses (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    user_id uuid NOT NULL,
    label text,
    full_name text,
    phone text,
    address text
);


ALTER TABLE public.addresses OWNER TO postgres;

--
-- Name: categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categories (
    id text NOT NULL,
    name text NOT NULL,
    sort_order bigint DEFAULT 0,
    description text
);


ALTER TABLE public.categories OWNER TO postgres;

--
-- Name: collections; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.collections (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    image text,
    product_ids text[] DEFAULT '{}'::text[]
);


ALTER TABLE public.collections OWNER TO postgres;

--
-- Name: contact_messages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.contact_messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    name text,
    email text,
    message text,
    read boolean DEFAULT false
);


ALTER TABLE public.contact_messages OWNER TO postgres;

--
-- Name: coupons; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.coupons (
    id bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    code text,
    percent_off bigint DEFAULT '10'::bigint,
    active boolean,
    expires_at timestamp with time zone,
    max_uses integer,
    used_count integer DEFAULT 0 NOT NULL,
    min_order_amount integer
);


ALTER TABLE public.coupons OWNER TO postgres;

--
-- Name: coupons_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.coupons ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.coupons_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: order_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_items (
    id bigint NOT NULL,
    order_id bigint NOT NULL,
    product_id bigint,
    product_name text NOT NULL,
    sku text,
    unit_price integer NOT NULL,
    quantity integer NOT NULL,
    line_total integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.order_items OWNER TO postgres;

--
-- Name: order_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.order_items ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.order_items_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.orders (
    id bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    user_id uuid DEFAULT gen_random_uuid(),
    order_number text,
    items jsonb,
    total bigint,
    customer_name text,
    customer_phone text,
    customer_address text,
    payment_reference text,
    payment_method text,
    status text DEFAULT 'pending'::text,
    payment_status text DEFAULT 'unpaid'::text NOT NULL,
    order_status text DEFAULT 'pending_payment'::text NOT NULL,
    customer_email text,
    coupon_code text,
    shipping_fee integer DEFAULT 0 NOT NULL,
    shipping_zone text,
    shipping_is_variable boolean DEFAULT false NOT NULL,
    CONSTRAINT orders_order_status_check CHECK ((order_status = ANY (ARRAY['pending_payment'::text, 'processing'::text, 'shipped'::text, 'delivered'::text, 'cancelled'::text, 'return_requested'::text, 'returned'::text, 'refund_pending'::text, 'refunded'::text]))),
    CONSTRAINT orders_payment_status_check CHECK ((payment_status = ANY (ARRAY['unpaid'::text, 'pending'::text, 'paid'::text, 'failed'::text, 'refunded'::text])))
);


ALTER TABLE public.orders OWNER TO postgres;

--
-- Name: orders_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.orders ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.orders_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: payment_events; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payment_events (
    id bigint NOT NULL,
    provider_reference text,
    event_type text,
    raw_payload jsonb,
    processed boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.payment_events OWNER TO postgres;

--
-- Name: payment_events_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.payment_events ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.payment_events_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payments (
    id bigint NOT NULL,
    order_id bigint NOT NULL,
    provider text DEFAULT 'paystack'::text NOT NULL,
    provider_reference text NOT NULL,
    amount integer NOT NULL,
    currency text DEFAULT 'NGN'::text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    paid_at timestamp with time zone,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.payments OWNER TO postgres;

--
-- Name: payments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.payments ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.payments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: product_variants; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_variants (
    id bigint NOT NULL,
    product_id bigint NOT NULL,
    size text,
    color text,
    sku text,
    price_override integer,
    stock integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.product_variants OWNER TO postgres;

--
-- Name: product_variants_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.product_variants ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.product_variants_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: products; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.products (
    id bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    name text,
    price bigint,
    category text,
    is_new boolean DEFAULT false,
    is_featured boolean DEFAULT false,
    image text,
    images text[],
    sizes text[],
    stock bigint DEFAULT 5,
    status text DEFAULT 'active'::text,
    video_url text
);


ALTER TABLE public.products OWNER TO postgres;

--
-- Name: products_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.products ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.products_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: restock_waitlist; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.restock_waitlist (
    id bigint NOT NULL,
    product_id bigint NOT NULL,
    email text NOT NULL,
    notified boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.restock_waitlist OWNER TO postgres;

--
-- Name: restock_waitlist_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.restock_waitlist ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.restock_waitlist_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: return_requests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.return_requests (
    id bigint NOT NULL,
    order_id bigint NOT NULL,
    user_id uuid,
    reason text NOT NULL,
    items jsonb,
    status text DEFAULT 'requested'::text NOT NULL,
    refund_amount integer,
    admin_notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.return_requests OWNER TO postgres;

--
-- Name: return_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.return_requests ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.return_requests_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: reviews; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reviews (
    id bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    product_id text,
    user_id uuid DEFAULT gen_random_uuid(),
    customer_name text,
    rating bigint,
    comment text,
    verified_purchase boolean DEFAULT false,
    image_url text,
    CONSTRAINT reviews_rating_range CHECK (((rating >= 1) AND (rating <= 5)))
);


ALTER TABLE public.reviews OWNER TO postgres;

--
-- Name: reviews_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.reviews ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.reviews_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: shipping_zones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.shipping_zones (
    id bigint NOT NULL,
    name text NOT NULL,
    fee integer NOT NULL,
    estimated_days text,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    is_variable boolean DEFAULT false NOT NULL
);


ALTER TABLE public.shipping_zones OWNER TO postgres;

--
-- Name: shipping_zones_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.shipping_zones ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.shipping_zones_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: site_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.site_settings (
    key text NOT NULL,
    value jsonb
);


ALTER TABLE public.site_settings OWNER TO postgres;

--
-- Name: subscribers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subscribers (
    id bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    email text
);


ALTER TABLE public.subscribers OWNER TO postgres;

--
-- Name: subscribers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.subscribers ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.subscribers_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: testimonials; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.testimonials (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    customer_name text NOT NULL,
    quote text NOT NULL,
    source text,
    active boolean DEFAULT true
);


ALTER TABLE public.testimonials OWNER TO postgres;

--
-- Name: addresses addresses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.addresses
    ADD CONSTRAINT addresses_pkey PRIMARY KEY (id);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: collections collections_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.collections
    ADD CONSTRAINT collections_pkey PRIMARY KEY (id);


--
-- Name: collections collections_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.collections
    ADD CONSTRAINT collections_slug_key UNIQUE (slug);


--
-- Name: contact_messages contact_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contact_messages
    ADD CONSTRAINT contact_messages_pkey PRIMARY KEY (id);


--
-- Name: coupons coupons_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_pkey PRIMARY KEY (id);


--
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- Name: orders orders_order_number_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_order_number_unique UNIQUE (order_number);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: payment_events payment_events_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_events
    ADD CONSTRAINT payment_events_pkey PRIMARY KEY (id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: payments payments_provider_reference_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_provider_reference_key UNIQUE (provider_reference);


--
-- Name: product_variants product_variants_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_variants
    ADD CONSTRAINT product_variants_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: restock_waitlist restock_waitlist_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.restock_waitlist
    ADD CONSTRAINT restock_waitlist_pkey PRIMARY KEY (id);


--
-- Name: restock_waitlist restock_waitlist_product_id_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.restock_waitlist
    ADD CONSTRAINT restock_waitlist_product_id_email_key UNIQUE (product_id, email);


--
-- Name: return_requests return_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.return_requests
    ADD CONSTRAINT return_requests_pkey PRIMARY KEY (id);


--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- Name: shipping_zones shipping_zones_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipping_zones
    ADD CONSTRAINT shipping_zones_name_key UNIQUE (name);


--
-- Name: shipping_zones shipping_zones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipping_zones
    ADD CONSTRAINT shipping_zones_pkey PRIMARY KEY (id);


--
-- Name: site_settings site_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.site_settings
    ADD CONSTRAINT site_settings_pkey PRIMARY KEY (key);


--
-- Name: subscribers subscribers_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscribers
    ADD CONSTRAINT subscribers_email_key UNIQUE (email);


--
-- Name: subscribers subscribers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscribers
    ADD CONSTRAINT subscribers_pkey PRIMARY KEY (id);


--
-- Name: testimonials testimonials_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.testimonials
    ADD CONSTRAINT testimonials_pkey PRIMARY KEY (id);


--
-- Name: reviews unique_user_product_review; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT unique_user_product_review UNIQUE (user_id, product_id);


--
-- Name: reviews trg_compute_verified_purchase; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_compute_verified_purchase BEFORE INSERT OR UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.compute_verified_purchase();


--
-- Name: addresses addresses_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.addresses
    ADD CONSTRAINT addresses_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);


--
-- Name: order_items order_items_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: payments payments_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: product_variants product_variants_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_variants
    ADD CONSTRAINT product_variants_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: restock_waitlist restock_waitlist_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.restock_waitlist
    ADD CONSTRAINT restock_waitlist_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: return_requests return_requests_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.return_requests
    ADD CONSTRAINT return_requests_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: coupons Admin can delete coupons; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin can delete coupons" ON public.coupons FOR DELETE TO authenticated USING (((auth.jwt() ->> 'email'::text) = ANY (ARRAY['Victoriaobioma31@yahoo.com'::text, 'justixxchiobi@gmail.com'::text])));


--
-- Name: products Admin can delete products; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin can delete products" ON public.products FOR DELETE TO authenticated USING (((auth.jwt() ->> 'email'::text) = ANY (ARRAY['Victoriaobioma31@yahoo.com'::text, 'justixxchiobi@gmail.com'::text])));


--
-- Name: coupons Admin can insert coupons; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin can insert coupons" ON public.coupons FOR INSERT TO authenticated WITH CHECK (((auth.jwt() ->> 'email'::text) = ANY (ARRAY['Victoriaobioma31@yahoo.com'::text, 'justixxchiobi@gmail.com'::text])));


--
-- Name: products Admin can insert products; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin can insert products" ON public.products FOR INSERT TO authenticated WITH CHECK (((auth.jwt() ->> 'email'::text) = ANY (ARRAY['Victoriaobioma31@yahoo.com'::text, 'justixxchiobi@gmail.com'::text])));


--
-- Name: categories Admin can manage categories; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin can manage categories" ON public.categories TO authenticated USING (((auth.jwt() ->> 'email'::text) = ANY (ARRAY['Victoriaobioma31@yahoo.com'::text, 'justixxchiobi@gmail.com'::text]))) WITH CHECK (((auth.jwt() ->> 'email'::text) = ANY (ARRAY['Victoriaobioma31@yahoo.com'::text, 'justixxchiobi@gmail.com'::text])));


--
-- Name: collections Admin can manage collections; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin can manage collections" ON public.collections TO authenticated USING (((auth.jwt() ->> 'email'::text) = ANY (ARRAY['Victoriaobioma31@yahoo.com'::text, 'justixxchiobi@gmail.com'::text]))) WITH CHECK (((auth.jwt() ->> 'email'::text) = ANY (ARRAY['Victoriaobioma31@yahoo.com'::text, 'justixxchiobi@gmail.com'::text])));


--
-- Name: site_settings Admin can manage site settings; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin can manage site settings" ON public.site_settings TO authenticated USING (((auth.jwt() ->> 'email'::text) = ANY (ARRAY['Victoriaobioma31@yahoo.com'::text, 'justixxchiobi@gmail.com'::text]))) WITH CHECK (((auth.jwt() ->> 'email'::text) = ANY (ARRAY['Victoriaobioma31@yahoo.com'::text, 'justixxchiobi@gmail.com'::text])));


--
-- Name: testimonials Admin can manage testimonials; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin can manage testimonials" ON public.testimonials TO authenticated USING (((auth.jwt() ->> 'email'::text) = ANY (ARRAY['Victoriaobioma31@yahoo.com'::text, 'justixxchiobi@gmail.com'::text]))) WITH CHECK (((auth.jwt() ->> 'email'::text) = ANY (ARRAY['Victoriaobioma31@yahoo.com'::text, 'justixxchiobi@gmail.com'::text])));


--
-- Name: coupons Admin can update coupons; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin can update coupons" ON public.coupons FOR UPDATE TO authenticated USING (((auth.jwt() ->> 'email'::text) = ANY (ARRAY['Victoriaobioma31@yahoo.com'::text, 'justixxchiobi@gmail.com'::text])));


--
-- Name: contact_messages Admin can update messages; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin can update messages" ON public.contact_messages FOR UPDATE TO authenticated USING (((auth.jwt() ->> 'email'::text) = ANY (ARRAY['Victoriaobioma31@yahoo.com'::text, 'justixxchiobi@gmail.com'::text])));


--
-- Name: orders Admin can update orders; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin can update orders" ON public.orders FOR UPDATE TO authenticated USING (((auth.jwt() ->> 'email'::text) = ANY (ARRAY['Victoriaobioma31@yahoo.com'::text, 'justixxchiobi@gmail.com'::text])));


--
-- Name: products Admin can update products; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin can update products" ON public.products FOR UPDATE TO authenticated USING (((auth.jwt() ->> 'email'::text) = ANY (ARRAY['Victoriaobioma31@yahoo.com'::text, 'justixxchiobi@gmail.com'::text])));


--
-- Name: orders Admin can view all orders; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin can view all orders" ON public.orders FOR SELECT TO authenticated USING (((auth.jwt() ->> 'email'::text) = ANY (ARRAY['Victoriaobioma31@yahoo.com'::text, 'justixxchiobi@gmail.com'::text])));


--
-- Name: contact_messages Admin can view messages; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin can view messages" ON public.contact_messages FOR SELECT TO authenticated USING (((auth.jwt() ->> 'email'::text) = ANY (ARRAY['Victoriaobioma31@yahoo.com'::text, 'justixxchiobi@gmail.com'::text])));


--
-- Name: coupons Admins can delete coupons; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can delete coupons" ON public.coupons FOR DELETE USING (public.is_admin());


--
-- Name: products Admins can delete products; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can delete products" ON public.products FOR DELETE USING (public.is_admin());


--
-- Name: coupons Admins can insert coupons; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can insert coupons" ON public.coupons FOR INSERT WITH CHECK (public.is_admin());


--
-- Name: products Admins can insert products; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can insert products" ON public.products FOR INSERT WITH CHECK (public.is_admin());


--
-- Name: contact_messages Admins can read/update contact messages; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can read/update contact messages" ON public.contact_messages USING (public.is_admin()) WITH CHECK (public.is_admin());


--
-- Name: coupons Admins can update coupons; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can update coupons" ON public.coupons FOR UPDATE USING (public.is_admin());


--
-- Name: products Admins can update products; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can update products" ON public.products FOR UPDATE USING (public.is_admin());


--
-- Name: categories Admins manage categories; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins manage categories" ON public.categories USING (public.is_admin()) WITH CHECK (public.is_admin());


--
-- Name: collections Admins manage collections; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins manage collections" ON public.collections USING (public.is_admin()) WITH CHECK (public.is_admin());


--
-- Name: order_items Admins manage order_items; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins manage order_items" ON public.order_items USING (public.is_admin()) WITH CHECK (public.is_admin());


--
-- Name: orders Admins manage orders; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins manage orders" ON public.orders USING (public.is_admin()) WITH CHECK (public.is_admin());


--
-- Name: payment_events Admins manage payment_events; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins manage payment_events" ON public.payment_events USING (public.is_admin()) WITH CHECK (public.is_admin());


--
-- Name: payments Admins manage payments; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins manage payments" ON public.payments USING (public.is_admin()) WITH CHECK (public.is_admin());


--
-- Name: return_requests Admins manage returns; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins manage returns" ON public.return_requests USING (public.is_admin()) WITH CHECK (public.is_admin());


--
-- Name: shipping_zones Admins manage shipping zones; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins manage shipping zones" ON public.shipping_zones USING (public.is_admin()) WITH CHECK (public.is_admin());


--
-- Name: site_settings Admins manage site settings; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins manage site settings" ON public.site_settings USING (public.is_admin()) WITH CHECK (public.is_admin());


--
-- Name: testimonials Admins manage testimonials; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins manage testimonials" ON public.testimonials USING (public.is_admin()) WITH CHECK (public.is_admin());


--
-- Name: product_variants Admins manage variants; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins manage variants" ON public.product_variants USING (public.is_admin()) WITH CHECK (public.is_admin());


--
-- Name: restock_waitlist Admins manage waitlist; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins manage waitlist" ON public.restock_waitlist USING (public.is_admin()) WITH CHECK (public.is_admin());


--
-- Name: contact_messages Anyone can insert contact messages; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Anyone can insert contact messages" ON public.contact_messages FOR INSERT WITH CHECK (true);


--
-- Name: restock_waitlist Anyone can join a waitlist; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Anyone can join a waitlist" ON public.restock_waitlist FOR INSERT WITH CHECK (true);


--
-- Name: reviews Anyone can read reviews; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Anyone can read reviews" ON public.reviews FOR SELECT USING (true);


--
-- Name: contact_messages Anyone can send a message; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Anyone can send a message" ON public.contact_messages FOR INSERT WITH CHECK (true);


--
-- Name: subscribers Anyone can subscribe; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Anyone can subscribe" ON public.subscribers FOR INSERT WITH CHECK (true);


--
-- Name: coupons Anyone can view active coupons; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Anyone can view active coupons" ON public.coupons FOR SELECT USING ((active = true));


--
-- Name: testimonials Anyone can view active testimonials; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Anyone can view active testimonials" ON public.testimonials FOR SELECT USING ((active = true));


--
-- Name: categories Anyone can view categories; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Anyone can view categories" ON public.categories FOR SELECT USING (true);


--
-- Name: collections Anyone can view collections; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Anyone can view collections" ON public.collections FOR SELECT USING (true);


--
-- Name: site_settings Anyone can view site settings; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Anyone can view site settings" ON public.site_settings FOR SELECT USING (true);


--
-- Name: reviews Logged in users can add reviews; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Logged in users can add reviews" ON public.reviews FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));


--
-- Name: shipping_zones Public can read active shipping zones; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Public can read active shipping zones" ON public.shipping_zones FOR SELECT USING ((active = true));


--
-- Name: categories Public can read categories; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Public can read categories" ON public.categories FOR SELECT USING (true);


--
-- Name: collections Public can read collections; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Public can read collections" ON public.collections FOR SELECT USING (true);


--
-- Name: coupons Public can read coupons; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Public can read coupons" ON public.coupons FOR SELECT USING (true);


--
-- Name: products Public can read products; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Public can read products" ON public.products FOR SELECT USING (true);


--
-- Name: site_settings Public can read site settings; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Public can read site settings" ON public.site_settings FOR SELECT USING (true);


--
-- Name: testimonials Public can read testimonials; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Public can read testimonials" ON public.testimonials FOR SELECT USING (true);


--
-- Name: product_variants Public can read variants; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Public can read variants" ON public.product_variants FOR SELECT USING (true);


--
-- Name: products Public read access; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Public read access" ON public.products FOR SELECT USING (true);


--
-- Name: orders Users can insert their own orders; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can insert their own orders" ON public.orders FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));


--
-- Name: orders Users can view their own orders; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can view their own orders" ON public.orders FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: addresses Users manage their own addresses; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users manage their own addresses" ON public.addresses TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: return_requests Users request returns on their own orders; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users request returns on their own orders" ON public.return_requests FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.orders
  WHERE ((orders.id = return_requests.order_id) AND (orders.user_id = auth.uid())))));


--
-- Name: order_items Users view their own order_items; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users view their own order_items" ON public.order_items FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.orders
  WHERE ((orders.id = order_items.order_id) AND (orders.user_id = auth.uid())))));


--
-- Name: return_requests Users view their own returns; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users view their own returns" ON public.return_requests FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.orders
  WHERE ((orders.id = return_requests.order_id) AND (orders.user_id = auth.uid())))));


--
-- Name: addresses; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;

--
-- Name: categories; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

--
-- Name: collections; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;

--
-- Name: contact_messages; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

--
-- Name: coupons; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

--
-- Name: order_items; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

--
-- Name: orders; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

--
-- Name: payment_events; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.payment_events ENABLE ROW LEVEL SECURITY;

--
-- Name: payments; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

--
-- Name: product_variants; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

--
-- Name: products; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

--
-- Name: restock_waitlist; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.restock_waitlist ENABLE ROW LEVEL SECURITY;

--
-- Name: return_requests; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.return_requests ENABLE ROW LEVEL SECURITY;

--
-- Name: reviews; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

--
-- Name: shipping_zones; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.shipping_zones ENABLE ROW LEVEL SECURITY;

--
-- Name: site_settings; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

--
-- Name: subscribers; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

--
-- Name: testimonials; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT USAGE ON SCHEMA public TO postgres;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;


--
-- Name: FUNCTION compute_verified_purchase(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.compute_verified_purchase() TO anon;
GRANT ALL ON FUNCTION public.compute_verified_purchase() TO authenticated;
GRANT ALL ON FUNCTION public.compute_verified_purchase() TO service_role;


--
-- Name: FUNCTION confirm_manual_payment(p_order_id bigint, p_reference text, p_amount integer, p_verified_via text, p_items jsonb); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.confirm_manual_payment(p_order_id bigint, p_reference text, p_amount integer, p_verified_via text, p_items jsonb) TO anon;
GRANT ALL ON FUNCTION public.confirm_manual_payment(p_order_id bigint, p_reference text, p_amount integer, p_verified_via text, p_items jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.confirm_manual_payment(p_order_id bigint, p_reference text, p_amount integer, p_verified_via text, p_items jsonb) TO service_role;


--
-- Name: FUNCTION confirm_paid_order(p_order_id bigint, p_reference text, p_amount integer, p_currency text, p_channel text, p_gateway_response text, p_items jsonb); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.confirm_paid_order(p_order_id bigint, p_reference text, p_amount integer, p_currency text, p_channel text, p_gateway_response text, p_items jsonb) TO anon;
GRANT ALL ON FUNCTION public.confirm_paid_order(p_order_id bigint, p_reference text, p_amount integer, p_currency text, p_channel text, p_gateway_response text, p_items jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.confirm_paid_order(p_order_id bigint, p_reference text, p_amount integer, p_currency text, p_channel text, p_gateway_response text, p_items jsonb) TO service_role;


--
-- Name: FUNCTION decrement_stock(product_id bigint, qty integer); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.decrement_stock(product_id bigint, qty integer) TO anon;
GRANT ALL ON FUNCTION public.decrement_stock(product_id bigint, qty integer) TO authenticated;
GRANT ALL ON FUNCTION public.decrement_stock(product_id bigint, qty integer) TO service_role;


--
-- Name: FUNCTION decrement_variant_stock(variant_id bigint, qty integer); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.decrement_variant_stock(variant_id bigint, qty integer) TO anon;
GRANT ALL ON FUNCTION public.decrement_variant_stock(variant_id bigint, qty integer) TO authenticated;
GRANT ALL ON FUNCTION public.decrement_variant_stock(variant_id bigint, qty integer) TO service_role;


--
-- Name: FUNCTION get_order_by_reference(order_num text, phone text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.get_order_by_reference(order_num text, phone text) TO anon;
GRANT ALL ON FUNCTION public.get_order_by_reference(order_num text, phone text) TO authenticated;
GRANT ALL ON FUNCTION public.get_order_by_reference(order_num text, phone text) TO service_role;


--
-- Name: FUNCTION increment_coupon_usage(coupon_id bigint); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.increment_coupon_usage(coupon_id bigint) TO anon;
GRANT ALL ON FUNCTION public.increment_coupon_usage(coupon_id bigint) TO authenticated;
GRANT ALL ON FUNCTION public.increment_coupon_usage(coupon_id bigint) TO service_role;


--
-- Name: FUNCTION is_admin(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.is_admin() TO anon;
GRANT ALL ON FUNCTION public.is_admin() TO authenticated;
GRANT ALL ON FUNCTION public.is_admin() TO service_role;


--
-- Name: FUNCTION process_order_confirmation_items(p_order_id bigint, p_items jsonb); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.process_order_confirmation_items(p_order_id bigint, p_items jsonb) TO anon;
GRANT ALL ON FUNCTION public.process_order_confirmation_items(p_order_id bigint, p_items jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.process_order_confirmation_items(p_order_id bigint, p_items jsonb) TO service_role;


--
-- Name: FUNCTION rls_auto_enable(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.rls_auto_enable() TO anon;
GRANT ALL ON FUNCTION public.rls_auto_enable() TO authenticated;
GRANT ALL ON FUNCTION public.rls_auto_enable() TO service_role;


--
-- Name: TABLE addresses; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.addresses TO anon;
GRANT ALL ON TABLE public.addresses TO authenticated;
GRANT ALL ON TABLE public.addresses TO service_role;


--
-- Name: TABLE categories; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.categories TO anon;
GRANT ALL ON TABLE public.categories TO authenticated;
GRANT ALL ON TABLE public.categories TO service_role;


--
-- Name: TABLE collections; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.collections TO anon;
GRANT ALL ON TABLE public.collections TO authenticated;
GRANT ALL ON TABLE public.collections TO service_role;


--
-- Name: TABLE contact_messages; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.contact_messages TO anon;
GRANT ALL ON TABLE public.contact_messages TO authenticated;
GRANT ALL ON TABLE public.contact_messages TO service_role;


--
-- Name: TABLE coupons; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.coupons TO anon;
GRANT ALL ON TABLE public.coupons TO authenticated;
GRANT ALL ON TABLE public.coupons TO service_role;


--
-- Name: SEQUENCE coupons_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.coupons_id_seq TO anon;
GRANT ALL ON SEQUENCE public.coupons_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.coupons_id_seq TO service_role;


--
-- Name: TABLE order_items; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.order_items TO anon;
GRANT ALL ON TABLE public.order_items TO authenticated;
GRANT ALL ON TABLE public.order_items TO service_role;


--
-- Name: SEQUENCE order_items_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.order_items_id_seq TO anon;
GRANT ALL ON SEQUENCE public.order_items_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.order_items_id_seq TO service_role;


--
-- Name: TABLE orders; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.orders TO anon;
GRANT ALL ON TABLE public.orders TO authenticated;
GRANT ALL ON TABLE public.orders TO service_role;


--
-- Name: SEQUENCE orders_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.orders_id_seq TO anon;
GRANT ALL ON SEQUENCE public.orders_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.orders_id_seq TO service_role;


--
-- Name: TABLE payment_events; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.payment_events TO anon;
GRANT ALL ON TABLE public.payment_events TO authenticated;
GRANT ALL ON TABLE public.payment_events TO service_role;


--
-- Name: SEQUENCE payment_events_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.payment_events_id_seq TO anon;
GRANT ALL ON SEQUENCE public.payment_events_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.payment_events_id_seq TO service_role;


--
-- Name: TABLE payments; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.payments TO anon;
GRANT ALL ON TABLE public.payments TO authenticated;
GRANT ALL ON TABLE public.payments TO service_role;


--
-- Name: SEQUENCE payments_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.payments_id_seq TO anon;
GRANT ALL ON SEQUENCE public.payments_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.payments_id_seq TO service_role;


--
-- Name: TABLE product_variants; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.product_variants TO anon;
GRANT ALL ON TABLE public.product_variants TO authenticated;
GRANT ALL ON TABLE public.product_variants TO service_role;


--
-- Name: SEQUENCE product_variants_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.product_variants_id_seq TO anon;
GRANT ALL ON SEQUENCE public.product_variants_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.product_variants_id_seq TO service_role;


--
-- Name: TABLE products; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.products TO anon;
GRANT ALL ON TABLE public.products TO authenticated;
GRANT ALL ON TABLE public.products TO service_role;


--
-- Name: SEQUENCE products_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.products_id_seq TO anon;
GRANT ALL ON SEQUENCE public.products_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.products_id_seq TO service_role;


--
-- Name: TABLE restock_waitlist; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.restock_waitlist TO anon;
GRANT ALL ON TABLE public.restock_waitlist TO authenticated;
GRANT ALL ON TABLE public.restock_waitlist TO service_role;


--
-- Name: SEQUENCE restock_waitlist_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.restock_waitlist_id_seq TO anon;
GRANT ALL ON SEQUENCE public.restock_waitlist_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.restock_waitlist_id_seq TO service_role;


--
-- Name: TABLE return_requests; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.return_requests TO anon;
GRANT ALL ON TABLE public.return_requests TO authenticated;
GRANT ALL ON TABLE public.return_requests TO service_role;


--
-- Name: SEQUENCE return_requests_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.return_requests_id_seq TO anon;
GRANT ALL ON SEQUENCE public.return_requests_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.return_requests_id_seq TO service_role;


--
-- Name: TABLE reviews; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.reviews TO anon;
GRANT ALL ON TABLE public.reviews TO authenticated;
GRANT ALL ON TABLE public.reviews TO service_role;


--
-- Name: SEQUENCE reviews_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.reviews_id_seq TO anon;
GRANT ALL ON SEQUENCE public.reviews_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.reviews_id_seq TO service_role;


--
-- Name: TABLE shipping_zones; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.shipping_zones TO anon;
GRANT ALL ON TABLE public.shipping_zones TO authenticated;
GRANT ALL ON TABLE public.shipping_zones TO service_role;


--
-- Name: SEQUENCE shipping_zones_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.shipping_zones_id_seq TO anon;
GRANT ALL ON SEQUENCE public.shipping_zones_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.shipping_zones_id_seq TO service_role;


--
-- Name: TABLE site_settings; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.site_settings TO anon;
GRANT ALL ON TABLE public.site_settings TO authenticated;
GRANT ALL ON TABLE public.site_settings TO service_role;


--
-- Name: TABLE subscribers; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.subscribers TO anon;
GRANT ALL ON TABLE public.subscribers TO authenticated;
GRANT ALL ON TABLE public.subscribers TO service_role;


--
-- Name: SEQUENCE subscribers_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.subscribers_id_seq TO anon;
GRANT ALL ON SEQUENCE public.subscribers_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.subscribers_id_seq TO service_role;


--
-- Name: TABLE testimonials; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.testimonials TO anon;
GRANT ALL ON TABLE public.testimonials TO authenticated;
GRANT ALL ON TABLE public.testimonials TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO service_role;


--
-- PostgreSQL database dump complete
--

\unrestrict qNWudbe02Wz3eK3rEVVpR21tG73QufhUw1wyzM7FBDieI2c5U3rqG81tadp9mjF

