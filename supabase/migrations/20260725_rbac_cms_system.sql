-- ============================================================================
-- PHASE 2: ADVANCED ADMIN/ERP SYSTEM - RBAC AND CMS
-- Enhanced Role-Based Access Control and Content Management System
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- RBAC TABLES
-- ============================================================================

-- Admin Roles Table
CREATE TABLE IF NOT EXISTS public.admin_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  permissions JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for admin_roles
CREATE INDEX IF NOT EXISTS admin_roles_name_idx ON public.admin_roles(name);

-- Admin Role Assignments Table
CREATE TABLE IF NOT EXISTS public.admin_role_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES public.admin_roles (id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES public.profiles (id),
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  UNIQUE(user_id, role_id)
);

-- Indexes for admin_role_assignments
CREATE INDEX IF NOT EXISTS admin_role_assignments_user_idx ON public.admin_role_assignments(user_id);
CREATE INDEX IF NOT EXISTS admin_role_assignments_role_idx ON public.admin_role_assignments(role_id);
CREATE INDEX IF NOT EXISTS admin_role_assignments_active_idx ON public.admin_role_assignments(is_active) WHERE is_active = true;

-- Admin Audit Log Table
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES public.profiles (id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',
  status TEXT DEFAULT 'success' CHECK (status IN ('success', 'failure', 'partial')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for admin_audit_log
CREATE INDEX IF NOT EXISTS admin_audit_log_actor_idx ON public.admin_audit_log(actor_id);
CREATE INDEX IF NOT EXISTS admin_audit_log_action_idx ON public.admin_audit_log(action);
CREATE INDEX IF NOT EXISTS admin_audit_log_resource_idx ON public.admin_audit_log(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS admin_audit_log_created_idx ON public.admin_audit_log(created_at DESC);

-- ============================================================================
-- CMS TABLES
-- ============================================================================

-- CMS Content Blocks Table
CREATE TABLE IF NOT EXISTS public.cms_content_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  block_type TEXT NOT NULL CHECK (block_type IN ('hero', 'banner', 'feature', 'category_highlight', 'announcement')),
  title TEXT NOT NULL,
  content JSONB NOT NULL,
  targeting_rules JSONB DEFAULT '{}',
  schedule_start TIMESTAMPTZ,
  schedule_end TIMESTAMPTZ,
  priority INTEGER DEFAULT 0,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived', 'scheduled')),
  created_by UUID REFERENCES public.profiles (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

-- Indexes for cms_content_blocks
CREATE INDEX IF NOT EXISTS cms_content_blocks_type_idx ON public.cms_content_blocks(block_type);
CREATE INDEX IF NOT EXISTS cms_content_blocks_status_idx ON public.cms_content_blocks(status);
CREATE INDEX IF NOT EXISTS cms_content_blocks_priority_idx ON public.cms_content_blocks(priority DESC);
CREATE INDEX IF NOT EXISTS cms_content_blocks_schedule_idx ON public.cms_content_blocks(schedule_start, schedule_end);

-- CMS Hero Sections Table
CREATE TABLE IF NOT EXISTS public.cms_hero_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  hero_type TEXT CHECK (hero_type IN ('slider', 'static', 'video', 'interactive', 'product_showcase')),
  slides JSONB NOT NULL,
  settings JSONB DEFAULT '{}',
  ab_test_config JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT false,
  created_by UUID REFERENCES public.profiles (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for cms_hero_sections
CREATE INDEX IF NOT EXISTS cms_hero_sections_active_idx ON public.cms_hero_sections(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS cms_hero_sections_type_idx ON public.cms_hero_sections(hero_type);

-- CMS Featured Sections Table
CREATE TABLE IF NOT EXISTS public.cms_featured_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_name TEXT NOT NULL,
  section_type TEXT CHECK (section_type IN ('listing_grid', 'category_showcase', 'seller_spotlight', 'collection')),
  content_config JSONB NOT NULL,
  display_rules JSONB DEFAULT '{}',
  priority INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for cms_featured_sections
CREATE INDEX IF NOT EXISTS cms_featured_sections_active_idx ON public.cms_featured_sections(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS cms_featured_sections_priority_idx ON public.cms_featured_sections(priority DESC);

-- ============================================================================
-- ANALYTICS TABLES
-- ============================================================================

-- Analytics Events Table
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  user_id UUID REFERENCES public.profiles (id) ON DELETE SET NULL,
  session_id TEXT,
  listing_id UUID REFERENCES public.listings (id) ON DELETE SET NULL,
  properties JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for analytics_events
CREATE INDEX IF NOT EXISTS analytics_events_type_idx ON public.analytics_events(event_type);
CREATE INDEX IF NOT EXISTS analytics_events_user_idx ON public.analytics_events(user_id);
CREATE INDEX IF NOT EXISTS analytics_events_listing_idx ON public.analytics_events(listing_id);
CREATE INDEX IF NOT EXISTS analytics_events_session_idx ON public.analytics_events(session_id);
CREATE INDEX IF NOT EXISTS analytics_events_created_idx ON public.analytics_events(created_at DESC);

-- Analytics Daily Aggregates Table
CREATE TABLE IF NOT EXISTS public.analytics_daily_aggregates (
  date DATE NOT NULL,
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  dimensions JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (date, metric_name, dimensions)
);

-- Indexes for analytics_daily_aggregates
CREATE INDEX IF NOT EXISTS analytics_daily_aggregates_date_idx ON public.analytics_daily_aggregates(date DESC);
CREATE INDEX IF NOT EXISTS analytics_daily_aggregates_metric_idx ON public.analytics_daily_aggregates(metric_name);

-- ============================================================================
-- A/B TESTING TABLES
-- ============================================================================

-- A/B Experiments Table
CREATE TABLE IF NOT EXISTS public.ab_experiments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  variants JSONB NOT NULL,
  targeting_rules JSONB DEFAULT '{}',
  traffic_allocation JSONB NOT NULL,
  metrics JSONB NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'running', 'paused', 'completed', 'archived')),
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  winning_variant TEXT,
  statistical_significance NUMERIC,
  sample_size INTEGER,
  created_by UUID REFERENCES public.profiles (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for ab_experiments
CREATE INDEX IF NOT EXISTS ab_experiments_status_idx ON public.ab_experiments(status);
CREATE INDEX IF NOT EXISTS ab_experiments_start_idx ON public.ab_experiments(start_date);

-- A/B Exposure Events Table
CREATE TABLE IF NOT EXISTS public.ab_exposure_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id UUID NOT NULL REFERENCES public.ab_experiments (id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles (id) ON DELETE SET NULL,
  session_id TEXT,
  variant TEXT NOT NULL,
  exposed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for ab_exposure_events
CREATE INDEX IF NOT EXISTS ab_exposure_events_experiment_idx ON public.ab_exposure_events(experiment_id);
CREATE INDEX IF NOT EXISTS ab_exposure_events_user_idx ON public.ab_exposure_events(user_id);
CREATE INDEX IF NOT EXISTS ab_exposure_events_variant_idx ON public.ab_exposure_events(variant);

-- A/B Conversion Events Table
CREATE TABLE IF NOT EXISTS public.ab_conversion_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id UUID NOT NULL REFERENCES public.ab_experiments (id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles (id) ON DELETE SET NULL,
  variant TEXT NOT NULL,
  metric_name TEXT NOT NULL,
  metric_value NUMERIC,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for ab_conversion_events
CREATE INDEX IF NOT EXISTS ab_conversion_events_experiment_idx ON public.ab_conversion_events(experiment_id);
CREATE INDEX IF NOT EXISTS ab_conversion_events_user_idx ON public.ab_conversion_events(user_id);
CREATE INDEX IF NOT EXISTS ab_conversion_events_metric_idx ON public.ab_conversion_events(metric_name);

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to relevant tables
CREATE TRIGGER update_admin_roles_updated_at BEFORE UPDATE ON public.admin_roles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cms_content_blocks_updated_at BEFORE UPDATE ON public.cms_content_blocks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cms_hero_sections_updated_at BEFORE UPDATE ON public.cms_hero_sections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cms_featured_sections_updated_at BEFORE UPDATE ON public.cms_featured_sections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ab_experiments_updated_at BEFORE UPDATE ON public.ab_experiments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_analytics_daily_aggregates_updated_at BEFORE UPDATE ON public.analytics_daily_aggregates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- INITIAL DATA
-- ============================================================================

-- Insert default admin roles
INSERT INTO public.admin_roles (name, description, permissions) VALUES
  (
    'Super Admin',
    'Full system access with all permissions',
    '["*"]'::jsonb
  ),
  (
    'Content Manager',
    'Content and listing management permissions',
    '["cms.manage", "cms.publish", "listings.moderate", "analytics.view", "media.manage"]'::jsonb
  ),
  (
    'Finance Manager',
    'Financial operations and reporting',
    '["transactions.view", "transactions.refund", "reports.finance", "gst.manage", "payouts.manage"]'::jsonb
  ),
  (
    'Community Manager',
    'Community moderation and user support',
    '["users.moderate", "comments.moderate", "support.respond", "reports.view"]'::jsonb
  ),
  (
    'Analytics Viewer',
    'View-only access to analytics and reports',
    '["analytics.view", "reports.view", "insights.view"]'::jsonb
  )
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_role_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_content_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_hero_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_featured_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_daily_aggregates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ab_experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ab_exposure_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ab_conversion_events ENABLE ROW LEVEL SECURITY;

-- Admin Roles Policies
CREATE POLICY "Admin roles are viewable by all authenticated users" ON public.admin_roles
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Super admins can manage admin roles" ON public.admin_roles
  FOR ALL USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM public.admin_role_assignments ara
      JOIN public.admin_roles ar ON ara.role_id = ar.id
      WHERE ara.user_id = auth.uid()
      AND ar.name = 'Super Admin'
      AND ara.is_active = true
    )
  );

-- Admin Role Assignments Policies
CREATE POLICY "Users can view their own role assignments" ON public.admin_role_assignments
  FOR SELECT USING (auth.role() = 'authenticated' AND user_id = auth.uid());

CREATE POLICY "Admins can view all role assignments" ON public.admin_role_assignments
  FOR SELECT USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM public.admin_role_assignments ara
      JOIN public.admin_roles ar ON ara.role_id = ar.id
      WHERE ara.user_id = auth.uid()
      AND ara.is_active = true
      AND ar.permissions ? 'admin.view'
    )
  );

CREATE POLICY "Super admins can manage role assignments" ON public.admin_role_assignments
  FOR ALL USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM public.admin_role_assignments ara
      JOIN public.admin_roles ar ON ara.role_id = ar.id
      WHERE ara.user_id = auth.uid()
      AND ar.name = 'Super Admin'
      AND ara.is_active = true
    )
  );

-- Admin Audit Log Policies
CREATE POLICY "Admins can view audit logs" ON public.admin_audit_log
  FOR SELECT USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM public.admin_role_assignments ara
      JOIN public.admin_roles ar ON ara.role_id = ar.id
      WHERE ara.user_id = auth.uid()
      AND ara.is_active = true
      AND (ar.permissions ? 'admin.view' OR ar.permissions ? '*' OR ar.name = 'Super Admin')
    )
  );

