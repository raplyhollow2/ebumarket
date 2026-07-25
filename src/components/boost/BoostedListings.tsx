'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, Clock, Eye, Sparkles } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ExtendedListingWithPhotos } from '@/lib/types'
import { ListingCard } from '@/components/listings/ListingCard'
import { formatDistanceToNow } from 'date-fns'

interface BoostedListingsProps {
  className?: string
}

export function BoostedListings({ className = '' }: BoostedListingsProps) {
  const [boostedListings, setBoostedListings] = useState<Array<{
    id: string
    listing_id: string
    boosted_by: string
    boost_type: string
    start_date: string
    end_date: string
    listings: ExtendedListingWithPhotos
  }>>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchBoostedListings = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/boost')
        const result = await response.json()
        if (result.success) {
          setBoostedListings(result.data || [])
        }
      } catch (error) {
        console.error('Error fetching boosted listings:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchBoostedListings()

    // Refresh every 30 seconds
    const interval = setInterval(fetchBoostedListings, 30000)
    return () => clearInterval(interval)
  }, [])

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={20} className="text-pink-500" />
          <h3 className="font-semibold">Promoted Listings</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardContent className="p-0">
                <div className="aspect-square bg-gray-200 animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (boostedListings.length === 0) {
    return null
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp size={20} className="text-pink-500" />
        <h3 className="font-semibold">Promoted Listings</h3>
        <Badge variant="secondary" className="text-xs">
          <Sparkles size={12} className="mr-1" />
          Featured
        </Badge>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {boostedListings.map(boosted => {
          const listing = boosted.listings as ExtendedListingWithPhotos
          if (!listing) return null

          const timeLeft = formatDistanceToNow(new Date(boosted.end_date))

          return (
            <div key={listing.id} className="relative">
              <ListingCard listing={listing} />
              <div className="absolute top-2 right-2">
                <Badge className="bg-gradient-to-r from-pink-500 to-purple-500 text-xs">
                  <TrendingUp size={12} className="mr-1" />
                  Promoted
                </Badge>
              </div>
              <div className="absolute bottom-2 left-2">
                <Badge variant="secondary" className="text-xs">
                  <Clock size={12} className="mr-1" />
                  {timeLeft} left
                </Badge>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}