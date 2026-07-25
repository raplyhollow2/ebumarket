import Link from "next/link";
import { ResponsiveLayoutWrapper } from "@/components/layout/ResponsiveLayoutWrapper";
import { MarketBrowseClient } from "@/components/listings/MarketBrowseClient";
import { createClient } from "@/lib/supabase/server";
import type { ExtendedListingWithPhotos } from "@/lib/types";
import { RequireAuthLink } from "@/components/auth/require-auth-link";

async function getVerifiedListings(category?: string) {
  const supabase = await createClient();
  let query = supabase
    .from("listings")
    .select(
      "*, listing_photos(*), profiles:seller_id(display_name, area)",
    )
    .eq("type", "marketplace")
    .eq("status", "verified")
    .order("created_at", { ascending: false });

  if (category) {
    query = query.eq("category", category);
  }

  const { data, error } = await query;
  if (error) {
    console.error(error);
    return [] as ExtendedListingWithPhotos[];
  }
  return (data ?? []) as ExtendedListingWithPhotos[];
}

export default async function MarketPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const listings = await getVerifiedListings(category);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <ResponsiveLayoutWrapper>
      <div className="mb-6 flex items-end justify-between gap-3">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight">
            Market
            {category ? (
              <span className="text-muted-foreground"> · {category}</span>
            ) : null}
          </h1>
          <p className="text-sm text-muted-foreground">
            Only Verified by Zyra listings.
          </p>
        </div>
        <RequireAuthLink
          href="/market/new"
          isAuthed={Boolean(user)}
          className="shrink-0"
        >
          + Sell
        </RequireAuthLink>
      </div>

      {listings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/60 p-8 text-center">
          <p className="font-medium">No live items yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {category
              ? `Nothing verified in ${category} right now.`
              : "Be first — list something for verification."}
          </p>
          <Link
            href="/market/new"
            className="mt-4 inline-flex h-9 items-center justify-center rounded-lg bg-secondary px-3 text-sm font-medium text-secondary-foreground"
          >
            Sell an item
          </Link>
        </div>
      ) : (
        <MarketBrowseClient listings={listings} isAuthed={Boolean(user)} />
      )}
    </ResponsiveLayoutWrapper>
  );
}
