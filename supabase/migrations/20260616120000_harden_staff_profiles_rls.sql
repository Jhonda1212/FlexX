-- Harden staff_profiles access for local, preview and production environments.
-- The table stores operational roles, so normal users may only read their own row.
-- Only active admins may manage staff rows.

create or replace function public.current_staff_role()
returns public.staff_role
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select role
  from public.staff_profiles
  where user_id = auth.uid()
    and active
  order by created_at desc
  limit 1;
$$;

create or replace function public.is_staff(required_role public.staff_role)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.staff_profiles
    where user_id = auth.uid()
      and active
      and (role = required_role or role = 'admin')
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select public.is_staff('admin');
$$;

alter table public.staff_profiles enable row level security;

drop policy if exists "staff read staff" on public.staff_profiles;
drop policy if exists "admin manage staff" on public.staff_profiles;
drop policy if exists "staff_profiles read own" on public.staff_profiles;
drop policy if exists "staff_profiles admin read" on public.staff_profiles;
drop policy if exists "staff_profiles admin insert" on public.staff_profiles;
drop policy if exists "staff_profiles admin update" on public.staff_profiles;
drop policy if exists "staff_profiles admin delete" on public.staff_profiles;

revoke all on table public.staff_profiles from anon;
revoke all on table public.staff_profiles from authenticated;

grant usage on schema public to authenticated;
grant usage on type public.staff_role to authenticated;
grant execute on function public.current_staff_role() to authenticated;
grant execute on function public.is_staff(public.staff_role) to authenticated;
grant execute on function public.is_admin() to authenticated;

grant select, insert, update, delete on table public.staff_profiles to authenticated;
grant all on table public.staff_profiles to service_role;

create policy "staff_profiles read own"
  on public.staff_profiles
  for select
  to authenticated
  using (user_id = auth.uid());

create policy "staff_profiles admin read"
  on public.staff_profiles
  for select
  to authenticated
  using (public.is_admin());

create policy "staff_profiles admin insert"
  on public.staff_profiles
  for insert
  to authenticated
  with check (public.is_admin());

create policy "staff_profiles admin update"
  on public.staff_profiles
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "staff_profiles admin delete"
  on public.staff_profiles
  for delete
  to authenticated
  using (public.is_admin());
