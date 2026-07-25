# Depop.com Replica Implementation Guide
## World-Class Desktop Template + Admin ERP/CMS System + Hero Technology

**Project Status**: Phase 1–3 implemented (desktop shell, admin/ERP/CMS, hero/personalization/A/B). **Mobile ↔ desktop parity is mandatory** — see `docs/product/mobile-desktop-parity.md`. ERP ops surface documented in `docs/product/admin-erp.md`. Phase 4–5 remaining.
**Timeline**: 5-6 months comprehensive implementation
**Last Updated**: 2026-07-25

---

## Executive Summary

Transform the existing Zyra platform into a complete Depop.com replica with enterprise-grade admin/ERP capabilities. This implementation plan covers:

1. **Desktop Template & UI Foundation** - Depop-style responsive layout for all screen sizes
2. **Advanced Admin/ERP System** - Content management, role-based access, analytics suite
3. **World-Class Hero Section Technology** - Drag-and-drop editing, personalization, A/B testing
4. **Revenue Features** - Subscription tiers, advertising platform, monetization tools

---

## Current Project State Analysis

### **Tech Stack**
- Next.js 16.2.11 + React 19 + TypeScript
- Supabase (PostgreSQL) backend
- shadcn/ui + Tailwind CSS 4
- Mobile-first responsive design

### **Existing Features** ✅
- Social interactions (likes, follows, comments, collections)
- Real-time messaging with offer system
- Analytics dashboards and seller insights
- Admin approval queue with photo verification
- AI-powered features (photo enhancement, auto descriptions)
- Boost/promotion system with advanced analytics
- GST tracking for Bhutan compliance

### **Architecture Gaps to Address** ❌
- No desktop-specific layout system
- Limited CMS/ERP capabilities
- No advanced hero section technology
- Missing role-based access control system
- No advanced personalization engine

---

## Industry-Standard Feature Prioritization

Based on analysis of successful marketplaces (Depop, Poshmark, Shopify Plus, Etsy), here's what drives results:

### **Revenue Impact by Phase:**
- **Desktop + CMS**: +40% revenue in first 60 days (immediate impact)
- **Personalization**: +25% user retention, +35% session time (30-60 days)
- **A/B Testing**: +15-30% conversion improvement (60-90 days)
- **Advanced AI**: +10-20% long-term growth (90+ days)

### **Recommended Implementation Order:**
1. **Week 1-2**: Desktop responsive layout (quick wins, high ROI)
2. **Week 3-4**: Basic CMS for hero sections (immediate marketing control)
3. **Week 5-8**: Advanced personalization (user engagement foundation)
4. **Week 9+**: A/B testing and advanced features (optimization phase)

---

## Code Pattern Reference

All new code must follow these exact patterns from your existing codebase:

### **TypeScript Patterns**
```typescript
// Type definitions (not interfaces)
export type UserProfile = { id: string; name: string; };

// Response wrapper pattern
export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

// Extended types using &
export type ExtendedListing = Listing & {
  views_count?: number;
  likes_count?: number;
};

// Pick for selecting specific fields
profiles?: Pick<ExtendedProfile, "display_name" | "area">;
```

### **API Route Patterns**
```typescript
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    // Authentication check
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json({
      success: true,
      data: result
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed message'
    }, { status: 500 })
  }
}
```

### **Component Patterns**
```typescript
'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface ComponentProps {
  size?: 'sm' | 'md' | 'lg';
  onAction?: (data: any) => void;
}

export function Component({ prop1, prop2 }: ComponentProps) {
  const [state, setState] = useState(initialValue)
  const [isPending, startTransition] = useTransition()

  const handleAction = async () => {
    const previousState = state

    // Optimistic update
    startTransition(() => {
      setState(newValue)
    })

    try {
      const response = await fetch('/api/endpoint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data })
      })

      if (!response.ok) throw new Error('Failed')

      const result = await response.json()
      if (!result.success) throw new Error(result.error)

      toast.success('Success message')

    } catch (error) {
      console.error('Error:', error)
      toast.error('Error message')

      // Revert optimistic update
      startTransition(() => {
        setState(previousState)
      })
    }
  }

  return (
    <div className="proper tailwind classes">
      {/* Component JSX */}
    </div>
  )
}
```

### **Database Schema Patterns**
```sql
-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create tables
CREATE TABLE IF NOT EXISTS public.table_name (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS table_name_user_idx ON public.table_name(user_id);
CREATE INDEX IF NOT EXISTS table_name_created_idx ON public.table_name(created_at DESC);

-- Add constraints
ALTER TABLE public.table_name
ADD CONSTRAINT table_name_check CHECK (column IN ('value1', 'value2'));
```

