-- select column_name, data_type, is_nullable, column_default
-- from information_schema.columns
-- where table_schema = 'public'
--   and table_name = 'private_room_access'
-- order by ordinal_position;


create or replace function public.secure_token()
returns text
language sql
volatile
as $$
  select encode(gen_random_bytes(24), 'hex');
$$;