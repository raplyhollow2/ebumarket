import { redirect } from "next/navigation";
import { AdminLoginGate } from "@/app/admin/admin-login-gate";
import { AdminCentersClient } from "@/app/admin/centers/centers-client";
import { AdminShell } from "@/components/admin/AdminShell";
import { createClient } from "@/lib/supabase/server";
import { getViewerAccess } from "@/lib/settings";
import type { CenterMember, DonationCenter, Profile } from "@/lib/types";

export default async function AdminCentersPage() {
  const { user, isAdmin } = await getViewerAccess();
  if (!user) return <AdminLoginGate />;
  if (!isAdmin) redirect("/admin");

  const supabase = await createClient();
  const [{ data: centers }, { data: members }, { data: profiles }] =
    await Promise.all([
      supabase.from("donation_centers").select("*").order("name"),
      supabase
        .from("center_members")
        .select("*, profiles:user_id(id, display_name)")
        .order("created_at"),
      supabase
        .from("profiles")
        .select("id, display_name, area")
        .order("display_name"),
    ]);

  return (
    <AdminShell title="Centres">
      <p className="mb-4 text-sm text-muted-foreground">
        Manage orphanages and centres, verify listings destinations, link staff.
      </p>
      <AdminCentersClient
        centers={(centers ?? []) as DonationCenter[]}
        members={(members ?? []) as (CenterMember & {
          profiles?: Pick<Profile, "id" | "display_name"> | null;
        })[]}
        profiles={
          (profiles ?? []) as Pick<Profile, "id" | "display_name" | "area">[]
        }
      />
    </AdminShell>
  );
}
