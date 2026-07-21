import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ListingComposer } from "@/components/listings/listing-composer";

export default async function NewDonationPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/donate");
  return <ListingComposer type="donation" userId={user.id} />;
}
