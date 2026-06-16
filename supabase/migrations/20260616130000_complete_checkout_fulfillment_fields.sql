alter table public.tickets
  add column if not exists ticket_tier_id uuid references public.event_ticket_tiers(id) on delete set null;

alter table public.private_room_access
  add column if not exists status text not null default 'confirmed';

update public.private_room_access
set status = case when active then 'confirmed' else 'inactive' end
where status is null or status = '';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'private_room_access_status_check'
      and conrelid = 'public.private_room_access'::regclass
  ) then
    alter table public.private_room_access
      add constraint private_room_access_status_check
      check (status in ('pending', 'confirmed', 'active', 'inactive', 'expired', 'cancelled'));
  end if;
end $$;

create index if not exists tickets_ticket_tier_id_idx on public.tickets (ticket_tier_id);
create index if not exists private_room_access_status_idx on public.private_room_access (status);
