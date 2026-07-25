"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { formatMoney, splitPaymentCents, DEFAULT_CURRENCY } from "@/lib/format";
import type { MeetupPoint, PaymentMethod } from "@/lib/types";
import { AuthSheet } from "@/components/auth/auth-sheet";

export function BuySheet({
  open,
  onOpenChange,
  listingId,
  sellerId,
  itemPriceCents,
  currency = DEFAULT_CURRENCY,
  feePercent = 5,
  isAuthed,
  meetups,
  preferredPayment,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  listingId: string;
  sellerId: string;
  itemPriceCents: number;
  currency?: string;
  feePercent?: number;
  isAuthed: boolean;
  meetups: MeetupPoint[];
  preferredPayment: PaymentMethod | null;
}) {
  const router = useRouter();
  const [authOpen, setAuthOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [method, setMethod] = useState<PaymentMethod>(
    preferredPayment ?? "cod",
  );
  const [meetupId, setMeetupId] = useState(meetups[0]?.id ?? "");
  const [newMeetup, setNewMeetup] = useState("");
  const split = useMemo(
    () => splitPaymentCents(itemPriceCents, feePercent),
    [itemPriceCents, feePercent],
  );

  function confirm() {
    if (!isAuthed) {
      setAuthOpen(true);
      return;
    }
    startTransition(async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setAuthOpen(true);
        return;
      }

      let meetupPointId = meetupId || null;
      if (method === "cod") {
        if (!meetupPointId && newMeetup.trim()) {
          const { data: mp, error } = await supabase
            .from("meetup_points")
            .insert({ user_id: user.id, label: newMeetup.trim() })
            .select("id")
            .single();
          if (error || !mp) {
            toast.error(error?.message ?? "Could not save meetup");
            return;
          }
          meetupPointId = mp.id;
        }
        if (!meetupPointId) {
          toast.error("Pick or add a meetup spot for COD");
          return;
        }
      }

      await supabase
        .from("profiles")
        .update({ preferred_payment: method })
        .eq("id", user.id);

      if (method === "online") {
        if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
          const { error } = await supabase.from("transactions").insert({
            listing_id: listingId,
            buyer_id: user.id,
            seller_id: sellerId,
            payment_method: "online",
            meetup_point_id: null,
            item_price_cents: split.item_price_cents,
            fee_cents: split.fee_cents,
            total_cents: split.total_cents,
            seller_payout_cents: split.seller_payout_cents,
            payout_status: "pending",
            status: "awaiting_payment",
          });
          if (error) {
            toast.error(error.message);
            return;
          }
          toast.message(
            "Stripe not configured — request saved. Seller will see it in Activity.",
          );
          onOpenChange(false);
          router.push("/activity");
          router.refresh();
          return;
        }
        const res = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ listingId }),
        });
        const json = await res.json();
        if (!res.ok) {
          toast.error(json.error ?? "Checkout failed");
          return;
        }
        window.location.href = json.url;
        return;
      }

      const { error } = await supabase.from("transactions").insert({
        listing_id: listingId,
        buyer_id: user.id,
        seller_id: sellerId,
        payment_method: "cod",
        meetup_point_id: meetupPointId,
        item_price_cents: split.item_price_cents,
        fee_cents: split.fee_cents,
        total_cents: split.total_cents,
        seller_payout_cents: split.seller_payout_cents,
        payout_status: "not_applicable",
        status: "requested",
      });
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("Buy request sent to seller");
      onOpenChange(false);
      router.push("/activity");
      router.refresh();
    });
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="bottom"
          className="mx-auto max-w-lg rounded-t-2xl md:inset-y-0 md:right-0 md:left-auto md:mx-0 md:h-full md:max-w-md md:rounded-none md:rounded-l-2xl md:border-l"
        >
          <SheetHeader>
            <SheetTitle>Buy</SheetTitle>
            <SheetDescription>
              You pay Zyra. We keep {feePercent}% and deliver the item price to
              the seller. Meet in a public place — don&apos;t share your home
              address.
            </SheetDescription>
          </SheetHeader>
          <div className="mt-4 space-y-4 pb-6">
            <div className="rounded-xl bg-muted/70 p-3 text-sm">
              <div className="flex justify-between">
                <span>Item (seller receives)</span>
                <span>{formatMoney(split.item_price_cents, currency)}</span>
              </div>
              <div className="mt-1 flex justify-between text-muted-foreground">
                <span>Platform fee ({feePercent}%)</span>
                <span>{formatMoney(split.fee_cents, currency)}</span>
              </div>
              <div className="mt-2 flex justify-between border-t border-border pt-2 font-medium">
                <span>You pay Zyra</span>
                <span>{formatMoney(split.total_cents, currency)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Pay with</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={method === "cod" ? "default" : "outline"}
                  onClick={() => setMethod("cod")}
                >
                  Cash on Delivery
                </Button>
                <Button
                  type="button"
                  variant={method === "online" ? "default" : "outline"}
                  onClick={() => setMethod("online")}
                >
                  Online to Zyra
                </Button>
              </div>
            </div>

            {method === "cod" && (
              <div className="space-y-2">
                <Label>Meetup spot</Label>
                {meetups.length > 0 ? (
                  <Select value={meetupId} onValueChange={(v) => setMeetupId(v ?? "")}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choose meetup" />
                    </SelectTrigger>
                    <SelectContent>
                      {meetups.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : null}
                <Input
                  placeholder="Or quick-add a public meetup"
                  value={newMeetup}
                  onChange={(e) => setNewMeetup(e.target.value)}
                />
              </div>
            )}

            <Button className="h-12 w-full" disabled={pending} onClick={confirm}>
              {pending
                ? "Confirming…"
                : method === "online"
                  ? "Pay Zyra"
                  : "Send request to seller"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
      <AuthSheet open={authOpen} onOpenChange={setAuthOpen} />
    </>
  );
}
