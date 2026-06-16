-- FLEX local seed.
-- This file is safe to run after migrations in local development.
-- It does not create Auth users, does not store real passwords and does not use service_role.

-- ---------------------------------------------------------------------------
-- Required base data
-- ---------------------------------------------------------------------------

with seed_zones (
  id,
  name,
  type,
  capacity,
  floor,
  color_theme,
  description,
  vip_price_cents,
  active
) as (
  values
    ('11111111-1111-4111-8111-111111111101'::uuid, 'Entrada Principal', 'entrance'::public.zone_type, 100, 1, 'gold', 'Acceso principal de FLEX con validacion de entradas QR.', 0, true),
    ('11111111-1111-4111-8111-111111111102'::uuid, 'Pista Principal', 'main_floor'::public.zone_type, 400, 1, 'black', 'Zona central de baile y experiencia principal del club.', 0, true),
    ('11111111-1111-4111-8111-111111111103'::uuid, 'Bar Principal', 'bar'::public.zone_type, 80, 1, 'gold', 'Bar principal para bebidas y atencion general.', 0, true),
    ('11111111-1111-4111-8111-111111111104'::uuid, 'Escenario', 'stage'::public.zone_type, 20, 1, 'purple', 'Escenario para live sessions, cantantes, musicos y DJ.', 0, true),
    ('11111111-1111-4111-8111-111111111105'::uuid, 'Guardarropa / Storage', 'storage'::public.zone_type, 200, 1, 'gold', 'Zona para guardar chaquetas, bolsos y objetos personales mediante QR.', 0, true),
    ('11111111-1111-4111-8111-111111111106'::uuid, 'Banos', 'bathroom'::public.zone_type, 40, 1, 'black', 'Sanitarios generales del primer piso.', 0, true),
    ('11111111-1111-4111-8111-111111111107'::uuid, 'Sala Negra', 'private_room'::public.zone_type, 10, 2, 'black', 'Sala VIP privada con ambiente intimo, elegante y misterioso.', 12000, true),
    ('11111111-1111-4111-8111-111111111108'::uuid, 'Sala Roja', 'private_room'::public.zone_type, 10, 2, 'red', 'Sala VIP privada con energia, pasion, luces rojas y ambiente social.', 15000, true),
    ('11111111-1111-4111-8111-111111111109'::uuid, 'Sala Dorada', 'private_room'::public.zone_type, 10, 2, 'gold', 'Sala VIP premium con lujo, exclusividad y servicio especial.', 25000, true)
),
updated as (
  update public.club_zones as zone
  set
    type = seed_zones.type,
    capacity = seed_zones.capacity,
    floor = seed_zones.floor,
    color_theme = seed_zones.color_theme,
    description = seed_zones.description,
    vip_price_cents = seed_zones.vip_price_cents,
    active = seed_zones.active
  from seed_zones
  where zone.name = seed_zones.name
  returning zone.id
)
insert into public.club_zones (
  id,
  name,
  type,
  capacity,
  floor,
  color_theme,
  description,
  vip_price_cents,
  active
)
select
  seed_zones.id,
  seed_zones.name,
  seed_zones.type,
  seed_zones.capacity,
  seed_zones.floor,
  seed_zones.color_theme,
  seed_zones.description,
  seed_zones.vip_price_cents,
  seed_zones.active
from seed_zones
where not exists (
  select 1
  from public.club_zones as zone
  where zone.name = seed_zones.name
)
on conflict (id) do update
set
  name = excluded.name,
  type = excluded.type,
  capacity = excluded.capacity,
  floor = excluded.floor,
  color_theme = excluded.color_theme,
  description = excluded.description,
  vip_price_cents = excluded.vip_price_cents,
  active = excluded.active;

-- ---------------------------------------------------------------------------
-- Optional demo data
-- ---------------------------------------------------------------------------

