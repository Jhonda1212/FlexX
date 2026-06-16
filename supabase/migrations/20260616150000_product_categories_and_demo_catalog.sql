create table if not exists public.product_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists product_categories_active_sort_idx
  on public.product_categories (active, sort_order, name);

do $$
begin
  if not exists (
    select 1 from pg_trigger
    where tgname = 'product_categories_updated_at'
      and tgrelid = 'public.product_categories'::regclass
  ) then
    create trigger product_categories_updated_at
    before update on public.product_categories
    for each row execute function public.set_updated_at();
  end if;
end
$$;

alter table public.products
  add column if not exists category_id uuid references public.product_categories(id) on delete set null,
  add column if not exists slug text,
  add column if not exists price_cents integer,
  add column if not exists currency text not null default 'eur',
  add column if not exists image_url text,
  add column if not exists stock_quantity integer,
  add column if not exists tags text[] not null default '{}';

update public.products
set
  price_cents = coalesce(price_cents, round(price * 100)::integer),
  currency = coalesce(nullif(currency, ''), 'eur'),
  image_url = coalesce(image_url, image),
  tags = coalesce(tags, '{}')
where price_cents is null
   or currency is null
   or currency = ''
   or (image_url is null and image is not null)
   or tags is null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'products_price_cents_non_negative'
      and conrelid = 'public.products'::regclass
  ) then
    alter table public.products
      add constraint products_price_cents_non_negative check (price_cents is null or price_cents >= 0);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'products_stock_quantity_non_negative'
      and conrelid = 'public.products'::regclass
  ) then
    alter table public.products
      add constraint products_stock_quantity_non_negative check (stock_quantity is null or stock_quantity >= 0);
  end if;
end
$$;

create unique index if not exists products_slug_unique_idx
  on public.products (slug)
  where slug is not null;

create index if not exists products_category_id_idx on public.products (category_id);
create index if not exists products_price_cents_idx on public.products (price_cents);

alter table public.product_categories enable row level security;

grant select, insert, update, delete on table public.product_categories to authenticated;
grant select, insert, update, delete on table public.products to authenticated;
grant all on table public.product_categories to service_role;
grant all on table public.products to service_role;

drop policy if exists "authenticated read active product categories" on public.product_categories;
drop policy if exists "staff read all product categories" on public.product_categories;
drop policy if exists "staff manage product categories" on public.product_categories;

create policy "authenticated read active product categories"
  on public.product_categories
  for select
  to authenticated
  using (active = true);

create policy "staff read all product categories"
  on public.product_categories
  for select
  to authenticated
  using (public.current_staff_role() is not null);

create policy "staff manage product categories"
  on public.product_categories
  for all
  to authenticated
  using (public.current_staff_role() is not null)
  with check (public.current_staff_role() is not null);

drop policy if exists "staff manage products" on public.products;

create policy "staff manage products"
  on public.products
  for all
  to authenticated
  using (public.current_staff_role() is not null)
  with check (public.current_staff_role() is not null);

create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  name text not null,
  price_delta_cents integer not null default 0,
  stock_quantity integer,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint product_variants_stock_quantity_non_negative check (stock_quantity is null or stock_quantity >= 0)
);

create index if not exists product_variants_product_id_idx on public.product_variants (product_id);
create index if not exists product_variants_active_idx on public.product_variants (active);

do $$
begin
  if not exists (
    select 1 from pg_trigger
    where tgname = 'product_variants_updated_at'
      and tgrelid = 'public.product_variants'::regclass
  ) then
    create trigger product_variants_updated_at
    before update on public.product_variants
    for each row execute function public.set_updated_at();
  end if;
end
$$;

alter table public.product_variants enable row level security;

grant select, insert, update, delete on table public.product_variants to authenticated;
grant all on table public.product_variants to service_role;

drop policy if exists "authenticated read active product variants" on public.product_variants;
drop policy if exists "staff read all product variants" on public.product_variants;
drop policy if exists "staff manage product variants" on public.product_variants;

create policy "authenticated read active product variants"
  on public.product_variants
  for select
  to authenticated
  using (
    active = true
    and exists (
      select 1
      from public.products p
      where p.id = product_id
        and p.active = true
    )
  );

create policy "staff read all product variants"
  on public.product_variants
  for select
  to authenticated
  using (public.current_staff_role() is not null);

create policy "staff manage product variants"
  on public.product_variants
  for all
  to authenticated
  using (public.current_staff_role() is not null)
  with check (public.current_staff_role() is not null);

