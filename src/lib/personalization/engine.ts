import type { ExtendedListingWithPhotos } from "@/lib/types";

export type UserPreferenceRow = {
  user_id: string;
  preferred_categories?: string[] | null;
  preferred_sizes?: string[] | null;
  price_range_min?: number | null;
  price_range_max?: number | null;
};

export type PersonalizationContext = {
  preferences: UserPreferenceRow | null;
  likedListingIds: string[];
  likedCategories: string[];
  viewedListingIds: string[];
  followedSellerIds: string[];
};

export function scoreListing(
  listing: ExtendedListingWithPhotos & { category?: string; size?: string },
  ctx: PersonalizationContext,
) {
  let score = 0;
  const daysSinceCreation = Math.floor(
    (Date.now() - new Date(listing.created_at).getTime()) / (1000 * 60 * 60 * 24),
  );
  score += Math.max(0, 10 - daysSinceCreation);

  score +=
    (listing.likes_count || 0) * 2 +
    (listing.comments_count || 0) * 3 +
    (listing.views_count || 0) * 0.1;

  if (ctx.followedSellerIds.includes(listing.seller_id)) score += 20;
  if (ctx.likedListingIds.includes(listing.id)) score -= 50;
  if (ctx.viewedListingIds.includes(listing.id)) score += 2;

  const prefs = ctx.preferences;
  if (prefs?.preferred_categories?.includes(listing.category)) score += 15;
  if (prefs?.preferred_sizes?.includes(listing.size)) score += 10;
  if (
    prefs?.price_range_min != null &&
    prefs?.price_range_max != null &&
    listing.price_cents != null &&
    listing.price_cents >= prefs.price_range_min &&
    listing.price_cents <= prefs.price_range_max
  ) {
    score += 15;
  }
  if (ctx.likedCategories.includes(listing.category)) score += 12;

  return score;
}

export function recommendationReasons(
  listing: ExtendedListingWithPhotos,
  ctx: PersonalizationContext,
): string[] {
  const daysSinceCreation = Math.floor(
    (Date.now() - new Date(listing.created_at).getTime()) / (1000 * 60 * 60 * 24),
  );
  const reasons: string[] = [];
  if (ctx.followedSellerIds.includes(listing.seller_id)) {
    reasons.push("From a seller you follow");
  }
  if (ctx.preferences?.preferred_categories?.includes(listing.category)) {
    reasons.push("Matches your style preferences");
  }
  if ((listing.likes_count || 0) > 10) reasons.push("Trending in the community");
  if (daysSinceCreation < 7) reasons.push("Just listed");
  if ((listing.views_count || 0) > 50) reasons.push("Popular with other buyers");
  return reasons.length ? reasons : ["Recommended for you"];
}