-- CMS Content Blocks Policies
CREATE POLICY "Anyone can view active content blocks" ON public.cms_content_blocks
  FOR SELECT USING (status = 'active');

CREATE POLICY "Content managers can manage CMS blocks" ON public.cms_content_blocks
  FOR ALL USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM public.admin_role_assignments ara
      JOIN public.admin_roles ar ON ara.role_id = ar.id
      WHERE ara.user_id = auth.uid()
      AND ara.is_active = true
      AND (ar.permissions ? 'cms.manage' OR ar.permissions ? '*' OR ar.name = 'Super Admin')
    )
  );

-- CMS Hero Sections Policies
CREATE POLICY "Anyone can view active hero sections" ON public.cms_hero_sections
  FOR SELECT USING (is_active = true);

CREATE POLICY "Content managers can manage hero sections" ON public.cms_hero_sections
  FOR ALL USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM public.admin_role_assignments ara
      JOIN public.admin_roles ar ON ara.role_id = ar.id
      WHERE ara.user_id = auth.uid()
      AND ara.is_active = true
      AND (ar.permissions ? 'cms.manage' OR ar.permissions ? '*' OR ar.name = 'Super Admin')
    )
  );

-- Analytics Events Policies
CREATE POLICY "Admins can view analytics events" ON public.analytics_events
  FOR SELECT USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM public.admin_role_assignments ara
      JOIN public.admin_roles ar ON ara.role_id = ar.id
      WHERE ara.user_id = auth.uid()
      AND ara.is_active = true
      AND (ar.permissions ? 'analytics.view' OR ar.permissions ? '*' OR ar.name = 'Super Admin')
    )
  );

