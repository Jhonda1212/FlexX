-- select column_name, data_type, is_nullable, column_default
-- from information_schema.columns
-- where table_schema = 'public'
--   and table_name = 'private_room_access'
-- order by ordinal_position;


select *
from private_room_access
where order_id = 'EL_ORDER_ID_NUEVO';