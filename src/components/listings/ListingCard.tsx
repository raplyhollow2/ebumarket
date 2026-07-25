'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Heart, MessageCircle, Share2, Eye, User, MapPin } from 'lucide-react'
import { ExtendedListingWithPhotos } from '@/lib/types'
import Image from 'next/image'
import Link from 'next/link'

interface ListingCardProps {
  listing: ExtendedListingWithPhotos
  onLike?: (listingId: string) => void
  onShare?: (listingId: string) => void
  onQuickView?: (listingId: string) => void
  showActions?: boolean
  /** Visual enhancement only — all features remain available on mobile */
  isDesktop?: boolean
}

export function ListingCard({
  listing,
  onLike,
  onShare,
  onQuickView,
  showActions = true,
  isDesktop = false
}: ListingCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isLiked, setIsLiked] = useState(listing.is_liked || false)
  const mainPhoto = listing.listing_photos?.[0]
  const isFree = listing.price_cents === 0
  const detailHref =
    listing.type === 'donation' ? `/donate/${listing.id}` : `/market/${listing.id}`

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsLiked(!isLiked)
    onLike?.(listing.id)
  }

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onShare?.(listing.id)
  }

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onQuickView?.(listing.id)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      window.location.href = detailHref
    }
  }

  return (
    <Card
      className="overflow-hidden transition-all duration-300 group cursor-pointer hover:ring-1 hover:ring-border"
      onMouseEnter={() => isDesktop && setIsHovered(true)}
      onMouseLeave={() => isDesktop && setIsHovered(false)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`View ${listing.title}`}
    >
      <Link href={detailHref}>
        <div className="relative aspect-square overflow-hidden bg-muted">
          {mainPhoto ? (
            <Image
              src={mainPhoto.public_url}
              alt={listing.title || 'Listing'}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              No image
            </div>
          )}

          {isDesktop && showActions && (
            <div
              className={`absolute inset-0 flex items-center justify-center gap-2 bg-foreground/40 transition-opacity duration-300 ${
                isHovered ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <Button
                size="sm"
                variant="secondary"
                onClick={handleQuickView}
              >
                Quick View
              </Button>
            </div>
          )}

          {listing.is_boosted && (
            <Badge className="absolute top-2 left-2 z-10 bg-primary text-primary-foreground">
              Promoted
            </Badge>
          )}

          {isFree && (
            <Badge className="absolute top-2 right-2 z-10 bg-accent text-accent-foreground">
              FREE
            </Badge>
          )}

          <div className="absolute bottom-2 right-2 z-10 rounded bg-foreground/70 px-2 py-1 text-sm text-background">
            {isFree ? 'Free' : `Nu. ${((listing.price_cents || 0) / 100).toFixed(2)}`}
          </div>

          {isDesktop && showActions && (
            <div
              className={`absolute top-2 left-1/2 z-20 flex -translate-x-1/2 gap-2 transition-all duration-300 ${
                isHovered ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'
              }`}
            >
              <Button
                size="icon"
                variant="secondary"
                className="h-8 w-8 bg-card/90 hover:bg-card"
                onClick={handleLike}
              >
                <Heart
                  size={16}
                  className={isLiked ? 'fill-primary text-primary' : ''}
                />
              </Button>
              <Button
                size="icon"
                variant="secondary"
                className="h-8 w-8 bg-card/90 hover:bg-card"
                onClick={handleShare}
              >
                <Share2 size={16} />
              </Button>
            </div>
          )}
        </div>
      </Link>

      <CardContent className="p-3 md:p-4">
        <div className="mb-2 flex items-start justify-between gap-2">
          <Link href={detailHref} className="flex-1">
            <h3 className="line-clamp-2 font-medium transition-colors hover:text-primary">
              {listing.title}
            </h3>
          </Link>
        </div>

        <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
          {listing.description}
        </p>

        {listing.profiles && (
          <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
            <User size={12} />
            <span className="truncate">{listing.profiles.display_name}</span>
            {listing.profiles.area && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1 truncate">
                  <MapPin size={12} />
                  {listing.profiles.area}
                </span>
              </>
            )}
          </div>
        )}

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Eye size={14} />
              {listing.views_count || 0}
            </span>
            <span className="flex items-center gap-1">
              <Heart size={14} />
              {listing.likes_count || 0}
            </span>
            <span className="hidden items-center gap-1 sm:flex">
              <MessageCircle size={14} />
              {listing.comments_count || 0}
            </span>
          </div>

          {showActions && (
            <div className="flex items-center gap-0.5">
              <Button
                size="icon"
                variant="ghost"
                className="h-9 w-9"
                onClick={handleLike}
                aria-label="Like"
              >
                <Heart
                  size={16}
                  className={isLiked ? 'fill-primary text-primary' : ''}
                />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-9 w-9"
                onClick={handleShare}
                aria-label="Share"
              >
                <Share2 size={16} />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-9 w-9"
                onClick={handleQuickView}
                aria-label="Quick view"
              >
                <Eye size={16} />
              </Button>
            </div>
          )}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {listing.size && (
            <Badge variant="outline" className="text-xs">
              {listing.size}
            </Badge>
          )}
          {listing.condition && (
            <Badge variant="outline" className="text-xs">
              {listing.condition}
            </Badge>
          )}
          <Badge variant="outline" className="text-xs">
            {listing.category}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
