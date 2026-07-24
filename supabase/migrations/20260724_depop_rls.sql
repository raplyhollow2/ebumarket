-- Row Level Security Policies for Depop Features
-- Comprehensive RLS policies for social features, messaging, analytics, and boost system

-- ============================================================================
-- ENABLE RLS ON ALL NEW TABLES
-- ============================================================================

ALTER TABLE public.social_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.boosted_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gst_settings ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- SOCIAL_INTERACTIONS POLICIES
-- ============================================================================

-- Users can view likes on listings (public)
CREATE POLICY "Users can view listing likes"
ON public.social_interactions FOR SELECT
USING (target_type = 'listing' AND interaction_type = 'like');

-- Users can view follows (public)
CREATE POLICY "Users can view follows"
ON public.social_interactions FOR SELECT
USING (interaction_type = 'follow');

-- Users can view their own interactions
CREATE POLICY "Users can view own interactions"
ON public.social_interactions FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own interactions
CREATE POLICY "Users can create own interactions"
ON public.social_interactions FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own interactions
CREATE POLICY "Users can delete own interactions"
ON public.social_interactions FOR DELETE
USING (auth.uid() = user_id);

-- ============================================================================
-- COMMENTS POLICIES
-- ============================================================================

-- Everyone can view comments on verified listings
CREATE POLICY "Everyone can view comments"
ON public.comments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.listings
    WHERE listings.id = comments.listing_id
    AND listings.status = 'verified'
  )
);

-- Users can view their own comments
CREATE POLICY "Users can view own comments"
ON public.comments FOR SELECT
USING (auth.uid() = user_id);

-- Authenticated users can create comments
CREATE POLICY "Authenticated users can create comments"
ON public.comments FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.listings
    WHERE listings.id = comments.listing_id
    AND listings.status = 'verified'
  )
);

-- Users can update their own comments
CREATE POLICY "Users can update own comments"
ON public.comments FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own comments
CREATE POLICY "Users can delete own comments"
ON public.comments FOR DELETE
USING (auth.uid() = user_id);

-- ============================================================================
-- COLLECTIONS POLICIES
-- ============================================================================

-- Users can view public collections
CREATE POLICY "Users can view public collections"
ON public.collections FOR SELECT
USING (is_public = true);

-- Users can view their own collections
CREATE POLICY "Users can view own collections"
ON public.collections FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own collections
CREATE POLICY "Users can create own collections"
ON public.collections FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own collections
CREATE POLICY "Users can update own collections"
ON public.collections FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own collections
CREATE POLICY "Users can delete own collections"
ON public.collections FOR DELETE
USING (auth.uid() = user_id);

-- ============================================================================
-- COLLECTION_ITEMS POLICIES
-- ============================================================================

-- Users can view items in public collections
CREATE POLICY "Users can view public collection items"
ON public.collection_items FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.collections
    WHERE collections.id = collection_items.collection_id
    AND collections.is_public = true
  )
);

-- Users can view items in their own collections
CREATE POLICY "Users can view own collection items"
ON public.collection_items FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.collections
    WHERE collections.id = collection_items.collection_id
    AND collections.user_id = auth.uid()
  )
);

-- Users can add items to their own collections
CREATE POLICY "Users can add to own collections"
ON public.collection_items FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.collections
    WHERE collections.id = collection_items.collection_id
    AND collections.user_id = auth.uid()
  )
);

-- Users can remove items from their own collections
CREATE POLICY "Users can remove from own collections"
ON public.collection_items FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.collections
    WHERE collections.id = collection_items.collection_id
    AND collections.user_id = auth.uid()
  )
);

-- ============================================================================
-- CONVERSATIONS POLICIES
-- ============================================================================

-- Users can view conversations they participate in
CREATE POLICY "Users can view own conversations"
ON public.conversations FOR SELECT
USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Users can create conversations (as buyer)
CREATE POLICY "Users can create conversations as buyer"
ON public.conversations FOR INSERT
WITH CHECK (auth.uid() = buyer_id);

-- Users can create conversations (as seller, if listing belongs to them)
CREATE POLICY "Users can create conversations as seller"
ON public.conversations FOR INSERT
WITH CHECK (
  auth.uid() = seller_id AND
  (listing_id IS NULL OR EXISTS (
    SELECT 1 FROM public.listings
    WHERE listings.id = conversations.listing_id
    AND listings.seller_id = auth.uid()
  ))
);

-- Users can update their own conversations
CREATE POLICY "Users can update own conversations"
ON public.conversations FOR UPDATE
USING (auth.uid() = buyer_id OR auth.uid() = seller_id)
WITH CHECK (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- ============================================================================
-- MESSAGES POLICIES
-- ============================================================================

-- Users can view messages in conversations they participate in
CREATE POLICY "Users can view messages in conversations"
ON public.messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.conversations
    WHERE conversations.id = messages.conversation_id
    AND (conversations.buyer_id = auth.uid() OR conversations.seller_id = auth.uid())
  )
);

-- Users can create messages in conversations they participate in
CREATE POLICY "Users can create messages in conversations"
ON public.messages FOR INSERT
WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (
    SELECT 1 FROM public.conversations
    WHERE conversations.id = messages.conversation_id
    AND (conversations.buyer_id = auth.uid() OR conversations.seller_id = auth.uid())
  )
);

-- Users can update their own messages (for marking as read)
CREATE POLICY "Users can update own messages"
ON public.messages FOR UPDATE
USING (auth.uid() = sender_id)
WITH CHECK (auth.uid() = sender_id);