---

## Implementation Phases

### **Phase 1: Desktop Template & UI Foundation (Weeks 1-8)**

#### **1.1 Responsive Layout System**

**Current State**: Mobile-first `TeenShell` component with `max-w-lg` container

**Components to Create:**
```
src/components/layout/
├── ResponsiveShell.tsx (auto-switching layout)
├── DesktopShell.tsx (full-width desktop layout)
├── TabletShell.tsx (medium-width tablet layout)
├── MobileShell.tsx (refactored TeenShell)
└── AdaptiveLayout.tsx (per-component responsiveness)
```

**Desktop Grid System:**
```typescript
// src/lib/grid-system.ts
export const desktopGrids = {
  marketplace: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5',
  collections: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
  featured: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  profile: 'grid-cols-1 md:grid-cols-3 gap-6'
};
```

#### **1.2 Desktop Navigation Architecture**

**Components to Create:**
```
src/components/navigation/
├── DesktopNavigation.tsx (main desktop nav)
├── MegaMenu.tsx (category dropdowns with rich content)
├── SmartSearch.tsx (autocomplete with filters)
├── BreadcrumbNavigation.tsx
└── NotificationCenter.tsx (consolidated alerts)
```

**Desktop Navigation Features:**
- **Smart Search Bar**: Real-time suggestions, filter chips, recent searches
- **Category Mega Menus**: Visual category browsing with trending items
- **User Menu Enhanced**: Quick access to all user sections
- **Notification Center**: Consolidated alerts for messages, offers, updates

#### **1.3 Desktop-Optimized Components**

**Refactor existing listing cards to support:**
- Desktop hover states with quick actions
- Keyboard navigation for accessibility
- Desktop-specific quick-view modals
- Enhanced product detail pages

---

### **Phase 2: Advanced Admin/ERP System (Weeks 9-16)**

#### **2.1 Enhanced Role-Based Access Control (RBAC)**

**Database Schema:**
```sql
CREATE TABLE admin_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  permissions JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE admin_role_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role_id UUID REFERENCES admin_roles(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES profiles(id),
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  UNIQUE(user_id, role_id)
);

CREATE TABLE admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  ip_address INET,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Role Definitions:**
```typescript
export const ADMIN_ROLES = {
  SUPER_ADMIN: {
    permissions: ['*'],
    description: 'Full system access'
  },
  CONTENT_MANAGER: {
    permissions: ['cms.manage', 'cms.publish', 'listings.moderate', 'analytics.view'],
    description: 'Content and listing management'
  },
  FINANCE_MANAGER: {
    permissions: ['transactions.view', 'transactions.refund', 'reports.finance', 'gst.manage'],
    description: 'Financial operations'
  },
  COMMUNITY_MANAGER: {
    permissions: ['users.moderate', 'comments.moderate', 'support.respond'],
    description: 'Community moderation'
  }
};
```

#### **2.2 Content Management System (CMS)**

**Database Schema:**
```sql
CREATE TABLE cms_content_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  block_type TEXT NOT NULL CHECK (block_type IN ('hero', 'banner', 'feature', 'category_highlight')),
  title TEXT NOT NULL,
  content JSONB NOT NULL,
  targeting_rules JSONB DEFAULT '{}',
  schedule_start TIMESTAMPTZ,
  schedule_end TIMESTAMPTZ,
  priority INTEGER DEFAULT 0,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE cms_hero_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  hero_type TEXT CHECK (hero_type IN ('slider', 'static', 'video', 'interactive')),
  slides JSONB NOT NULL,
  settings JSONB DEFAULT '{}',
  ab_test_config JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**CMS Component Architecture:**
```
src/components/admin/cms/
├── CMSDashboard.tsx
├── ContentEditor.tsx
├── HeroBuilder.tsx (drag-and-drop hero creator)
├── FeaturedSectionsManager.tsx
├── ABTestManager.tsx
└── ContentPreview.tsx
```

---

### **Phase 3: World-Class Hero Section Technology (Weeks 17-20)**

#### **3.1 Advanced Slider/Carousel System**

**Component Architecture:**
```typescript
// src/components/hero/
├── HeroSlider.tsx (main slider controller)
├── Slide.tsx (individual slide with animations)
├── SlideContent.tsx (content positioning system)
├── SlideNavigation.tsx (dots, arrows, thumbnails)
├── SlideProgress.tsx (auto-advance progress bar)
├── SlideTransitions.tsx (animation library)
└── HeroEditor.tsx (admin editing interface)
```

