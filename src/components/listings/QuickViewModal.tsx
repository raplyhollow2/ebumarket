"use client";

import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { buttonVariants } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { formatMoney, DEFAULT_CURRENCY } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ExtendedListingWithPhotos } from "@/lib/types";

export function QuickViewModal({
  listing,
  open,
  onOpenChange,
}: {
  listing: ExtendedListingWithPhotos | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!listing) return null;
  const photo = listing.listing_photos?.[0];
  const href =
    listing.type === "donation" ? `/donate/${listing.id}` : `/market/${listing.id}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg overflow-hidden p-0 sm:max-w-xl">
        <div className="grid gap-0 sm:grid-cols-2">
          <div className="relative aspect-[3/4] bg-muted sm:aspect-auto sm:min-h-[320px]">
            {photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={photo.public_url}
                alt={listing.title}
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : null}
          </div>
          <div className="flex flex-col p-5">
            <DialogHeader className="text-left">
              <DialogTitle className="font-[family-name:var(--font-display)] text-2xl">
                {listing.title}
              </DialogTitle>
            </DialogHeader>
            <div className="mt-2">
              <StatusBadge status={listing.status} />
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Size {listing.size} · {listing.condition}
              {listing.profiles?.area ? ` · ${listing.profiles.area}` : ""}
            </p>
            <p className="mt-2 text-xl font-semibold">
              {listing.type === "donation" || listing.price_cents === 0
                ? "Free"
                : formatMoney(listing.price_cents ?? 0, listing.currency || DEFAULT_CURRENCY)}
            </p>
            <p className="mt-3 line-clamp-4 text-sm leading-relaxed">
              {listing.description}
            </p>
            <div className="mt-auto flex gap-2 pt-6">
              <Link
                href={href}
                onClick={() => onOpenChange(false)}
                className={cn(buttonVariants(), "flex-1")}
              >
                View full listing
              </Link>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
