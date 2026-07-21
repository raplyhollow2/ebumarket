import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminLoginGate } from "@/app/admin/admin-login-gate";
import { AdminSettingsClient } from "@/app/admin/settings/settings-client";
import { createClient } from "@/lib/supabase/server";
import { getAppSettings, getViewerAccess } from "@/lib/settings";
import type { Profile } from "@/lib/types";

export default async function AdminSettingsPage() {
  const { user, isAdmin } = await getViewerAccess();
  if (!user) return <AdminLoginGate />;
  if (!isAdmin) redirect("/admin");

  const supabase = await createClient();
  const settings = await getAppSettings();
  const { data: users } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto min-h-dvh max-w-3xl px-4 py-6">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold">
            Settings
          </h1>
          <p className="text-sm text-muted-foreground">
            Currency, fees, users, and who can approve listings.
          </p>
        </div>
        <div className="flex gap-3 text-sm">
          <Link href="/admin" className="underline">
            Approval
          </Link>
          <Link href="/admin/transactions" className="underline">
            Transactions
          </Link>
        </div>
      </div>
      <AdminSettingsClient
        initialCurrency={settings.currency}
        initialFeePercent={settings.platformFeePercent}
        users={(users ?? []) as Profile[]}
      />
    </div>
  );
}
