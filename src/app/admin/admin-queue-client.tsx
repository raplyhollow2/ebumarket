"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { StatusBadge } from "@/components/status-badge";
import { createClient } from "@/lib/supabase/client";
import { formatMoney, DEFAULT_CURRENCY } from "@/lib/format";
import type { ListingWithPhotos } from "@/lib/types";

type QueueItem = ListingWithPhotos & {
  profiles?: { display_name: string; area: string } | null;
};

export function AdminQueueClient({
  listings,
  history,
  adminId,
}: {
  listings: QueueItem[];
  history: QueueItem[];
  adminId: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [items, setItems] = useState(listings);
  const [filter, setFilter] = useState<"all" | "marketplace" | "donation">(
    "all",
  );
  const [reasons, setReasons] = useState<Record<string, string>>({});
  const [activePhoto, setActivePhoto] = useState<{
    url: string;
    title: string;
    angle: string;
  } | null>(null);

  const visible = useMemo(
    () =>
      filter === "all" ? items : items.filter((l) => l.type === filter),
    [items, filter],
  );

  function setReason(id: string, value: string) {
    setReasons((prev) => ({ ...prev, [id]: value }));
  }

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
      setItems((prev) => prev.filter((l) => l.id !== id));
      const item = items.find((l) => l.id === id);
      if (item?.type === "donation") {
        toast.success(
          item.center_id
            ? "Approved — donor +15 pts (10 verify + 5 centre tag)"
            : "Approved — donor +10 pts toward next tier",
        );
      } else {
        toast.success("Approved — Verified by Zyra");
      }
      router.refresh();
    });
  }

  function reject(id: string) {
    startTransition(async () => {
      const reason = (reasons[id] || "").trim();
      if (!reason) {
        toast.error("Add a short reason");
        return;
      }
      const supabase = createClient();
      const { error } = await supabase
        .from("listings")
        .update({
          status: "rejected",
          reject_reason: reason,
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
        payload: { reason },
      });
      setItems((prev) => prev.filter((l) => l.id !== id));
      setReason(id, "");
      toast.success("Rejected with reason");
      router.refresh();
    });
  }

  return (
    <>
      <Tabs defaultValue="pending">
        <TabsList className="mb-4 grid w-full grid-cols-2">
          <TabsTrigger value="pending">
            Pending ({items.length})
          </TabsTrigger>
          <TabsTrigger value="history">
            Recent ({history.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          <div className="flex gap-2">
            {(
              [
                ["all", "All"],
                ["marketplace", "Market"],
                ["donation", "Donate"],
              ] as const
            ).map(([key, label]) => (
              <Button
                key={key}
                size="sm"
                variant={filter === key ? "default" : "outline"}
                onClick={() => setFilter(key)}
              >
                {label}
              </Button>
            ))}
          </div>

          {visible.length === 0 ? (
            <p className="rounded-xl bg-card p-6 text-center text-sm text-muted-foreground ring-1 ring-border/60">
              Queue is clear. Nothing waiting for approval.
            </p>
          ) : (
            <ul className="space-y-4">
              {visible.map((l) => {
                const photos = [...(l.listing_photos ?? [])].sort(
                  (a, b) => a.sort_order - b.sort_order,
                );
                return (
                  <li
                    key={l.id}
                    className="rounded-2xl bg-card p-4 ring-1 ring-border/70"
                  >
                    <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="text-lg font-semibold">{l.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {l.type === "marketplace" ? "Marketplace" : "Donation"}{" "}
                          · Size {l.size} · {l.condition}
                          {l.price_cents != null
                            ? ` · ${formatMoney(l.price_cents, l.currency || DEFAULT_CURRENCY)}`
                            : " · Free"}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Seller: {l.profiles?.display_name || "Unknown"}
                          {l.profiles?.area ? ` · ${l.profiles.area}` : ""}
                        </p>
                      </div>
                      <StatusBadge status={l.status} />
                    </div>

                    {l.description ? (
                      <p className="mb-3 text-sm leading-relaxed text-muted-foreground">
                        {l.description}
                      </p>
                    ) : null}

                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {photos.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          className="relative shrink-0"
                          onClick={() =>
                            setActivePhoto({
                              url: p.public_url,
                              title: l.title,
                              angle: p.angle,
                            })
                          }
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={p.public_url}
                            alt={p.angle}
                            className="h-28 w-28 rounded-xl object-cover ring-1 ring-border"
                          />
                          <span className="absolute bottom-1 left-1 rounded bg-black/55 px-1.5 py-0.5 text-[10px] capitalize text-white">
                            {p.angle}
                          </span>
                        </button>
                      ))}
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button
                        className="h-10 min-w-28"
                        disabled={pending}
                        onClick={() => approve(l.id)}
                      >
                        Approve
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger
                          className="inline-flex h-10 min-w-28 items-center justify-center rounded-lg border border-border bg-background px-3 text-sm font-medium"
                          disabled={pending}
                        >
                          Reject
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Reject “{l.title}”?
                            </AlertDialogTitle>
                          </AlertDialogHeader>
                          <Textarea
                            placeholder="Tell the seller what to fix (required)"
                            value={reasons[l.id] || ""}
                            onChange={(e) => setReason(l.id, e.target.value)}
                            rows={3}
                          />
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => reject(l.id)}
                            >
                              Reject listing
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-3">
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No recent approvals or rejections yet.
            </p>
          ) : (
            history.map((l) => (
              <div
                key={l.id}
                className="flex items-center justify-between gap-3 rounded-xl bg-card p-3 ring-1 ring-border/60"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{l.title}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {l.type}
                    {l.reject_reason ? ` · ${l.reject_reason}` : ""}
                    {l.verified_at
                      ? ` · ${new Date(l.verified_at).toLocaleString()}`
                      : ""}
                  </p>
                </div>
                <StatusBadge status={l.status} />
              </div>
            ))
          )}
        </TabsContent>
      </Tabs>

      {activePhoto ? (
        <button
          type="button"
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4"
          onClick={() => setActivePhoto(null)}
        >
          <div className="max-h-[90dvh] max-w-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={activePhoto.url}
              alt={activePhoto.angle}
              className="max-h-[80dvh] w-full rounded-xl object-contain"
            />
            <p className="mt-2 text-center text-sm text-white">
              {activePhoto.title} · {activePhoto.angle} (tap to close)
            </p>
          </div>
        </button>
      ) : null}
    </>
  );
}
