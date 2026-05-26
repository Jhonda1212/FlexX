create or replace function public.validate_qr_token(input_token text)
returns table (
  status public.access_result,
  message text,
  ticket_id uuid,
  private_room_access_id uuid,
  storage_item_id uuid
)
language plpgsql
security definer
set search_path = public
as $$
declare
  t public.tickets%rowtype;
  pra public.private_room_access%rowtype;
  si public.storage_items%rowtype;
  guest_count integer;
  staff_row public.staff_profiles%rowtype;
  result_status public.access_result;
  result_message text;
  result_ticket_id uuid := null;
  result_private_room_access_id uuid := null;
  result_storage_item_id uuid := null;
begin
  select *
  into staff_row
  from public.staff_profiles
  where user_id = auth.uid()
    and active
    and role in ('guard', 'admin')
  order by created_at desc
  limit 1;

  if not found then
    raise exception 'Solo guardias o admins activos pueden validar QR.';
  end if;

  select * into t
  from public.tickets
  where qr_token = input_token
  for update;

  if found then
    result_ticket_id := t.id;

    if t.status = 'used' then
      result_status := 'used';
      result_message := 'Entrada ya usada';
    elsif t.status <> 'active' then
      result_status := 'inactive';
      result_message := 'Entrada no activa';
    elsif t.expires_at is not null and t.expires_at < now() then
      result_status := 'expired';
      result_message := 'Entrada expirada';
    else
      update public.tickets
      set status = 'used',
          used_at = now()
      where id = t.id
        and status = 'active';

      result_status := 'valid';
      result_message := 'Entrada valida. Acceso registrado.';
    end if;

    insert into public.access_logs (staff_id, ticket_id, qr_token, result, reason)
    values (staff_row.id, result_ticket_id, input_token, result_status, result_message);

    return query select result_status, result_message, result_ticket_id, null::uuid, null::uuid;
    return;
  end if;

  select * into pra
  from public.private_room_access
  where qr_token = input_token
  for update;

  if found then
    result_private_room_access_id := pra.id;
    select count(*) into guest_count from public.private_room_guests where access_id = pra.id;

    if not pra.active then
      result_status := 'inactive';
      result_message := 'Acceso VIP desactivado';
    elsif pra.expires_at is not null and pra.expires_at < now() then
      result_status := 'expired';
      result_message := 'Acceso VIP expirado';
    elsif guest_count >= pra.max_guests then
      result_status := 'full';
      result_message := 'Sala llena';
    else
      result_status := 'valid';
      result_message := 'Acceso VIP valido. Acceso registrado.';
    end if;

    insert into public.access_logs (staff_id, private_room_access_id, qr_token, result, reason)
    values (staff_row.id, result_private_room_access_id, input_token, result_status, result_message);

    return query select result_status, result_message, null::uuid, result_private_room_access_id, null::uuid;
    return;
  end if;

  select * into si
  from public.storage_items
  where qr_token = input_token
  for update;

  if found then
    result_storage_item_id := si.id;

    if si.status <> 'active' then
      result_status := 'used';
      result_message := 'Prenda ya entregada';
    else
      result_status := 'valid';
      result_message := 'Storage valido. Acceso registrado.';
    end if;

    insert into public.access_logs (staff_id, storage_item_id, qr_token, result, reason)
    values (staff_row.id, result_storage_item_id, input_token, result_status, result_message);

    return query select result_status, result_message, null::uuid, null::uuid, result_storage_item_id;
    return;
  end if;

  result_status := 'invalid';
  result_message := 'QR invalido';

  insert into public.access_logs (staff_id, qr_token, result, reason)
  values (staff_row.id, input_token, result_status, result_message);

  return query select result_status, result_message, null::uuid, null::uuid, null::uuid;
end;
$$;
