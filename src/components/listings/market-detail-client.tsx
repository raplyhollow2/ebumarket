"use client";

import Link from "next/link";
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
  const seller = listing.profiles;
  const sellerHref = seller?.id
    ? `/profile/${seller.id}`
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
                alt={`${listing.title} ${p.angle}`}
                className="h-full w-full object-cover"
              />
              <span className="absolute bottom-2 left-2 rounded bg-black/50 px-2 py-0.5 text-xs capitalize text-white">
                {p.angle}
              </span>
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
          Size {listing.size} · {listing.condition}
          {seller?.area ? ` · ${seller.area}` : ""}
        </p>
        {seller ? (
          <p className="mt-2 text-sm">
            Sold by{" "}
            <Link href={sellerHref} className="font-medium underline underline-offset-2">
              {seller.display_name || "Seller"}
            </Link>
            {seller.is_organization ? (
              <span className="ml-1 text-xs text-muted-foreground">(org)</span>
            ) : null}
          </p>
        ) : (
          <p className="mt-2 text-sm">
            <Link
              href={`/profile/${listing.seller_id}`}
              className="font-medium underline underline-offset-2"
            >
              View seller profile
            </Link>
          </p>
        )}
        {listing.price_cents != null && (
          <p className="mt-2 text-xl font-semibold">
            {formatMoney(listing.price_cents, listing.currency)}
          </p>
        )}
        <p className="mt-3 text-sm leading-relaxed">{listing.description}</p>
        <p className="mt-2 text-xs text-muted-foreground">
          Verified by Zyra means our team checked the listing photos. You pay
          Zyra; we keep {feePercent}% and deliver the rest to the seller.
        </p>
      </div>

      {listing.status === "verified" && listing.price_cents != null && (
        <>
          <Button className="h-12 w-full" onClick={() => setOpen(true)}>
            Buy
          </Button>
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
        </>
      )}
    </div>
  );
}
