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
  profiles?: Pick<Profile, "id" | "display_name" | "area" | "is_organization"> | null;
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
  profiles?: Pick<Profile, "display_name" | "avatar_url"> | null;
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
  profiles?: Pick<Profile, "display_name">;
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
  buyer_profile?: Pick<Profile, "display_name" | "avatar_url">;
  seller_profile?: Pick<Profile, "display_name" | "avatar_url">;
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
  sender_profile?: Pick<Profile, "display_name" | "avatar_url">;
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
  sender_profile?: Pick<Profile, "display_name">;
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
};

// Enhanced Listing with Photos
export type ExtendedListingWithPhotos = ExtendedListing & {
  listing_photos: ListingPhoto[];
  profiles?: Pick<ExtendedProfile, "display_name" | "area" | "avatar_url" | "followers_count"> | null;
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
  average_session_duration: number;
  best_posting_times: Array<{
    day: string;
    hour: number;
    engagement: number;
  }>;
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
