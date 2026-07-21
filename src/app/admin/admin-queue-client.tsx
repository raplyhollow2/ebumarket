"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { createClient } from "@/lib/supabase/client";
import { formatMoney, DEFAULT_CURRENCY } from "@/lib/format";
import type { ListingWithPhotos } from "@/lib/types";

export function AdminQueueClient({
  listings,
  adminId,
}: {
  listings: ListingWithPhotos[];
  adminId: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [reason, setReason] = useState("");

  function approve(id: string) {
    startTransition(async () => {
      const supabase = createClient();
      const { error } = await supabase
        .from("listings")
        .update({
          status: "verified",
          verified_at: new Date().toISOString(),
          verified_by: adminId,
          reject_reason: null,
        })
        .eq("id", id);
      if (error) {
        toast.error(error.message);
        return;
      }
      await supabase.from("audit_events").insert({
        actor_id: adminId,
        action: "verify_listing",
        entity_type: "listing",
        entity_id: id,
        payload: {},
      });
      toast.success("Verified by Zyra");
      router.refresh();
    });
  }

  function reject(id: string) {
    startTransition(async () => {
      if (!reason.trim()) {
        toast.error("Add a short reason");
        return;
      }
      const supabase = createClient();
      const { error } = await supabase
        .from("listings")
        .update({
          status: "rejected",
          reject_reason: reason.trim(),
        })
        .eq("id", id);
      if (error) {
        toast.error(error.message);
        return;
      }
      await supabase.from("audit_events").insert({
        actor_id: adminId,
        action: "reject_listing",
        entity_type: "listing",
        entity_id: id,
        payload: { reason: reason.trim() },
      });
      setReason("");
      toast.success("Rejected with reason");
      router.refresh();
    });
  }

  if (listings.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">Queue is clear. Nice.</p>
    );
  }

  return (
    <ul className="space-y-4">
      {listings.map((l) => {
        const photos = [...(l.listing_photos ?? [])].sort(
          (a, b) => a.sort_order - b.sort_order,
        );
        return (
          <li
            key={l.id}
            className="rounded-2xl bg-card p-3 ring-1 ring-border/70"
          >
            <div className="flex gap-2 overflow-x-auto">
              {photos.map((p) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={p.id}
                  src={p.public_url}
                  alt={p.angle}
                  className="h-20 w-20 rounded-lg object-cover"
                />
              ))}
            </div>
            <div className="mt-3">
              <p className="font-medium">{l.title}</p>
              <p className="text-xs text-muted-foreground">
                {l.type} · {l.size} · {l.condition}
                {l.price_cents != null
                  ? ` · ${formatMoney(l.price_cents, l.currency || DEFAULT_CURRENCY)}`
                  : " · Free"}
              </p>
            </div>
            <div className="mt-3 flex gap-2">
              <Button disabled={pending} onClick={() => approve(l.id)}>
                Verify
              </Button>
              <AlertDialog>
                <AlertDialogTrigger
                  className="inline-flex h-8 items-center justify-center rounded-lg border border-border bg-background px-2.5 text-sm font-medium"
                  disabled={pending}
                >
                  Reject
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Reject listing</AlertDialogTitle>
                  </AlertDialogHeader>
                  <Textarea
                    placeholder="Short reason for the seller"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  />
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => reject(l.id)}>
                      Reject
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
