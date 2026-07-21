"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createClient } from "@/lib/supabase/client";
import { formatMoney, statusLabel, DEFAULT_CURRENCY } from "@/lib/format";
import type { Listing, DonationClaim } from "@/lib/types";

type Tx = {
  id: string;
  status: string;
  payment_method: string;
  total_cents: number;
  listings: { title: string; currency?: string } | null;
};

type ClaimRow = DonationClaim & {
  listings: { title: string; seller_id: string } | null;
};

export function ActivityClient({
  listings,
  transactions,
  claims,
  userId,
}: {
  listings: Listing[];
  transactions: Tx[];
  claims: ClaimRow[];
  userId: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function updateClaim(id: string, status: "approved" | "declined") {
    startTransition(async () => {
      const supabase = createClient();
      const { error } = await supabase
        .from("donation_claims")
        .update({ status })
        .eq("id", id);
      if (error) {
        toast.error(error.message);
        return;
      }
      if (status === "approved") {
        const claim = claims.find((c) => c.id === id);
        if (claim?.listing_id) {
          await supabase
            .from("listings")
            .update({ status: "claimed" })
            .eq("id", claim.listing_id);
        }
      }
      toast.success(statusLabel(status));
      router.refresh();
    });
  }

  return (
    <Tabs defaultValue="all">
      <TabsList className="mb-3 grid w-full grid-cols-4">
        <TabsTrigger value="all">All</TabsTrigger>
        <TabsTrigger value="selling">Selling</TabsTrigger>
        <TabsTrigger value="buys">Buys</TabsTrigger>
        <TabsTrigger value="claims">Claims</TabsTrigger>
      </TabsList>

      <TabsContent value="all" className="space-y-2">
        {listings.map((l) => (
          <Row
            key={`l-${l.id}`}
            title={l.title}
            status={l.status}
            meta={l.type}
            href={l.type === "donation" ? `/donate/${l.id}` : `/market/${l.id}`}
          />
        ))}
        {transactions.map((t) => (
          <Row
            key={`t-${t.id}`}
            title={t.listings?.title ?? "Purchase"}
            status={t.status}
            meta={`${t.payment_method.toUpperCase()} · ${formatMoney(t.total_cents, t.listings?.currency || DEFAULT_CURRENCY)}`}
          />
        ))}
        {claims.map((c) => (
          <ClaimAction
            key={`c-${c.id}`}
            claim={c}
            userId={userId}
            pending={pending}
            onUpdate={updateClaim}
          />
        ))}
        {listings.length + transactions.length + claims.length === 0 && (
          <p className="text-sm text-muted-foreground">Nothing here yet.</p>
        )}
      </TabsContent>

      <TabsContent value="selling" className="space-y-2">
        {listings.map((l) => (
          <Row
            key={l.id}
            title={l.title}
            status={l.status}
            meta={l.reject_reason ? `Reason: ${l.reject_reason}` : l.type}
            href={l.type === "donation" ? `/donate/${l.id}` : `/market/${l.id}`}
          />
        ))}
      </TabsContent>

      <TabsContent value="buys" className="space-y-2">
        {transactions.map((t) => (
          <Row
            key={t.id}
            title={t.listings?.title ?? "Purchase"}
            status={t.status}
            meta={`${t.payment_method.toUpperCase()} · ${formatMoney(t.total_cents, t.listings?.currency || DEFAULT_CURRENCY)}`}
          />
        ))}
      </TabsContent>

      <TabsContent value="claims" className="space-y-2">
        {claims.map((c) => (
          <ClaimAction
            key={c.id}
            claim={c}
            userId={userId}
            pending={pending}
            onUpdate={updateClaim}
          />
        ))}
      </TabsContent>
    </Tabs>
  );
}

function Row({
  title,
  status,
  meta,
  href,
}: {
  title: string;
  status: string;
  meta?: string;
  href?: string;
}) {
  const inner = (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-card p-3 ring-1 ring-border/60">
      <div className="min-w-0">
        <p className="truncate font-medium">{title}</p>
        {meta ? (
          <p className="truncate text-xs text-muted-foreground">{meta}</p>
        ) : null}
      </div>
      <StatusBadge status={status} />
    </div>
  );
  return href ? <a href={href}>{inner}</a> : inner;
}

function ClaimAction({
  claim,
  userId,
  pending,
  onUpdate,
}: {
  claim: ClaimRow;
  userId: string;
  pending: boolean;
  onUpdate: (id: string, status: "approved" | "declined") => void;
}) {
  const isOwner = claim.listings?.seller_id === userId;
  return (
    <div className="rounded-xl bg-card p-3 ring-1 ring-border/60">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-medium">
            {claim.listings?.title ?? "Donation claim"}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {claim.message || claim.contact}
          </p>
        </div>
        <StatusBadge status={claim.status} />
      </div>
      {isOwner && claim.status === "requested" && (
        <div className="mt-2 flex gap-2">
          <Button
            size="sm"
            disabled={pending}
            onClick={() => onUpdate(claim.id, "approved")}
          >
            Approve
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={pending}
            onClick={() => onUpdate(claim.id, "declined")}
          >
            Decline
          </Button>
        </div>
      )}
    </div>
  );
}
