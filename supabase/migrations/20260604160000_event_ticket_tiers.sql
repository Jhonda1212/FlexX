create table if not exists public.event_ticket_tiers (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  name text not null,
  zone_name text,
  description text,
  price_cents integer not null check (price_cents >= 0),
  currency text not null default 'EUR',
  capacity integer check (capacity is null or capacity >= 0),
  available_quantity integer check (available_quantity is null or available_quantity >= 0),
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists event_ticket_tiers_event_id_idx
  on public.event_ticket_tiers (event_id);

create index if not exists event_ticket_tiers_active_idx
  on public.event_ticket_tiers (active);

create index if not exists event_ticket_tiers_sort_order_idx
  on public.event_ticket_tiers (sort_order);

do $$
begin
  if not exists (
    select 1 from pg_trigger
    where tgname = 'event_ticket_tiers_updated_at'
      and tgrelid = 'public.event_ticket_tiers'::regclass
  ) then
    create trigger event_ticket_tiers_updated_at
    before update on public.event_ticket_tiers
    for each row execute function public.set_updated_at();
  end if;
end
$$;

alter table public.event_ticket_tiers enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'event_ticket_tiers'
      and policyname = 'authenticated read active tiers for published events'
  ) then
    create policy "authenticated read active tiers for published events"
      on public.event_ticket_tiers
      for select
      to authenticated
      using (
        active = true
        and exists (
          select 1
          from public.events event
          where event.id = public.event_ticket_tiers.event_id
            and event.is_published = true
        )
      );
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'event_ticket_tiers'
      and policyname = 'staff read all event ticket tiers'
  ) then
    create policy "staff read all event ticket tiers"
      on public.event_ticket_tiers
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
      and tablename = 'event_ticket_tiers'
      and policyname = 'admin insert event ticket tiers'
  ) then
    create policy "admin insert event ticket tiers"
      on public.event_ticket_tiers
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
      and tablename = 'event_ticket_tiers'
      and policyname = 'admin update event ticket tiers'
  ) then
    create policy "admin update event ticket tiers"
      on public.event_ticket_tiers
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
      and tablename = 'event_ticket_tiers'
      and policyname = 'admin delete event ticket tiers'
  ) then
    create policy "admin delete event ticket tiers"
      on public.event_ticket_tiers
      for delete
      to authenticated
      using (public.is_admin());
  end if;
end
$$;
