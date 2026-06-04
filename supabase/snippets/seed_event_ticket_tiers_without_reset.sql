-- Safe demo seed for FLEX event ticket tiers.
-- Run in Supabase SQL Editor or with psql after applying the event_ticket_tiers migration.
-- This does not reset the database and is idempotent by event_id + tier name.

create temporary table if not exists flex_demo_event_ticket_tiers (
  event_id uuid not null,
  name text not null,
  zone_name text,
  description text,
  price_cents integer not null,
  currency text not null,
  capacity integer,
  available_quantity integer,
  active boolean not null,
  sort_order integer not null
) on commit drop;

truncate table flex_demo_event_ticket_tiers;

insert into flex_demo_event_ticket_tiers (
  event_id,
  name,
  zone_name,
  description,
  price_cents,
  currency,
  capacity,
  available_quantity,
  active,
  sort_order
)
select
  event.id,
  tier.name,
  tier.zone_name,
  tier.description,
  tier.price_cents,
  'EUR',
  tier.capacity,
  tier.available_quantity,
  true,
  tier.sort_order
from public.events event
cross join (
  values
    ('General'::text, 'General'::text, 'Acceso general al evento.'::text, 2000::integer, 400::integer, null::integer, 10::integer),
    ('Pista principal'::text, 'Pista principal'::text, 'Entrada con acceso a la zona principal frente al escenario.'::text, 3500::integer, 180::integer, null::integer, 20::integer),
    ('VIP Lounge'::text, 'VIP Lounge'::text, 'Acceso premium con zona lounge y servicio preferente.'::text, 8000::integer, 60::integer, null::integer, 30::integer)
) as tier(name, zone_name, description, price_cents, capacity, available_quantity, sort_order)
where event.is_published = true;

insert into public.event_ticket_tiers (
  event_id,
  name,
  zone_name,
  description,
  price_cents,
  currency,
  capacity,
  available_quantity,
  active,
  sort_order
)
select
  event_id,
  name,
  zone_name,
  description,
  price_cents,
  currency,
  capacity,
  available_quantity,
  active,
  sort_order
from flex_demo_event_ticket_tiers
where not exists (
  select 1
  from public.event_ticket_tiers existing
  where existing.event_id = flex_demo_event_ticket_tiers.event_id
    and existing.name = flex_demo_event_ticket_tiers.name
);

update public.event_ticket_tiers existing
set
  zone_name = demo.zone_name,
  description = demo.description,
  price_cents = demo.price_cents,
  currency = demo.currency,
  capacity = demo.capacity,
  available_quantity = demo.available_quantity,
  active = demo.active,
  sort_order = demo.sort_order
from flex_demo_event_ticket_tiers demo
where existing.event_id = demo.event_id
  and existing.name = demo.name;
