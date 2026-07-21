import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/status-badge";
import { createClient } from "@/lib/supabase/server";
import { formatMoney, DEFAULT_CURRENCY } from "@/lib/format";
import { getViewerAccess } from "@/lib/settings";

export default async function AdminTransactionsPage() {
  const { user, isAdmin, canApprove } = await getViewerAccess();
  if (!user) redirect("/admin");
  if (!isAdmin && !canApprove) redirect("/admin");

  const supabase = await createClient();
  const { data: rows } = await supabase
    .from("transactions")
    .select(
      "id, payment_method, status, total_cents, created_at, listings(currency, title)",
    )
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="mx-auto min-h-dvh max-w-4xl px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold">
          Transactions
        </h1>
        <div className="flex gap-3 text-sm">
          <Link href="/admin" className="underline">
            Approval
          </Link>
          {isAdmin ? (
            <Link href="/admin/settings" className="underline">
              Settings
            </Link>
          ) : null}
        </div>
      </div>
      <div className="overflow-hidden rounded-xl bg-card ring-1 ring-border/70">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(rows ?? []).map((r) => {
              const listing = r.listings as unknown as {
                title?: string;
                currency?: string;
              } | null;
              return (
                <TableRow key={r.id}>
                  <TableCell>{listing?.title ?? "—"}</TableCell>
                  <TableCell className="uppercase">{r.payment_method}</TableCell>
                  <TableCell>
                    <StatusBadge status={r.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    {formatMoney(
                      r.total_cents,
                      listing?.currency ?? DEFAULT_CURRENCY,
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
