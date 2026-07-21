import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminQueueClient } from "@/app/admin/admin-queue-client";
import { createClient } from "@/lib/supabase/server";
import type { ListingWithPhotos, Profile } from "@/lib/types";

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile || (profile as Profile).role !== "admin") {
    return (
      <div className="mx-auto max-w-lg px-4 py-10">
        <h1 className="text-2xl font-semibold">Admin</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your account is not an admin. Seed Alex or promote a profile via SQL.
        </p>
        <Link href="/" className="mt-4 inline-block text-sm underline">
          Back home
        </Link>
      </div>
    );
  }

  const { data: listings } = await supabase
    .from("listings")
    .select("*, listing_photos(*)")
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  return (
    <div className="mx-auto min-h-dvh max-w-3xl px-4 py-6">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold">
            Verification
          </h1>
          <p className="text-sm text-muted-foreground">
            Pending {(listings ?? []).length}
          </p>
        </div>
        <div className="flex gap-3 text-sm">
          <Link href="/admin/transactions" className="underline">
            Transactions
          </Link>
          <Link href="/" className="underline">
            App
          </Link>
        </div>
      </div>
      <AdminQueueClient
        listings={(listings ?? []) as ListingWithPhotos[]}
        adminId={user.id}
      />
    </div>
  );
}
