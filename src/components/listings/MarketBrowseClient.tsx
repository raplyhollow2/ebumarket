"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { ListingCard } from "@/components/listings/ListingCard";
import { QuickViewModal } from "@/components/listings/QuickViewModal";
import { createClient } from "@/lib/supabase/client";
import { getGridClassName } from "@/lib/grid-system";
import type { ExtendedListingWithPhotos } from "@/lib/types";

export function MarketBrowseClient({
  listings,
  isAuthed,
  grid = "marketplace",
}: {
  listings: ExtendedListingWithPhotos[];
  isAuthed: boolean;
  grid?: "marketplace" | "collections";
}) {
  const [items, setItems] = useState(listings);
  const [quickView, setQuickView] = useState<ExtendedListingWithPhotos | null>(
    null,
  );
  const [, startTransition] = useTransition();

  function onLike(listingId: string) {
    if (!isAuthed) {
      toast.message("Log in to like listings");
      return;
    }
    startTransition(async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        toast.message("Log in to like listings");
        return;
      }

      const existing = await supabase
        .from("social_interactions")
        .select("id")
        .eq("user_id", user.id)
        .eq("target_id", listingId)
        .eq("interaction_type", "like")
        .eq("target_type", "listing")
        .maybeSingle();

      if (existing.data) {
        await supabase.from("social_interactions").delete().eq("id", existing.data.id);
        setItems((prev) =>
          prev.map((l) =>
            l.id === listingId
              ? {
                  ...l,
                  is_liked: false,
                  likes_count: Math.max(0, (l.likes_count || 1) - 1),
                }
              : l,
          ),
        );
        toast.success("Removed like");
        return;
      }

      const { error } = await supabase.from("social_interactions").insert({
        user_id: user.id,
        target_id: listingId,
        target_type: "listing",
        interaction_type: "like",
      });
      if (error) {
        toast.error(error.message);
        return;
      }
      setItems((prev) =>
        prev.map((l) =>
          l.id === listingId
            ? { ...l, is_liked: true, likes_count: (l.likes_count || 0) + 1 }
            : l,
        ),
      );
      toast.success("Liked");
    });
  }

  async function onShare(listingId: string) {
    const listing = items.find((l) => l.id === listingId);
    const path =
      listing?.type === "donation" ? `/donate/${listingId}` : `/market/${listingId}`;
    const url = `${window.location.origin}${path}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: listing?.title ?? "Zyra listing", url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied");
      }
    } catch {
      try {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied");
      } catch {
        toast.error("Could not share");
      }
    }
  }

  return (
    <>
      <div className={getGridClassName(grid)}>
        {items.map((item) => (
          <ListingCard
            key={item.id}
            listing={item}
            isDesktop
            showActions
            onLike={onLike}
            onShare={onShare}
            onQuickView={(id) => {
              const found = items.find((l) => l.id === id) ?? null;
              setQuickView(found);
            }}
          />
        ))}
      </div>
      <QuickViewModal
        listing={quickView}
        open={Boolean(quickView)}
        onOpenChange={(open) => {
          if (!open) setQuickView(null);
        }}
      />
    </>
  );
}
