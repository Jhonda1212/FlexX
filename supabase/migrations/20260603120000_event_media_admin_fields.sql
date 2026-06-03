alter table public.events
  add column if not exists image_url text,
  add column if not exists artist_name text,
  add column if not exists artist_url text,
  add column if not exists external_url text,
  add column if not exists featured boolean not null default false,
  add column if not exists zone_name text;

create index if not exists events_featured_starts_at_idx
  on public.events (featured desc, starts_at asc)
  where is_published;

insert into storage.buckets (id, name, public)
values ('event-images', 'event-images', true)
on conflict (id) do update set public = true;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'public read event images'
  ) then
    create policy "public read event images"
    on storage.objects for select
    using (bucket_id = 'event-images');
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'admin insert event images'
  ) then
    create policy "admin insert event images"
    on storage.objects for insert
    with check (bucket_id = 'event-images' and public.is_admin());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'admin update event images'
  ) then
    create policy "admin update event images"
    on storage.objects for update
    using (bucket_id = 'event-images' and public.is_admin())
    with check (bucket_id = 'event-images' and public.is_admin());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'admin delete event images'
  ) then
    create policy "admin delete event images"
    on storage.objects for delete
    using (bucket_id = 'event-images' and public.is_admin());
  end if;
end $$;
