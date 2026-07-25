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
  const center = listing.donation_centers;
  const donorHref = donor?.id
    ? `/profile/${donor.id}`
    : `/profile/${listing.seller_id}`;

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Photo Gallery - Responsive Design */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {photos.map((p, index) => (
          <div
            key={p.id}
            className={`relative aspect-[3/4] overflow-hidden rounded-2xl bg-muted ${
              index === 0 ? 'md:col-span-2 md:row-span-2' : ''
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={p.public_url}
              alt={listing.title}
              className="h-full w-full object-cover transition-transform hover:scale-105"
            />
          </div>
        ))}
      </div>

      {/* Product Details - Desktop Layout */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-4">
          <div>
            <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold md:text-4xl lg:text-5xl">
              {listing.title}
            </h1>
            <div className="mt-3">
              <StatusBadge status={listing.status} />
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Size {listing.size} · {listing.condition} · Free
              {donor?.area ? ` · ${donor.area}` : ""}
            </p>
            {donor ? (
              <p className="text-sm">
                From{" "}
                <Link href={donorHref} className="font-medium underline underline-offset-2">
                  {donor.display_name || "Donor"}
                </Link>
                {donor.is_organization ? (
                  <span className="ml-1 text-xs text-muted-foreground">(org)</span>
                ) : null}
              </p>
            ) : (
              <p className="text-sm">
                <Link
                  href={`/profile/${listing.seller_id}`}
                  className="font-medium underline underline-offset-2"
                >
                  View donor profile
                </Link>
              </p>
            )}
            {center ? (
              <p className="text-sm">
                For{" "}
                <Link
                  href={`/donate/centers/${center.id}`}
                  className="font-medium underline underline-offset-2"
                >
                  {center.name}
                </Link>
                {center.area ? (
                  <span className="text-muted-foreground"> · {center.area}</span>
                ) : null}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <p className="text-sm leading-relaxed md:text-base">{listing.description}</p>
            <p className="text-xs text-muted-foreground">
              Donation items are verified by Zyra team for quality.
            </p>
          </div>
        </div>

        {/* Claim Card - Desktop Side Panel */}
        <div className="md:col-span-1">
          <div className="sticky top-4 rounded-lg border bg-card p-4 shadow-sm md:p-6">
            {listing.status === "verified" ? (
              <div className="space-y-4">
                <div className="border-b pb-4">
                  <p className="text-sm text-muted-foreground">Price</p>
                  <p className="text-2xl font-semibold">Free</p>
                </div>

                <Button className="h-12 w-full" onClick={() => setOpen(true)}>
                  Claim Item
                </Button>

                <div className="space-y-2 text-xs text-muted-foreground">
                  <p>· Free donation item</p>
                  <p>· Verified by Zyra team</p>
                  <p>· Arrange pickup with seller</p>
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground">
                <p>This item is not currently available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {listing.status === "verified" && (
        <ClaimSheet
          open={open}
          onOpenChange={setOpen}
          listingId={listing.id}
          isAuthed={isAuthed}
        />
      )}
    </div>
  );
}
