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
      window.location.href = `/market/${listing.id}`
    }
  }

  return (
    <Card
      className="overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer"
      onMouseEnter={() => isDesktop && setIsHovered(true)}
      onMouseLeave={() => isDesktop && setIsHovered(false)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`View ${listing.title}`}
    >
      <Link href={`/market/${listing.id}`}>
        <div className="relative aspect-square bg-gray-100 overflow-hidden">
          {mainPhoto ? (
            <Image
              src={mainPhoto.public_url}
              alt={listing.title || 'Listing'}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              No image
            </div>
          )}

          {/* Desktop Quick Actions Overlay */}
          {isDesktop && (
            <div
              className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
                isHovered ? 'opacity-100' : 'opacity-0'
              } flex items-center justify-center gap-2`}
            >
              <Button
                size="sm"
                variant="secondary"
                className="transform hover:scale-110 transition-transform"
                onClick={handleQuickView}
              >
                Quick View
              </Button>
            </div>
          )}

          {listing.is_boosted && (
            <Badge className="absolute top-2 left-2 bg-pink-500 z-10">
              Promoted
            </Badge>
          )}

          {isFree && (
            <Badge className="absolute top-2 right-2 bg-green-500 z-10">
              FREE
            </Badge>
          )}

          <div className="absolute bottom-2 right-2 bg-black/60 text-white px-2 py-1 rounded text-sm z-10">
            {isFree ? 'Free' : `Nu. ${((listing.price_cents || 0) / 100).toFixed(2)}`}
          </div>

          {/* Desktop Hover Actions */}
          {isDesktop && showActions && (
            <div
              className={`absolute top-2 left-1/2 -translate-x-1/2 flex gap-2 transition-all duration-300 z-20 ${
                isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
              }`}
            >
              <Button
                size="icon"
                variant="secondary"
                className="h-8 w-8 bg-white/90 hover:bg-white"
                onClick={handleLike}
              >
                <Heart
                  size={16}
                  className={isLiked ? 'fill-pink-500 text-pink-500' : ''}
                />
              </Button>
              <Button
                size="icon"
                variant="secondary"
                className="h-8 w-8 bg-white/90 hover:bg-white"
                onClick={handleShare}
              >
                <Share2 size={16} />
              </Button>
            </div>
          )}
        </div>
      </Link>

      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <Link href={`/market/${listing.id}`} className="flex-1">
            <h3 className="font-medium line-clamp-2 hover:text-pink-600 transition-colors">
              {listing.title}
            </h3>
          </Link>
        </div>

        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
          {listing.description}
        </p>

        {/* Seller Info (Desktop) */}
        {isDesktop && listing.profiles && (
          <div className="flex items-center gap-2 mb-3 text-xs text-gray-500">
            <User size={12} />
            <span>{listing.profiles.display_name}</span>
            {listing.profiles.area && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin size={12} />
                  {listing.profiles.area}
                </span>
              </>
            )}
            {listing.profiles.followers_count !== undefined && listing.profiles.followers_count > 0 && (
              <>
                <span>•</span>
                <span>{listing.profiles.followers_count} followers</span>
              </>
            )}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Eye size={14} />
              {listing.views_count || 0}
            </span>
            <span className="flex items-center gap-1">
              <Heart size={14} />
              {listing.likes_count || 0}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle size={14} />
              {listing.comments_count || 0}
            </span>
          </div>

          {/* Mobile Actions */}
          {!isDesktop && showActions && (
            <div className="flex items-center gap-1">
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={handleLike}
              >
                <Heart
                  size={16}
                  className={isLiked ? 'fill-pink-500 text-pink-500' : ''}
                />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={handleShare}
              >
                <Share2 size={16} />
              </Button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 mt-3">
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