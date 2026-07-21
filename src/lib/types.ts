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
export type ClaimStatus = "requested" | "approved" | "fulfilled" | "declined";

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
  profiles?: Pick<Profile, "display_name" | "area"> | null;
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
