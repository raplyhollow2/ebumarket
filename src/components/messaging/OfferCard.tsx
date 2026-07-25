'use client'

import { useState, useEffect, useTransition } from 'react'
import { Tag, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Offer } from '@/lib/types'
import { formatMoney } from '@/lib/format'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'

interface OfferCardProps {
  conversationId: string
  listingId: string
  listingPrice: number
  currency: string
  className?: string
}

export function OfferCard({
  conversationId,
  listingId,
  listingPrice,
  currency,
  className = ''
}: OfferCardProps) {
  const [offers, setOffers] = useState<Offer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/offers?conversation_id=${conversationId}`)
        const result = await response.json()
        if (result.success) {
          setOffers(result.data || [])
        }
      } catch (error) {
        console.error('Error fetching offers:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchOffers()

    // Poll for offer updates
    const interval = setInterval(fetchOffers, 15000)
    return () => clearInterval(interval)
  }, [conversationId])

  const handleRespondToOffer = async (offerId: string, response: 'accepted' | 'rejected') => {
    startTransition(async () => {
      try {
        const res = await fetch('/api/offers', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ offer_id: offerId, status: response })
        })

        if (!res.ok) throw new Error('Failed to respond to offer')

        const result = await res.json()
        if (!result.success) throw new Error(result.error)

        toast.success(`Offer ${response}!`)

        // Update offers in state
        setOffers(offers.map(offer =>
          offer.id === offerId ? { ...offer, status: response } : offer
        ))
      } catch (error) {
        console.error('Error responding to offer:', error)
        toast.error('Failed to respond to offer')
      }
    })
  }

  // Get active pending offer
  const pendingOffer = offers.find(o => o.status === 'pending')
  const hasActiveOffer = pendingOffer && new Date(pendingOffer.expires_at) > new Date()

  if (isLoading) {
    return (
      <Card className={`${className}`}>
        <CardContent className="p-4">
          <div className="text-center text-gray-400">Loading offers...</div>
        </CardContent>
      </Card>
    )
  }

  if (!hasActiveOffer) {
    // Show offer button
    return (
      <div className={`${className}`}>
        <Button variant="outline" className="w-full">
          <Tag size={16} className="mr-2" />
          Make an Offer
        </Button>
      </div>
    )
  }

  const timeUntilExpiry = formatDistanceToNow(new Date(pendingOffer.expires_at))
  const discountPercent = listingPrice > 0
    ? Math.round(((listingPrice - pendingOffer.amount_cents) / listingPrice) * 100)
    : 0

  return (
    <Card className={`${className} border-l-4 border-l-pink-500`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Tag size={18} className="text-pink-500" />
            <span className="font-semibold">Pending Offer</span>
            <Badge variant="secondary">
              <Clock size={12} className="mr-1" />
              Expires {timeUntilExpiry}
            </Badge>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Offer amount:</span>
            <span className="font-semibold text-lg">
              {formatMoney(pendingOffer.amount_cents / 100, currency)}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Listing price:</span>
            <span className="text-gray-500 line-through">
              {formatMoney(listingPrice / 100, currency)}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Discount:</span>
            <span className="font-semibold text-green-600 dark:text-green-400">
              {discountPercent}% off
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Buyer saves:</span>
            <span className="font-semibold text-green-600 dark:text-green-400">
              {formatMoney((listingPrice - pendingOffer.amount_cents) / 100, currency)}
            </span>
          </div>
        </div>

        {true ? (
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => handleRespondToOffer(pendingOffer.id, 'rejected')}
              disabled={isPending}
            >
              <XCircle size={16} className="mr-1" />
              Decline
            </Button>
            <Button
              className="flex-1 bg-green-600 hover:bg-green-700"
              onClick={() => handleRespondToOffer(pendingOffer.id, 'accepted')}
              disabled={isPending}
            >
              <CheckCircle size={16} className="mr-1" />
              Accept
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <AlertCircle size={16} />
            <span>Waiting for seller response</span>
          </div>
        )}

        {/* Show previous offers if any */}
        {offers.length > 1 && (
          <details className="mt-4">
            <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">
              View previous offers ({offers.length - 1})
            </summary>
            <div className="mt-2 space-y-2 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
              {offers
                .filter(o => o.id !== pendingOffer.id)
                .map(offer => (
                  <div key={offer.id} className="text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        {formatMoney(offer.amount_cents / 100, currency)}
                      </span>
                      <Badge variant={
                        offer.status === 'accepted' ? 'default' :
                        offer.status === 'rejected' ? 'destructive' : 'secondary'
                      }>
                        {offer.status}
                      </Badge>
                    </div>
                  </div>
                ))}
            </div>
          </details>
        )}
      </CardContent>
    </Card>
  )
}