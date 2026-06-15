alter table public.orders
  add column if not exists stripe_customer_id text,
  add column if not exists customer_email text,
  add column if not exists paid_at timestamptz;

alter table public.order_items
  add column if not exists ticket_tier_id uuid references public.event_ticket_tiers(id) on delete set null,
  add column if not exists total_amount_cents integer;

update public.order_items
set total_amount_cents = quantity * unit_amount_cents
where total_amount_cents is null;

alter table public.order_items
  alter column total_amount_cents set default 0;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'order_items_total_amount_cents_non_negative'
      and conrelid = 'public.order_items'::regclass
  ) then
    alter table public.order_items
      add constraint order_items_total_amount_cents_non_negative check (total_amount_cents >= 0);
  end if;
end $$;

alter table public.tickets
  add column if not exists zone_id uuid references public.club_zones(id) on delete set null;

create unique index if not exists orders_stripe_checkout_session_id_unique
  on public.orders (stripe_checkout_session_id)
  where stripe_checkout_session_id is not null;

create index if not exists orders_status_idx on public.orders (status);
create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists order_items_order_id_idx on public.order_items (order_id);
create index if not exists tickets_order_id_idx on public.tickets (order_id);
create index if not exists private_room_access_order_id_idx on public.private_room_access (order_id);
