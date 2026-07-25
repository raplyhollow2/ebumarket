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
import { AdminTxActions } from "@/app/admin/transactions/tx-actions";
import { AdminShell } from "@/components/admin/AdminShell";
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
      `id, payment_method, status, item_price_cents, fee_cents, total_cents,
       seller_payout_cents, payout_status, created_at,
       listings(currency, title),
       buyer:profiles!buyer_id(display_name),
       seller:profiles!seller_id(display_name)`,
    )
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <AdminShell title="Transactions">
      <p className="mb-4 text-sm text-muted-foreground">
        Buyer pays Zyra · platform keeps fee · seller payout claimable
      </p>
      <div className="overflow-x-auto rounded-xl bg-card ring-1 ring-border/70">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Parties</TableHead>
              <TableHead>Split</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payout</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(rows ?? []).map((r) => {
              const listing = r.listings as unknown as {
                title?: string;
                currency?: string;
              } | null;
              const buyer = r.buyer as unknown as { display_name?: string } | null;
              const seller = r.seller as unknown as {
                display_name?: string;
              } | null;
              const currency = listing?.currency ?? DEFAULT_CURRENCY;
              return (
                <TableRow key={r.id}>
                  <TableCell>
                    <div className="font-medium">{listing?.title ?? "—"}</div>
                    <div className="text-xs uppercase text-muted-foreground">
                      {r.payment_method}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs">
                    <div>Buyer: {buyer?.display_name ?? "—"}</div>
                    <div>Seller: {seller?.display_name ?? "—"}</div>
                  </TableCell>
                  <TableCell className="text-xs">
                    <div>Total {formatMoney(r.total_cents, currency)}</div>
                    <div className="text-muted-foreground">
                      Fee {formatMoney(r.fee_cents, currency)} · Seller{" "}
                      {formatMoney(r.seller_payout_cents, currency)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={r.status} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={r.payout_status} />
                  </TableCell>
                  <TableCell className="text-right">
                    {isAdmin ? (
                      <AdminTxActions
                        id={r.id}
                        payoutStatus={r.payout_status}
                      />
                    ) : (
                      "—"
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </AdminShell>
  );
}
