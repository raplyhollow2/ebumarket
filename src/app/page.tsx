import { HomeShell } from "@/components/layout/HomeShell";
import { HomeHero } from "@/components/home/HomeHero";
import { HomeCategories } from "@/components/home/HomeCategories";
import { HomeListingRail } from "@/components/home/HomeListingRail";
import { HomeEditorial } from "@/components/home/HomeEditorial";
import { HomeTrustStrip } from "@/components/home/HomeTrustStrip";
import { PersonalizedFeed } from "@/components/ai/PersonalizedFeed";
import { createClient } from "@/lib/supabase/server";
import type { ExtendedListingWithPhotos } from "@/lib/types";

async function getVerified(type: "marketplace" | "donation", limit = 12) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("listings")
    .select(
      "*, listing_photos(*), profiles:seller_id(display_name, area)",
    )
    .eq("type", type)
    .eq("status", "verified")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error(error);
    return [] as ExtendedListingWithPhotos[];
  }
  return (data ?? []) as ExtendedListingWithPhotos[];
}

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [market, donations] = await Promise.all([
    getVerified("marketplace", 12),
    getVerified("donation", 10),
  ]);

  return (
    <HomeShell>
      {/* Viewport 1: brand + one message + CTAs + full-bleed fashion image */}
      <HomeHero isAuthed={Boolean(user)} />

      {/* Below the fold — Depop-style discovery, live Supabase data */}
      <HomeCategories />
      <HomeListingRail
        title="Fresh on Market"
        subtitle="Just verified — shop preloved drops near you."
        href="/market"
        listings={market}
        emptyLabel="No live market items yet. Be first to sell."
      />
      <HomeEditorial />
      <HomeListingRail
        title="Free in Donation Hub"
        subtitle="Claim clothes that need a second home — no price tag."
        href="/donate"
        listings={donations}
        emptyLabel="No donations live yet. List something free to give."
      />
      <HomeTrustStrip />

      {user ? (
        <div className="px-4 py-10 md:px-10 lg:px-16">
          <PersonalizedFeed userId={user.id} />
        </div>
      ) : null}
    </HomeShell>
  );
}
