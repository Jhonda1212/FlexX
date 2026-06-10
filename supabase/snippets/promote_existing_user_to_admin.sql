-- -- insert into public.staff_profiles (user_id, role, display_name, active)
-- -- values (
-- --   '37a6b063-ed09-405f-9063-06038b54de84',
-- --   'admin',
-- --   'Admin FLEX',
-- --   true
-- -- )
-- -- on conflict (user_id) do update
-- -- set
-- --   role = 'admin',
-- --   display_name = 'Admin FLEX',
-- --   active = true;

-- -- select
-- --   u.email,
-- --   p.full_name,
-- --   sp.role,
-- --   sp.display_name,
-- --   sp.active
-- -- from auth.users u
-- -- left join public.profiles p on p.id = u.id
-- -- left join public.staff_profiles sp on sp.user_id = u.id
-- -- where u.email = ' ';

-- -- insert into public.staff_profiles (user_id, role, display_name, active)
-- -- select u.id, 'guard', 'Guardia FLEX', true
-- -- from auth.users u
-- -- where u.email = 'guard@flex.test'
-- -- on conflict (user_id) do update
-- -- set role = 'guard',
-- --     display_name = 'Guardia FLEX',
-- --     active = true;

-- -- insert into public.staff_profiles (user_id, role, display_name, active)
-- -- select u.id, 'storage', 'Storage FLEX', true
-- -- from auth.users u
-- -- where u.email = 'storage@flex.test'
-- -- on conflict (user_id) do update
-- -- set role = 'storage',
-- --     display_name = 'Storage FLEX',
-- --     active = true;

-- -- insert into public.staff_profiles (user_id, role, display_name, active)
-- -- select u.id, 'dj', 'DJ FLEX', true
-- -- from auth.users u
-- -- where u.email = 'dj@flex.test'
-- -- on conflict (user_id) do update
-- -- set role = 'dj',
-- --     display_name = 'DJ FLEX',
-- --     active = true;

-- select
--   u.email,
--   p.full_name,
--   sp.role,
--   sp.display_name,
--   sp.active
-- from auth.users u
-- left join public.profiles p on p.id = u.id
-- left join public.staff_profiles sp on sp.user_id = u.id
-- where u.email in (
--   'admin@flex.test',
--   'guard@flex.test',
--   'storage@flex.test',
--   'dj@flex.test',
--   'user@flex.test'
-- )
-- order by u.email;

-- select column_name, data_type
-- from information_schema.columns
-- where table_schema = 'public'
-- and table_name = 'events'
-- order by ordinal_position;
update public.daily_feed_posts
set
  starts_at = null,
  ends_at = null,
  is_published = true,
  is_pinned = true
where title = 'Jhonda';