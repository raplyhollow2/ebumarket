-- BTN currency defaults + who can approve
alter table public.profiles
  add column if not exists can_approve boolean not null default false;

update public.profiles
set can_approve = true
where role = 'admin';

alter table public.listings
  alter column currency set default 'BTN';

update public.listings
set currency = 'BTN'
where currency is null or upper(currency) in ('USD', 'USDT');

insert into public.app_config (key, value)
values
  ('currency', '"BTN"'::jsonb),
  ('platform_fee_percent', '5'::jsonb)
on conflict (key) do update
  set value = excluded.value;

-- Approvers (admin OR can_approve) can manage verification
create or replace function public.can_approve()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and (p.role = 'admin' or p.can_approve = true)
  );
$$;

-- Broaden listing update for approvers
drop policy if exists "listings_update_own_or_admin" on public.listings;
create policy "listings_update_own_or_admin" on public.listings
  for update using (
    seller_id = auth.uid()
    or public.is_admin()
    or public.can_approve()
  );

-- Approvers can read pending listings (via existing select: seller / verified / admin)
drop policy if exists "listings_public_verified" on public.listings;
create policy "listings_public_verified" on public.listings
  for select using (
    status = 'verified'
    or seller_id = auth.uid()
    or public.is_admin()
    or public.can_approve()
  );

drop policy if exists "photos_select" on public.listing_photos;
create policy "photos_select" on public.listing_photos
  for select using (
    exists (
      select 1 from public.listings l
      where l.id = listing_id
        and (
          l.status = 'verified'
          or l.seller_id = auth.uid()
          or public.is_admin()
          or public.can_approve()
        )
    )
  );

-- Admins manage app_config
drop policy if exists "config_read" on public.app_config;
create policy "config_read" on public.app_config
  for select using (true);

drop policy if exists "config_admin_write" on public.app_config;
create policy "config_admin_write" on public.app_config
  for all using (public.is_admin())
  with check (public.is_admin());

-- Admins can update any profile (role / can_approve)
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id or public.is_admin());

-- Admins can select all profiles (already via public read + update)
drop policy if exists "profiles_admin_all_select" on public.profiles;
-- public read already exists

-- Approvers can insert audit events (already auth); admins/approvers read
drop policy if exists "audit_admin_select" on public.audit_events;
create policy "audit_admin_select" on public.audit_events
  for select using (public.is_admin() or public.can_approve());