CREATE POLICY "System can insert analytics events" ON public.analytics_events
  FOR INSERT WITH CHECK (true);

-- A/B Experiments Policies
CREATE POLICY "Users can view running experiments" ON public.ab_experiments
  FOR SELECT USING (status = 'running');

CREATE POLICY "Content managers can manage experiments" ON public.ab_experiments
  FOR ALL USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM public.admin_role_assignments ara
      JOIN public.admin_roles ar ON ara.role_id = ar.id
      WHERE ara.user_id = auth.uid()
      AND ara.is_active = true
      AND (ar.permissions ? 'cms.manage' OR ar.permissions ? '*' OR ar.name = 'Super Admin')
    )
  );

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE public.admin_roles IS 'Administrative roles with specific permissions for system access';
COMMENT ON TABLE public.admin_role_assignments IS 'Assigns admin roles to users with expiration and activation status';
COMMENT ON TABLE public.admin_audit_log IS 'Audit trail for all administrative actions';
COMMENT ON TABLE public.cms_content_blocks IS 'Content blocks for CMS system with targeting and scheduling';
COMMENT ON TABLE public.cms_hero_sections IS 'Hero sections with slider, static, and interactive capabilities';
COMMENT ON TABLE public.cms_featured_sections IS 'Featured sections for showcasing content and sellers';
COMMENT ON TABLE public.analytics_events IS 'Raw analytics events tracking user behavior';
COMMENT ON TABLE public.analytics_daily_aggregates IS 'Aggregated analytics metrics by date and dimensions';
COMMENT ON TABLE public.ab_experiments IS 'A/B testing experiments with variants and statistical analysis';
COMMENT ON TABLE public.ab_exposure_events IS 'Tracks which users were exposed to which experiment variants';
COMMENT ON TABLE public.ab_conversion_events IS 'Conversion events for A/B testing experiments';