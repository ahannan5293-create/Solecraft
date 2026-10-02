-- ============================================================
-- EXTENSIONS
-- ============================================================
create extension if not exists "pgcrypto";

-- ============================================================
-- PROFILES
-- ============================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  full_name text,
  role text not null default 'customer' check (role in ('customer','admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- ============================================================
-- PRODUCTS, IMAGES, SIZES, COLORS
-- ============================================================
create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text,
  category text not null check (category in ('men','women','kids','unisex')),
  price numeric(10,2) not null check (price >= 0),
  original_price numeric(10,2) check (original_price >= 0),
  badge text check (badge in ('new','bestseller','sale')),
  is_new boolean not null default false,
  is_limited_edition boolean not null default false,
  rating numeric(2,1) check (rating between 0 and 5),
  review_count integer not null default 0,
  model_3d_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  url text not null,
  display_order integer not null default 0,
  alt_text text
);

create table public.product_sizes (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  size text not null,
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  sku text unique,
  unique (product_id, size)
);

create table public.product_colors (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  name text not null,
  hex text not null
);

create index idx_products_category on public.products(category);
create index idx_products_is_active on public.products(is_active);
create index idx_product_images_product on public.product_images(product_id);
create index idx_product_sizes_product on public.product_sizes(product_id);
create index idx_product_colors_product on public.product_colors(product_id);

alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.product_sizes enable row level security;
alter table public.product_colors enable row level security;

-- ============================================================
-- WISHLISTS
-- ============================================================
create table public.wishlists (
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

alter table public.wishlists enable row level security;

-- ============================================================
-- ORDERS + ORDER ITEMS
-- ============================================================
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete restrict,
  status text not null default 'pending' check (status in ('pending','paid','failed','cancelled','fulfilled','refunded')),
  subtotal numeric(10,2) not null check (subtotal >= 0),
  shipping_cost numeric(10,2) not null default 0 check (shipping_cost >= 0),
  total numeric(10,2) not null check (total >= 0),
  currency text not null default 'PKR',
  shipping_address jsonb not null,
  contact_email text not null,
  contact_phone text,
  payment_gateway text default 'safepay',
  payment_reference text,
  payment_signature text,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  product_image_url text,
  size text,
  unit_price numeric(10,2) not null check (unit_price >= 0),
  quantity integer not null check (quantity > 0)
);

create index idx_orders_user on public.orders(user_id);
create index idx_order_items_order on public.order_items(order_id);

alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- ============================================================
-- updated_at TRIGGER (generic)
-- ============================================================
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger trg_products_updated_at before update on public.products
  for each row execute function public.set_updated_at();
create trigger trg_orders_updated_at before update on public.orders
  for each row execute function public.set_updated_at();

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email,'@',1) || '_' || substr(new.id::text,1,6)),
    new.raw_user_meta_data->>'full_name',
    'customer'
  );
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- is_admin() HELPER (security definer avoids RLS recursion)
-- ============================================================
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer stable set search_path = public;

-- ============================================================
-- ROLE ESCALATION GUARD — the load-bearing security trigger
-- ============================================================
create or replace function public.prevent_role_self_escalation()
returns trigger as $$
begin
  if new.role is distinct from old.role then
    if not public.is_admin() then
      raise exception 'Only admins can change role';
    end if;
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger trg_prevent_role_escalation
  before update on public.profiles
  for each row execute function public.prevent_role_self_escalation();

-- ============================================================
-- RLS POLICIES — profiles
-- ============================================================
create policy "profiles_select" on public.profiles for select
  using (auth.uid() = id or public.is_admin());

create policy "profiles_update" on public.profiles for update
  using (auth.uid() = id or public.is_admin())
  with check (auth.uid() = id or public.is_admin());
-- no insert policy: rows are only created via the handle_new_user trigger

-- ============================================================
-- RLS POLICIES — products / images / sizes / colors
-- ============================================================
create policy "products_select_public" on public.products for select
  using (is_active = true or public.is_admin());
create policy "products_admin_insert" on public.products for insert
  with check (public.is_admin());
create policy "products_admin_update" on public.products for update
  using (public.is_admin()) with check (public.is_admin());
create policy "products_admin_delete" on public.products for delete
  using (public.is_admin());

create policy "product_images_select" on public.product_images for select
  using (exists (select 1 from public.products p where p.id = product_id and (p.is_active or public.is_admin())));
create policy "product_images_admin_write" on public.product_images for all
  using (public.is_admin()) with check (public.is_admin());

create policy "product_sizes_select" on public.product_sizes for select
  using (exists (select 1 from public.products p where p.id = product_id and (p.is_active or public.is_admin())));
create policy "product_sizes_admin_write" on public.product_sizes for all
  using (public.is_admin()) with check (public.is_admin());

create policy "product_colors_select" on public.product_colors for select
  using (exists (select 1 from public.products p where p.id = product_id and (p.is_active or public.is_admin())));
create policy "product_colors_admin_write" on public.product_colors for all
  using (public.is_admin()) with check (public.is_admin());

-- ============================================================
-- RLS POLICIES — wishlists (owner only)
-- ============================================================
create policy "wishlists_owner_select" on public.wishlists for select
  using (auth.uid() = user_id);
create policy "wishlists_owner_insert" on public.wishlists for insert
  with check (auth.uid() = user_id);
create policy "wishlists_owner_delete" on public.wishlists for delete
  using (auth.uid() = user_id);

-- ============================================================
-- RLS POLICIES — orders (the critical one)
-- ============================================================
create policy "orders_select" on public.orders for select
  using (auth.uid() = user_id or public.is_admin());

create policy "orders_insert_own_pending" on public.orders for insert
  with check (auth.uid() = user_id and status = 'pending');

-- Deliberately NO update policy for regular users — not even for their own orders.
-- Status changes (pending -> paid) happen ONLY via the service-role webhook handler,
-- which bypasses RLS entirely and is never reachable from the browser.
create policy "orders_update_admin_only" on public.orders for update
  using (public.is_admin()) with check (public.is_admin());

-- ============================================================
-- RLS POLICIES — order_items
-- ============================================================
create policy "order_items_select" on public.order_items for select
  using (
    exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.is_admin()))
  );
create policy "order_items_insert_own_pending_order" on public.order_items for insert
  with check (
    exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid() and o.status = 'pending')
  );
-- No update/delete policy for regular users on order_items: once inserted, line items are immutable from the client.
