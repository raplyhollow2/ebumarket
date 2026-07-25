import Link from "next/link";
import { notFound } from "next/navigation";
import { ResponsiveLayoutWrapper } from "@/components/layout/ResponsiveLayoutWrapper";
import { MarketDetailClient } from "@/components/listings/market-detail-client";
import { createClient } from "@/lib/supabase/server";
import { getAppSettings } from "@/lib/settings";
import { DEFAULT_CURRENCY } from "@/lib/format";
import type { ListingWithPhotos, MeetupPoint, Profile } from "@/lib/types";

export default async function MarketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const settings = await getAppSettings();
  const { data, error } = await supabase
    .from("listings")
    .select(
      "*, listing_photos(*), profiles:seller_id(id, display_name, area, is_organization)",
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !data) notFound();
  const listing = {
    ...(data as ListingWithPhotos),
    currency: (data as ListingWithPhotos).currency || settings.currency || DEFAULT_CURRENCY,
  };

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let meetups: MeetupPoint[] = [];
  let preferredPayment: Profile["preferred_payment"] = null;
  if (user) {
    const [{ data: points }, { data: profile }] = await Promise.all([
      supabase
        .from("meetup_points")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at"),
      supabase
        .from("profiles")
        .select("preferred_payment")
        .eq("id", user.id)
        .maybeSingle(),
    ]);
    meetups = (points ?? []) as MeetupPoint[];
    preferredPayment = profile?.preferred_payment ?? null;
  }

  return (
    <ResponsiveLayoutWrapper>
      <Link href="/market" className="text-sm text-muted-foreground">
        ← Market
      </Link>
      <div className="mt-3">
        <MarketDetailClient
          listing={listing}
          isAuthed={Boolean(user)}
          meetups={meetups}
          preferredPayment={preferredPayment}
          feePercent={settings.platformFeePercent}
        />
      </div>
    </ResponsiveLayoutWrapper>
  );
}
