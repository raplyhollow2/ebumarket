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