with seed_events (
  id,
  title,
  artist_name,
  artist_url,
  image_url,
  zone_name,
  description,
  starts_at,
  ends_at,
  featured,
  ticket_price_cents,
  capacity,
  is_published
) as (
  values
    (
      '22222222-2222-4222-8222-222222222201'::uuid,
      'Flex Live Sessions: Jazz Night',
      'FLEX House Band',
      null::text,
      null::text,
      'Escenario',
      'Una noche de jazz, improvisacion, canciones pedidas y artistas en vivo.',
      date_trunc('day', now()) + interval '1 day 22 hours',
      date_trunc('day', now()) + interval '2 days 4 hours',
      true,
      1500,
      600,
      true
    ),
    (
      '22222222-2222-4222-8222-222222222202'::uuid,
      'Jazz Nights',
      'John Coltrane',
      'https://open.spotify.com/intl-es/track/7b9GTuHH5QPglZrKQATW8Q',
      '/images/events/john-coltrane.jpg',
      'Pista Principal',
      'Una noche de jazz clasico y atmosfera elegante.',
      date_trunc('day', now()) + interval '2 days 22 hours',
      date_trunc('day', now()) + interval '3 days 4 hours',
      true,
      1500,
      600,
      true
    ),
    (
      '22222222-2222-4222-8222-222222222203'::uuid,
      'Latin Urban Night',
      'Arcangel',
      'https://open.spotify.com/intl-es/artist/4SsVbpTthjScTS7U2hmr1X',
      '/images/events/arcangel.jpg',
      'Escenario',
      'Ritmos urbanos latinos con ambiente premium.',
      date_trunc('day', now()) + interval '4 days 23 hours',
      date_trunc('day', now()) + interval '5 days 4 hours',
      true,
      1800,
      600,
      true
    ),
    (
      '22222222-2222-4222-8222-222222222204'::uuid,
      'Reggaeton Classics',
      'Nejo',
      'https://open.spotify.com/intl-es/artist/2OHKEe204spO7G7NcbeO2o',
      '/images/events/nejo.jpg',
      'Pista Principal',
      'Una sesion de clasicos urbanos para cantar toda la noche.',
      date_trunc('day', now()) + interval '7 days 23 hours',
      date_trunc('day', now()) + interval '8 days 4 hours',
      true,
      1800,
      600,
      true
    )
),
updated as (
  update public.events as event
  set
    artist_name = seed_events.artist_name,
    artist_url = seed_events.artist_url,
    image_url = seed_events.image_url,
    cover_image_path = coalesce(event.cover_image_path, seed_events.image_url),
    zone_name = seed_events.zone_name,
    description = seed_events.description,
    starts_at = seed_events.starts_at,
    ends_at = seed_events.ends_at,
    featured = seed_events.featured,
    ticket_price_cents = seed_events.ticket_price_cents,
    capacity = seed_events.capacity,
    is_published = seed_events.is_published
  from seed_events
  where event.title = seed_events.title
  returning event.id
)
insert into public.events (
  id,
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
  seed_events.id,
  seed_events.title,
  seed_events.artist_name,
  seed_events.artist_url,
  seed_events.image_url,
  seed_events.image_url,
  seed_events.zone_name,
  seed_events.description,
  seed_events.starts_at,
  seed_events.ends_at,
  seed_events.featured,
  seed_events.ticket_price_cents,
  seed_events.capacity,
  seed_events.is_published
from seed_events
where not exists (
  select 1
  from public.events as event
  where event.title = seed_events.title
)
on conflict (id) do update
set
  title = excluded.title,
  artist_name = excluded.artist_name,
  artist_url = excluded.artist_url,
  image_url = excluded.image_url,
  cover_image_path = coalesce(public.events.cover_image_path, excluded.cover_image_path),
  zone_name = excluded.zone_name,
  description = excluded.description,
  starts_at = excluded.starts_at,
  ends_at = excluded.ends_at,
  featured = excluded.featured,
  ticket_price_cents = excluded.ticket_price_cents,
  capacity = excluded.capacity,
  is_published = excluded.is_published;

with seed_tiers (
  id,
  event_title,
  name,
  zone_name,
  description,
  price_cents,
  currency,
  capacity,
  available_quantity,
  active,
  sort_order
) as (
  values
    ('33333333-3333-4333-8333-333333333301'::uuid, 'Flex Live Sessions: Jazz Night', 'General', 'Pista Principal', 'Acceso general al evento.', 1500, 'EUR', 400, null::integer, true, 10),
    ('33333333-3333-4333-8333-333333333302'::uuid, 'Flex Live Sessions: Jazz Night', 'VIP Lounge', 'Sala Dorada', 'Acceso premium con sala VIP y servicio preferente.', 8000, 'EUR', 60, null::integer, true, 20),
    ('33333333-3333-4333-8333-333333333303'::uuid, 'Jazz Nights', 'General', 'Pista Principal', 'Acceso general al evento.', 1500, 'EUR', 400, null::integer, true, 10),
    ('33333333-3333-4333-8333-333333333304'::uuid, 'Jazz Nights', 'VIP Lounge', 'Sala Negra', 'Acceso premium con sala privada.', 8000, 'EUR', 60, null::integer, true, 20),
    ('33333333-3333-4333-8333-333333333305'::uuid, 'Latin Urban Night', 'General', 'Pista Principal', 'Acceso general al evento.', 1800, 'EUR', 400, null::integer, true, 10),
    ('33333333-3333-4333-8333-333333333306'::uuid, 'Latin Urban Night', 'VIP Lounge', 'Sala Roja', 'Acceso premium con sala privada.', 8000, 'EUR', 60, null::integer, true, 20),
    ('33333333-3333-4333-8333-333333333307'::uuid, 'Reggaeton Classics', 'General', 'Pista Principal', 'Acceso general al evento.', 1800, 'EUR', 400, null::integer, true, 10),
    ('33333333-3333-4333-8333-333333333308'::uuid, 'Reggaeton Classics', 'VIP Lounge', 'Sala Dorada', 'Acceso premium con sala privada.', 8000, 'EUR', 60, null::integer, true, 20)
),
resolved_tiers as (
  select
    seed_tiers.id,
    events.id as event_id,
    seed_tiers.name,
    seed_tiers.zone_name,
    seed_tiers.description,
    seed_tiers.price_cents,
    seed_tiers.currency,
    seed_tiers.capacity,
    seed_tiers.available_quantity,
    seed_tiers.active,
    seed_tiers.sort_order
  from seed_tiers
  join public.events on events.title = seed_tiers.event_title
),
updated as (
  update public.event_ticket_tiers as tier
  set
    zone_name = resolved_tiers.zone_name,
    description = resolved_tiers.description,
    price_cents = resolved_tiers.price_cents,
    currency = resolved_tiers.currency,
    capacity = resolved_tiers.capacity,
    available_quantity = resolved_tiers.available_quantity,
    active = resolved_tiers.active,
    sort_order = resolved_tiers.sort_order
  from resolved_tiers
  where tier.event_id = resolved_tiers.event_id
    and tier.name = resolved_tiers.name
  returning tier.id
)
insert into public.event_ticket_tiers (
  id,
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
  resolved_tiers.id,
  resolved_tiers.event_id,
  resolved_tiers.name,
  resolved_tiers.zone_name,
  resolved_tiers.description,
  resolved_tiers.price_cents,
  resolved_tiers.currency,
  resolved_tiers.capacity,
  resolved_tiers.available_quantity,
  resolved_tiers.active,
  resolved_tiers.sort_order
from resolved_tiers
where not exists (
  select 1
  from public.event_ticket_tiers as tier
  where tier.event_id = resolved_tiers.event_id
    and tier.name = resolved_tiers.name
)
on conflict (id) do update
set
  event_id = excluded.event_id,
  name = excluded.name,
  zone_name = excluded.zone_name,
  description = excluded.description,
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  capacity = excluded.capacity,
  available_quantity = excluded.available_quantity,
  active = excluded.active,
  sort_order = excluded.sort_order;

with seed_feed_posts (
  id,
  title,
  body,
  type,
  priority,
  is_published,
  is_pinned,
  image_url
) as (
  values
    ('44444444-4444-4444-8444-444444444401'::uuid, 'Live Jazz Session', 'La banda principal inicia esta noche en el escenario de FLEX.', 'stage'::public.feed_post_type, 'high'::public.feed_priority, true, true, null::text),
    ('44444444-4444-4444-8444-444444444402'::uuid, U&'2x1 en c\00F3cteles', 'Promocion disponible en el Bar Principal por tiempo limitado.', 'promotion'::public.feed_post_type, 'normal'::public.feed_priority, true, false, null::text),
    ('44444444-4444-4444-8444-444444444403'::uuid, 'Open Mic', 'Inscribete para cantar o tocar en la live session.', 'stage'::public.feed_post_type, 'normal'::public.feed_priority, true, false, null::text),
    ('44444444-4444-4444-8444-444444444404'::uuid, U&'\00DAltimos cupos VIP', 'Consulta disponibilidad en Sala Negra, Sala Roja y Sala Dorada.', 'vip'::public.feed_post_type, 'high'::public.feed_priority, true, false, null::text)
),
updated as (
  update public.daily_feed_posts as post
  set
    body = seed_feed_posts.body,
    type = seed_feed_posts.type,
    priority = seed_feed_posts.priority,
    is_published = seed_feed_posts.is_published,
    is_pinned = seed_feed_posts.is_pinned,
    image_url = coalesce(post.image_url, seed_feed_posts.image_url)
  from seed_feed_posts
  where post.title = seed_feed_posts.title
  returning post.id
)
insert into public.daily_feed_posts (
  id,
  title,
  body,
  type,
  priority,
  is_published,
  is_pinned,
  image_url
)
select
  seed_feed_posts.id,
  seed_feed_posts.title,
  seed_feed_posts.body,
  seed_feed_posts.type,
  seed_feed_posts.priority,
  seed_feed_posts.is_published,
  seed_feed_posts.is_pinned,
  seed_feed_posts.image_url
from seed_feed_posts
where not exists (
  select 1
  from public.daily_feed_posts as post
  where post.title = seed_feed_posts.title
)
on conflict (id) do update
set
  title = excluded.title,
  body = excluded.body,
  type = excluded.type,
  priority = excluded.priority,
  is_published = excluded.is_published,
  is_pinned = excluded.is_pinned,
  image_url = coalesce(public.daily_feed_posts.image_url, excluded.image_url);

-- ---------------------------------------------------------------------------
-- Products
-- ---------------------------------------------------------------------------

with seed_products (
  id,
  name,
  description,
  price,
  image,
  category,
  active,
  featured
) as (
  values
    ('55555555-5555-4555-8555-555555555501'::uuid, 'Mesa VIP 2', 'Reservado intimo para dos.', 40.00, null::text, 'Reservados VIP', true, true),
    ('55555555-5555-4555-8555-555555555502'::uuid, 'Mesa VIP 4', 'Mesa privada para grupos pequenos.', 70.00, null::text, 'Reservados VIP', true, true),
    ('55555555-5555-4555-8555-555555555503'::uuid, 'Lounge VIP', 'Espacio premium con prioridad de servicio.', 110.00, null::text, 'Reservados VIP', true, true),
    ('55555555-5555-4555-8555-555555555504'::uuid, 'Pulsera VIP', 'Acceso especial para invitados.', 10.00, null::text, 'Reservados VIP', true, false),
    ('55555555-5555-4555-8555-555555555505'::uuid, 'Champagne L''UIX', 'Botella de celebracion.', 38.00, null::text, 'Champagnes', true, true),
    ('55555555-5555-4555-8555-555555555506'::uuid, 'Moet & Chandon', 'Clasico premium de celebracion.', 95.00, null::text, 'Champagnes', true, true),
    ('55555555-5555-4555-8555-555555555507'::uuid, 'Veuve Clicquot', 'Champagne premium de referencia.', 110.00, null::text, 'Champagnes', true, false),
    ('55555555-5555-4555-8555-555555555508'::uuid, 'Dom Perignon', 'Champagne iconico para noches grandes.', 180.00, null::text, 'Champagnes', true, true),
    ('55555555-5555-4555-8555-555555555509'::uuid, 'Vodka Standard', 'Servicio base para la mesa.', 12.00, null::text, 'Botellas Estándar', true, false),
    ('55555555-5555-4555-8555-555555555510'::uuid, 'Gin Standard', 'Gin con mixer clasico.', 13.00, null::text, 'Botellas Estándar', true, false),
    ('55555555-5555-4555-8555-555555555511'::uuid, 'Ron Standard', 'Ron listo para copas.', 11.00, null::text, 'Botellas Estándar', true, false),
    ('55555555-5555-4555-8555-555555555512'::uuid, 'Tequila Standard', 'Tequila para brindis.', 14.00, null::text, 'Botellas Estándar', true, false),
    ('55555555-5555-4555-8555-555555555513'::uuid, 'Vodka Premium', 'Botella premium para mesa.', 22.00, null::text, 'Botellas Premium', true, true),
    ('55555555-5555-4555-8555-555555555514'::uuid, 'Gin Premium', 'Gin premium para compartir.', 24.00, null::text, 'Botellas Premium', true, true),
    ('55555555-5555-4555-8555-555555555515'::uuid, 'Whisky Premium', 'Whisky de gama alta.', 28.00, null::text, 'Botellas Premium', true, true),
    ('55555555-5555-4555-8555-555555555516'::uuid, 'Tequila Premium', 'Tequila premium para noche larga.', 26.00, null::text, 'Botellas Premium', true, false),
    ('55555555-5555-4555-8555-555555555517'::uuid, 'Vodka Red Bull', 'Cocktail de energia.', 10.00, null::text, 'Cocktails', true, true),
    ('55555555-5555-4555-8555-555555555518'::uuid, 'Mojito', 'Cocktail fresco de barra.', 9.00, null::text, 'Cocktails', true, false),
    ('55555555-5555-4555-8555-555555555519'::uuid, 'Aperol Spritz', 'Cocktail ligero y visual.', 11.00, null::text, 'Cocktails', true, true),
    ('55555555-5555-4555-8555-555555555520'::uuid, 'Mojito Passion', 'Version tropical de la casa.', 10.00, null::text, 'Cocktails', true, false),
    ('55555555-5555-4555-8555-555555555521'::uuid, 'Coca-Cola', 'Refresco clasico.', 3.00, null::text, 'Refrescos y Energéticas', true, false),
    ('55555555-5555-4555-8555-555555555522'::uuid, 'Nestea', 'Refresco frio y ligero.', 3.00, null::text, 'Refrescos y Energéticas', true, false),
    ('55555555-5555-4555-8555-555555555523'::uuid, 'Agua mineral', 'Agua fria embotellada.', 2.00, null::text, 'Refrescos y Energéticas', true, false),
    ('55555555-5555-4555-8555-555555555524'::uuid, 'Tonica', 'Mixer para copas.', 3.00, null::text, 'Refrescos y Energéticas', true, false),
    ('55555555-5555-4555-8555-555555555525'::uuid, 'Red Bull', 'Energetica clasica.', 4.00, null::text, 'Refrescos y Energéticas', true, true),
    ('55555555-5555-4555-8555-555555555526'::uuid, 'Monster', 'Energetica para aguantar la noche.', 4.00, null::text, 'Refrescos y Energéticas', true, false),
    ('55555555-5555-4555-8555-555555555527'::uuid, 'Cachimba Fruta', 'Cachimba con mezcla frutal.', 18.00, null::text, 'Cachimbas / Shishas', true, true),
    ('55555555-5555-4555-8555-555555555528'::uuid, 'Cachimba Menta', 'Sabor fresco y suave.', 18.00, null::text, 'Cachimbas / Shishas', true, false),
    ('55555555-5555-4555-8555-555555555529'::uuid, 'Cachimba Premium', 'Preparacion premium de cachimba.', 24.00, null::text, 'Cachimbas / Shishas', true, true),
    ('55555555-5555-4555-8555-555555555530'::uuid, 'Pack Duo', '2 bebidas y 1 snack.', 16.00, null::text, 'Packs y Promociones', true, true),
    ('55555555-5555-4555-8555-555555555531'::uuid, 'Pack Night', '2 copas y 2 refrescos.', 20.00, null::text, 'Packs y Promociones', true, true),
    ('55555555-5555-4555-8555-555555555532'::uuid, 'Pack Premium', 'Botella premium y mixers.', 42.00, null::text, 'Packs y Promociones', true, false),
    ('55555555-5555-4555-8555-555555555533'::uuid, 'Snack premium', 'Picoteo ligero para compartir.', 7.00, null::text, 'Packs y Promociones', true, false),
    ('55555555-5555-4555-8555-555555555534'::uuid, 'Camiseta FLEX', 'Merch oficial de la discoteca.', 25.00, null::text, 'Merchandising', true, true),
    ('55555555-5555-4555-8555-555555555535'::uuid, 'Gorra FLEX', 'Gorra negra con logo.', 18.00, null::text, 'Merchandising', true, false),
    ('55555555-5555-4555-8555-555555555536'::uuid, 'Tote bag FLEX', 'Bolsa textil para llevarlo todo.', 15.00, null::text, 'Merchandising', true, false)
)
insert into public.products (
  id,
  name,
  description,
  price,
  image,
  category,
  active,
  featured
)
select
  seed_products.id,
  seed_products.name,
  seed_products.description,
  seed_products.price,
  seed_products.image,
  seed_products.category,
  seed_products.active,
  seed_products.featured
from seed_products
where not exists (
  select 1
  from public.products as product
  where product.id = seed_products.id
)
on conflict (id) do update
set
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  image = excluded.image,
  category = excluded.category,
  active = excluded.active,
  featured = excluded.featured;

-- ---------------------------------------------------------------------------
-- Local admin note
-- ---------------------------------------------------------------------------
-- Auth users are intentionally not seeded here. For local development:
-- 1. Create the user through /register or Supabase Studio Auth.
-- 2. Promote that existing user with supabase/snippets/promote_existing_user_to_admin.sql,
--    replacing the email/role values as needed.
