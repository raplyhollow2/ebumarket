-- Admin ERP & CMS System Migration
-- Enhanced RBAC, Content Management, Analytics

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- ENHANCED RBAC SYSTEM
-- ============================================================================

-- Admin Roles Table
CREATE TABLE IF NOT EXISTS public.admin_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  permissions JSONB NOT NULL DEFAULT '{}',
  is_system BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for admin_roles
CREATE INDEX IF NOT EXISTS admin_roles_name_idx ON public.admin_roles(name);
CREATE INDEX IF NOT EXISTS admin_roles_is_system_idx ON public.admin_roles(is_system);

-- Admin Role Assignments Table
CREATE TABLE IF NOT EXISTS public.admin_role_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES public.admin_roles (id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES public.profiles (id) ON DELETE SET NULL,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  UNIQUE(user_id, role_id)
);

-- Indexes for admin_role_assignments
CREATE INDEX IF NOT EXISTS admin_role_assignments_user_idx ON public.admin_role_assignments(user_id);
CREATE INDEX IF NOT EXISTS admin_role_assignments_role_idx ON public.admin_role_assignments(role_id);
CREATE INDEX IF NOT EXISTS admin_role_assignments_active_idx ON public.admin_role_assignments(is_active, expires_at);

-- Admin Audit Log Table
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES public.profiles (id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  metadata JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for admin_audit_log
CREATE INDEX IF NOT EXISTS admin_audit_log_actor_idx ON public.admin_audit_log(actor_id);
CREATE INDEX IF NOT EXISTS admin_audit_log_action_idx ON public.admin_audit_log(action);
CREATE INDEX IF NOT EXISTS admin_audit_log_resource_idx ON public.admin_audit_log(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS admin_audit_log_created_idx ON public.admin_audit_log(created_at DESC);

-- ============================================================================
-- CONTENT MANAGEMENT SYSTEM (CMS)
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
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
  created_by UUID REFERENCES public.profiles (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
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
  hero_type TEXT CHECK (hero_type IN ('slider', 'static', 'video', 'interactive')) DEFAULT 'static',
  slides JSONB NOT NULL,
  settings JSONB DEFAULT '{}',
  ab_test_config JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT false,
  created_by UUID REFERENCES public.profiles (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for cms_hero_sections
CREATE INDEX IF NOT EXISTS cms_hero_sections_active_idx ON public.cms_hero_sections(is_active);
CREATE INDEX IF NOT EXISTS cms_hero_sections_type_idx ON public.cms_hero_sections(hero_type);

-- CMS Featured Sections Table
CREATE TABLE IF NOT EXISTS public.cms_featured_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_type TEXT NOT NULL CHECK (section_type IN ('trending', 'new_arrivals', 'recommended', 'curated')),
  title TEXT NOT NULL,
  description TEXT,
  listing_ids UUID[] DEFAULT '{}',
  auto_curate BOOLEAN DEFAULT false,
  curation_rules JSONB DEFAULT '{}',
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for cms_featured_sections
CREATE INDEX IF NOT EXISTS cms_featured_sections_type_idx ON public.cms_featured_sections(section_type);
CREATE INDEX IF NOT EXISTS cms_featured_sections_active_idx ON public.cms_featured_sections(is_active, display_order);

-- ============================================================================
-- ANALYTICS & REPORTING
-- ============================================================================

-- Analytics Events Table
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  user_id UUID REFERENCES public.profiles (id) ON DELETE SET NULL,
  session_id TEXT,
  properties JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for analytics_events
CREATE INDEX IF NOT EXISTS analytics_events_type_idx ON public.analytics_events(event_type);
CREATE INDEX IF NOT EXISTS analytics_events_user_idx ON public.analytics_events(user_id);
CREATE INDEX IF NOT EXISTS analytics_events_session_idx ON public.analytics_events(session_id);
CREATE INDEX IF NOT EXISTS analytics_events_created_idx ON public.analytics_events(created_at DESC);

-- Analytics Daily Aggregates Table
CREATE TABLE IF NOT EXISTS public.analytics_daily_aggregates (
  date DATE NOT NULL,
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  dimensions JSONB DEFAULT '{}',
  PRIMARY KEY (date, metric_name, dimensions)
);

-- Indexes for analytics_daily_aggregates
CREATE INDEX IF NOT EXISTS analytics_daily_aggregates_date_idx ON public.analytics_daily_aggregates(date DESC);
CREATE INDEX IF NOT EXISTS analytics_daily_aggregates_metric_idx ON public.analytics_daily_aggregates(metric_name);

-- ============================================================================
-- A/B TESTING SYSTEM
-- ============================================================================

-- A/B Experiments Table
CREATE TABLE IF NOT EXISTS public.ab_experiments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  variants JSONB NOT NULL,
  targeting_rules JSONB DEFAULT '{}',
  traffic_allocation JSONB NOT NULL,
  metrics JSONB NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'running', 'paused', 'completed')),
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  winning_variant TEXT,
  statistical_significance NUMERIC,
  created_by UUID REFERENCES public.profiles (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for ab_experiments
CREATE INDEX IF NOT EXISTS ab_experiments_status_idx ON public.ab_experiments(status);
CREATE INDEX IF NOT EXISTS ab_experiments_date_idx ON public.ab_experiments(start_date, end_date);

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
CREATE INDEX IF NOT EXISTS ab_exposure_events_variant_idx ON public.ab_exposure_events(experiment_id, variant);

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
CREATE INDEX IF NOT EXISTS ab_conversion_events_metric_idx ON public.ab_conversion_events(experiment_id, metric_name);
CREATE INDEX IF NOT EXISTS ab_conversion_events_user_idx ON public.ab_conversion_events(user_id);

-- ============================================================================
-- DEFAULT DATA
-- ============================================================================

-- Insert default admin roles
INSERT INTO public.admin_roles (name, description, permissions, is_system) VALUES
  (
    'Super Admin',
    'Full system access with all permissions',
    '{"permissions": ["*"], "description": "Full system access"}'::jsonb,
    true
  ),
  (
    'Content Manager',
    'Content and listing management permissions',
    '{"permissions": ["cms.manage", "cms.publish", "listings.moderate", "analytics.view"], "description": "Content and listing management"}'::jsonb,
    true
  ),
  (
    'Finance Manager',
    'Financial operations and reporting',
    '{"permissions": ["transactions.view", "transactions.refund", "reports.finance", "gst.manage"], "description": "Financial operations"}'::jsonb,
    true
  ),
  (
    'Community Manager',
    'Community moderation and support',
    '{"permissions": ["users.moderate", "comments.moderate", "support.respond"], "description": "Community moderation"}'::jsonb,
    true
  )
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- Enable RLS on all admin tables
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

-- Admin Roles: Only admins can read, super admins can write
CREATE POLICY "Admins can view roles" ON public.admin_roles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.admin_role_assignments ara
      JOIN public.admin_roles ar ON ara.role_id = ar.id
      WHERE ara.user_id = auth.uid()
      AND ara.is_active = true
      AND (ara.expires_at IS NULL OR ara.expires_at > NOW())
      AND (ar.permissions->'permissions' @> '"*"'::jsonb OR ar.permissions->'permissions' @> '"admin.roles.view"'::jsonb)
    )
  );

CREATE POLICY "Super admins can modify roles" ON public.admin_roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admin_role_assignments ara
      JOIN public.admin_roles ar ON ara.role_id = ar.id
      WHERE ara.user_id = auth.uid()
      AND ara.is_active = true
      AND (ara.expires_at IS NULL OR ara.expires_at > NOW())
      AND ar.permissions->'permissions' @> '"*"'::jsonb
    )
  );

