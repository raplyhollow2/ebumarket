-- Donation centers (orphanages / centres), donor motivation, Tumblr-like profiles

-- ============================================================================
-- DONATION CENTERS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.donation_centers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  center_type TEXT NOT NULL DEFAULT 'orphanage'
    CHECK (center_type IN ('orphanage', 'community_center', 'cso', 'shelter', 'other')),
  slug TEXT NOT NULL UNIQUE,
  tagline TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  area TEXT NOT NULL DEFAULT '',
  contact_email TEXT,
  contact_phone TEXT,
  website TEXT,
  cover_url TEXT,
  logo_url TEXT,
  needs TEXT[] NOT NULL DEFAULT '{}',
  is_verified BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES public.profiles (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS donation_centers_active_idx
  ON public.donation_centers (is_active, is_verified);
CREATE INDEX IF NOT EXISTS donation_centers_area_idx
  ON public.donation_centers (area);

CREATE TABLE IF NOT EXISTS public.center_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  center_id UUID NOT NULL REFERENCES public.donation_centers (id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  member_role TEXT NOT NULL DEFAULT 'staff'
    CHECK (member_role IN ('owner', 'staff')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (center_id, user_id)
);

CREATE INDEX IF NOT EXISTS center_members_user_idx ON public.center_members (user_id);

ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS center_id UUID REFERENCES public.donation_centers (id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS listings_center_idx ON public.listings (center_id)
  WHERE center_id IS NOT NULL;

-- ============================================================================
-- DONOR STATS / TIERS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.donor_stats (
  user_id UUID PRIMARY KEY REFERENCES public.profiles (id) ON DELETE CASCADE,
  points INTEGER NOT NULL DEFAULT 0,
  items_donated INTEGER NOT NULL DEFAULT 0,
  items_fulfilled INTEGER NOT NULL DEFAULT 0,
  center_donations INTEGER NOT NULL DEFAULT 0,
  tier TEXT NOT NULL DEFAULT 'seedling'
    CHECK (tier IN ('seedling', 'helper', 'guardian', 'champion')),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION public.donor_tier_from_points(p INTEGER)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN p >= 150 THEN 'champion'
    WHEN p >= 75 THEN 'guardian'
    WHEN p >= 25 THEN 'helper'
    ELSE 'seedling'
  END;
$$;

CREATE OR REPLACE FUNCTION public.recompute_donor_stats(p_user UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_donated INTEGER;
  v_fulfilled INTEGER;
  v_center INTEGER;
  v_points INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_donated
  FROM public.listings
  WHERE seller_id = p_user
    AND type = 'donation'
    AND status IN ('verified', 'claimed', 'closed');

  SELECT COUNT(*) INTO v_fulfilled
  FROM public.listings
  WHERE seller_id = p_user
    AND type = 'donation'
    AND status = 'claimed';

  SELECT COUNT(*) INTO v_center
  FROM public.listings
  WHERE seller_id = p_user
    AND type = 'donation'
    AND center_id IS NOT NULL
    AND status IN ('verified', 'claimed', 'closed');

  v_points := (v_donated * 10) + (v_fulfilled * 15) + (v_center * 5);

  INSERT INTO public.donor_stats AS ds (
    user_id, points, items_donated, items_fulfilled, center_donations, tier, updated_at
  ) VALUES (
    p_user, v_points, v_donated, v_fulfilled, v_center,
    public.donor_tier_from_points(v_points), NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    points = EXCLUDED.points,
    items_donated = EXCLUDED.items_donated,
    items_fulfilled = EXCLUDED.items_fulfilled,
    center_donations = EXCLUDED.center_donations,
    tier = EXCLUDED.tier,
    updated_at = NOW();
END;
$$;

CREATE OR REPLACE FUNCTION public.trg_recompute_donor_stats()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    PERFORM public.recompute_donor_stats(NEW.seller_id);
    IF OLD.seller_id IS DISTINCT FROM NEW.seller_id THEN
      PERFORM public.recompute_donor_stats(OLD.seller_id);
    END IF;
  ELSIF TG_OP = 'INSERT' THEN
    PERFORM public.recompute_donor_stats(NEW.seller_id);
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM public.recompute_donor_stats(OLD.seller_id);
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS listings_donor_stats_trg ON public.listings;
CREATE TRIGGER listings_donor_stats_trg
  AFTER INSERT OR UPDATE OF status, type, center_id, seller_id OR DELETE
  ON public.listings
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_recompute_donor_stats();

-- ============================================================================
-- PROFILE THEMES (Tumblr-like)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.profile_themes (
  user_id UUID PRIMARY KEY REFERENCES public.profiles (id) ON DELETE CASCADE,
  banner_url TEXT,
  avatar_url TEXT,
  bio TEXT NOT NULL DEFAULT '',
  accent_color TEXT NOT NULL DEFAULT '#1c3024',
  background_style TEXT NOT NULL DEFAULT 'soft_wash'
    CHECK (background_style IN ('plain', 'soft_wash', 'grid_dots', 'photo_blur')),
  layout_style TEXT NOT NULL DEFAULT 'classic'
    CHECK (layout_style IN ('classic', 'stacked', 'magazine')),
  show_donation_stats BOOLEAN NOT NULL DEFAULT true,
  show_listings BOOLEAN NOT NULL DEFAULT true,
  custom_links JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- RLS
-- ============================================================================

ALTER TABLE public.donation_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.center_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donor_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_themes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read active centers" ON public.donation_centers;
CREATE POLICY "Public read active centers" ON public.donation_centers
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admins manage centers" ON public.donation_centers;
CREATE POLICY "Admins manage centers" ON public.donation_centers
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

DROP POLICY IF EXISTS "Members read own memberships" ON public.center_members;
CREATE POLICY "Members read own memberships" ON public.center_members
  FOR SELECT USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

DROP POLICY IF EXISTS "Admins manage memberships" ON public.center_members;
CREATE POLICY "Admins manage memberships" ON public.center_members
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

DROP POLICY IF EXISTS "Public read donor stats" ON public.donor_stats;
CREATE POLICY "Public read donor stats" ON public.donor_stats
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users manage own theme" ON public.profile_themes;
CREATE POLICY "Users manage own theme" ON public.profile_themes
  FOR ALL USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Public read profile themes" ON public.profile_themes;
CREATE POLICY "Public read profile themes" ON public.profile_themes
  FOR SELECT USING (true);

-- ============================================================================
-- SEED CENTERS (Bhutan-flavored demo)
-- ============================================================================

INSERT INTO public.donation_centers (
  name, center_type, slug, tagline, description, area,
  contact_email, cover_url, needs, is_verified, is_active
) VALUES
(
  'Thimphu Children''s Home',
  'orphanage',
  'thimphu-childrens-home',
  'Warm clothes for kids who call this home.',
  'A residential home supporting children with daily care, school, and community. They especially need jackets, school shirts, and shoes in sizes S–M.',
  'Thimphu',
  'care@thimphuhome.example',
  '/bhutan/center-thimphu-home.webp',
  ARRAY['Jackets', 'School shirts', 'Shoes', 'Blankets'],
  true,
  true
),
(
  'Paro Youth Centre',
  'community_center',
  'paro-youth-centre',
  'A place for teens to learn, play, and belong.',
  'Community drop-in centre for teens — skills workshops, sports, and peer support. Accepts clean casual wear and sports kits.',
  'Paro',
  'hello@paroyouth.example',
  '/bhutan/center-paro-youth.webp',
  ARRAY['Sportswear', 'Hoodies', 'Trainers'],
  true,
  true
),
(
  'Phuentsholing Shelter Hub',
  'shelter',
  'phuentsholing-shelter-hub',
  'Emergency clothing for families in transit.',
  'Short-stay shelter supporting families. Needs sturdy everyday clothes and warm layers year-round.',
  'Phuentsholing',
  'hub@plshelter.example',
  '/bhutan/center-pl-shelter.webp',
  ARRAY['Warm layers', 'Pants', 'Socks'],
  true,
  true
),
(
  'Bhutan Youth CSO Collective',
  'cso',
  'bhutan-youth-cso',
  'Channel gifts to partner programmes nationwide.',
  'Coordinates clothing drives with partner orphanages and centres. Tag your donation here when you want it redistributed where needed most.',
  'Nationwide',
  'collective@bycso.example',
  '/bhutan/center-cso.webp',
  ARRAY['Mixed sizes', 'School uniforms', 'Accessories'],
  true,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  tagline = EXCLUDED.tagline,
  description = EXCLUDED.description,
  needs = EXCLUDED.needs,
  cover_url = EXCLUDED.cover_url,
  is_verified = true,
  is_active = true,
  updated_at = NOW();