-- Users can mark messages as read in conversations they participate in
CREATE POLICY "Users can mark messages as read"
ON public.messages FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.conversations
    WHERE conversations.id = messages.conversation_id
    AND (conversations.buyer_id = auth.uid() OR conversations.seller_id = auth.uid())
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.conversations
    WHERE conversations.id = messages.conversation_id
    AND (conversations.buyer_id = auth.uid() OR conversations.seller_id = auth.uid())
  )
);

-- ============================================================================
-- OFFERS POLICIES
-- ============================================================================

-- Users can view offers in conversations they participate in
CREATE POLICY "Users can view offers in conversations"
ON public.offers FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.conversations
    WHERE conversations.id = offers.conversation_id
    AND (conversations.buyer_id = auth.uid() OR conversations.seller_id = auth.uid())
  )
);

-- Users can create offers in conversations they participate in
CREATE POLICY "Users can create offers in conversations"
ON public.offers FOR INSERT
WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (
    SELECT 1 FROM public.conversations
    WHERE conversations.id = offers.conversation_id
    AND (conversations.buyer_id = auth.uid() OR conversations.seller_id = auth.uid())
  )
);

-- Users can update their own offers
CREATE POLICY "Users can update own offers"
ON public.offers FOR UPDATE
USING (auth.uid() = sender_id)
WITH CHECK (auth.uid() = sender_id);

-- Users can respond to offers received in conversations
CREATE POLICY "Users can respond to received offers"
ON public.offers FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.conversations
    WHERE conversations.id = offers.conversation_id
    AND (conversations.buyer_id = auth.uid() OR conversations.seller_id = auth.uid())
    AND conversations.buyer_id != offers.sender_id
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.conversations
    WHERE conversations.id = offers.conversation_id
    AND (conversations.buyer_id = auth.uid() OR conversations.seller_id = auth.uid())
    AND conversations.buyer_id != offers.sender_id
  )
);

-- ============================================================================
-- LISTING_ANALYTICS POLICIES
-- ============================================================================

-- Users can view analytics for their own listings
CREATE POLICY "Users can view own listing analytics"
ON public.listing_analytics FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.listings
    WHERE listings.id = listing_analytics.listing_id
    AND listings.seller_id = auth.uid()
  )
);

-- Users can create analytics for their own listings
CREATE POLICY "Users can create analytics for own listings"
ON public.listing_analytics FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.listings
    WHERE listings.id = listing_analytics.listing_id
    AND listings.seller_id = auth.uid()
  )
);

-- Users can update analytics for their own listings
CREATE POLICY "Users can update analytics for own listings"
ON public.listing_analytics FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.listings
    WHERE listings.id = listing_analytics.listing_id
    AND listings.seller_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.listings
    WHERE listings.id = listing_analytics.listing_id
    AND listings.seller_id = auth.uid()
  )
);

-- System can update analytics automatically
CREATE POLICY "System can update analytics"
ON public.listing_analytics FOR INSERT
WITH CHECK (true);

-- ============================================================================
-- USER_PREFERENCES POLICIES
-- ============================================================================

-- Users can view their own preferences
CREATE POLICY "Users can view own preferences"
ON public.user_preferences FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own preferences
CREATE POLICY "Users can create own preferences"
ON public.user_preferences FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own preferences
CREATE POLICY "Users can update own preferences"
ON public.user_preferences FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- BOOSTED_LISTINGS POLICIES
-- ============================================================================

-- Everyone can view boosted listings
CREATE POLICY "Everyone can view boosted listings"
ON public.boosted_listings FOR SELECT
USING (true);

-- Users can create boosts for their own listings
CREATE POLICY "Users can boost own listings"
ON public.boosted_listings FOR INSERT
WITH CHECK (
  auth.uid() = boosted_by AND
  EXISTS (
    SELECT 1 FROM public.listings
    WHERE listings.id = boosted_listings.listing_id
    AND listings.seller_id = auth.uid()
  )
);

-- Users can view their own boosting history
CREATE POLICY "Users can view own boosts"
ON public.boosted_listings FOR SELECT
USING (auth.uid() = boosted_by);

-- Admins can update boost metrics
CREATE POLICY "Admins can update boost metrics"
ON public.boosted_listings FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- ============================================================================
-- GST_SETTINGS POLICIES
-- ============================================================================

-- Everyone can view GST settings
CREATE POLICY "Everyone can view GST settings"
ON public.gst_settings FOR SELECT
USING (true);

-- Only admins can manage GST settings
CREATE POLICY "Admins can insert GST settings"
ON public.gst_settings FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Admins can update GST settings"
ON public.gst_settings FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Admins can delete GST settings"
ON public.gst_settings FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- ============================================================================
-- UPDATED PROFILES TABLE POLICIES (for new columns)
-- ============================================================================

-- Grant access to updated profile columns for existing policies
-- (These should be covered by existing RLS policies, but let's ensure)

-- Everyone can view public profile information
CREATE POLICY "Everyone can view public profiles extended"
ON public.profiles FOR SELECT
USING (true);

-- Users can update their own extended profile information
CREATE POLICY "Users can update own extended profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- ============================================================================
-- UPDATED LISTINGS TABLE POLICIES (for new columns)
-- ============================================================================

-- Grant access to updated listing columns
-- (These should be covered by existing RLS policies)

-- Everyone can view verified listings with new metrics
CREATE POLICY "Everyone can view verified listings extended"
ON public.listings FOR SELECT
USING (status = 'verified');

-- ============================================================================
-- COMPLETED RLS POLICIES FOR DEPOP FEATURES
-- ============================================================================