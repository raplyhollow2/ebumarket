import { ResponsiveLayoutWrapper } from "@/components/layout/ResponsiveLayoutWrapper";
import { MarketBrowseClient } from "@/components/listings/MarketBrowseClient";
import { RequireAuthLink } from "@/components/auth/require-auth-link";
import { createClient } from "@/lib/supabase/server";
import type { ExtendedListingWithPhotos } from "@/lib/types";

export default async function DonatePage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("listings")
    .select(
      "*, listing_photos(*), profiles:seller_id(display_name, area)",
    )
    .eq("type", "donation")
    .eq("status", "verified")
    .order("created_at", { ascending: false });
  const listings = (data ?? []) as ExtendedListingWithPhotos[];
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <ResponsiveLayoutWrapper>
      <div className="mb-6 flex items-end justify-between gap-3">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold">
            Donation Hub
          </h1>
          <p className="text-sm text-muted-foreground">Free clothes near you.</p>
        </div>
        <RequireAuthLink href="/donate/new" isAuthed={Boolean(user)}>
          + List
        </RequireAuthLink>
      </div>
      {listings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/60 p-8 text-center text-sm text-muted-foreground">
          No donations live yet. List something to give away.
        </div>
      ) : (
        <MarketBrowseClient listings={listings} isAuthed={Boolean(user)} />
      )}
    </ResponsiveLayoutWrapper>
  );
}