with seed_categories (
  id,
  name,
  slug,
  description,
  sort_order,
  active
) as (
  values
    ('66666666-6666-4666-8666-666666666001'::uuid, 'VIP', 'vip', 'Reservas y experiencias privadas.', 10, true),
    ('66666666-6666-4666-8666-666666666002'::uuid, 'Premium', 'premium', 'Botellas premium para mesa.', 20, true),
    ('66666666-6666-4666-8666-666666666003'::uuid, 'Champagnes', 'champagnes', 'Champagnes y espumosos.', 30, true),
    ('66666666-6666-4666-8666-666666666004'::uuid, 'Estandar', 'standard', 'Bebidas estandar de barra.', 40, true),
    ('66666666-6666-4666-8666-666666666005'::uuid, 'Cocktails', 'cocktails', 'Cocktails de la casa.', 50, true),
    ('66666666-6666-4666-8666-666666666006'::uuid, 'Refrescos y Energeticas', 'refreshments', 'Mixers, refrescos y energeticas.', 60, true),
    ('66666666-6666-4666-8666-666666666007'::uuid, 'Cachimbas', 'shishas', 'Cachimbas y sabores premium.', 70, true)
)
insert into public.product_categories (
  id,
  name,
  slug,
  description,
  sort_order,
  active
)
select
  id,
  name,
  slug,
  description,
  sort_order,
  active
from seed_categories
on conflict (slug) do update
set
  name = excluded.name,
  description = excluded.description,
  sort_order = excluded.sort_order,
  active = excluded.active;

with category_map as (
  select id, slug
  from public.product_categories
),
seed_products (
  id,
  category_slug,
  name,
  slug,
  description,
  price_cents,
  currency,
  image_url,
  stock_quantity,
  active,
  featured,
  tags
) as (
  values
    ('77777777-7777-4777-8777-777777777001'::uuid, 'vip', 'Mesa VIP Oro', 'mesa-vip-oro', 'Reserva privada para grupos con atencion prioritaria.', 15000, 'eur', null::text, 6, true, true, array['vip','mesa']),
    ('77777777-7777-4777-8777-777777777002'::uuid, 'champagnes', 'Botella Moet', 'botella-moet', 'Champagne Moet para celebraciones en mesa.', 9500, 'eur', null::text, 12, true, true, array['champagne']),
    ('77777777-7777-4777-8777-777777777003'::uuid, 'premium', 'Botella Don Julio 70', 'botella-don-julio-70', 'Tequila premium para servicio de mesa.', 14000, 'eur', null::text, 8, true, true, array['tequila','premium']),
    ('77777777-7777-4777-8777-777777777004'::uuid, 'standard', 'Cerveza Corona', 'cerveza-corona', 'Cerveza fria de barra.', 600, 'eur', null::text, 80, true, false, array['cerveza']),
    ('77777777-7777-4777-8777-777777777005'::uuid, 'cocktails', 'Cocktail Margarita', 'cocktail-margarita', 'Margarita clasica preparada al momento.', 1200, 'eur', null::text, 40, true, true, array['cocktail']),
    ('77777777-7777-4777-8777-777777777006'::uuid, 'refreshments', 'Red Bull', 'red-bull', 'Bebida energetica para acompanar copas.', 500, 'eur', null::text, 60, true, false, array['energetica']),
    ('77777777-7777-4777-8777-777777777007'::uuid, 'shishas', 'Cachimba Premium', 'cachimba-premium', 'Cachimba premium con sabor a elegir.', 2500, 'eur', null::text, 10, true, true, array['cachimba'])
)
insert into public.products (
  id,
  category_id,
  name,
  slug,
  description,
  price,
  price_cents,
  currency,
  image,
  image_url,
  category,
  stock_quantity,
  active,
  featured,
  tags
)
select
  seed_products.id,
  category_map.id,
  seed_products.name,
  seed_products.slug,
  seed_products.description,
  seed_products.price_cents / 100.0,
  seed_products.price_cents,
  seed_products.currency,
  seed_products.image_url,
  seed_products.image_url,
  product_categories.name,
  seed_products.stock_quantity,
  seed_products.active,
  seed_products.featured,
  seed_products.tags
from seed_products
join category_map on category_map.slug = seed_products.category_slug
join public.product_categories on product_categories.id = category_map.id
on conflict (id) do update
set
  category_id = excluded.category_id,
  name = excluded.name,
  slug = excluded.slug,
  description = excluded.description,
  price = excluded.price,
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  image = excluded.image,
  image_url = excluded.image_url,
  category = excluded.category,
  stock_quantity = excluded.stock_quantity,
  active = excluded.active,
  featured = excluded.featured,
  tags = excluded.tags;

update public.products p
set category_id = c.id
from public.product_categories c
where p.category_id is null
  and lower(p.category) in (
    lower(c.name),
    case c.slug
      when 'vip' then 'reservados vip'
      when 'premium' then 'botellas premium'
      when 'standard' then 'botellas estandar'
      when 'refreshments' then 'refrescos y energeticas'
      when 'shishas' then 'cachimbas / shishas'
      else lower(c.name)
    end
  );
