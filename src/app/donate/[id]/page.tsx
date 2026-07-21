import Link from "next/link";
import { notFound } from "next/navigation";
import { TeenShell } from "@/components/layout/teen-shell";
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
    .select("*, listing_photos(*)")
    .eq("id", id)
    .eq("type", "donation")
    .maybeSingle();
  if (!data) notFound();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <TeenShell>
      <Link href="/donate" className="text-sm text-muted-foreground">
        ← Donation Hub
      </Link>
      <div className="mt-3">
        <DonateDetailClient
          listing={data as ListingWithPhotos}
          isAuthed={Boolean(user)}
        />
      </div>
    </TeenShell>
  );
}
