create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null,
  price numeric(10, 2) not null check (price >= 0),
  image text,
  category text not null,
  active boolean not null default true,
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_category_idx on public.products (category);
create index if not exists products_active_idx on public.products (active);
create index if not exists products_featured_idx on public.products (featured);

do $$
begin
  if not exists (
    select 1 from pg_trigger
    where tgname = 'products_updated_at'
      and tgrelid = 'public.products'::regclass
  ) then
    create trigger products_updated_at
    before update on public.products
    for each row execute function public.set_updated_at();
  end if;
end
$$;

alter table public.products enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'products'
      and policyname = 'authenticated read active products'
  ) then
    create policy "authenticated read active products"
      on public.products
      for select
      to authenticated
      using (active = true);
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'products'
      and policyname = 'staff read all products'
  ) then
    create policy "staff read all products"
      on public.products
      for select
      to authenticated
      using (public.current_staff_role() is not null);
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'products'
      and policyname = 'admin insert products'
  ) then
    create policy "admin insert products"
      on public.products
      for insert
      to authenticated
      with check (public.is_admin());
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'products'
      and policyname = 'admin update products'
  ) then
    create policy "admin update products"
      on public.products
      for update
      to authenticated
      using (public.is_admin())
      with check (public.is_admin());
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'products'
      and policyname = 'admin delete products'
  ) then
    create policy "admin delete products"
      on public.products
      for delete
      to authenticated
      using (public.is_admin());
  end if;
end
$$;
