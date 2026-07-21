-- Allow public read of profiles (display names / areas on listings)
drop policy if exists "profiles_public_read" on public.profiles;
create policy "profiles_public_read" on public.profiles
  for select using (true);
