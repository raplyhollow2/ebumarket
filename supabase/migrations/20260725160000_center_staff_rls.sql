-- Centre staff can read tagged listings (any status) + related claims

DROP POLICY IF EXISTS "center_staff_read_tagged_listings" ON public.listings;
CREATE POLICY "center_staff_read_tagged_listings" ON public.listings
  FOR SELECT USING (
    center_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.center_members m
      WHERE m.center_id = listings.center_id
        AND m.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "center_staff_read_claims" ON public.donation_claims;
CREATE POLICY "center_staff_read_claims" ON public.donation_claims
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM public.listings l
      JOIN public.center_members m ON m.center_id = l.center_id
      WHERE l.id = donation_claims.listing_id
        AND m.user_id = auth.uid()
    )
  );
