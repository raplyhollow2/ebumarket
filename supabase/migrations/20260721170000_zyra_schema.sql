-- Zyra schema: profiles, meetup_points, listings, photos, transactions, claims, audit
create extension if not exists "pgcrypto";

-- Profiles (1:1 with auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default '',
  role text not null default 'user' check (role in ('user', 'admin')),
  is_organization boolean not null default false,
  area text not null default '',
  preferred_payment text check (preferred_payment is null or preferred_payment in ('cod', 'online')),
  created_at timestamptz not null default now()
);

create table if not exists public.meetup_points (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  label text not null,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles (id) on delete cascade,
  type text not null check (type in ('marketplace', 'donation')),
  title text not null,
  description text not null default '',
  category text not null default '',
  size text not null default '',
  condition text not null default '',
  price_cents integer,
  currency text not null default 'USD',
  status text not null default 'pending'
    check (status in ('draft', 'pending', 'verified', 'rejected', 'sold', 'claimed', 'closed')),
  reject_reason text,
  verified_at timestamptz,
  verified_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists listings_status_idx on public.listings (status);
create index if not exists listings_type_status_idx on public.listings (type, status);
create index if not exists listings_seller_idx on public.listings (seller_id);

create table if not exists public.listing_photos (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id) on delete cascade,
  angle text not null check (angle in ('front', 'back', 'tag', 'defect', 'other')),
  storage_path text not null,
  public_url text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists listing_photos_listing_idx on public.listing_photos (listing_id);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id) on delete cascade,
  buyer_id uuid not null references public.profiles (id) on delete cascade,
  seller_id uuid not null references public.profiles (id) on delete cascade,
  payment_method text not null check (payment_method in ('cod', 'online')),
  meetup_point_id uuid references public.meetup_points (id),
  item_price_cents integer not null,
  fee_cents integer not null default 0,
  total_cents integer not null,
  status text not null default 'requested'
    check (status in ('requested', 'awaiting_payment', 'paid', 'accepted', 'completed', 'cancelled')),
  stripe_checkout_session_id text,
  stripe_payment_intent_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists transactions_buyer_idx on public.transactions (buyer_id);
create index if not exists transactions_seller_idx on public.transactions (seller_id);

create table if not exists public.donation_claims (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id) on delete cascade,
  claimer_id uuid not null references public.profiles (id) on delete cascade,
  message text not null default '',
  contact text not null default '',
  pickup_preference text not null default '',
  status text not null default 'requested'
    check (status in ('requested', 'approved', 'fulfilled', 'declined')),
  created_at timestamptz not null default now()
);

create index if not exists donation_claims_listing_idx on public.donation_claims (listing_id);

create table if not exists public.audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles (id),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.app_config (
  key text primary key,
  value jsonb not null
);

insert into public.app_config (key, value)
values ('platform_fee_percent', '5'::jsonb)
on conflict (key) do nothing;

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, area)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1), 'Teen'),
    coalesce(new.raw_user_meta_data->>'area', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- updated_at helper
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists listings_updated_at on public.listings;
create trigger listings_updated_at
  before update on public.listings
  for each row execute function public.set_updated_at();

drop trigger if exists transactions_updated_at on public.transactions;
create trigger transactions_updated_at
  before update on public.transactions
  for each row execute function public.set_updated_at();

-- Storage bucket for listing photos
insert into storage.buckets (id, name, public)
values ('listing-photos', 'listing-photos', true)
on conflict (id) do update set public = excluded.public;
