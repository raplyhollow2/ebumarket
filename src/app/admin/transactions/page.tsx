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
import { formatMoney } from "@/lib/format";
import type { Profile } from "@/lib/types";

export default async function AdminTransactionsPage() {
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
  if (!profile || (profile as Profile).role !== "admin") redirect("/admin");

  const { data: rows } = await supabase
    .from("transactions")
    .select(
      "id, payment_method, status, total_cents, currency:listings(currency, title), created_at",
    )
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="mx-auto min-h-dvh max-w-4xl px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold">
          Transactions
        </h1>
        <Link href="/admin" className="text-sm underline">
          Queue
        </Link>
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
              const listing = r.currency as unknown as {
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
                    {formatMoney(r.total_cents, listing?.currency ?? "USD")}
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
