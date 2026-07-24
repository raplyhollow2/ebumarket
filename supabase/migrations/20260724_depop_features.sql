-- Depop-like Features Migration
-- Social Features, Messaging, Analytics, AI Support, Boost System, GST Tracking

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- SOCIAL FEATURES TABLES
-- ============================================================================

-- Social Interactions Table (likes, follows, views)
CREATE TABLE IF NOT EXISTS public.social_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('listing', 'user', 'comment')),
  target_id UUID NOT NULL,
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('like', 'follow', 'view')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Prevent duplicate interactions
  UNIQUE (user_id, target_type, target_id, interaction_type)
);

-- Indexes for social_interactions
CREATE INDEX IF NOT EXISTS social_interactions_user_idx ON public.social_interactions(user_id);
CREATE INDEX IF NOT EXISTS social_interactions_target_idx ON public.social_interactions(target_type, target_id);
CREATE INDEX IF NOT EXISTS social_interactions_type_idx ON public.social_interactions(interaction_type);
CREATE INDEX IF NOT EXISTS social_interactions_created_idx ON public.social_interactions(created_at DESC);

-- Comments Table
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.listings (id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  parent_comment_id UUID REFERENCES public.comments (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for comments
CREATE INDEX IF NOT EXISTS comments_listing_idx ON public.comments(listing_id);
CREATE INDEX IF NOT EXISTS comments_user_idx ON public.comments(user_id);
CREATE INDEX IF NOT EXISTS comments_parent_idx ON public.comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS comments_created_idx ON public.comments(created_at DESC);

-- Collections Table (wishlists/saved items)
CREATE TABLE IF NOT EXISTS public.collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for collections
CREATE INDEX IF NOT EXISTS collections_user_idx ON public.collections(user_id);
CREATE INDEX IF NOT EXISTS collections_public_idx ON public.collections(is_public) WHERE is_public = true;

-- Collection Items Table
CREATE TABLE IF NOT EXISTS public.collection_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID NOT NULL REFERENCES public.collections (id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES public.listings (id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Prevent duplicate items in collections
  UNIQUE (collection_id, listing_id)
);

-- Indexes for collection_items
CREATE INDEX IF NOT EXISTS collection_items_collection_idx ON public.collection_items(collection_id);
CREATE INDEX IF NOT EXISTS collection_items_listing_idx ON public.collection_items(listing_id);

-- ============================================================================
-- MESSAGING SYSTEM TABLES
-- ============================================================================

-- Conversations Table
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  listing_id UUID REFERENCES public.listings (id) ON DELETE SET NULL,
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Prevent duplicate conversations between same users for same listing
  UNIQUE (buyer_id, seller_id, listing_id)
);

-- Indexes for conversations
CREATE INDEX IF NOT EXISTS conversations_buyer_idx ON public.conversations(buyer_id);
CREATE INDEX IF NOT EXISTS conversations_seller_idx ON public.conversations(seller_id);
CREATE INDEX IF NOT EXISTS conversations_listing_idx ON public.conversations(listing_id);
CREATE INDEX IF NOT EXISTS conversations_last_msg_idx ON public.conversations(last_message_at DESC);

-- Messages Table
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations (id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for messages
CREATE INDEX IF NOT EXISTS messages_conversation_idx ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS messages_sender_idx ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS messages_created_idx ON public.messages(created_at DESC);
CREATE INDEX IF NOT EXISTS messages_unread_idx ON public.messages(conversation_id, is_read) WHERE is_read = false;

-- ============================================================================
-- OFFERS SYSTEM TABLES
-- ============================================================================

-- Offers Table
CREATE TABLE IF NOT EXISTS public.offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations (id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES public.listings (id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  amount_cents INTEGER NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for offers
CREATE INDEX IF NOT EXISTS offers_conversation_idx ON public.offers(conversation_id);
CREATE INDEX IF NOT EXISTS offers_listing_idx ON public.offers(listing_id);
CREATE INDEX IF NOT EXISTS offers_sender_idx ON public.offers(sender_id);
CREATE INDEX IF NOT EXISTS offers_status_idx ON public.offers(status);
CREATE INDEX IF NOT EXISTS offers_expires_idx ON public.offers(expires_at);

-- ============================================================================
-- ANALYTICS & TRACKING TABLES
-- ============================================================================

-- Listing Analytics Table
CREATE TABLE IF NOT EXISTS public.listing_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.listings (id) ON DELETE CASCADE,
  event_date DATE NOT NULL,
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  click_to_chat INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Prevent duplicate entries for same listing on same date
  UNIQUE (listing_id, event_date)
);

-- Indexes for listing_analytics
CREATE INDEX IF NOT EXISTS listing_analytics_listing_idx ON public.listing_analytics(listing_id);
CREATE INDEX IF NOT EXISTS listing_analytics_date_idx ON public.listing_analytics(event_date DESC);

-- User Preferences Table (for personalization)
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.profiles (id) ON DELETE CASCADE,
  preferred_categories TEXT[],
  preferred_sizes TEXT[],
  price_range_min INTEGER,
  price_range_max INTEGER,
  notification_settings JSONB DEFAULT '{}',
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- MARKETPLACE BOOST TABLES
-- ============================================================================

-- Boosted Listings Table
CREATE TABLE IF NOT EXISTS public.boosted_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.listings (id) ON DELETE CASCADE,
  boosted_by UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  boost_type TEXT NOT NULL CHECK (boost_type IN ('listing', 'shop')),
  start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_date TIMESTAMPTZ NOT NULL,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for boosted_listings
CREATE INDEX IF NOT EXISTS boosted_listings_listing_idx ON public.boosted_listings(listing_id);
CREATE INDEX IF NOT EXISTS boosted_listings_active_idx ON public.boosted_listings(start_date, end_date);
CREATE INDEX IF NOT EXISTS boosted_listings_user_idx ON public.boosted_listings(boosted_by);

-- ============================================================================
-- GST TRACKING TABLES (for January 2026 compliance)
-- ============================================================================

-- GST Settings Table
CREATE TABLE IF NOT EXISTS public.gst_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gst_rate NUMERIC(5,2) DEFAULT 5.00,
  gst_enabled BOOLEAN DEFAULT false,
  gst_registration_number TEXT,
  effective_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- TABLE MODIFICATIONS (Enhancing existing tables)
-- ============================================================================

-- Add columns to profiles table
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS followers_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS following_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS listings_sold INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_sales_cents INTEGER DEFAULT 0;

-- Add columns to listings table
ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS comments_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS shares_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS ai_generated_description BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_boosted BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS boost_end_time TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS gst_amount_cents INTEGER DEFAULT 0;

-- Add columns to transactions table (assuming it exists based on current schema)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'transactions' AND table_schema = 'public') THEN
    ALTER TABLE public.transactions
      ADD COLUMN IF NOT EXISTS gst_cents INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS buyer_fee_cents INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS seller_fee_cents INTEGER DEFAULT 0;
  END IF;
END $$;

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to update listing social counts
CREATE OR REPLACE FUNCTION update_listing_social_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.interaction_type = 'like' AND NEW.target_type = 'listing' THEN
    UPDATE public.listings
    SET likes_count = likes_count + 1
    WHERE id = NEW.target_id;
  ELSIF TG_OP = 'DELETE' AND OLD.interaction_type = 'like' AND OLD.target_type = 'listing' THEN
    UPDATE public.listings
    SET likes_count = GREATEST(likes_count - 1, 0)
    WHERE id = OLD.target_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for social interactions
DROP TRIGGER IF EXISTS trigger_update_listing_social_counts ON public.social_interactions;
CREATE TRIGGER trigger_update_listing_social_counts
AFTER INSERT OR DELETE ON public.social_interactions
FOR EACH ROW EXECUTE FUNCTION update_listing_social_counts();

-- Function to update follower counts
CREATE OR REPLACE FUNCTION update_follower_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.interaction_type = 'follow' THEN
    -- Increment following count for follower
    UPDATE public.profiles
    SET following_count = following_count + 1
    WHERE id = NEW.user_id;

    -- Increment followers count for being followed
    UPDATE public.profiles
    SET followers_count = followers_count + 1
    WHERE id = NEW.target_id;
  ELSIF TG_OP = 'DELETE' AND OLD.interaction_type = 'follow' THEN
    -- Decrement following count for unfollower
    UPDATE public.profiles
    SET following_count = GREATEST(following_count - 1, 0)
    WHERE id = OLD.user_id;

    -- Decrement followers count for being unfollowed
    UPDATE public.profiles
    SET followers_count = GREATEST(followers_count - 1, 0)
    WHERE id = OLD.target_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for follower counts
DROP TRIGGER IF EXISTS trigger_update_follower_counts ON public.social_interactions;
CREATE TRIGGER trigger_update_follower_counts
AFTER INSERT OR DELETE ON public.social_interactions
FOR EACH ROW EXECUTE FUNCTION update_follower_counts();

-- Function to update comment counts
CREATE OR REPLACE FUNCTION update_comment_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.listings
    SET comments_count = comments_count + 1
    WHERE id = NEW.listing_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.listings
    SET comments_count = GREATEST(comments_count - 1, 0)
    WHERE id = OLD.listing_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for comment counts
DROP TRIGGER IF EXISTS trigger_update_comment_counts ON public.comments;
CREATE TRIGGER trigger_update_comment_counts
AFTER INSERT OR DELETE ON public.comments
FOR EACH ROW EXECUTE FUNCTION update_comment_counts();

-- Function to update conversation last_message_at
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.conversations
  SET last_message_at = NEW.created_at
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for conversation timestamp
DROP TRIGGER IF EXISTS trigger_update_conversation_timestamp ON public.messages;
CREATE TRIGGER trigger_update_conversation_timestamp
AFTER INSERT ON public.messages
FOR EACH ROW EXECUTE FUNCTION update_conversation_timestamp();

-- Function to track listing views
CREATE OR REPLACE FUNCTION track_listing_view()
RETURNS TRIGGER AS $$
BEGIN
  -- Update view count
  UPDATE public.listings
  SET views_count = views_count + 1
  WHERE id = NEW.target_id;

  -- Add to analytics if today's entry doesn't exist
  INSERT INTO public.listing_analytics (listing_id, event_date, views)
  VALUES (NEW.target_id, CURRENT_DATE, 1)
  ON CONFLICT (listing_id, event_date) DO UPDATE
  SET views = listing_analytics.views + 1;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for view tracking
DROP TRIGGER IF EXISTS trigger_track_listing_view ON public.social_interactions;
CREATE TRIGGER trigger_track_listing_view
AFTER INSERT ON public.social_interactions
FOR EACH ROW
WHEN (NEW.interaction_type = 'view' AND NEW.target_type = 'listing')
EXECUTE FUNCTION track_listing_view();

-- ============================================================================
-- INSERT DEFAULT GST SETTINGS
-- ============================================================================

INSERT INTO public.gst_settings (gst_rate, gst_enabled, effective_date)
VALUES (5.00, false, '2026-01-01')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- COMPLETED DEPOP FEATURES MIGRATION
-- ============================================================================