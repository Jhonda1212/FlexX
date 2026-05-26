do $$
begin
  if not exists (select 1 from pg_type where typname = 'feed_post_type' and typnamespace = 'public'::regnamespace) then
    create type public.feed_post_type as enum (
      'event',
      'promotion',
      'activity',
      'announcement',
      'vip',
      'stage',
      'security',
      'storage'
    );
  end if;
end
$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'feed_priority' and typnamespace = 'public'::regnamespace) then
    create type public.feed_priority as enum (
      'low',
      'normal',
      'high',
      'urgent'
    );
  end if;
end
$$;

create table if not exists public.daily_feed_posts (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references public.events(id) on delete set null,
  zone_id uuid references public.club_zones(id) on delete set null,
  created_by uuid references public.profiles(id) on delete set null,
  title text not null,
  body text,
  type public.feed_post_type not null default 'announcement',
  priority public.feed_priority not null default 'normal',
  starts_at timestamptz,
  ends_at timestamptz,
  cta_label text,
  cta_url text,
  is_published boolean not null default false,
  is_pinned boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists daily_feed_posts_is_published_idx on public.daily_feed_posts (is_published);
create index if not exists daily_feed_posts_starts_at_idx on public.daily_feed_posts (starts_at);
create index if not exists daily_feed_posts_event_id_idx on public.daily_feed_posts (event_id);
create index if not exists daily_feed_posts_zone_id_idx on public.daily_feed_posts (zone_id);
create index if not exists daily_feed_posts_type_idx on public.daily_feed_posts (type);
create index if not exists daily_feed_posts_is_pinned_idx on public.daily_feed_posts (is_pinned);

do $$
begin
  if not exists (
    select 1 from pg_trigger
    where tgname = 'daily_feed_posts_updated_at'
      and tgrelid = 'public.daily_feed_posts'::regclass
  ) then
    create trigger daily_feed_posts_updated_at
    before update on public.daily_feed_posts
    for each row execute function public.set_updated_at();
  end if;
end
$$;

alter table public.daily_feed_posts enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'daily_feed_posts'
      and policyname = 'authenticated read published daily feed'
  ) then
    create policy "authenticated read published daily feed"
      on public.daily_feed_posts
      for select
      to authenticated
      using (
        is_published = true
        and (starts_at is null or starts_at <= now())
        and (ends_at is null or ends_at >= now())
      );
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'daily_feed_posts'
      and policyname = 'staff read all daily feed'
  ) then
    create policy "staff read all daily feed"
      on public.daily_feed_posts
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
      and tablename = 'daily_feed_posts'
      and policyname = 'staff insert daily feed'
  ) then
    create policy "staff insert daily feed"
      on public.daily_feed_posts
      for insert
      to authenticated
      with check (public.current_staff_role() is not null);
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'daily_feed_posts'
      and policyname = 'staff update daily feed'
  ) then
    create policy "staff update daily feed"
      on public.daily_feed_posts
      for update
      to authenticated
      using (public.current_staff_role() is not null)
      with check (public.current_staff_role() is not null);
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'daily_feed_posts'
      and policyname = 'staff delete daily feed'
  ) then
    create policy "staff delete daily feed"
      on public.daily_feed_posts
      for delete
      to authenticated
      using (public.current_staff_role() is not null);
  end if;
end
$$;

insert into public.daily_feed_posts (title, body, type, priority, is_published, is_pinned)
select
  'Live Jazz Session',
  'La banda principal inicia esta noche en el escenario de FLEX.',
  'event'::public.feed_post_type,
  'high'::public.feed_priority,
  true,
  true
where not exists (select 1 from public.daily_feed_posts where title = 'Live Jazz Session');

insert into public.daily_feed_posts (title, body, type, priority, is_published)
select
  U&'2x1 en c\00F3cteles',
  'Promocion disponible en el Bar Principal por tiempo limitado.',
  'promotion'::public.feed_post_type,
  'normal'::public.feed_priority,
  true
where not exists (select 1 from public.daily_feed_posts where title = U&'2x1 en c\00F3cteles');

insert into public.daily_feed_posts (title, body, type, priority, is_published)
select
  'Open Mic',
  'Inscribete para cantar o tocar en la live session.',
  'stage'::public.feed_post_type,
  'normal'::public.feed_priority,
  true
where not exists (select 1 from public.daily_feed_posts where title = 'Open Mic');

insert into public.daily_feed_posts (title, body, type, priority, is_published)
select
  U&'\00DAltimos cupos VIP',
  'Consulta disponibilidad en Sala Negra, Sala Roja y Sala Dorada.',
  'vip'::public.feed_post_type,
  'high'::public.feed_priority,
  true
where not exists (select 1 from public.daily_feed_posts where title = U&'\00DAltimos cupos VIP');
