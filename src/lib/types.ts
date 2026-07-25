export type UserRole = "user" | "admin";
export type ListingType = "marketplace" | "donation";
export type ListingStatus =
  | "draft"
  | "pending"
  | "verified"
  | "rejected"
  | "sold"
  | "claimed"
  | "closed";
export type PhotoAngle = "front" | "back" | "tag" | "defect" | "other";
export type PaymentMethod = "cod" | "online";
export type TransactionStatus =
  | "requested"
  | "awaiting_payment"
  | "paid"
  | "accepted"
  | "completed"
  | "cancelled";
export type PayoutStatus =
  | "pending"
  | "claimable"
  | "claimed"
  | "paid_out"
  | "not_applicable";
export type ClaimStatus = "requested" | "approved" | "fulfilled" | "declined";

export type CenterType =
  | "orphanage"
  | "community_center"
  | "cso"
  | "shelter"
  | "other";

export type DonorTier = "seedling" | "helper" | "guardian" | "champion";

export type ProfileBackgroundStyle =
  | "plain"
  | "soft_wash"
  | "grid_dots"
  | "photo_blur";

export type ProfileLayoutStyle = "classic" | "stacked" | "magazine";

export type DonationCenter = {
  id: string;
  name: string;
  center_type: CenterType;
  slug: string;
  tagline: string;
  description: string;
  area: string;
  contact_email: string | null;
  contact_phone: string | null;
  website: string | null;
  cover_url: string | null;
  logo_url: string | null;
  needs: string[];
  is_verified: boolean;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type CenterMember = {
  id: string;
  center_id: string;
  user_id: string;
  member_role: "owner" | "staff";
  created_at: string;
};

export type DonorStats = {
  user_id: string;
  points: number;
  items_donated: number;
  items_fulfilled: number;
  center_donations: number;
  tier: DonorTier;
  updated_at: string;
};

export type ProfileCustomLink = {
  label: string;
  url: string;
};

export type ProfileTheme = {
  user_id: string;
  banner_url: string | null;
  avatar_url: string | null;
  bio: string;
  accent_color: string;
  background_style: ProfileBackgroundStyle;
  layout_style: ProfileLayoutStyle;
  show_donation_stats: boolean;
  show_listings: boolean;
  custom_links: ProfileCustomLink[];
  updated_at: string;
};

export type Transaction = {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  payment_method: PaymentMethod;
  meetup_point_id: string | null;
  item_price_cents: number;
  fee_cents: number;
  total_cents: number;
  seller_payout_cents: number;
  payout_status: PayoutStatus;
  payout_claimed_at: string | null;
  payout_paid_at: string | null;
  status: TransactionStatus;
  stripe_checkout_session_id: string | null;
  stripe_payment_intent_id: string | null;
  created_at: string;
  updated_at: string;
};

export type DonationClaim = {
  id: string;
  listing_id: string;
  claimer_id: string;
  message: string;
  contact: string;
  pickup_preference: string;
  status: ClaimStatus;
  created_at: string;
};

export type Profile = {
  id: string;
  display_name: string;
  role: UserRole;
  is_organization: boolean;
  can_approve: boolean;
  area: string;
  preferred_payment: PaymentMethod | null;
  created_at: string;
};

export type MeetupPoint = {
  id: string;
  user_id: string;
  label: string;
  notes: string | null;
  created_at: string;
};

export type Listing = {
  id: string;
  seller_id: string;
  type: ListingType;
  title: string;
  description: string;
  category: string;
  size: string;
  condition: string;
  price_cents: number | null;
  currency: string;
  status: ListingStatus;
  reject_reason: string | null;
  verified_at: string | null;
  verified_by: string | null;
  center_id: string | null;
  created_at: string;
  updated_at: string;
};

export type ListingPhoto = {
  id: string;
  listing_id: string;
  angle: PhotoAngle;
  storage_path: string;
  public_url: string;
  sort_order: number;
  created_at: string;
};

export type ListingWithPhotos = Listing & {
  listing_photos: ListingPhoto[];
  profiles?: Pick<
    ExtendedProfile,
    "id" | "display_name" | "area" | "is_organization" | "avatar_url" | "followers_count"
  > | null;
  donation_centers?: Pick<
    DonationCenter,
    "id" | "name" | "slug" | "center_type" | "area"
  > | null;
};

export const REQUIRED_ANGLES: PhotoAngle[] = [
  "front",
  "back",
  "tag",
  "defect",
];

export const CATEGORIES = [
  "Tops",
  "Bottoms",
  "Dresses",
  "Outerwear",
  "Shoes",
  "Accessories",
  "Other",
] as const;

export const CONDITIONS = [
  "Like new",
  "Good",
  "Fair",
  "Well loved",
] as const;

export const SIZES = [
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "XXL",
  "One size",
] as const;

// ============================================================================
// DEPOP-LIKE FEATURES TYPES
// ============================================================================

// Social Interaction Types
export type SocialInteractionType = "like" | "follow" | "view";
export type SocialTargetType = "listing" | "user" | "comment";

export type SocialInteraction = {
  id: string;
  user_id: string;
  target_type: SocialTargetType;
  target_id: string;
  interaction_type: SocialInteractionType;
  created_at: string;
};

// Comment Types
export type Comment = {
  id: string;
  listing_id: string;
  user_id: string;
  content: string;
  parent_comment_id: string | null;
  created_at: string;
  updated_at: string;
  profiles?: Pick<ExtendedProfile, "display_name" | "avatar_url"> | null;
};

export type CommentWithReplies = Comment & {
  replies?: CommentWithReplies[];
};

// Collection Types
export type Collection = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  profiles?: Pick<ExtendedProfile, "display_name">;
  _count?: {
    items: number;
  };
};

