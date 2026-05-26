insert into public.club_zones (name, type, capacity, floor, color_theme, description, vip_price_cents, active)
select 'Entrada Principal', 'entrance'::public.zone_type, 100, 1, 'gold',
  'Acceso principal de FLEX con validacion de entradas QR.', 0, true
where not exists (select 1 from public.club_zones where name = 'Entrada Principal');

insert into public.club_zones (name, type, capacity, floor, color_theme, description, vip_price_cents, active)
select 'Pista Principal', 'main_floor'::public.zone_type, 400, 1, 'black',
  'Zona central de baile y experiencia principal del club.', 0, true
where not exists (select 1 from public.club_zones where name = 'Pista Principal');

insert into public.club_zones (name, type, capacity, floor, color_theme, description, vip_price_cents, active)
select 'Escenario', 'stage'::public.zone_type, 20, 1, 'purple',
  'Escenario para live sessions, cantantes, musicos y DJ.', 0, true
where not exists (select 1 from public.club_zones where name = 'Escenario');

insert into public.club_zones (name, type, capacity, floor, color_theme, description, vip_price_cents, active)
select 'Bar Principal', 'bar'::public.zone_type, 80, 1, 'gold',
  'Bar principal para bebidas y atencion general.', 0, true
where not exists (select 1 from public.club_zones where name = 'Bar Principal');

insert into public.club_zones (name, type, capacity, floor, color_theme, description, vip_price_cents, active)
select 'Banos', 'bathroom'::public.zone_type, 40, 1, 'black',
  'Sanitarios generales del primer piso.', 0, true
where not exists (select 1 from public.club_zones where name = 'Banos');

insert into public.club_zones (name, type, capacity, floor, color_theme, description, vip_price_cents, active)
select 'Guardarropa / Storage', 'storage'::public.zone_type, 200, 1, 'gold',
  'Zona para guardar chaquetas, bolsos y objetos personales mediante QR.', 0, true
where not exists (select 1 from public.club_zones where name = 'Guardarropa / Storage');

insert into public.club_zones (name, type, capacity, floor, color_theme, description, vip_price_cents, active)
select 'Sala Negra', 'private_room'::public.zone_type, 10, 2, 'black',
  'Sala VIP privada con ambiente intimo, elegante y misterioso.', 12000, true
where not exists (select 1 from public.club_zones where name = 'Sala Negra');

insert into public.club_zones (name, type, capacity, floor, color_theme, description, vip_price_cents, active)
select 'Sala Roja', 'private_room'::public.zone_type, 10, 2, 'red',
  'Sala VIP privada con energia, pasion, luces rojas y ambiente social.', 15000, true
where not exists (select 1 from public.club_zones where name = 'Sala Roja');

insert into public.club_zones (name, type, capacity, floor, color_theme, description, vip_price_cents, active)
select 'Sala Dorada', 'private_room'::public.zone_type, 10, 2, 'gold',
  'Sala VIP premium con lujo, exclusividad y servicio especial.', 25000, true
where not exists (select 1 from public.club_zones where name = 'Sala Dorada');

insert into public.events (title, description, starts_at, ends_at, capacity, ticket_price_cents, is_published)
select
  'Flex Live Sessions: Jazz Night',
  'Una noche de jazz, improvisacion, canciones pedidas y artistas en vivo.',
  now() + interval '1 day',
  now() + interval '1 day' + interval '6 hours',
  600,
  1500,
  true
where not exists (
  select 1 from public.events where title = 'Flex Live Sessions: Jazz Night'
);
