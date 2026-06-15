drop policy if exists "staff insert daily feed" on public.daily_feed_posts;
drop policy if exists "staff update daily feed" on public.daily_feed_posts;
drop policy if exists "staff delete daily feed" on public.daily_feed_posts;
drop policy if exists "admin insert daily feed" on public.daily_feed_posts;
drop policy if exists "admin update daily feed" on public.daily_feed_posts;
drop policy if exists "admin delete daily feed" on public.daily_feed_posts;

create policy "admin insert daily feed"
  on public.daily_feed_posts
  for insert
  to authenticated
  with check (public.is_admin());

create policy "admin update daily feed"
  on public.daily_feed_posts
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "admin delete daily feed"
  on public.daily_feed_posts
  for delete
  to authenticated
  using (public.is_admin());

update public.daily_feed_posts
set type = 'stage'::public.feed_post_type
where title = 'Live Jazz Session'
  and type = 'event'::public.feed_post_type
  and event_id is null;

update public.daily_feed_posts
set type = 'announcement'::public.feed_post_type
where is_published = true
  and type = 'event'::public.feed_post_type
  and event_id is null;