export type CollectionItem = {
  id: string;
  collection_id: string;
  listing_id: string;
  added_at: string;
  listings?: ListingWithPhotos;
};

// Conversation Types
export type Conversation = {
  id: string;
  buyer_id: string;
  seller_id: string;
  listing_id: string | null;
  last_message_at: string | null;
  created_at: string;
  buyer_profile?: Pick<ExtendedProfile, "display_name" | "avatar_url">;
  seller_profile?: Pick<ExtendedProfile, "display_name" | "avatar_url">;
  listing?: Pick<Listing, "id" | "title" | "price_cents" | "currency"> & {
    listing_photos?: Pick<ListingPhoto, "public_url">[];
  };
  _count?: {
    unread_messages: number;
  };
};

// Message Types
export type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  sender_profile?: Pick<ExtendedProfile, "display_name" | "avatar_url">;
};

// Offer Types
export type OfferStatus = "pending" | "accepted" | "rejected" | "expired";

export type Offer = {
  id: string;
  conversation_id: string;
  listing_id: string;
  sender_id: string;
  amount_cents: number;
  expires_at: string;
  status: OfferStatus;
  created_at: string;
  sender_profile?: Pick<ExtendedProfile, "display_name">;
  listing?: Pick<Listing, "id" | "title" | "price_cents" | "currency">;
};

// Analytics Types
export type ListingAnalytics = {
  id: string;
  listing_id: string;
  event_date: string;
  views: number;
  likes: number;
  shares: number;
  click_to_chat: number;
  created_at: string;
};

export type UserPreferences = {
  id: string;
  user_id: string;
  preferred_categories: string[];
  preferred_sizes: string[];
  price_range_min: number | null;
  price_range_max: number | null;
  notification_settings: Record<string, boolean>;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
};

// Boost Types
export type BoostType = "listing" | "shop";

export type BoostedListing = {
  id: string;
  listing_id: string;
  boosted_by: string;
  boost_type: BoostType;
  start_date: string;
  end_date: string;
  impressions: number;
  clicks: number;
  created_at: string;
  listings?: ListingWithPhotos;
};

// GST Types
export type GSTSettings = {
  id: string;
  gst_rate: number;
  gst_enabled: boolean;
  gst_registration_number: string | null;
  effective_date: string | null;
  created_at: string;
  updated_at: string;
};

