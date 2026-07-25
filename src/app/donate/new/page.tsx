import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ListingComposer } from "@/components/listings/listing-composer";
import type { DonationCenter } from "@/lib/types";

export default async function NewDonationPage({
  searchParams,
}: {
  searchParams: Promise<{ center?: string }>;
}) {
  const { center: centerParam } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/donate");

  const { data: centers } = await supabase
    .from("donation_centers")
    .select("id, name, center_type, area, is_verified")
    .eq("is_active", true)
    .eq("is_verified", true)
    .order("name");

  return (
    <ListingComposer
      type="donation"
      userId={user.id}
      centers={(centers ?? []) as Pick<
        DonationCenter,
        "id" | "name" | "center_type" | "area" | "is_verified"
      >[]}
      initialCenterId={centerParam ?? null}
    />
  );
}
