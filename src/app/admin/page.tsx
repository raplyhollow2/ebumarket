import Link from "next/link";
import { AdminQueueClient } from "@/app/admin/admin-queue-client";
import { AdminLoginGate } from "@/app/admin/admin-login-gate";
import { createClient } from "@/lib/supabase/server";
import { getViewerAccess } from "@/lib/settings";
import type { ListingWithPhotos } from "@/lib/types";

type QueueItem = ListingWithPhotos & {
  profiles?: { display_name: string; area: string } | null;
};

export default async function AdminPage() {
  const { user, isAdmin, canApprove } = await getViewerAccess();

  if (!user) {
    return <AdminLoginGate />;
  }

  if (!canApprove) {
    return (
      <div className="mx-auto max-w-lg px-4 py-10">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold">
          Approval queue
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          You&apos;re logged in, but you don&apos;t have approval access.
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Ask an admin to enable <span className="font-medium">can approve</span>{" "}
          for your account in Settings.
        </p>
        <Link href="/" className="mt-4 inline-block text-sm underline">
          Back home
        </Link>
      </div>
    );
  }

  const supabase = await createClient();
  const [{ data: listings }, { data: history }] = await Promise.all([
    supabase
      .from("listings")
      .select("*, listing_photos(*), profiles:seller_id(display_name, area)")
      .eq("status", "pending")
      .order("created_at", { ascending: true }),
    supabase
      .from("listings")
      .select("*, listing_photos(*), profiles:seller_id(display_name, area)")
      .in("status", ["verified", "rejected"])
      .order("updated_at", { ascending: false })
      .limit(30),
  ]);

  return (
    <div className="mx-auto min-h-dvh max-w-3xl px-4 py-6">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold">
            Approval
          </h1>
          <p className="text-sm text-muted-foreground">
            Review photos, then Approve or Reject. Pending:{" "}
            {(listings ?? []).length}
          </p>
        </div>
        <div className="flex flex-wrap gap-3 text-sm">
          <Link href="/admin/transactions" className="underline">
            Transactions
          </Link>
          {isAdmin ? (
            <Link href="/admin/settings" className="underline">
              Settings
            </Link>
          ) : null}
          <Link href="/" className="underline">
            App
          </Link>
        </div>
      </div>
      <AdminQueueClient
        listings={(listings ?? []) as QueueItem[]}
        history={(history ?? []) as QueueItem[]}
        adminId={user.id}
      />
    </div>
  );
}
