import { redirect } from "next/navigation";
import { AdminLoginGate } from "@/app/admin/admin-login-gate";
import { AdminSettingsClient } from "@/app/admin/settings/settings-client";
import { AdminShell } from "@/components/admin/AdminShell";
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
    <AdminShell title="Settings">
      <p className="mb-4 text-sm text-muted-foreground">
        Currency, fees, users, and who can approve listings.
      </p>
      <AdminSettingsClient
        initialCurrency={settings.currency}
        initialFeePercent={settings.platformFeePercent}
        users={(users ?? []) as Profile[]}
      />
    </AdminShell>
  );
}
