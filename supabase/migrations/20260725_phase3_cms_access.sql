-- Phase 3: allow legacy profiles.role = admin to manage CMS / experiments,
-- public insert of AB events, and user preference self-service.

CREATE OR REPLACE FUNCTION public.is_legacy_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role = 'admin'
  );
$$;

-- Hero sections: legacy admins can manage; anyone can read active
DROP POLICY IF EXISTS "Legacy admins manage hero sections" ON public.cms_hero_sections;
CREATE POLICY "Legacy admins manage hero sections" ON public.cms_hero_sections
  FOR ALL USING (public.is_legacy_admin())
  WITH CHECK (public.is_legacy_admin());

DROP POLICY IF EXISTS "Legacy admins manage content blocks" ON public.cms_content_blocks;
CREATE POLICY "Legacy admins manage content blocks" ON public.cms_content_blocks
  FOR ALL USING (public.is_legacy_admin())
  WITH CHECK (public.is_legacy_admin());

DROP POLICY IF EXISTS "Legacy admins manage experiments" ON public.ab_experiments;
CREATE POLICY "Legacy admins manage experiments" ON public.ab_experiments
  FOR ALL USING (public.is_legacy_admin())
  WITH CHECK (public.is_legacy_admin());

-- Allow anonymous/authenticated clients to record exposure & conversion
DROP POLICY IF EXISTS "Anyone can insert exposure events" ON public.ab_exposure_events;
CREATE POLICY "Anyone can insert exposure events" ON public.ab_exposure_events
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can insert conversion events" ON public.ab_conversion_events;
CREATE POLICY "Anyone can insert conversion events" ON public.ab_conversion_events
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view exposure events" ON public.ab_exposure_events;
CREATE POLICY "Admins can view exposure events" ON public.ab_exposure_events
  FOR SELECT USING (public.is_legacy_admin());

DROP POLICY IF EXISTS "Admins can view conversion events" ON public.ab_conversion_events;
CREATE POLICY "Admins can view conversion events" ON public.ab_conversion_events
  FOR SELECT USING (public.is_legacy_admin());

-- User preferences self-service
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own preferences" ON public.user_preferences;
CREATE POLICY "Users manage own preferences" ON public.user_preferences
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
