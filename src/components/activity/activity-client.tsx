"use client";

import Link from "next/link";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createClient } from "@/lib/supabase/client";
import { formatMoney, statusLabel, DEFAULT_CURRENCY } from "@/lib/format";
import type { Listing, DonationClaim, PayoutStatus } from "@/lib/types";

type Party = { id: string; display_name: string } | null;

type Tx = {
  id: string;
  status: string;
  payment_method: string;
  item_price_cents: number;
  fee_cents: number;
  total_cents: number;
  seller_payout_cents: number;
  payout_status: PayoutStatus;
  buyer_id: string;
  seller_id: string;
  listing_id: string;
  listings: { title: string; currency?: string } | null;
  buyer: Party;
  seller: Party;
};

type ClaimRow = DonationClaim & {
  listings: { title: string; seller_id: string } | null;
};

export function ActivityClient({
  listings,
  transactions,
  claims,
  centerListings = [],
  centerClaims = [],
  centerNames = {},
  userId,
  isAdmin = false,
}: {
  listings: Listing[];
  transactions: Tx[];
  claims: ClaimRow[];
  centerListings?: Listing[];
  centerClaims?: ClaimRow[];
  centerNames?: Record<string, string>;
  userId: string;
  isAdmin?: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const myBuys = transactions.filter((t) => t.buyer_id === userId);
  const sellingBuys = transactions.filter((t) => t.seller_id === userId);
  const hasCentreTab = centerListings.length > 0 || centerClaims.length > 0;

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

  function updateTx(
    id: string,
    patch: Record<string, unknown>,
    okMessage: string,
  ) {
    startTransition(async () => {
      const supabase = createClient();
      const { error } = await supabase
        .from("transactions")
        .update(patch)
        .eq("id", id);
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success(okMessage);
      router.refresh();
    });
  }

  function acceptCod(tx: Tx) {
    updateTx(tx.id, { status: "accepted" }, "Buy request accepted");
  }

  function declineCod(tx: Tx) {
    updateTx(tx.id, { status: "cancelled" }, "Buy request declined");
  }

  function confirmCodPayment(tx: Tx) {
    startTransition(async () => {
      const supabase = createClient();
      const { error } = await supabase
        .from("transactions")
        .update({
          status: "completed",
          payout_status: "not_applicable",
        })
        .eq("id", tx.id);
      if (error) {
        toast.error(error.message);
        return;
      }
      await supabase
        .from("listings")
        .update({ status: "sold" })
        .eq("id", tx.listing_id);
      toast.success("Payment confirmed — deal complete");
      router.refresh();
    });
  }

  function claimPayout(tx: Tx) {
    updateTx(
      tx.id,
      {
        payout_status: "claimed",
        payout_claimed_at: new Date().toISOString(),
        status: tx.status === "paid" ? "accepted" : tx.status,
      },
      "Payout claimed — Zyra will deliver your share",
    );
  }

  function markPaidOut(tx: Tx) {
    updateTx(
      tx.id,
      {
        payout_status: "paid_out",
        payout_paid_at: new Date().toISOString(),
        status: "completed",
      },
      "Marked paid out to seller",
    );
  }

  return (
    <Tabs defaultValue="all">
      <TabsList
        className={`mb-3 grid w-full ${hasCentreTab ? "grid-cols-5" : "grid-cols-4"}`}
      >
        <TabsTrigger value="all">All</TabsTrigger>
        <TabsTrigger value="selling">Selling</TabsTrigger>
        <TabsTrigger value="buys">Buys</TabsTrigger>
        <TabsTrigger value="claims">Claims</TabsTrigger>
        {hasCentreTab ? (
          <TabsTrigger value="centres">Centres</TabsTrigger>
        ) : null}
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
        {sellingBuys.map((t) => (
          <TxAction
            key={`st-${t.id}`}
            tx={t}
            role="seller"
            userId={userId}
            isAdmin={isAdmin}
            pending={pending}
            onAccept={() => acceptCod(t)}
            onDecline={() => declineCod(t)}
            onConfirmCash={() => confirmCodPayment(t)}
            onClaimPayout={() => claimPayout(t)}
            onMarkPaidOut={() => markPaidOut(t)}
          />
        ))}
        {myBuys
          .filter((t) => t.seller_id !== userId)
          .map((t) => (
            <TxAction
              key={`bt-${t.id}`}
              tx={t}
              role="buyer"
              userId={userId}
              isAdmin={isAdmin}
              pending={pending}
              onAccept={() => acceptCod(t)}
              onDecline={() => declineCod(t)}
              onConfirmCash={() => confirmCodPayment(t)}
              onClaimPayout={() => claimPayout(t)}
              onMarkPaidOut={() => markPaidOut(t)}
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
        {sellingBuys.length === 0 && listings.length === 0 ? (
          <p className="text-sm text-muted-foreground">No selling activity yet.</p>
        ) : null}
        {sellingBuys.map((t) => (
          <TxAction
            key={t.id}
            tx={t}
            role="seller"
            userId={userId}
            isAdmin={isAdmin}
            pending={pending}
            onAccept={() => acceptCod(t)}
            onDecline={() => declineCod(t)}
            onConfirmCash={() => confirmCodPayment(t)}
            onClaimPayout={() => claimPayout(t)}
            onMarkPaidOut={() => markPaidOut(t)}
          />
        ))}
      </TabsContent>

      <TabsContent value="buys" className="space-y-2">
        {myBuys.map((t) => (
          <TxAction
            key={t.id}
            tx={t}
            role="buyer"
            userId={userId}
            isAdmin={isAdmin}
            pending={pending}
            onAccept={() => acceptCod(t)}
            onDecline={() => declineCod(t)}
            onConfirmCash={() => confirmCodPayment(t)}
            onClaimPayout={() => claimPayout(t)}
            onMarkPaidOut={() => markPaidOut(t)}
          />
        ))}
        {myBuys.length === 0 && (
          <p className="text-sm text-muted-foreground">No purchases yet.</p>
        )}
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
        {claims.length === 0 && (
          <p className="text-sm text-muted-foreground">No donation claims yet.</p>
        )}
      </TabsContent>

      {hasCentreTab ? (
        <TabsContent value="centres" className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Items tagged to centres you staff — open to claim, or watch incoming
            requests.
          </p>
          {centerListings.map((l) => (
            <Row
              key={`cl-${l.id}`}
              title={l.title}
              status={l.status}
              meta={`${centerNames[l.center_id ?? ""] ?? "Centre"} · ${l.category} · ${l.size}`}
              href={`/donate/${l.id}`}
            />
          ))}
          {centerClaims.map((c) => (
            <ClaimAction
              key={`cc-${c.id}`}
              claim={c}
              userId={userId}
              pending={pending}
              onUpdate={updateClaim}
            />
          ))}
          {centerListings.length + centerClaims.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No centre-tagged activity yet.
            </p>
          ) : null}
        </TabsContent>
      ) : null}
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

function TxAction({
  tx,
  role,
  userId,
  isAdmin,
  pending,
  onAccept,
  onDecline,
  onConfirmCash,
  onClaimPayout,
  onMarkPaidOut,
}: {
  tx: Tx;
  role: "buyer" | "seller";
  userId: string;
  isAdmin: boolean;
  pending: boolean;
  onAccept: () => void;
  onDecline: () => void;
  onConfirmCash: () => void;
  onClaimPayout: () => void;
  onMarkPaidOut: () => void;
}) {
  const currency = tx.listings?.currency || DEFAULT_CURRENCY;
  const other =
    role === "seller"
      ? tx.buyer
      : tx.seller;
  const otherLabel = role === "seller" ? "Buyer" : "Seller";

  return (
    <div className="rounded-xl bg-card p-3 ring-1 ring-border/60">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-medium">
            {tx.listings?.title ?? "Purchase"}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {tx.payment_method.toUpperCase()} · You{" "}
            {role === "buyer" ? "pay" : "receive"}{" "}
            {formatMoney(
              role === "buyer" ? tx.total_cents : tx.seller_payout_cents,
              currency,
            )}
            {role === "buyer"
              ? ` (incl. ${formatMoney(tx.fee_cents, currency)} fee)`
              : ` · fee ${formatMoney(tx.fee_cents, currency)}`}
          </p>
          {other ? (
            <p className="mt-1 text-xs">
              {otherLabel}:{" "}
              <Link
                href={`/profile/${other.id}`}
                className="underline underline-offset-2"
              >
                {other.display_name || "Member"}
              </Link>
            </p>
          ) : null}
          {tx.payout_status !== "not_applicable" &&
          tx.payout_status !== "pending" ? (
            <p className="mt-1 text-xs text-muted-foreground">
              Payout: {statusLabel(tx.payout_status)}
            </p>
          ) : null}
        </div>
        <StatusBadge status={tx.status} />
      </div>

      {role === "seller" &&
        tx.payment_method === "cod" &&
        tx.status === "requested" && (
          <div className="mt-2 flex gap-2">
            <Button size="sm" disabled={pending} onClick={onAccept}>
              Accept
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={pending}
              onClick={onDecline}
            >
              Decline
            </Button>
          </div>
        )}

      {role === "seller" &&
        tx.payment_method === "cod" &&
        tx.status === "accepted" && (
          <div className="mt-2">
            <Button size="sm" disabled={pending} onClick={onConfirmCash}>
              Confirm cash received
            </Button>
          </div>
        )}

      {role === "seller" &&
        tx.payout_status === "claimable" &&
        tx.seller_id === userId && (
          <div className="mt-2">
            <Button size="sm" disabled={pending} onClick={onClaimPayout}>
              Claim payment ({formatMoney(tx.seller_payout_cents, currency)})
            </Button>
          </div>
        )}

      {isAdmin && tx.payout_status === "claimed" && (
        <div className="mt-2">
          <Button size="sm" variant="outline" disabled={pending} onClick={onMarkPaidOut}>
            Mark paid out to seller
          </Button>
        </div>
      )}
    </div>
  );
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
