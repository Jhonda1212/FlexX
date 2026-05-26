create extension if not exists "pgcrypto";

create type public.staff_role as enum ('guard', 'storage', 'dj', 'admin');
create type public.ticket_status as enum ('active', 'used', 'expired', 'cancelled');
create type public.order_status as enum ('pending', 'paid', 'failed', 'refunded');
create type public.order_item_type as enum ('ticket', 'vip_reservation');
create type public.zone_type as enum ('main_floor', 'stage', 'vip_room', 'private_room', 'storage');
create type public.access_result as enum ('valid', 'used', 'expired', 'invalid', 'full', 'inactive');
create type public.storage_status as enum ('active', 'delivered', 'lost');
create type public.queue_status as enum ('waiting', 'called', 'done', 'cancelled');
create type public.song_status as enum ('pending', 'approved', 'playing', 'played', 'rejected');
create type public.notification_type as enum ('ticket', 'vip', 'song', 'queue', 'storage', 'system');

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.secure_token()
returns text
language sql
as $$
  select encode(gen_random_bytes(32), 'base64url');
$$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  avatar_url text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.staff_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  role public.staff_role not null,
  display_name text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  starts_at timestamptz not null,
  ends_at timestamptz,
  cover_image_path text,
  capacity integer not null default 600 check (capacity > 0),
  ticket_price_cents integer not null default 0 check (ticket_price_cents >= 0),
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.club_zones (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type public.zone_type not null,
  capacity integer not null check (capacity > 0),
  vip_price_cents integer not null default 0 check (vip_price_cents >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint private_room_capacity_max check (type <> 'private_room' or capacity <= 10)
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  status public.order_status not null default 'pending',
  amount_total_cents integer not null default 0 check (amount_total_cents >= 0),
  currency text not null default 'eur',
  stripe_checkout_session_id text unique,
  stripe_payment_intent_id text unique,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  item_type public.order_item_type not null,
  event_id uuid references public.events(id) on delete set null,
  zone_id uuid references public.club_zones(id) on delete set null,
  quantity integer not null default 1 check (quantity > 0),
  unit_amount_cents integer not null check (unit_amount_cents >= 0),
  created_at timestamptz not null default now()
);

create table public.tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  event_id uuid not null references public.events(id) on delete cascade,
  order_id uuid references public.orders(id) on delete set null,
  qr_token text not null unique default public.secure_token(),
  status public.ticket_status not null default 'active',
  expires_at timestamptz,
  used_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.private_room_access (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  event_id uuid references public.events(id) on delete cascade,
  zone_id uuid not null references public.club_zones(id) on delete cascade,
  order_id uuid references public.orders(id) on delete set null,
  qr_token text not null unique default public.secure_token(),
  active boolean not null default true,
  max_guests integer not null default 10 check (max_guests between 1 and 10),
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.private_room_guests (
  id uuid primary key default gen_random_uuid(),
  access_id uuid not null references public.private_room_access(id) on delete cascade,
  guest_name text,
  guest_email text,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.song_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  event_id uuid references public.events(id) on delete set null,
  title text not null,
  artist text,
  dedication text,
  status public.song_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.live_session_queue (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  event_id uuid references public.events(id) on delete set null,
  performer_name text not null,
  instrument text,
  position integer not null check (position > 0),
  status public.queue_status not null default 'waiting',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (event_id, position)
);

create table public.storage_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  staff_id uuid references public.staff_profiles(id) on delete set null,
  ticket_id uuid references public.tickets(id) on delete set null,
  storage_number text not null,
  item_description text not null,
  qr_token text not null unique default public.secure_token(),
  status public.storage_status not null default 'active',
  delivered_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.access_logs (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid references public.staff_profiles(id) on delete set null,
  ticket_id uuid references public.tickets(id) on delete set null,
  private_room_access_id uuid references public.private_room_access(id) on delete set null,
  storage_item_id uuid references public.storage_items(id) on delete set null,
  qr_token text not null,
  result public.access_result not null,
  reason text,
  created_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type public.notification_type not null,
  title text not null,
  body text not null default '',
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index on public.staff_profiles (user_id, role) where active;
create index on public.events (starts_at) where is_published;
create index on public.tickets (user_id, event_id, status);
create index on public.private_room_access (user_id, zone_id, active);
create index on public.private_room_guests (access_id);
create index on public.song_requests (event_id, status, created_at);
create index on public.live_session_queue (event_id, status, position);
create index on public.storage_items (status, storage_number);
create index on public.access_logs (created_at desc);
create index on public.notifications (user_id, read_at, created_at desc);

create or replace function public.current_staff_role()
returns public.staff_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.staff_profiles
  where user_id = auth.uid() and active
  order by created_at desc
  limit 1;
$$;

create or replace function public.is_staff(required_role public.staff_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.staff_profiles
    where user_id = auth.uid()
      and active
      and (role = required_role or role = 'admin')
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_staff('admin');
$$;

create or replace function public.create_profile_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.create_profile_for_new_user();

create or replace function public.enforce_private_room_guest_limit()
returns trigger
language plpgsql
as $$
declare
  current_count integer;
  max_allowed integer;
  access_active boolean;
begin
  select count(*), pra.max_guests, pra.active
  into current_count, max_allowed, access_active
  from public.private_room_access pra
  left join public.private_room_guests prg on prg.access_id = pra.id
  where pra.id = new.access_id
  group by pra.max_guests, pra.active;

  if not access_active then
    raise exception 'private room access inactive';
  end if;

  if current_count >= max_allowed then
    raise exception 'private room is full';
  end if;

  return new;
end;
$$;

create trigger private_room_guest_limit
before insert on public.private_room_guests
for each row execute function public.enforce_private_room_guest_limit();

create or replace function public.validate_qr_token(input_token text)
returns table (
  status public.access_result,
  message text,
  ticket_id uuid,
  private_room_access_id uuid,
  storage_item_id uuid
)
language plpgsql
security definer
set search_path = public
as $$
declare
  t public.tickets%rowtype;
  pra public.private_room_access%rowtype;
  si public.storage_items%rowtype;
  guest_count integer;
begin
  select * into t from public.tickets where qr_token = input_token;
  if found then
    if t.status = 'used' then return query select 'used'::public.access_result, 'Entrada ya usada', t.id, null::uuid, null::uuid; return; end if;
    if t.status <> 'active' then return query select 'inactive'::public.access_result, 'Entrada no activa', t.id, null::uuid, null::uuid; return; end if;
    if t.expires_at is not null and t.expires_at < now() then return query select 'expired'::public.access_result, 'Entrada expirada', t.id, null::uuid, null::uuid; return; end if;
    return query select 'valid'::public.access_result, 'Entrada valida', t.id, null::uuid, null::uuid;
    return;
  end if;

  select * into pra from public.private_room_access where qr_token = input_token;
  if found then
    select count(*) into guest_count from public.private_room_guests where access_id = pra.id;
    if not pra.active then return query select 'inactive'::public.access_result, 'Acceso VIP desactivado', null::uuid, pra.id, null::uuid; return; end if;
    if pra.expires_at is not null and pra.expires_at < now() then return query select 'expired'::public.access_result, 'Acceso VIP expirado', null::uuid, pra.id, null::uuid; return; end if;
    if guest_count >= pra.max_guests then return query select 'full'::public.access_result, 'Sala llena', null::uuid, pra.id, null::uuid; return; end if;
    return query select 'valid'::public.access_result, 'Acceso VIP valido', null::uuid, pra.id, null::uuid;
    return;
  end if;

  select * into si from public.storage_items where qr_token = input_token;
  if found then
    if si.status <> 'active' then return query select 'used'::public.access_result, 'Prenda ya entregada', null::uuid, null::uuid, si.id; return; end if;
    return query select 'valid'::public.access_result, 'Storage valido', null::uuid, null::uuid, si.id;
    return;
  end if;

  return query select 'invalid'::public.access_result, 'QR invalido', null::uuid, null::uuid, null::uuid;
end;
$$;

create trigger profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger staff_profiles_updated_at before update on public.staff_profiles for each row execute function public.set_updated_at();
create trigger events_updated_at before update on public.events for each row execute function public.set_updated_at();
create trigger club_zones_updated_at before update on public.club_zones for each row execute function public.set_updated_at();
create trigger orders_updated_at before update on public.orders for each row execute function public.set_updated_at();
create trigger tickets_updated_at before update on public.tickets for each row execute function public.set_updated_at();
create trigger private_room_access_updated_at before update on public.private_room_access for each row execute function public.set_updated_at();
create trigger song_requests_updated_at before update on public.song_requests for each row execute function public.set_updated_at();
create trigger live_session_queue_updated_at before update on public.live_session_queue for each row execute function public.set_updated_at();
create trigger storage_items_updated_at before update on public.storage_items for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.staff_profiles enable row level security;
alter table public.events enable row level security;
alter table public.club_zones enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.tickets enable row level security;
alter table public.private_room_access enable row level security;
alter table public.private_room_guests enable row level security;
alter table public.song_requests enable row level security;
alter table public.live_session_queue enable row level security;
alter table public.storage_items enable row level security;
alter table public.access_logs enable row level security;
alter table public.notifications enable row level security;

create policy "profiles own read" on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy "profiles own update" on public.profiles for update using (id = auth.uid() or public.is_admin()) with check (id = auth.uid() or public.is_admin());

create policy "staff read staff" on public.staff_profiles for select using (user_id = auth.uid() or public.is_admin());
create policy "admin manage staff" on public.staff_profiles for all using (public.is_admin()) with check (public.is_admin());

create policy "published events readable" on public.events for select using (is_published or public.current_staff_role() is not null);
create policy "admin manage events" on public.events for all using (public.is_admin()) with check (public.is_admin());

create policy "zones readable" on public.club_zones for select using (active or public.current_staff_role() is not null);
create policy "admin manage zones" on public.club_zones for all using (public.is_admin()) with check (public.is_admin());

create policy "orders own read" on public.orders for select using (user_id = auth.uid() or public.is_admin());
create policy "orders own create" on public.orders for insert with check (user_id = auth.uid() or public.is_admin());
create policy "admin manage orders" on public.orders for all using (public.is_admin()) with check (public.is_admin());

create policy "order items visible through own order" on public.order_items for select using (
  public.is_admin() or exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid())
);
create policy "admin manage order items" on public.order_items for all using (public.is_admin()) with check (public.is_admin());

create policy "tickets own guard admin read" on public.tickets for select using (user_id = auth.uid() or public.is_staff('guard') or public.is_admin());
create policy "admin manage tickets" on public.tickets for all using (public.is_admin()) with check (public.is_admin());

create policy "private access own guard admin read" on public.private_room_access for select using (user_id = auth.uid() or public.is_staff('guard') or public.is_admin());
create policy "private access owner update active" on public.private_room_access for update using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());
create policy "admin manage private access" on public.private_room_access for all using (public.is_admin()) with check (public.is_admin());

create policy "private guests own access read" on public.private_room_guests for select using (
  public.is_staff('guard') or public.is_admin() or exists (select 1 from public.private_room_access pra where pra.id = access_id and pra.user_id = auth.uid())
);
create policy "private guests create with active access" on public.private_room_guests for insert with check (
  exists (select 1 from public.private_room_access pra where pra.id = access_id and pra.active)
);

create policy "song requests own read" on public.song_requests for select using (user_id = auth.uid() or public.is_staff('dj') or public.is_admin());
create policy "song requests own create" on public.song_requests for insert with check (user_id = auth.uid());
create policy "dj manage songs" on public.song_requests for update using (public.is_staff('dj')) with check (public.is_staff('dj'));
create policy "admin manage songs" on public.song_requests for all using (public.is_admin()) with check (public.is_admin());

create policy "queue own read" on public.live_session_queue for select using (user_id = auth.uid() or public.is_staff('dj') or public.is_admin());
create policy "queue own create" on public.live_session_queue for insert with check (user_id = auth.uid());
create policy "dj manage queue" on public.live_session_queue for update using (public.is_staff('dj')) with check (public.is_staff('dj'));
create policy "admin manage queue" on public.live_session_queue for all using (public.is_admin()) with check (public.is_admin());

create policy "storage own staff read" on public.storage_items for select using (user_id = auth.uid() or public.is_staff('storage') or public.is_admin());
create policy "storage staff manage" on public.storage_items for all using (public.is_staff('storage')) with check (public.is_staff('storage'));
create policy "admin manage storage" on public.storage_items for all using (public.is_admin()) with check (public.is_admin());

create policy "guard create access logs" on public.access_logs for insert with check (public.is_staff('guard') or public.is_staff('storage') or public.is_admin());
create policy "staff read access logs" on public.access_logs for select using (public.current_staff_role() is not null);
create policy "admin manage access logs" on public.access_logs for all using (public.is_admin()) with check (public.is_admin());

create policy "notifications own read" on public.notifications for select using (user_id = auth.uid() or public.is_admin());
create policy "notifications own update" on public.notifications for update using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());
create policy "admin create notifications" on public.notifications for insert with check (public.is_admin());

insert into storage.buckets (id, name, public)
values ('flex-assets', 'flex-assets', false)
on conflict (id) do nothing;

create policy "users read own flex assets" on storage.objects for select using (
  bucket_id = 'flex-assets' and (owner = auth.uid() or public.current_staff_role() is not null)
);

create policy "users upload own flex assets" on storage.objects for insert with check (
  bucket_id = 'flex-assets' and owner = auth.uid()
);

create policy "admin manage flex assets" on storage.objects for all using (
  bucket_id = 'flex-assets' and public.is_admin()
) with check (
  bucket_id = 'flex-assets' and public.is_admin()
);
