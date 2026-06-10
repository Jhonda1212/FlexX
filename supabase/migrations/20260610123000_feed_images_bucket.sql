insert into storage.buckets (id, name, public)
values ('feed-images', 'feed-images', true)
on conflict (id) do update set public = true;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'public read feed images'
  ) then
    create policy "public read feed images"
    on storage.objects for select
    using (bucket_id = 'feed-images');
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'admin insert feed images'
  ) then
    create policy "admin insert feed images"
    on storage.objects for insert
    with check (bucket_id = 'feed-images' and public.is_admin());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'admin update feed images'
  ) then
    create policy "admin update feed images"
    on storage.objects for update
    using (bucket_id = 'feed-images' and public.is_admin())
    with check (bucket_id = 'feed-images' and public.is_admin());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'admin delete feed images'
  ) then
    create policy "admin delete feed images"
    on storage.objects for delete
    using (bucket_id = 'feed-images' and public.is_admin());
  end if;
end $$;
