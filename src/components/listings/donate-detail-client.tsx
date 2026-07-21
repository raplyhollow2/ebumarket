"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { ClaimSheet } from "@/components/listings/claim-sheet";
import type { ListingWithPhotos } from "@/lib/types";

export function DonateDetailClient({
  listing,
  isAuthed,
}: {
  listing: ListingWithPhotos;
  isAuthed: boolean;
}) {
  const [open, setOpen] = useState(false);
  const photos = [...(listing.listing_photos ?? [])].sort(
    (a, b) => a.sort_order - b.sort_order,
  );
  const donor = listing.profiles;
  const donorHref = donor?.id
    ? `/profile/${donor.id}`
    : `/profile/${listing.seller_id}`;

  return (
    <div className="space-y-4">
      <div className="-mx-4 overflow-hidden">
        <div className="flex snap-x snap-mandatory gap-2 overflow-x-auto px-4">
          {photos.map((p) => (
            <div
              key={p.id}
              className="relative aspect-[3/4] w-[85%] shrink-0 snap-center overflow-hidden rounded-2xl bg-muted"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.public_url}
                alt={listing.title}
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold">
          {listing.title}
        </h1>
        <div className="mt-2">
          <StatusBadge status={listing.status} />
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Size {listing.size} · {listing.condition} · Free
          {donor?.area ? ` · ${donor.area}` : ""}
        </p>
        {donor ? (
          <p className="mt-2 text-sm">
            From{" "}
            <Link href={donorHref} className="font-medium underline underline-offset-2">
              {donor.display_name || "Donor"}
            </Link>
            {donor.is_organization ? (
              <span className="ml-1 text-xs text-muted-foreground">(org)</span>
            ) : null}
          </p>
        ) : (
          <p className="mt-2 text-sm">
            <Link
              href={`/profile/${listing.seller_id}`}
              className="font-medium underline underline-offset-2"
            >
              View donor profile
            </Link>
          </p>
        )}
        <p className="mt-3 text-sm">{listing.description}</p>
      </div>
      {listing.status === "verified" && (
        <>
          <Button className="h-12 w-full" onClick={() => setOpen(true)}>
            Request / Claim
          </Button>
          <ClaimSheet
            open={open}
            onOpenChange={setOpen}
            listingId={listing.id}
            isAuthed={isAuthed}
          />
        </>
      )}
    </div>
  );
}
