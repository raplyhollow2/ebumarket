-- RLS policies for Zyra

alter table public.profiles enable row level security;
alter table public.meetup_points enable row level security;
alter table public.listings enable row level security;
alter table public.listing_photos enable row level security;
alter table public.transactions enable row level security;
alter table public.donation_claims enable row level security;
alter table public.audit_events enable row level security;
alter table public.app_config enable row level security;

-- Helper: is admin
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

-- profiles
drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin" on public.profiles
  for select using (auth.uid() = id or public.is_admin());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id or public.is_admin());

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

-- meetup_points
drop policy if exists "meetup_owner_all" on public.meetup_points;
create policy "meetup_owner_all" on public.meetup_points
  for all using (auth.uid() = user_id or public.is_admin())
  with check (auth.uid() = user_id or public.is_admin());

-- listings
drop policy if exists "listings_public_verified" on public.listings;
create policy "listings_public_verified" on public.listings
  for select using (
    status = 'verified'
    or seller_id = auth.uid()
    or public.is_admin()
  );

drop policy if exists "listings_insert_own" on public.listings;
create policy "listings_insert_own" on public.listings
  for insert with check (seller_id = auth.uid());

drop policy if exists "listings_update_own_or_admin" on public.listings;
create policy "listings_update_own_or_admin" on public.listings
  for update using (seller_id = auth.uid() or public.is_admin());

-- listing_photos
drop policy if exists "photos_select" on public.listing_photos;
create policy "photos_select" on public.listing_photos
  for select using (
    exists (
      select 1 from public.listings l
      where l.id = listing_id
        and (l.status = 'verified' or l.seller_id = auth.uid() or public.is_admin())
    )
  );

drop policy if exists "photos_insert_own" on public.listing_photos;
create policy "photos_insert_own" on public.listing_photos
  for insert with check (
    exists (
      select 1 from public.listings l
      where l.id = listing_id and l.seller_id = auth.uid()
    )
  );

drop policy if exists "photos_delete_own" on public.listing_photos;
create policy "photos_delete_own" on public.listing_photos
  for delete using (
    exists (
      select 1 from public.listings l
      where l.id = listing_id and (l.seller_id = auth.uid() or public.is_admin())
    )
  );

-- transactions
drop policy if exists "tx_select_parties" on public.transactions;
create policy "tx_select_parties" on public.transactions
  for select using (buyer_id = auth.uid() or seller_id = auth.uid() or public.is_admin());

drop policy if exists "tx_insert_buyer" on public.transactions;
create policy "tx_insert_buyer" on public.transactions
  for insert with check (buyer_id = auth.uid());

drop policy if exists "tx_update_parties" on public.transactions;
create policy "tx_update_parties" on public.transactions
  for update using (buyer_id = auth.uid() or seller_id = auth.uid() or public.is_admin());

-- donation_claims
drop policy if exists "claims_select" on public.donation_claims;
create policy "claims_select" on public.donation_claims
  for select using (
    claimer_id = auth.uid()
    or public.is_admin()
    or exists (select 1 from public.listings l where l.id = listing_id and l.seller_id = auth.uid())
  );

drop policy if exists "claims_insert" on public.donation_claims;
create policy "claims_insert" on public.donation_claims
  for insert with check (claimer_id = auth.uid());

drop policy if exists "claims_update" on public.donation_claims;
create policy "claims_update" on public.donation_claims
  for update using (
    claimer_id = auth.uid()
    or public.is_admin()
    or exists (select 1 from public.listings l where l.id = listing_id and l.seller_id = auth.uid())
  );

-- audit_events
drop policy if exists "audit_admin_select" on public.audit_events;
create policy "audit_admin_select" on public.audit_events
  for select using (public.is_admin());

drop policy if exists "audit_insert_authenticated" on public.audit_events;
create policy "audit_insert_authenticated" on public.audit_events
  for insert with check (auth.uid() is not null);

-- app_config readable by all authenticated
drop policy if exists "config_read" on public.app_config;
create policy "config_read" on public.app_config
  for select using (true);

-- Storage policies for listing-photos
drop policy if exists "listing_photos_public_read" on storage.objects;
create policy "listing_photos_public_read" on storage.objects
  for select using (bucket_id = 'listing-photos');

drop policy if exists "listing_photos_auth_upload" on storage.objects;
create policy "listing_photos_auth_upload" on storage.objects
  for insert with check (bucket_id = 'listing-photos' and auth.uid() is not null);

drop policy if exists "listing_photos_owner_update" on storage.objects;
create policy "listing_photos_owner_update" on storage.objects
  for update using (bucket_id = 'listing-photos' and auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists "listing_photos_owner_delete" on storage.objects;
create policy "listing_photos_owner_delete" on storage.objects
  for delete using (bucket_id = 'listing-photos' and auth.uid()::text = (storage.foldername(name))[1]);