-- Admin Role Assignments: Super admins can manage, users can view their own
CREATE POLICY "Users can view their own role assignments" ON public.admin_role_assignments
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Super admins can manage role assignments" ON public.admin_role_assignments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admin_role_assignments ara
      JOIN public.admin_roles ar ON ara.role_id = ar.id
      WHERE ara.user_id = auth.uid()
      AND ara.is_active = true
      AND (ara.expires_at IS NULL OR ara.expires_at > NOW())
      AND ar.permissions->'permissions' @> '"*"'::jsonb
    )
  );

-- Admin Audit Log: Admins can view, system writes
CREATE POLICY "Admins can view audit log" ON public.admin_audit_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.admin_role_assignments ara
      JOIN public.admin_roles ar ON ara.role_id = ar.id
      WHERE ara.user_id = auth.uid()
      AND ara.is_active = true
      AND (ara.expires_at IS NULL OR ara.expires_at > NOW())
      AND (ar.permissions->'permissions' @> '"*"'::jsonb OR ar.permissions->'permissions' @> '"admin.audit.view"'::jsonb)
    )
  );

CREATE POLICY "System can write audit log" ON public.admin_audit_log
  FOR INSERT WITH CHECK (true);

-- CMS Tables: Content managers and super admins
CREATE POLICY "Content managers can view CMS content" ON public.cms_content_blocks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.admin_role_assignments ara
      JOIN public.admin_roles ar ON ara.role_id = ar.id
      WHERE ara.user_id = auth.uid()
      AND ara.is_active = true
      AND (ara.expires_at IS NULL OR ara.expires_at > NOW())
      AND (ar.permissions->'permissions' @> '"*"'::jsonb OR ar.permissions->'permissions' @> '"cms.manage"'::jsonb OR ar.permissions->'permissions' @> '"cms.view"'::jsonb)
    )
  );