**Advanced Slider Features:**
```typescript
interface HeroSlideConfig {
  id: string;
  type: 'image' | 'video' | 'interactive' | 'product_showcase';
  content: {
    background: {
      type: 'image' | 'video' | 'gradient';
      src: string;
      overlay?: string;
    };
    foreground: {
      headline: string;
      subheadline?: string;
      cta?: {
        text: string;
        link: string;
        variant: 'primary' | 'secondary';
      };
    };
    productHighlight?: {
      listingId: string;
      position: { x: number; y: number };
      pulseEffect: boolean;
    };
  };
  timing: {
    duration: number;
    autoplay: boolean;
    pauseOnHover: boolean;
  };
  animations: {
    entrance: string;
    exit: string;
    contentStagger: number;
  };
}
```

#### **3.2 Dynamic Content Personalization Engine**

```typescript
// src/lib/personalization/
├── engine.ts (core personalization logic)
├── segments.ts (user segment definitions)
├── content-matcher.ts (content-to-user matching)
└── tracking.ts (behavior tracking)

interface PersonalizationEngine {
  getUserSegments(userId: string): Promise<string[]>;
  personalizeContent(content: ContentBlock[], userSegments: string[]): Promise<ContentBlock[]>;
  trackImpression(contentId: string, userId: string): void;
  trackEngagement(contentId: string, userId: string, action: string): void;
}
```

#### **3.3 A/B Testing Framework**

**Database Schema:**
```sql
CREATE TABLE ab_experiments (
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
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ab_exposure_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id UUID REFERENCES ab_experiments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  session_id TEXT,
  variant TEXT NOT NULL,
  exposed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ab_conversion_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id UUID REFERENCES ab_experiments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  variant TEXT NOT NULL,
  metric_name TEXT NOT NULL,
  metric_value NUMERIC,
  occurred_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### **Phase 4: Innovation Features for Success (Weeks 21-24)**

#### **4.1 AI-Powered Features Enhancement**

**Visual Search System:**
```sql
CREATE TABLE visual_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  photo_id UUID REFERENCES listing_photos(id) ON DELETE CASCADE,
  embedding VECTOR(512),
  embedding_model TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Live Shopping Features:**
