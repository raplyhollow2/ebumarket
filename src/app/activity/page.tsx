import Link from "next/link";
import { ResponsiveLayoutWrapper } from "@/components/layout/ResponsiveLayoutWrapper";
import { AuthSheetTrigger } from "@/components/auth/auth-sheet-trigger";
import { ActivityClient } from "@/components/activity/activity-client";
import { createClient } from "@/lib/supabase/server";
import { getViewerAccess } from "@/lib/settings";
import type { Listing, DonationClaim } from "@/lib/types";

export default async function ActivityPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <ResponsiveLayoutWrapper>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold">
          Activity
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Log in to see your listings, buys, and claims.
        </p>
        <div className="mt-4">
          <AuthSheetTrigger />
        </div>
      </ResponsiveLayoutWrapper>
    );
  }

  const { isAdmin } = await getViewerAccess();

  const { data: listings } = await supabase
    .from("listings")
    .select("*")
    .eq("seller_id", user.id)
    .order("created_at", { ascending: false });

  const listingIds = (listings ?? []).map((l) => l.id);

  const { data: memberships } = await supabase
    .from("center_members")
    .select("center_id, member_role, donation_centers:center_id(id, name)")
    .eq("user_id", user.id);

  const centerIds = (memberships ?? []).map((m) => m.center_id as string);

  const [
    { data: myBuys },
    { data: sellingBuys },
    { data: myClaims },
    { data: incomingClaims },
    { data: centerListings },
  ] = await Promise.all([
    supabase
      .from("transactions")
      .select(
        `id, status, payment_method, item_price_cents, fee_cents, total_cents,
         seller_payout_cents, payout_status, buyer_id, seller_id, listing_id,
         listings(title, currency),
         buyer:profiles!buyer_id(id, display_name),
         seller:profiles!seller_id(id, display_name)`,
      )
      .eq("buyer_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("transactions")
      .select(
        `id, status, payment_method, item_price_cents, fee_cents, total_cents,
         seller_payout_cents, payout_status, buyer_id, seller_id, listing_id,
         listings(title, currency),
         buyer:profiles!buyer_id(id, display_name),
         seller:profiles!seller_id(id, display_name)`,
      )
      .eq("seller_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("donation_claims")
      .select("*, listings(title, seller_id)")
      .eq("claimer_id", user.id)
      .order("created_at", { ascending: false }),
    listingIds.length
      ? supabase
          .from("donation_claims")
          .select("*, listings(title, seller_id)")
          .in("listing_id", listingIds)
          .order("created_at", { ascending: false })
      : Promise.resolve({ data: [] as never[] }),
    centerIds.length
      ? supabase
          .from("listings")
          .select("id, title, status, type, center_id, category, size")
          .in("center_id", centerIds)
          .eq("type", "donation")
          .order("created_at", { ascending: false })
          .limit(40)
      : Promise.resolve({ data: [] as never[] }),
  ]);

  let resolvedCenterClaims: never[] = [];
  const centerListingIds = ((centerListings ?? []) as { id: string }[]).map(
    (l) => l.id,
  );
  if (centerListingIds.length) {
    const { data } = await supabase
      .from("donation_claims")
      .select("*, listings(title, seller_id, center_id)")
      .in("listing_id", centerListingIds)
      .order("created_at", { ascending: false })
      .limit(40);
    resolvedCenterClaims = (data ?? []) as never[];
  }

  const claimMap = new Map<
    string,
    DonationClaim & { listings: { title: string; seller_id: string } | null }
  >();
  for (const c of [...(myClaims ?? []), ...(incomingClaims ?? [])]) {
    claimMap.set(c.id, c as never);
  }

  const txMap = new Map<string, never>();
  for (const t of [...(myBuys ?? []), ...(sellingBuys ?? [])]) {
    txMap.set(t.id, t as never);
  }

  return (
    <ResponsiveLayoutWrapper>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold">
          Activity
        </h1>
        <Link href="/admin" className="text-xs text-muted-foreground underline">
          Admin
        </Link>
      </div>
      <ActivityClient
        listings={(listings ?? []) as Listing[]}
        transactions={[...txMap.values()]}
        claims={[...claimMap.values()]}
        centerListings={(centerListings ?? []) as Listing[]}
        centerClaims={resolvedCenterClaims as (DonationClaim & {
          listings: { title: string; seller_id: string; center_id?: string } | null;
        })[]}
        centerNames={Object.fromEntries(
          (memberships ?? []).map((m) => [
            m.center_id,
            (m.donation_centers as { name?: string } | null)?.name ?? "Centre",
          ]),
        )}
        userId={user.id}
        isAdmin={isAdmin}
      />
    </ResponsiveLayoutWrapper>
  );
}