CREATE POLICY "Content managers can modify CMS content" ON public.cms_content_blocks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admin_role_assignments ara
      JOIN public.admin_roles ar ON ara.role_id = ar.id
      WHERE ara.user_id = auth.uid()
      AND ara.is_active = true
      AND (ara.expires_at IS NULL OR ara.expires_at > NOW())
      AND (ar.permissions->'permissions' @> '"*"'::jsonb OR ar.permissions->'permissions' @> '"cms.manage"'::jsonb)
    )
  );

-- Similar policies for other CMS tables
CREATE POLICY "Content managers can view hero sections" ON public.cms_hero_sections
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.admin_role_assignments ara
      JOIN public.admin_roles ar ON ara.role_id = ar.id
      WHERE ara.user_id = auth.uid()
      AND ara.is_active = true
      AND (ara.expires_at IS NULL OR ara.expires_at > NOW())
      AND (ar.permissions->'permissions' @> '"*"'::jsonb OR ar.permissions->'permissions' @> '"cms.manage"'::jsonb OR ar.permissions->'permissions' @> '"cms.view"'::jsonb)
    )
  );

CREATE POLICY "Content managers can modify hero sections" ON public.cms_hero_sections
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admin_role_assignments ara
      JOIN public.admin_roles ar ON ara.role_id = ar.id
      WHERE ara.user_id = auth.uid()
      AND ara.is_active = true
      AND (ara.expires_at IS NULL OR ara.expires_at > NOW())
      AND (ar.permissions->'permissions' @> '"*"'::jsonb OR ar.permissions->'permissions' @> '"cms.manage"'::jsonb)
    )
  );

CREATE POLICY "Content managers can view featured sections" ON public.cms_featured_sections
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.admin_role_assignments ara
      JOIN public.admin_roles ar ON ara.role_id = ar.id
      WHERE ara.user_id = auth.uid()
      AND ara.is_active = true
      AND (ara.expires_at IS NULL OR ara.expires_at > NOW())
      AND (ar.permissions->'permissions' @> '"*"'::jsonb OR ar.permissions->'permissions' @> '"cms.manage"'::jsonb OR ar.permissions->'permissions' @> '"cms.view"'::jsonb)
    )
  );

