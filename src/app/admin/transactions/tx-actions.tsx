"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function AdminTxActions({
  id,
  payoutStatus,
}: {
  id: string;
  payoutStatus: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  if (payoutStatus !== "claimed" && payoutStatus !== "claimable") {
    return <span className="text-xs text-muted-foreground">—</span>;
  }

  function markPaidOut() {
    startTransition(async () => {
      const supabase = createClient();
      const { error } = await supabase
        .from("transactions")
        .update({
          payout_status: "paid_out",
          payout_paid_at: new Date().toISOString(),
          status: "completed",
        })
        .eq("id", id);
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("Seller payout marked paid out");
      router.refresh();
    });
  }

  return (
    <Button size="sm" variant="outline" disabled={pending} onClick={markPaidOut}>
      {payoutStatus === "claimable" ? "Pay seller" : "Mark paid out"}
    </Button>
  );
}
