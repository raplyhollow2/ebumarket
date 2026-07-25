import Link from "next/link";
import { AdminLoginGate } from "@/app/admin/admin-login-gate";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminERPDashboard } from "@/components/admin/AdminERPDashboard";
import { getViewerAccess } from "@/lib/settings";

export default async function AdminDashboardPage() {
  const { user, isAdmin, canApprove } = await getViewerAccess();

  if (!user) return <AdminLoginGate />;

  if (!isAdmin && !canApprove) {
    return (
      <div className="mx-auto max-w-lg px-4 py-10">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold">
          Dashboard
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          You need admin or approver access.
        </p>
        <Link href="/" className="mt-4 inline-block text-sm underline">
          Back home
        </Link>
      </div>
    );
  }

  return (
    <AdminShell title="ERP Dashboard">
      <AdminERPDashboard />
    </AdminShell>
  );
}
