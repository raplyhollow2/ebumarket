'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { type ListingPerformance } from '@/lib/types'
import { formatMoney } from '@/lib/format'

interface ListingPerformanceProps {
  userId?: string
  className?: string
}

export function ListingPerformance({ userId, className = '' }: ListingPerformanceProps) {
  const [listings, setListings] = useState<ListingPerformance[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setIsLoading(true)
        // This would need a new API endpoint to fetch all listings with their stats
        // For now, we'll use mock data
        const mockListings: ListingPerformance[] = [
          {
            listing_id: '1',
            listing_title: 'Vintage Denim Jacket',
            views: 245,
            likes: 32,
            comments: 8,
            shares: 12,
            click_to_chat: 15,
            conversion_rate: 4.5,
            status: 'verified',
            created_at: '2024-01-15T10:00:00Z'
          },
          {
            listing_id: '2',
            listing_title: 'Floral Summer Dress',
            views: 189,
            likes: 28,
            comments: 5,
            shares: 8,
            click_to_chat: 12,
            conversion_rate: 3.2,
            status: 'verified',
            created_at: '2024-01-20T14:30:00Z'
          }
        ]
        setListings(mockListings)
      } catch (error) {
        console.error('Error fetching listings:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchListings()
  }, [userId])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'default'
      case 'sold': return 'secondary'
      case 'pending': return 'outline'
      default: return 'outline'
    }
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-gray-400">Loading listing performance...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Listing Performance</CardTitle>
      </CardHeader>
      <CardContent>
        {listings.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No listings to display
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Listing</TableHead>
                <TableHead className="text-right">Views</TableHead>
                <TableHead className="text-right">Likes</TableHead>
                <TableHead className="text-right">Comments</TableHead>
                <TableHead className="text-right">Shares</TableHead>
                <TableHead className="text-right">Chats</TableHead>
                <TableHead className="text-right">Conversion</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {listings.map((listing) => (
                <TableRow key={listing.listing_id}>
                  <TableCell className="font-medium max-w-[200px]">
                    <div className="truncate">{listing.listing_title}</div>
                  </TableCell>
                  <TableCell className="text-right">{listing.views}</TableCell>
                  <TableCell className="text-right">{listing.likes}</TableCell>
                  <TableCell className="text-right">{listing.comments}</TableCell>
                  <TableCell className="text-right">{listing.shares}</TableCell>
                  <TableCell className="text-right">{listing.click_to_chat}</TableCell>
                  <TableCell className="text-right">
                    <span className={listing.conversion_rate > 3 ? 'text-green-600 font-semibold' : ''}>
                      {listing.conversion_rate.toFixed(1)}%
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant={getStatusColor(listing.status) as any}>
                      {listing.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}