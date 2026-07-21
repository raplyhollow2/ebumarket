import Link from "next/link";
import { TeenShell } from "@/components/layout/teen-shell";
import { AuthSheetTrigger } from "@/components/auth/auth-sheet-trigger";
import { ActivityClient } from "@/components/activity/activity-client";
import { createClient } from "@/lib/supabase/server";
import type { Listing, DonationClaim } from "@/lib/types";

export default async function ActivityPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <TeenShell>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold">
          Activity
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Log in to see your listings, buys, and claims.
        </p>
        <div className="mt-4">
          <AuthSheetTrigger />
        </div>
      </TeenShell>
    );
  }

  const { data: listings } = await supabase
    .from("listings")
    .select("*")
    .eq("seller_id", user.id)
    .order("created_at", { ascending: false });

  const listingIds = (listings ?? []).map((l) => l.id);

  const [{ data: transactions }, { data: myClaims }, { data: incomingClaims }] =
    await Promise.all([
      supabase
        .from("transactions")
        .select("id, status, payment_method, total_cents, listings(title, currency)")
        .eq("buyer_id", user.id)
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
    ]);

  const claimMap = new Map<string, DonationClaim & { listings: { title: string; seller_id: string } | null }>();
  for (const c of [...(myClaims ?? []), ...(incomingClaims ?? [])]) {
    claimMap.set(c.id, c as never);
  }

  return (
    <TeenShell>
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
        transactions={(transactions ?? []) as never}
        claims={[...claimMap.values()]}
        userId={user.id}
      />
    </TeenShell>
  );
}
