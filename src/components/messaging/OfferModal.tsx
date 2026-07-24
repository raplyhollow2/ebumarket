'use client'

import { useState, useTransition } from 'react'
import { X, Tag, Clock, Percent } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Slider } from '@/components/ui/slider'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/format'

interface OfferModalProps {
  isOpen: boolean
  onClose: () => void
  conversationId: string
  listingId: string
  listingPrice: number
  currency: string
  onOfferSent?: (offer: any) => void
}

export function OfferModal({
  isOpen,
  onClose,
  conversationId,
  listingId,
  listingPrice,
  currency,
  onOfferSent
}: OfferModalProps) {
  const [offerAmount, setOfferAmount] = useState(listingPrice)
  const [expiryHours, setExpiryHours] = useState(48)
  const [isPending, startTransition] = useTransition()

  const discountPercent = ((listingPrice - offerAmount) / listingPrice) * 100

  const handleAmountChange = (value: string) => {
    const amount = parseInt(value.replace(/[^0-9]/g, '')) || 0
    setOfferAmount(amount)
  }

  const handleSliderChange = (value: number[]) => {
    const discountPercent = value[0]
    const discountedPrice = listingPrice - (listingPrice * discountPercent / 100)
    setOfferAmount(Math.round(discountedPrice))
  }

  const handleSendOffer = () => {
    if (offerAmount <= 0) {
      toast.error('Offer amount must be greater than 0')
      return
    }

    if (offerAmount >= listingPrice) {
      toast.error('Offer must be lower than listing price')
      return
    }

    if (expiryHours < 1 || expiryHours > 168) {
      toast.error('Expiry time must be between 1 and 168 hours')
      return
    }

    startTransition(async () => {
      try {
        const response = await fetch('/api/offers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            conversation_id: conversationId,
            listing_id: listingId,
            amount_cents: offerAmount,
            expires_in_hours: expiryHours
          })
        })

        if (!response.ok) throw new Error('Failed to send offer')

        const result = await response.json()
        if (!result.success) throw new Error(result.error)

        toast.success('Offer sent successfully!')
        onOfferSent?.(result.data)
        onClose()
      } catch (error) {
        console.error('Error sending offer:', error)
        toast.error('Failed to send offer')
      }
    })
  }

  const quickDiscounts = [10, 20, 25, 30]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tag size={20} className="text-pink-500" />
            Make an Offer
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Current price display */}
          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Listing price:</span>
              <span className="font-medium">{formatCurrency(listingPrice / 100, currency)}</span>
            </div>
          </div>

          {/* Your offer */}
          <div className="space-y-2">
            <Label htmlFor="offer-amount">Your offer (in {currency})</Label>
            <div className="relative">
              <Input
                id="offer-amount"
                type="text"
                value={formatCurrency(offerAmount / 100, currency)}
                onChange={(e) => handleAmountChange(e.target.value)}
                disabled={isPending}
                className="text-lg font-semibold"
              />
            </div>
          </div>

          {/* Discount slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Discount: {Math.round(discountPercent)}%</Label>
              <Percent size={16} className="text-gray-400" />
            </div>
            <Slider
              value={[discountPercent]}
              onValueChange={handleSliderChange}
              max={50}
              min={5}
              step={5}
              disabled={isPending}
              className="w-full"
            />
          </div>

          {/* Quick discount buttons */}
          <div className="flex gap-2">
            {quickDiscounts.map(discount => {
              const discountedPrice = listingPrice - (listingPrice * discount / 100)
              return (
                <Button
                  key={discount}
                  variant="outline"
                  size="sm"
                  onClick={() => setOfferAmount(Math.round(discountedPrice))}
                  disabled={isPending}
                  className="flex-1"
                >
                  -{discount}%
                </Button>
              )
            })}
          </div>

          {/* Expiry time */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Offer expires in:</Label>
              <Clock size={16} className="text-gray-400" />
            </div>
            <div className="flex gap-2">
              {[24, 48, 72, 168].map(hours => (
                <Button
                  key={hours}
                  variant={expiryHours === hours ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setExpiryHours(hours)}
                  disabled={isPending}
                  className="flex-1"
                >
                  {hours === 24 ? '1 day' : hours === 48 ? '2 days' : hours === 72 ? '3 days' : '1 week'}
                </Button>
              ))}
            </div>
          </div>

          {/* Savings summary */}
          <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm text-green-700 dark:text-green-400">You save:</span>
              <span className="font-semibold text-green-700 dark:text-green-400">
                {formatCurrency((listingPrice - offerAmount) / 100, currency)}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button
            onClick={handleSendOffer}
            disabled={isPending || offerAmount <= 0 || offerAmount >= listingPrice}
            className="bg-gradient-to-r from-pink-500 to-purple-500"
          >
            {isPending ? 'Sending...' : 'Send Offer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}