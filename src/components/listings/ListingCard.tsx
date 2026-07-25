"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Share2, Eye, MapPin } from "lucide-react";
import { ExtendedListingWithPhotos } from "@/lib/types";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

interface ListingCardProps {
  listing: ExtendedListingWithPhotos;
  onLike?: (listingId: string) => void;
  onShare?: (listingId: string) => void;
  onQuickView?: (listingId: string) => void;
  showActions?: boolean;
  /** Visual enhancement only — all features remain available on mobile */
  isDesktop?: boolean;
  /** Stagger index for enter animation */
  index?: number;
}

export function ListingCard({
  listing,
  onLike,
  onShare,
  onQuickView,
  showActions = true,
  isDesktop = false,
  index = 0,
}: ListingCardProps) {
  const [isLiked, setIsLiked] = useState(listing.is_liked || false);
  const mainPhoto = listing.listing_photos?.[0];
  const isFree = listing.price_cents === 0;
  const detailHref =
    listing.type === "donation" ? `/donate/${listing.id}` : `/market/${listing.id}`;
  const priceLabel = isFree
    ? "Free"
    : `Nu. ${((listing.price_cents || 0) / 100).toFixed(0)}`;

  useEffect(() => {
    setIsLiked(listing.is_liked || false);
  }, [listing.is_liked]);

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked((v) => !v);
    onLike?.(listing.id);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onShare?.(listing.id);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onQuickView?.(listing.id);
  };

  return (
    <Card
      size="sm"
      className={cn(
        "group gap-0 py-0 ring-foreground/10 transition-all duration-300 ease-out",
        "animate-in fade-in zoom-in-95 fill-mode-both",
        "hover:-translate-y-1 hover:shadow-md hover:ring-foreground/20",
        "focus-within:ring-foreground/25",
      )}
      style={{
        animationDelay: `${Math.min(index, 12) * 40}ms`,
        animationDuration: "350ms",
      }}
    >
      <Link
        href={detailHref}
        className="outline-none"
        aria-label={`View ${listing.title}`}
      >
        {/* International fashion tile: 3:4 portrait */}
        <div className="relative aspect-[3/4] overflow-hidden bg-muted">
          {mainPhoto ? (
            <Image
              src={mainPhoto.public_url}
              alt={listing.title || "Listing"}
              fill
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1536px) 20vw, 16vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
              No image
            </div>
          )}

          {/* Hover scrim + quick view (desktop) */}
          {isDesktop && showActions ? (
            <div
              className={cn(
                "absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/55 via-black/10 to-transparent p-3",
                "opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100 group-focus-within:opacity-100",
              )}
            >
              <Button
                size="sm"
                variant="secondary"
                className={cn(
                  "pointer-events-none translate-y-2 opacity-0 shadow-sm transition-all duration-300 ease-out",
                  "group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100",
                  "group-focus-within:pointer-events-auto group-focus-within:translate-y-0 group-focus-within:opacity-100",
                )}
                onClick={handleQuickView}
              >
                <Eye size={14} className="mr-1.5" />
                Quick view
              </Button>
            </div>
          ) : null}

          {/* Corner actions */}
          {showActions ? (
            <div
              className={cn(
                "absolute top-2 right-2 z-20 flex flex-col gap-1.5",
                "translate-x-1 opacity-0 transition-all duration-300 ease-out",
                "group-hover:translate-x-0 group-hover:opacity-100",
                "group-focus-within:translate-x-0 group-focus-within:opacity-100",
                !isDesktop && "opacity-100 translate-x-0",
              )}
            >
              <Button
                size="icon"
                variant="secondary"
                className="h-8 w-8 rounded-full bg-card/95 shadow-sm backdrop-blur-sm hover:bg-card"
                onClick={handleLike}
                aria-label="Like"
              >
                <Heart
                  size={14}
                  className={cn(isLiked && "fill-primary text-primary")}
                />
              </Button>
              <Button
                size="icon"
                variant="secondary"
                className={cn(
                  "h-8 w-8 rounded-full bg-card/95 shadow-sm backdrop-blur-sm hover:bg-card",
                  !isDesktop && "hidden sm:inline-flex",
                )}
                onClick={handleShare}
                aria-label="Share"
              >
                <Share2 size={14} />
              </Button>
            </div>
          ) : null}

          {listing.is_boosted ? (
            <Badge className="absolute top-2 left-2 z-10 bg-primary text-primary-foreground shadow-sm">
              Promoted
            </Badge>
          ) : null}

          {isFree ? (
            <Badge className="absolute bottom-2 left-2 z-10 bg-accent text-accent-foreground shadow-sm">
              FREE
            </Badge>
          ) : (
            <span className="absolute bottom-2 left-2 z-10 rounded-md bg-black/70 px-2 py-1 text-xs font-medium text-white shadow-sm backdrop-blur-sm">
              {priceLabel}
            </span>
          )}
        </div>
      </Link>

      <CardContent className="space-y-1.5 px-2.5 py-2.5 md:px-3 md:py-3">
        <Link href={detailHref} className="block">
          <h3 className="line-clamp-2 text-sm font-medium leading-snug transition-colors duration-200 group-hover:text-primary">
            {listing.title}
          </h3>
        </Link>

        <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
          <span className="truncate">
            {[listing.size, listing.condition].filter(Boolean).join(" · ") ||
              listing.category}
          </span>
          {listing.profiles?.area ? (
            <span className="flex shrink-0 items-center gap-0.5 truncate">
              <MapPin size={11} />
              {listing.profiles.area}
            </span>
          ) : null}
        </div>

        {(listing.size || listing.condition || listing.category) && (
          <div className="flex flex-wrap gap-1 pt-0.5">
            {listing.size ? (
              <Badge
                variant="outline"
                className="h-5 px-1.5 text-[10px] font-normal"
              >
                {listing.size}
              </Badge>
            ) : null}
            {listing.condition ? (
              <Badge
                variant="outline"
                className="h-5 px-1.5 text-[10px] font-normal"
              >
                {listing.condition}
              </Badge>
            ) : null}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
