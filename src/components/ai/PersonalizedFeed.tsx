'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, Sparkles, Users, Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ExtendedListingWithPhotos } from '@/lib/types'
import { ListingCard } from '@/components/listings/ListingCard'

interface PersonalizedFeedProps {
  userId?: string
  className?: string
}

export function PersonalizedFeed({ userId, className = '' }: PersonalizedFeedProps) {
  const [listings, setListings] = useState<ExtendedListingWithPhotos[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/recommendations?type=${activeTab}&limit=20`)
        const result = await response.json()
        if (result.success) {
          setListings(result.data || [])
          setHasMore(result.has_more || false)
        }
      } catch (error) {
        console.error('Error fetching recommendations:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchRecommendations()
  }, [activeTab])

  const RecommendationBadge = ({ listing }: { listing: any }) => {
    const topReason = listing.recommendation_reasons?.[0]
    if (!topReason) return null

    return (
      <Badge variant="secondary" className="text-xs">
        <Sparkles size={12} className="mr-1" />
        {topReason}
      </Badge>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Sparkles size={20} className="text-primary" />
            Personalized For You
          </h2>
          <p className="text-sm text-muted-foreground">
            Listings curated based on your style and preferences
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All Items</TabsTrigger>
          <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
          <TabsTrigger value="donation">Donations</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <Card key={i}>
                  <CardContent className="p-0">
                    <div className="aspect-square bg-muted animate-pulse"></div>
                    <div className="p-3 space-y-2">
                      <div className="h-4 bg-muted animate-pulse rounded"></div>
                      <div className="h-3 bg-muted animate-pulse rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : listings.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <TrendingUp size={48} className="mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No recommendations yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start liking and following listings to get personalized recommendations!
                </p>
                <Button variant="outline" onClick={() => { window.location.href = '/market' }}>
                  Browse Marketplace
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Listings grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {listings.map(listing => (
                  <div key={listing.id} className="relative">
                    <ListingCard listing={listing} />
                    <RecommendationBadge listing={listing} />
                  </div>
                ))}
              </div>

              {/* Load more */}
              {hasMore && (
                <div className="text-center py-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      // Load more functionality
                      const loadMore = async () => {
                        const offset = listings.length
                        const response = await fetch(`/api/recommendations?type=${activeTab}&offset=${offset}&limit=20`)
                        const result = await response.json()
                        if (result.success) {
                          setListings([...listings, ...result.data])
                          setHasMore(result.has_more || false)
                        }
                      }
                      loadMore()
                    }}
                  >
                    Load More
                  </Button>
                </div>
              )}

              {/* Algorithm info */}
              <Card className="bg-blue-50 dark:bg-blue-900/20">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Sparkles size={20} className="text-blue-600 dark:text-blue-400 mt-1" />
                    <div>
                      <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                        How Recommendations Work
                      </h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        Our AI considers your style preferences, interaction history, followed sellers,
                        and trending items to curate listings just for you. The more you engage, the better
                        your recommendations become!
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}