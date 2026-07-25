import Link from "next/link";
import { ResponsiveLayoutWrapper } from "@/components/layout/ResponsiveLayoutWrapper";
import { MarketBrowseClient } from "@/components/listings/MarketBrowseClient";
import { CenterCard } from "@/components/donations/CenterCard";
import { DonorBadge } from "@/components/donations/DonorBadge";
import { RequireAuthLink } from "@/components/auth/require-auth-link";
import { createClient } from "@/lib/supabase/server";
import type {
  DonationCenter,
  DonorStats,
  ExtendedListingWithPhotos,
} from "@/lib/types";

export default async function DonatePage() {
  const supabase = await createClient();
  const [{ data }, { data: centers }, { data: topDonors }, auth] =
    await Promise.all([
      supabase
        .from("listings")
        .select(
          "*, listing_photos(*), profiles:seller_id(display_name, area), donation_centers:center_id(id, name, slug)",
        )
        .eq("type", "donation")
        .eq("status", "verified")
        .order("created_at", { ascending: false }),
      supabase
        .from("donation_centers")
        .select("*")
        .eq("is_active", true)
        .eq("is_verified", true)
        .order("name")
        .limit(4),
      supabase
        .from("donor_stats")
        .select("user_id, points, items_donated, items_fulfilled, center_donations, tier, updated_at")
        .gt("points", 0)
        .order("points", { ascending: false })
        .limit(5),
      supabase.auth.getUser(),
    ]);

  const listings = (data ?? []) as ExtendedListingWithPhotos[];
  const featuredCenters = (centers ?? []) as DonationCenter[];
  const donorRows = (topDonors ?? []) as DonorStats[];
  const user = auth.data.user;

  let donorProfiles: Record<string, string> = {};
  if (donorRows.length) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, display_name")
      .in(
        "id",
        donorRows.map((d) => d.user_id),
      );
    donorProfiles = Object.fromEntries(
      (profiles ?? []).map((p) => [p.id, p.display_name || "Donor"]),
    );
  }

  return (
    <ResponsiveLayoutWrapper>
      <div className="mb-6 flex items-end justify-between gap-3">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold">
            Donation Hub
          </h1>
          <p className="text-sm text-muted-foreground">
            Peer gifts and centre destinations — free clothes near you.
          </p>
        </div>
        <RequireAuthLink href="/donate/new" isAuthed={Boolean(user)}>
          + List
        </RequireAuthLink>
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        <Link
          href="/donate/centers"
          className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Centres & orphanages
        </Link>
        <Link
          href="/donate/leaderboard"
          className="rounded-full bg-muted px-4 py-2 text-sm font-medium"
        >
          Top donors
        </Link>
        <a
          href="#peer-gifts"
          className="rounded-full bg-muted px-4 py-2 text-sm font-medium"
        >
          Peer gifts
        </a>
      </div>

      {featuredCenters.length > 0 ? (
        <section className="mb-10">
          <div className="mb-3 flex items-end justify-between gap-2">
            <div>
              <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold">
                Give to a place
              </h2>
              <p className="text-sm text-muted-foreground">
                Tag your donation for an orphanage or centre.
              </p>
            </div>
            <Link
              href="/donate/centers"
              className="shrink-0 text-sm text-muted-foreground underline"
            >
              See all
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {featuredCenters.slice(0, 2).map((c) => (
              <CenterCard key={c.id} center={c} />
            ))}
          </div>
        </section>
      ) : null}

      {donorRows.length > 0 ? (
        <section className="mb-10">
          <h2 className="mb-1 font-[family-name:var(--font-display)] text-xl font-semibold">
            Top donors
          </h2>
          <p className="mb-3 text-sm text-muted-foreground">
            Points unlock Helper → Guardian → Champion.
          </p>
          <ul className="space-y-2">
            {donorRows.map((d) => (
              <li key={d.user_id}>
                <Link
                  href={`/profile/${d.user_id}`}
                  className="flex items-center justify-between gap-3 rounded-xl bg-card px-3 py-2.5 ring-1 ring-border/60"
                >
                  <span className="truncate text-sm font-medium">
                    {donorProfiles[d.user_id] ?? "Donor"}
                  </span>
                  <DonorBadge stats={d} />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section id="peer-gifts">
        <h2 className="mb-3 font-[family-name:var(--font-display)] text-xl font-semibold">
          Live gifts
        </h2>
        {listings.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card/60 p-8 text-center text-sm text-muted-foreground">
            No donations live yet. List something to give away — or pick a
            centre first.
          </div>
        ) : (
          <MarketBrowseClient listings={listings} isAuthed={Boolean(user)} />
        )}
      </section>
    </ResponsiveLayoutWrapper>
  );
}
