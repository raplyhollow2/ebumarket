import Link from "next/link";
import { AdminLoginGate } from "@/app/admin/admin-login-gate";
import { AdminShell } from "@/components/admin/AdminShell";
import { AnalyticsDashboard } from "@/components/admin/AnalyticsDashboard";
import { getViewerAccess } from "@/lib/settings";

export default async function AdminAnalyticsPage() {
  const { user, isAdmin } = await getViewerAccess();

  if (!user) return <AdminLoginGate />;

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-lg px-4 py-10">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold">
          Analytics
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">Admin access required.</p>
        <Link href="/admin" className="mt-4 inline-block text-sm underline">
          Back to queue
        </Link>
      </div>
    );
  }

  return (
    <AdminShell title="Analytics">
      <AnalyticsDashboard />
    </AdminShell>
  );
}
