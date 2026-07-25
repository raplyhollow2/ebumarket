"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BuySheet } from "@/components/listings/buy-sheet";
import { StatusBadge } from "@/components/status-badge";
import { formatMoney } from "@/lib/format";
import type { ListingWithPhotos, MeetupPoint, PaymentMethod } from "@/lib/types";

export function MarketDetailClient({
  listing,
  isAuthed,
  meetups,
  preferredPayment,
  feePercent = 5,
}: {
  listing: ListingWithPhotos;
  isAuthed: boolean;
  meetups: MeetupPoint[];
  preferredPayment: PaymentMethod | null;
  feePercent?: number;
}) {
  const [open, setOpen] = useState(false);
  const photos = [...(listing.listing_photos ?? [])].sort(
    (a, b) => a.sort_order - b.sort_order,
  );

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
              alt={`${listing.title} ${p.angle}`}
              className="h-full w-full object-cover transition-transform hover:scale-105"
            />
            <span className="absolute bottom-2 left-2 rounded bg-black/50 px-2 py-0.5 text-xs capitalize text-white">
              {p.angle}
            </span>
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
              Size {listing.size} · {listing.condition}
              {listing.profiles?.area ? ` · ${listing.profiles.area}` : ""}
            </p>
            {listing.price_cents != null && (
              <p className="text-2xl font-semibold md:text-3xl">
                {formatMoney(listing.price_cents, listing.currency)}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <p className="text-sm leading-relaxed md:text-base">{listing.description}</p>
            <p className="text-xs text-muted-foreground">
              Verified by Zyra means our team checked the listing photos.
            </p>
          </div>
        </div>

        {/* Purchase Card - Desktop Side Panel */}
        <div className="md:col-span-1">
          <div className="sticky top-4 rounded-lg border bg-card p-4 shadow-sm md:p-6">
            {listing.status === "verified" && listing.price_cents != null ? (
              <div className="space-y-4">
                <div className="border-b pb-4">
                  <p className="text-sm text-muted-foreground">Price</p>
                  <p className="text-2xl font-semibold">
                    {formatMoney(listing.price_cents, listing.currency)}
                  </p>
                </div>

                <Button className="h-12 w-full" onClick={() => setOpen(true)}>
                  Buy Now
                </Button>

                <div className="space-y-2 text-xs text-muted-foreground">
                  <p>· Secure payment via Stripe</p>
                  <p>· Buyer protection guarantee</p>
                  <p>· Verified by Zyra team</p>
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

      {listing.status === "verified" && listing.price_cents != null && (
        <BuySheet
          open={open}
          onOpenChange={setOpen}
          listingId={listing.id}
          sellerId={listing.seller_id}
          itemPriceCents={listing.price_cents}
          currency={listing.currency}
          feePercent={feePercent}
          isAuthed={isAuthed}
          meetups={meetups}
          preferredPayment={preferredPayment}
        />
      )}
    </div>
  );
}