// Enhanced Profile Type with new fields
export type ExtendedProfile = Profile & {
  bio?: string | null;
  avatar_url?: string | null;
  followers_count?: number;
  following_count?: number;
  listings_sold?: number;
  total_sales_cents?: number;
};

// Enhanced Listing Type with new fields
export type ExtendedListing = Listing & {
  views_count?: number;
  likes_count?: number;
  comments_count?: number;
  shares_count?: number;
  ai_generated_description?: boolean;
  is_boosted?: boolean;
  boost_end_time?: string | null;
  gst_amount_cents?: number;
  is_liked?: boolean;
};

// Enhanced Listing with Photos
export type ExtendedListingWithPhotos = ExtendedListing & {
  listing_photos: ListingPhoto[];
  profiles?: Pick<ExtendedProfile, "display_name" | "area" | "avatar_url" | "followers_count"> | null;
  donation_centers?: Pick<
    DonationCenter,
    "id" | "name" | "slug" | "center_type" | "area"
  > | null;
};

// Seller Analytics Types
export type SellerStats = {
  total_listings: number;
  active_listings: number;
  sold_listings: number;
  total_views: number;
  total_likes: number;
  total_sales_cents: number;
  conversion_rate: number;
  average_price_cents: number;
  followers_count: number;
  period_start: string;
  period_end: string;
};

export type ListingPerformance = {
  listing_id: string;
  listing_title: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  click_to_chat: number;
  conversion_rate: number;
  status: ListingStatus;
  created_at: string;
};

export type AudienceInsights = {
  followers_count: number;
  follower_growth: number;
  top_categories: Array<{
    category: string;
    count: number;
    percentage: number;
  }>;
  engagement_rate: number;
  total_interactions: number;
  average_session_duration: number;
  best_posting_times: Array<{
    day: string;
    hour: number;
    engagement: number;
  }>;
  total_listings: number;
  total_views: number;
  total_likes: number;
  total_comments: number;
  total_shares: number;
};

// API Response Types
export type SocialInteractionResponse = {
  success: boolean;
  data?: SocialInteraction;
  error?: string;
};

export type CommentsResponse = {
  success: boolean;
  data?: CommentWithReplies[];
  error?: string;
  count?: number;
};

export type ConversationsResponse = {
  success: boolean;
  data?: Conversation[];
  error?: string;
  count?: number;
};

export type MessagesResponse = {
  success: boolean;
  data?: Message[];
  error?: string;
  count?: number;
  unread_count?: number;
};

export type OffersResponse = {
  success: boolean;
  data?: Offer;
  error?: string;
};

export type AnalyticsResponse = {
  success: boolean;
  data?: SellerStats | ListingPerformance | AudienceInsights;
  error?: string;
};

// Notification Types
export type NotificationType =
  | "like"
  | "follow"
  | "comment"
  | "message"
  | "offer"
  | "sale"
  | "mention"
  | "listing_approved"
  | "listing_rejected";

export type Notification = {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
};

// ============================================================================
// RBAC AND CMS TYPES
// ============================================================================

// Admin Role Types
export type AdminRole = {
  id: string;
  name: string;
  description: string | null;
  permissions: string[];
  created_at: string;
  updated_at: string;
};

export type AdminRoleAssignment = {
  id: string;
  user_id: string;
  role_id: string;
  assigned_by: string | null;
  assigned_at: string;
  expires_at: string | null;
  is_active: boolean;
  admin_roles?: AdminRole;
  profiles?: Pick<Profile, "display_name">;
};

export type AdminAuditLog = {
  id: string;
  actor_id: string | null;
  action: string;
  resource_type: string;
  resource_id: string | null;
  ip_address: string | null;
  user_agent: string | null;
  metadata: Record<string, unknown>;
  status: "success" | "failure" | "partial";
  created_at: string;
  profiles?: Pick<Profile, "display_name">;
};

// CMS Types
export type ContentBlockType = "hero" | "banner" | "feature" | "category_highlight" | "announcement";
export type ContentBlockStatus = "draft" | "active" | "archived" | "scheduled";

