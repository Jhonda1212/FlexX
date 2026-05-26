alter type public.zone_type add value if not exists 'entrance';
alter type public.zone_type add value if not exists 'bar';
alter type public.zone_type add value if not exists 'bathroom';
alter type public.zone_type add value if not exists 'lounge';

alter table public.club_zones
  add column if not exists floor integer not null default 1,
  add column if not exists color_theme text,
  add column if not exists description text;
