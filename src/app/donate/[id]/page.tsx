import Link from "next/link";
import { notFound } from "next/navigation";
import { ResponsiveLayoutWrapper } from "@/components/layout/ResponsiveLayoutWrapper";
import { DonateDetailClient } from "@/components/listings/donate-detail-client";
import { createClient } from "@/lib/supabase/server";
import type { ListingWithPhotos } from "@/lib/types";

export default async function DonateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("listings")
    .select(
      "*, listing_photos(*), profiles:seller_id(id, display_name, area, is_organization)",
    )
    .eq("id", id)
    .eq("type", "donation")
    .maybeSingle();
  if (!data) notFound();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <ResponsiveLayoutWrapper>
      <Link href="/donate" className="text-sm text-muted-foreground">
        ← Donation Hub
      </Link>
      <div className="mt-3">
        <DonateDetailClient
          listing={data as ListingWithPhotos}
          isAuthed={Boolean(user)}
        />
      </div>
    </ResponsiveLayoutWrapper>
  );
}