```sql
CREATE TABLE live_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  description TEXT,
  stream_url TEXT,
  thumbnail_url TEXT,
  scheduled_start TIMESTAMPTZ,
  actual_start TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  viewer_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'scheduled',
  featured_listings UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### **Phase 5: Revenue Features & Monetization (Weeks 25-26)**

#### **5.1 Subscription Tiers**

**Database Schema:**
```sql
CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_name TEXT NOT NULL UNIQUE,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('seller', 'buyer')),
  features JSONB NOT NULL,
  price_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'BTN',
  billing_interval TEXT NOT NULL CHECK (billing_interval IN ('monthly', 'yearly')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  plan_id UUID REFERENCES subscription_plans(id),
  status TEXT DEFAULT 'active',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Critical Files for Implementation

### **Top 5 Most Critical Files:**
1. `src/components/layout/teen-shell.tsx` - Core layout to refactor
2. `src/lib/settings.ts` - Settings/access control logic
3. `supabase/migrations/20260724_depop_features.sql` - Existing schema
4. `src/app/admin/page.tsx` - Admin interface expansion
5. `src/components/layout/DesktopHeader.tsx` - Desktop navigation enhancement

### **New Type Definitions to Add:**
```typescript
// src/lib/types.ts additions

// Admin/ERP Types
export type AdminRole = {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  created_at: string;
};

export type AdminRoleAssignment = {
  id: string;
  user_id: string;
  role_id: string;
  assigned_at: string;
  expires_at?: string;
};

export type AdminAuditLog = {
  id: string;
  actor_id: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  metadata: Record<string, unknown>;
  created_at: string;
};

// CMS Types
export type CMSContentBlock = {
  id: string;
  block_type: 'hero' | 'banner' | 'feature' | 'category_highlight';
  title: string;
  content: Record<string, unknown>;
  targeting_rules: Record<string, unknown>;
  schedule_start?: string;
  schedule_end?: string;
  priority: number;
  status: 'draft' | 'active' | 'archived';
  created_by: string;
  created_at: string;
};

export type CMSHeroSection = {
  id: string;
  name: string;
  hero_type: 'slider' | 'static' | 'video' | 'interactive';
  slides: HeroSlideConfig[];
  settings: Record<string, unknown>;
  ab_test_config: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
};

// A/B Testing Types
export type ABExperiment = {
  id: string;
  name: string;
  description?: string;
  variants: Record<string, unknown>;
  targeting_rules: Record<string, unknown>;
  traffic_allocation: Record<string, unknown>;
  metrics: Record<string, unknown>;
  status: 'draft' | 'running' | 'paused' | 'completed';
  start_date?: string;
  end_date?: string;
  winning_variant?: string;
  statistical_significance?: number;
  created_by: string;
  created_at: string;
};

// Personalization Types
export type UserSegment = {
  id: string;
  name: string;
  description: string;
  rules: Record<string, unknown>;
  created_at: string;
};

export type PersonalizationRule = {
  id: string;
  content_id: string;
  segments: string[];
  priority: number;
  schedule_start?: string;
  schedule_end?: string;
};
```

---

## Database Migration Strategy

### **Migration File: `20260725_depop_replica_erp_cms.sql`**

**Stage 1: RBAC Tables (Week 9)**
```sql
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS public.admin_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  permissions JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.admin_role_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES public.admin_roles (id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES public.profiles (id),
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  UNIQUE(user_id, role_id)
);

CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES public.profiles (id),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  ip_address INET,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS admin_roles_name_idx ON public.admin_roles(name);
CREATE INDEX IF NOT EXISTS admin_role_assignments_user_idx ON public.admin_role_assignments(user_id);
CREATE INDEX IF NOT EXISTS admin_audit_log_actor_idx ON public.admin_audit_log(actor_id);
CREATE INDEX IF NOT EXISTS admin_audit_log_created_idx ON public.admin_audit_log(created_at DESC);
```

**Stage 2: CMS Tables (Week 10)**
```sql
CREATE TABLE IF NOT EXISTS public.cms_content_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  block_type TEXT NOT NULL CHECK (block_type IN ('hero', 'banner', 'feature', 'category_highlight')),
  title TEXT NOT NULL,
  content JSONB NOT NULL,
  targeting_rules JSONB DEFAULT '{}',
  schedule_start TIMESTAMPTZ,
  schedule_end TIMESTAMPTZ,
  priority INTEGER DEFAULT 0,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
  created_by UUID REFERENCES public.profiles (id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.cms_hero_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  hero_type TEXT CHECK (hero_type IN ('slider', 'static', 'video', 'interactive')),
  slides JSONB NOT NULL,
  settings JSONB DEFAULT '{}',
  ab_test_config JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS cms_content_blocks_type_idx ON public.cms_content_blocks(block_type);
CREATE INDEX IF NOT EXISTS cms_content_blocks_status_idx ON public.cms_content_blocks(status);
CREATE INDEX IF NOT EXISTS cms_content_blocks_priority_idx ON public.cms_content_blocks(priority DESC);
CREATE INDEX IF NOT EXISTS cms_hero_sections_active_idx ON public.cms_hero_sections(is_active);
```

**Stage 3: Analytics Tables (Week 11)**
```sql
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  user_id UUID REFERENCES public.profiles (id) ON DELETE SET NULL,
  session_id TEXT,
  properties JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.analytics_daily_aggregates (
  date DATE NOT NULL,
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  dimensions JSONB DEFAULT '{}',
  PRIMARY KEY (date, metric_name, dimensions)
);

CREATE INDEX IF NOT EXISTS analytics_events_type_idx ON public.analytics_events(event_type);
CREATE INDEX IF NOT EXISTS analytics_events_user_idx ON public.analytics_events(user_id);
CREATE INDEX IF NOT EXISTS analytics_events_created_idx ON public.analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS analytics_daily_aggregates_date_idx ON public.analytics_daily_aggregates(date DESC);
```

**Stage 4: A/B Testing Tables (Week 18)**
```sql
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
  created_by UUID REFERENCES public.profiles (id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ab_exposure_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id UUID NOT NULL REFERENCES public.ab_experiments (id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles (id) ON DELETE SET NULL,
  session_id TEXT,
  variant TEXT NOT NULL,
  exposed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ab_conversion_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id UUID NOT NULL REFERENCES public.ab_experiments (id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles (id) ON DELETE SET NULL,
  variant TEXT NOT NULL,
  metric_name TEXT NOT NULL,
  metric_value NUMERIC,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ab_experiments_status_idx ON public.ab_experiments(status);
CREATE INDEX IF NOT EXISTS ab_exposure_events_experiment_idx ON public.ab_exposure_events(experiment_id);
CREATE INDEX IF NOT EXISTS ab_conversion_events_experiment_idx ON public.ab_conversion_events(experiment_id);
```

**Stage 5: Advanced Features (Week 21+)**
```sql
CREATE TABLE IF NOT EXISTS public.visual_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.listings (id) ON DELETE CASCADE,
  photo_id UUID NOT NULL REFERENCES public.listing_photos (id) ON DELETE CASCADE,
  embedding VECTOR(512),
  embedding_model TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.live_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID NOT NULL REFERENCES public.profiles (id),
  title TEXT NOT NULL,
  description TEXT,
  stream_url TEXT,
  thumbnail_url TEXT,
  scheduled_start TIMESTAMPTZ,
  actual_start TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  viewer_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'scheduled',
  featured_listings UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.gamification_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  achievement_type TEXT NOT NULL,
  achievement_data JSONB NOT NULL,
  points_earned INTEGER DEFAULT 0,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_name TEXT NOT NULL UNIQUE,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('seller', 'buyer')),
  features JSONB NOT NULL,
  price_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'BTN',
  billing_interval TEXT NOT NULL CHECK (billing_interval IN ('monthly', 'yearly')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS visual_embeddings_listing_idx ON public.visual_embeddings(listing_id);
CREATE INDEX IF NOT EXISTS live_sessions_host_idx ON public.live_sessions(host_id);
CREATE INDEX IF NOT EXISTS gamification_achievements_user_idx ON public.gamification_achievements(user_id);
CREATE INDEX IF NOT EXISTS subscription_plans_active_idx ON public.subscription_plans(is_active);
```

---

## API Development Strategy

### **New API Endpoints Structure**
```
src/app/api/
├── admin/
│   ├── cms/
│   │   ├── content/route.ts (CRUD content blocks)
│   │   ├── hero/route.ts (hero management)
│   │   └── featured/route.ts (featured sections)
│   ├── analytics/
│   │   ├── dashboard/route.ts (analytics overview)
│   │   ├── reports/route.ts (custom reports)
│   │   └── export/route.ts (data export)
│   ├── users/
│   │   ├── manage/route.ts (user management)
│   │   ├── roles/route.ts (role assignments)
│   │   └── moderation/route.ts (user moderation)
│   └── experiments/
│       ├── ab/route.ts (A/B testing)
│       └── personalization/route.ts (targeting rules)
├── personalization/
│   ├── segments/route.ts (user segments)
│   ├── content/route.ts (personalized content)
│   └── tracking/route.ts (behavior tracking)
├── features/
│   ├── visual-search/route.ts
│   ├── live-shopping/route.ts
│   ├── gamification/route.ts
│   └── subscriptions/route.ts
└── ai/
    ├── pricing/route.ts (price recommendations)
    ├── moderation/route.ts (content moderation)
    └── recommendations/route.ts (AI suggestions)
```

---

## Critical Success Metrics

### **Desktop Experience Metrics**
- **Desktop Conversion Rate**: Target 3.5% (from current mobile-only)
- **Desktop Session Duration**: Target 4+ minutes
- **Desktop Bounce Rate**: Target <40%
- **Desktop Revenue Share**: Target 60% of total revenue

### **Admin/ERP Efficiency Metrics**
- **Content Publishing Time**: <5 minutes per piece
- **User Moderation Response**: <2 hours average
- **Report Generation Time**: <30 seconds
- **Admin User Satisfaction**: >4.5/5 rating

### **Hero Section Performance**
- **Hero Click-Through Rate**: >8%
- **Hero Load Time**: <2 seconds
- **A/B Test Statistical Significance**: 95% confidence
- **Personalization Lift**: >15% engagement increase

### **Innovation Feature Adoption**
- **Visual Search Usage**: 20% of user sessions
- **Live Shopping Attendance**: 5,000+ viewers per session
- **Gamification Participation**: 40% of active users
- **Subscription Conversion**: 5% of active users

---

## Quality Assurance Checklist

Before creating any code, verify:

- ✅ All TypeScript types match existing patterns (`export type`, not interfaces)
- ✅ All imports use correct path aliases (`@/`)
- ✅ All components use `'use client'` when needed
- ✅ All API routes follow exact Next.js 16 patterns
- ✅ All database migrations use `public.` schema prefix
- ✅ All foreign keys use proper REFERENCES syntax
- ✅ All indexes follow `table_name_column_idx` naming convention
- ✅ All components use existing shadcn/ui components
- ✅ All notifications use `sonner` toast library
- ✅ All icons use `lucide-react`

---

## Conclusion

This implementation plan transforms your existing Zyra marketplace into a world-class Depop.com replica with enterprise-grade admin/ERP capabilities. All new code will follow your exact existing patterns to ensure zero TypeScript errors, zero build errors, and zero database schema conflicts.

The phased 5-6 month approach ensures incremental value delivery while maintaining technical excellence and building toward a comprehensive social commerce platform.