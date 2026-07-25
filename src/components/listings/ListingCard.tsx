'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Heart, MessageCircle, Share2, Eye } from 'lucide-react'
import { ExtendedListingWithPhotos } from '@/lib/types'
import Image from 'next/image'
import Link from 'next/link'

interface ListingCardProps {
  listing: ExtendedListingWithPhotos
  onLike?: (listingId: string) => void
  onShare?: (listingId: string) => void
  showActions?: boolean
}

export function ListingCard({
  listing,
  onLike,
  onShare,
  showActions = true
}: ListingCardProps) {
  const mainPhoto = listing.listing_photos?.[0]
  const isLiked = listing.is_liked || false
  const isFree = listing.price_cents === 0

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <Link href={`/market/${listing.id}`}>
        <div className="relative aspect-square bg-gray-100">
          {mainPhoto ? (
            <Image
              src={mainPhoto.public_url}
              alt={listing.title || 'Listing'}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              No image
            </div>
          )}

          {listing.is_boosted && (
            <Badge className="absolute top-2 left-2 bg-pink-500">
              Promoted
            </Badge>
          )}

          {isFree && (
            <Badge className="absolute top-2 right-2 bg-green-500">
              FREE
            </Badge>
          )}

          <div className="absolute bottom-2 right-2 bg-black/60 text-white px-2 py-1 rounded text-sm">
            {isFree ? 'Free' : `Nu. ${((listing.price_cents || 0) / 100).toFixed(2)}`}
          </div>
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

          {showActions && (
            <div className="flex items-center gap-1">
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={(e) => {
                  e.preventDefault()
                  onLike?.(listing.id)
                }}
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
                onClick={(e) => {
                  e.preventDefault()
                  onShare?.(listing.id)
                }}
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