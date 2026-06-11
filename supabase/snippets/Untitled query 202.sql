
-- insert into public.staff_profiles (
--   user_id,
--   role,
--   display_name,
--   active
-- )
-- select
--   u.id,
--   'admin',
--   'Administrador FLEX',
--   true
-- from auth.users u
-- where lower(u.email) = lower('jhonda@gmail.com')
-- on conflict (user_id) do update
-- set
--   role = 'admin',
--   display_name = 'Administrador FLEX',
--   active = true;

select
  u.id,
  u.email,
  p.full_name,
  sp.role,
  sp.display_name,
  sp.active
from auth.users u
left join public.profiles p on p.id = u.id
left join public.staff_profiles sp on sp.user_id = u.id
where lower(u.email) = lower('jhonda@gmail.com');

