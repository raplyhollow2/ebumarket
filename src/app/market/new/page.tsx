import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ListingComposer } from "@/components/listings/listing-composer";

export default async function NewMarketListingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/market");
  return <ListingComposer type="marketplace" userId={user.id} />;
}