CREATE POLICY "Content managers can modify featured sections" ON public.cms_featured_sections
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admin_role_assignments ara
      JOIN public.admin_roles ar ON ara.role_id = ar.id
      WHERE ara.user_id = auth.uid()
      AND ara.is_active = true
      AND (ara.expires_at IS NULL OR ara.expires_at > NOW())
      AND (ar.permissions->'permissions' @> '"*"'::jsonb OR ar.permissions->'permissions' @> '"cms.manage"'::jsonb)
    )
  );

-- Analytics: Admins can view, system writes
CREATE POLICY "Admins can view analytics" ON public.analytics_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.admin_role_assignments ara
      JOIN public.admin_roles ar ON ara.role_id = ar.id
      WHERE ara.user_id = auth.uid()
      AND ara.is_active = true
      AND (ara.expires_at IS NULL OR ara.expires_at > NOW())
      AND (ar.permissions->'permissions' @> '"*"'::jsonb OR ar.permissions->'permissions' @> '"analytics.view"'::jsonb)
    )
  );

CREATE POLICY "System can write analytics" ON public.analytics_events
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view analytics aggregates" ON public.analytics_daily_aggregates
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.admin_role_assignments ara
      JOIN public.admin_roles ar ON ara.role_id = ar.id
      WHERE ara.user_id = auth.uid()
      AND ara.is_active = true
      AND (ara.expires_at IS NULL OR ara.expires_at > NOW())
      AND (ar.permissions->'permissions' @> '"*"'::jsonb OR ar.permissions->'permissions' @> '"analytics.view"'::jsonb)
    )
  );

-- A/B Testing: Content managers can manage
CREATE POLICY "Content managers can view experiments" ON public.ab_experiments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.admin_role_assignments ara
      JOIN public.admin_roles ar ON ara.role_id = ar.id
      WHERE ara.user_id = auth.uid()
      AND ara.is_active = true
      AND (ara.expires_at IS NULL OR ara.expires_at > NOW())
      AND (ar.permissions->'permissions' @> '"*"'::jsonb OR ar.permissions->'permissions' @> '"cms.manage"'::jsonb OR ar.permissions->'permissions' @> '"analytics.view"'::jsonb)
    )
  );

CREATE POLICY "Content managers can modify experiments" ON public.ab_experiments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admin_role_assignments ara
      JOIN public.admin_roles ar ON ara.role_id = ar.id
      WHERE ara.user_id = auth.uid()
      AND ara.is_active = true
      AND (ara.expires_at IS NULL OR ara.expires_at > NOW())
      AND (ar.permissions->'permissions' @> '"*"'::jsonb OR ar.permissions->'permissions' @> '"cms.manage"'::jsonb)
    )
  );

-- A/B Events: System writes, admins read
CREATE POLICY "System can write ab events" ON public.ab_exposure_events
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view ab events" ON public.ab_exposure_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.admin_role_assignments ara
      JOIN public.admin_roles ar ON ara.role_id = ar.id
      WHERE ara.user_id = auth.uid()
      AND ara.is_active = true
      AND (ara.expires_at IS NULL OR ara.expires_at > NOW())
      AND (ar.permissions->'permissions' @> '"*"'::jsonb OR ar.permissions->'permissions' @> '"analytics.view"'::jsonb)
    )
  );

CREATE POLICY "System can write ab conversions" ON public.ab_conversion_events
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view ab conversions" ON public.ab_conversion_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.admin_role_assignments ara
      JOIN public.admin_roles ar ON ara.role_id = ar.id
      WHERE ara.user_id = auth.uid()
      AND ara.is_active = true
      AND (ara.expires_at IS NULL OR ara.expires_at > NOW())
      AND (ar.permissions->'permissions' @> '"*"'::jsonb OR ar.permissions->'permissions' @> '"analytics.view"'::jsonb)
    )
  );