export type ContentBlock = {
  id: string;
  block_type: ContentBlockType;
  title: string;
  content: Record<string, unknown>;
  targeting_rules: Record<string, unknown>;
  schedule_start: string | null;
  schedule_end: string | null;
  priority: number;
  status: ContentBlockStatus;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
};

export type HeroType = "slider" | "static" | "video" | "interactive" | "product_showcase";

export type HeroSection = {
  id: string;
  name: string;
  hero_type: HeroType;
  slides: Record<string, unknown>[];
  settings: Record<string, unknown>;
  ab_test_config: Record<string, unknown>;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type FeaturedSectionType = "listing_grid" | "category_showcase" | "seller_spotlight" | "collection";

export type FeaturedSection = {
  id: string;
  section_name: string;
  section_type: FeaturedSectionType;
  content_config: Record<string, unknown>;
  display_rules: Record<string, unknown>;
  priority: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

// Analytics Types
export type AnalyticsEvent = {
  id: string;
  event_type: string;
  user_id: string | null;
  session_id: string | null;
  listing_id: string | null;
  properties: Record<string, unknown>;
  created_at: string;
};

export type AnalyticsDailyAggregate = {
  date: string;
  metric_name: string;
  metric_value: number;
  dimensions: Record<string, unknown>;
  updated_at: string;
};

// A/B Testing Types
export type ExperimentStatus = "draft" | "running" | "paused" | "completed" | "archived";

export type ABExperiment = {
  id: string;
  name: string;
  description: string | null;
  variants: Record<string, unknown>[];
  targeting_rules: Record<string, unknown>;
  traffic_allocation: Record<string, unknown>;
  metrics: Record<string, unknown>;
  status: ExperimentStatus;
  start_date: string | null;
  end_date: string | null;
  winning_variant: string | null;
  statistical_significance: number | null;
  sample_size: number | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type ABExposureEvent = {
  id: string;
  experiment_id: string;
  user_id: string | null;
  session_id: string | null;
  variant: string;
  exposed_at: string;
};

export type ABConversionEvent = {
  id: string;
  experiment_id: string;
  user_id: string | null;
  variant: string;
  metric_name: string;
  metric_value: number | null;
  occurred_at: string;
};

// Admin Permission Constants
export const ADMIN_PERMISSIONS = [
  "cms.manage",
  "cms.publish",
  "listings.moderate",
  "analytics.view",
  "media.manage",
  "transactions.view",
  "transactions.refund",
  "reports.finance",
  "gst.manage",
  "payouts.manage",
  "users.moderate",
  "comments.moderate",
  "support.respond",
  "reports.view",
  "admin.view",
  "insights.view"
] as const;

export type AdminPermission = typeof ADMIN_PERMISSIONS[number];

// Admin Role Constants
export const DEFAULT_ADMIN_ROLES = {
  SUPER_ADMIN: "Super Admin",
  CONTENT_MANAGER: "Content Manager",
  FINANCE_MANAGER: "Finance Manager",
  COMMUNITY_MANAGER: "Community Manager",
  ANALYTICS_VIEWER: "Analytics Viewer"
} as const;

// API Response Types for Admin
export type AdminRolesResponse = {
  success: boolean;
  data?: AdminRole[];
  error?: string;
  count?: number;
};

export type AdminRoleAssignmentsResponse = {
  success: boolean;
  data?: AdminRoleAssignment[];
  error?: string;
  count?: number;
};

export type ContentBlocksResponse = {
  success: boolean;
  data?: ContentBlock[];
  error?: string;
  count?: number;
};

export type HeroSectionsResponse = {
  success: boolean;
  data?: HeroSection[];
  error?: string;
  count?: number;
};

export type ExperimentsResponse = {
  success: boolean;
  data?: ABExperiment[];
  error?: string;
  count?: number;
};

export type AdminAnalyticsResponse = {
  success: boolean;
  data?: AnalyticsDailyAggregate[] | Record<string, unknown>;
  error?: string;
  count?: number;
};
