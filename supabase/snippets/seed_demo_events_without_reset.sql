-- Safe demo seed for FLEX events.
-- Run in Supabase SQL Editor or with psql. This does not reset the database.
-- It updates matching demo titles and inserts missing ones.

create temporary table if not exists flex_demo_events (
  title text primary key,
  artist_name text,
  artist_url text,
  image_url text,
  zone_name text,
  description text,
  starts_at timestamptz,
  ends_at timestamptz,
  featured boolean,
  ticket_price_cents integer
) on commit drop;

truncate table flex_demo_events;

insert into flex_demo_events (
  title,
  artist_name,
  artist_url,
  image_url,
  zone_name,
  description,
  starts_at,
  ends_at,
  featured,
  ticket_price_cents
)
values
  (
    'Jazz Nights',
    'John Coltrane',
    'https://open.spotify.com/intl-es/track/7b9GTuHH5QPglZrKQATW8Q',
    '/images/events/john-coltrane.jpg',
    'Pista principal',
    'Una noche de jazz clasico y atmosfera elegante.',
    date_trunc('day', now()) + interval '2 days 22 hours',
    date_trunc('day', now()) + interval '3 days 4 hours',
    true,
    1500
  ),
  (
    'Latin Urban Night',
    'Arcangel',
    'https://open.spotify.com/intl-es/artist/4SsVbpTthjScTS7U2hmr1X',
    '/images/events/arcangel.jpg',
    'Escenario live',
    'Ritmos urbanos latinos con ambiente premium.',
    date_trunc('day', now()) + interval '4 days 23 hours',
    date_trunc('day', now()) + interval '5 days 4 hours',
    true,
    1800
  ),
  (
    'Reggaeton Classics',
    U&'\00D1ejo',
    'https://open.spotify.com/intl-es/artist/2OHKEe204spO7G7NcbeO2o',
    '/images/events/nejo.jpg',
    'Pista principal',
    'Una sesion de clasicos urbanos para cantar toda la noche.',
    date_trunc('day', now()) + interval '7 days 23 hours',
    date_trunc('day', now()) + interval '8 days 4 hours',
    true,
    1800
  );

update public.events as event
set
  artist_name = demo.artist_name,
  artist_url = demo.artist_url,
  image_url = demo.image_url,
  cover_image_path = coalesce(event.cover_image_path, demo.image_url),
  zone_name = demo.zone_name,
  description = demo.description,
  starts_at = demo.starts_at,
  ends_at = demo.ends_at,
  featured = demo.featured,
  ticket_price_cents = demo.ticket_price_cents,
  is_published = true
from flex_demo_events as demo
where event.title = demo.title;

insert into public.events (
  title,
  artist_name,
  artist_url,
  image_url,
  cover_image_path,
  zone_name,
  description,
  starts_at,
  ends_at,
  featured,
  ticket_price_cents,
  capacity,
  is_published
)
select
  demo.title,
  demo.artist_name,
  demo.artist_url,
  demo.image_url,
  demo.image_url,
  demo.zone_name,
  demo.description,
  demo.starts_at,
  demo.ends_at,
  demo.featured,
  demo.ticket_price_cents,
  600,
  true
from flex_demo_events as demo
where not exists (
  select 1
  from public.events as event
  where event.title = demo.title
);
